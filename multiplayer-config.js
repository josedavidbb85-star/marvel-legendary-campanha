window.MARVEL_MULTIPLAYER={supabaseUrl:"https://zlrukmdlnymchtxjqsfu.supabase.co",supabaseKey:"sb_publishable_xE3peGZJLWM78IhymBA0_A_ifMJHmxf"};
/* v0.32 — persistência e identificação */
document.addEventListener('DOMContentLoaded',()=>{
 const status=document.getElementById('topStatus');if(status)status.textContent='v0.32';
 const KEY='ruptura_m7_persist_v032';
 function snapshot(){try{const data={savedAt:Date.now(),vd:localStorage.getItem('ruptura_vd7_v272'),play:localStorage.getItem('ruptura_play7_v031'),campaign:localStorage.getItem('ruptura_campaign_v272')};localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}}
 function restore(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(!d)return;if(d.vd&&!localStorage.getItem('ruptura_vd7_v272'))localStorage.setItem('ruptura_vd7_v272',d.vd);if(d.play&&!localStorage.getItem('ruptura_play7_v031'))localStorage.setItem('ruptura_play7_v031',d.play);if(d.campaign&&!localStorage.getItem('ruptura_campaign_v272'))localStorage.setItem('ruptura_campaign_v272',d.campaign)}catch(e){}}
 restore();
 window.addEventListener('beforeunload',snapshot);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')snapshot()});setInterval(snapshot,5000);
 const oldSave=window.saveAll;if(oldSave)window.saveAll=function(){const r=oldSave.apply(this,arguments);snapshot();return r};
 const oldReveal=window.revealVD;if(oldReveal)window.revealVD=function(){const r=oldReveal.apply(this,arguments);setTimeout(snapshot,20);return r};
 const oldReset=window.resetVD;if(oldReset)window.resetVD=function(){const r=oldReset.apply(this,arguments);setTimeout(snapshot,20);return r};
});