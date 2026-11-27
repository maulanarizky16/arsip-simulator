'use strict';
/* ================= SIMPAN / MUAT ================= */
const STORE_SAVE='arsip_kehidupan_save_v1';
function saveGame(){
  if(!P)return;
  try{ localStorage.setItem(STORE_SAVE,JSON.stringify({v:1,P,feed:G.feed,tab:G.tab,over:G.over,ts:Date.now()})); }catch(e){}
}
function loadSave(){
  try{ const raw=localStorage.getItem(STORE_SAVE); return raw?JSON.parse(raw):null; }catch(e){ return null; }
}
function clearSave(){ try{ localStorage.removeItem(STORE_SAVE); }catch(e){} }
function renderFeedItem(f){
  if(!hasDoc)return;
  let d=document.createElement('div');
  if(f.yr!==undefined){ d.className='yr'; d.textContent=f.yr; }
  else if(f.stamp!==undefined){ d.className='stamp'+(f.kind?' '+f.kind:''); d.textContent=f.stamp; }
  else { d.className='e '+(f.cls||''); d.innerHTML=f.html; }
  $('feed').appendChild(d);
}
function resumeGame(s){
  P=s.P;
  /* migrasi save lama: aset dulu array string + ada P.tanah/P.kpr terpisah */
  if(!Array.isArray(P.aset))P.aset=[];
  if(P.aset.some(a=>typeof a!=='object'||a===null))P.aset=P.aset.filter(a=>a&&typeof a==='object');
  if(P.politik===undefined)P.politik=null;
  if(typeof P.pamor!=='number')P.pamor=50;
  if(typeof P.korup!=='number')P.korup=0;
  if(typeof P.korupTotal!=='number')P.korupTotal=0;
  if(P.nafkah===undefined)P.nafkah=null;
  /* migrasi field baru: default-kan agar save lama tidak menulis NaN saat drift */
  if(typeof P.ipk!=='number')P.ipk=0;
  if(typeof P.reputasiKerja!=='number')P.reputasiKerja=50;
  if(typeof P.mental!=='number')P.mental=60;
  if(typeof P.nikotin!=='number')P.nikotin=0;
  if(typeof P.integritas!=='number')P.integritas=60;
  if(typeof P.finansialIQ!=='number')P.finansialIQ=0;
  if(typeof P.maxLv!=='number')P.maxLv=P.job?P.job.level:0;
  if(typeof P.penjara!=='number')P.penjara=0;
  if(typeof P.pailit!=='number')P.pailit=0;
  for(const b of (P.biz||[]))if(typeof b.goodwill!=='number')b.goodwill=0;
  G.current=null; G.queue=[]; G.over=s.over||false; G.feed=s.feed||[]; G.tab=s.tab||'diri'; G.acted=0; G.mkt={biz:1,label:null};
  if(hasDoc){
    $('feed').innerHTML=''; $('kartu').innerHTML='';
    $('overlay').classList.add('hidden');
    $('noArsip').textContent=P.arsipNo||('No. Arsip 000000/'+P.lahir);
    for(const f of G.feed)renderFeedItem(f);
    $('feed').scrollTop=$('feed').scrollHeight;
  }
  render();
}
function showResumePrompt(s){
  if(!hasDoc){ resumeGame(s); return; }
  const p=s.P;
  $('epilog').innerHTML='<h2 style="color:var(--ink)">KEHIDUPAN TERSIMPAN</h2>'+
    '<div class="sub">Masih ada berkas <b>'+p.nama+'</b> — '+p.age+' tahun, '+p.kota+'. Mau dilanjutkan atau mulai hidup baru?</div>'+
    '<div class="row2"><button data-go="lanjut">Lanjutkan</button><button data-go="barubaru" class="ghost">Mulai Baru</button></div>';
  $('overlay').classList.remove('hidden');
}

