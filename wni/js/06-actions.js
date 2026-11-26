'use strict';
/* ================= AKSI ================= */
const TABS=[['diri','DIRI'],['kerja','KERJA & CUAN'],['sosial','SOSIAL'],['uang','UANG & UTANG'],['warga','URUSAN WARGA']];
const punyaKerjaTetap=()=>P.profesi==='karyawan'||P.profesi==='outsourcing'||P.profesi==='guru';
function bayar(x){ x=Math.round(x); if(P.saldo<x){ addLog('Saldo tidak cukup. Dompetmu menatap balik dengan kosong.','sys'); return false; } P.saldo-=x; return true; }

const ACTS=[
/* ---- DIRI ---- */
{k:'rebahan',tab:'diri',lbl:'Rebahan seharian',sub:'Kewarasan +4',e:()=>addLog('Kamu rebahan dari pagi sampai magrib. Tidak produktif, tapi jiwa terasa diisi ulang.'+fx({waras:+4,sehat:-1}))},
{k:'jogging',tab:'diri',lbl:'Jogging di CFD',sub:'Kesehatan +4',e:()=>addLog('Lari 2 km, foto 40 kali, unggah dengan caption "healthy lifestyle". Lalu sarapan bubur ayam porsi besar.'+fx({sehat:+4,gengsi:+2,waras:+2}))},
{k:'masak',tab:'diri',lbl:'Masak sendiri (meal prep)',sub:'Biaya makan bulan ini −22%',cond:()=>!P.masakBulan,e:()=>{P.masakBulan=true;addLog('Kamu masak tumis kangkung dan telur balado untuk seminggu, simpan di wadah plastik. Hemat dan bangga.'+fx({nrimo:+2,sehat:+1}),'good');}},
{k:'healing',tab:'diri',lbl:'Healing ke pantai/curug',sub:'Rp 600 rb · Kewarasan +12',e:()=>{ if(!bayar(600e3*N.harga))return; P.healingKali++;
  addLog(pick(['Kamu duduk di tepi pantai, menatap ombak, dan memikirkan... cicilan. Tapi tetap lebih baik dari di kos.','Air terjun yang dingin, jalan setapak yang licin, dan sinyal yang hilang total. Surga.','Staycation di hotel bintang 2 yang fotonya bintang 5. Tetap healing kok.'])+fx({waras:+12,sehat:+2}),'good'); }},
{k:'ibadah',tab:'diri',lbl:'Ibadah & kajian',sub:'Nrimo +3',e:()=>addLog('Kamu lebih rajin ibadah dan ikut kajian. Hati terasa lebih lapang menghadapi harga cabai.'+fx({nrimo:+3,waras:+2}))},
{k:'scroll',tab:'diri',lbl:'Scroll medsos sampai subuh',sub:'Gengsi naik, kewarasan turun',multi:true,e:()=>addLog('Satu video lagi. Satu lagi. Tiba-tiba azan subuh. Kamu tahu gosip artis, tapi tidak tahu kenapa hidupmu begini.'+fx({gengsi:+3,waras:-3,sehat:-1}),'bad')},
{k:'psikolog',tab:'diri',lbl:'Konsultasi psikolog',sub:'Rp 350 rb · Kewarasan +15',cond:()=>P.st.waras<65,e:()=>{ if(!bayar(350e3*N.harga))return;
  addLog('Psikolog mendengarkan tanpa menghakimi. Kamu menangis, lalu lega. Ternyata minta tolong bukan tanda lemah.'+fx({waras:+15,nrimo:+2}),'good'); }},
{k:'gaya',tab:'diri',lbl:'Atur gaya hidup',sub:'Hemat / normal / gengsi',e:()=>{
  ask({title:'GAYA HIDUP',text:'Sekarang: <b>'+P.gaya+'</b>. Mau seperti apa ke depannya?',opts:[
    {t:'Hemat garis keras',sub:'Biaya hidup −15%, kewarasan pelan-pelan turun',e:()=>{P.gaya='hemat';addLog('Mode hemat: masak sendiri, jalan kaki, tolak semua ajakan nongkrong.'+fx({gengsi:-5}));}},
    {t:'Normal saja',e:()=>{P.gaya='normal';addLog('Kamu memilih hidup biasa saja. Tidak pelit, tidak boros.');}},
    {t:'Gengsi dong',sub:'Biaya hidup +35%',e:()=>{P.gaya='gengsi';addLog('Kopi susu kekinian tiap hari, outfit baru tiap minggu. Feed Instagram rapi, rekening berantakan.'+fx({gengsi:+10,waras:+3}),'bad');}}]});}},

/* ---- KERJA & CUAN ---- */
{k:'lembur',tab:'kerja',lbl:'Lembur',sub:'Tambah penghasilan, kewarasan −',cond:punyaKerjaTetap,e:()=>{ P.lemburKali++;
  if(r()<0.35){ addLog('Kamu lembur sampai jam 10 malam. Lalu sadar: lembur di kantormu "sudah termasuk tanggung jawab", alias tidak dibayar.'+fx({waras:-6,sehat:-2,nrimo:+2}),'bad'); return; }
  const x=Math.round(P.gaji*0.15); addLog('Lembur 4 malam berturut-turut. Uang lembur '+rp(x)+' cair. Matamu seperti panda.'+fx({saldo:x,waras:-5,sehat:-2})); }},
{k:'narik',tab:'kerja',lbl:'Narik sampai larut malam',sub:'Tambah orderan, badan remuk',cond:()=>P.profesi==='ojol',e:()=>{ const x=Math.round(ri(8,16)*100e3*(P.motor?1:0.4));
  addLog('Kamu narik sampai jam 1 pagi. Dapat tambahan '+rp(x)+' dan pegal di seluruh punggung.'+fx({saldo:x,sehat:-4,waras:-3})); }},
{k:'konten',tab:'kerja',lbl:'Live jualan / bikin konten',sub:'Peluang laris (atau sepi)',cond:()=>P.profesi==='olshop'||P.profesi==='freelancer',e:()=>{
  if(r()<0.45){ const x=ri(5,20)*100e3; addLog('Live 3 jam, suara serak, tapi laku '+rp(x)+'. "Kakak-kakak, checkout sekarang ya!"'+fx({saldo:x,waras:-2}),'good'); }
  else addLog('Live 2 jam, penonton 4 orang, satu di antaranya ibumu. Tidak ada yang checkout.'+fx({waras:-4}),'bad'); }},
{k:'sampingan',tab:'kerja',lbl:'Ambil kerja sampingan',sub:'Jastip, les privat, desain',e:()=>{ P.sideKali++;
  const x=Math.round(ri(5,20)*100e3*(0.8+P.skill/200));
  addLog(pick(['Kamu buka jastip dari mal ke mal.','Kamu mengajar les privat anak SD yang lebih jago main HP darimu.','Kamu ambil proyek desain logo, revisi 11 kali, "bikin yang simpel tapi mewah ya kak".'])+' Hasilnya '+rp(x)+'.'+fx({saldo:x,waras:-4}),'good');
  if(P.sideKali>=5)ach('cuan'); }},
{k:'kursus',tab:'kerja',lbl:'Ikut kursus online / pelatihan',sub:'Skill +6',e:()=>addLog('Kamu ikut pelatihan online, dapat sertifikat PDF, dan mencantumkannya di LinkedIn dengan bangga.'+fx({skill:+6,waras:-1}),'good')},
{k:'naikGaji',tab:'kerja',lbl:'Minta naik gaji',sub:'Berani bicara',cond:()=>punyaKerjaTetap()&&P.bulanKerja>=6&&N.ke-P.naikGajiTerakhir>=6,e:()=>{ P.naikGajiTerakhir=N.ke;
  if(r()<0.2+P.skill/250+(P.orangDalam?0.3:0)){ const n=Math.round(P.gaji*ri(7,15)/100); P.gaji+=n; ach('naikKelas'); milestone('Naik gaji '+rp(n));
    addLog('Atasan setuju! Gaji naik '+rp(n)+'/bulan. Kamu menahan diri untuk tidak joget di pantry.'+fx({waras:+8,gengsi:+4}),'good'); }
  else addLog(pick(['"Kita ini keluarga, lho." Keluarga yang gajinya beda jauh.','"Nanti kita lihat di evaluasi akhir tahun ya." Akhir tahun yang mana, tidak disebut.','"Perusahaan sedang efisiensi." Lalu direksi ganti mobil dinas.'])+fx({waras:-5}),'bad'); }},
{k:'lamar',tab:'kerja',lbl:'Lamar kerja baru',sub:'Kirim CV ke mana-mana',e:()=>{
  if(P.orangDalam&&r()<0.8)tawaranKerja('Belum sempat kirim lamaran, om kenalan papa sudah menelepon HRD.');
  else if(r()<0.3+P.skill/200)tawaranKerja('Dari 40 lamaran yang kamu sebar, ada yang membalas!');
  else addLog('Kamu mengirim 40 lamaran. Balasan: 2 penolakan otomatis, 1 tawaran jadi "agen asuransi", dan 37 sunyi.'+fx({waras:-4,skill:+1}),'bad'); }},
{k:'resign',tab:'kerja',lbl:'Resign',sub:'Bebas, tapi tanpa gaji',cond:()=>!!P.profesi,e:()=>ask({title:'YAKIN RESIGN?',text:'Kamu akan kehilangan penghasilan tetap. Saldo sekarang: <b>'+rp(P.saldo)+'</b>.',opts:[
  {t:'Ya, aku butuh hidup baru',e:()=>{ milestone('Resign dari '+P.profesiN); addLog('Kamu menyerahkan surat resign. Rasanya seperti melepas ransel 40 kg. Lalu sadar: ransel itu juga berisi gaji.'+fx({waras:+15,gengsi:-3}),'sys'); P.profesi=null; P.profesiN='Pencari kerja'; P.gaji=0; }},
  {t:'Tidak jadi',e:()=>{}}]})},

/* ---- SOSIAL ---- */
{k:'nongkrong',tab:'sosial',lbl:'Nongkrong di coffee shop',sub:'±Rp 150 rb · relasi & gengsi',e:()=>{ if(!bayar(150e3*N.harga))return;
  addLog('Es kopi susu gula aren, laptop terbuka (tidak dipakai), obrolan ngalor-ngidul sampai tutup.'+fx({relasi:+4,gengsi:+3,waras:+3})); }},
{k:'telponOrtu',tab:'sosial',lbl:'Video call orang tua',sub:'Relasi & nrimo naik',e:()=>{
  if(!P.menikah&&r()<0.35)addLog('Obrolan hangat... sampai ibu bertanya "Anaknya Bu RT sudah nikah lho, kamu kapan?" Sinyal tiba-tiba "putus-putus".'+fx({relasi:+3,waras:-3}));
  else addLog('Ibu cerita soal ayam tetangga, bapak menunjukkan tanaman cabainya. Sederhana, dan entah kenapa menenangkan.'+fx({relasi:+5,nrimo:+2,waras:+2}),'good'); }},
{k:'pulkam',tab:'sosial',lbl:'Pulang kampung sebentar',sub:'±Rp 600 rb · relasi & kewarasan',cond:()=>P.latar!=='yatim',e:()=>{ if(!bayar(600e3*N.harga))return;
  addLog('Kamu pulang akhir pekan. Makan masakan ibu, tidur di kamar lama, dibekali rendang dan beras. Sementara, semua terasa baik-baik saja.'+fx({relasi:+10,waras:+8,nrimo:+2}),'good'); }},
{k:'arisan',tab:'sosial',lbl:'Ikut arisan kantor/RT',sub:'Rp 300 rb/bulan, sekali "menang"',cond:()=>!P.arisan,e:()=>{ P.arisan=true; P.arisanDapat=N.ke+ri(2,11);
  addLog('Kamu ikut arisan Rp 300 rb per bulan. Isinya: kocok nama, gosip, dan kue lapis. Tabungan paksa versi sosial.'+fx({relasi:+5})); }},
{k:'jodoh',tab:'sosial',lbl:'Cari jodoh di aplikasi kencan',sub:'Siapa tahu',cond:()=>!P.pasangan,e:()=>{
  if(r()<0.3){ P.pasangan=true; P.pacaranSejak=N.ke; milestone('Punya pasangan'); addLog('Setelah 200 swipe dan 3 kali di-ghosting, kamu bertemu seseorang yang nyambung. Kalian janjian makan bakso. Ada yang berdebar.'+fx({waras:+10,gengsi:+3}),'good'); }
  else addLog(pick(['Match pertamamu langsung menawarkan bisnis MLM.','Kencan pertama: dia datang terlambat 2 jam dan minta kamu bayarin.','Kamu di-ghosting setelah obrolan seru 3 hari. Seperti tidak pernah ada.'])+fx({waras:-3}),'bad'); }},
{k:'kencan',tab:'sosial',lbl:'Kencan dengan pasangan',sub:'±Rp 200 rb',cond:()=>P.pasangan,e:()=>{ if(!bayar(200e3*N.harga))return;
  addLog('Makan malam di warung tenda, jalan-jalan keliling kota naik motor. Murah, tapi bahagia.'+fx({waras:+6,relasi:+3}),'good'); }},
{k:'kerjaBakti',tab:'sosial',lbl:'Ikut kerja bakti & ronda',sub:'Relasi tetangga naik',e:()=>addLog('Kamu ikut kerja bakti bersihkan selokan dan ronda malam. Dapat kopi, gorengan, dan gosip terbaru RT.'+fx({relasi:+6,sehat:+1,nrimo:+2}))},

/* ---- UANG & UTANG ---- */
{k:'nabung',tab:'uang',lbl:'Nabung (dana darurat)',sub:'Pindahkan saldo ke tabungan',multi:true,cond:()=>P.saldo>=500e3,e:()=>{
  const opsi=[500e3,1e6,2e6,5e6].filter(x=>x<=P.saldo);
  ask({title:'NABUNG',text:'Saldo: <b>'+rp(P.saldo)+'</b>. Mau sisihkan berapa ke tabungan (bunga kecil, tapi aman dari jari-jari belanja)?',
    opts:opsi.map(x=>({t:rp(x),e:()=>{ P.saldo-=x; P.tabungan+=x; addLog('Kamu menabung '+rp(x)+'. Masa depan berterima kasih.'+fx({nrimo:+1}),'good'); checkAch(); }})).concat([{t:'Batal',e:()=>{}}])}); }},
{k:'emas',tab:'uang',lbl:'Beli emas',sub:'Naik-turun, tapi cenderung naik',multi:true,cond:()=>P.saldo>=1e6,e:()=>{
  const opsi=[1e6,3e6,5e6].filter(x=>x<=P.saldo);
  ask({title:'BELI EMAS',text:'Harga emas sedang "tinggi" (selalu tinggi, katanya). Mau beli berapa?',
    opts:opsi.map(x=>({t:rp(x),e:()=>{ P.saldo-=x; P.emas+=Math.round(x*0.95); P.emasModal+=x; addLog('Kamu beli emas '+rp(x)+' (selisih jual-beli 5%, ikhlaskan). Disimpan di dompet digital, atau di bawah kasur.','good'); ach('emas'); }})).concat([{t:'Batal',e:()=>{}}])}); }},
{k:'tarik',tab:'uang',lbl:'Tarik tabungan / jual emas',sub:'Kembalikan ke saldo',multi:true,cond:()=>P.tabungan+P.emas>0,e:()=>{
  ask({title:'TARIK DANA',text:'Tabungan '+rp(P.tabungan)+' · Emas '+rp(P.emas)+'.',opts:[
    {t:'Tarik semua tabungan',cond:()=>P.tabungan>0,e:()=>{ P.saldo+=P.tabungan; addLog('Kamu tarik '+rp(P.tabungan)+' dari tabungan. Semoga untuk hal yang darurat sungguhan.','sys'); P.tabungan=0; }},
    {t:'Jual semua emas',cond:()=>P.emas>0,e:()=>{ P.saldo+=P.emas; addLog('Kamu jual emas senilai '+rp(P.emas)+'.','sys'); P.emas=0; P.emasModal=0; }},
    {t:'Batal',e:()=>{}}]}); }},
{k:'bayarUtang',tab:'uang',lbl:'Bayar utang pinjol',sub:'Kurangi utang berbunga',multi:true,cond:()=>P.utang>0&&P.saldo>0,e:()=>{
  const x=Math.min(P.utang,P.saldo); P.saldo-=x; P.utang-=x;
  addLog('Kamu bayar utang '+rp(x)+'. Sisa utang: '+rp(P.utang)+'.'+fx({waras:+3}),'good'); if(P.utang<=0)lunasSemua(); }},
{k:'pinjol',tab:'uang',lbl:'Ajukan pinjol',sub:'Cair cepat, bunga 5%/bulan',multi:true,e:()=>ask({title:'AJUKAN PINJOL',text:'Aplikasi menawarkan limit menggiurkan. Bunga 5% per bulan "sudah termasuk biaya layanan".',opts:[
  {t:'Rp 2 jt',e:()=>ambilPinjol(2e6)},{t:'Rp 5 jt',e:()=>ambilPinjol(5e6)},{t:'Rp 10 jt',e:()=>ambilPinjol(10e6)},{t:'Batal',e:()=>{}}]})},
{k:'kreditMotor',tab:'uang',lbl:'Kredit motor',sub:'DP Rp 2 jt, cicilan 24 bulan',cond:()=>!P.motor&&P.saldo>=2e6,e:()=>{ P.saldo-=2e6; P.motor=true; tambahCicilan('Kredit motor',18e6,24,true);
  addLog('Motor baru! Leasing tersenyum. Ongkos transport turun, cicilan naik. Matematika hidup memang aneh.'+fx({gengsi:+5,waras:+4}),'good'); milestone('Kredit motor'); }},
{k:'kpr',tab:'uang',lbl:'Ambil KPR rumah subsidi',sub:'DP Rp 10 jt, tidak perlu bayar kos lagi',cond:()=>!P.rumah&&punyaKerjaTetap()&&P.saldo+P.tabungan>=10e6,e:()=>{
  let dp=10e6; const dariTab=Math.min(P.tabungan,dp); P.tabungan-=dariTab; P.saldo-=(dp-dariTab);
  P.rumah=true; P.cicilan.push({n:'KPR rumah subsidi',per:Math.round(1.3e6*N.harga),sisa:180,utang:false}); ach('rumah'); stamp('PUNYA RUMAH','green'); milestone('Akad KPR rumah subsidi');
  addLog('Akad KPR! Rumah tipe 36, 2 jam dari tempat kerja, di perumahan yang jalannya belum diaspal. Tapi ini rumahmu sendiri.'+fx({waras:+12,gengsi:+6,relasi:+3}),'good'); }},
{k:'slot',tab:'uang',lbl:'Coba slot "gacor"',sub:'Katanya gampang menang...',cond:()=>P.judol>=20,multi:true,e:()=>{
  const x=Math.min(Math.max(P.saldo,0),Math.round(ri(2,10)*100e3)); if(x<=0){ addLog('Saldo kosong. Untung saja.','sys'); return; }
  P.judol=clamp(P.judol+10,0,100); P.burukKali++;
  if(r()<0.25){ P.saldo+=x; addLog('Menang '+rp(x)+'! Kamu yakin sudah menemukan polanya. (Belum. Tidak ada polanya.)','bad'); }
  else { P.saldo-=x; P.judolRugi+=x; addLog('Kalah '+rp(x)+'. "Sekali lagi pasti balik."'+fx({waras:-6}),'bad'); } }},

/* ---- URUSAN WARGA ---- */
{k:'dokumen',tab:'warga',lbl:'Urus KTP/SIM/dokumen',sub:'Siapkan mental',e:()=>ask({title:'KANTOR PELAYANAN',text:'Kamu datang jam 7 pagi. Petugas: "Sistemnya lagi offline, Mas/Mbak. Bisa balik besok. Atau... bisa dibantu."',opts:[
  {t:'Balik besok, ikut prosedur',e:()=>addLog('Kamu bolak-balik 3 hari. Dokumen jadi. Kamu jadi lebih tua dan lebih bijak.'+fx({waras:-4,nrimo:+4}),'good')},
  {t:'"Dibantu" saja',sub:'Rp 150 rb',e:()=>addLog('Dokumen jadi dalam 15 menit. Cepat, efisien, dan sedikit menyedihkan.'+fx({saldo:-150e3,nrimo:-2}),'bad')}]})},
{k:'bpjs',tab:'warga',lbl:'Berobat pakai BPJS',sub:'Antre dari subuh',cond:()=>P.st.sehat<70,e:()=>{ ach('bpjs');
  addLog('Faskes 1, rujukan, antre poli, antre apotek. Total 7 jam. Obat gratis, sehat pulih, betis pegal.'+fx({sehat:+12,waras:-3,nrimo:+2}),'good'); }},
{k:'lapor',tab:'warga',lbl:'Lapor jalan rusak di medsos',sub:'Siapa tahu viral',e:()=>{
  if(r()<0.3){ P.viralKali++; ach('viral'); addLog('Videomu viral! Dua hari kemudian jalan ditambal. Pejabat setempat datang foto-foto di depan tambalan.'+fx({gengsi:+6,relasi:+4,waras:+5}),'good'); }
  else addLog('Postinganmu tenggelam di antara video kucing dan drama artis. Lubangnya masih di sana, menunggu korban.'+fx({nrimo:+2})); }},
{k:'bansos',tab:'warga',lbl:'Daftar bansos',sub:'Kalau memang layak',cond:()=>!P.profesi||P.gaji<=2.5e6,e:()=>{
  if(r()<0.35){ const x=600e3; addLog('Kamu terdaftar! Bantuan '+rp(x)+' cair. Sementara itu, tetangga dengan dua mobil juga dapat. Misteri birokrasi.'+fx({saldo:x}),'good'); }
  else addLog('Datamu "belum masuk DTKS". Kamu diminta ke kelurahan, lalu ke dinas, lalu kembali ke kelurahan.'+fx({waras:-4,nrimo:+2}),'bad'); }},
{k:'sumbang',tab:'warga',lbl:'Sumbang tempat ibadah / panti',sub:'Rp 100 rb',e:()=>{ if(!bayar(100e3))return; addLog('Sedikit, tapi ikhlas. Hati terasa lebih ringan.'+fx({nrimo:+3,relasi:+2,waras:+2}),'good'); }},
{k:'kabur',tab:'warga',lbl:'#KaburAjaDulu (kerja ke luar negeri)',sub:'Butuh skill 60 & dana Rp 25 jt',cond:()=>P.skill>=60&&P.saldo+P.tabungan>=25e6,e:()=>ask({title:'#KABURAJADULU',text:'Visa kerja, sertifikat bahasa, tiket, dan biaya agen resmi siap. Ini keputusan besar: berkasmu di sini akan ditutup.',opts:[
  {t:'Berangkat',e:()=>{ let x=25e6; const dt=Math.min(P.tabungan,x); P.tabungan-=dt; P.saldo-=(x-dt); akhir('diaspora'); }},
  {t:'Belum sekarang',e:()=>{}}]})},
{k:'tutup',tab:'warga',lbl:'Tutup berkas (akhiri)',sub:'Lihat penilaian sekarang',cond:()=>N.ke>=12,e:()=>ask({title:'TUTUP BERKAS?',text:'Akhiri perjalanan sekarang dan lihat penilaian?',opts:[
  {t:'Ya, tutup berkas',e:()=>akhir('tutup')},{t:'Belum',e:()=>{}}]})}
];

function actAvail(a){
  if(a.cond&&!a.cond())return {ok:false,why:'Syarat belum terpenuhi'};
  if(!a.multi&&P.used[a.k])return {ok:false,why:'Sudah dilakukan bulan ini',used:true};
  return {ok:true};
}
function doAct(k){
  if(!P||G.current||G.over)return;
  const a=ACTS.find(x=>x.k===k);
  if(!a)return;
  const av=actAvail(a);
  if(!av.ok)return;
  if(!a.multi)P.used[k]=true;
  G.acted++;
  a.e();
  if(G.acted>3&&!G.over){ P.st.waras=clamp(P.st.waras-2,0,100); }   /* bulan terlalu padat = capek */
  endCheck();
  checkAch();
  render();
}
