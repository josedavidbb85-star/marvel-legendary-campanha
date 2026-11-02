// Ecos da Ruptura v0.8.33 — narração por transições reais da Responsabilidade
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
function snapshot(i){const x=rs(i)||{};return {level:Number(x.level)||1,stage:x.stage||'',result:x.result||'',choice:x.choice||'',choiceName:x.choiceName||''}}
function consequence(i,n,result){const key=k(i,n),op=lastChoice[key]||opNumber(i,(rs(i)||{}).choice,n)||1;play(`${key}_op${op}_${result}.mp3`,label(i,n,result))}
function inspect(i){const now=snapshot(i),old=snap[i]||{};snap[i]=now;
 // N1 terminou: narra consequência exibida; quando o app avançar para N2, a cena N2 é narrada em seguida.
 if(now.result&&now.result!==old.result){const finishedLevel=old.level||now.level;consequence(i,finishedLevel,norm(now.result).includes('sucesso')?'sucesso':'falha');}
 if(now.level===2&&old.level!==2){setTimeout(()=>scene(i,2),120);return}
 // re-render da responsabilidade concluída no mesmo nível
 if(now.stage==='done'&&old.stage!=='done'&&now.result){const n=now.level||old.level||1;setTimeout(()=>consequence(i,n,norm(now.result).includes('sucesso')?'sucesso':'falha'),80)}
}
function inspectAll(){for(let i=0;i<3;i++)inspect(i)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b)return;const code=b.getAttribute('onclick')||'',txt=norm(b.textContent);let i=parse(code,'startResp');if(i!=null){activeResp=i;snap[i]=snapshot(i);return}
 if(/confirmar responsavel/.test(txt)){const q=activeResp;setTimeout(()=>{if(q!=null){scene(q);snap[q]=snapshot(q)}},100);return}
 i=parse(code,'chooseResp');if(i!=null){activeResp=i;const idm=code.match(/chooseResp\(\d+\s*,\s*['\"]([^'\"]+)/),id=idm&&idm[1],n=lev(i),op=opNumber(i,id,n);if(op){lastChoice[k(i,n)]=op;setTimeout(()=>play(`${k(i,n)}_op${op}.mp3`,label(i,n,`escolha ${op}`)),20)}setTimeout(()=>inspect(i),80);return}
 i=parse(code,'openTest');if(i!=null){activeResp=i;snap[i]=snapshot(i);return}
 setTimeout(inspectAll,80);
},true);
new MutationObserver(()=>setTimeout(inspectAll,50)).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style']});
// ABERTURA: playMissionVideo define data-kind/data-mission antes de chamar video.play().
function startOpening(v){if(!v||v.id!=='missionVideoPlayer'||v.dataset.kind!=='opening')return;const m=Number(v.dataset.mission)||mission(),key=`m${m}_abertura`;if(openingKey===key)return;openingKey=key;play(`${key}.mp3`,`Missão ${m} · abertura`)}
document.addEventListener('play',e=>{if(e.target instanceof HTMLVideoElement)startOpening(e.target)},true);
// fallback para navegadores móveis onde o evento play não propaga como esperado
new MutationObserver(()=>{const v=document.getElementById('missionVideoPlayer');if(v&&v.dataset.kind==='opening'&&!v.paused)startOpening(v)}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['style','src']});
// CONFLITO permanece sem áudio nesta etapa.
})();