const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {TEST}=require('./core.cjs');
const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'"};
function createServer(){return http.createServer((req,res)=>{
  function reply(code,type,body){res.writeHead(code,{...headers,'Content-Type':type});res.end(body)}
  const files={'/':['index.html','text/html; charset=utf-8'],'/client.js':['client.js','text/javascript; charset=utf-8'],'/core.cjs':['core.cjs','text/javascript; charset=utf-8']};
  if(req.method==='GET'&&files[req.url]){const [file,type]=files[req.url];return reply(200,type,fs.readFileSync(path.join(__dirname,file)))}
  if(req.method!=='POST'||req.url!=='/diagnostic-receive')return reply(404,'text/plain','Not found');
  if(!/^application\/x-www-form-urlencoded(?:;|$)/i.test(req.headers['content-type']||''))return reply(415,'text/plain','Unsupported');
  let body='',size=0;req.on('data',chunk=>{size+=chunk.length;if(size>2048){body='';reply(413,'text/plain','Too large');req.destroy()}else body+=chunk.toString('utf8')});
  req.on('end',()=>{if(size>2048)return;const data=new URLSearchParams(body);body='';const keys=['test','paste','input','normalized','form'];if([...data.keys()].length!==5||keys.some(k=>data.getAll(k).length!==1)||[...data.keys()].some(k=>!keys.includes(k)))return reply(400,'text/plain','Invalid');
    const value=data.get('test');if(!value||!TEST.startsWith(value)||keys.slice(1).some(k=>!(/^(?:[0-9]{1,6})$/.test(data.get(k))||(k==='paste'&&data.get(k)===''))))return reply(400,'text/plain','Invalid');
    return reply(200,'application/json',JSON.stringify({received:value.length}));
  });
});}
if(require.main===module)createServer().listen(Number(process.env.PORT)||4387,process.env.RENDER?'0.0.0.0':'127.0.0.1',()=>console.log('Isolated diagnostic service ready'));
module.exports={createServer};
