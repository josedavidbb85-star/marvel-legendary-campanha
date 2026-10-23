window.MARVEL_MULTIPLAYER={supabaseUrl:"https://zlrukmdlnymchtxjqsfu.supabase.co",supabaseKey:"sb_publishable_xE3peGZJLWM78IhymBA0_A_ifMJHmxf"};

/* v0.29 — correções visuais/audiovisuais sem depender da navegação JS principal */
document.addEventListener('DOMContentLoaded',()=>{
 const IMG={
 'Endless Armies of HYDRA':'https://images.squarespace-cdn.com/content/v1/6246263c0f3d2738d79c971c/1654656261192-I7LRIK1DO42TWM32TIN1/HydraEndlessArmiesOfHydra.jpg',
 'HYDRA Kidnappers':'https://images.squarespace-cdn.com/content/v1/6246263c0f3d2738d79c971c/1654656287605-O23KG01YHU8ZU1TC78IH/HydraHydraKidnappers.jpg',
 'Supreme HYDRA':'https://images.squarespace-cdn.com/content/v1/6246263c0f3d2738d79c971c/1654656314569-PLSYI5A1A13L1RWA5YR1/HydraSupremeHydra.jpg',
 'Viper':'https://images.squarespace-cdn.com/content/v1/6246263c0f3d2738d79c971c/1654656336427-ICQERAN2DHKQ75WPVADP/HydraViper.jpg',
 'Baron Zemo':'https://images.squarespace-cdn.com/content/v1/6246263c0f3d2738d79c971c/1654656387875-E48GGVKJX8K0WQJWOW2V/MastersOfEvilBaronZemo.jpg',
 'Melter':'https://images.squarespace-cdn.com/content/v1/6246263c0f3d2738d79c971c/1654656415239-WOP8QP7R8MNVOCUPUN85/MastersOfEvilMelter.jpg',
 'Ultron':'https://images.squarespace-cdn.com/content/v1/6246263c0f3d2738d79c971c/1654656429523-1COFHPLFB7RLEQYLX6RY/MastersOfEvilUltron.jpg',
 'Whirlwind':'https://images.squarespace-cdn.com/content/v1/6246263c0f3d2738d79c971c/1654656447973-0R4CW2A98O0YTD65G2RF/MastersOfEvilWhirlwind.jpg',
 'Doctor Octopus':'https://images.squarespace-cdn.com/content/v1/6246263c0f3d2738d79c971c/1654656680588-48DKHKPRB5MF18J09E64/Spider-FoesDoctorOctopus.jpg',
 'Green Goblin':'https://images.squarespace-cdn.com/content/v1/6246263c0f3d2738d79c971c/1654656698826-7T30OWQ6LHZW7Q5QO0O1/Spider-FoesGreenGoblin.jpg',
 'The Lizard':'https://images.squarespace-cdn.com/content/v1/6246263c0f3d2738d79c971c/1654656724023-GX19JDES6QF9QL9FAW94/Spider-FoesTheLizard.jpg',
 'Venom':'https://images.squarespace-cdn.com/content/v1/6246263c0f3d2738d79c971c/1654656771809-D5JWTGYTI6LXPZVPDPPR/Spider-FoesVenom.jpg'};
 const ICON={Covert:'🔻',Instinct:'🟨',Ranged:'🎯',Strength:'✊',Tech:'▦'};
 const HC=[
 ['Captain America',{Instinct:5,Strength:5,Tech:3,Covert:1}],
 ['Iron Man',{Tech:9,Ranged:5}],
 ['Jessica Jones',{Strength:8,Covert:6}],
 ['Squirrel Girl',{Instinct:11,Covert:3}],
 ['Howard the Duck',{Instinct:8,Covert:5,Tech:1}]];
 const css=document.createElement('style');css.textContent=`
 #vd{box-sizing:border-box}#tab-vd:checked~#vd{height:calc(100dvh - 50px);overflow:hidden;display:grid;grid-template-rows:auto minmax(0,1fr) auto;gap:5px;max-width:none;padding:6px}.vdtop{min-height:0;display:grid!important;grid-template-columns:150px 210px!important;gap:6px!important}.vdtop>.panel{min-height:0;margin:0!important;padding:7px!important}.shown{min-height:0!important;height:100%;padding:4px!important}.shown .realcard{height:100%;max-height:calc(100dvh - 205px);max-width:100%;object-fit:contain;border-radius:7px}.city{height:100%;min-height:0}.slot{min-height:0!important;height:100%;overflow:hidden;display:flex;flex-direction:column;align-items:center}.slot .realcard{min-height:0;max-height:calc(100% - 16px);max-width:100%;object-fit:contain;border-radius:4px;margin-top:2px}.vd-city-compact{min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr);margin:0!important}.vd-compose{font-size:9px!important;margin:0!important;padding:5px 8px!important}.heroes{grid-template-columns:repeat(5,1fr)!important}.hero .classline{display:flex;gap:4px;flex-wrap:wrap;margin:7px 0}.classpill{display:flex;align-items:center;gap:3px;padding:4px 6px;border-radius:7px;background:#080d17;border:1px solid #3a4c66;font-size:11px;font-weight:900}.classpill .ico{font-size:20px;line-height:1}.classpill small{color:#9eb0ca;font-size:8px}.hero .total14{font-size:9px;color:#9eb0ca;margin-top:5px}@media(max-width:720px){#tab-vd:checked~#vd{height:calc(100dvh - 50px)}.vdtop{grid-template-columns:92px 125px!important}.decknum{font-size:27px!important}.vdtop>.panel{font-size:9px}.vdtop button{font-size:8px;padding:5px}.shown .realcard{max-height:calc(100dvh - 180px)}.city{grid-template-columns:repeat(5,minmax(0,1fr))!important;overflow:hidden!important;gap:2px!important}.slot{padding:2px!important}.slot b{font-size:7px!important}.heroes{grid-template-columns:1fr 1fr!important}}
 `;document.head.appendChild(css);
 function fixStructure(){const vd=document.getElementById('vd');if(vd){const panels=vd.querySelectorAll(':scope > .panel');if(panels[0])panels[0].classList.add('vd-city-compact');if(panels[1])panels[1].classList.add('vd-compose');}const s=document.getElementById('topStatus');if(s&&!s.textContent.includes('Sala'))s.textContent='v0.29 • cartas reais • classes';}
 function imgFor(c){return c&&IMG[c.name]||''}
 function patchVD(){if(typeof window.renderVD!=='function')return;const original=window.renderVD;window.renderVD=function(){original();const c=window.V&&window.V.last;if(c){const last=document.getElementById('lastCard'),u=imgFor(c);if(last&&u){last.innerHTML=`<img class="realcard" src="${u}" alt="${c.name}">`;last.style.background='transparent';}}if(window.V&&window.V.city){document.querySelectorAll('#city .slot').forEach((slot,i)=>{const x=window.V.city[i],u=imgFor(x);if(x&&u){const old=slot.querySelector('.mini');if(old)old.remove();slot.insertAdjacentHTML('beforeend',`<img class="realcard" src="${u}" alt="${x.name}">`);}})}};window.renderVD();}
 function patchHeroes(){const grid=document.getElementById('heroGrid');if(!grid)return;setTimeout(()=>{grid.querySelectorAll('.hero').forEach((el,i)=>{const h=HC[i];if(!h)return;let old=el.querySelector('.classline');if(old)old.remove();const d=document.createElement('div');d.className='classline';d.innerHTML=Object.entries(h[1]).map(([k,v])=>`<span class="classpill" title="${k}: ${v} cartas"><span class="ico">${ICON[k]}</span><span>${v}</span><small>${k}</small></span>`).join('');const ul=el.querySelector('ul');el.insertBefore(d,ul||el.firstChild);if(!el.querySelector('.total14'))el.insertAdjacentHTML('beforeend','<div class="total14">Total: 14 cartas</div>');});},0)}
 fixStructure();patchVD();patchHeroes();
 /* Trilha: usa os cinco MP3 quando presentes em assets/music; WebAudio continua como fallback. */
 window.RUPTURA_TRACKS=['assets/music/every-hero.mp3','assets/music/god-of-thunder.mp3','assets/music/i-am-iron-man.mp3','assets/music/hulk-smash.mp3','assets/music/by-force-of-mind.mp3'];
 const oldIntro=window.startIntro,oldOutro=window.startOutro;let bgm=new Audio();bgm.volume=.38;function mp3(i){bgm.src=window.RUPTURA_TRACKS[i];bgm.play().catch(()=>{});}if(oldIntro)window.startIntro=function(){mp3(0);return oldIntro()};if(oldOutro)window.startOutro=function(){mp3(4);return oldOutro()};const oldClose=window.closeCinema;if(oldClose)window.closeCinema=function(){bgm.pause();return oldClose()};
});