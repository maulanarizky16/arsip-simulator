'use strict';
/* ================= STATE ================= */
let P=null, N=null;
const G={current:null, queue:[], over:false, feed:[], tab:'sidang', acted:0};

function newGame(){
  if(window.ArsipArt&&ArsipArt.creator('hakim',newGame))return;   /* pop-up buat karakter dulu */
  const ID=window.ArsipArt?ArsipArt.identity():{};
  const g=ID.gender||(r()<0.6?'L':'P');
  N={ tahun:2004, kepercayaan:50 };
  P={
    nama:(g==='L'?pick(NAMA_L):pick(NAMA_P))+' '+pick(BLK), gelar:'S.H., M.H.', gender:g, kota:pick(KOTA),
    age:28, lahir:1976, alive:true, sebab:null,
    st:{integritas:ri(55,75),kompetensi:ri(45,65),reputasi:ri(18,32),nyali:ri(40,65),stres:ri(8,20),kesehatan:ri(78,93)},
    money:0, gelap:0,
    jab:'pn', tipikor:false, posisi:'PN '+pick(KOTA), tahunJab:0, maxLv:1,
    perkara:0, adil:0, takadil:0, suapTerima:0, vonisMati:0, dissent:0, mediasi:0, suapTotal:0,
    study:0,
    heat:0, vonis:false, penjara:0, dipecat:false, retired:false,
    keadilanLeg:0, kuasaLeg:0, sumRep:0, years:0,
    koneksi:0, mundur:0, taatKaidah:0, bidik:0,
    keluarga:false, anak:0,
    riwayat:[], ach:{}, used:{}
  };
  if(ID.nama)P.nama=ID.nama;
  if(ID.skin)P.skin=ID.skin;
  P.arsipNo='Berkas No. '+ri(10000,99999)+'/HKM/'+N.tahun;
  G.current=null; G.queue=[]; G.over=false; G.feed=[]; G.tab='sidang'; G.acted=0;
  if(hasDoc){
    $('feed').innerHTML=''; $('kartu').innerHTML='';
    $('overlay').classList.add('hidden');
    $('noArsip').textContent=P.arsipNo;
  }
  yearHeader();
  addLog('Tahun '+N.tahun+'. Setelah lulus ujian dan diklat, <b>'+P.nama+', '+P.gelar+'</b> ('+P.age+' th) dilantik sebagai <b>Hakim Pengadilan Negeri</b> di '+P.posisi+'. Palu pertama menanti.');
  milestone('Dilantik sebagai Hakim PN');
  ach('pn');
  if(!G._continuing)arahanHakim();
  render();
}
function arahanHakim(){
  try{ if(localStorage.getItem('arsip_arahan_hkm_v1'))return; localStorage.setItem('arsip_arahan_hkm_v1','1'); }catch(e){}
  caraMain();
}
function caraMain(){
  ask({title:'CARA MAIN',text:'Selamat datang. Kamu seorang hakim, dari Pengadilan Negeri sampai (mungkin) Ketua Mahkamah Agung.<br><br>'+
    '<b>1.</b> Tiap tahun kamu memimpin sidang: baca perkara, timbang <b>bukti</b>, lalu <b>ketuk palu</b>. Putusan yang adil menjaga integritas; tekanan & suap menggoda di tiap perkara.<br>'+
    '<b>2.</b> Pilih juga aksi di Meja (Diri, Karier, Integritas, Uang), lalu tekan <b>"Jalani Tahun +1"</b>.<br>'+
    '<b>3.</b> Di akhir, kamu dinilai dua sisi: <b>Keadilan</b> (apakah hukum kamu tegakkan) dan <b>Karier & Kuasa</b> (setinggi apa kamu naik, sebanyak apa hartamu). Bisa adil tapi miskin, atau berkuasa tapi tercatat sebagai mafia peradilan.',
    opts:[{t:'Mengerti, mulai bertugas »',e:()=>{}}]});
}

/* ================= LOG ================= */
function yearHeader(){
  const h='TAHUN '+N.tahun+' — USIA '+P.age;
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
function milestone(t){ P.riwayat.push({th:N?N.tahun:'-',t}); }
function ach(k){
  if(P.ach[k])return;
  P.ach[k]=true;
  addLog('TANDA JASA TERBUKA: <b>'+ACH_DEF[k]+'</b>','good');
  stamp(ACH_DEF[k].toUpperCase(),'gold');
}
const LBL={integritas:'Integritas',kompetensi:'Kompetensi',reputasi:'Reputasi',nyali:'Nyali',stres:'Stres',kesehatan:'Kesehatan'};
function fx(o){
  const parts=[];
  for(const k in o){
    if(k==='money'){ P.money+=o[k]; parts.push('Harta '+(o[k]>=0?'+':'')+rp(o[k]).replace('Rp ','')); }
    else if(k==='gelap'){ P.gelap+=o[k]; if(o[k]>0)P.suapTotal+=o[k]; parts.push('Uang ketok '+(o[k]>=0?'+':'')+rp(o[k]).replace('Rp ','')); }
    else if(k==='heat'){ P.heat=clamp(P.heat+o[k],0,100); parts.push('Sorotan KY/KPK '+(o[k]>=0?'+':'')+o[k]); }
    else if(k==='trust'){ N.kepercayaan=clamp(N.kepercayaan+o[k],0,100); parts.push('Kepercayaan publik '+(o[k]>=0?'+':'')+o[k]); }
    else { P.st[k]=clamp(P.st[k]+o[k],0,100); parts.push(LBL[k]+' '+(o[k]>=0?'+':'')+o[k]); }
  }
  return ' <span class="d">('+parts.join(', ')+')</span>';
}
/* legasi ganda: Keadilan (rakyat/hukum) vs Karier & Kuasa */
function leg(adil,kuasa){ P.keadilanLeg=clamp(P.keadilanLeg+adil,-80,80); P.kuasaLeg=clamp(P.kuasaLeg+kuasa,-80,80); }

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
  if(!G.current && G.queue.length){G.current=G.queue.shift(); renderKartu();}
  render();
}

/* gaji setahun. Sebelum reformasi tunjangan hakim (PP 94/2012) penghasilan hakim jauh lebih kecil. */
function gajiNow(){ return Math.round(JAB[P.jab].gaji*(N.tahun<2013?0.4:1)); }
/* biaya hidup keluarga hakim: 55% gaji + 5% per anak, plus pajak 10% → sisa tabungan 20–35% gaji */
function biayaHidup(g){ return Math.round(g*(0.65+0.05*Math.min(P.anak||0,3))); }
/* skala uang suap menurut jenjang: PN ratusan juta, MA miliaran */
function skalaSuap(){ return [0,1,3,8,14][lvNow()]||1; }
/* ================= DRIFT PRIBADI & PERADILAN ================= */
function drift(){
  const s=P.st;
  P.sumRep+=s.reputasi; P.years++;
  if(P.age>55)s.kesehatan=clamp(s.kesehatan-1,0,100);
  if(P.age>68)s.kesehatan=clamp(s.kesehatan-1,0,100);
  if(s.stres>70)s.kesehatan=clamp(s.kesehatan-3,0,100);
  /* stres mereda makin cepat saat makin tinggi (dulu −2/thn: hakim teliti macet di 100 lalu mati sakit) */
  s.stres=clamp(s.stres-2-Math.floor(Math.max(0,s.stres-40)/10),0,100);
  s.reputasi=clamp(Math.round(s.reputasi+(26-s.reputasi)*0.04),0,100);
  P.heat=clamp(P.heat-3,0,100);
  /* di penjara */
  if(P.penjara>0){
    P.penjara--;
    addLog('Setahun lagi berlalu di balik jeruji. Sisa masa tahanan: '+P.penjara+' tahun.','sys');
    if(P.penjara<=0){ addLog('<b>Anda bebas</b> dari lapas. Tapi nama besar sebagai hakim sudah jadi abu.','sys'); stamp('BEBAS','green'); milestone('Bebas dari lapas'); }
    return;
  }
  /* gaji jabatan dikurangi biaya hidup keluarga (tabungan bersih ±1/3 gaji); pensiunan menerima uang pensiun yang pas untuk hidup */
  if(P.jab&&!P.retired){ const g=gajiNow(); P.money+=g-biayaHidup(g); P.tahunJab++; }
  /* studi doktoral berjalan */
  if(P.study>0){
    P.study--;
    if(P.study<=0){ P.gelar='Dr. '+P.gelar; ach('doktor'); milestone('Meraih gelar Doktor Ilmu Hukum');
      addLog('Disertasi Anda dipertahankan di sidang terbuka. Kini <b>'+P.nama+', '+P.gelar+'</b> — seorang Doktor Ilmu Hukum.'+fx({kompetensi:+8,reputasi:+6}),'good'); leg(1,2); }
    else addLog('Studi doktoral berlanjut di sela jadwal sidang. Sisa '+P.study+' tahun.','sys');
  }
  /* kepercayaan publik condong ke 50, ditarik oleh integritas pribadi & rekam adil */
  const tTarget=clamp(40+(s.integritas-50)/4+(P.adil-P.takadil)*0.5,0,100);
  N.kepercayaan=clamp(N.kepercayaan+(tTarget>N.kepercayaan?1:-1),0,100);
  /* harta tak wajar saat sorotan */
  if(P.gelap>5e9&&r()<0.3){
    addLog('Media membandingkan LHKPN Anda dengan rumah & mobil keluarga. Angkanya tidak masuk akal.'+fx({heat:+8,reputasi:-3}),'bad');
  }
}
