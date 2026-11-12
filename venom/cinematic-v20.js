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
let movieMusicWasPlaying=false;
function close(){const movie=overlay?.querySelector('video');const cast=overlay?.querySelector('#vc-cast-audio');if(cast){cast.pause();cast.removeAttribute('src');cast.load();}if(movie){movie.pause();movie.removeAttribute('src');movie.load();}if(movieMusicWasPlaying){movieMusicWasPlaying=false;if(typeof venomMusic!=='undefined')venomMusic.play().catch(()=>{});}cancelAnimationFrame(raf);clearTimeout(changeTimer);audio.pause();audio.removeAttribute('src');audio.load();overlay?.remove();overlay=null}
function openSlides(){close();if(typeof vnPlayer!=='undefined')vnPlayer.pause();if(typeof venomPrologueAudio!=='undefined')venomPrologueAudio.pause();build();if(!scenes.length)return;overlay=document.createElement('div');overlay.id='vc-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Abertura cinematográfica');overlay.innerHTML='<div id="vc-stage"><div id="vc-slide"></div></div><div id="vc-controls"><button id="vc-prev">◀ Cena</button><button id="vc-toggle">Ⅱ Pausar</button><button id="vc-next">Cena ▶</button><input id="vc-progress" aria-label="Progresso" type="range" min="0" max="100" value="0"><span id="vc-clock"></span><button id="vc-close">✕ Fechar</button><span id="vc-message"></span></div>';document.body.appendChild(overlay);overlay.querySelector('#vc-prev').onclick=()=>jump(scene-1);overlay.querySelector('#vc-next').onclick=()=>jump(scene+1);overlay.querySelector('#vc-close').onclick=close;overlay.querySelector('#vc-toggle').onclick=()=>{if(audio.paused)audio.play().catch(()=>{});else audio.pause()};overlay.querySelector('#vc-progress').onchange=e=>jump(Math.floor(Number(e.target.value)/100*scenes.length));overlay.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='ArrowRight')jump(scene+1);if(e.key==='ArrowLeft')jump(scene-1)});audio.onplay=()=>{if(overlay)overlay.querySelector('#vc-toggle').textContent='Ⅱ Pausar'};audio.onpause=()=>{if(overlay)overlay.querySelector('#vc-toggle').textContent='▶ Continuar'};playGroup(0);tick()}
function open(){
 close();
 if(typeof vnPlayer!=='undefined')vnPlayer.pause();
 if(typeof venomPrologueAudio!=='undefined')venomPrologueAudio.pause();
 if(typeof venomMusic!=='undefined'&&!venomMusic.paused){movieMusicWasPlaying=true;venomMusic.pause();}
 const mission=Number(typeof currentChapter!=='undefined'?currentChapter:1)||1;
 overlay=document.createElement('div');overlay.id='vc-overlay';overlay.className='vc-movie-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Prólogo narrado da missão '+mission);
 overlay.innerHTML='<header class="vc-movie-header"><h2>MISSÃO '+String(mission).padStart(2,'0')+' · PRÓLOGO NARRADO</h2><button type="button" class="btn secondary" id="vc-movie-close">✕ VOLTAR</button></header><div class="vc-movie-shell"><video controls autoplay playsinline preload="metadata" aria-label="Abertura narrada da missão '+mission+'"></video><div class="vc-motivation-gallery" id="vc-motivation-gallery" aria-label="Cartas dos personagens e componentes narrados"></div></div><footer class="vc-movie-footer"><span role="status" id="vc-movie-status">Narração original da campanha</span><button type="button" class="btn secondary" id="vc-cast-audio-toggle">▶ Motivações dos personagens</button><button type="button" class="btn secondary" id="vc-movie-replay">▶ Assistir prólogo</button><audio id="vc-cast-audio" preload="none"></audio><button type="button" class="btn secondary" id="vc-movie-fallback" hidden>Abrir versão com cenas e áudio</button></footer>';
 document.body.appendChild(overlay);
 const movie=overlay.querySelector('video'),cast=overlay.querySelector('#vc-cast-audio'),castButton=overlay.querySelector('#vc-cast-audio-toggle'),gallery=overlay.querySelector('#vc-motivation-gallery'),replayButton=overlay.querySelector('#vc-movie-replay');
 const castNames=Object.keys(CAMPAIGN_COMPLETE?.[mission]?.cast||{});
 castNames.forEach(name=>{const imageUrl=typeof venomCardImage==='function'?venomCardImage(name):'';if(!imageUrl)return;const figure=document.createElement('figure');figure.className='vc-motivation-card';const img=document.createElement('img');img.src=imageUrl;img.alt='Carta de '+name;img.loading='lazy';const label=document.createElement('figcaption');label.textContent=name;figure.append(img,label);gallery.append(figure)});
 movie.src='videos/M'+String(mission).padStart(2,'0')+'_abertura_narrada.mp4?v=1';
 cast.src='audios/Missao_'+String(mission).padStart(2,'0')+'/M'+String(mission).padStart(2,'0')+'_02_elenco.mp3';
 castButton.onclick=()=>{if(!cast.paused){cast.pause();castButton.textContent='▶ Retomar motivações';return;}movie.pause();movie.hidden=true;gallery.classList.add('active');cast.play().then(()=>{castButton.textContent='Ⅱ Pausar motivações';overlay.querySelector('#vc-movie-status').textContent='Motivações narradas · cartas correspondentes';}).catch(()=>{overlay.querySelector('#vc-movie-status').textContent='Áudio de motivações indisponível para esta missão.';});};
 replayButton.onclick=()=>{cast.pause();castButton.textContent='▶ Motivações dos personagens';gallery.classList.remove('active');movie.hidden=false;movie.currentTime=0;movie.play().catch(()=>{});overlay.querySelector('#vc-movie-status').textContent='Narração original da campanha';};
 cast.addEventListener('ended',()=>{castButton.textContent='▶ Ouvir motivações novamente';});
 cast.addEventListener('play',()=>movie.pause());
 cast.addEventListener('error',()=>{if(overlay)overlay.querySelector('#vc-movie-status').textContent='Áudio de motivações indisponível para esta missão.';});
 overlay.querySelector('#vc-movie-close').onclick=close;
 overlay.querySelector('#vc-movie-fallback').onclick=openSlides;
 movie.addEventListener('error',()=>{if(!overlay)return;overlay.querySelector('#vc-movie-status').textContent='Vídeo indisponível. A versão com cenas e áudio continua disponível.';overlay.querySelector('#vc-movie-fallback').hidden=false;});
 movie.addEventListener('ended',()=>{if(overlay)overlay.querySelector('#vc-movie-status').textContent='Prólogo concluído. Boa missão!';});
 overlay.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
 overlay.querySelector('#vc-movie-close').focus();
 movie.play().catch(()=>{if(overlay)overlay.querySelector('#vc-movie-status').textContent='Use o botão de reprodução para ouvir o prólogo.';});
}
function mount(){document.querySelectorAll('#venomNarration').forEach(e=>e.remove());document.querySelectorAll('.cinema-launch').forEach(e=>e.style.display='none');const prep=document.querySelector('#chapterDetail .mission-panel[data-panel="preparo"]');if(!prep)return;const toolbar=prep.querySelector(':scope > .venom-prep-toolbar');const existing=prep.querySelector('#vc-launch');if(existing){if(toolbar&&existing.parentElement!==toolbar)toolbar.prepend(existing);return;}document.querySelectorAll('#vc-launch').forEach(e=>e.remove());const btn=document.createElement('button');btn.id='vc-launch';btn.type='button';btn.className='btn secondary';btn.textContent='🎬 Prólogo da missão';btn.title='Abrir prólogo cinematográfico da missão com narração original';btn.onclick=open;if(toolbar)toolbar.prepend(btn);else prep.insertBefore(btn,prep.firstChild)}
let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;mount()},100)}).observe(document.body,{subtree:true,childList:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();

/* Outcome pilots: existing mission narration with shared, spoiler-free visual clips. */
(function () {
 'use strict';
 let dialog=null,returnFocus=null,resumeMusic=false,oldVolume=1;
 const style=document.createElement('style');
 style.textContent=`#ve-overlay{position:fixed;inset:0;z-index:210000;display:flex;flex-direction:column;background:#030806;color:#fff}#ve-overlay header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 20px;background:#0b131b;border-bottom:3px solid #ad263a}#ve-overlay h2{font:400 clamp(24px,3vw,40px)/1.1 Bangers,Impact,sans-serif;margin:0;color:#fff4cd}#ve-stage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;background:#000}#ve-stage video{display:block;width:100%;height:100%;object-fit:contain}#ve-overlay footer{flex:none;padding:10px 20px;background:#0b131b;display:flex;align-items:center;gap:16px;flex-wrap:wrap}#ve-overlay audio{width:min(650px,100%);flex:1;min-width:240px}#ve-status{font:16px/1.4 'Comic Neue',sans-serif;color:#e9e3ca}#ve-overlay button{flex:none;min-height:44px}@media(max-width:600px){#ve-overlay header,#ve-overlay footer{padding:10px}#ve-status{font-size:14px}}`;
 document.head.append(style);
 function close(){
  if(!dialog)return;
  dialog.querySelectorAll('audio,video').forEach(media=>{media.pause();media.removeAttribute('src');media.load()});
  dialog.remove();dialog=null;
  if(typeof venomMusic!=='undefined'){venomMusic.volume=oldVolume;if(resumeMusic)venomMusic.play().catch(()=>{})}
  resumeMusic=false;if(returnFocus?.isConnected)returnFocus.focus();
 }
 function open(id,mission){
  mission=Number(mission);const win=/_90_vitoria$/.test(id),result=win?'win':'loss';
  if(typeof save==='undefined'||save.results[mission]!==result)return;
  close();document.querySelector('#vc-movie-close,#vc-close')?.click();
  if(typeof vnPlayer!=='undefined')vnPlayer.pause();
  if(typeof venomPrologueAudio!=='undefined')venomPrologueAudio.pause();
  if(typeof venomMusic!=='undefined'){oldVolume=venomMusic.volume;resumeMusic=!venomMusic.paused;venomMusic.pause()}
  returnFocus=document.activeElement;
  const root=document.createElement('section');dialog=root;root.id='ve-overlay';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Desfecho narrado da missão '+mission);
  root.innerHTML='<header><h2>MISSÃO '+String(mission).padStart(2,'0')+' · '+(win?'VITÓRIA':'DERROTA')+'</h2><button class="btn secondary" type="button">✕ VOLTAR</button></header><div id="ve-stage"><video muted playsinline preload="metadata" aria-label="Cena do desfecho"></video></div><footer><audio controls preload="metadata" aria-label="Narração do desfecho"></audio><span id="ve-status" role="status">Narração original da missão</span></footer>';
  document.body.append(root);const video=root.querySelector('video'),voice=root.querySelector('audio'),status=root.querySelector('#ve-status');video.muted=true;
  video.src='videos/desfecho_'+(win?'vitoria':'derrota')+'_piloto.mp4?v=1';voice.src=vnPath(id,mission);
  const sync=()=>{if(!Number.isFinite(video.duration))return;const target=Math.min(voice.currentTime,Math.max(0,video.duration-.08));if(Math.abs(video.currentTime-target)>.45)video.currentTime=target;};
  voice.addEventListener('play',()=>{sync();if(voice.currentTime<video.duration||!Number.isFinite(video.duration))video.play().catch(()=>{});status.textContent='Narração original da missão'});
  voice.addEventListener('pause',()=>video.pause());voice.addEventListener('seeking',sync);voice.addEventListener('timeupdate',sync);
  video.addEventListener('loadedmetadata',()=>{sync();if(!voice.paused&&voice.currentTime<video.duration)video.play().catch(()=>{})});
  voice.addEventListener('seeked',()=>{if(!voice.paused&&voice.currentTime<video.duration)video.play().catch(()=>{})});
  voice.addEventListener('ended',()=>{video.pause();status.textContent='Desfecho concluído. Volte para a campanha quando quiser.'});
  voice.addEventListener('error',()=>{status.textContent='Não foi possível carregar a narração. Feche e tente novamente.'});
  video.addEventListener('error',()=>{status.textContent='Cena indisponível. A narração pode continuar pelo controle de áudio.'});
  root.querySelector('button').onclick=close;root.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const controls=[root.querySelector('button'),voice];if(e.shiftKey&&document.activeElement===controls[0]){e.preventDefault();voice.focus()}else if(!e.shiftKey&&document.activeElement===voice){e.preventDefault();controls[0].focus()}}});root.querySelector('button').focus();
  voice.play().catch(()=>{status.textContent='Toque em reproduzir para ouvir o desfecho.'});
 }
 const original=vnPlay;
 vnPlay=function(id,mission){if(/^M\d{2}_(90_vitoria|91_derrota)$/.test(id))return open(id,mission);close();return original(id,mission)};
 function mount(){
  const mission=Number(typeof currentChapter!=='undefined'?currentChapter:1),result=typeof save!=='undefined'?save.results[mission]:null;
  document.querySelectorAll('.venom-ending-narration button').forEach(button=>{const win=(button.getAttribute('onclick')||'').includes('90_vitoria');button.textContent='▶ Assistir '+(win?'vitória':'derrota');button.disabled=result!==(win?'win':'loss');button.title=button.disabled?'Registre o resultado correspondente para liberar este desfecho.':'Vídeo com a narração original desta missão';});
  if(dialog&&dialog.dataset.mission!==String(mission))close();
 }
 // Observe inserted mission panels, without reacting to our own button labels.
 let pending=false;new MutationObserver(records=>{if(records.every(r=>r.target.closest?.('.venom-ending-narration,#ve-overlay')))return;if(pending)return;pending=true;setTimeout(()=>{pending=false;mount()},100)}).observe(document.getElementById('chapterDetail')||document.body,{childList:true,subtree:true});
 // Store the mission only once a dialog has been mounted.
 const originalOpen=open;open=function(id,mission){originalOpen(id,mission);if(dialog)dialog.dataset.mission=String(Number(mission))};
 mount();
})();
