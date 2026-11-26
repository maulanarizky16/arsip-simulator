'use strict';
/* ================= AKSI ================= */
const TABS=[['diri','DIRI'],['usaha','USAHA & OPERASI'],['ekspansi','EKSPANSI & STRATEGI'],['siasat','MODAL & SIASAT'],['pribadi','PRIBADI & UANG']];
const MODAL_TERMURAH=Math.min.apply(null,SEKTOR.map(s=>s.modalMin));
function pilihUsaha(title,fn,filter){
  let list=P.usaha.filter(filter||(()=>true));
  if(!list.length){ addLog('Belum ada usaha yang memenuhi syarat untuk aksi ini.','sys'); return; }
  ask({title,text:'Pilih usaha:',opts:list.map(u=>({t:u.n,sub:SEKTOR_MAP[u.k].n+' · '+SKALA_LBL[u.skala]+' · kinerja '+u.kinerja+'%',e:()=>fn(u)}))});
}

const ACTS=[
/* ---- DIRI ---- */
{k:'rehat',tab:'diri',lbl:'Rehat sejenak',sub:'Stres −8',e:()=>addLog('Anda menutup buku kas sebentar, menghirup udara tanpa memikirkan omzet.'+fx({stres:-8}))},
{k:'olahraga',tab:'diri',lbl:'Jaga kesehatan',sub:'Kesehatan +3',e:()=>addLog('Golf, jalan pagi, atur makan. Pengusaha sukses butuh badan kuat.'+fx({kesehatan:+3,stres:-2}))},
{k:'keluarga',tab:'diri',lbl:'Waktu untuk keluarga',sub:'Stres −6',cond:()=>P.keluarga,e:()=>addLog('Sehari penuh tanpa rapat, hanya keluarga.'+fx({stres:-6,kesehatan:+1}))},
{k:'belajar',tab:'diri',lbl:'Asah ilmu bisnis',sub:'Tingkatkan satu kemampuan',cond:()=>!P.retired,e:()=>{
  ask({title:'BELAJAR & MENGASAH DIRI',text:'Mau memperdalam yang mana?',opts:[
    {t:'Naluri & strategi bisnis',e:()=>addLog('Anda membaca, ikut seminar, belajar dari mentor. Insting bisnis menajam.'+fx({bisnis:+5,stres:+1}),'good')},
    {t:'Manajemen operasional',e:()=>addLog('Anda mendalami SOP, rantai pasok, dan efisiensi.'+fx({operasi:+5,stres:+1}),'good')},
    {t:'Pemasaran & branding',e:()=>addLog('Anda mempelajari pemasaran modern & membangun merek.'+fx({pemasaran:+5,stres:+1}),'good')},
    {t:'Keuangan & pembukuan',e:()=>addLog('Anda belajar membaca neraca, arus kas, dan pajak.'+fx({finansial:+5,stres:+1}),'good')},
    {t:'Jejaring & lobi',e:()=>addLog('Anda rajin hadir di forum pengusaha & menjalin relasi.'+fx({relasi:+5,stres:+1}),'good')}
  ]});}},
{k:'tutup',tab:'diri',lbl:'Tutup berkas (akhiri)',sub:'Akhiri perjalanan & lihat penilaian',cond:()=>P.retired||(P.usaha.length===0&&P.age>=35),e:()=>{
  ask({title:'TUTUP BERKAS?',text:'Akhiri kisah ini sekarang dan lihat penilaian akhir?',opts:[
    {t:'Ya, tutup berkas',e:()=>{P.alive=false;P.sebab=null;G.over=true;addLog('Anda menutup buku besar terakhir, menatap semua yang telah dibangun.','sys');stamp('BERKAS DITUTUP');showEpilog();}},
    {t:'Belum',e:()=>{}}
  ]});}},

/* ---- USAHA & OPERASI ---- */
{k:'buka',tab:'usaha',lbl:'Buka usaha baru',sub:'Pilih dari 18 sektor',cond:()=>!P.retired&&P.kas>=MODAL_TERMURAH,e:()=>{
  ask({title:'BUKA USAHA BARU',text:'Sektor mana yang mau Anda masuki? Modal awal & risiko berbeda-beda.',opts:SEKTOR.map(s=>({t:s.n,sub:'Modal '+rp(s.modalMin)+' · margin '+Math.round(s.margin*100)+'% · risiko '+(s.risk>=0.45?'tinggi':s.risk>=0.3?'sedang':'rendah'),cond:()=>P.kas>=s.modalMin,e:()=>{
    const modal=Math.round(s.modalMin*(0.95+r()*0.3)); P.kas-=modal;
    const u=bukaUsahaObj(s.k,modal); P.usaha.push(u); P.usahaDibuka++;
    addLog('Anda membuka <b>'+u.n+'</b> ('+s.n+', '+SKALA_LBL[u.skala]+'). Spanduk dipasang, doa dipanjatkan.'+fx({stres:+3}),'good');
    milestone('Buka usaha: '+u.n+' ('+s.n+')'); ach('pertama'); cekSkalaAch();
  }}))});}},
{k:'kembangkan',tab:'usaha',lbl:'Kembangkan & naik kelas',sub:'Tambah modal, naikkan skala',multi:true,cond:()=>!P.retired&&P.usaha.some(u=>u.skala<6&&P.kas>=Math.round(u.modal*(0.6+0.1*u.skala))),e:()=>{
  pilihUsaha('KEMBANGKAN USAHA',u=>{
    const cost=Math.round(u.modal*(0.6+0.1*u.skala));
    if(P.kas<cost){addLog('Kas tak cukup untuk membesarkan '+u.n+' (butuh '+rp(cost)+').','sys');return;}
    P.kas-=cost; u.modal=Math.min(1e12,Math.round(u.modal*1.55)); u.skala=Math.min(6,u.skala+1); u.karyawan+=ri(2,6)+u.skala; u.kinerja=clamp(u.kinerja-ri(2,6),0,100);
    if(u.k==='properti'||u.k==='manufaktur')u.proyek=Math.max(u.proyek||0,ri(1,2));   /* ekspansi = proyek baru, modal terikat sementara */
    if(u.k==='tek'&&(u.runway||0)>0)u.runway+=1;                                       /* suntikan modal memperpanjang runway */
    addLog('Anda menyuntik modal & memperbesar '+u.n+' jadi skala <b>'+SKALA_LBL[u.skala]+'</b>. Lebih besar, lebih berisiko.'+fx({stres:+3}),'good');
    milestone(u.n+' naik kelas: '+SKALA_LBL[u.skala]); cekSkalaAch();
  },u=>u.skala<6&&P.kas>=Math.round(u.modal*(0.6+0.1*u.skala)));}},
{k:'pemasaran',tab:'usaha',lbl:'Kampanye pemasaran',sub:'Dongkrak merek & pangsa pasar',multi:true,cond:()=>!P.retired&&P.usaha.length&&P.kas>=20e6,e:()=>{
  pilihUsaha('KAMPANYE PEMASARAN',u=>{ const cost=Math.round(Math.max(20e6,u.modal*0.08)); if(P.kas<cost){addLog('Kas tak cukup.','sys');return;}
    P.kas-=cost; const gain=Math.round(ri(8,16)*(1-u.brand/130));   /* hasil mengecil saat merek sudah kuat */
    u.brand=clamp(u.brand+Math.max(2,gain),0,100); u.share=clamp((u.share||5)+ri(1,3),1,100);
    addLog('Iklan, endorse, promo digencarkan untuk '+u.n+'. Merek & pangsa pasar naik.'+fx({pemasaran:+1}),'good');},u=>true);}},
{k:'mutu',tab:'usaha',lbl:'Tingkatkan mutu & layanan',sub:'Naikkan kinerja & retensi',multi:true,cond:()=>!P.retired&&P.usaha.length&&P.kas>=15e6,e:()=>{
  pilihUsaha('TINGKATKAN MUTU',u=>{ const cost=Math.round(Math.max(15e6,u.modal*0.07)); if(P.kas<cost){addLog('Kas tak cukup.','sys');return;}
    P.kas-=cost; const gain=Math.round(ri(8,16)*(1-u.kinerja/130));
    u.kinerja=clamp(u.kinerja+Math.max(2,gain),0,100); u.share=clamp((u.share||5)+ri(0,2),1,100);
    addLog('Anda membenahi operasional & kualitas '+u.n+'. Pelanggan lebih puas dan setia.'+fx({operasi:+1}),'good');},u=>true);}},
{k:'rekrut',tab:'usaha',lbl:'Rekrut talenta & manajer',sub:'Tambah SDM, mungkin dapat bintang',multi:true,cond:()=>!P.retired&&P.usaha.length&&P.kas>=30e6,e:()=>{
  pilihUsaha('REKRUT SDM',u=>{ const cost=Math.round(Math.max(30e6,u.modal*0.05)); if(P.kas<cost){addLog('Kas tak cukup.','sys');return;}
    P.kas-=cost; u.karyawan+=ri(2,6); u.kinerja=clamp(u.kinerja+ri(4,9),0,100); P.buruh=clamp(P.buruh+1,0,100);
    if(r()<0.35&&(u.keyKaryawan||0)<3){ u.keyKaryawan=(u.keyKaryawan||0)+1; addLog('Dapat talenta bintang untuk '+u.n+' — kinerja melompat & profit terangkat selama ia bertahan.'+fx({stres:-2}),'good'); }
    else addLog('Anda merekrut SDM berkualitas untuk '+u.n+'. Beban Anda berkurang, kinerja naik.'+fx({stres:-2}),'good');},u=>true);}},
{k:'pasok',tab:'usaha',lbl:'Perkuat rantai pasok',sub:'Eratkan relasi supplier · tekan biaya',multi:true,cond:()=>!P.retired&&P.usaha.length&&P.kas>=15e6,e:()=>{
  pilihUsaha('PERKUAT RANTAI PASOK',u=>{ const cost=Math.round(Math.max(15e6,u.modal*0.05)); if(P.kas<cost){addLog('Kas tak cukup.','sys');return;}
    P.kas-=cost; u.sRelasi=clamp((u.sRelasi!=null?u.sRelasi:50)+ri(8,16),0,100);
    addLog('Anda kontrak jangka panjang & jaga hubungan baik dengan pemasok '+u.n+'. Biaya bahan baku lebih stabil & murah.','good');},u=>true);}},
{k:'inovasi',tab:'usaha',lbl:'Riset & inovasi produk',sub:'Lompatan, tapi bisa flop',multi:true,cond:()=>!P.retired&&P.usaha.length&&P.kas>=40e6,e:()=>{
  pilihUsaha('RISET & INOVASI',u=>{ const cost=Math.round(Math.max(40e6,u.modal*0.12)); if(P.kas<cost){addLog('Kas tak cukup.','sys');return;}
    P.kas-=cost; if(r()<0.6){u.kinerja=clamp(u.kinerja+ri(6,12),0,100);u.brand=clamp(u.brand+ri(8,16),0,100);addLog('Inovasi '+u.n+' sukses — produk baru disambut pasar!'+fx({bisnis:+2}),'good');leg(1,1);}
    else addLog('Riset '+u.n+' belum membuahkan hasil. Modal jadi pelajaran.'+fx({stres:+3}),'bad');},u=>true);}},
{k:'jualUsaha',tab:'usaha',lbl:'Jual / tutup usaha',sub:'Cairkan atau lepas beban',cond:()=>P.usaha.length>0,e:()=>{
  pilihUsaha('JUAL / TUTUP USAHA',u=>{ const harga=Math.round(nilaiUsaha(u)*u.milik*0.7);
    P.kas+=harga; P.usaha.splice(P.usaha.indexOf(u),1); P.usahaTutup++;
    addLog('Anda melepas '+u.n+' seharga '+rp(harga)+'. Satu babak ditutup.'+'','sys'); milestone('Lepas usaha: '+u.n);},u=>true);}},

/* ---- EKSPANSI & STRATEGI ---- */
{k:'cariPeluang',tab:'ekspansi',lbl:'Cari peluang aktif',sub:'Pancing tawaran/deal baru',cond:()=>!P.retired,e:()=>{ addLog('Anda turun ke lapangan, menghadiri pameran & forum, mencari peluang.','sys'); tawarkanPeluang(buatPeluang()); }},
{k:'franchise',tab:'ekspansi',lbl:'Waralabakan usaha',sub:'Jual lisensi · royalti tahunan pasif',cond:()=>!P.retired&&P.usaha.some(u=>u.skala>=3&&u.brand>=40&&!u.waralaba),e:()=>{
  pilihUsaha('WARALABAKAN USAHA',u=>{ if(u.waralaba){addLog(u.n+' sudah diwaralabakan.','sys');return;}
    u.waralaba=true; const fee=Math.round(nilaiUsaha(u)*u.milik*ri(8,14)/100); P.kas+=fee; u.share=clamp((u.share||5)+ri(2,5),1,100); P.franchiseKali++;
    addLog('<b>'+u.n+'</b> kini diwaralabakan — biaya lisensi awal '+rp(fee)+' masuk, dan tiap tahun royalti gerai mitra mengalir ke kas (pendapatan pasif).'+fx({reputasi:+2}),'good'); milestone('Waralabakan '+u.n); if(P.franchiseKali>=2)ach('waralabaRaja'); leg(2,0);},u=>u.skala>=3&&u.brand>=40&&!u.waralaba);}},
{k:'ekspor',tab:'ekspansi',lbl:'Tembus pasar ekspor',sub:'Go international',multi:true,cond:()=>!P.retired&&P.usaha.some(u=>u.skala>=4),e:()=>{
  pilihUsaha('EKSPOR PRODUK',u=>{ const cost=Math.round(u.modal*0.15); if(P.kas<cost){addLog('Kas tak cukup untuk ekspansi ekspor.','sys');return;}
    P.kas-=cost; if(r()<0.65){u.brand=clamp(u.brand+ri(8,16),0,100);u.kinerja=clamp(u.kinerja+ri(4,8),0,100);P.eksporKali++;addLog(u.n+' menembus pasar luar negeri! Order dari mancanegara berdatangan.'+fx({reputasi:+3}),'good');ach('ekspor');leg(2,1);}
    else addLog('Ekspor '+u.n+' terganjal regulasi & standar mutu negara tujuan. Belum berhasil.'+fx({stres:+3}),'bad');},u=>u.skala>=4);}},
{k:'ipo',tab:'ekspansi',lbl:'Bawa perusahaan IPO',sub:'Melantai di bursa, raih dana segar',cond:()=>!P.retired&&P.usaha.some(u=>u.skala>=5&&u.milik>=0.5),e:()=>{
  pilihUsaha('IPO — MELANTAI DI BURSA',u=>{ const sold=0.3; const dana=Math.round(nilaiUsaha(u)*sold); P.kas+=dana; u.milik=clamp(u.milik-sold,0.2,1); u.modal=Math.min(1e12,Math.round(u.modal*1.15)); P.ipoKali++;
    addLog('<b>IPO!</b> '+u.n+' resmi melantai di bursa. Anda lepas '+Math.round(sold*100)+'% saham senilai '+rp(dana)+'; modal segar dari pasar memperbesar kapasitas perusahaan, Anda tetap pengendali.'+fx({reputasi:+5}),'good'); stamp('IPO','green'); milestone('IPO: '+u.n); ach('ipo'); cekSkalaAch(); leg(4,1);},u=>u.skala>=5&&u.milik>=0.5);}},

/* ---- MODAL & SIASAT ---- */
{k:'pinjam',tab:'siasat',lbl:'Pinjam modal ke bank',sub:'Suntik kas, tambah utang',cond:()=>!P.retired&&P.utang<Math.max(netWorth(),0)&&netWorth()>0,e:()=>{
  const pinjam=Math.round(clamp(netWorth()*0.4,80e6,2e12)); P.kas+=pinjam; P.utang+=pinjam;
  addLog('Bank menyetujui kredit '+rp(pinjam)+' dengan agunan aset usaha. Kas gemuk, kewajiban bertambah.'+fx({stres:+3}),'sys'); milestone('Pinjam modal '+rp(pinjam));}},
{k:'investorMasuk',tab:'siasat',lbl:'Cari investor (lepas saham)',sub:'Cairkan sebagian saham jadi kas',cond:()=>!P.retired&&P.usaha.some(u=>u.skala>=3&&u.milik>=0.4),e:()=>{
  pilihUsaha('CARI INVESTOR',u=>{ const sold=0.15; const dana=Math.round(nilaiUsaha(u)*sold); P.kas+=dana; u.milik=clamp(u.milik-sold,0.25,1);
    addLog('Investor masuk ke '+u.n+': '+Math.round(sold*100)+'% saham senilai '+rp(dana)+' Anda cairkan jadi kas segar untuk diputar ke peluang lain.'+fx({relasi:+2}),'good');},u=>u.skala>=3&&u.milik>=0.4);}},
{k:'bayarUtang',tab:'siasat',lbl:'Lunasi utang',sub:'Kurangi beban bunga',cond:()=>P.utang>0&&P.kas>=Math.min(P.utang,50e6),e:()=>{
  const bayar=Math.min(P.utang,P.kas); P.utang-=bayar; P.kas-=bayar;
  addLog('Anda melunasi '+rp(bayar)+' utang. Neraca lebih sehat, tidur lebih nyenyak.'+fx({stres:-3}),'good');}},
{k:'pajakSiasat',tab:'siasat',lbl:'Atur ulang siasat pajak',sub:'Patuh ↔ "optimasi" agresif',cond:()=>!P.retired,e:()=>{
  ask({title:'SIASAT PAJAK',text:'Bagaimana Anda memperlakukan pajak mulai sekarang? Status saat ini: <b>'+(P.modusPajak==='patuh'?'Patuh':'Menghindar')+'</b>.',opts:[
    {t:'Patuh & transparan',e:()=>{P.modusPajak='patuh';addLog('Anda memilih taat pajak. Setoran besar, tapi tidur tenang dan nama bersih.'+'','good');leg(0,1);}},
    {t:'"Optimasi" agresif (hindari pajak)',sub:'Hemat besar · sorotan & tunggakan',e:()=>{P.modusPajak='hindar';addLog('Anda mainkan faktur, transfer pricing, dan perusahaan cangkang. Hemat pajak besar, risiko mengintai.'+fx({heat:+4}),'bad');ach('penghindarPajak');leg(1,-3);}}
  ]});}},
{k:'suapTender',tab:'siasat',lbl:'Suap demi tender/proyek',sub:'Proyek besar · sorotan & dosa',multi:true,cond:()=>!P.retired&&P.kas>=150e6&&P.st.relasi>=40,e:()=>{
  const suap=Math.round(clamp(netWorth()*0.05,100e6,5e11)); const proyek=Math.round(suap*ri(4,9));
  P.kas-=suap; P.kas+=proyek; P.gelap+=Math.round(proyek*0.1); P.gelapTotal+=Math.round(proyek*0.1); P.suapKali++; P.heat=clamp(P.heat+ri(8,16),0,100);
  addLog('Amplop & "komitmen fee" berpindah ke oknum pejabat. Tender proyek '+rp(proyek)+' jatuh ke tangan Anda. Cuan besar, jejak basah.'+fx({stres:+4}),'bad');
  milestone('Menangkan tender lewat suap'); if(P.suapKali>=2)ach('mafiaTender'); leg(3,-5);}},
{k:'kartel',tab:'siasat',lbl:'Atur harga / kartel',sub:'Kongkalikong pesaing · margin naik',cond:()=>!P.retired&&P.usaha.length>=2&&P.st.relasi>=50,e:()=>{
  for(const u of P.usaha)u.brand=clamp(u.brand+ri(3,7),0,100);
  P.heat=clamp(P.heat+ri(5,10),0,100);
  addLog('Diam-diam Anda dan pesaing sepakat menahan harga & membagi pasar. Margin semua pihak naik, konsumen yang buntung.'+fx({stres:+3,reputasi:-3}),'bad'); milestone('Bermain kartel harga'); leg(2,-5);}},
{k:'upahMurah',tab:'siasat',lbl:'Tekan upah & outsourcing',sub:'Hemat biaya · pekerja menderita',multi:true,cond:()=>!P.retired&&totalKaryawan()>=5,e:()=>{
  const hemat=Math.round(totalKaryawan()*ri(8,18)*1e6); P.kas+=hemat; P.buruh=clamp(P.buruh-ri(8,15),0,100);
  addLog('Anda pangkas upah, hapus tunjangan, ganti karyawan tetap dengan harian lepas. Hemat '+rp(hemat)+', tapi pekerja makin tertekan.'+fx({reputasi:-3}),'bad'); if(P.buruh<=35)ach('pemerasBuruh'); leg(1,-4);}},
{k:'abaiLingkungan',tab:'siasat',lbl:'Abaikan dampak lingkungan',sub:'Pangkas biaya · rusak alam',multi:true,cond:()=>!P.retired&&P.usaha.some(u=>['tambang','manufaktur','agro'].includes(u.k)),e:()=>{
  const u=P.usaha.find(x=>['tambang','manufaktur','agro'].includes(x.k));
  const hemat=Math.round(u.modal*ri(8,16)/100); P.kas+=hemat; P.heat=clamp(P.heat+ri(5,12),0,100);
  addLog('Limbah dibuang sembarangan, izin lingkungan diakali. '+u.n+' hemat '+rp(hemat)+', tapi sungai & warga sekitar yang menanggung.'+fx({reputasi:-4}),'bad'); milestone('Abaikan dampak lingkungan'); leg(1,-5);}},

/* ---- PRIBADI & UANG ---- */
{k:'investasi',tab:'pribadi',lbl:'Investasi pribadi',sub:'Saham/properti/emas, tumbuh pasif',multi:true,cond:()=>P.kas>=50e6,e:()=>{const x=Math.min(P.kas,ri(50,300)*1e6);P.kas-=x;P.investasi+=x;
  addLog('Anda parkir '+rp(x)+' di portofolio pribadi (saham, emas, properti) di luar bisnis inti.','sys');}},
{k:'gayaHidup',tab:'pribadi',lbl:'Naikkan gaya hidup',sub:'Rumah, mobil, status',cond:()=>P.kas>=500e6&&P.gaya!=='mewah',e:()=>{P.kas-=500e6;P.gaya='mewah';
  addLog('Rumah besar, mobil mewah, jam tangan kelas atas. Status sosial naik, tapi gengsi itu mahal dirawat.'+fx({stres:-5,reputasi:+2}),'good');}},
{k:'csr',tab:'pribadi',lbl:'Sedekah & CSR',sub:'Berbagi, bangun nama baik',multi:true,cond:()=>P.kas>=50e6,e:()=>{const x=Math.round(clamp(netWorth()*0.02,50e6,5e11));if(P.kas<x){addLog('Kas tak cukup.','sys');return;}P.kas-=x;P.csrTotal+=x;
  addLog('Anda menyalurkan '+rp(x)+' untuk beasiswa, masjid/gereja, bantuan bencana, dan UMKM binaan. Berkah, kata orang tua dulu.'+fx({reputasi:+3,stres:-2}),'good'); leg(0,4); if(P.csrTotal>=2e9)ach('dermawan');}},
{k:'haji',tab:'pribadi',lbl:'Naik haji / ziarah',sub:'Rp 500 jt · ketenangan & berkah',cond:()=>!P.hajiDone&&P.kas>=500e6,e:()=>{P.kas-=500e6;P.hajiDone=true;
  addLog('Anda menunaikan ibadah haji dari hasil usaha. Pulang dengan hati lapang dan niat berbisnis yang lebih lurus.'+fx({stres:-10,reputasi:+3}),'good'); stamp('HAJI','green'); milestone('Naik haji'); ach('berkah'); if(P.modusPajak==='patuh'&&P.suapKali===0)ach('mabrur'); leg(0,4);}},
{k:'relasiBina',tab:'pribadi',lbl:'Bina relasi & jejaring',sub:'Rp 30 jt · koneksi menguat',multi:true,cond:()=>P.kas>=30e6,e:()=>{P.kas-=30e6;P.st.relasi=clamp(P.st.relasi+ri(3,6),0,100);
  addLog('Makan malam dengan kolega, gabung asosiasi pengusaha, jaga silaturahmi. Koneksi adalah modal tak terlihat.'+fx({reputasi:+1}),'good');}}
];

function actAvail(a){
  if(P.penjara>0)return {ok:false,why:'Anda di dalam lapas'};
  if(a.cond&&!a.cond())return {ok:false,why:'Syarat belum terpenuhi'};
  if(!a.multi&&P.used[a.k])return {ok:false,why:'Sudah dilakukan tahun ini',used:true};
  return {ok:true};
}
function doAct(k){
  if(!P||G.current||G.over||!P.alive)return;
  const a=ACTS.find(x=>x.k===k);
  if(!a)return;
  const av=actAvail(a);
  if(!av.ok)return;
  if(!a.multi)P.used[k]=true;
  G.acted++;
  a.e();
  if(G.acted>5){ P.st.stres=clamp(P.st.stres+2,0,100); }
  checkAch();
  render();
}
