// Ecos da Ruptura v0.8.38 — sincronização de narração por ações explícitas
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
function scene(i,n){n=Number(n)||lev(i);activeResp=Number(i);playFile(`${key(i,n)}_cena.mp3`,label(i,n,'cena'),`scene|${key(i,n)}`)}
function parse(code,name){const m=(code||'').match(new RegExp(name+'\\((\\d+)'));return m?Number(m[1]):null}
function opNumber(i,id,n=lev(i)){try{const t=window.TESTS&&TESTS[n===2?`${mission()}-${i}-L2`:`${mission()}-${i}`];if(!t)return 0;const p=t.choices.findIndex(c=>String(c.id)===String(id));return p<0?0:p+1}catch(e){return 0}}
function bindRestart(){const box=document.querySelector('.narracaoBox'),r=box&&box.querySelector('.narRestart');if(!r||r.dataset.fixed)return;r.dataset.fixed='1';r.textContent='↶ Voltar';r.title='Voltar ao início e aguardar Ouvir';r.onclick=()=>{document.querySelectorAll('audio').forEach(a=>{a.pause();try{a.currentTime=0}catch(e){}})}}
function choice(i,id){const n=lev(i),op=opNumber(i,id,n);if(!op)return;lastChoice[key(i,n)]=op;playFile(`${key(i,n)}_op${op}.mp3`,label(i,n,`escolha ${op}`),`choice|${key(i,n)}|${op}`)}
function narrativeConclusion(i,result){const kk=key(i,2),suffix=result==='sucesso'?'sucesso':'falha';/* O resultado mecânico fica silencioso; o arquivo abaixo contém somente o texto de “Fechamento desta Responsabilidade”. */playFile(`${kk}_fechamento_${suffix}.mp3`,label(i,2,`fechamento — ${suffix}`),`closing|${kk}|${suffix}`)}
let snaps={};
function snap(i){const s=rs(i)||{};return {level:Number(s.level)||1,stage:s.stage||'',result:s.result||'',choice:s.choice||'',player:s.player||s.responsible||(s.level1Record&&s.level1Record.player)||''}}
function inspectResult(i,before){const now=snap(i),old=before||snaps[i]||{};snaps[i]=now;if(now.result&&now.result!==old.result){const finished=Number(old.level||now.level)||1;if(finished===2){const result=norm(now.result).toLowerCase().includes('sucesso')?'sucesso':'falha';narrativeConclusion(i,result)}/* N1: deliberadamente sem áudio de conclusão */}}
function inspectAll(before){for(let i=0;i<3;i++)inspectResult(i,before&&before[i])}
function openingFor(m){m=Number(m)||mission();const k=`m${m}_abertura`;if(openingKey===k)return;openingKey=k;playFile(`${k}.mp3`,`Missão ${m} · abertura`,`opening|${k}`)}
document.addEventListener('click',e=>{
 bindRestart();
 const b=e.target.closest&&e.target.closest('button');if(!b)return;
 const code=b.getAttribute('onclick')||'',txt=norm(b.textContent).toLowerCase();
 // A abertura é iniciada diretamente pelo gesto do usuário. Isso evita o bloqueio do áudio
 // que alguns navegadores móveis aplicam quando tentamos iniciar a narração apenas no evento play do vídeo.
 if(code.includes("playMissionVideo('opening'")||code.includes('playMissionVideo("opening"')||txt.includes('vídeo de abertura')||txt.includes('video de abertura')){
   const mm=(code.match(/playMissionVideo\(['\"]opening['\"]\s*,\s*(\d+)/)||[])[1];
   openingFor(mm||mission());
 }
 const before=[snap(0),snap(1),snap(2)];
 let i=parse(code,'startResp');
 if(i!=null){activeResp=i;const s=before[i];if(Number(s.level)===2)setTimeout(()=>scene(i,2),120);snaps[i]=s;return;}
 if(txt.includes('confirmar responsável')||txt.includes('confirmar responsavel')){const q=activeResp;setTimeout(()=>{if(q!=null){snaps[q]=snap(q);scene(q,1)}},150);return;}
 i=parse(code,'chooseResp');
 if(i!=null){activeResp=i;const m=code.match(/chooseResp\(\d+\s*,\s*['\"]([^'\"]+)/);choice(i,m&&m[1]);setTimeout(()=>inspectAll(before),120);return;}
 setTimeout(()=>inspectAll(before),140);
},true);
function opening(v){if(!v||v.id!=='missionVideoPlayer'||(v.dataset.kind||'').toLowerCase()!=='opening')return;openingFor(Number(v.dataset.mission)||mission())}
document.addEventListener('play',e=>{if(e.target instanceof HTMLVideoElement)opening(e.target)},true);
window.addEventListener('load',()=>{bindRestart();for(let i=0;i<3;i++)snaps[i]=snap(i)});setTimeout(bindRestart,300);
// Fluxo: abertura narra junto ao acionamento do vídeo; N1 narra após confirmar responsável; escolha N1 narra;
// resultado N1 não narra; N2 narra somente no gatilho físico; escolha N2 narra; resultado mecânico N2 fica silencioso;
// o bloco “Fechamento desta Responsabilidade” é a única narração após o N2. Conflitos continuam sem narração.
})();