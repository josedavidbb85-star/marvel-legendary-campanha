// Ecos da Ruptura v0.8.38 — Algenib; N1 sem narração de conclusão, N2 com conclusão narrativa
(()=>{
'use strict';
const norm=s=>(s||'').replace(/\s+/g,' ').trim();
let activeResp=null,lastChoice={},lastSig='',openingKey='';
function mission(){return Number(window.viewMission||(window.state&&state.current)||1)}
function rs(i){try{return typeof window.respState==='function'?window.respState(i):null}catch(e){return null}}
function lev(i){const s=rs(i)||{};return Number(s.level)===2?2:1}
function key(i,n=lev(i)){return `m${mission()}_r${Number(i)+1}_n${n}`}
function label(i,n,s){return `Missão ${mission()} · Responsabilidade ${Number(i)+1} · N${n} · ${s}`}
function playFile(file,labelText,sig){if(sig&&sig===lastSig)return;lastSig=sig||file;if(window.playNarration)window.playNarration(file,labelText)}
function scene(i,n=lev(i)){activeResp=Number(i);playFile(`${key(i,n)}_cena.mp3`,label(i,n,'cena'),`scene|${key(i,n)}`)}
function parse(code,name){const m=(code||'').match(new RegExp(name+'\\((\\d+)'));return m?Number(m[1]):null}
function opNumber(i,id,n=lev(i)){try{const t=window.TESTS&&TESTS[n===2?`${mission()}-${i}-L2`:`${mission()}-${i}`];if(!t)return 0;const p=t.choices.findIndex(c=>String(c.id)===String(id));return p<0?0:p+1}catch(e){return 0}}
function bindRestart(){const box=document.querySelector('.narracaoBox'),r=box&&box.querySelector('.narRestart');if(!r||r.dataset.v0838)return;r.dataset.v0838='1';r.textContent='↶ Voltar';r.title='Voltar ao início e aguardar novo Play';r.onclick=()=>{try{const audios=[...document.querySelectorAll('audio')];audios.forEach(a=>{a.pause();try{a.currentTime=0}catch(e){}})}catch(e){}}}
function choice(i,id){const n=lev(i),op=opNumber(i,id,n);if(!op)return;lastChoice[key(i,n)]=op;playFile(`${key(i,n)}_op${op}.mp3`,label(i,n,`escolha ${op}`),`choice|${key(i,n)}|${op}`)}
function narrativeConclusion(i,result,n){if(Number(n)!==2)return;const kk=key(i,2),s=rs(i)||{},op=lastChoice[kk]||opNumber(i,s.choice,2)||1;const suffix=result==='sucesso'?'sucesso':'falha';playFile(`${kk}_op${op}_${suffix}.mp3`,label(i,2,`conclusão — ${suffix}`),`narrative|${kk}|${op}|${suffix}`)}
let snaps={};function snap(i){const s=rs(i)||{};return {level:Number(s.level)||1,stage:s.stage||'',result:s.result||'',choice:s.choice||'',player:s.player||s.responsible||(s.level1Record&&s.level1Record.player)||''}}
function inspect(i){const now=snap(i),old=snaps[i]||{};snaps[i]=now;if(now.result&&now.result!==old.result){const finished=Number(old.level||now.level)||1;if(finished===2){const result=norm(now.result).toLowerCase().includes('sucesso')?'sucesso':'falha';narrativeConclusion(i,result,2)}return}if(now.level===2&&old.level!==2){setTimeout(()=>scene(i,2),80)}}
function inspectAll(){for(let i=0;i<3;i++)inspect(i)}
document.addEventListener('click',e=>{bindRestart();const b=e.target.closest&&e.target.closest('button');if(!b)return;const code=b.getAttribute('onclick')||'',txt=norm(b.textContent).toLowerCase();let i=parse(code,'startResp');if(i!=null){activeResp=i;const before=snap(i);snaps[i]=before;if(before.level===2||before.player)setTimeout(()=>{const after=snap(i);snaps[i]=after;scene(i,after.level===2?2:before.level)},120);return}if(txt.includes('confirmar responsável')||txt.includes('confirmar responsavel')){const q=activeResp;setTimeout(()=>{if(q!=null){snaps[q]=snap(q);scene(q,lev(q))}},150);return}i=parse(code,'chooseResp');if(i!=null){activeResp=i;const m=code.match(/chooseResp\(\d+\s*,\s*['\"]([^'\"]+)/);choice(i,m&&m[1]);setTimeout(()=>inspect(i),100);return}setTimeout(inspectAll,120)},true);
new MutationObserver(()=>{bindRestart();setTimeout(inspectAll,80)}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style']});
function opening(v){if(!v||v.id!=='missionVideoPlayer'||(v.dataset.kind||'').toLowerCase()!=='opening')return;const m=Number(v.dataset.mission)||mission(),k=`m${m}_abertura`;if(openingKey===k)return;openingKey=k;playFile(`${k}.mp3`,`Missão ${m} · abertura`,`opening|${k}`)}
document.addEventListener('play',e=>{if(e.target instanceof HTMLVideoElement)opening(e.target)},true);
window.addEventListener('load',()=>{bindRestart();for(let i=0;i<3;i++)snaps[i]=snap(i)});setTimeout(bindRestart,300);
// Regra: concluir N1 nunca dispara áudio de resultado. A próxima narração é a cena N2 quando seu gatilho ocorrer.
// Concluir N2 dispara apenas a consequência narrativa Algenib; efeito mecânico permanece visual. CONFLITO segue sem narração.
})();