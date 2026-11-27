'use strict';
/* ================= SIMPAN / MUAT ================= */
const STORE_SAVE='arsip_wni_save_v1';
function saveGame(){
  if(!P||!N)return;
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
  P=s.P;
  if(typeof P.umrF!=='number')P.umrF=1;   /* save lama: gaji belum ikut UMR kota */ N=s.N;
  G.current=null; G.queue=[]; G.over=s.over||false; G.feed=s.feed||[]; G.tab=s.tab||'diri'; G.acted=0;
  if(hasDoc){
    $('feed').innerHTML=''; $('kartu').innerHTML='';
    $('overlay').classList.add('hidden');
    $('noArsip').textContent=P.arsipNo||'NIK —';
    for(const f of G.feed)renderFeedItem(f);
    $('feed').scrollTop=$('feed').scrollHeight;
  }
  render();
}
function showResumePrompt(s){
  if(!hasDoc){ resumeGame(s); return; }
  const p=s.P, n=s.N;
  $('epilog').innerHTML='<h2 style="color:var(--ink)">PERJUANGAN BELUM SELESAI</h2>'+
    '<div class="sub">Masih ada perjalanan <b>'+p.nama+'</b> ('+(p.latarN||'warga')+') — bulan ke-'+n.ke+' dari 36, saldo '+rp(p.saldo)+'. Lanjutkan atau mulai hidup baru?</div>'+
    '<div class="row2"><button data-go="lanjut">Lanjutkan</button><button data-go="barubaru" class="ghost">Hidup Baru</button></div>';
  $('overlay').classList.remove('hidden');
}
