/* Self-hosted symvb 2.2.0 in Pyodide 0.29.3. No calculation service. */
let pythonReady, stdout=[], stderr=[];
const runtimeURL=new URL('../symvb-runtime/',self.location.href).href;
function progress(message){self.postMessage({type:'progress',message});}
function append(lines,text){if(lines.join('\n').length<40000)lines.push(String(text).slice(0,12000));}
async function initialize(){
  progress('Loading Python and scientific libraries from this site (about 35 MB on the first run)…');
  importScripts(runtimeURL+'pyodide.js');
  const py=await loadPyodide({indexURL:runtimeURL,stdout:text=>append(stdout,text),stderr:text=>append(stderr,text)});
  await py.loadPackage(['sympy','numpy','scipy']);
  progress('Preparing symvb…');
  const response=await fetch(runtimeURL+'symvb-2.2.0-py3-none-any.whl');
  if(!response.ok)throw new Error('Could not load the symvb package ('+response.status+').');
  const site=py.runPython("import sysconfig; sysconfig.get_paths()['purelib']");
  py.unpackArchive(await response.arrayBuffer(),'zip',{extractDir:site});
  py.runPython('import importlib; importlib.invalidate_caches(); import symvb');
  return py;
}
self.onmessage=async ({data})=>{
  let scope;
  try{
    if(typeof data.code!=='string'||data.code.length>50000)throw new Error('Use a script smaller than 50,000 characters.');
    pythonReady??=initialize();const py=await pythonReady;
    self.postMessage({type:'ready'});progress('Running your code…');stdout=[];stderr=[];
    const dict=py.globals.get('dict');scope=dict();dict.destroy();
    py.runPython(`import sympy as _sv_sympy
import json as _sv_json
_sv_math = []
def show_math(label, expression):
    if len(_sv_math) >= 40:
        raise ValueError('Please display at most 40 equations per run.')
    tex = _sv_sympy.latex(expression)
    if len(tex) > 16000:
        raise ValueError('This equation is too large to display. Try a smaller matrix or print a summary.')
    _sv_math.append({'label': str(label)[:300], 'tex': tex})
`,{globals:scope});
    const start=performance.now();
    const result=await py.runPythonAsync(data.code,{globals:scope});if(result?.destroy)result.destroy();
    const math=JSON.parse(py.runPython('_sv_json.dumps(_sv_math)',{globals:scope}));
    self.postMessage({type:'result',math,stdout:stdout.join('\n'),stderr:stderr.join('\n'),seconds:(performance.now()-start)/1000});
  }catch(error){self.postMessage({type:'error',message:String(error.message||error).slice(-12000),stdout:stdout.join('\n'),stderr:stderr.join('\n')});}
  finally{scope?.destroy();}
};
