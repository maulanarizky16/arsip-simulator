'use strict';
/* ================= SIMPAN / MUAT ================= */
const STORE_SAVE='arsip_it_save_v1';
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
  P=s.P; N=s.N;
  migrasiSertifikat();   /* save lama: cloud/cka/ccnp/oscp/pmp → jalur + grade */
  G.current=null; G.queue=[]; G.over=s.over||false; G.feed=s.feed||[]; G.tab=s.tab||'skill'; G.acted=0;
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
  const jl=p.dipecat?'eks-engineer':(p.retired?'pensiunan':((JAB[p.jab]?JAB[p.jab].n:'engineer')+' '+(p.spesN||'')));
  $('epilog').innerHTML='<h2 style="color:var(--ink)">BERKAS BELUM DITUTUP</h2>'+
    '<div class="sub">Masih ada perjalanan <b>'+p.nama+'</b> — '+p.age+' th, '+jl+'. Lanjutkan atau mulai berkas baru?</div>'+
    '<div class="row2"><button data-go="lanjut">Lanjutkan</button><button data-go="barubaru" class="ghost">Berkas Baru</button></div>';
  $('overlay').classList.remove('hidden');
}
