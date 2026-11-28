'use strict';
/* ================= STATE =================
   P = pihak pemain (panglima & negaranya) · N = keadaan perang, termasuk N.e = pihak lawan */
let P=null, N=null;
const G={current:null, queue:[], over:false, feed:[], tab:'darat', acted:0};
const MAKS_PERINTAH=3;          /* staf komando hanya sanggup menjalankan 3 perintah khusus per minggu */
const MAKS_MINGGU=78;                /* 1,5 tahun: setelah itu garis depan membeku */

/* ===== PETA DUNIA: catatan yang bertahan antarperang =====
   Negara yang kalah total (ibu kotanya jatuh / menyerah tanpa syarat) menjadi abu-abu di peta dan tidak bisa dipilih lagi,
   sampai pemain memulihkan peta. Disimpan terpisah dari save perang yang sedang berjalan. */
const STORE_DUNIA='arsip_perang_dunia_v1';
function dunia(){
  try{ const o=JSON.parse(localStorage.getItem(STORE_DUNIA)); if(o&&o.kalah)return o; }catch(e){}
  return {kalah:{}};
}
function sudahKalah(k){ return !!dunia().kalah[k]; }
function tandaiKalah(k,oleh,sebab){
  const d=dunia(); if(d.kalah[k])return;
  d.kalah[k]={oleh:oleh||null,sebab:sebab||'kalah perang',tahun:N?N.tahun+Math.floor((N.minggu-1)/52):null};
  try{ localStorage.setItem(STORE_DUNIA,JSON.stringify(d)); }catch(e){}
}
function pulihkanDunia(){ try{ localStorage.removeItem(STORE_DUNIA); }catch(e){} }
function negaraHidup(){ return NEGARA.filter(c=>!sudahKalah(c.k)); }
function pasukanAwal(c){
  return {pasukan:c.aktif, cad:c.cad, tank:c.tank, jet:c.jet, heli:c.heli, kapal:c.kapal, selam:c.selam, induk:c.induk,
    drone:Math.round(clamp(20+c.hankam*3*(c.tek/60),20,3000)), rudal:Math.round(clamp(10+c.hankam*1.5,10,1500))};
}
function newGame(){
  if(window.ArsipArt&&ArsipArt.creator('perang',newGame))return;   /* pop-up buat karakter dulu */
  const ID=window.ArsipArt?ArsipArt.identity():{};
  const g=ID.gender||(r()<0.7?'L':'P');
  N={ tahun:2026, minggu:0, front:0, udara:0, laut:0, cuaca:'cerah', eskalasi:0, seberang:false, tahan:0, e:null };
  P={
    nama:ID.nama||namaOrang(g), gender:g, age:ri(48,58), alive:true, sebab:null, hasil:null,
    neg:null, lawan:null, tujuan:null, agresor:false,
    f:null, awal:null, st:{moral:70,logistik:80,amunisi:85,publik:65,dunia:50},
    post:{d:'bertahan',u:'cas',l:'kawal'}, fort:0, dana:0,
    tewas:0, tewasLawan:0, sipilKita:0, sipilLawan:0, kejahatan:0, koridor:0, tawananBaik:0,
    mobil:0, intel:0, evakuasi:0, pesanan:[], cd:{}, tawarDamai:0, bantuan:0, puncakUdara:0, puncakLaut:0, minusDana:0,
    riwayat:[], ach:{}, used:{}
  };
  if(ID.skin)P.skin=ID.skin;
  P.arsipNo='Berkas No. '+ri(10000,99999)+'/PRG/'+N.tahun;
  G.current=null; G.queue=[]; G.over=false; G.feed=[]; G.tab='darat'; G.acted=0;
  if(hasDoc){
    $('feed').innerHTML=''; $('kartu').innerHTML='';
    $('overlay').classList.add('hidden');
    $('noArsip').textContent=P.arsipNo;
  }
  if(negaraHidup().length<2){ pulihkanDunia(); addLog('Hampir semua negara di peta sudah tumbang. Peta dunia dipulihkan untuk babak baru.','sys'); }
  addLog('Ruang komando. <b>Jenderal '+P.nama+'</b> membuka map bertanda RAHASIA. <span class="d">Simulasi ini hipotetis; kekuatan tiap negara adalah perkiraan dari data terbuka (±2024), bukan ramalan dan bukan anjuran.</span>');
  arahanPerang();
  pilihNegara();
  render();
}
function arahanPerang(){
  try{ if(localStorage.getItem('arsip_arahan_prg_v1'))return; localStorage.setItem('arsip_arahan_prg_v1','1'); }catch(e){}
  caraMain();
}
function caraMain(){
  ask({title:'CARA MAIN',text:'Anda panglima perang. Pilih negara, lawan, dan tujuan perang; kekuatan awal mengikuti data nyata (perkiraan).<br><br>'+
    '<b>1.</b> Waktu berjalan <b>per minggu</b>. Tiap minggu tetapkan <b>postur</b> tiga matra: Darat, Udara, Laut. Postur bertahan terus sampai Anda ubah.<br>'+
    '<b>2.</b> Selain postur, Anda punya <b>'+MAKS_PERINTAH+' perintah khusus per minggu</b>: mobilisasi, serangan rudal, operasi khusus, beli senjata, diplomasi, intelijen, dan lainnya.<br>'+
    '<b>3.</b> Perang dimenangkan oleh <b>logistik, amunisi, dan moral</b>, bukan jumlah tank saja. Menyerbu negara seberang laut butuh penguasaan laut. Negara bersenjata nuklir tidak bisa dipojokkan tanpa risiko.<br>'+
    '<b>4.</b> Di akhir Anda dinilai dua sisi: <b>Kemenangan</b> (tercapaikah tujuan, semahal apa) dan <b>Kemanusiaan</b> (korban sipil, kejahatan perang, kesediaan berdamai).',
    opts:[{t:'Mengerti »',e:()=>{}}]});
}
/* ================= PENYIAPAN PERANG ================= */
function ringkasNegara(c){
  return org(c.aktif)+' personel · '+bil(c.tank)+' tank · '+bil(c.jet)+' jet · '+bil(c.kapal)+' kapal'+(c.selam?' · '+c.selam+' selam':'')+(c.induk?' · '+c.induk+' kapal induk':'')+(c.nuklir?' · NUKLIR':'')+' · indeks '+bil(daya(c));
}
function pilihNegara(){
  const mati=NEGARA.length-negaraHidup().length;
  ask({title:'PILIH NEGARA',text:'Negara mana yang Anda pimpin? Angka adalah perkiraan kekuatan militer dari data terbuka.'+(mati?' <b>'+mati+' negara</b> sudah kalah di perang sebelumnya (abu-abu di peta) dan tidak bisa dipilih.':''),
    opts:negaraHidup().map(c=>({t:c.n,sub:ringkasNegara(c),e:()=>{ P.neg=c.k; pilihLawan(false); }}))});
}
function tingkatSulit(c,l){ const x=daya(l)/daya(c); return x>=2.5?'nyaris mustahil':x>=1.5?'sangat berat':x>=1.1?'berat':x>=0.8?'seimbang':x>=0.5?'unggul':'jauh unggul'; }
function pilihLawan(semua){
  const c=NEG[P.neg];
  let list=negaraHidup().filter(x=>x.k!==c.k);
  if(!semua){
    /* tetangga & sekawasan dulu, diurutkan dari yang kekuatannya paling dekat */
    list=list.filter(x=>x.kaw===c.kaw||berbatasan(c.k,x.k)).sort((a,b)=>Math.abs(Math.log(daya(a)/daya(c)))-Math.abs(Math.log(daya(b)/daya(c)))).slice(0,6);
  }
  const opts=list.map(l=>({t:l.n,sub:tingkatSulit(c,l)+' · '+(berbatasan(c.k,l.k)?'berbatasan darat':'terpisah laut')+' · '+ringkasNegara(l),e:()=>{ P.lawan=l.k; pilihTujuan(); }}));
  if(!semua&&negaraHidup().length-1>list.length)opts.push({t:'Negara lain (daftar lengkap)',e:()=>pilihLawan(true)});
  if(!opts.length){ pulihkanDunia(); pilihLawan(false); return; }
  ask({title:'PILIH LAWAN',text:'<b>'+c.n+'</b> (indeks kekuatan '+bil(daya(c))+') akan berhadapan dengan siapa? Ini skenario hipotetis, bukan gambaran hubungan nyata antarnegara.',opts});
}
function pilihTujuan(){
  ask({title:'TUJUAN PERANG',text:'Perang tanpa tujuan jelas tidak pernah selesai. Apa sasaran Anda?',
    opts:Object.keys(TUJUAN).map(k=>({t:TUJUAN[k].n,sub:TUJUAN[k].d,e:()=>mulaiPerang(k)}))});
}
function mulaiPerang(tj){
  const c=NEG[P.neg], l=NEG[P.lawan];
  P.tujuan=tj; P.agresor=tj!=='bertahan';
  P.f=pasukanAwal(c); P.awal=Object.assign({},P.f);
  P.st={moral:tj==='bertahan'?78:68, logistik:tj==='bertahan'?70:82, amunisi:85, publik:tj==='bertahan'?80:tj==='sengketa'?62:55, dunia:tj==='bertahan'?66:tj==='sengketa'?42:30};
  P.post={d:tj==='bertahan'?'bertahan':'tekan',u:'cas',l:'kawal'};
  P.dana=Math.round(c.hankam*1000*0.12);
  N.seberang=!berbatasan(c.k,l.k);
  N.front=tj==='bertahan'?-25:0;
  N.e={k:l.k, f:pasukanAwal(l), awal:null, st:{moral:tj==='bertahan'?72:76, logistik:tj==='bertahan'?70:80, amunisi:85, tekad:tj==='bertahan'?66:tj==='sengketa'?78:92},
    post:{d:tj==='bertahan'?'ofensif':'bertahan',u:'cas',l:'kawal'}, fort:tj==='bertahan'?0:1, sifat:pick(SIFAT).k, mobil:0};
  N.e.awal=Object.assign({},N.e.f);
  N.minggu=1;
  yearHeader();
  const sf=SIFAT.find(s=>s.k===N.e.sifat);
  addLog('<b>'+c.n+'</b> berperang melawan <b>'+l.n+'</b>. Tujuan: <b>'+TUJUAN[tj].n+'</b>. '+(N.seberang?'Kedua negara terpisah laut — tanpa penguasaan laut, pasukan tidak bisa maju jauh.':'Kedua negara berbatasan darat.')+
    ' Intelijen menilai panglima lawan <b>'+sf.n+'</b>: '+sf.d+'.','sys');
  if(tj==='bertahan')addLog('Pasukan '+l.n+' sudah menembus perbatasan dan menduduki sebagian wilayah Anda.','bad');
  if(l.nuklir||c.nuklir)addLog('Peringatan: '+(l.nuklir&&c.nuklir?'kedua pihak':l.nuklir?l.n:c.n)+' memiliki senjata nuklir. Memojokkan negara bernuklir bisa berakhir tanpa pemenang.','bad');
  milestone(c.n+' vs '+l.n+' — '+TUJUAN[tj].n);
  if(daya(l)/daya(c)>=1.5)P.underdog=true;
}

/* ================= LOG ================= */
function tanggalPerang(){ return 'MINGGU KE-'+N.minggu+' · '+(N.tahun+Math.floor((N.minggu-1)/52)); }
function yearHeader(){
  const h=tanggalPerang();
  G.feed.push({yr:h});
  if(hasDoc){ const d=document.createElement('div'); d.className='yr'; d.textContent=h; $('feed').appendChild(d); $('feed').scrollTop=$('feed').scrollHeight; }
}
function addLog(html,cls){
  G.feed.push({html,cls});
  if(!hasDoc)return;
  const d=document.createElement('div'); d.className='e'+(cls?' '+cls:''); d.innerHTML=html;
  $('feed').appendChild(d); $('feed').scrollTop=$('feed').scrollHeight;
}
function stamp(t,kind){
  if(!hasDoc)return;
  const d=document.createElement('div'); d.className='stamp'+(kind?' '+kind:''); d.textContent=t;
  $('feed').appendChild(d); $('feed').scrollTop=$('feed').scrollHeight;
}
function milestone(t){ P.riwayat.push({th:N&&N.minggu?'Mg '+N.minggu:'—',t}); }
function ach(k){
  if(P.ach[k])return;
  P.ach[k]=true;
  addLog('TANDA JASA TERBUKA: <b>'+ACH_DEF[k]+'</b>','good');
  stamp(ACH_DEF[k].toUpperCase(),'gold');
}
const LBL={moral:'Moral pasukan',logistik:'Logistik',amunisi:'Amunisi',publik:'Dukungan rakyat',dunia:'Dukungan dunia'};
/* efek ke pihak pemain + teks delta. kunci khusus: dana, eskalasi, tekad (lawan), mLog/mAmu/mMoral (lawan) */
function fx(o){
  const parts=[];
  for(const k in o){
    const v=o[k];
    if(k==='dana'){ P.dana+=v; parts.push('Dana '+(v>=0?'+':'−')+usd(Math.abs(v)).replace('US$ ','')); }
    else if(k==='eskalasi'){ N.eskalasi=clamp(N.eskalasi+v,0,100); parts.push('Eskalasi nuklir '+tanda(v)); }
    else if(k==='tekad'){ N.e.st.tekad=clamp(N.e.st.tekad+v,0,100); parts.push('Tekad lawan '+tanda(v)); }
    else if(k==='mLog'){ N.e.st.logistik=clamp(N.e.st.logistik+v,0,100); parts.push('Logistik lawan '+tanda(v)); }
    else if(k==='mAmu'){ N.e.st.amunisi=clamp(N.e.st.amunisi+v,0,100); parts.push('Amunisi lawan '+tanda(v)); }
    else if(k==='mMoral'){ N.e.st.moral=clamp(N.e.st.moral+v,0,100); parts.push('Moral lawan '+tanda(v)); }
    else if(k==='front'){ N.front=clamp(N.front+v,-100,100); parts.push('Garis depan '+tanda(v)); }
    else { P.st[k]=clamp(P.st[k]+v,0,100); parts.push(LBL[k]+' '+tanda(v)); }
  }
  return ' <span class="d">('+parts.join(', ')+')</span>';
}
/* sekali-sekali: kejadian & aksi berkunci jeda (minggu) */
function siap(k,cd){ return !P.cd[k]||N.minggu-P.cd[k]>=cd; }
function pakai(k){ P.cd[k]=N.minggu; }

/* ================= KARTU ================= */
function ask(d){
  d.opts=d.opts.filter(o=>!o.cond||o.cond());
  if(!d.opts.length)d.opts=[{t:'Lanjut',e:()=>{}}];
  if(G.current)G.queue.push(d); else {G.current=d; renderKartu();}
}
function choose(i){
  if(!G.current||G.over)return;
  const cur=G.current; G.current=null;
  if(hasDoc)$('kartu').innerHTML='';
  (cur.opts[i]||cur.opts[0]).e();
  if(P&&P.f&&!G.over)cekAkhir();
  if(!G.current && G.queue.length && !G.over){G.current=G.queue.shift(); renderKartu();}
  render();
}
