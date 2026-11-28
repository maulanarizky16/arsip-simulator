'use strict';
/* ================= NAFKAH, CARI KERJA, SAMPINGAN & SOFTWARE HOUSE =================
   - Karier dimulai TANPA pekerjaan: pemain melamar, dipanggil wawancara, baru diterima (atau tidak).
   - Uang tidak lagi menumpuk begitu saja: gaji mengikuti zaman, dipotong pajak & biaya hidup.
   - Usaha sampingan kecil (P.sampingan) dan software house sendiri dengan klien (P.sh). */

/* ---------- ZAMAN: gaji & harga ---------- */
/* tabel JAB memakai angka ±2024. Tahun 2008 gaji IT sekitar separuhnya; setelah 2024 naik ±3%/tahun. */
function eraGaji(){ const t=N?N.tahun:2024; return +(clamp(0.5+(t-2008)/32,0.5,1)*(t>2024?Math.pow(1.03,t-2024):1)).toFixed(3); }
/* harga kebutuhan naik ±4,5%/tahun sampai 2024, lalu seirama dengan gaji (±3%/tahun) */
function eraHarga(){ const t=N?N.tahun:2008; return +(Math.pow(1.045,Math.min(t,2024)-2008)*Math.pow(1.03,Math.max(0,t-2024))).toFixed(3); }
function faktorGaji(){ return eraGaji(); }             /* dipakai 03c-tim.js untuk gaji pasar anggota tim */
function bulatJt(x){ return Math.round(x/1e5)*1e5; }
/* PPh orang pribadi, disederhanakan: PTKP lalu 5% / 15% / 25% / 30% (batas ikut zaman) */
function pajakIT(g){
  const e=eraHarga()/2;                                  /* ±1 pada 2024 */
  let kena=Math.max(0,g-54e6*e), p=0;
  for(const [batas,tarif] of [[60e6*e,0.05],[190e6*e,0.15],[250e6*e,0.25],[Infinity,0.30]]){ const x=Math.min(kena,batas); p+=x*tarif; kena-=x; if(kena<=0)break; }
  return Math.round(p);
}
/* biaya hidup setahun: kebutuhan dasar (ikut harga & keluarga) + gaya hidup yang naik bersama penghasilan */
function biayaHidupIT(bersih){
  let dasar=24e6*eraHarga()*(P.keluarga?1.2:1)+(P.anak||0)*6e6*eraHarga();   /* pasangan dianggap ikut menanggung sebagian */
  if(!kerjaAktif()&&!P.retired)dasar*=0.75;              /* menganggur: mengencangkan ikat pinggang */
  if(P.money<0)dasar*=0.7;                               /* tabungan minus: numpang & makan seadanya */
  return Math.round(dasar+Math.max(0,bersih-dasar)*0.3);
}
/* dipanggil dari drift(): menerima gaji (bila ada), lalu membayar pajak & biaya hidup */
function nafkahTahunan(){
  let g=0;
  if(!P.retired&&P.jab&&kerjaAktif()&&P.tempat!=='softwarehouse'){ g=gajiTahun(); P.tahunJab++; P.tenure=(P.tenure||0)+1; }
  else if(P.tempat==='softwarehouse'&&kerjaAktif()){ P.tahunJab++; P.tenure=(P.tenure||0)+1; }
  /* pensiunan hidup dari uang pensiun & JHT; yang tercoreng (tak bisa lagi kerja di industri) hidup dari kerja serabutan */
  let lain=0, lainTxt='';
  if(P.retired){ lain=bulatJt(JAB[P.jab].gaji*eraGaji()*0.3); lainTxt='Uang pensiun & JHT'; }
  else if(P.dipecat){ lain=bulatJt(28e6*eraHarga()); lainTxt='Kerja serabutan di luar industri'; }
  const pajak=pajakIT(g), hidup=biayaHidupIT(g+lain-pajak);
  P.money+=g+lain-pajak-hidup;
  if(g>0)addLog('Gaji setahun '+rp(g)+', pajak '+rp(pajak)+', biaya hidup '+rp(hidup)+'. Sisa yang bisa ditabung: '+rp(g-pajak-hidup)+'.','sys');
  else if(lain>0)addLog(lainTxt+' '+rp(lain)+', biaya hidup '+rp(hidup)+'.','sys');
  else addLog('Tanpa gaji tahun ini. Biaya hidup '+rp(hidup)+' tetap berjalan.','sys');
  tagihUtangIT();
  if(P.money<0){ P.st.stres=clamp(P.st.stres+5,0,100); if(r()<0.6)addLog('Tabungan minus '+rp(-P.money)+'. Anda berutang ke keluarga dan kartu kredit; tidur makin tidak nyenyak.','bad'); }
}

/* utang pribadi tidak bisa menumpuk tanpa batas: investasi dicairkan, usaha yang tak sanggup menggaji bubar,
   lalu sisanya direstrukturisasi (nama masuk daftar hitam, reputasi turun) */
function batasUtangIT(){ return bulatJt(60e6*eraHarga()); }
function tagihUtangIT(){
  if(P.money>=0)return;
  if((P.saham||0)>0){ const x=Math.min(P.saham,-P.money); P.saham-=x; P.money+=x; addLog('Tabungan minus — investasi senilai '+rp(x)+' terpaksa dicairkan.','bad'); }
  const batas=batasUtangIT();
  if(P.money>=-batas)return;
  if(P.founder&&P.tim&&P.tim.anggota.length){ const n=P.tim.anggota.length; P.tim.anggota=[]; addLog('Gaji telat berbulan-bulan. Seluruh '+n+' anggota tim mengundurkan diri.'+fx({reputasi:-3}),'bad'); }
  if(P.sampingan){ P.money+=bulatJt(P.sampingan.modal*0.3); addLog('Peralatan <b>'+P.sampingan.n+'</b> dijual untuk menutup utang.','bad'); P.sampingan=null; }
  if(P.sh&&P.money<-batas){ const nama=P.sh.n, penuh=P.sh.penuh; catatSH(); P.sh=null; addLog('<b>'+nama+'</b> tidak sanggup lagi membayar tagihan dan ditutup.','bad'); milestone('Software house '+nama+' bangkrut'); if(penuh)jadiMenganggur(); }
  if(P.money<-batas){
    const hapus=-P.money-batas; P.money=-batas; P.bangkrutKali=(P.bangkrutKali||0)+1;
    addLog('Utang Anda sudah '+rp(hapus+batas)+'. Bank merestrukturisasi: '+rp(hapus)+' dihapus, sisanya dicicil, dan nama Anda masuk daftar hitam kredit.'+fx({reputasi:-4,stres:+8}),'bad');
    if(P.bangkrutKali===1)milestone('Utang direstrukturisasi');
  }
}

/* ---------- MULAI TANPA KERJA & MENCARI KERJA ---------- */
function mulaiTanpaKerja(){
  P.menganggur=true; P.tempat=null; P.tempatN='Belum bekerja'; P.pernahKerja=false;
  addLog('Ijazah di tangan, belum ada pekerjaan. Buka laci <b>Skill & Karier</b> lalu pilih <b>Lamar kerja</b>; panggilan wawancara tidak datang sendiri.','sys');
}
function jadiMenganggur(){
  lepasEkuitas();   /* keluar dari startup: ekuitas yang belum vesting hangus */
  P.menganggur=true; P.tempat=null; P.tempatN='Menganggur'; P.founder=false; P.tim=null;
}
/* lowongan yang memanggil: jumlahnya tergantung pasar, pengalaman & reputasi */
function daftarPanggilan(){
  let n=N.pasar==='boom'?3:N.pasar==='krisis'?1:2;
  if(!P.pernahKerja)n=Math.max(1,n-1);
  if(P.reputasi>=50)n++;
  if(N.pasar==='krisis'&&r()<0.35)n=0;
  const kuat=P.st.ngoding>=55||P.st.sistem>=55||P.st.keamanan>=55;
  const pool=TEMPAT.filter(t=>t.k!=='remote'||(P.st.soft>=40&&kuat&&N.tahun>=2012)).sort(()=>r()-0.5);
  return pool.slice(0,Math.min(n,3));
}
function gajiDiTempat(tm){ return bulatJt(JAB[P.jab].gaji*tm.gajiX*eraGaji()/12); }
function terimaKerja(tm){
  const pertama=!P.pernahKerja;
  P.tempat=tm.k; P.tempatN=tm.n; P.tahunJab=0; if(!pertama)P.jobHops=(P.jobHops||0)+1; P.pernahKerja=true;
  kondisiKantorBaru();
  if(tm.k==='startup'){ P.ekuitas=(P.ekuitas||0)+esopBaru(0.2,pertama?0.5:0.6); P.startupSaham=true; }
  addLog((pertama?'Email yang ditunggu akhirnya datang: Anda diterima di <b>'+tm.n+'</b> sebagai '+JAB[P.jab].n+' '+P.spesN+'. Pekerjaan pertama!':'Setelah belasan wawancara, Anda dapat tawaran di <b>'+tm.n+'</b>. Kembali punya penghasilan.')+fx({stres:-4,reputasi:+1}),'good');
  milestone((pertama?'Kerja pertama di ':'Diterima kerja di ')+tm.n);
  if(pertama)ach('junior');
}
function panggilanWawancara(){
  const list=daftarPanggilan();
  if(!list.length){ addLog('Puluhan lamaran terkirim, tidak satu pun dibalas. '+(N.pasar==='krisis'?'Perusahaan sedang membekukan rekrutmen.':'Coba lagi tahun depan, atau cari jalan lain.')+fx({stres:+6}),'bad'); return; }
  ask({title:'PANGGILAN WAWANCARA',text:(P.pernahKerja?'Dari sekian lamaran, ':'Dari puluhan lamaran fresh graduate, ')+'<b>'+list.length+' perusahaan</b> memanggil. Anda hanya sempat menyiapkan diri untuk satu. Pilih yang mana?',
    opts:list.map(tm=>({t:tm.n,sub:'Gaji '+JAB[P.jab].n+' ±'+rp(gajiDiTempat(tm))+'/bln · '+tm.d,e:()=>wawancaraTeknis('Anda lolos screening CV di '+tm.n+' dan masuk tahap teknis.',rs=>{
      const p=clamp(0.25+rs*0.6+(P.reputasi-30)/150+(N.pasar==='boom'?0.15:N.pasar==='krisis'?-0.15:0)-(P.latar==='smk'&&!P.s1Malam?0.1:0),0.1,0.95);
      if(r()<p)terimaKerja(tm);
      else addLog('Seminggu kemudian: "Terima kasih atas waktunya, kami memilih kandidat lain." Tahun ini Anda belum dapat kerja.'+fx({stres:+8}),'bad');
    })})).concat([{t:'Tidak ada yang cocok, lewati',e:()=>addLog('Anda menolak semua panggilan dan menunggu yang lebih pas.'+fx({stres:+2}))}])});
}

/* ---------- USAHA SAMPINGAN ---------- */
/* modal & laba dalam rupiah 2008 (dikali eraHarga). laba = rentang hasil bersih per tahun. */
const SAMPINGAN=[
  {k:'servis',  n:'Servis & rakit komputer',        modal:12e6, laba:[6,18],  skill:'sistem',   d:'Bengkel kecil di garasi: instal ulang, ganti RAM, rakit PC.'},
  {k:'les',     n:'Les privat coding',              modal:2e6,  laba:[4,12],  skill:'soft',     d:'Mengajar anak sekolah & mahasiswa di akhir pekan.'},
  {k:'jaringan',n:'Jasa pasang jaringan & CCTV',    modal:20e6, laba:[8,26],  skill:'jaringan', d:'Tarik kabel, pasang router & kamera untuk ruko dan rumah.'},
  {k:'template',n:'Jual template, tema & plugin',   modal:4e6,  laba:[1,22],  skill:'ngoding',  d:'Jualan di marketplace digital; hasilnya naik-turun.', sejak:2010},
  {k:'warnet',  n:'Warnet kecil',                   modal:60e6, laba:[12,34], skill:'sistem',   d:'Sepuluh PC, kopi sachet, dan pelanggan yang betah sampai pagi.', sampai:2015},
  {k:'toko',    n:'Toko aksesori komputer online',  modal:15e6, laba:[4,20],  skill:'soft',     d:'Stok di kamar, kirim lewat ekspedisi.', sejak:2012}
];
function bukaSampingan(){
  const list=SAMPINGAN.filter(s=>(!s.sejak||N.tahun>=s.sejak)&&(!s.sampai||N.tahun<=s.sampai));
  ask({title:'BUKA USAHA SAMPINGAN',text:'Usaha kecil di luar jam kerja: uangnya tidak besar dan menyita waktu, tapi menolong saat gaji pas-pasan atau saat belum punya kerja. (Saldo: '+rp(P.money)+')',
    opts:list.map(s=>{ const m=bulatJt(s.modal*eraHarga()); return {t:s.n,sub:'Modal '+rp(m)+' · hasil ±'+rp(bulatJt(s.laba[0]*1e6*eraHarga()))+'–'+rp(bulatJt(s.laba[1]*1e6*eraHarga()))+'/thn · '+s.d,cond:()=>P.money>=m,e:()=>{
      P.money-=m; P.sampingan={k:s.k,n:s.n,thn:0,rugi:0,modal:m};
      addLog('Anda membuka <b>'+s.n+'</b> dengan modal '+rp(m)+'. '+s.d,'good'); milestone('Buka sampingan: '+s.n); }}; })
      .concat([{t:'Batal',e:()=>{ delete P.used.sampingan; G.acted=Math.max(0,G.acted-1); }}])});
}
function sampinganTahunan(){
  const u=P.sampingan; if(!u||P.penjara>0)return;
  const s=SAMPINGAN.find(x=>x.k===u.k); u.thn++;
  if(s.sampai&&N.tahun>s.sampai+2){ addLog('Zaman berubah: pelanggan <b>'+u.n+'</b> habis. Anda menutupnya dan menjual peralatan seadanya.'+fx({money:Math.round(u.modal*0.2)}),'bad'); P.sampingan=null; return; }
  const sibuk=kerjaAktif()?0.8:1.15;                     /* tanpa pekerjaan tetap, waktu untuk sampingan lebih banyak */
  if(r()<0.18){
    const rugi=bulatJt(u.modal*(0.1+r()*0.2)); u.rugi++;
    addLog('Tahun yang seret untuk <b>'+u.n+'</b>: '+pick(['pelanggan sepi','barang rusak & komplain','pesaing baru banting harga'])+'. Rugi '+rp(rugi)+'.'+fx({money:-rugi,stres:+4}),'bad');
    if(u.rugi>=2&&r()<0.5){ addLog('Dua kali merugi, Anda memutuskan menutup <b>'+u.n+'</b>.','bad'); milestone('Sampingan tutup: '+u.n); P.sampingan=null; }
    return;
  }
  const hasil=bulatJt(ri(s.laba[0],s.laba[1])*1e6*eraHarga()*(0.6+P.st[s.skill]/120)*sibuk*(N.pasar==='krisis'?0.8:1));
  u.total=(u.total||0)+hasil; P.usedSkill[s.skill]=true;
  addLog('Usaha sampingan <b>'+u.n+'</b> menghasilkan '+rp(hasil)+' tahun ini.'+fx({money:hasil,stres:kerjaAktif()?+4:+2}),'good');
  if((u.total||0)>=100e6*eraHarga())ach('sampingan');
}

/* ---------- SOFTWARE HOUSE SENDIRI ---------- */
/* nilai kontrak per tahun dalam juta rupiah ±2024 (dikali eraGaji) · beban = tenaga developer yang dibutuhkan */
const KLIEN_TIPE=[
  {k:'umkm',     n:'UMKM',               nilai:[25,70],   beban:0.4, w:5, d:'kecil, cerewet, sering minta revisi'},
  {k:'startup',  n:'Startup',            nilai:[60,180],  beban:0.8, w:3, d:'cepat & seru, tapi kasnya tipis'},
  {k:'korporat', n:'Korporat',           nilai:[150,400], beban:1.2, w:2, d:'bayarannya besar, birokrasinya juga', rep:45},
  {k:'pemerintah',n:'Instansi pemerintah',nilai:[200,600],beban:1.4, w:2, d:'lewat tender; termin cair di akhir tahun', rep:40},
  {k:'luar',     n:'Klien luar negeri',  nilai:[250,700], beban:1.0, w:1, d:'bayar dolar, standar tinggi, beda zona waktu', rep:45, soft:50, sejak:2012}
];
const NAMA_SH=['Kode Nusantara','Lentera Digital','Arunika Labs','Sagara Tech','Rintis Studio','Benang Merah Software','Pijar Sistem','Tanah Air Devs'];
const NAMA_KLIEN={umkm:['Toko Batik Laksmi','Bengkel Jaya Motor','Klinik Sehat Sentosa','Katering Bu Rini','Koperasi Mekar'],startup:['Antarin','PasarKita','BelajarYuk','SewaAja','Kasbon.id'],
  korporat:['PT Sinar Logistik','Bank Arta Mulia','Grup Ritel Nusantara','PT Asuransi Bersama'],pemerintah:['Dinas Kominfo','Dinas Pendidikan','RSUD Kota','Badan Pendapatan Daerah'],luar:['Northwind GmbH','Kiwi Retail Ltd','Sakura Systems','Bluebird Health Inc']};
/* rekam jejak software house disimpan untuk penilaian akhir walau usahanya sudah dijual/ditutup */
function catatSH(){ if(P.sh)P.shLalu={n:P.sh.n,total:P.sh.total,klienTotal:P.sh.klienTotal,thn:P.sh.thn}; }
function tenagaSH(){
  if(!P.sh)return 0;
  let t=(P.sh.penuh?1:0.4)*(0.6+P.st.ngoding/120);
  if(P.sh.penuh&&P.tim)for(const m of P.tim.anggota)t+=clamp(m.skill/75,0.3,1.4)*(m.moral<35?0.7:1);
  return +t.toFixed(2);
}
function bebanSH(){ return P.sh?+P.sh.klien.reduce((a,c)=>a+c.beban,0).toFixed(2):0; }
function omzetSH(){ return P.sh?P.sh.klien.reduce((a,c)=>a+c.nilai,0):0; }
function modalSH(){ return bulatJt(20e6*eraHarga()); }
function bukaSoftwareHouse(){
  const m=modalSH(), kerja=kerjaAktif()&&!!P.tempat&&!P.founder;
  const mulai=penuh=>{
    P.money-=m; const nama=pick(NAMA_SH);
    if(penuh){ if(kerja||P.tempat)milestone('Resign dari '+P.tempatN+' demi usaha sendiri'); P.tempat='softwarehouse'; P.tempatN=nama+' (Pemilik)'; P.pernahKerja=true; kondisiKantorBaru(true); }
    P.sh={n:nama,penuh:!!penuh,klien:[],thn:0,total:0,klienTotal:0,kosong:0};
    addLog('Akta diteken, domain dibeli, kartu nama dicetak: <b>'+nama+'</b> resmi berdiri'+(penuh?', dan kini jadi pekerjaan utama Anda.':' sebagai usaha di luar jam kantor.')+' Belum ada klien — buka laci <b>Uang & Usaha</b> → <b>Cari klien</b>.'+fx({stres:+6}),'good');
    milestone('Mendirikan software house '+nama); ach('softwareHouse');
  };
  ask({title:'BUKA SOFTWARE HOUSE',text:'Modal awal '+rp(m)+' (legalitas, laptop, domain). Penghasilan datang dari <b>klien</b>, bukan gaji: Anda harus mencari proyek, menjaga kepuasan klien, dan menggaji developer dari kas sendiri.',opts:[
    {t:'Penuh waktu',sub:kerja?'Resign dari '+P.tempatN+' · bisa merekrut tim':'Jadi pekerjaan utama · bisa merekrut tim',e:()=>mulai(true)},
    {t:'Sambil tetap bekerja',sub:'Tenaga terbatas (hanya Anda, di luar jam kantor)',cond:()=>kerja,e:()=>mulai(false)},
    {t:'Batal',e:()=>{ delete P.used.bukaSH; G.acted=Math.max(0,G.acted-1); }}
  ]});
}
function buatKlien(){
  const pool=KLIEN_TIPE.filter(t=>(!t.rep||P.reputasi>=t.rep)&&(!t.soft||P.st.soft>=t.soft)&&(!t.sejak||N.tahun>=t.sejak));
  let tot=pool.reduce((a,t)=>a+t.w,0), x=r()*tot, tp=pool[0];
  for(const t of pool){ x-=t.w; if(x<=0){ tp=t; break; } }
  const sudah=P.sh.klien.map(c=>c.n);
  const nama=pick(NAMA_KLIEN[tp.k].filter(n=>!sudah.includes(n)).concat(NAMA_KLIEN[tp.k]));
  return {tipe:tp.k,tipeN:tp.n,n:nama,nilai:bulatJt(ri(tp.nilai[0],tp.nilai[1])*1e6*eraGaji()),beban:tp.beban,puas:ri(55,70),sisa:ri(1,3),d:tp.d};
}
function cariKlien(){
  P.usedSkill.soft=true;
  const p=clamp(0.3+P.reputasi/220+P.st.soft/300+(N.pasar==='boom'?0.1:N.pasar==='krisis'?-0.15:0)+Math.min(P.sh.klienTotal,6)*0.02,0.1,0.9);
  if(r()>p){ addLog('Tiga proposal terkirim, dua presentasi, nol kontrak. '+pick(['"Kami pakai vendor langganan dulu, ya."','"Anggarannya ternyata belum turun."','Calon klien memilih keponakan direkturnya.'])+fx({stres:+4}),'bad'); return; }
  const c=buatKlien(), tambah=x=>{ P.sh.klien.push(x); P.sh.klienTotal++; addLog('Kontrak diteken: <b>'+x.n+'</b> ('+x.tipeN+'), '+rp(x.nilai)+'/tahun selama '+x.sisa+' tahun.'+fx({reputasi:+1}),'good'); milestone('Klien baru: '+x.n); if(P.sh.klien.length>=5)ach('klienBesar'); };
  const lebih=bebanSH()+c.beban>tenagaSH();
  const opts=[
    {t:'Terima sesuai penawaran',sub:rp(c.nilai)+'/thn',e:()=>tambah(c)},
    {t:'Minta harga 25% lebih tinggi',sub:'Bisa-bisa klien mundur',e:()=>{ if(r()<0.4+P.reputasi/250){ c.nilai=bulatJt(c.nilai*1.25); c.puas-=5; tambah(c); } else addLog(c.n+' menilai harga Anda kemahalan dan pindah ke vendor lain.'+fx({stres:+2}),'bad'); }},
    {t:'Banting harga demi portofolio',sub:rp(bulatJt(c.nilai*0.7))+'/thn · klien senang',e:()=>{ c.nilai=bulatJt(c.nilai*0.7); c.puas+=10; tambah(c); }}
  ];
  if(c.tipe==='pemerintah')opts.push({t:'Menangkan tender dengan "fee" ke panitia',sub:'Kontrak lebih besar · suap',cond:()=>P.money>=c.nilai*0.1,e:()=>{ P.money-=bulatJt(c.nilai*0.1); c.nilai=bulatJt(c.nilai*1.3); c.suap=true; P.suapTender=(P.suapTender||0)+1; tambah(c);
    addLog('Amplop "biaya koordinasi" berpindah tangan sebelum pengumuman tender.'+fx({heat:+9,stres:+4}),'bad'); leg(-4,2); }});
  opts.push({t:'Tolak',e:()=>addLog('Anda menolak proyek '+c.n+'.')});
  ask({title:'CALON KLIEN',text:'<b>'+c.n+'</b> ('+c.tipeN+': '+c.d+') menawarkan kontrak <b>'+rp(c.nilai)+'/tahun</b> selama '+c.sisa+' tahun. Butuh tenaga ±'+c.beban+' developer.<br><span class="d">Tenaga Anda sekarang '+tenagaSH()+', terpakai '+bebanSH()+'.'+(lebih?' <b>Kalau diterima, tim kewalahan</b> dan semua klien jadi kurang puas.':'')+'</span>',opts});
}
function rawatKlien(){
  P.usedSkill.soft=true;
  for(const c of P.sh.klien)c.puas=clamp(c.puas+ri(6,10),0,100);
  addLog('Anda meluangkan waktu untuk rapat rutin, demo progres, dan makan siang dengan para klien. Hubungan menghangat.'+fx({stres:+3,soft:+1}),'good');
}
function tutupSH(){
  const sh=P.sh, omz=omzetSH(), laku=sh.klien.length>=2?bulatJt(omz*(0.4+r()*0.5)*clamp(P.reputasi/60,0.5,1.4)):0;
  ask({title:'TUTUP / JUAL SOFTWARE HOUSE?',text:'<b>'+sh.n+'</b> punya '+sh.klien.length+' klien dengan omzet '+rp(omz)+'/tahun. '+(laku?'Ada peminat yang mau membeli seharga ±'+rp(laku)+'.':'Tanpa basis klien, tidak ada yang mau membelinya.'),opts:[
    {t:laku?'Jual':'Tutup',e:()=>{ if(laku){ P.money+=laku; ach('exitSH'); leg(0,3); }
      addLog(laku?'<b>'+sh.n+'</b> berpindah tangan seharga '+rp(laku)+'. Klien dan tim ikut pemilik baru.':'<b>'+sh.n+'</b> ditutup. Papan nama diturunkan.','sys'); milestone((laku?'Menjual ':'Menutup ')+sh.n);
      const penuh=sh.penuh; catatSH(); P.sh=null; if(penuh){ jadiMenganggur(); addLog('Anda kini tanpa pekerjaan tetap.','sys'); } }},
    {t:'Batal',e:()=>{}}
  ]});
}
function shTahunan(){
  const sh=P.sh; if(!sh||P.penjara>0)return;
  sh.thn++;
  const tenaga=tenagaSH(), beban=bebanSH(), lebih=beban>tenaga+0.05;
  let masuk=0; const pergi=[];
  for(const c of sh.klien){
    let bayar=c.nilai;
    if((c.tipe==='umkm'||c.tipe==='startup')&&r()<0.12){ bayar=Math.round(c.nilai*0.5); addLog('<b>'+c.n+'</b> hanya membayar separuh tagihan tahun ini. "Sisanya bulan depan, ya."','bad'); }
    masuk+=bayar;
    c.puas=clamp(Math.round(c.puas+(lebih?-(4+(beban/Math.max(tenaga,0.2)-1)*22):3)+(P.st.soft-50)/25+(c.tipe==='umkm'?-1:0)),0,100);
    c.sisa--;
    if(c.puas<25){ pergi.push(c); addLog('<b>'+c.n+'</b> memutus kontrak karena kecewa dengan hasil kerja.'+fx({reputasi:-2}),'bad'); }
    else if(c.sisa<=0){
      if(r()<c.puas/110){ c.sisa=ri(1,3); c.nilai=bulatJt(c.nilai*(1.04+r()*0.1)); addLog('<b>'+c.n+'</b> memperpanjang kontrak '+c.sisa+' tahun, kini '+rp(c.nilai)+'/tahun.','good'); }
      else { pergi.push(c); addLog('Kontrak <b>'+c.n+'</b> selesai dan tidak diperpanjang.','sys'); }
    }
  }
  sh.klien=sh.klien.filter(c=>!pergi.includes(c));
  const nTim=sh.penuh&&P.tim?P.tim.anggota.length:0;
  const overhead=bulatJt((sh.penuh?9e6+3e6*nTim:2e6)*eraHarga());       /* sewa ruang, lisensi, server, akuntan */
  const pajak=Math.round(masuk*0.01);
  sh.total+=masuk; P.money+=masuk-overhead-pajak; P.usedSkill.ngoding=true;
  sh.kosong=masuk>0?0:sh.kosong+1;
  addLog('<b>'+sh.n+'</b>: tagihan klien '+rp(masuk)+', biaya operasional '+rp(overhead)+', pajak '+rp(pajak)+'.'+(nTim?' (Gaji tim dibayar terpisah.)':'')+(lebih?' <b>Tim kewalahan</b> (beban '+beban+' vs tenaga '+tenaga+'): mutu turun, klien mulai mengeluh.':''),masuk>overhead?'good':'bad');
  P.st.stres=clamp(P.st.stres+(lebih?8:sh.penuh?3:5),0,100);
  if(sh.total>=5e9)ach('klienBesar');
  if(sh.penuh&&sh.kosong>=2)addLog('Dua tahun tanpa satu pun klien. Kas '+sh.n+' terus terkuras; pertimbangkan mencari klien lebih gencar atau menutupnya.','bad');
}
/* satu kejadian software house per tahun (dipanggil dari events) */
function kejadianSH(){
  const sh=P.sh; if(!sh||!sh.klien.length||r()>0.45)return;
  const c=pick(sh.klien), x=r();
  if(x<0.4){
    ask({title:'KLIEN MINTA TAMBAHAN',text:'<b>'+c.n+'</b>: "Sekalian tambahin fitur ini ya, kecil kok." Fitur itu tidak ada di kontrak dan butuh berminggu-minggu.',opts:[
      {t:'Kerjakan gratis demi hubungan baik',e:()=>{ c.puas=clamp(c.puas+8,0,100); c.beban=+(c.beban+0.2).toFixed(1); addLog('Anda mengiyakan. Klien senang, tim menghela napas, dan beban proyek bertambah.'+fx({stres:+5})); }},
      {t:'Ajukan sebagai pekerjaan tambahan berbayar',e:()=>{ if(r()<0.45+P.st.soft/220){ c.nilai=bulatJt(c.nilai*1.15); c.beban=+(c.beban+0.2).toFixed(1); addLog('Setelah negosiasi alot, '+c.n+' setuju membayar tambahan. Kontrak naik jadi '+rp(c.nilai)+'/tahun.'+fx({soft:+1}),'good'); } else { c.puas=clamp(c.puas-12,0,100); addLog(c.n+' tersinggung: "Vendor lain mau kok tanpa biaya." Hubungan mendingin.','bad'); } }},
      {t:'Tolak: di luar lingkup kontrak',e:()=>{ c.puas=clamp(c.puas-7,0,100); addLog('Anda menunjuk pasal lingkup pekerjaan. Benar secara kontrak, kurang enak secara hubungan.'); }}
    ]});
  } else if(x<0.7){
    const tunggak=Math.round(c.nilai*0.5);
    ask({title:'INVOICE MACET',text:'<b>'+c.n+'</b> sudah tiga bulan menunggak '+rp(tunggak)+'. Jawaban mereka selalu "sedang diproses finance".',opts:[
      {t:'Tagih terus dengan sopan',e:()=>{ if(r()<0.55)addLog('Setelah belasan email dan dua kunjungan, pembayaran akhirnya masuk.'+fx({stres:+4})); else { addLog('Tagihan itu tak pernah dibayar.'+fx({money:-tunggak,stres:+6}),'bad'); c.puas=clamp(c.puas-5,0,100); } }},
      {t:'Hentikan pekerjaan sampai dibayar',e:()=>{ if(r()<0.7){ addLog('Begitu server staging dimatikan, finance mereka mendadak sigap. Lunas dalam seminggu.'+fx({stres:+3})); c.puas=clamp(c.puas-10,0,100); } else { addLog('Klien marah dan memutus kontrak tanpa membayar.'+fx({money:-tunggak,reputasi:-1}),'bad'); sh.klien.splice(sh.klien.indexOf(c),1); } }},
      {t:'Ikhlaskan demi kontrak tahun depan',e:()=>{ c.puas=clamp(c.puas+6,0,100); addLog('Anda menghapus tagihan itu dari buku.'+fx({money:-tunggak}),'bad'); }}
    ]});
  } else if(x<0.85&&sh.penuh&&P.tim&&P.tim.anggota.length&&sh.klien.length>=2){
    const m=pick(P.tim.anggota);
    ask({title:'DEVELOPER KUNCI MAU KELUAR',text:'<b>'+m.nama+'</b> memegang proyek '+c.n+' dan baru saja ditawari gaji lebih tinggi oleh software house lain. Kalau ia pergi, klien itu bisa ikut.',opts:[
      {t:'Tahan dengan naik gaji 20%',sub:'Jadi '+rp(bulatJt(m.gaji*1.2))+'/bln',e:()=>{ m.gaji=bulatJt(m.gaji*1.2); m.moral=clamp(m.moral+12,0,100); addLog(m.nama+' bertahan. Anggota lain mulai menghitung-hitung gajinya sendiri.','sys'); }},
      {t:'Lepaskan dengan baik-baik',e:()=>{ P.tim.anggota.splice(P.tim.anggota.indexOf(m),1); if(r()<0.5){ sh.klien.splice(sh.klien.indexOf(c),1); addLog(m.nama+' pergi, dan tiga bulan kemudian '+c.n+' ikut pindah ke tempat barunya.'+fx({stres:+6}),'bad'); } else addLog(m.nama+' pergi. Anda sendiri yang mengambil alih proyek '+c.n+'.'+fx({stres:+6})); }}
    ]});
  } else if(sh.klien.length>=3&&P.reputasi>=55&&!sh.ditawar){
    sh.ditawar=true; const harga=bulatJt(omzetSH()*(1.5+r()));
    ask({title:'TAWARAN AKUISISI',text:'Sebuah perusahaan teknologi besar ingin membeli <b>'+sh.n+'</b> seharga '+rp(harga)+' — klien, tim, dan namanya.',opts:[
      {t:'Jual',e:()=>{ P.money+=harga; ach('exitSH'); leg(1,5); addLog('<b>'+sh.n+'</b> diakuisisi seharga '+rp(harga)+'. Anda keluar membawa hasil kerja bertahun-tahun.','good'); milestone('Menjual '+sh.n+' ('+rp(harga)+')'); const penuh=sh.penuh; catatSH(); P.sh=null; if(penuh)jadiMenganggur(); }},
      {t:'Tolak, ini anak sendiri',e:()=>addLog('Anda menolak. '+sh.n+' tetap milik Anda sepenuhnya.'+fx({reputasi:+1}))}
    ]});
  }
}
