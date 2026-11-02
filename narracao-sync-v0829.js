// Ecos da Ruptura v0.8.29 — direção automática das narrações Algenib
(()=>{
  'use strict';
  const titles={
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
  let ctx=null, lastScene='', lastChoice={};
  const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function visibleText(){return [...document.querySelectorAll('.modal.show,.activeRespWrap,#play.tab.on')].map(x=>x.innerText||'').join('\n')}
  function inferContext(){
    const vis=visibleText();
    for(const [t,v] of Object.entries(titles)) if(vis.includes(t)) return {m:v[0],r:v[1],n:v[2],title:t};
    const n=norm(vis);
    const mm=n.match(/missao\s*(\d)/); return mm?{m:Number(mm[1]),r:0,n:0,title:''}:null;
  }
  function play(file,label){if(typeof window.playNarration==='function') window.playNarration(file,label)}
  function scene(auto=true){
    const c=inferContext(); if(!c||!c.r)return;
    ctx=c; const key=`m${c.m}_r${c.r}_n${c.n}`;
    if(auto&&lastScene===key)return; lastScene=key;
    play(`${key}_cena.mp3`,`${c.title} · N${c.n}`);
  }
  function choiceIndex(button){
    const host=button.closest('.activeRespWrap,.resp,.modalBox')||document;
    const candidates=[...host.querySelectorAll('.choice button,button')].filter(b=>{
      const s=norm(b.textContent);return !/(cancelar|confirmar|sucesso|falha|voltar|fechar|reiniciar|ouvir|pausar)/.test(s);
    });
    const direct=button.closest('.choice');
    if(direct){const choices=[...host.querySelectorAll('.choice')];const i=choices.indexOf(direct);if(i>=0&&i<3)return i+1}
    const i=candidates.indexOf(button);return i>=0&&i<3?i+1:0;
  }
  function handleClick(e){
    const b=e.target.closest&&e.target.closest('button');if(!b)return;
    const txt=norm(b.textContent), oc=norm(b.getAttribute('onclick'));
    // Abrir/acionar Responsabilidade: a cena entra quando a interface narrativa aparece.
    if(/acionar|ativar|responsabilidade/.test(txt) && !/regras|historico/.test(txt)) setTimeout(()=>scene(true),180);
    // Escolha temática: fala específica antes da resolução mecânica.
    const c=inferContext();
    if(c&&c.r){
      const op=choiceIndex(b);
      if(op && (b.closest('.choice') || /escolher|selecionar|assumir|seguir|preservar|romper|infiltrar|responder|cobrar|apostar|recusar|usar|desafiar|redirecionar|atravessar|marcar|fixar|comparar|multiplicar|apresentar|confrontar|defender|devolver|manter|amarrar|registrar|quebrar|entregar|publicar/.test(txt))){
        ctx=c;const key=`m${c.m}_r${c.r}_n${c.n}`;lastChoice[key]=op;
        setTimeout(()=>play(`${key}_op${op}.mp3`,`${c.title} · escolha ${op}`),60);return;
      }
      // Resultado: consequência da opção efetivamente escolhida.
      let result='';if(/sucesso/.test(txt)||/success/.test(oc))result='sucesso';if(/falha/.test(txt)||/fail|failure/.test(oc))result='falha';
      if(result){const key=`m${c.m}_r${c.r}_n${c.n}`;const op=lastChoice[key]||1;setTimeout(()=>play(`${key}_op${op}_${result}.mp3`,`${c.title} · ${result}`),100);}
    }
  }
  document.addEventListener('click',handleClick,true);
  // Quando a cena de Responsabilidade aparece por mudança de estado, inicia uma única vez.
  let timer=0;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>{
    const active=document.querySelector('.activeRespWrap');const modal=document.querySelector('#respModal.show');
    if(active||modal)scene(true);
  },100)}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  function bindVideos(){
    const mv=document.getElementById('missionVideoPlayer');
    if(mv&&!mv.dataset.nar829){mv.dataset.nar829='1';mv.addEventListener('ended',()=>{if(mv.dataset.kind==='opening'){const m=Number(mv.dataset.mission||window.viewMission||1);setTimeout(()=>play(`m${m}_abertura.mp3`,`Missão ${m} · abertura`),180)}})}
    const ev=document.getElementById('missionEndingVideo');
    if(ev&&!ev.dataset.nar829){ev.dataset.nar829='1';ev.addEventListener('ended',()=>{const m=Number(window.viewMission||(window.state&&state.current)||1);const r=(window.state&&state.results&&state.results[m]&&state.results[m].result)||'win';setTimeout(()=>play(`m${m}_${r==='win'?'vitoria':'derrota'}.mp3`,`Missão ${m} · ${r==='win'?'vitória':'derrota'}`),180)})}
  }
  window.addEventListener('load',bindVideos);setTimeout(bindVideos,500);
  // Fechamento manual do vídeo de abertura também dispara a introdução.
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#missionVideoOverlay button');if(!b)return;const v=document.getElementById('missionVideoPlayer');if(v&&v.dataset.kind==='opening'){const m=Number(v.dataset.mission||window.viewMission||1);setTimeout(()=>play(`m${m}_abertura.mp3`,`Missão ${m} · abertura`),220)}},true);
})();
