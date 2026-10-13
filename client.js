const input=document.querySelector('#test'),form=document.querySelector('#form'),status=document.querySelector('#status');
const labels=['貼上資料','輸入框','正規化後','表單序列化後','接收端解析後'];
let counts=[null,null,null,null,null], pending=false;
function render(){document.querySelector('#rows').replaceChildren(...labels.map((label,i)=>{const row=document.createElement('tr');for(const text of [label,counts[i]===null?'未觀測':String(counts[i])]){const cell=document.createElement('td');cell.textContent=text;row.append(cell)}return row}));}
document.querySelector('#sample').textContent=TEST;render();
document.querySelector('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(TEST);status.textContent='已複製公開測試字串。'}catch{status.textContent='瀏覽器不支援一鍵複製，請長按上方字串全選並複製。'}};
input.addEventListener('paste',event=>{counts=[event.clipboardData ? event.clipboardData.getData('text/plain').length : null,null,null,null,null];render()});
input.addEventListener('input',()=>{counts[1]=input.value.length;counts[2]=counts[3]=counts[4]=null;render()});
form.addEventListener('submit',async event=>{event.preventDefault();if(pending)return;counts[1]=input.value.length;const normalized=normalize(input.value);counts[2]=normalized.length;counts[3]=counts[4]=null;
  if(!allowed(input.value)){input.value='';status.textContent='僅接受公開測試字串或它的截短版本；其他內容已清除，未送出。';render();return}
  input.value=normalized;const data=new URLSearchParams(new FormData(form));counts[3]=data.get('test').length;data.set('paste',counts[0]===null?'':String(counts[0]));data.set('input',String(counts[1]));data.set('normalized',String(counts[2]));data.set('form',String(counts[3]));render();pending=true;input.disabled=true;form.querySelector('button').disabled=true;
  try{const response=await fetch('/diagnostic-receive',{method:'POST',body:data,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',redirect:'error'});if(!response.ok)throw Error();const result=await response.json();counts[4]=result.received;status.textContent='完成。請比較各階段長度；此結果不判定原因。'}catch{status.textContent='接收端未完成；請重新測試。'}finally{pending=false;input.disabled=false;form.querySelector('button').disabled=false;render()}
});
document.querySelector('#reset').onclick=()=>{if(pending)return;input.value='';counts=[null,null,null,null,null];status.textContent='已清除。';render()};
