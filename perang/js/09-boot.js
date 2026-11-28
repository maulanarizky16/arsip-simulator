'use strict';
/* ================= BOOT ================= */
if(hasDoc){
  $('nextBtn').addEventListener('click',advance);
  /* pulihkan peta dunia: semua negara abu-abu hidup lagi (perang yang sedang berjalan tidak terpengaruh) */
  $('dunia').addEventListener('click',e=>{ const b=e.target.closest('button[data-pulih]'); if(!b)return; pulihkanDunia(); if(P)addLog('Peta dunia dipulihkan. Semua negara kembali berdiri.','sys'); render(); });
  $('caraBtn').addEventListener('click',()=>{ if(P&&!G.current&&!G.over)caraMain(); });
  $('kartu').addEventListener('click',e=>{
    const b=e.target.closest('button[data-i]'); if(b)choose(+b.dataset.i);
  });
  $('acts').addEventListener('click',e=>{
    const b=e.target.closest('button[data-act]'); if(b&&!b.disabled)doAct(b.dataset.act);
  });
  $('tabs').addEventListener('click',e=>{
    const b=e.target.closest('button[data-tab]'); if(b){G.tab=b.dataset.tab;render();}
  });
  $('epilog').addEventListener('click',e=>{
    const b=e.target.closest('button[data-go]'); if(!b)return;
    if(b.dataset.go==='new')newGame();
    if(b.dataset.go==='cancel')$('overlay').classList.add('hidden');
    if(b.dataset.go==='lanjut'){ const s=loadSave(); $('overlay').classList.add('hidden'); if(s)resumeGame(s); else newGame(); }
    if(b.dataset.go==='barubaru'){ clearSave(); $('overlay').classList.add('hidden'); newGame(); }
  });
  $('restartBtn').addEventListener('click',()=>{
    if(!P){newGame();return;}
    if(G.over){newGame();return;}
    $('epilog').innerHTML='<h2 style="color:var(--ink)">MULAI BERKAS BARU?</h2>'+
      '<div class="sub">Perjalanan '+P.nama+' akan ditinggalkan dan tidak bisa kembali.</div>'+
      '<div class="row2"><button data-go="new">Ya, Berkas Baru</button><button data-go="cancel" class="ghost">Batal</button></div>';
    $('overlay').classList.remove('hidden');
  });
  document.addEventListener('keydown',e=>{
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
    const ov=$('overlay');
    if(!ov.classList.contains('hidden')){
      if(e.key==='Escape'){ const c=ov.querySelector('button[data-go="cancel"]'); if(c){e.preventDefault();c.click();} }
      else if(e.key==='Tab'){ const bs=[...ov.querySelectorAll('button')]; if(bs.length){ const i=bs.indexOf(document.activeElement); let j=e.shiftKey?i-1:i+1; if(i<0||j>=bs.length)j=0; if(j<0)j=bs.length-1; e.preventDefault(); bs[j].focus(); } }
      return;
    }
    if(G.current){
      const n=+e.key;
      if(n>=1&&n<=9&&G.current.opts[n-1]){e.preventDefault();choose(n-1);}
    }
    else if(P&&!G.current&&!G.over&&(e.key===' '||e.key==='Enter')&&document.activeElement.tagName!=='BUTTON'){ e.preventDefault(); advance(); }
  });
}
(function boot(){
  const s=loadSave();
  if(s&&s.P&&s.N&&s.P.f&&s.N.e&&!s.over)showResumePrompt(s);   /* hanya perang yang sudah dimulai */
  else { if(s)clearSave(); newGame(); }
})();
