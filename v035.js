document.addEventListener('DOMContentLoaded',()=>{
const VERSION='v0.35', $=id=>document.getElementById(id);
const status=$('topStatus'); if(status)status.textContent=VERSION;
const css=document.createElement('style');css.id='v035-style';css.textContent=`
/* v0.35: mobile-first + Villain Deck sem rolagem */
.tabs{gap:3px;padding:5px}.tabs label,.tabs button{padding:7px 8px;font-size:11px}.screen{padding:7px}.screen#vd{height:calc(100dvh - 48px)!important;overflow:hidden!important;padding:5px!important}.screen#vd .head{height:34px!important;margin:0!important}.screen#vd .head h1{font-size:16px;margin:0}.screen#vd .vdtop{height:34vh!important;max-height:none!important;grid-template-columns:95px 1fr!important;gap:4px!important}.screen#vd .vdtop .panel{margin:0!important;padding:5px!important;min-height:0!important;overflow:hidden}.screen#vd .decknum{font-size:26px!important;line-height:1}.screen#vd .shown{height:100%!important;min-height:0!important;padding:3px!important}.screen#vd .shown img,.screen#vd .realcard{max-height:100%!important;object-fit:contain!important}.screen#vd>.panel{margin:4px 0 0!important;padding:4px!important}.screen#vd>.panel:has(.city){height:42vh!important}.screen#vd .city{height:calc(100% - 20px)!important;display:grid!important;grid-template-columns:repeat(5,1fr)!important;gap:2px!important;overflow:hidden!important}.screen#vd .slot{height:100%!important;min-height:0!important;padding:2px!important;overflow:hidden!important}.screen#vd .slot b{font-size:7px!important}.screen#vd .slot img,.screen#vd .slot .realcard{width:100%!important;height:calc(100% - 12px)!important;object-fit:contain!important}.screen#vd>.panel:last-child{font-size:8px!important;line-height:1.15!important;max-height:8vh;overflow:hidden}.mission35quick{display:flex;gap:4px;overflow-x:auto;margin:0 0 8px;padding:2px;scrollbar-width:none}.mission35quick button{min-width:34px;padding:6px;font-size:10px}.tabs .status{display:inline!important;font-size:7px!important;opacity:.45}.cin33text{max-height:88dvh;overflow:auto;padding:20px 16px!important}.cin33text p{font-size:14px!important;line-height:1.45!important}.duringGrid{grid-template-columns:1fr!important}.frag{padding:7px!important;margin:5px 0!important}
@media(max-width:720px){body{font-size:13px}.grid{grid-template-columns:1fr!important}.grid>aside{display:none}.heroes{grid-template-columns:1fr 1fr!important;gap:4px!important}.hero{min-height:140px!important;padding:6px!important}.hero h3{font-size:12px}.hero ul{font-size:9px;padding-left:13px}.setup{grid-template-columns:80px 1fr!important;font-size:11px!important}.panel{padding:7px;margin-bottom:6px}.story{line-height:1.42}.screen#vd .vdtop{grid-template-columns:78px 1fr!important}.screen#vd .head button{padding:5px;font-size:9px}.screen#vd .shown{border-radius:7px}.screen#vd .cardart{width:90px!important;height:126px!important;padding:5px!important}.screen#vd .cardart strong{font-size:9px!important}.screen#vd .mini{padding:2px!important;font-size:7px!important;margin-top:2px!important}}
`;document.head.appendChild(css);

/* Remove Restaurar checkpoint. */
document.querySelectorAll('button').forEach(b=>{if(/Restaurar checkpoint/i.test(b.textContent||''))b.remove()});

/* Todas as missões 1–8 ficam consultáveis, sem transformar consulta em progresso. */
let activeMission=7;try{let z=JSON.parse(localStorage.getItem('ruptura_save_v1')||'null');activeMission=Math.max(1,Math.min(8,z?.current||7))}catch(e){}
const originalShow=window.showChapter;
function addMissionQuick(ch){const main=$('main')||$('camp');if(!main||main.querySelector('.mission35quick'))return;const q=document.createElement('div');q.className='mission35quick';q.innerHTML=[1,2,3,4,5,6,7,8].map(i=>`<button onclick="consultMission35(${i})" ${i===ch?'style="border-color:#d7b35a"':''}>${i}</button>`).join('');main.prepend(q)}
window.consultMission35=ch=>{if(typeof originalShow!=='function')return;const old=activeMission;try{if(typeof state!=='undefined')state.current=ch}catch(e){};originalShow(ch);try{if(typeof state!=='undefined'){state.current=old;localStorage.setItem('ruptura_save_v1',JSON.stringify(state))}}catch(e){};addMissionQuick(ch)};
const nav=$('chapterNav')||$('nav');if(nav){nav.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const m=(b.textContent||'').match(/(?:^|\s)([1-8])\./);if(m){e.preventDefault();e.stopImmediatePropagation();consultMission35(+m[1])}},true)}

/* Música diferente por área. Em celular, o primeiro toque libera o áudio; depois as trocas são automáticas. */
const track={camp:'01 - Every Hero Has to Start Somewhere.mp3',vd:'12 - Hulk Smash.mp3',heroes:'06 - I Am Iron Man.mp3',play:'15 - By Force of Mind.mp3',room:'03 - God of Thunder.mp3'};let bg=null;
window.music35=async area=>{if(bg){try{bg.pause()}catch(e){}}bg=new Audio(encodeURI(track[area]||track.camp));bg.loop=true;bg.volume=.23;try{await bg.play()}catch(e){}};
document.querySelectorAll('.tabs label').forEach(l=>l.addEventListener('click',()=>{const f=l.getAttribute('for')||'';music35(f.includes('vd')?'vd':f.includes('heroes')?'heroes':f.includes('room')?'room':'camp')}));
document.addEventListener('click',e=>{const b=e.target.closest('.mission-tab');if(b)music35(b.dataset.tab==='play'?'play':'camp')});

/* Vitória/Derrota abre o desfecho imediatamente. */
window.finish=function(ch,res){try{state.chapters[ch].result=res;if(res==='loss'&&state.chapters[ch].anchor!==undefined)state.chapters[ch].anchor=false;if(ch<8)activeMission=ch+1;syncDerivedCampaignState();localStorage.setItem('ruptura_save_v1',JSON.stringify(state));renderSidebar()}catch(e){console.error(e)};try{cineOpen(ch,'outro')}catch(e){console.error(e)}};

/* A primeira abertura da sessão entra direto na missão atual e mostra a narrativa completa. cineRender já usa CINE_FULL_NARRATIVE. */
setTimeout(()=>{try{consultMission35(activeMission)}catch(e){};const key='ruptura_intro_v035_'+activeMission;if(!sessionStorage.getItem(key)){sessionStorage.setItem(key,'1');try{cineOpen(activeMission,'intro')}catch(e){console.error(e)}}},220);

/* Se o navegador bloquear autoplay, o primeiro toque na abertura ativa a música e mantém o texto na tela. */
document.addEventListener('pointerdown',()=>{if(document.querySelector('.cin33.open')||document.querySelector('.cinema.open'))music35('camp')},{once:true});
});