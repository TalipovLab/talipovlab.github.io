'use strict';
importScripts('kinetics-core.js');
self.onmessage=event=>{try{self.postMessage({result:Kinetics.integrate(event.data)});}catch(error){self.postMessage({error:error.message});}};
