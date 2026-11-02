// Ecos da Ruptura v0.8.34 — N2 narra imediatamente ao acionar o gatilho
(()=>{
'use strict';
const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let activeResp=null,lastChoice={},snap={},openingKey='';
const play=(f,l)=>window.playNarration&&window.playNarration(f,l);
function mission(){return Number(window.viewMission||(window.state&&state.current)||1)}
function rs(i){try{return typeof window.respState==='function'?window.respState(i):null}catch(e){return null}}
function lev(i){const x=rs(i);return x&&Number(x.level)===2?2:1}
function k(i,n=lev(i)){return `m${mission()}_r${Number(i)+1}_n${n}`}
function label(i,n,s){return `Missão ${mission()} · Responsabilidade ${Number(i)+1} · N${n} · ${s}`}
function scene(i,n=lev(i)){activeResp=Number(i);play(`${k(i,n)}_cena.mp3`,label(i,n,'cena'))}
function parse(code,name){const m=(code||'').match(new RegExp(name+'\\((\\d+)'));return m?Number(m[1]):null}
function opNumber(i,id,n=lev(i)){try{const t=window.TESTS&&TESTS[n===2?`${mission()}-${i}-L2`:`${mission()}-${i}`];if(!t)return 0;const p=t.choices.findIndex(c=>String(c.id)===String(id));return p<0?0:p+1}catch(e){return 0}}
function snapshot(i){const x=rs(i)||{};return {level:Number(x.level)||1,stage:x.stage||'',result:x.result||'',choice:x.choice||''}}
function consequence(i,n,result){const key=k(i,n),op=lastChoice[key]||opNumber(i,(rs(i)||{}).choice,n)||1;play(`${key}_op${op}_${result}.mp3`,label(i,n,result))}
function inspect(i){const now=snapshot(i),old=snap[i]||{};snap[i]=now;if(now.result&&now.result!==old.result){const finished=old.level||now.level;consequence(i,finished,norm(now.result).includes('sucesso')?'sucesso':'falha')}if(now.level===2&&old.level!==2)setTimeout(()=>scene(i,2),80)}
function inspectAll(){for(let i=0;i<3;i++)inspect(i)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b)return;const code=b.getAttribute('onclick')||'',txt=norm(b.textContent);let i=parse(code,'startResp');if(i!=null){activeResp=i;const before=snapshot(i);snap[i]=before;
   // N1 ainda precisa de atribuição. N2 mantém o responsável do N1: após o clique do gatilho,
   // esperamos o próprio handler do app renderizar o texto N2 e narramos imediatamente.
   if(before.level===2 || (rs(i)&&rs(i).responsible)){setTimeout(()=>{const after=snapshot(i);snap[i]=after;if(after.level===2)scene(i,2)},90)}
   return}
 if(/confirmar responsavel/.test(txt)){const q=activeResp;setTimeout(()=>{if(q!=null){scene(q,1);snap[q]=snapshot(q)}},100);return}
 i=parse(code,'chooseResp');if(i!=null){activeResp=i;const idm=code.match(/chooseResp\(\d+\s*,\s*['\"]([^'\"]+)/),id=idm&&idm[1],n=lev(i),op=opNumber(i,id,n);if(op){lastChoice[k(i,n)]=op;setTimeout(()=>play(`${k(i,n)}_op${op}.mp3`,label(i,n,`escolha ${op}`)),20)}setTimeout(()=>inspect(i),80);return}
 setTimeout(inspectAll,80)},true);
new MutationObserver(()=>setTimeout(inspectAll,50)).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style']});
function startOpening(v){if(!v||v.id!=='missionVideoPlayer')return;const isOpening=v.dataset.kind==='opening'||norm(v.getAttribute('data-kind'))==='opening';if(!isOpening)return;const m=Number(v.dataset.mission)||mission(),key=`m${m}_abertura`;if(openingKey===key)return;openingKey=key;play(`${key}.mp3`,`Missão ${m} · abertura`)}
document.addEventListener('play',e=>{if(e.target instanceof HTMLVideoElement)startOpening(e.target)},true);
// Também observa o modal/player: em celular o vídeo pode iniciar antes do listener receber 'play'.
new MutationObserver(()=>{const v=document.getElementById('missionVideoPlayer');if(v&&v.dataset.kind==='opening')startOpening(v)}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','src','data-kind','data-mission']});
// CONFLITO permanece sem áudio nesta etapa.
})();