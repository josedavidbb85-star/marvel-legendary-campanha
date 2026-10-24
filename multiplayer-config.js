window.MARVEL_MULTIPLAYER={supabaseUrl:"https://zlrukmdlnymchtxjqsfu.supabase.co",supabaseKey:"sb_publishable_xE3peGZJLWM78IhymBA0_A_ifMJHmxf"};
/* v0.35 bootstrap — patches carregados em ordem antes da inicialização da página. */
(function(){
  function loadSync(src){
    try{
      var x=new XMLHttpRequest();
      x.open('GET',src,false);
      x.send(null);
      if(x.status>=200&&x.status<300){(0,eval)(x.responseText);return true;}
      console.error('Falha ao carregar',src,x.status);
    }catch(e){console.error('Falha no bootstrap',src,e);}
    return false;
  }
  loadSync('v033.js?v=035');
  loadSync('v035.js?v=035');
})();
