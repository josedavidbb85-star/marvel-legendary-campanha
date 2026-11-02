// Ecos da Ruptura v0.8.30 — narração sincronizada ao texto efetivamente exibido
(()=>{
'use strict';
const titleMap={
'Fragmentos que Não Deveriam Existir':[1,1,1],'A Memória Retorna':[1,1,2],
'A Doreen da Terra Morta':[1,2,1],'A Outra Doreen Tem Testemunhas':[1,2,2],
'A Primeira Conversão':[1,3,1],'A Conversão Chega ao Centro':[1,3,2],
'O Arquivo dos Convertidos':[2,1,1],'O Arquivo Respira':[2,1,2],
'Fé contra Memória':[2,2,1],'A Memória Escolhe um Lado':[2,2,2],
'O Pregador na City':[2,3,1],'O Sermão Vira Ordem':[2,3,2],
'A Aposta do Grandmaster':[3,1,1],'A Aposta Cobra Retorno':[3,1,2],
'Campeão ou Peça':[3,2,1],'O Campeão Recebe uma Coroa':[3,2,2],
'A Ponte dos Mapmakers':[3,3,1],'A Ponte Encontra o Destino':[3,3,2],
'A Falsificação se Defende':[4,1,2],'Beyonder Corrige a Cena':[4,2,2],'O Julgamento Recebe Evidência':[4,3,2],
'A Oferta Tem um Preço':[5,1,2],'As Páginas Começam a Fechar':[5,2,2],'O Evangelho do Fim':[5,3,2]
};
let activeCtx=null,lastAutoScene='',lastChoice={};
const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const play=(f,l)=>{if(typeof window.playNarration==='function')window.playNarration(f,l)};
function mission(){return Number(window.viewMission||(window.state&&state.current)||1)}
function activeHost(){return document.querySelector('.activeRespWrap .resp,.activeRespWrap')}
function inferFromScreen(){
 const host=activeHost(); if(!host)return null;
 const text=host.innerText||'';
 for(const [t,v] of Object.entries(titleMap))if(text.includes(t))return {m:v[0],r:v[1],n:v[2],title:t};
 // Fallback estrutural: usa missão atual, nível escrito na própria tela e posição/identificador da Responsabilidade.
 const m=mission(); const nn=(text.match(/N[ií]vel\s*([12])/i)||text.match(/\bN([12])\b/i)); const n=nn?Number(nn[1]):1;
 let r=0;
 const all=[...document.querySelectorAll('#playContent .resp')]; const idx=all.indexOf(host.matches('.resp')?host:host.querySelector('.resp')); if(idx>=0)r=(idx%3)+1;
 if(!r){const rr=(text.match(/Responsabilidade\s*([123])/i)||[])[1];r=rr?Number(rr):0}
 return r?{m,r,n,title:(host.querySelector('h3')?.textContent||`Responsabilidade ${r}`).trim()}:null;
}
function startSceneIfReady(){
 const c=inferFromScreen(); if(!c)return;
 // Só narra quando a cena narrativa/resolução está realmente na tela; nunca no modal de atribuição.
 const host=activeHost(); if(!host||document.querySelector('#respModal.show'))return;
 const hasNarrative=host.querySelector('.choice,button') || (host.innerText||'').length>120; if(!hasNarrative)return;
 activeCtx=c; const key=`m${c.m}_r${c.r}_n${c.n}`; if(lastAutoScene===key)return; lastAutoScene=key;
 play(`${key}_cena.mp3`,`${c.title} · N${c.n}`);
}
function choiceIndex(button,host){
 const box=button.closest('.choice'); if(box){const cs=[...host.querySelectorAll('.choice')];const i=cs.indexOf(box);if(i>=0&&i<3)return i+1}
 return 0;
}
function onClick(e){
 const b=e.target.closest&&e.target.closest('button');if(!b)return;
 // Confirmar responsável muda a interface; a cena começa somente depois que o texto correspondente aparece.
 const txt=norm(b.textContent),oc=norm(b.getAttribute('onclick'));
 if(/confirmar responsavel|confirmar responsável/.test(txt))setTimeout(startSceneIfReady,220);
 const host=activeHost(); const c=inferFromScreen(); if(!host||!c)return;
 const op=choiceIndex(b,host);
 if(op){activeCtx=c;const key=`m${c.m}_r${c.r}_n${c.n}`;lastChoice[key]=op;setTimeout(()=>play(`${key}_op${op}.mp3`,`${c.title} · escolha ${op}`),40);return}
 let result='';if(/sucesso/.test(txt)||/success/.test(oc))result='sucesso';if(/falha/.test(txt)||/fail|failure/.test(oc))result='falha';
 if(result){const key=`m${c.m}_r${c.r}_n${c.n}`;const opx=lastChoice[key]||1;setTimeout(()=>play(`${key}_op${opx}_${result}.mp3`,`${c.title} · ${result}`),80)}
}
document.addEventListener('click',onClick,true);
let timer=0;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(startSceneIfReady,140)}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
// A abertura é narrada JUNTO da abertura cinematográfica, onde o texto correspondente está na tela.
let openingPlayed='';
function openingMissionFromVideo(v){
 const d=Number(v.dataset.mission||0);if(d)return d;
 const src=decodeURIComponent(v.currentSrc||v.src||'').toLowerCase();
 if(src.includes('1000274259'))return 1;if(src.includes('1000274260'))return 2;if(src.includes('missão 3')||src.includes('miss%C3%A3o%203')||src.includes('missao_3')||src.includes('missao 3'))return 3;if(src.includes('missão 4')||src.includes('missao_4')||src.includes('missao 4'))return 4;if(src.includes('missao_5_abertura')||src.includes('missão 5'))return 5;return mission();
}
document.addEventListener('play',e=>{const v=e.target;if(!(v instanceof HTMLVideoElement))return;if(v.id!=='missionVideoPlayer')return;const src=norm(v.currentSrc||v.src||'');const isEnding=/encerramento|4262|4261/.test(src);if(isEnding)return;const m=openingMissionFromVideo(v);const key=`m${m}_abertura`;if(openingPlayed===key)return;openingPlayed=key;play(`${key}.mp3`,`Missão ${m} · abertura`)},true);
// Encerramento: consequência final após o vídeo, preservando a direção anterior.
function bindEnding(){const ev=document.getElementById('missionEndingVideo');if(ev&&!ev.dataset.nar830){ev.dataset.nar830='1';ev.addEventListener('ended',()=>{const m=mission();const rr=(window.state&&state.results&&state.results[m]&&state.results[m].result)||'win';play(`m${m}_${rr==='win'?'vitoria':'derrota'}.mp3`,`Missão ${m} · ${rr==='win'?'vitória':'derrota'}`)})}}
window.addEventListener('load',bindEnding);setTimeout(bindEnding,500);
})();