/* VENOM v19: um único acesso cinematográfico na Preparação; texto integral e elenco */
(function(){
'use strict';
const style=document.createElement('style');style.textContent=`
.cinema-launch{display:none!important}
#venomNarration #vnOpening,#venomNarration #vnCast{display:none!important}
#vc-launch{display:block;margin:12px 0;padding:12px 18px;background:linear-gradient(115deg,#a9e96a,#6eae81);color:#09160d;border:0;border-radius:10px;font-weight:900;font-size:15px;cursor:pointer;max-width:100%}
#vc-overlay{position:fixed;inset:0;z-index:200000;background:#030806;color:#fff;display:flex;flex-direction:column;overflow:hidden}
#vc-stage{position:relative;flex:1;min-height:0;overflow:hidden;background:radial-gradient(ellipse at 55% 45%,#1d4636,#030806 75%)}
#vc-stage:before{content:'';position:absolute;inset:-40%;pointer-events:none;background:repeating-conic-gradient(from 20deg at 50% 50%,transparent 0deg 17deg,#6dc48c15 18deg 22deg,transparent 23deg 39deg);animation:vc-rotate 45s linear infinite}
#vc-stage:after{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 75% 30%,#b6242529,transparent 42%);animation:vc-breathe 8s ease-in-out infinite alternate}
#vc-slide{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(18px,5vw,64px);overflow:auto;text-align:center;transition:opacity .55s ease,transform .85s ease;opacity:1;transform:scale(1)}
#vc-slide.vc-out{opacity:0;transform:scale(1.045)}
#vc-slide h2{font-size:clamp(25px,5vw,65px);line-height:1.13;margin:0 0 18px;max-width:1000px;text-shadow:0 4px 22px #000}
#vc-slide p{font:clamp(18px,2.2vw,29px)/1.55 Georgia,serif;max-width:1020px;white-space:pre-line;text-shadow:0 4px 20px #000;margin:0}
#vc-slide .vc-kicker{color:#a9e96a;font:800 12px system-ui;letter-spacing:.2em;margin-bottom:15px}
#vc-controls{display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap;background:#07110f;padding:10px;border-top:1px solid #345243}
#vc-controls button{border:1px solid #547b5e;background:#193226;color:white;border-radius:9px;padding:9px 13px}
#vc-controls button:focus-visible{outline:2px solid #a9e96a}
#vc-progress{width:min(270px,30vw);accent-color:#a9e96a}
#vc-clock{font:12px system-ui;color:#c2d5c6}
@keyframes vc-rotate{to{transform:rotate(360deg)}}@keyframes vc-breathe{to{transform:scale(1.15)}}
@media(prefers-reduced-motion:reduce){#vc-stage:before,#vc-stage:after{animation:none!important}#vc-slide{transition:none!important}}
`;document.head.appendChild(style);
let overlay=null,slides=[],index=0,token=0,paused=false,utterance=null,manualTimer=null;
const norm=v=>Array.isArray(v)?v.map(norm).join(' '):typeof v==='string'?v:String(v??'');
function chunks(value,max=340){const str=norm(value).trim();if(!str)return[];const sentences=str.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g)||[str];const arr=[];let buffer='';for(const sentence of sentences){let s=sentence.trim();if(buffer.length+s.length>max&&buffer){arr.push(buffer);buffer=''}while(s.length>max){let cut=s.lastIndexOf(' ',max);if(cut<80)cut=max;arr.push(s.slice(0,cut).trim());s=s.slice(cut).trim()}buffer+=(buffer?' ':'')+s}if(buffer)arr.push(buffer);return arr}
function add(title,body,kicker,art){const parts=chunks(body);if(!parts.length){slides.push({title,body:'',kicker,art});return}parts.forEach((text,i)=>slides.push({title:i===0?title:'',body:text,kicker:kicker+(parts.length>1?' · '+(i+1)+'/'+parts.length:''),art}))}
function prepare(){
 slides=[];const mission=Number((typeof currentChapter!=='undefined'&&currentChapter)||window.currentChapter||1);
 const chapter=typeof DATA!=='undefined'?DATA.chapters.find(x=>x.id===mission):null;
 const cast=typeof CAMPAIGN_COMPLETE!=='undefined'?CAMPAIGN_COMPLETE[mission]?.cast:null;
 add('VENOM — A FOME QUE NOS CONSOME','PRÓLOGO COMPLETO','MARVEL LEGENDARY · ABERTURA','Venom');
 if(typeof DATA!=='undefined'&&Array.isArray(DATA.prologue))DATA.prologue.forEach((p,i)=>add(p.title||'Prólogo '+(i+1),p.text||p.paragraphs||p.body||p.story,'PRÓLOGO · '+String(i+1).padStart(2,'0'),'Venom'));
 if(chapter){add('MISSÃO '+mission+' — '+chapter.title,chapter.story||'','A MISSÃO','Venom')}
 add('APRESENTAÇÃO DOS PERSONAGENS','','ELENCO DA MISSÃO','Spider-Man');
 if(cast&&typeof cast==='object')Object.entries(cast).forEach(([name,description])=>add(name,description,'PERSONAGEM',name));
 else if(chapter){[...(chapter.heroes||[]),chapter.mastermind,...(chapter.villains||[]),...(chapter.henchmen||[])].filter(Boolean).forEach(name=>add(name,'','PERSONAGEM',name))}
 add('PREPAREM-SE PARA A MISSÃO','A história continua sobre a mesa.','FIM DA ABERTURA','Venom');
}
function stopSpeech(){token++;clearTimeout(manualTimer);manualTimer=null;if('speechSynthesis'in window)window.speechSynthesis.cancel()}
function render(i){if(!overlay)return;index=Math.max(0,Math.min(i,slides.length-1));const s=slides[index],el=overlay.querySelector('#vc-slide');el.classList.add('vc-out');const current=token;setTimeout(()=>{if(!overlay||current!==token)return;el.replaceChildren();const k=document.createElement('div');k.className='vc-kicker';k.textContent=s.kicker;el.appendChild(k);if(s.title){const h=document.createElement('h2');h.textContent=s.title;el.appendChild(h)}if(s.body){const p=document.createElement('p');p.textContent=s.body;el.appendChild(p)}const img=typeof venomCardImage==='function'?venomCardImage(s.art||''):'';overlay.querySelector('#vc-stage').style.backgroundImage=img?'linear-gradient(#020a08b8,#020a08e8),url("'+img.replace(/"/g,'%22')+'")':'';overlay.querySelector('#vc-stage').style.backgroundSize='cover';overlay.querySelector('#vc-stage').style.backgroundPosition='center';el.classList.remove('vc-out');overlay.querySelector('#vc-progress').value=(index+1)/slides.length*100;overlay.querySelector('#vc-clock').textContent=(index+1)+' / '+slides.length},260)}
function speak(){if(!overlay||paused)return;const s=slides[index],text=[s.title,s.body].filter(Boolean).join('. ');const id=++token;render(index);const next=()=>{if(!overlay||paused||id!==token)return;if(index+1<slides.length){index++;speak()}else{overlay.querySelector('#vc-toggle').textContent='✓ Concluído';paused=true}};
 if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window)){manualTimer=setTimeout(next,Math.max(2500,text.length*75));return}
 utterance=new SpeechSynthesisUtterance(text||' ');utterance.lang='pt-BR';utterance.rate=.92;utterance.pitch=.92;
 const voices=window.speechSynthesis.getVoices();const pt=voices.find(v=>v.lang.toLowerCase().startsWith('pt-br'))||voices.find(v=>v.lang.toLowerCase().startsWith('pt'));if(pt)utterance.voice=pt;
 utterance.onend=next;utterance.onerror=()=>{if(id===token)manualTimer=setTimeout(next,1500)};
 window.speechSynthesis.speak(utterance);
}
function jump(i){stopSpeech();index=Math.max(0,Math.min(i,slides.length-1));paused=false;overlay.querySelector('#vc-toggle').textContent='Ⅱ Pausar';speak()}
function close(){stopSpeech();overlay?.remove();overlay=null;utterance=null}
function open(){close();if(typeof vnPlayer!=='undefined'&&!vnPlayer.paused)vnPlayer.pause();if(typeof venomPrologueStop==='function')venomPrologueStop();prepare();index=0;paused=false;overlay=document.createElement('div');overlay.id='vc-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Abertura cinematográfica');overlay.innerHTML='<div id="vc-stage"><div id="vc-slide"></div></div><div id="vc-controls"><button id="vc-prev" type="button">◀ Cena</button><button id="vc-toggle" type="button">Ⅱ Pausar</button><button id="vc-next" type="button">Cena ▶</button><input id="vc-progress" aria-label="Progresso" type="range" min="0" max="100" value="0"><span id="vc-clock"></span><button id="vc-close" type="button">✕ Fechar</button></div>';document.body.appendChild(overlay);
 overlay.querySelector('#vc-prev').onclick=()=>jump(index-1);overlay.querySelector('#vc-next').onclick=()=>jump(index+1);overlay.querySelector('#vc-close').onclick=close;
 overlay.querySelector('#vc-toggle').onclick=()=>{if(!paused){paused=true;clearTimeout(manualTimer);if('speechSynthesis'in window)window.speechSynthesis.pause();overlay.querySelector('#vc-toggle').textContent='▶ Continuar'}else{paused=false;overlay.querySelector('#vc-toggle').textContent='Ⅱ Pausar';if('speechSynthesis'in window&&window.speechSynthesis.paused)window.speechSynthesis.resume();else speak()}};
 overlay.querySelector('#vc-progress').onchange=e=>jump(Math.floor(Number(e.target.value)/100*slides.length));overlay.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='ArrowRight')jump(index+1);if(e.key==='ArrowLeft')jump(index-1)});
 speak();
}
function mount(){
 document.querySelectorAll('.cinema-launch').forEach(e=>e.style.display='none');
 document.querySelectorAll('#vc-launch').forEach(e=>e.remove());
 const prep=document.querySelector('#chapterDetail .mission-panel[data-panel="preparo"]');if(!prep)return;
 const b=document.createElement('button');b.id='vc-launch';b.type='button';b.textContent='🎬 ABERTURA CINEMATOGRÁFICA — PRÓLOGO E PERSONAGENS';b.onclick=open;prep.insertBefore(b,prep.firstChild);
}
let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;mount()},100)}).observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();