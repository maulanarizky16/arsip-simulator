'use strict';
/* ================= SIMPAN / MUAT ================= */
const STORE_SAVE='arsip_perang_save_v1';
function saveGame(){
  if(!P||!N||!P.f||!N.e)return;      /* penyiapan (pilih negara/lawan) belum perlu disimpan */
  try{ localStorage.setItem(STORE_SAVE,JSON.stringify({v:1,P,N,feed:G.feed,tab:G.tab,over:G.over,ts:Date.now()})); }catch(e){}
}
function loadSave(){
  try{ const raw=localStorage.getItem(STORE_SAVE); return raw?JSON.parse(raw):null; }catch(e){ return null; }
}
function clearSave(){ try{ localStorage.removeItem(STORE_SAVE); }catch(e){} }
function renderFeedItem(f){
  if(!hasDoc)return;
  const d=document.createElement('div');
  if(f.yr!==undefined){ d.className='yr'; d.textContent=f.yr; }
  else { d.className='e'+(f.cls?' '+f.cls:''); d.innerHTML=f.html; }
  $('feed').appendChild(d);
}
function resumeGame(s){
  P=s.P; N=s.N;
  if(!P.cd)P.cd={}; if(!P.pesanan)P.pesanan=[]; if(!P.used)P.used={};
  G.current=null; G.queue=[]; G.over=s.over||false; G.feed=s.feed||[]; G.tab=s.tab||'darat'; G.acted=0;
  if(hasDoc){
    $('feed').innerHTML=''; $('kartu').innerHTML='';
    $('overlay').classList.add('hidden');
    $('noArsip').textContent=P.arsipNo||'Berkas No. —';
    for(const f of G.feed)renderFeedItem(f);
    $('feed').scrollTop=$('feed').scrollHeight;
  }
  render();
}
function showResumePrompt(s){
  if(!hasDoc){ resumeGame(s); return; }
  const p=s.P;
  $('epilog').innerHTML='<h2 style="color:var(--ink)">PERANG BELUM SELESAI</h2>'+
    '<div class="sub">Perang <b>Jenderal '+p.nama+'</b> ('+NEG[p.neg].n+' melawan '+NEG[p.lawan].n+', minggu ke-'+s.N.minggu+') belum selesai. Lanjutkan atau buka berkas baru?</div>'+
    '<div class="row2"><button data-go="lanjut">Lanjutkan</button><button data-go="barubaru" class="ghost">Berkas Baru</button></div>';
  $('overlay').classList.remove('hidden');
}
