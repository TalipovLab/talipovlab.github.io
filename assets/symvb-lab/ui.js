(function(){
  'use strict';
  const base=new URL('.',document.currentScript.src),examples=[
  {
    "id": "h2",
    "title": "H₂: covalent–ionic mixing",
    "summary": "Build two singlet structures and see how on-site electron repulsion changes their weights.",
    "steps": [
      "Construct a covalent singlet and a symmetric ionic structure from spin-resolved determinants.",
      "Ask symvb for the symbolic Hamiltonian and overlap matrices.",
      "Set h = −1, overlap s = 0.25, and U = 4; solve the generalized eigenproblem and evaluate Chirgwin–Coulson weights."
    ],
    "tryIt": "Change U_value to 0 or 12. At zero repulsion the weights are equal; increasing U suppresses the ionic contribution.",
    "scope": "A two-structure, on-site-repulsion teaching model. Energies are in |h| units; this is not an ab initio H₂ potential-energy curve.",
    "source": "https://github.com/TalipovLab/symvb/blob/master/examples/h2_hubbard_bond.py",
    "code": "import sympy as sp\nimport numpy as np\nfrom scipy.linalg import eigh\nfrom symvb import Molecule, FixedPsi, System\n\n# Change these parameters, then run again.\nU_value = 4\ns_value = 0.25\nh_value = -1\n\nm = Molecule(\n    zero_ii=True, interacting_orbs=['ab'],\n    subst={'h': ('H_ab',), 's': ('S_ab',)},\n    max_2e_centers=1,\n)\ncovalent = FixedPsi('aB')\ncovalent.add_str_det('bA', coef=1)\nionic = FixedPsi('aA')\nionic.add_str_det('bB', coef=1)\nH, S = System.from_structures(m, [covalent, ionic]).hamiltonian()\nh, s, U = sp.symbols('h s U')\n# Name the two on-site repulsion integrals explicitly.\nH = H.subs({sp.Symbol('T_aaaa'): U, sp.Symbol('T_bbbb'): U})\nshow_math('Hamiltonian in the covalent / ionic basis', H)\nshow_math('Overlap matrix', S)\n\nvalues = {h: h_value, s: s_value, U: U_value}\nHn = np.array(H.subs(values), dtype=float)\nSn = np.array(S.subs(values), dtype=float)\nenergies, vectors = eigh(Hn, Sn)\nc = vectors[:, 0]\nweights = c * (Sn @ c)\nshow_math('Ground-state energy', sp.Eq(sp.Symbol('E_0'), sp.Float(energies[0], 7)))\nshow_math('Covalent and ionic weights', sp.Matrix([float(x) for x in weights]).evalf(6))\nprint(f'Covalent: {100*weights[0]:.2f}% | Ionic: {100*weights[1]:.2f}%')\nprint('Weights include the nonorthogonal overlap metric.')\n",
    "expected": {
      "math": [
        {
          "label": "Hamiltonian in the covalent / ionic basis",
          "tex": "\\left[\\begin{matrix}4 h s & 4 h\\\\4 h & 2 U + 4 h s\\end{matrix}\\right]"
        },
        {
          "label": "Overlap matrix",
          "tex": "\\left[\\begin{matrix}2 s^{2} + 2 & 4 s\\\\4 s & 2 s^{2} + 2\\end{matrix}\\right]"
        },
        {
          "label": "Ground-state energy",
          "tex": "E_{0} = -0.9541775"
        },
        {
          "label": "Covalent and ionic weights",
          "tex": "\\left[\\begin{matrix}0.809552\\\\0.190448\\end{matrix}\\right]"
        }
      ],
      "stdout": "Covalent: 80.96% | Ionic: 19.04%\nWeights include the nonorthogonal overlap metric.\n"
    }
  },
  {
    "id": "h2plus",
    "title": "H₂⁺: a one-electron bond",
    "summary": "Derive the bonding and antibonding energies for one electron shared by two orbitals.",
    "steps": [
      "Use the localized one-electron states a and b as the basis.",
      "Build H and S with an orbital overlap s and site energy eps.",
      "Solve det(H − ES) = 0, then evaluate the two roots for a chosen overlap."
    ],
    "tryIt": "Change s_value from 0.2 to 0.4, keeping h = −1 and eps = 0. Compare how the bonding and antibonding energies respond.",
    "scope": "An effective one-electron model with equal site energies. Orbital overlap must satisfy |s| < 1; energies use the same units as h and eps.",
    "source": "https://github.com/TalipovLab/symvb/blob/master/examples/qualitative_vb/02_one_electron_bond.py",
    "code": "import sympy as sp\nfrom symvb import Molecule, hamiltonian\nfrom symvb.fixed_psi import generate_dets\n\ns_value = 0.2\nm = Molecule(\n    zero_ii=False, interacting_orbs=['ab'],\n    subst={'h': ('H_ab',), 'eps': ('H_aa', 'H_bb'), 's': ('S_ab',)},\n)\nbasis = generate_dets(1, 0, 2)\nH, S = hamiltonian(m, basis, two_electron=False)\nh, s, eps, E = sp.symbols('h s eps E')\nshow_math('Hamiltonian', H)\nshow_math('Overlap matrix', S)\nroots = sp.solve((H - E*S).det(), E)\n# Identify the bonding branch at a specified physical reference point.\nreference = {h: -1, eps: 0, s: sp.Rational(1, 5)}\nroots.sort(key=lambda root: float(root.subs(reference)))\nshow_math('Bonding energy', sp.Eq(sp.Symbol('E_+'), sp.factor(roots[0])))\nshow_math('Antibonding energy', sp.Eq(sp.Symbol('E_-'), sp.factor(roots[1])))\nvalues = {h: -1, eps: 0, s: s_value}\nfor label, root in zip(['Bonding', 'Antibonding'], roots):\n    print(f'{label}: {float(root.subs(values)):.6f} at s = {s_value}')\n",
    "expected": {
      "math": [
        {
          "label": "Hamiltonian",
          "tex": "\\left[\\begin{matrix}eps & h\\\\h & eps\\end{matrix}\\right]"
        },
        {
          "label": "Overlap matrix",
          "tex": "\\left[\\begin{matrix}1 & s\\\\s & 1\\end{matrix}\\right]"
        },
        {
          "label": "Bonding energy",
          "tex": "E_{+} = \\frac{eps + h}{s + 1}"
        },
        {
          "label": "Antibonding energy",
          "tex": "E_{-} = \\frac{- eps + h}{s - 1}"
        }
      ],
      "stdout": "Bonding: -0.833333 at s = 0.2\nAntibonding: 1.250000 at s = 0.2\n"
    }
  },
  {
    "id": "allyl",
    "title": "Allyl radical: two resonance structures",
    "summary": "Construct two covalent Rumer structures and calculate their overlap, energies, and equal mixing weights.",
    "steps": [
      "Pair the a–b orbitals into a singlet, leaving an unpaired electron on c; then make the equivalent b–c pairing.",
      "Build the two-structure Hamiltonian and overlap matrix with symvb.",
      "Compare one localized structure with their symmetric combination, including the overlap metric."
    ],
    "tryIt": "Set s_value to 0, 0.2, and 0.4. In this covalent-only one-electron model, the resonance stabilization vanishes at zero orbital overlap.",
    "scope": "Allyl radical, three orbitals and three electrons. This restricted covalent-only, one-electron model omits ionic structures and electron repulsion; it is distinct from the allyl-anion model in the symvb paper.",
    "source": "https://github.com/TalipovLab/symvb/blob/master/examples/qualitative_vb/05_allyl_radical_resonance.py",
    "code": "import sympy as sp\nfrom symvb import Molecule, FixedPsi, hamiltonian\nfrom symvb.system import chirgwin_coulson\n\ns_value = 0.2\nm = Molecule.chain(3, hubbard=False)\nR1 = FixedPsi('aBc', coupled_pairs=[(0, 1)])\nR2 = FixedPsi('aBc', coupled_pairs=[(1, 2)])\nH, S = hamiltonian(m, [R1, R2], two_electron=False)\nh, s = sp.symbols('h s')\nshow_math('Hamiltonian over R1 and R2', H)\nshow_math('Overlap over R1 and R2', S)\nshow_math('Normalized structure overlap', sp.simplify(S[0,1]/S[0,0]))\n\n# Symmetry gives equal coefficients for the bonding combination.\nc = sp.Matrix([1, 1])\nE_one = sp.simplify(H[0,0]/S[0,0])\nE_res = sp.simplify((c.T*H*c)[0]/(c.T*S*c)[0])\nresonance = sp.simplify(E_one - E_res)\nweights = chirgwin_coulson(c, S, simplify=True)\nshow_math('Energy of one structure', E_one)\nshow_math('Energy of the symmetric combination', E_res)\nshow_math('Resonance stabilization: E(one) − E(mixed)', resonance)\nshow_math('R1 and R2 weights', sp.Matrix(weights))\nvalues = {h: -1, s: s_value}\nprint(f'E(one) = {float(E_one.subs(values)):.6f}')\nprint(f'E(mixed) = {float(E_res.subs(values)):.6f}')\nprint(f'Stabilization = {float(resonance.subs(values)):.6f} |h|')\nprint('At s = 0 this restricted model is degenerate; the equal mixture is not unique.')\n",
    "expected": {
      "math": [
        {
          "label": "Hamiltonian over R1 and R2",
          "tex": "\\left[\\begin{matrix}2 h s & 4 h s\\\\4 h s & 2 h s\\end{matrix}\\right]"
        },
        {
          "label": "Overlap over R1 and R2",
          "tex": "\\left[\\begin{matrix}s^{2} + 2 & 2 s^{2} + 1\\\\2 s^{2} + 1 & s^{2} + 2\\end{matrix}\\right]"
        },
        {
          "label": "Normalized structure overlap",
          "tex": "\\frac{2 s^{2} + 1}{s^{2} + 2}"
        },
        {
          "label": "Energy of one structure",
          "tex": "\\frac{2 h s}{s^{2} + 2}"
        },
        {
          "label": "Energy of the symmetric combination",
          "tex": "\\frac{2 h s}{s^{2} + 1}"
        },
        {
          "label": "Resonance stabilization: E(one) − E(mixed)",
          "tex": "- \\frac{2 h s}{\\left(s^{2} + 1\\right) \\left(s^{2} + 2\\right)}"
        },
        {
          "label": "R1 and R2 weights",
          "tex": "\\left[\\begin{matrix}\\frac{1}{2}\\\\\\frac{1}{2}\\end{matrix}\\right]"
        }
      ],
      "stdout": "E(one) = -0.196078\nE(mixed) = -0.384615\nStabilization = 0.188537 |h|\nAt s = 0 this restricted model is degenerate; the equal mixture is not unique.\n"
    }
  }
],markup="<div id=\"sv-app\" class=\"sv-app\">\n  <div class=\"sv-intro\"><strong>Real symvb, running in your browser.</strong> Read the worked results immediately, or edit the Python and run it yourself. Calculations take place on your computer; the site does not submit your code or results to a calculation server.</div>\n  <div class=\"sv-toolbar\"><label for=\"sv-example\">Worked example<select id=\"sv-example\"></select></label><button type=\"button\" id=\"sv-load\">Load example</button></div>\n  <section class=\"sv-lesson\"><h2 id=\"sv-lesson-title\"></h2><p id=\"sv-summary\"></p><details open><summary>Walk through the model</summary><ol id=\"sv-steps\"></ol></details><p class=\"sv-try\"><strong>Try it:</strong> <span id=\"sv-try\"></span></p><p id=\"sv-scope\" class=\"sv-scope\"></p><a id=\"sv-source\" target=\"_blank\" rel=\"noopener noreferrer\">Full source example</a></section>\n  <div class=\"sv-workspace\"><section class=\"sv-editor\"><h2>Python code</h2><p class=\"sv-help\">Edit parameters or write your own small symvb model. <code>show_math(label, expression)</code> displays an equation; <code>print()</code> writes text.</p><label for=\"sv-code\">Editable Python script</label><textarea id=\"sv-code\" rows=\"23\" spellcheck=\"false\" autocapitalize=\"off\" autocomplete=\"off\"></textarea><div class=\"sv-actions\"><button type=\"button\" id=\"sv-run\" class=\"sv-primary\">Run this code</button><button type=\"button\" id=\"sv-stop\" hidden>Stop</button><button type=\"button\" id=\"sv-download\">Download Python</button></div><p class=\"sv-help\">Ctrl/⌘ + Enter also runs the code. The first run loads about 35 MB of Python and scientific libraries from this site; subsequent runs reuse the session.</p><p id=\"sv-status\" role=\"status\" aria-live=\"polite\"></p><pre id=\"sv-error\" role=\"alert\" hidden></pre></section>\n  <section id=\"sv-output\" class=\"sv-results\"><h2 id=\"sv-result-title\">Worked result</h2><p id=\"sv-result-note\" class=\"sv-help\"></p><div id=\"sv-math\"></div><pre id=\"sv-stdout\"></pre></section></div>\n  <details class=\"sv-about\"><summary>How this browser edition works</summary><p>The calculation uses the unmodified symvb 2.2.0 package, SymPy, NumPy, and SciPy, with Python supplied by Pyodide 0.29.3. Runtime and package files are hosted on this website. No account or local installation is required.</p><p>Use this page for small symbolic models. Each run has its own Python variables and a 60-second calculation limit; Stop ends the worker without freezing the page. Larger symbolic systems, plotting scripts, or additional packages are better run in a local Python environment. The worked results remain readable without starting Python.</p><p><a href=\"https://github.com/TalipovLab/symvb\" target=\"_blank\" rel=\"noopener noreferrer\">symvb documentation</a> · <a href=\"https://github.com/TalipovLab/symvb/tree/master/notebooks\" target=\"_blank\" rel=\"noopener noreferrer\">Full teaching notebooks</a> · <a href=\"https://pyodide.org/en/0.29.3/usage/index.html\" target=\"_blank\" rel=\"noopener noreferrer\">Pyodide</a></p></details>\n</div>\n";
  const holder=document.getElementById('symvb-lab');if(holder)holder.innerHTML=markup;
  const app=document.getElementById('sv-app');if(!app)return;
  const el=id=>document.getElementById('sv-'+id),node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
  let selected=examples[0],worker=null,busy=false,timer=null,hasRuntime=false;
  function stop(message){worker?.terminate();worker=null;hasRuntime=false;clearTimeout(timer);busy=false;el('run').disabled=false;el('stop').hidden=true;if(message)el('status').textContent=message;}
  function displayResult(data,reference){
    el('output').hidden=false;el('result-title').textContent=reference?'Worked result':'Your calculation';
    el('result-note').textContent=reference?'Precomputed with symvb 2.2.0. Run the code to reproduce it, or edit the parameters to explore.':'Computed by symvb 2.2.0 in your browser'+(data.seconds!==undefined?' in '+data.seconds.toFixed(2)+' s.':'.');
    el('math').replaceChildren();for(const item of data.math||[]){const card=node('div'),label=node('h3',item.label),math=node('div');card.className='sv-equation';math.className='sv-math';card.append(label,math);el('math').append(card);if(window.katex)katex.render(item.tex,math,{displayMode:true,throwOnError:false,trust:false,strict:'warn'});else math.textContent=item.tex;}
    el('stdout').textContent=[data.stdout,data.stderr].filter(Boolean).join('\n');el('stdout').hidden=!el('stdout').textContent;
  }
  function loadExample(id){
    if(busy)stop();selected=examples.find(e=>e.id===id)||examples[0];el('example').value=selected.id;el('code').value=selected.code;
    el('lesson-title').textContent=selected.title;el('summary').textContent=selected.summary;el('steps').replaceChildren(...selected.steps.map(text=>node('li',text)));el('try').textContent=selected.tryIt;el('scope').textContent=selected.scope;el('source').href=selected.source;
    el('error').hidden=true;displayResult(selected.expected,true);el('status').textContent='Ready. The worked result is shown; Run executes the editable code.';
  }
  function run(){
    if(busy)return;const code=el('code').value;if(!code.trim()){el('status').textContent='Write some Python code or load an example first.';return;}
    busy=true;el('run').disabled=true;el('stop').hidden=false;el('error').hidden=true;el('output').hidden=true;
    const fail=message=>{stop('Calculation not completed.');el('error').textContent=message;el('error').hidden=false;};
    const limit=seconds=>{clearTimeout(timer);timer=setTimeout(()=>fail('This run reached the time limit. Try a smaller model or a shorter calculation.'),seconds*1000);};
    if(!worker){worker=new Worker(new URL('worker.js',base));worker.onmessage=({data})=>{
      if(data.type==='progress')el('status').textContent=data.message;
      if(data.type==='ready'){hasRuntime=true;limit(60);}
      if(data.type==='error')fail(data.message);
      if(data.type==='result'){clearTimeout(timer);busy=false;el('run').disabled=false;el('stop').hidden=true;displayResult(data,false);el('status').textContent='Calculation complete. Edit the code or choose another example.';}
    };worker.onerror=event=>fail('The browser calculation could not start. '+(event.message||'Reload the page and try again.'));}
    el('status').textContent=hasRuntime?'Running your code…':'Preparing the browser calculation…';limit(hasRuntime?60:180);worker.postMessage({code});
  }
  examples.forEach(ex=>{const o=node('option',ex.title);o.value=ex.id;el('example').append(o);});
  el('load').addEventListener('click',()=>loadExample(el('example').value));el('run').addEventListener('click',run);el('stop').addEventListener('click',()=>stop('Stopped. Your code is preserved; Run starts a fresh Python session.'));
  el('code').addEventListener('input',()=>{if(busy)stop();el('output').hidden=true;el('error').hidden=true;el('status').textContent='Code edited. Run to calculate the updated result.';});
  el('code').addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();run();}});
  el('download').addEventListener('click',()=>{
    const helper='# Run with Python and symvb installed.\nimport sympy as _sp\ndef show_math(label, expression):\n    print("\\n" + label)\n    _sp.pprint(expression)\n\n';
    const url=URL.createObjectURL(new Blob([helper+el('code').value],{type:'text/x-python'})),a=node('a');a.href=url;a.download='symvb-example.py';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  loadExample('h2');
})();
