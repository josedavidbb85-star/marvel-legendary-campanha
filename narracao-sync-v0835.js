// Ecos da Ruptura v0.8.35 — texto visível é a fonte da narração
(()=>{
'use strict';
const norm=s=>(s||'').replace(/\s+/g,' ').trim();
let currentText='', currentLabel='', currentMode='screen', lastSignature='', openingKey='';
let utter=null, initialized=false, oldPlay=null, oldPause=null, oldRestart=null, rawPlayNarration=null;
function mission(){return Number(window.viewMission||(window.state&&state.current)||1)}
function rs(i){try{return typeof window.respState==='function'?window.respState(i):null}catch(e){return null}}
function visibleActive(){return document.querySelector('#playContent .activeRespWrap .resp, #playContent .activeRespWrap')}
function activeIndex(){
 const a=visibleActive(); if(!a)return null;
 const tag=(a.innerText||'').match(/RESPONSABILIDADE\s*(\d)|RESP\.\s*(\d)/i);return tag?Number(tag[1]||tag[2])-1:null;
}
function chooseVoice(){const vs=speechSynthesis.getVoices();return vs.find(v=>/^pt-BR$/i.test(v.lang)&&/google|microsoft|antonio|daniel/i.test(v.name))||vs.find(v=>/^pt-BR$/i.test(v.lang))||vs.find(v=>/^pt/i.test(v.lang))||null}
function stopScreen(){try{speechSynthesis.cancel()}catch(e){} utter=null}
function speakScreen(text,label,autoplay=true){text=norm(text);if(!text)return;currentMode='screen';currentText=text;currentLabel=label||'Narração';if(oldPause)try{oldPause()}catch(e){};stopScreen();syncLabel();if(autoplay)playScreen()}
function playScreen(){if(!currentText)return;if(speechSynthesis.paused){speechSynthesis.resume();return}if(speechSynthesis.speaking)return;utter=new SpeechSynthesisUtterance(currentText);utter.lang='pt-BR';utter.rate=.96;utter.pitch=.92;const v=chooseVoice();if(v)utter.voice=v;utter.onend=()=>{utter=null;syncLabel()};utter.onerror=()=>{utter=null;syncLabel()};speechSynthesis.speak(utter);syncLabel()}
function pauseScreen(){if(speechSynthesis.speaking&&!speechSynthesis.paused)speechSynthesis.pause();syncLabel()}
function rewindScreen(){stopScreen();syncLabel()}
function syncLabel(){const l=document.querySelector('.narracaoBox .narLabel'),p=document.querySelector('.narracaoBox .narPlay');if(l&&currentMode==='screen')l.textContent=currentLabel||'Narração';if(p&&currentMode==='screen')p.textContent=speechSynthesis.speaking&&!speechSynthesis.paused?'▶ Tocando':'▶ Ouvir'}
function bindControls(){
 const box=document.querySelector('.narracaoBox');if(!box)return false;
 const p=box.querySelector('.narPlay'),pa=box.querySelector('.narPause'),r=box.querySelector('.narRestart');if(!p||!pa||!r)return false;
 if(!initialized){oldPlay=p.onclick;oldPause=pa.onclick;oldRestart=r.onclick;rawPlayNarration=window.playNarration;window.playNarration=function(f,l){currentMode='mp3';currentText='';currentLabel=l||f;stopScreen();return rawPlayNarration&&rawPlayNarration(f,l)};initialized=true}
 p.onclick=()=>{if(currentMode==='screen')playScreen();else oldPlay&&oldPlay()};
 pa.onclick=()=>{if(currentMode==='screen')pauseScreen();else oldPause&&oldPause()};
 r.onclick=()=>{if(currentMode==='screen')rewindScreen();else oldRestart&&oldRestart()};
 r.title='Voltar ao início e aguardar novo Play';return true;
}
function storyFromCard(kind){
 const card=visibleActive();if(!card)return '';
 const stories=[...card.querySelectorAll('p.story')].filter(p=>p.offsetParent!==null).map(p=>norm(p.textContent)).filter(Boolean);
 if(!stories.length)return '';
 if(kind==='outcome')return stories[stories.length-1];
 if(kind==='choice'){
   const i=activeIndex(),s=i!=null?rs(i):null;if(s&&s.choiceText)return norm(s.choiceText);
 }
 return stories[0];
}
function narrateScene(i){setTimeout(()=>{const card=visibleActive();if(!card)return;const s=rs(i)||{},n=Number(s.level)||1;const text=storyFromCard('scene');const sig=`scene|${mission()}|${i}|${n}|${text}`;if(text&&sig!==lastSignature){lastSignature=sig;speakScreen(text,`Missão ${mission()} · Responsabilidade ${i+1} · N${n}`,true)}},120)}
function narrateChoice(i){setTimeout(()=>{const text=storyFromCard('choice');if(text)speakScreen(text,`Missão ${mission()} · Responsabilidade ${i+1} · escolha`,true)},80)}
function narrateOutcome(i){setTimeout(()=>{const s=rs(i)||{},text=storyFromCard('outcome');if(text)speakScreen(text,`Missão ${mission()} · Responsabilidade ${i+1} · ${s.result||'resultado'}`,true)},120)}
function parse(code,name){const m=(code||'').match(new RegExp(name+'\\((\\d+)'));return m?Number(m[1]):null}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b)return;const code=b.getAttribute('onclick')||'',txt=norm(b.textContent).toLowerCase();let i=parse(code,'startResp');if(i!=null){const before=rs(i)||{};if(Number(before.level)===2||before.level1Record?.player||before.player)setTimeout(()=>narrateScene(i),80);return}if(txt.includes('confirmar responsável')||txt.includes('confirmar responsavel')){setTimeout(()=>{const i=activeIndex();if(i!=null)narrateScene(i)},180);return}i=parse(code,'chooseResp');if(i!=null){narrateChoice(i);return}setTimeout(()=>{const i=activeIndex();if(i!=null){const s=rs(i)||{};if(s.stage==='done'&&s.result)narrateOutcome(i)}},160)},true);
let debounce=0;new MutationObserver(()=>{clearTimeout(debounce);debounce=setTimeout(()=>{bindControls();const i=activeIndex();if(i==null)return;const s=rs(i)||{},card=visibleActive();if(!card)return;const stories=[...card.querySelectorAll('p.story')].filter(p=>p.offsetParent!==null);if(!stories.length)return;let kind=s.stage==='done'?'outcome':'scene';let text=kind==='outcome'?norm(stories[stories.length-1].textContent):norm(stories[0].textContent);const sig=`${kind}|${mission()}|${i}|${Number(s.level)||1}|${s.stage}|${s.result||''}|${text}`;if(text&&sig!==lastSignature){lastSignature=sig;speakScreen(text,`Missão ${mission()} · Responsabilidade ${i+1} · N${Number(s.level)||1}`,true)}},140)}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style']});
function startOpening(v){if(!v||v.id!=='missionVideoPlayer')return;const kind=(v.dataset.kind||'').toLowerCase();if(kind!=='opening')return;const m=Number(v.dataset.mission)||mission(),key=`m${m}_abertura`;if(openingKey===key)return;openingKey=key;if(window.playNarration)window.playNarration(`${key}.mp3`,`Missão ${m} · abertura`)}
document.addEventListener('play',e=>{if(e.target instanceof HTMLVideoElement)startOpening(e.target)},true);
window.addEventListener('load',()=>{bindControls();setTimeout(bindControls,500)});setTimeout(bindControls,300);
// CONFLITO permanece sem narração nesta etapa.
})();