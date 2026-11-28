'use strict';
/* ================= AKSI ================= */
const TABS=[['diri','DIRI'],['skill','SKILL & KARIER'],['infra','SISTEM & ASET'],['siber','SIBER & SIASAT'],['uang','UANG & USAHA'],['tim','TIM']];

/* ================= ASET KANTOR: dibiayai perusahaan, bukan gaji pemain =================
   Monitoring & backup adalah investasi milik perusahaan. Karyawan mengajukan anggaran ke manajemen
   (bisa ditolak), atau membangun versi open-source sendiri (gratis, tapi butuh skill & lembur).
   Hanya founder startup sendiri (P.founder) yang membayar dari kantong sendiri: perusahaannya memang miliknya. */
const ASET_KANTOR={
  obsv:{n:'monitoring & alerting',biaya:20e6,skill:'sistem',oss:'Prometheus, Grafana, dan Loki',
    pasang(){ P.obsv=true; P.usedSkill.sistem=true;
      addLog('Dashboard metrik, log terpusat, dan alert otomatis kini terpasang. Insiden ketahuan sebelum user mengeluh.'+ixAll(+5)+fx({sistem:+3,reputasi:+2}),'good'); milestone('Bangun observability'); leg(2,0); }},
  backup:{n:'backup & disaster recovery',biaya:12e6,skill:'sistem',oss:'restic, snapshot terjadwal, dan salinan offline',
    pasang(){ P.backupKuat=true; P.usedSkill.sistem=true;
      addLog('Backup offline teruji & rencana disaster recovery disiapkan. Kalau ransomware datang, pemulihan dari backup bersih jadi andalan.'+fx({sistem:+2,reputasi:+1}),'good');
      const db=infraGet('db'); if(db)addLog('Basis data kini punya salinan terjamin.'+ix(db,+6)); leg(2,0); }}
};
/* masih bekerja di suatu kantor (bukan pensiun, dipecat, menganggur, freelance, atau di penjara) */
function bisaAsetKantor(){ return adaKantor()&&!!P.tempat; }
function subAnggaran(biaya,guna){ return P.founder?rp(biaya)+' dari kas startup-mu · '+guna:'Dibayar kantor (±'+rp(biaya)+') · '+guna; }
/* peluang proposal disetujui: jenis kantor, reputasi, soft skill, jenjang, pasar, dan "baru kena insiden" */
function peluangAnggaran(a){
  const dasar={startup:0.42,korporat:0.5,bumn:0.32,agency:0.36,remote:0.58}[P.tempat]||0.4;
  let p=dasar+(P.reputasi-40)/220+(P.st.soft-50)/260+(lvNow()-1)*0.05;
  if(N.pasar==='krisis')p-=0.2; else if(N.pasar==='boom')p+=0.08;
  if((P.outageBesar||0)>0||(P.dataHilang||0)>0)p+=0.15;   /* satire: anggaran baru cair setelah kebakaran */
  return clamp(p,0.1,0.9);
}
function ajukanAnggaran(a){
  if(P.founder){
    if(P.money<a.biaya){ addLog('Kas startup-mu belum cukup untuk '+a.n+' ('+rp(a.biaya)+').','bad'); return; }
    P.money-=a.biaya; addLog('Sebagai founder, kamu membiayai '+a.n+' dari kas startup sendiri: '+rp(a.biaya)+'.','sys'); a.pasang(); return;
  }
  const p=peluangAnggaran(a), pct=Math.round(p*100), sk=P.st[a.skill];
  ask({title:'AJUKAN ANGGARAN '+a.n.toUpperCase(),text:'Sistem ini milik <b>'+(P.tempatN||'kantor')+'</b>, jadi biayanya (±'+rp(a.biaya)+') harus dari anggaran perusahaan, bukan gajimu. Bagaimana caramu mewujudkannya?',opts:[
    {t:'Ajukan proposal ke manajemen',sub:'Pakai data risiko & biaya downtime · peluang disetujui ±'+pct+'%',e:()=>{
      if(r()<p){ addLog('Proposal disetujui: anggaran '+rp(a.biaya)+' untuk '+a.n+' dibayar perusahaan.'+fx({soft:+1}),'good'); a.pasang(); }
      else addLog(pick(['Proposal ditolak: "Selama ini belum pernah kejadian, kenapa harus keluar uang?"','Proposal ditolak: "Budget tahun ini sudah dikunci. Ajukan lagi tahun depan ya."','Proposal "dipertimbangkan" lalu hilang di antara 47 email lain.'])+fx({stres:+3}),'bad'); }},
    {t:'Bangun sendiri pakai open-source',sub:a.oss+' · gratis, tapi lembur · butuh skill '+LBL[a.skill]+' ≥ 50 (kamu '+sk+')',e:()=>{
      P.lembur=clamp((P.lembur||0)+12,0,100);
      if(sk>=50&&r()<0.55+(sk-50)/100){ addLog('Kamu merakit '+a.n+' sendiri dengan '+a.oss+' di sela pekerjaan. Kantor tidak keluar uang sepeser pun.'+fx({stres:+6,[a.skill]:+2}),'good'); a.pasang(); }
      else addLog('Kamu mencoba merakit '+a.n+' sendiri, tapi setengah jadi dan belum bisa diandalkan. Coba lagi setelah skill-mu bertambah.'+fx({stres:+6,[a.skill]:+1}),'bad'); }},
    {t:'Nanti saja',e:()=>{ delete P.used[a===ASET_KANTOR.obsv?'observability':'backup']; G.acted=Math.max(0,G.acted-1); }}
  ]});
}
/* keluar dari startup tempat bekerja: ekuitas yang belum vesting hangus (vesting 4 tahun, cliff 1 tahun).
   Founder yang meninggalkan startup-nya: valuasi di atas kertas runtuh. */
function lepasEkuitas(){
  if(P.startupSaham&&(P.ekuitas||0)>0){
    const sisa=P.founder?0.2:((P.tenure||0)>=1?Math.min(1,(P.tenure||0)/4):0);
    const hangus=Math.round(P.ekuitas*(1-sisa));
    if(hangus>0){ P.ekuitas-=hangus; addLog(P.founder?'Startup yang kamu tinggalkan kehilangan arah; valuasi ekuitasmu runtuh '+rp(hangus)+'.':'Ekuitas startup yang belum vesting ('+rp(hangus)+') hangus saat kamu keluar.','bad'); }
  }
  P.startupSaham=false;
}
/* pindah ke kantor baru: monitoring, backup, sistem, budaya, PIP, dan postur keamanan milik kantor lama tidak ikut.
   founder=true: startup yang baru didirikan sendiri (belum ada monitoring/backup, sistem masih baru). */
function kondisiKantorBaru(founder){
  lepasEkuitas();   /* dipanggil sebelum masa kerja direset */
  P.menganggur=false; P.tenure=0; P.gajiAdj=1;
  const sudahAda={korporat:0.6,remote:0.65,bumn:0.3,startup:0.35,agency:0.25,freelance:0.4}[P.tempat]||0.35;
  P.obsv=!founder&&r()<sudahAda; P.backupKuat=!founder&&r()<sudahAda; P.founder=!!founder;
  P.infra=bangunInfra(founder?'founder':P.tempat);
  P.budaya=ri(35,65); P.pip=0; P.bluTeam=0; P.revBeres=P.beres; P.revGagal=P.gagal;
  /* tim kantor lama tidak ikut; Lead ke atas mewarisi tim di kantor baru (founder merekrut sendiri) */
  P.tim=null;
  if(founder)P.tim={anggota:[],arah:'delivery',ekstra:0,tahun:0};
  else if(lvNow()>=4)buatTimAwal();
  addLog(founder?'Startup baru, sistem baru: belum ada monitoring maupun backup, semua dibangun dari nol.':
    (P.tempat==='freelance'?'Klien baru, sistem klien: ':'Kantor baru, sistem baru: ')+(P.obsv?'monitoring sudah ada':'belum ada monitoring')+', '+(P.backupKuat?'backup sudah tertata':'backup masih seadanya')+'.','sys');
}

const ACTS=[
/* ---- DIRI ---- */
{k:'rehat',tab:'diri',lbl:'Rehat & log off',sub:'Stres −8 · kurangi kelelahan',e:()=>{P.lembur=clamp((P.lembur||0)-12,0,100);addLog('Anda menutup laptop lebih awal, jalan-jalan tanpa memikirkan tiket. On-call fatigue mereda.'+fx({stres:-8}));}},
{k:'olahraga',tab:'diri',lbl:'Olahraga & atur pola tidur',sub:'Kesehatan +3',e:()=>{P.lembur=clamp((P.lembur||0)-6,0,100);addLog('Lari pagi dan tidur cukup di sela sprint. Badan berterima kasih.'+fx({kesehatan:+3,stres:-2}));}},
{k:'soft',tab:'diri',lbl:'Asah komunikasi & menulis',sub:'Soft skill +4',multi:true,cond:()=>!P.retired&&P.st.soft<95,e:()=>addLog('Anda berlatih menulis dokumentasi & berbicara di depan tim. Engineer yang bisa menjelaskan lebih bernilai.'+fx({soft:+4,reputasi:+1}))},
{k:'keluarga',tab:'diri',lbl:'Waktu untuk keluarga',sub:'Stres −6',cond:()=>P.keluarga,e:()=>{P.lembur=clamp((P.lembur||0)-6,0,100);addLog('Sehari penuh tanpa notifikasi kantor, hanya keluarga.'+fx({stres:-6,kesehatan:+1}));}},
{k:'tutup',tab:'diri',lbl:'Tutup berkas (akhiri)',sub:'Akhiri perjalanan dengan tenang',cond:()=>P.retired||P.dipecat,e:()=>{
  ask({title:'TUTUP BERKAS?',text:'Akhiri kisah ini sekarang dan lihat penilaian akhir?',opts:[
    {t:'Ya, tutup berkas',e:()=>{P.alive=false;P.sebab=null;G.over=true;addLog('Anda menutup terminal untuk terakhir kalinya, melihat ke belakang pada semua yang telah dibangun (dan dirobohkan).','sys');stamp('BERKAS DITUTUP');showEpilog();}},
    {t:'Belum',e:()=>{}}
  ]});}},

/* ---- SKILL & KARIER ---- */
{k:'lamarKerja',tab:'skill',lbl:'Lamar kerja',sub:'Sebar CV · panggilan → wawancara teknis',cond:()=>P.menganggur&&!P.retired&&!P.dipecat,e:()=>cariKerja()},
{k:'resign',tab:'skill',lbl:'Resign',sub:'Berhenti dari tempat kerja sekarang',cond:()=>kerjaAktif()&&!!P.tempat&&!P.founder,e:()=>{
  const fl=P.tempat==='freelance';
  ask({title:'RESIGN?',text:(fl?'Berhenti jadi freelancer':'Mengundurkan diri dari <b>'+P.tempatN+'</b>')+' berarti tanpa penghasilan tetap sampai Anda diterima di tempat lain. Biaya hidup jalan terus.'+((P.ekuitas||0)>0&&P.startupSaham?' Ekuitas startup yang belum vesting akan hangus.':''),opts:[
    {t:'Ya, serahkan surat resign',e:()=>{ const lama=P.tempatN; jadiMenganggur();
      addLog((fl?'Anda menutup lapak freelance.':'Surat resign diserahkan ke HR <b>'+lama+'</b>. Kartu akses dikembalikan, laptop kantor dikosongkan.')+' Lega bercampur cemas.'+fx({stres:-8}),'sys'); milestone('Resign dari '+lama); }},
    {t:'Batal',e:()=>{ delete P.used.resign; G.acted=Math.max(0,G.acted-1); }}
  ]}); }},
{k:'belajar',tab:'skill',lbl:'Belajar & upskill',sub:'Kerjakan 3 soal latihan',cond:()=>!P.retired,e:()=>belajarTeknis()},
{k:'homelab',tab:'skill',lbl:'Bangun homelab',sub:'Rp 15 jt · ngoding & sistem',cond:()=>!P.retired&&P.money>=15e6,e:()=>{P.money-=15e6;
  addLog('Rak server bekas, mini-PC, dan kabel di pojok kamar. Lab pribadi tempat Anda merusak & memperbaiki tanpa takut produksi.'+fx({sistem:+4,ngoding:+3,jaringan:+2}),'good');}},
{k:'sertifikasi',tab:'skill',lbl:'Ambil sertifikasi',sub:'10 jalur · grade 0–3',cond:()=>!P.retired&&SERT_JALUR.some(j=>!sertBisa(j).max),e:()=>menuSertifikasi()},
{k:'sidepro',tab:'skill',lbl:'Bangun produk sampingan (SaaS)',sub:'Cuan lepas + MRR yang menumpuk',multi:true,maks:2,cond:()=>!P.retired&&P.st.ngoding>=40,e:()=>{
  P.usedSkill.ngoding=true; P.usedSkill.saas=true;
  /* kebanyakan produk sampingan tidak laku: peluang dapat pelanggan baru ikut skill & reputasi, MRR tumbuh pelan (maks. Rp 40 jt/bln) */
  if(r()<0.35+P.st.ngoding/250+P.reputasi/400){ const naik=bulatJt(ri(3,15)*1e5*eraGaji()); P.saasMRR=Math.min(40e6,(P.saasMRR||0)+naik);
    addLog('Akhir pekan Anda habis untuk produk SaaS sampingan. Beberapa pelanggan baru berlangganan: MRR naik '+rp(naik)+' jadi ~'+rp(P.saasMRR)+'/bln (menyusut bila tidak dirawat).'+fx({ngoding:+1,stres:+4}),'good'); }
  else addLog('Akhir pekan Anda habis untuk produk SaaS sampingan. Fitur baru rilis, tapi belum ada pelanggan baru. Produk tetap terawat.'+fx({ngoding:+1,stres:+4}));}},
{k:'networking',tab:'skill',lbl:'Personal branding & relasi',sub:'Rp 5 jt · reputasi naik',multi:true,cond:()=>!P.retired&&P.money>=5e6,e:()=>{P.money-=5e6;
  addLog('Anda rajin menulis blog teknis, aktif di komunitas, dan hadir di meetup. Nama Anda mulai diingat.'+fx({reputasi:+4,soft:+1}),'good');leg(1,1);}},
{k:'remoteLN',tab:'skill',lbl:'Lamar remote ke perusahaan luar negeri',sub:'Gaji dolar · wawancara teknis',cond:()=>!P.retired&&!P.dipecat&&P.tempat!=='remote'&&P.st.soft>=40&&(P.st.ngoding>=55||P.st.sistem>=55||P.st.keamanan>=55),e:()=>lamarRemoteLN()},
{k:'freelance',tab:'skill',lbl:'Ambil proyek freelance global',sub:'Klien luar negeri lewat platform',cond:()=>!P.retired&&(P.st.ngoding>=45||P.st.sistem>=45),e:()=>{
  if(r()<0.2){ addLog('Klien menghilang setelah kamu mengirim hasil akhir. Invoice tak terbayar, rating bintang satu menyusul.'+fx({stres:+6}),'bad'); return; }
  const u=bulatJt(ri(10,40)*1e6*eraGaji()); addLog('Proyek freelance untuk klien luar negeri selesai. Bayaran '+rp(u)+' masuk setelah dipotong fee platform.'+fx({money:+u,stres:+5,reputasi:+1}),'good');}},
{k:'ajarBootcamp',tab:'skill',lbl:'Mengajar di bootcamp',sub:'Berbagi ilmu ke calon engineer',cond:()=>!P.retired&&lvNow()>=3&&N.tahun>=2015,e:()=>{
  P.ajarKali=(P.ajarKali||0)+1; const u=ri(8,25)*1e6;
  addLog('Kamu mengajar kelas malam di bootcamp. Ada murid yang bertanya "Kak, bedanya Java dan JavaScript apa?" dan kamu menjawab dengan sabar.'+fx({money:+u,soft:+3,reputasi:+2,stres:+2}),'good');
  if(P.ajarKali>=3)ach('guruNgoding'); leg(2,1);}},
{k:'kontenTech',tab:'skill',lbl:'Bikin konten teknologi',sub:()=>N.tahun>=2018?'YouTube, TikTok, blog':'YouTube & blog',cond:()=>!P.retired&&P.st.soft>=35,e:()=>{
  if(r()<0.25+P.reputasi/300){ const u=ri(10,40)*1e6; P.kontenViral=(P.kontenViral||0)+1;
    addLog('Video "Belajar Linux dalam 10 menit" meledak. Adsense dan endorse masuk '+rp(u)+'.'+fx({money:+u,reputasi:+4,soft:+2}),'good'); if(P.kontenViral>=2)ach('techInfluencer'); }
  else if(r()<0.3)addLog('Kontenmu memicu perang komentar "tab vs spasi". Engagement naik, kewarasan turun.'+fx({stres:+5,reputasi:+1}));
  else addLog('Kontenmu ditonton 87 orang. Pelan-pelan, katanya.'+fx({soft:+1,stres:+1}));}},
{k:'oneOnOne',tab:'skill',lbl:'Minta 1-on-1 dengan manajer',sub:'Bahas gaji, beban kerja, atau karier',cond:()=>punyaAtasan()&&!!P.jab,e:()=>satuSatu()},
{k:'pivot',tab:'skill',lbl:'Pivot spesialisasi',sub:'Ganti jalur · turun satu jenjang · sekali per 4 tahun',cond:()=>!P.retired&&P.maxLv<=4&&N.tahun-(P.pivotTh||-99)>=4,e:()=>{
  ask({title:'PIVOT KE JALUR BARU',text:'Pindah spesialisasi berarti mulai agak dari bawah: masa jabatan direset'+(lvNow()>=2?' dan jenjangmu turun satu tingkat':'')+'. Tapi pintu baru terbuka. Pilih jalur baru:',opts:SPES.filter(s=>s.k!==P.spes).map(s=>({t:s.n,sub:s.short,e:()=>{
    P.spes=s.k; P.spesN=s.short; P.pivotTh=N.tahun; P.tahunJab=0;
    let turun='';
    if(lvNow()>=2){ const k=Object.keys(JAB).find(x=>JAB[x].lv===lvNow()-1); P.jab=k; turun=' Jenjangmu turun menjadi <b>'+JAB[k].n+'</b> di bidang baru.'; }
    for(const k in s.boost)if(P.st[k]<60)P.st[k]=clamp(P.st[k]+Math.round(s.boost[k]*0.6),0,100);   /* dorongan awal hanya untuk skill yang masih rendah */
    if(P.tempat)P.infra=bangunInfra(P.founder?'founder':P.tempat);   /* sistem yang kamu pegang kini sesuai jalur baru */
    addLog('Anda banting setir jadi <b>'+s.n+'</b>. Awal yang menantang, tapi karier Anda dapat napas baru.'+turun+fx({reputasi:-6,stres:+4}),'sys');
    milestone('Pivot ke '+s.short);
  }}))});}},

/* ---- SISTEM & ASET ---- */
{k:'maintenance',tab:'infra',lbl:'Maintenance & patch rutin',sub:'Rawat sistem & cicil utang teknis',multi:true,cond:()=>!P.retired&&P.infra.length,e:()=>{
  for(const a of P.infra)a.debt=clamp((a.debt||0)-ri(5,10),0,100); P.usedSkill.sistem=true;
  addLog('Anda meluangkan waktu untuk patch, update dependency, dan bersih-bersih teknis. Tidak glamor, tapi utang teknis berkurang dan masa depan terselamatkan.'+ixAll(+ri(4,8))+fx({stres:+3,sistem:+1}),'good');leg(1,0);}},
{k:'observability',tab:'infra',lbl:'Pasang monitoring & alerting',sub:()=>subAnggaran(20e6,'deteksi dini insiden'),cond:()=>bisaAsetKantor()&&!P.obsv,e:()=>ajukanAnggaran(ASET_KANTOR.obsv)},
{k:'automate',tab:'infra',lbl:'Otomatiskan operasi',sub:'IaC & CI/CD · kurangi kerja & utang teknis',multi:true,cond:()=>!P.retired&&(P.st.ngoding>=50||P.st.sistem>=55),e:()=>{
  for(const a of P.infra)a.debt=clamp((a.debt||0)-ri(3,7),0,100); P.usedSkill.ngoding=true; P.usedSkill.sistem=true;
  addLog('Anda menulis skrip & pipeline yang menggantikan kerja manual berulang. "Kalau dikerjakan dua kali, otomatiskan."'+ixAll(+ri(5,9))+fx({ngoding:+2,sistem:+2,stres:-2}),'good');ach('otomasi');leg(2,1);}},
{k:'backup',tab:'infra',lbl:'Perkuat backup & DR',sub:()=>subAnggaran(12e6,'penangkal ransomware'),cond:()=>bisaAsetKantor()&&!P.backupKuat,e:()=>ajukanAnggaran(ASET_KANTOR.backup)},
{k:'hardening',tab:'infra',lbl:'Security hardening',sub:'Bangun postur blue-team',multi:true,cond:()=>!P.retired&&P.st.keamanan>=40,e:()=>{
  P.bluTeam=clamp((P.bluTeam||0)+ri(7,13),0,100); P.usedSkill.keamanan=true;
  addLog('Anda menambal celah, perketat akses, dan audit konfigurasi keamanan. Postur pertahanan menguat — insiden keamanan lebih jarang & lebih mudah ditangani.'+ixAll(+ri(3,6))+fx({keamanan:+3,reputasi:+1}),'good');leg(1,0);}},
{k:'refactor',tab:'infra',lbl:'Bayar utang teknis (refactor)',sub:'Rapikan kode warisan · turunkan utang',multi:true,cond:()=>!P.retired&&P.st.ngoding>=45,e:()=>{
  const app=infraGet('app')||pick(P.infra); P.usedSkill.ngoding=true;
  if(app)app.debt=clamp((app.debt||0)-ri(10,20),0,100);
  addLog('Anda menyisihkan waktu merapikan kode spageti warisan. Atasan tak melihat hasilnya, tapi utang teknis turun dan engineer berikutnya akan berterima kasih.'+ix(app,+ri(5,10))+fx({ngoding:+2,stres:+2}),'good');leg(1,0);}},

/* ---- SIBER & SIASAT ---- */
{k:'ctf',tab:'siber',lbl:'Ikut kompetisi CTF',sub:'3 tantangan · reputasi (topi putih)',multi:true,maks:2,cond:()=>!P.retired&&P.st.keamanan>=38,e:()=>ctfMain()},
{k:'bugbounty',tab:'siber',lbl:'Berburu bug bounty',sub:'Cuan bersih dari celah · topi putih',multi:true,maks:2,cond:()=>!P.retired&&P.st.keamanan>=45,e:()=>{
  P.usedSkill.keamanan=true;
  if(r()<clamp(0.35+P.st.keamanan/220,0.2,0.85)){const u=ri(20,120)*1e6;P.bugBounty++;P.hackWhite++;
    addLog('Anda menemukan celah serius dan melaporkannya secara etis. Bounty '+rp(u)+' cair, vendor berterima kasih.'+fx({money:+u,keamanan:+3,reputasi:+3}),'good');ach('bugHunter');leg(2,1);}
  else addLog('Berjam-jam menyisir, semua celah ternyata duplikat atau out-of-scope. Nihil tahun ini.'+fx({keamanan:+2,stres:+2}),'sys');}},
{k:'pentest',tab:'siber',lbl:'Kontrak pentest resmi',sub:'Cuan besar · butuh reputasi & izin',multi:true,maks:2,cond:()=>!P.retired&&P.st.keamanan>=55&&P.reputasi>=40,e:()=>{
  P.usedSkill.keamanan=true;
  const u=ri(60,200)*1e6;P.hackWhite++;
  addLog('Klien menyewa Anda menembus sistem mereka secara legal. Laporan kerentanan tebal Anda serahkan dengan bangga.'+fx({money:+u,keamanan:+4,reputasi:+3}),'good');ach('pentester');leg(2,2);}},
{k:'blackhat',tab:'siber',lbl:'Operasi topi hitam',sub:'Uang gelap besar · sorotan & dosa',multi:true,cond:()=>!P.retired&&P.st.keamanan>=50,e:()=>{
  P.usedSkill.keamanan=true;
  const mode=pick(['curiData','ransom','botnet']);
  const u=ri(3,12)*1e8*Math.max(1,Math.round(P.st.keamanan/40));
  P.hackBlack++;
  if(mode==='curiData'){addLog('Anda membobol basis data sebuah perusahaan dan menjual jutaan recordnya di forum gelap.'+fx({gelap:+u,keamanan:+2,heat:+14}),'bad');ach('malingData');}
  else if(mode==='ransom'){addLog('Anda menyebar ransomware dan menagih tebusan kripto dari korban yang panik.'+fx({gelap:+u,heat:+18}),'bad');ach('ransomware');}
  else {addLog('Anda mengoperasikan botnet sewaan untuk serangan order-an. Uang mengalir dari kegelapan.'+fx({gelap:+Math.round(u*0.7),heat:+12}),'bad');}
  ach('topiHitam');leg(-6,2);setTopi();}},
{k:'jualExploit',tab:'siber',lbl:'Jual exploit / 0-day',sub:'Uang gelap raksasa · sorotan tinggi',multi:true,cond:()=>!P.retired&&P.st.keamanan>=62,e:()=>{
  const u=ri(8,25)*1e8;P.exploitJual++;
  addLog('Anda menemukan celah 0-day dan menjualnya ke pembeli anonim, bukan ke vendor. Bayaran fantastis, nurani terpotong.'+fx({gelap:+u,keamanan:+3,heat:+16}),'bad');leg(-7,2);ach('topiHitam');setTopi();}},
{k:'cuciKripto',tab:'siber',lbl:'Cuci uang gelap',sub:'Putar lewat mixer & kripto',multi:true,cond:()=>P.gelap>=5e8,e:()=>{
  const x=P.gelap, bersih=Math.round(x*0.68); P.gelap=0; P.money+=bersih; P.dicuciTotal=(P.dicuciTotal||0)+bersih;   /* jejak TPPU: bisa dirampas saat vonis */
  addLog('Uang gelap '+rp(x)+' diputar lewat mixer, exchange abu-abu, dan rekening nominee. Yang kembali "bersih": '+rp(bersih)+'.'+fx({heat:+6}),'bad');}},
{k:'opsec',tab:'siber',lbl:'Rapikan jejak & opsec',sub:'Rp 30 jt · redam sorotan',cond:()=>P.heat>=12&&P.money>=30e6,e:()=>{P.money-=30e6;
  addLog('VPN berlapis, hapus metadata, ganti infrastruktur. Untuk sementara, jejak Anda mengabur.'+fx({heat:-12,keamanan:+1}),'sys');}},

/* ---- UANG ---- */
{k:'invest',tab:'uang',lbl:'Investasi reksadana/saham',sub:'Tanam saldo, biarkan tumbuh',multi:true,cond:()=>P.money>=20e6,e:()=>{const x=Math.min(P.money,ri(20,80)*1e6);P.money-=x;P.saham+=x;
  addLog('Anda mengalihkan '+rp(x)+' ke portofolio investasi. Nilainya akan naik-turun mengikuti pasar.','sys');}},
{k:'crypto',tab:'uang',lbl:'Trading kripto',sub:'Judi digital · bisa cuan bisa buntung',multi:true,cond:()=>P.money>=10e6,e:()=>{const x=Math.min(P.money,ri(10,50)*1e6);
  if(r()<0.45){const g=Math.round(x*(0.3+r())); P.money+=g; addLog('Timing Anda pas — posisi hijau, profit '+rp(g)+' diamankan.'+fx({stres:-2}),'good');}
  else {const l=Math.round(x*(0.3+r()*0.6)); P.money-=l; addLog('Pasar berbalik, Anda kena likuidasi. '+rp(l)+' menguap.'+fx({stres:+5}),'bad');}}},
{k:'gadget',tab:'uang',lbl:'Beli rig & gadget impian',sub:'Rp 60 jt · stres turun',cond:()=>P.money>=60e6,e:()=>{P.money-=60e6;
  addLog('Workstation kelas atas, monitor ultrawide, mekanikal keyboard. Kerja jadi lebih nikmat (dan flex di meja).'+fx({stres:-6,kesehatan:+1}),'good');}},
{k:'donasi',tab:'uang',lbl:'Donasi ke komunitas / beasiswa',sub:'Rp 25 jt · nama harum, karya positif',cond:()=>P.money>=25e6,e:()=>{P.money-=25e6;
  addLog('Anda mendanai beasiswa coding & sponsor proyek open source. Ilmu yang dibagi tak pernah habis.'+fx({reputasi:+3,stres:-2}),'good');leg(3,0);}},
{k:'sampingan',tab:'uang',lbl:'Buka usaha sampingan',sub:'Servis PC, les coding, pasang jaringan, dll · hasil kecil tapi rutin',cond:()=>!P.sampingan&&!P.retired,e:()=>bukaSampingan()},
{k:'tutupSampingan',tab:'uang',lbl:'Tutup usaha sampingan',sub:()=>P.sampingan?P.sampingan.n+' · jual peralatan':'',cond:()=>!!P.sampingan,e:()=>{
  const u=P.sampingan, sisa=bulatJt(u.modal*0.3); P.sampingan=null;
  addLog('Anda menutup <b>'+u.n+'</b> dan menjual peralatannya.'+fx({money:sisa,stres:-3}),'sys'); milestone('Tutup sampingan: '+u.n); }},
{k:'bukaSH',tab:'uang',lbl:'Buka software house sendiri',sub:()=>'Modal '+rp(modalSH())+' · cari klien, kerjakan proyek, rekrut tim',cond:()=>!P.sh&&!P.founder&&!P.retired&&!P.dipecat&&(P.st.ngoding>=50||P.maxLv>=3)&&P.money>=modalSH(),e:()=>bukaSoftwareHouse()},
{k:'cariKlien',tab:'uang',lbl:'Cari klien',sub:()=>P.sh?'Tenaga '+tenagaSH()+' · terpakai '+bebanSH()+' · '+P.sh.klien.length+' klien':'',multi:true,maks:2,cond:()=>!!P.sh&&!P.retired,e:()=>cariKlien()},
{k:'rawatKlien',tab:'uang',lbl:'Jaga hubungan klien',sub:'Kepuasan semua klien naik',cond:()=>!!P.sh&&P.sh.klien.length>0,e:()=>rawatKlien()},
{k:'tutupSH',tab:'uang',lbl:'Jual / tutup software house',sub:()=>P.sh?P.sh.n:'',cond:()=>!!P.sh,e:()=>tutupSH()},
{k:'startupSendiri',tab:'uang',lbl:'Rintis startup sendiri',sub:'Rp 100 jt · taruhan besar',cond:()=>!P.retired&&!P.dipecat&&!P.founder&&!P.sh&&P.money>=100e6&&P.st.ngoding>=55&&P.maxLv>=3,e:()=>{P.money-=100e6;
  ask({title:'RINTIS STARTUP SENDIRI',text:'Anda nekat keluar zona nyaman dan membangun produk sendiri. Pertaruhan tabungan, waktu, dan ego.',opts:[
    {t:'All-in, kejar pertumbuhan',e:()=>{ if(r()<0.4){P.tempat='startup';P.tempatN='Startup (Founder)';kondisiKantorBaru(true);P.ekuitas=(P.ekuitas||0)+ri(20,60)*1e8;P.startupSaham=true;   /* saham pendiri, di atas kertas */
        addLog('Produk Anda dapat traksi & pendanaan awal. Valuasi di atas kertas melonjak.'+fx({reputasi:+6,stres:+10}),'good');milestone('Mendirikan startup');leg(2,5);}
      else {addLog('Setelah setahun membakar uang, produk sepi pengguna. Startup Anda mati pelan-pelan.'+fx({stres:+12,reputasi:-2}),'bad');milestone('Startup gagal (shutdown)');leg(0,-3);}}},
    {t:'Bangun pelan sambil tetap kerja',e:()=>{ P.usedSkill.saas=true; if(r()<0.5){P.money+=ri(20,80)*1e6;P.saasMRR=Math.min(200e6,(P.saasMRR||0)+ri(5,18)*1e6);addLog('Side-project Anda menghasilkan pendapatan kecil tapi stabil — MRR mulai mengalir (~'+rp(P.saasMRR)+'/bln).'+fx({reputasi:+3,stres:+5}),'good');}
      else addLog('Sulit membagi waktu — produk jalan di tempat, tapi setidaknya tabungan tak habis.'+fx({stres:+6}),'sys');}}
  ]});}}
];

ACTS.push(...ACTS_TIM);   /* laci TIM (03c-tim.js) */
function actAvail(a){
  if(P.penjara>0)return {ok:false,why:'Anda di dalam lapas'};
  if(a.cond&&!a.cond())return {ok:false,why:'Syarat belum terpenuhi'};
  if(!a.multi&&P.used[a.k])return {ok:false,why:'Sudah dilakukan tahun ini',used:true};
  if(a.maks&&(P.used[a.k+'_n']||0)>=a.maks)return {ok:false,why:'Sudah '+a.maks+'× tahun ini',used:true};   /* aksi ↻ berpenghasilan dibatasi */
  return {ok:true};
}
function doAct(k){
  if(!P||G.current||G.over||!P.alive)return;
  const a=ACTS.find(x=>x.k===k);
  if(!a)return;
  const av=actAvail(a);
  if(!av.ok)return;
  if(!a.multi)P.used[k]=true;
  if(a.maks)P.used[k+'_n']=(P.used[k+'_n']||0)+1;
  G.acted++;
  a.e();
  if(G.acted>5){ P.st.stres=clamp(P.st.stres+2,0,100); }
  checkAch();
  render();
}
