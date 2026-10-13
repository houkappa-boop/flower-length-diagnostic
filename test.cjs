const {test}=require('node:test'),assert=require('node:assert/strict');
const {TEST,normalize,allowed}=require('./core.cjs'),{createServer}=require('./server.cjs');
test('public fixture and production normalization rules',()=>{assert.equal(TEST.length,43);assert.equal(normalize(TEST).length,43);assert.equal(normalize(' 「'+TEST+'」 ').length,43);assert.equal(normalize(TEST.slice(0,37)).length,37);assert.equal(allowed('unrelated-private-input'),false);assert.equal(allowed(TEST.slice(0,37)),true)});
test('isolated receiver measures only allowlisted public data',async()=>{const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;try{
  for(const length of [43,37]){const r=await fetch(base+'/diagnostic-receive',{method:'POST',body:new URLSearchParams({test:TEST.slice(0,length),paste:String(length),input:String(length),normalized:String(length),form:String(length)})});assert.equal(r.status,200);assert.deepEqual(await r.json(),{received:length});assert.equal(r.headers.get('set-cookie'),null)}
  const bad=await fetch(base+'/diagnostic-receive',{method:'POST',body:new URLSearchParams({test:'unrelated-private-input',paste:'23',input:'23',normalized:'23',form:'23'})});assert.equal(bad.status,400);assert.equal((await bad.text()).includes('unrelated'),false);
  assert.equal((await fetch(base+'/enter',{method:'POST'})).status,404);
  assert.equal((await fetch(base+'/')).status,200);
}finally{await new Promise(r=>server.close(r))}});
