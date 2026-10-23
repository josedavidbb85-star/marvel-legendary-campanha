window.MARVEL_MULTIPLAYER={supabaseUrl:"https://zlrukmdlnymchtxjqsfu.supabase.co",supabaseKey:"sb_publishable_xE3peGZJLWM78IhymBA0_A_ifMJHmxf"};
/* v0.34 bootstrap — carrega o patch de forma síncrona enquanto o HTML ainda está sendo analisado. */
(function(){
  try{
    var x=new XMLHttpRequest();
    x.open('GET','v033.js?v=034',false);
    x.send(null);
    if(x.status>=200&&x.status<300){(0,eval)(x.responseText);}
    else{console.error('Falha ao carregar v033.js',x.status);}
  }catch(e){console.error('Falha no bootstrap v0.34',e);}
})();
