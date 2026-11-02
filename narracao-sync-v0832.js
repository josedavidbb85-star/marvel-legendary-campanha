// Ecos da Ruptura v0.8.32 — sincronização por Responsabilidade ativa, sem inferência pelo primeiro texto visível
(()=>{
'use strict';
const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const play=(f,l)=>window.playNarration&&window.playNarration(f,l);
let activeResp=null,lastChoice={};
function mission(){return Number(window.viewMission||(window.state&&state.current)||1)}
function st(i){try{return typeof window.respState==='function'?window.respState(i):null}catch(e){return null}}
function level(i){const x=st(i);return x&&Number(x.level)===2?2:1}
function key(i){return `m${mission()}_r${Number(i)+1}_n${level(i)}`}
function label(i,suffix='cena'){return `Missão ${mission()} · Responsabilidade ${Number(i)+1} · N${level(i)} · ${suffix}`}
function scene(i){if(i==null)return;activeResp=Number(i);const k=key(i);play(`${k}_cena.mp3`,label(i,'cena'))}
function parseIndex(code,name){const m=(code||'').match(new RegExp(name+'\\((\\d+)'));return m?Number(m[1]):null}
function choiceNumber(i,id){try{const lev=level(i),t=window.TESTS&&TESTS[lev===2?`${mission()}-${i}-L2`:`${mission()}-${i}`];if(!t)return 0;const p=t.choices.findIndex(c=>String(c.id)===String(id));return p>=0?p+1:0}catch(e){return 0}}
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('button');if(!b)return;
 const code=b.getAttribute('onclick')||'',txt=norm(b.textContent);
 let i=parseIndex(code,'startResp');if(i!=null){activeResp=i;return}
 if(/confirmar responsavel/.test(txt)){
   const chosen=activeResp;setTimeout(()=>{if(chosen!=null)scene(chosen)},60);return;
 }
 i=parseIndex(code,'chooseResp');
 if(i!=null){activeResp=i;const mid=code.match(/chooseResp\(\d+\s*,\s*['\"]([^'\"]+)/),id=mid&&mid[1],op=choiceNumber(i,id);if(op){const k=key(i);lastChoice[k]=op;setTimeout(()=>play(`${k}_op${op}.mp3`,label(i,`escolha ${op}`)),20)}return}
 i=parseIndex(code,'openTest');if(i!=null){activeResp=i;return}
 const result=/sucesso/.test(txt)?'sucesso':(/falha/.test(txt)?'falha':'');
 if(result&&activeResp!=null){const k=key(activeResp),op=lastChoice[k];if(op)setTimeout(()=>play(`${k}_op${op}_${result}.mp3`,label(activeResp,result)),30)}
},true);
let wasAssign=false;new MutationObserver(()=>{const assign=!!document.querySelector('#respModal.show');if(wasAssign&&!assign&&activeResp!=null){const x=st(activeResp);if(x&&x.stage&&x.stage!=='hidden')setTimeout(()=>scene(activeResp),40)}wasAssign=assign}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
// O botão Ouvir repete sempre o último áudio explicitamente selecionado por esta máquina de estados.
// Não há varredura dos cartões visíveis; portanto a Responsabilidade 1 não pode sequestrar o contexto da 2 ou 3.
let opening='';function openingM(v){const src=norm(decodeURIComponent(v.currentSrc||v.src||''));if(src.includes('1000274259'))return 1;if(src.includes('1000274260'))return 2;if(src.includes('missao 3'))return 3;if(src.includes('missao 4'))return 4;if(src.includes('missao_5_abertura'))return 5;return Number(v.dataset.mission)||mission()}
document.addEventListener('play',e=>{const v=e.target;if(!(v instanceof HTMLVideoElement)||v.id!=='missionVideoPlayer')return;const src=norm(decodeURIComponent(v.currentSrc||v.src||''));if(/encerramento|4262|4261/.test(src))return;const m=openingM(v),k=`m${m}_abertura`;if(opening===k)return;opening=k;play(`${k}.mp3`,`Missão ${m} · abertura`)},true);
// CONFLITO permanece deliberadamente sem áudio.
function bindEnd(){const v=document.getElementById('missionEndingVideo');if(v&&!v.dataset.nar832fix){v.dataset.nar832fix='1';v.addEventListener('ended',()=>{const m=mission(),r=(window.state&&state.results&&state.results[m]&&state.results[m].result)||'win';play(`m${m}_${r==='win'?'vitoria':'derrota'}.mp3`,`Missão ${m} · ${r==='win'?'vitória':'derrota'}`)})}}
window.addEventListener('load',bindEnd);setTimeout(bindEnd,400);
})();