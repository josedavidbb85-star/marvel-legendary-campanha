/* Venom v21: MP3 only; browser voice explicitly disabled; cache invalidated */
(function(){
'use strict';
const style=document.createElement('style');style.textContent=`
.cinema-launch{display:none!important}#venomNarration{display:none!important}#venomNarration #vnOpening,#venomNarration #vnCast{display:none!important}
#vc-launch{display:block;margin:12px 0;padding:12px 18px;background:linear-gradient(115deg,#a9e96a,#6eae81);color:#09160d;border:0;border-radius:10px;font-weight:900;font-size:15px;cursor:pointer}
#vc-overlay{position:fixed;inset:0;z-index:200000;background:#030806;color:#fff;display:flex;flex-direction:column;overflow:hidden}
#vc-stage{position:relative;flex:1;min-height:0;overflow:hidden;background:radial-gradient(ellipse at 55% 45%,#1d4636,#030806 75%);background-position:center;background-size:cover}
#vc-stage:before{content:'';position:absolute;inset:-40%;pointer-events:none;background:repeating-conic-gradient(from 20deg at 50% 50%,transparent 0deg 17deg,#6dc48c15 18deg 22deg,transparent 23deg 39deg);animation:vc-rotate 45s linear infinite}
#vc-slide{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(18px,5vw,64px);overflow:auto;text-align:center;transition:opacity .55s ease,transform .85s ease;opacity:1;transform:scale(1)}
#vc-slide.vc-out{opacity:0;transform:scale(1.04)}
#vc-slide h2{font-size:clamp(25px,5vw,65px);line-height:1.13;margin:0 0 18px;max-width:1000px;text-shadow:0 4px 22px #000}
#vc-slide p{font:clamp(18px,2.2vw,29px)/1.55 Georgia,serif;max-width:1020px;white-space:pre-line;text-shadow:0 4px 20px #000;margin:0}
#vc-slide .vc-kicker{color:#a9e96a;font:800 12px system-ui;letter-spacing:.2em;margin-bottom:15px}
#vc-controls{display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap;background:#07110f;padding:10px;border-top:1px solid #345243}
#vc-controls button{border:1px solid #547b5e;background:#193226;color:white;border-radius:9px;padding:9px 13px}
#vc-progress{width:min(270px,30vw);accent-color:#a9e96a}#vc-clock{font:12px system-ui;color:#c2d5c6}
#vc-message{font:12px system-ui;color:#f1c78c;max-width:310px}
@keyframes vc-rotate{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){#vc-stage:before{animation:none!important}#vc-slide{transition:none!important}}
`;document.head.appendChild(style);
let overlay=null,scenes=[],scene=0,active=null,raf=0,changeTimer=0,group=-1;
const audio=new Audio();audio.preload='metadata';
// The cinematic experience never uses speechSynthesis or a synthetic fallback.
const mp3Only=true;
const norm=x=>Array.isArray(x)?x.map(norm).join(' '):String(x??'');
function pieces(text,max=340){const str=norm(text).trim();if(!str)return[];const sentences=str.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g)||[str];const out=[];let buf='';for(let part of sentences){part=part.trim();if(buf.length+part.length>max&&buf){out.push(buf);buf=''}while(part.length>max){let cut=part.lastIndexOf(' ',max);if(cut<80)cut=max;out.push(part.slice(0,cut));part=part.slice(cut).trim()}buf+=(buf?' ':'')+part}if(buf)out.push(buf);return out}
function add(title,body,kicker,art,track){const parts=pieces(body);if(!parts.length)parts.push('');parts.forEach((text,i)=>scenes.push({title:i===0?title:'',body:text,kicker,art,track,weight:Math.max(15,text.length)}))}
function build(){
 scenes=[];const mission=Number((typeof currentChapter!=='undefined'&&currentChapter)||window.currentChapter||1),chapter=DATA.chapters.find(x=>x.id===mission);


 const base='audios/Missao_'+String(mission).padStart(2,'0')+'/M'+String(mission).padStart(2,'0');
 // Reproduce the full literary prologue from the mission dossier, not the short synopsis.
 const narrative=typeof CAMPAIGN_COMPLETE!=='undefined'?CAMPAIGN_COMPLETE[mission]:null;
 const opening=Array.isArray(narrative?.opening)?narrative.opening:[];
 if(opening.length){opening.forEach((paragraph,i)=>add(i===0?'PRÓLOGO DA MISSÃO '+mission+' — '+(narrative.subtitle||chapter?.title||''):'',paragraph,'PRÓLOGO DA MISSÃO · '+(i+1)+'/'+opening.length,'Venom',base+'_01_abertura.mp3'))}
 else if(chapter)add('PRÓLOGO DA MISSÃO '+mission+' — '+chapter.title,chapter.story,'ABERTURA DA MISSÃO','Venom',base+'_01_abertura.mp3');
 const cast=typeof CAMPAIGN_COMPLETE!=='undefined'?CAMPAIGN_COMPLETE[mission]?.cast:null;
 if(cast)Object.entries(cast).forEach(([name,description])=>add(name,description,'APRESENTAÇÃO DOS PERSONAGENS',name,base+'_02_elenco.mp3'));
 else if(chapter)[...(chapter.heroes||[]),chapter.mastermind,...(chapter.villains||[])].filter(Boolean).forEach(name=>add(name,'','PERSONAGEM',name,base+'_02_elenco.mp3'));
}
function sections(){const groups=[];scenes.forEach((s,i)=>{let g=groups[groups.length-1];if(!g||g.path!==s.track){g={path:s.track,start:i,end:i+1};groups.push(g)}else g.end=i+1});return groups}
function currentGroup(){return sections().findIndex(g=>scene>=g.start&&scene<g.end)}
function draw(i){if(!overlay)return;scene=Math.max(0,Math.min(i,scenes.length-1));const s=scenes[scene],el=overlay.querySelector('#vc-slide');el.classList.add('vc-out');clearTimeout(changeTimer);changeTimer=setTimeout(()=>{if(!overlay)return;el.replaceChildren();const k=document.createElement('div');k.className='vc-kicker';k.textContent=s.kicker;el.appendChild(k);if(s.title){const h=document.createElement('h2');h.textContent=s.title;el.appendChild(h)}if(s.body){const p=document.createElement('p');p.textContent=s.body;el.appendChild(p)}const img=typeof venomCardImage==='function'?venomCardImage(s.art||''):'';overlay.querySelector('#vc-stage').style.backgroundImage=img?'linear-gradient(#020a08b8,#020a08e8),url("'+img.replace(/"/g,'%22')+'")':'';el.classList.remove('vc-out')},270)}
function timing(g){const ss=scenes.slice(g.start,g.end);const total=ss.reduce((a,s)=>a+s.weight,0);const progress=audio.duration>0?audio.currentTime/audio.duration:0;let accumulated=0;for(let i=0;i<ss.length;i++){accumulated+=ss[i].weight/total;if(progress<=accumulated)return g.start+i}return g.end-1}
function tick(){if(!overlay)return;const g=sections()[group];if(g&&Number.isFinite(audio.duration)&&audio.duration>0){const next=timing(g);if(next!==scene)draw(next);overlay.querySelector('#vc-progress').value=(scene+1)/scenes.length*100;overlay.querySelector('#vc-clock').textContent=Math.floor(audio.currentTime)+'s / '+Math.floor(audio.duration)+'s'}raf=requestAnimationFrame(tick)}
function setStatus(t){if(overlay)overlay.querySelector('#vc-message').textContent=t}
function playGroup(n){const gs=sections();if(n>=gs.length){audio.pause();setStatus('Narração concluída.');return}if(n<0)return;group=n;draw(gs[n].start);audio.src=gs[n].path;audio.currentTime=0;audio.play().then(()=>setStatus('🎙 MP3 ORIGINAL · '+decodeURIComponent(audio.currentSrc.split('/').pop()||''))).catch(()=>setStatus('ERRO: MP3 não reproduzido. Sem voz do navegador.'))}
audio.addEventListener('ended',()=>{if(overlay)playGroup(group+1)});
audio.addEventListener('error',()=>{if(overlay)setStatus('MP3 indisponível. A narração não será substituída por voz artificial.')});
function jump(i){if(!overlay)return;i=Math.max(0,Math.min(i,scenes.length-1));const g=sections().findIndex(x=>i>=x.start&&i<x.end);if(g!==group){playGroup(g)}const range=sections()[g],total=scenes.slice(range.start,range.end).reduce((a,s)=>a+s.weight,0),before=scenes.slice(range.start,i).reduce((a,s)=>a+s.weight,0);if(Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=audio.duration*before/total;draw(i)}
function close(){cancelAnimationFrame(raf);clearTimeout(changeTimer);audio.pause();audio.removeAttribute('src');audio.load();overlay?.remove();overlay=null}
function open(){close();if(typeof vnPlayer!=='undefined')vnPlayer.pause();if(typeof venomPrologueAudio!=='undefined')venomPrologueAudio.pause();build();if(!scenes.length)return;overlay=document.createElement('div');overlay.id='vc-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Abertura cinematográfica');overlay.innerHTML='<div id="vc-stage"><div id="vc-slide"></div></div><div id="vc-controls"><button id="vc-prev">◀ Cena</button><button id="vc-toggle">Ⅱ Pausar</button><button id="vc-next">Cena ▶</button><input id="vc-progress" aria-label="Progresso" type="range" min="0" max="100" value="0"><span id="vc-clock"></span><button id="vc-close">✕ Fechar</button><span id="vc-message"></span></div>';document.body.appendChild(overlay);overlay.querySelector('#vc-prev').onclick=()=>jump(scene-1);overlay.querySelector('#vc-next').onclick=()=>jump(scene+1);overlay.querySelector('#vc-close').onclick=close;overlay.querySelector('#vc-toggle').onclick=()=>{if(audio.paused)audio.play().catch(()=>{});else audio.pause()};overlay.querySelector('#vc-progress').onchange=e=>jump(Math.floor(Number(e.target.value)/100*scenes.length));overlay.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='ArrowRight')jump(scene+1);if(e.key==='ArrowLeft')jump(scene-1)});audio.onplay=()=>{if(overlay)overlay.querySelector('#vc-toggle').textContent='Ⅱ Pausar'};audio.onpause=()=>{if(overlay)overlay.querySelector('#vc-toggle').textContent='▶ Continuar'};playGroup(0);tick()}
function mount(){document.querySelectorAll('#venomNarration').forEach(e=>e.remove());document.querySelectorAll('.cinema-launch').forEach(e=>e.style.display='none');const prep=document.querySelector('#chapterDetail .mission-panel[data-panel="preparo"]');if(!prep)return;const toolbar=prep.querySelector(':scope > .venom-prep-toolbar');const existing=prep.querySelector('#vc-launch');if(existing){if(toolbar&&existing.parentElement!==toolbar)toolbar.prepend(existing);return;}document.querySelectorAll('#vc-launch').forEach(e=>e.remove());const btn=document.createElement('button');btn.id='vc-launch';btn.type='button';btn.className='btn secondary';btn.textContent='🎬 Prólogo da missão';btn.title='Abrir prólogo cinematográfico da missão com narração original';btn.onclick=open;if(toolbar)toolbar.prepend(btn);else prep.insertBefore(btn,prep.firstChild)}
let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;mount()},100)}).observe(document.body,{subtree:true,childList:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
