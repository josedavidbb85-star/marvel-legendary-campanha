// Ecos da Ruptura v0.8.31 — narração determinística: o bloco visível define o áudio
(()=>{
'use strict';
const MAP={
'Fragmentos que Não Deveriam Existir':[1,1,1],'A Memória Retorna':[1,1,2],'A Doreen da Terra Morta':[1,2,1],'A Outra Doreen Tem Testemunhas':[1,2,2],'A Primeira Conversão':[1,3,1],'A Conversão Chega ao Centro':[1,3,2],
'O Arquivo dos Convertidos':[2,1,1],'O Arquivo Respira':[2,1,2],'Fé contra Memória':[2,2,1],'A Memória Escolhe um Lado':[2,2,2],'O Pregador na City':[2,3,1],'O Sermão Vira Ordem':[2,3,2],
'A Aposta do Grandmaster':[3,1,1],'A Aposta Cobra Retorno':[3,1,2],'Campeão ou Peça':[3,2,1],'O Campeão Recebe uma Coroa':[3,2,2],'A Ponte dos Mapmakers':[3,3,1],'A Ponte Encontra o Destino':[3,3,2],
'A Falsificação se Defende':[4,1,2],'Beyonder Corrige a Cena':[4,2,2],'O Julgamento Recebe Evidência':[4,3,2],'A Oferta Tem um Preço':[5,1,2],'As Páginas Começam a Fechar':[5,2,2],'O Evangelho do Fim':[5,3,2]
};
const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const play=(f,l)=>window.playNarration&&window.playNarration(f,l);
let ctx=null,lastScene='',lastChoice={};
function visible(el){if(!el)return false;const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getClientRects().length>0}
function mission(){return Number(window.viewMission||(window.state&&state.current)||1)}
function narrativeHost(){
 const nodes=[...document.querySelectorAll('.modal.show .modalBox,.activeRespWrap,#playContent .resp')].filter(visible);
 // modal narrativo/decisão tem prioridade; modal de atribuição é excluído
 return nodes.find(x=>x.closest('#respModal')===null && Object.keys(MAP).some(t=>(x.innerText||'').includes(t))) || nodes.find(x=>Object.keys(MAP).some(t=>(x.innerText||'').includes(t))) || null;
}
function contextFrom(el){if(!el)return null;const text=el.innerText||'';for(const [t,v] of Object.entries(MAP))if(text.includes(t))return {m:v[0],r:v[1],n:v[2],title:t};return null}
function scene(){
 if(document.querySelector('#respModal.show'))return;const h=narrativeHost(),c=contextFrom(h);if(!h||!c)return;
 // Só inicia cena quando o título e o texto narrativo correspondente estão simultaneamente visíveis.
 const text=(h.innerText||'').trim();if(text.length<100)return;
 const key=`m${c.m}_r${c.r}_n${c.n}`;ctx=c;if(lastScene===key)return;lastScene=key;play(`${key}_cena.mp3`,`${c.title} · N${c.n}`);
}
function optionIndex(btn,host){const box=btn.closest('.choice');if(!box)return 0;const choices=[...host.querySelectorAll('.choice')].filter(visible);const i=choices.indexOf(box);return i>=0&&i<3?i+1:0}
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('button');if(!b)return;const txt=norm(b.textContent),oc=norm(b.getAttribute('onclick'));
 // atribuição não fala; espera o bloco narrativo aparecer
 if(/confirmar responsavel/.test(txt)){setTimeout(scene,180);return}
 const h=narrativeHost(),c=contextFrom(h);if(!h||!c)return;ctx=c;const key=`m${c.m}_r${c.r}_n${c.n}`;
 const op=optionIndex(b,h);if(op){lastChoice[key]=op;setTimeout(()=>play(`${key}_op${op}.mp3`,`${c.title} · escolha ${op}`),20);return}
 let result='';if(/sucesso/.test(txt)||/success/.test(oc))result='sucesso';else if(/falha/.test(txt)||/fail|failure/.test(oc))result='falha';
 if(result){const oi=lastChoice[key];if(oi)setTimeout(()=>play(`${key}_op${oi}_${result}.mp3`,`${c.title} · ${result}`),50)}
},true);
let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(scene,100)}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style']});
// ABERTURA: começa quando o vídeo de abertura começa, simultânea ao texto/cinemática. Nunca após fechar.
let opening='';function openingM(v){const src=norm(decodeURIComponent(v.currentSrc||v.src||''));if(src.includes('1000274259'))return 1;if(src.includes('1000274260'))return 2;if(src.includes('missao 3'))return 3;if(src.includes('missao 4'))return 4;if(src.includes('missao_5_abertura'))return 5;return Number(v.dataset.mission)||mission()}
document.addEventListener('play',e=>{const v=e.target;if(!(v instanceof HTMLVideoElement)||v.id!=='missionVideoPlayer')return;const src=norm(decodeURIComponent(v.currentSrc||v.src||''));if(/encerramento|4262|4261/.test(src))return;const m=openingM(v),k=`m${m}_abertura`;if(opening===k)return;opening=k;play(`${k}.mp3`,`Missão ${m} · abertura`)},true);
// CONFLITO: reservado deliberadamente. Nesta versão não há áudio de conflito.
// ENCERRAMENTO: mantém vitória/derrota após a cinematográfica final.
function bindEnd(){const v=document.getElementById('missionEndingVideo');if(v&&!v.dataset.nar831){v.dataset.nar831='1';v.addEventListener('ended',()=>{const m=mission(),r=(window.state&&state.results&&state.results[m]&&state.results[m].result)||'win';play(`m${m}_${r==='win'?'vitoria':'derrota'}.mp3`,`Missão ${m} · ${r==='win'?'vitória':'derrota'}`)})}}
window.addEventListener('load',bindEnd);setTimeout(bindEnd,400);
})();