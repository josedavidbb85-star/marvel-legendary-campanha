/* VENOM cinematic sequencer v18 — no external dependencies */
(function(){
'use strict';
const css=`
#vc-launch{margin:9px 6px;padding:10px 15px;background:linear-gradient(110deg,#a9e96a,#66b888);color:#09150e;border:0;border-radius:10px;font-weight:900}
#vc-overlay{position:fixed;inset:0;z-index:200000;background:#030806;color:#fff;display:flex;flex-direction:column;overflow:hidden}
#vc-stage{position:relative;flex:1;min-height:0;overflow:hidden;background:radial-gradient(ellipse at 50% 50%,#1b4334,#030806 72%)}
#vc-stage:before,#vc-stage:after{content:'';position:absolute;inset:-30%;pointer-events:none}
#vc-stage:before{background:repeating-conic-gradient(from 30deg at 55% 45%,transparent 0deg 16deg,#69b78113 17deg 21deg,transparent 22deg 39deg);animation:vc-swirl 32s linear infinite}
#vc-stage:after{background:radial-gradient(ellipse at 30% 55%,#a9e96a22,transparent 40%),radial-gradient(ellipse at 80% 20%,#aa202533,transparent 45%);animation:vc-breathe 9s ease-in-out infinite alternate}
#vc-slide{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:clamp(20px,6vw,85px);text-align:center;opacity:1;transition:opacity .75s ease,transform 1s ease;transform:scale(1)}
#vc-slide.vc-out{opacity:0;transform:scale(1.045)}
#vc-slide h2{font-size:clamp(30px,6vw,78px);line-height:1.07;max-width:1000px;text-shadow:0 5px 25px #000;margin:0 0 24px;letter-spacing:-.04em}
#vc-slide p{font:clamp(19px,2.4vw,33px)/1.55 Georgia,serif;max-width:950px;text-wrap:balance;text-shadow:0 3px 18px #000;margin:0}
#vc-slide .vc-kicker{color:#a9e96a;font:800 12px system-ui;letter-spacing:.28em;margin-bottom:20px}
#vc-controls{display:flex;align-items:center;justify-content:center;gap:9px;flex-wrap:wrap;background:#07110f;padding:12px;border-top:1px solid #345243}
#vc-controls button{border:1px solid #517c5e;background:#1b3028;color:white;border-radius:9px;padding:9px 14px}
#vc-controls button:focus-visible{outline:2px solid #a9e96a}
#vc-progress{width:min(320px,35vw);accent-color:#a9e96a}
#vc-clock{font:12px system-ui;color:#bbd3c1;min-width:92px}
@keyframes vc-swirl{to{transform:rotate(360deg)}}@keyframes vc-breathe{to{transform:scale(1.2) translate(3%,-2%)}}
@media(prefers-reduced-motion:reduce){#vc-stage:before,#vc-stage:after{animation:none!important}#vc-slide{transition:none!important}}
`;
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
let overlay=null,slides=[],idx=0,raf=0,playing=false,source=null,lastIndex=-1,starting=false;
const player=()=>typeof vnPlayer!=='undefined'?vnPlayer:null;
function txt(node){return (node?.textContent||'').replace(/\s+/g,' ').trim()}
function makeSlides(){
 const detail=document.getElementById('chapterDetail'),mission=Number((typeof currentChapter!=='undefined'&&currentChapter)||window.currentChapter||window.currentChapterId||1);
 const heading=txt(detail?.querySelector('h2'))||'A FOME QUE NOS CONSOME';
 const lead=txt(detail?.querySelector('.lead'));
 const story=Array.from(detail?.querySelectorAll('[data-panel="historia"] p,[data-panel="narrativa"] p,.storypart p,.mission-panel p')||[]).map(txt).filter(x=>x.length>80).slice(0,9);
 const text=[lead,...story].filter(Boolean).join(' ');
 const sentences=(text.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g)||[]).map(x=>x.trim()).filter(x=>x.length>18);
 const chunks=[];let chunk='';
 for(const s of sentences){if(chunk.length+s.length>225&&chunk){chunks.push(chunk);chunk=''}chunk+=(chunk?' ':'')+s}
 if(chunk)chunks.push(chunk);
 return [{title:heading,text:'',kicker:'MARVEL LEGENDARY · MISSÃO '+mission},...chunks.slice(0,18).map((t,i)=>({title:'',text:t,kicker:'CENA '+String(i+1).padStart(2,'0')})),{title:'A MISSÃO COMEÇA',text:'Prepare o baralho de vilões e reúna os heróis.',kicker:'FIM DA ABERTURA'}];
}
function draw(i){if(!overlay)return;idx=Math.max(0,Math.min(i,slides.length-1));const el=overlay.querySelector('#vc-slide'),s=slides[idx];el.classList.add('vc-out');setTimeout(()=>{if(!overlay)return;el.innerHTML='';const k=document.createElement('div');k.className='vc-kicker';k.textContent=s.kicker;el.appendChild(k);if(s.title){const h=document.createElement('h2');h.textContent=s.title;el.appendChild(h)}if(s.text){const p=document.createElement('p');p.textContent=s.text;el.appendChild(p)}el.classList.remove('vc-out')},idx===lastIndex?0:340);lastIndex=idx}
function duration(){const p=player();return p&&Number.isFinite(p.duration)&&p.duration>0?p.duration:Math.max(15,slides.length*8)}
function update(){if(!overlay)return;const p=player(),d=duration(),t=p&&Number.isFinite(p.currentTime)?p.currentTime:0;const fraction=Math.min(1,t/d);const n=Math.min(slides.length-1,Math.floor(fraction*slides.length));if(n!==idx)draw(n);overlay.querySelector('#vc-progress').value=fraction*100;overlay.querySelector('#vc-clock').textContent=Math.floor(t)+'s / '+Math.floor(d)+'s';raf=requestAnimationFrame(update)}
function close(){cancelAnimationFrame(raf);if(source&&player()&&!player().paused)player().pause();overlay?.remove();overlay=null;playing=false;source=null}
function start(){if(starting)return;starting=true;setTimeout(()=>starting=false,500);close();slides=makeSlides();idx=0;lastIndex=-1;overlay=document.createElement('div');overlay.id='vc-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label','Abertura cinematográfica');overlay.innerHTML='<div id="vc-stage"><div id="vc-slide"></div></div><div id="vc-controls"><button id="vc-prev" type="button">◀ Cena</button><button id="vc-toggle" type="button">Ⅱ Pausar</button><button id="vc-next" type="button">Cena ▶</button><input id="vc-progress" aria-label="Progresso da narração" type="range" min="0" max="100" value="0"><span id="vc-clock">0s</span><button id="vc-close" type="button">✕ Fechar</button></div>';document.body.appendChild(overlay);draw(0);
 const p=player(),mission=Number((typeof currentChapter!=='undefined'&&currentChapter)||window.currentChapter||window.currentChapterId||1);
 const id='M'+String(mission).padStart(2,'0')+'_01_abertura';
 source=id;
 if(typeof vnPlay==='function')vnPlay(id,mission);
 const seek=i=>{const target=Math.max(0,Math.min(i,slides.length-1));draw(target);if(p&&Number.isFinite(p.duration))p.currentTime=p.duration*target/slides.length};
 overlay.querySelector('#vc-prev').onclick=()=>seek(idx-1);
 overlay.querySelector('#vc-next').onclick=()=>seek(idx+1);
 overlay.querySelector('#vc-close').onclick=close;
 overlay.querySelector('#vc-toggle').onclick=()=>{if(!p)return;if(p.paused)p.play().catch(()=>{});else p.pause()};
 overlay.querySelector('#vc-progress').oninput=e=>{if(p&&Number.isFinite(p.duration))p.currentTime=p.duration*Number(e.target.value)/100};
 overlay.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 if(p){const ended=()=>{if(!overlay)return;draw(slides.length-1);overlay.querySelector('#vc-toggle').textContent='✓ Concluído'};p.addEventListener('ended',ended,{once:true});p.addEventListener('play',()=>{if(overlay)overlay.querySelector('#vc-toggle').textContent='Ⅱ Pausar'});p.addEventListener('pause',()=>{if(overlay)overlay.querySelector('#vc-toggle').textContent='▶ Continuar'})}
 update();
}
function mount(){const root=document.getElementById('venomNarration');if(!root||root.querySelector('#vc-launch'))return;const btn=document.createElement('button');btn.type='button';btn.id='vc-launch';btn.textContent='🎬 Assistir abertura cinematográfica';btn.onclick=start;root.insertBefore(btn,root.firstChild)}
new MutationObserver(()=>{if(!overlay)mount()}).observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();