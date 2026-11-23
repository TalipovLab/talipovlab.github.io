/* Mass-action kinetics. Original implementation for the Talipov group website.
 * ROS-2 coefficients: KPP numerical-method documentation, Verwer et al. (1999).
 * Uses an analytic Jacobian, pivoted LU and adaptive step doubling (order 2).
 * No code evaluation, network requests, or external dependencies.
 */
(function (scope) {
  'use strict';
  const LIMITS = {species:32, reactions:80, text:16000, steps:100000};
  function fail(message) { throw new Error(message); }
  function number(value, name, min=0) {
    if (value === '' || value === null || typeof value === 'boolean') fail(name+' must be a number.');
    const n=Number(value); if (!Number.isFinite(n) || n<min) fail(name+' must be finite and at least '+min+'.'); return n;
  }
  function parse(text) {
    if (typeof text!=='string' || text.length>LIMITS.text) fail('Enter a mechanism of at most 16,000 characters.');
    const species=[], index=new Map(), reactions=[];
    function side(source,line) {
      source=source.trim(); if (source==='0' || source==='∅') return new Map();
      if (!source) fail('Line '+line+': use 0 for an empty reactant or product side.');
      const result=new Map();
      for (const token of source.split('+')) {
        const m=token.trim().match(/^(?:(\d+)\s*\*?\s*)?([A-Za-z][A-Za-z0-9_]{0,29})$/);
        if (!m) fail('Line '+line+': use names such as A, CH3OH, or H_plus, with integer coefficients (for example 2 A).');
        const c=m[1]?Number(m[1]):1; if(c<1||c>20) fail('Line '+line+': coefficients must be integers from 1 to 20.');
        result.set(m[2],(result.get(m[2])||0)+c);
        if(result.get(m[2])>20) fail('Line '+line+': combined coefficient exceeds 20.');
        if(!index.has(m[2])) {index.set(m[2],species.length);species.push(m[2]);}
      }
      return result;
    }
    const pretty=m=>m.size?[...m].map(([n,c])=>(c===1?'':c+' ')+n).join(' + '):'0';
    text.split(/\r?\n/).forEach((raw,li)=>{
      const s=raw.split('#')[0].trim(); if(!s) return;
      const parts=s.split(/(<->|<=>|⇌|↔|->|=>|→)/); if(parts.length!==3) fail('Line '+(li+1)+': use one -> or <-> arrow per reaction.');
      const left=side(parts[0],li+1),right=side(parts[2],li+1);
      if(!left.size&&!right.size) fail('Line '+(li+1)+': a reaction must contain a species.');
      function add(a,b) {reactions.push({reactants:[...a].map(([n,c])=>[index.get(n),c]),products:[...b].map(([n,c])=>[index.get(n),c]),label:pretty(a)+' → '+pretty(b),order:[...a.values()].reduce((x,y)=>x+y,0)});}
      add(left,right); if(['<->','<=>','⇌','↔'].includes(parts[1])) add(right,left);
    });
    if(!reactions.length) fail('Enter at least one reaction.');
    if(species.length>LIMITS.species || reactions.length>LIMITS.reactions) fail('Use at most 32 species and 80 one-way reactions.');
    for(const r of reactions) {
      r.change=new Array(species.length).fill(0); for(const [i,c] of r.products) r.change[i]+=c; for(const [i,c] of r.reactants) r.change[i]-=c;
      if(r.change.every(v=>v===0)) fail('Reaction '+r.label+' does not change any species.');
    }
    return {species,reactions};
  }
  function compile(config) {
    if(!config||typeof config!=='object') fail('Invalid model.');
    const model=parse(config.mechanism),n=model.species.length;
    if(!Array.isArray(config.rates)||config.rates.length!==model.reactions.length) fail('Supply one rate constant for each one-way reaction.');
    model.rates=config.rates.map((x,i)=>number(x,'Rate constant k'+(i+1)));
    model.initial=model.species.map(s=>number(config.initial && Object.prototype.hasOwnProperty.call(config.initial,s)?config.initial[s]:0,'Initial concentration of '+s));
    model.start=number(config.start??0,'Start time');model.end=number(config.end,'End time');
    if(model.end<=model.start) fail('End time must be greater than start time.');
    model.points=number(config.points??401,'Number of output points',2);
    if(!Number.isInteger(model.points)||model.points>2001) fail('Choose 2–2001 output points.');
    model.rtol=number(config.rtol??1e-8,'Relative tolerance',1e-10);model.atol=number(config.atol??1e-12,'Absolute tolerance',1e-16);
    if(model.rtol>1e-2||model.atol>1) fail('The numerical tolerance is too loose.');
    return model;
  }
  function evaluate(model,y,withJacobian) {
    const n=y.length,f=new Array(n).fill(0),J=withJacobian?Array.from({length:n},()=>new Array(n).fill(0)):null;
    model.reactions.forEach((r,ri)=>{
      let v=model.rates[ri];for(const [j,c] of r.reactants) v*=Math.pow(y[j],c);
      for(let i=0;i<n;i++) f[i]+=r.change[i]*v;
      if(J) for(const [j,c] of r.reactants) {
        let dv=model.rates[ri]*c;for(const [q,p] of r.reactants) dv*=Math.pow(y[q],p-(q===j?1:0));
        for(let i=0;i<n;i++) J[i][j]+=r.change[i]*dv;
      }
    });
    return {f,J};
  }
  function factor(A) {
    const n=A.length,piv=[];
    for(let j=0;j<n;j++) {
      let p=j;for(let i=j+1;i<n;i++) if(Math.abs(A[i][j])>Math.abs(A[p][j])) p=i;
      if(!Number.isFinite(A[p][j])||Math.abs(A[p][j])<1e-280) return null;
      piv.push(p);if(p!==j) [A[p],A[j]]=[A[j],A[p]];
      for(let i=j+1;i<n;i++) {A[i][j]/=A[j][j];for(let k=j+1;k<n;k++) A[i][k]-=A[i][j]*A[j][k];}
    }
    return {A,piv};
  }
  function solveLU(lu,rhs) {
    const {A,piv}=lu,b=rhs.slice(),n=b.length;
    for(let j=0;j<n;j++) if(piv[j]!==j) [b[j],b[piv[j]]]=[b[piv[j]],b[j]];
    for(let i=1;i<n;i++) for(let j=0;j<i;j++) b[i]-=A[i][j]*b[j];
    for(let i=n-1;i>=0;i--) {for(let j=i+1;j<n;j++) b[i]-=A[i][j]*b[j];b[i]/=A[i][i];}
    return b;
  }
  const gamma=1+1/Math.sqrt(2);
  function step(model,y,h) {
    const {f,J}=evaluate(model,y,true),n=y.length;
    const lu=factor(J.map((row,i)=>row.map((v,j)=>(i===j?1:0)-h*gamma*v)));if(!lu) return null;
    const k1=solveLU(lu,f.map(v=>h*gamma*v));
    const stage=y.map((v,i)=>v+k1[i]/gamma);
    if(stage.some(v=>!Number.isFinite(v)||v < -model.atol)) return null;
    const f2=evaluate(model,stage.map(v=>Math.max(0,v)),false).f;
    const k2=solveLU(lu,f2.map((v,i)=>h*gamma*v-2*k1[i]));
    const out=y.map((v,i)=>v+(1.5*k1[i]+.5*k2[i])/gamma);
    return out.every(Number.isFinite)?out:null;
  }
  function integrate(config) {
    const model=compile(config),n=model.species.length,start=Date.now(),times=[model.start],values=[model.initial.slice()];
    let y=model.initial.slice(),t=model.start,h=(model.end-model.start)/100,accepted=0,rejected=0,clipped=0;
    let initialJ=evaluate(model,y,true).J,scale=Math.max(...initialJ.map(r=>r.reduce((a,b)=>a+Math.abs(b),0)));
    if(scale>0) h=Math.min(h,.1/scale);
    for(let out=1;out<model.points;out++) {
      const target=model.start+(model.end-model.start)*(out/(model.points-1));
      while(t<target) {
        if(accepted+rejected>LIMITS.steps||Date.now()-start>20000) fail('This model exceeded the calculation limit. Shorten the time interval, simplify the mechanism, or use a specialist solver. No incomplete curve is shown.');
        h=Math.min(h,target-t);
        if(t+h===t||h<=0) fail('The requested accuracy cannot be reached at these concentration or time scales. Check the inputs or adjust the numerical tolerance.');
        const coarse=step(model,y,h),half=step(model,y,h/2),fine=half?step(model,half,h/2):null;
        let err=Infinity;
        if(coarse&&fine&&half&&!coarse.some(v=>v < -model.atol*.01)&&!half.some(v=>v < -model.atol*.01)&&!fine.some(v=>v < -model.atol*.01)) {
          err=0;for(let i=0;i<n;i++) err=Math.max(err,Math.abs(fine[i]-coarse[i])/3/(model.atol+model.rtol*Math.max(Math.abs(y[i]),Math.abs(fine[i]))));
        }
        if(err<=1) {
          y=fine.map(v=>{if(v<0){clipped+=-v;return 0;}return v;});t=(target-t<=h)?target:t+h;accepted++;
          h*=Math.min(5,Math.max(.25,err===0?5:.9*Math.pow(err,-1/3)));
        } else {rejected++;h*=Number.isFinite(err)?Math.max(.1,Math.min(.5,.8*Math.pow(err,-1/3))):.25;}
      }
      times.push(target);values.push(y.slice());
    }
    return {species:model.species,times,values,stats:{accepted,rejected,clipped,elapsedMs:Date.now()-start,rtol:model.rtol,atol:model.atol},reactions:model.reactions.map(r=>r.label)};
  }
  const api={parse,compile,integrate,evaluate,LIMITS};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;else scope.Kinetics=api;
})(typeof self!=='undefined'?self:globalThis);
