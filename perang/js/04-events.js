'use strict';
/* ================= AKHIR PERANG & PERUNDINGAN ================= */
/* nilai hasil damai dari posisi garis depan dibanding tujuan perang */
function hasilDamai(){
  const f=N.front, t=P.tujuan;
  if(t==='bertahan')return f>=-5?'menangTerbatas':f>=-18?'damai':'damaiRugi';
  if(t==='sengketa')return f>=25?'menangTerbatas':f>=-8?'damai':'damaiRugi';
  return f>=60?'menangTerbatas':f>=-8?'damai':'damaiRugi';
}
/* peluang lawan menerima gencatan senjata */
function peluangDamai(){
  const B=N.e;
  let p=0.12+(100-B.st.tekad)/140+(N.minggu>40?0.1:0)+(P.st.dunia-50)/400;
  if(N.front<-15)p+=0.25;            /* lawan sedang unggul: mau berdamai dengan menahan wilayah rampasan */
  if(N.front>20&&B.st.tekad>55)p-=0.15;
  return clamp(p,0.05,0.92);
}
function cekAkhir(){
  if(G.over||!P.f||!N.e)return;
  const B=N.e, cB=NEG[B.k], cA=NEG[P.neg];
  /* ---- ambang nuklir: negara bernuklir yang terpojok ---- */
  /* negara bernuklir tidak bisa ditundukkan total tanpa melewati ambang nuklir sekali */
  if(cB.nuklir>0&&!N._ambangSudah&&(N.front>=100||B.st.tekad<=0)){ N.front=Math.min(N.front,96); B.st.tekad=Math.max(B.st.tekad,6); N.eskalasi=100; }
  if(N.eskalasi>=100&&!N._ultimatum){ N._ultimatum=true; ambangNuklir(); return; }
  if(N.front>=100){ akhiri('menang','Ibu kota '+cB.n+' jatuh. Bendera putih berkibar di gedung pemerintahannya.'); return; }
  if(B.st.tekad<=0){ akhiri(N.front>=40||P.tujuan!=='total'?(P.tujuan==='total'?'menang':'menangTerbatas'):'menangTerbatas','Tekad '+cB.n+' runtuh. Utusannya datang meminta syarat damai.'); return; }
  if(N.front<=-100){ akhiri('kalah','Ibu kota jatuh. Pemerintah mengungsi, dan perlawanan terorganisasi berakhir.'); return; }
  if(P.f.pasukan<P.awal.pasukan*0.12&&P.f.cad<1){ akhiri('kalah','Angkatan bersenjata Anda nyaris habis. Tidak ada lagi yang bisa dikirim ke depan.'); return; }
  if(P.st.publik<=5){ akhiri('jatuh','Jalanan dipenuhi massa. Pemerintah jatuh, dan penggantinya langsung meminta gencatan senjata.'); return; }
  if(N.minggu>=MAKS_MINGGU){ akhiri('beku','Satu setengah tahun berlalu. Garis depan mengeras jadi perbatasan tak resmi yang dijaga kawat berduri.'); return; }
}
function ambangNuklir(){
  const cB=NEG[N.e.k], cA=NEG[P.neg];
  ach('ambang'); stamp('AMBANG NUKLIR');
  const duaDua=cA.nuklir>0&&cB.nuklir>0;
  ask({title:'AMBANG NUKLIR',text:'Satelit menangkap peluncur rudal '+(cB.nuklir?cB.n:cA.n)+' keluar dari bunker. '+(duaDua?'Kedua pihak kini menggenggam pemicu yang sama.':'Pesannya jelas: berhenti, atau tidak ada yang tersisa untuk dimenangkan.')+' Dunia menahan napas.',opts:[
    {t:'Hentikan operasi & berunding sekarang',sub:'Perang berakhir di garis saat ini',e:()=>{ N.eskalasi=40; P.tawananBaik+=0; addLog('Anda memerintahkan semua satuan berhenti menembak. Jalur telepon darurat antaribu kota tersambung.'+fx({dunia:+10}),'good'); akhiri(hasilDamai(),'Perundingan darurat di bawah bayang-bayang nuklir menghasilkan gencatan senjata.'); }},
    {t:'Terus menekan — itu cuma gertakan',sub:'Bertaruh dengan nasib jutaan orang',e:()=>{
      if(r()<0.5){ N.eskalasi=65; N._ultimatum=false; N._ambangSudah=true; addLog('Peluncur itu kembali masuk bunker. Gertakan — kali ini. Para jenderal Anda pucat pasi.'+fx({dunia:-12,moral:-4}),'bad'); }
      else { P.kiamat=true; ach('kiamat'); akhiri('kiamat','Kilatan pertama terlihat dari jarak ratusan kilometer. Dalam satu jam, kota-kota di kedua negara tinggal bayangan di tembok.'); } }}
  ]});
}

/* ================= KEJADIAN MINGGUAN ================= */
const EVENTS=[
{k:'lumpur',w:3,cd:10,run:()=>{ N.cuaca='lumpur'; N.cuacaSisa=ri(2,4); addLog('Musim hujan datang lebih awal. Jalan berubah jadi lumpur; tank dan truk logistik terbenam sampai as roda. Semua gerak maju melambat.','sys'); }},
{k:'kepung',w:3,cd:8,cond:()=>N.front>10,run:()=>ask({title:'KOTA TERKEPUNG',text:'Pasukan Anda mengepung sebuah kota lawan. Di dalamnya masih ada ratusan ribu warga sipil, dan garnisun menolak menyerah.',opts:[
  {t:'Buka koridor kemanusiaan dulu',sub:'Warga keluar · operasi tertunda',e:()=>{ P.koridor++; N.jeda=true; addLog('Selama tiga hari senjata diam dan bus-bus pengungsi melintas. Garnisun memakai jeda itu untuk memperkuat diri, tapi puluhan ribu nyawa selamat.'+fx({dunia:+5,publik:+1}),'good'); if(P.koridor>=3)ach('koridor'); }},
  {t:'Kepung sampai lapar',sub:'Lambat · warga ikut menderita',e:()=>{ const k=0.5+r()*1.5; P.sipilLawan+=k; addLog('Kota dikepung berminggu-minggu. Garnisun akhirnya menyerah, setelah sekitar '+org(k)+' warga mati kelaparan dan kedinginan.'+fx({front:+2,dunia:-5,tekad:-3}),'bad'); }},
  {t:'Serbu & ratakan',sub:'Cepat · korban sipil besar',e:()=>{ const k=2+r()*4; P.sipilLawan+=k; P.kejahatan++; addLog('Artileri menghantam blok demi blok. Kota jatuh dalam lima hari; sekitar '+org(k)+' warga sipil tewas di reruntuhan.'+fx({front:+4,dunia:-10,tekad:+2,moral:-2}),'bad'); ach('penjahat'); }}
]})},
{k:'tawanan',w:3,cd:7,cond:()=>P.tewasLawan>1,run:()=>ask({title:'TAWANAN PERANG',text:'Ribuan prajurit lawan menyerah dalam satu pekan. Intelijen yakin beberapa perwira tahu letak depot amunisi mereka.',opts:[
  {t:'Perlakukan sesuai Konvensi Jenewa',e:()=>{ P.tawananBaik++; addLog('Tawanan diberi makan, dirawat, dan didata Palang Merah. Kabar itu menyebar ke parit lawan: menyerah ke pihak Anda berarti hidup.'+fx({dunia:+4,mMoral:-4}),'good'); if(P.tawananBaik>=3)ach('jenewa'); }},
  {t:'Interogasi "dengan segala cara"',e:()=>{ P.kejahatan++; addLog('Letak depot didapat. Caranya tidak akan pernah tertulis di laporan resmi, tapi para penjaga tahu.'+fx({mLog:-10,mAmu:-8,dunia:-6,moral:-2}),'bad'); ach('penjahat'); }},
  {t:'Tukar dengan tawanan kita',e:()=>addLog('Pertukaran tawanan berlangsung di jembatan netral. Keluarga-keluarga di rumah menangis lega.'+fx({publik:+4,moral:+3}),'good')}
]})},
{k:'salahSasaran',w:2,cd:9,cond:()=>P.post.u==='strategis'||P.post.u==='cas',run:()=>{ const k=0.05+r()*0.3; P.sipilLawan+=k; ask({title:'SALAH SASARAN',text:'Sebuah bom Anda menghantam '+pick(['sekolah yang dijadikan tempat pengungsian','rumah sakit lapangan','pasar yang sedang ramai'])+'. Sekitar '+org(k)+' warga sipil tewas. Rekamannya sudah beredar.',opts:[
  {t:'Akui, selidiki, hukum yang lalai',e:()=>addLog('Anda mengakui kesalahan itu di depan pers dan membentuk tim penyelidik. Pahit, tapi dunia mencatat bedanya.'+fx({dunia:-2,moral:-1}),'sys')},
  {t:'Sangkal: "itu sasaran militer"',e:()=>{ P.kejahatan++; addLog('Juru bicara Anda menyebutnya sasaran sah. Citra satelit berkata lain, dan media dunia memuat keduanya berdampingan.'+fx({dunia:-8}),'bad'); }}
]}); }},
{k:'mediator',w:3,cd:10,cond:()=>N.minggu>=8,run:()=>ask({title:'UTUSAN PBB',text:'Seorang utusan khusus PBB menawarkan diri menjadi penengah. Garis depan saat ini '+teksFront()+'.',opts:[
  {t:'Terima mediasi',e:()=>{ P.tawarDamai++; if(r()<peluangDamai()+0.15){ addLog('Setelah sepuluh hari berunding di kota netral, kedua pihak meneken gencatan senjata.'+fx({dunia:+6}),'good'); akhiri(hasilDamai(),'Perang diakhiri di meja perundingan lewat mediasi PBB.'); } else addLog('Perundingan buntu. '+NEG[N.e.k].n+' merasa masih bisa menang di medan perang.'+fx({dunia:+3})); }},
  {t:'Tolak — perang belum selesai',e:()=>addLog('Anda menolak dengan sopan. Utusan itu pulang membawa map kosong.'+fx({dunia:-3}))}
]})},
{k:'sekutuTawar',w:2,cd:12,cond:()=>P.st.dunia>=55,run:()=>{ const c=NEG[P.neg]; const jet=Math.max(4,Math.round(c.jet*0.08)), tank=Math.max(10,Math.round(c.tank*0.1)); ask({title:'TAWARAN SEKUTU',text:'Negara sahabat menawarkan paket senjata: '+jet+' pesawat tempur dan '+tank+' tank, dengan syarat Anda tidak menyerang sasaran sipil.',opts:[
  {t:'Terima dengan syaratnya',e:()=>{ P.pesanan.push({tiba:N.minggu+3,apa:{jet,tank},n:jet+' pesawat & '+tank+' tank dari sekutu'}); P.bantuan++; P.syaratSekutu=true; addLog('Paket bantuan disetujui dan tiba tiga minggu lagi.'+fx({moral:+3}),'good'); if(P.bantuan>=2)ach('sekutu'); }},
  {t:'Tolak — tak mau diatur',e:()=>addLog('Anda menolak bantuan bersyarat. Kedaulatan utuh, gudang tetap kosong.'+fx({dunia:-2}))}
]}); }},
{k:'desersi',w:2,cd:8,cond:()=>P.st.moral<40,run:()=>{ const x=P.f.pasukan*0.02; P.f.pasukan-=x; addLog('Gelombang desersi: sekitar '+org(x)+' prajurit meninggalkan pos di malam hari. Moral yang rendah lebih mematikan daripada artileri.'+fx({moral:-2}),'bad'); }},
{k:'sabotase',w:2,cd:9,run:()=>ask({title:'SABOTASE DI GARIS BELAKANG',text:'Sebuah depot bahan bakar Anda meledak. Polisi militer menahan tiga pekerja yang dicurigai.',opts:[
  {t:'Perketat pengamanan depot',sub:usd(biayaMinggu()*0.3),e:()=>addLog('Penjagaan dilipatgandakan. Mahal, tapi ledakan berikutnya urung terjadi.'+fx({dana:-Math.round(biayaMinggu()*0.3),logistik:-4}))},
  {t:'Biarkan, fokus ke depan',e:()=>addLog('Anda tidak mau menarik pasukan dari front. Dua depot lagi terbakar dalam sebulan.'+fx({logistik:-10}),'bad')}
]})},
{k:'membelot',w:1,cd:20,cond:()=>N.e.st.moral<45,run:()=>{ N.e.f.jet=Math.max(0,N.e.f.jet-1); P.intel=Math.max(P.intel,4); addLog('Seorang pilot lawan membelot dan mendarat di pangkalan Anda, membawa pesawat utuh dan peta pertahanan udara terbaru.'+fx({mMoral:-3}),'good'); }},
{k:'siber',w:2,cd:9,run:()=>{ const tahan=NEG[P.neg].tek>=70; addLog(tahan?'Serangan siber lawan menghantam jaringan komando Anda, tetapi sistem cadangan mengambil alih dalam hitungan menit.':'Serangan siber melumpuhkan jaringan logistik Anda selama tiga hari. Truk-truk menunggu perintah yang tak kunjung datang.'+fx({logistik:-7}),tahan?'sys':'bad'); }},
{k:'pengungsi',w:2,cd:10,cond:()=>N.front<-10,run:()=>ask({title:'GELOMBANG PENGUNGSI',text:'Ratusan ribu warga Anda mengungsi dari daerah pertempuran. Jalan raya utama macet total oleh gerobak dan mobil keluarga.',opts:[
  {t:'Dahulukan pengungsi',sub:'Logistik tersendat seminggu',e:()=>{ P.evakuasi=Math.max(P.evakuasi,4); addLog('Konvoi militer menepi, memberi jalan kepada pengungsi. Para prajurit membagi ransum mereka di pinggir jalan.'+fx({logistik:-6,publik:+5,moral:+2}),'good'); }},
  {t:'Jalan untuk militer dulu',e:()=>{ const k=0.1+r()*0.3; P.sipilKita+=k; addLog('Pengungsi digiring ke jalan-jalan kecil. Sebagian terjebak tembakan artileri di persimpangan.'+fx({publik:-6}),'bad'); }}
]})},
{k:'jenderal',w:2,cd:12,cond:()=>P.post.d==='bertahan'||P.post.d==='mundur',run:()=>ask({title:'JENDERAL TAK SABAR',text:'Seorang jenderal lapangan mendesak ofensif balasan. "Pasukan saya siap. Tiap hari menunggu, musuh makin kuat."',opts:[
  {t:'Izinkan serangan terbatas',e:()=>{ if(r()<0.35+P.st.moral/250){ addLog('Serangan malam itu menembus sayap lawan. Sang jenderal mengirim foto dirinya di atas tank rampasan.'+fx({front:+3,moral:+4,amunisi:-5}),'good'); } else { const x=P.f.pasukan*0.01; P.f.pasukan-=x; P.tewas+=x*0.4; addLog('Serangan itu menabrak ladang ranjau yang tidak terpetakan. '+org(x)+' prajurit jadi korban.'+fx({moral:-4,amunisi:-5}),'bad'); } }},
  {t:'Tahan — pertahanan dulu',e:()=>addLog('Anda menolak. Sang jenderal mendengus, tapi garis pertahanan tetap utuh.'+fx({moral:-1}))}
]})},
{k:'pedagang',w:1,cd:14,cond:()=>P.st.amunisi<35,run:()=>ask({title:'PEDAGANG SENJATA GELAP',text:'Seorang perantara menawarkan satu kapal penuh amunisi artileri "tanpa asal-usul". Harganya tiga kali lipat harga pasar.',opts:[
  {t:'Beli',sub:usd(biayaMinggu()*2.5),cond:()=>P.dana>=biayaMinggu()*2.5,e:()=>addLog('Peti-peti tanpa label dibongkar tengah malam. Meriam kembali bersuara.'+fx({dana:-Math.round(biayaMinggu()*2.5),amunisi:+28,dunia:-2}),'sys')},
  {t:'Tolak',e:()=>addLog('Anda menolak berurusan dengan pasar gelap.')}
]})},
{k:'makam',w:1,cd:30,cond:()=>P.kejahatan>=2,run:()=>addLog('Tim forensik internasional menemukan kuburan massal di wilayah yang pernah dikuasai pasukan Anda. Nama Anda mulai disebut di Den Haag.'+fx({dunia:-12,publik:-4}),'bad')},
{k:'dingin',w:2,cd:20,cond:()=>N.minggu%52>=44||N.minggu%52<=6,run:()=>addLog('Musim dingin menggigit garis depan. Mesin beku, jari membiru; pihak yang logistiknya rapi yang bertahan.'+fx({logistik:-3,moral:P.st.logistik>=60?0:-3}),'sys')}
];
function teksFront(){
  const f=N.front;
  if(f>=70)return 'sudah dekat ibu kota lawan';
  if(f>=25)return 'jauh di dalam wilayah lawan';
  if(f>5)return 'sedikit masuk wilayah lawan';
  if(f>=-5)return 'di sekitar perbatasan';
  if(f>-25)return 'sedikit masuk wilayah Anda';
  if(f>-70)return 'jauh di dalam wilayah Anda';
  return 'mendekati ibu kota Anda';
}
function events(){
  const B=N.e, cB=NEG[B.k], cA=NEG[P.neg];
  /* cuaca pulih */
  if(N.cuaca!=='cerah'){ N.cuacaSisa--; if(N.cuacaSisa<=0){ N.cuaca='cerah'; addLog('Tanah mengering. Roda dan rantai tank kembali bisa bergerak.','sys'); } }
  /* eskalasi nuklir: negara bernuklir yang terpojok di tanahnya sendiri */
  if(cB.nuklir>0&&N.front>=65){ N.eskalasi=clamp(N.eskalasi+ri(12,20)+(B.st.tekad<25?10:0),0,100); addLog('Retorika nuklir '+cB.n+' mengeras seiring pasukan Anda mendekati jantung negerinya. <span class="d">(Eskalasi nuklir '+Math.round(N.eskalasi)+'/100)</span>','bad'); }
  else if(N.eskalasi>0&&!(cA.nuklir>0&&N.front<=-65))N.eskalasi=clamp(N.eskalasi-3,0,100);
  /* tujuan tercapai → kesempatan berdamai dari posisi kuat */
  const capai=(P.tujuan==='bertahan'&&N.front>=0)||(P.tujuan==='sengketa'&&N.front>=30);
  N.tahan=capai?N.tahan+1:0;
  if(capai&&N.tahan>=3&&siap('tawarCapai',6)){
    pakai('tawarCapai');
    ask({title:'TUJUAN TERCAPAI',text:(P.tujuan==='bertahan'?'Wilayah Anda sudah bersih dari pasukan lawan.':'Wilayah sengketa sudah Anda kuasai dan bertahan tiga minggu.')+' '+cB.n+' memberi isyarat siap berunding.',opts:[
      {t:'Berdamai dari posisi menang',e:()=>{ if(r()<clamp(peluangDamai()+0.35,0.3,0.97)){ ach('damai'); akhiri('menangTerbatas','Anda berhenti saat tujuan tercapai. Perjanjian damai diteken, dan pasukan pulang membawa kemenangan yang terukur.'); } else addLog(cB.n+' menolak syarat Anda dan memilih terus bertempur.','bad'); }},
      {t:'Teruskan — kejar sampai hancur',e:()=>{ if(P.tujuan!=='total'){ P.agresor=true; addLog('Anda melampaui tujuan awal. Dunia mulai bertanya siapa sebenarnya penyerang dalam perang ini.'+fx({dunia:-8,tekad:+6}),'bad'); } }}
    ]});
  }
  /* lawan menawarkan damai saat goyah */
  if(B.st.tekad<28&&N.front>-10&&siap('lawanDamai',5)&&r()<0.5){
    pakai('lawanDamai');
    ask({title:'UTUSAN LAWAN',text:cB.n+' mengirim utusan lewat negara ketiga: mereka siap menghentikan perang di garis saat ini ('+teksFront()+').',opts:[
      {t:'Terima gencatan senjata',e:()=>{ ach('damai'); akhiri(hasilDamai(),'Tawaran damai lawan Anda terima. Senjata diam mulai tengah malam.'); }},
      {t:'Tolak — menyerah tanpa syarat',e:()=>addLog('Anda menuntut penyerahan tanpa syarat. Lawan yang putus asa bertempur lebih nekat.'+fx({tekad:+8,dunia:-4}),'bad')}
    ]});
  }
  /* kejadian acak */
  if(r()<0.42){
    const pool=EVENTS.filter(e=>siap('ev_'+e.k,e.cd)&&(!e.cond||e.cond()));
    if(pool.length){
      let tot=pool.reduce((a,e)=>a+e.w,0), x=r()*tot, ev=pool[0];
      for(const e of pool){ x-=e.w; if(x<=0){ ev=e; break; } }
      pakai('ev_'+ev.k); ev.run();
    }
  }
}
