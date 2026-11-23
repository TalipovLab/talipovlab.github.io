document.addEventListener("DOMContentLoaded", () => {
  // Move link presentation classes from safe wiki spans to their anchors.
  document.querySelectorAll('#main span').forEach(span => {
    const anchor = span.querySelector(':scope > a');
    if (anchor && span.childElementCount === 1) {
      [...span.classList].filter(c => c !== 'plugin_wrap').forEach(c => anchor.classList.add(c));
      span.replaceWith(anchor);
    }
  });
  const model = document.querySelector('.tg-box-model');
  if (model) model.innerHTML = "<div class=\"lab-grid\"><svg viewBox=\"0 0 610 285\" role=\"img\" aria-labelledby=\"model-description\"><title id=\"model-description\">Electron probability density</title><path d=\"M55 40V223H555V40\" fill=\"none\" stroke=\"#9bada4\" stroke-width=\"2\"/><path d=\"M55 145H555M55 68H555\" stroke=\"#e7ebe5\" stroke-width=\"1\"/><polygon id=\"density-fill\" fill=\"#861e3c15\" points=\"55,223 555,223\"/><polyline id=\"density-line\" fill=\"none\" stroke=\"#861e3c\" stroke-width=\"3\"/><text x=\"55\" y=\"254\" font-family=\"sans-serif\" font-size=\"12\" fill=\"#626966\">0</text><text x=\"555\" y=\"254\" text-anchor=\"end\" id=\"box-end-label\" font-family=\"sans-serif\" font-size=\"12\" fill=\"#626966\">L = 1.0 nm</text><text x=\"55\" y=\"25\" font-family=\"sans-serif\" font-size=\"11\" fill=\"#626966\">PROBABILITY DENSITY / MAXIMUM</text></svg><div class=\"lab-controls\"><label for=\"quantum-n\">Quantum number n<output id=\"n-output\" for=\"quantum-n\">1</output><input type=\"range\" id=\"quantum-n\" min=\"1\" max=\"5\" step=\"1\" value=\"1\"></label><label for=\"box-length\">Box length L<output id=\"length-output\" for=\"box-length\">1.0 nm</output><input type=\"range\" id=\"box-length\" min=\"0.5\" max=\"2\" step=\"0.1\" value=\"1\"></label><div class=\"energy-value\"><small>Energy above the well bottom</small><output id=\"energy-output\" for=\"quantum-n box-length\">0.376 eV</output></div><p class=\"small\" id=\"node-output\">0 interior nodes</p></div></div>";
  const list = document.querySelector('.publication-list');
  if (list) {
    const rows = [...list.querySelectorAll('.paper-row')];
    rows.forEach(row => {row.dataset.publication=''; row.dataset.year=row.querySelector('.paper-year')?.textContent.trim() || '';});
    const years = [...new Set(rows.map(row => row.dataset.year))].sort().reverse();
    const filters = document.createElement('div');filters.className='filters';
    filters.innerHTML='<label for="paper-search">Search titles, authors, or journals<input type="search" id="paper-search" placeholder="Try bonding, phosphatase, or cobalt…"></label><label for="paper-year">Publication year<select id="paper-year"><option value="all">All years</option></select></label>';
    const themeLabel=document.createElement('label');themeLabel.htmlFor='paper-topic';themeLabel.textContent='Research theme';
    const themeSelect=document.createElement('select');themeSelect.id='paper-topic';themeLabel.append(themeSelect);filters.append(themeLabel);
    const themes={all:'All themes',bonding:'Bonding',materials:'Organic electronics',reactions:'Reactions & catalysis',biology:'Biomolecular chemistry',membranes:'Membranes & materials',methods:'Computational methods',education:'Science education'};
    Object.entries(themes).forEach(([value,label])=>{const o=document.createElement('option');o.value=value;o.textContent=label;themeSelect.append(o)});
    years.forEach(value=>{const o=document.createElement('option');o.value=value;o.textContent=value;filters.querySelector('select').append(o)});
    const count=document.createElement('p');count.id='paper-count';count.className='publication-count';count.setAttribute('aria-live','polite');count.textContent=`${rows.length} publications`;
    const none=document.createElement('p');none.id='no-results';none.className='no-results';none.hidden=true;none.textContent='No publications match this search. Try a different term or choose all years and themes.';
    list.before(filters,count);list.after(none);
  }

  document.querySelectorAll('.paper-row').forEach(row => {
    const title=row.querySelector('h3'),arrow=row.querySelector('a.paper-arrow');
    if(title && arrow){
      arrow.setAttribute('aria-label','Read '+title.textContent.trim());
      if(!title.querySelector('a')){const a=document.createElement('a');a.href=arrow.href;a.textContent=title.textContent;title.replaceChildren(a);}
    }
  });

  document.querySelectorAll('.tg-phone').forEach(el=>{
    const number=el.textContent.replace(/[^0-9+]/g,'');
    const a=document.createElement('a');a.href='tel:'+(number.length===10?'+1':'')+number;a.textContent=el.textContent;el.replaceWith(a);
  });

  const vb = document.querySelector('.tg-vb-model');
  if (vb) vb.innerHTML = "<div class=\"vb-explorer\" id=\"vb-explorer\" aria-label=\"Interactive two-structure hydrogen model\">\n  <div class=\"vb-topline\"><p class=\"eyebrow\">A small model, a chemical question</p><span class=\"tag\">Interactive \u00b7 H\u2082</span></div>\n  <h3>What makes a bond more covalent?</h3>\n  <p class=\"vb-intro\">Raise the cost of putting two electrons on one atom. Watch the ionic contribution fall as the covalent structure becomes more important.</p>\n  <div class=\"vb-workbench\">\n    <div class=\"vb-visual\">\n      <div class=\"vb-states\">\n        <div><svg viewBox=\"0 0 210 95\" role=\"img\" aria-label=\"Covalent structure: one electron on each hydrogen atom\"><ellipse cx=\"82\" cy=\"43\" rx=\"37\" ry=\"29\" fill=\"#dce9d3\" stroke=\"#58794d\"/><ellipse cx=\"128\" cy=\"43\" rx=\"37\" ry=\"29\" fill=\"#dce9d3\" fill-opacity=\".65\" stroke=\"#58794d\"/><text x=\"75\" y=\"49\">H</text><text x=\"121\" y=\"49\">H</text><circle cx=\"63\" cy=\"27\" r=\"3\" fill=\"#315d25\"/><circle cx=\"147\" cy=\"59\" r=\"3\" fill=\"#315d25\"/></svg><strong>Covalent</strong><span>One electron on each atom</span></div>\n        <div><svg viewBox=\"0 0 210 95\" role=\"img\" aria-label=\"Ionic structures: H minus H plus and H plus H minus contribute symmetrically\"><circle cx=\"30\" cy=\"43\" r=\"22\" fill=\"#f2e3e9\" stroke=\"#9b4563\"/><circle cx=\"72\" cy=\"43\" r=\"17\" fill=\"none\" stroke=\"#9b4563\"/><circle cx=\"137\" cy=\"43\" r=\"17\" fill=\"none\" stroke=\"#9b4563\"/><circle cx=\"179\" cy=\"43\" r=\"22\" fill=\"#f2e3e9\" stroke=\"#9b4563\"/><text x=\"19\" y=\"49\">H\u207b</text><text x=\"61\" y=\"49\">H\u207a</text><text x=\"99\" y=\"49\">+</text><text x=\"126\" y=\"49\">H\u207a</text><text x=\"168\" y=\"49\">H\u207b</text></svg><strong>Ionic</strong><span>Both charge arrangements</span></div>\n      </div>\n      <div class=\"vb-bar\" aria-hidden=\"true\"><span id=\"vb-cov-bar\"></span><span id=\"vb-ion-bar\"></span></div>\n      <div class=\"vb-weights\" aria-live=\"polite\" aria-atomic=\"true\"><span>Covalent <strong id=\"vb-cov\">81.0%</strong></span><span>Ionic <strong id=\"vb-ion\">19.0%</strong></span></div>\n      <div class=\"vb-energy\">Ground-state energy <output id=\"vb-energy\">\u22120.954 |h|</output></div>\n    </div>\n    <div class=\"vb-controls\">\n      <label for=\"vb-u\">On-site repulsion, U / |h| <output id=\"vb-u-value\" for=\"vb-u\">4.0</output></label>\n      <input id=\"vb-u\" type=\"range\" min=\"0\" max=\"12\" step=\"0.1\" value=\"4\" aria-describedby=\"vb-u-help\">\n      <p id=\"vb-u-help\">Energy penalty for double occupancy.</p>\n      <label for=\"vb-s\">Orbital overlap, s <output id=\"vb-s-value\" for=\"vb-s\">0.25</output></label>\n      <input id=\"vb-s\" type=\"range\" min=\"0\" max=\"0.6\" step=\"0.01\" value=\"0.25\" aria-describedby=\"vb-s-help\">\n      <p id=\"vb-s-help\">Zero means orthogonal atomic orbitals.</p>\n      <div class=\"vb-presets\" aria-label=\"Model presets\"><button type=\"button\" data-vb-u=\"0\" data-vb-s=\"0\">No repulsion</button><button type=\"button\" data-vb-u=\"12\" data-vb-s=\"0\">Strong repulsion</button><button type=\"button\" data-vb-u=\"4\" data-vb-s=\"0.25\">Reset</button></div>\n    </div>\n  </div>\n  <p class=\"vb-model-note\">Two singlet structures; \\(h=-1\\), zero on-site one-electron energies, and only on-site electron repulsion U. We solve \\(\\mathbf{H}\\mathbf{c}=E\\mathbf{S}\\mathbf{c}\\) and report Chirgwin\u2013Coulson weights, including overlap. This illustrative model is not a fitted H\u2082 potential-energy curve.</p>\n</div>\n";

  const menu = document.querySelector('.menu-button');
  const nav = document.querySelector('#main-nav');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
    menu.textContent = open ? 'Close' : 'Menu';
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('open')) {
      nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menu'; menu.focus();
    }
  });
  const query = document.querySelector('#paper-search');
  const year = document.querySelector('#paper-year');
  const topic = document.querySelector('#paper-topic');
  if (query && year) {
    const papers = [...document.querySelectorAll('[data-publication]')];
    const topicKeys = {
      bonding:'Bonding', materials:'Organic electronics', reactions:'Reactions & catalysis',
      biology:'Biomolecular chemistry', membranes:'Membranes & materials',
      methods:'Computational methods', education:'Science education'
    };
    const filter = () => {
      const words = query.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
      let total = 0;
      papers.forEach(paper => {
        const match = (year.value === 'all' || paper.dataset.year === year.value)
          && (!topic || topic.value === 'all' || paper.querySelector('.paper-topic')?.textContent.trim() === topicKeys[topic.value])
          && words.every(word => paper.textContent.toLocaleLowerCase().includes(word));
        paper.hidden = !match; if (match) total++;
      });
      document.querySelector('#paper-count').textContent = `${total} ${total === 1 ? 'publication' : 'publications'}`;
      document.querySelector('#no-results').hidden = total !== 0;
    };
    const fromHash = () => {
      const key = window.location.hash.slice(1);
      if (topic) topic.value = Object.hasOwn(topicKeys,key) ? key : 'all';
      filter();
    };
    query.addEventListener('input', filter); year.addEventListener('change', filter);
    topic?.addEventListener('change', () => {
      history.replaceState(null,'',location.pathname+location.search+(topic.value === 'all' ? '' : '#'+topic.value));
      filter();
    });
    window.addEventListener('hashchange',fromHash); fromHash();
  }
  const nInput = document.querySelector('#quantum-n');
  const lengthInput = document.querySelector('#box-length');
  if (nInput && lengthInput) {
    const update = () => {
      const n = Number(nInput.value), length = Number(lengthInput.value);
      document.querySelector('#n-output').textContent = String(n);
      document.querySelector('#length-output').textContent = `${length.toFixed(1)} nm`;
      document.querySelector('#energy-output').textContent = `${(0.37603016*n*n/(length*length)).toFixed(3)} eV`;
      document.querySelector('#node-output').textContent = `${n-1} interior ${n-1===1?'node':'nodes'}`;
      const left = 55, baseline = 223, width = 500;
      const points = Array.from({length:401}, (_,i) => {
        const x = i/400;
        return `${(left+width*x).toFixed(2)},${(baseline-155*Math.sin(n*Math.PI*x)**2).toFixed(2)}`;
      });
      document.querySelector('#density-line').setAttribute('points', points.join(' '));
      document.querySelector('#density-fill').setAttribute('points', `${left},${baseline} ${points.join(' ')} ${left+width},${baseline}`);
      document.querySelector('#box-end-label').textContent = `L = ${length.toFixed(1)} nm`;
      document.querySelector('#model-description').textContent = `Probability density for an electron in a one-dimensional box: n = ${n}, L = ${length.toFixed(1)} nanometers, ${n-1} interior nodes. The horizontal position is scaled by L; the density is scaled by its maximum.`;
    };
    nInput.addEventListener('input', update); lengthInput.addEventListener('input', update); update();
  }
});

/* The same two-structure model as symvb/examples/h2_hubbard_bond.py. */
function solveVB(U, s) {
  const a = -4*s, b = -4, d = 2*U - 4*s;
  const p = 2*(1+s*s), q = 4*s;
  const A = p*p-q*q, B = -(a*p+d*p-2*b*q), C = a*d-b*b;
  const E = (-B-Math.sqrt(B*B-4*A*C))/(2*A);
  const x = -(b-E*q), y = a-E*p;
  const norm = p*x*x+2*q*x*y+p*y*y;
  return {energy:E, covalent:x*(p*x+q*y)/norm, ionic:y*(q*x+p*y)/norm};
}
if (typeof module !== 'undefined') module.exports = {solveVB};
if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('.vb-explorer');
  if (!root) return;
  const el = id => root.querySelector('#'+id);
  const u = el('vb-u'), s = el('vb-s');
  function update() {
    const result = solveVB(Number(u.value), Number(s.value));
    el('vb-u-value').textContent = Number(u.value).toFixed(1);
    el('vb-s-value').textContent = Number(s.value).toFixed(2);
    el('vb-cov').textContent = (100*result.covalent).toFixed(1)+'%';
    el('vb-ion').textContent = (100*result.ionic).toFixed(1)+'%';
    el('vb-cov-bar').style.width = 100*result.covalent+'%';
    el('vb-ion-bar').style.width = 100*result.ionic+'%';
    el('vb-energy').textContent = result.energy.toFixed(3).replace('-', '−')+' |h|';
  }
  [u,s].forEach(input => input.addEventListener('input',update));
  root.querySelectorAll('[data-vb-u]').forEach(button => button.addEventListener('click', () => {
    u.value=button.dataset.vbU;s.value=button.dataset.vbS;update();
  }));
  update();
});
