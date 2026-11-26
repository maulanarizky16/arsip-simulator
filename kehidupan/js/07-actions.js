'use strict';
/* ================= MEJA AKSI ================= */
const TABS=[['diri','DIRI & SOSIAL'],['asmara','ASMARA'],['karier','KARIER'],['politik','POLITIK'],['usaha','USAHA'],['uang','UANG & ASET'],['hobi','HOBI']];
const ACTS=[
/* ---- DIRI & SOSIAL ---- */
{k:'belajar',tab:'diri',lbl:'Belajar ekstra',sub:'Kecerdasan +3',min:6,e:()=>addLog('Anda belajar lebih giat tahun ini.'+fx({smart:+3,stress:+2}))},
{k:'olahraga',tab:'diri',lbl:'Olahraga rutin',sub:'Kesehatan +3',min:6,e:()=>addLog('Anda rajin olahraga.'+fx({health:+3,happy:+1}))},
{k:'meditasi',tab:'diri',lbl:'Me time / istirahat',sub:'Stres −7',min:13,e:()=>addLog('Anda mengambil jeda untuk diri sendiri.'+fx({stress:-7,happy:+2}))},
{k:'nongkrong',tab:'diri',lbl:'Nongkrong',sub:'Karisma +3',min:13,e:()=>addLog('Anda memperluas pergaulan.'+fx({charm:+3,happy:+2,relasi:+5}))},
{k:'komunitas',tab:'diri',lbl:'Ikut komunitas / reuni',sub:'Relasi & peluang',min:20,e:()=>{
  addLog('Anda aktif di komunitas dan reuni.'+fx({charm:+4,happy:+3,relasi:+7}));
  if(!P.job&&!P.kuliah&&!P.retired&&P.age>=19&&r()<0.25){
    addLog('Dari obrolan reuni, seorang teman menawarkan lowongan di kantornya.','good');
    jobOffers(buildPool(),2);
  }}},
{k:'donasi',tab:'diri',lbl:'Donasi & bantu warga',sub:'Rp 3 jt · Bahagia +5',min:18,multi:true,cond:()=>P.money>=3e6,e:()=>addLog('Anda menyisihkan rezeki untuk yang membutuhkan.'+fx({money:-3e6,happy:+5,charm:+2,relasi:+2}))},
{k:'liburan',tab:'diri',lbl:'Liburan',sub:'Rp 6 jt · Stres −8',min:17,multi:true,cond:()=>P.money>=6e6,e:()=>addLog('Anda berlibur melepas penat.'+fx({money:-6e6,happy:+7,stress:-8}))},
{k:'cek',tab:'diri',lbl:'Medical check-up',sub:'Rp 2,5 jt · Kesehatan +5',min:18,cond:()=>P.money>=2.5e6,e:()=>addLog('Medical check-up dan vitamin setahun.'+fx({money:-2.5e6,health:+5}))},
{k:'umroh',tab:'diri',lbl:'Umroh',sub:'Rp 35 jt · menyejukkan hati',min:20,cond:()=>P.money>=35e6,e:()=>{
  P.money-=35e6;
  addLog('Anda berangkat umroh. Pulang dengan hati yang jauh lebih ringan.'+fx({happy:+10,stress:-10}),'good');milestone('Umroh');}},
{k:'daftarHaji',tab:'diri',lbl:'Daftar porsi haji',sub:'Setoran Rp 25 jt · antre bertahun-tahun',min:25,cond:()=>!P.haji&&!P.hajiDone&&P.money>=25e6,e:()=>{
  P.money-=25e6; P.haji={sisa:ri(6,12)};
  addLog('Porsi haji terdaftar. Perkiraan berangkat <b>'+P.haji.sisa+' tahun lagi</b>. Saatnya menabung pelunasan.'+fx({happy:+4}),'good');milestone('Daftar porsi haji');}},
{k:'kontrol',tab:'diri',lbl:'Kontrol penyakit rutin',sub:'Disiplin obat & cek dokter berkala',min:35,cond:()=>!!P.kronis&&!P.kronis.kontrol,e:()=>{
  P.kronis.kontrol=true;
  addLog('Anda mulai disiplin menangani '+P.kronis.n+': obat rutin, jaga makan, cek berkala.'+fx({health:+3,stress:-3}),'good');}},
{k:'stopRokok',tab:'diri',lbl:'Berhenti merokok',sub:'Lepas dari nikotin (makin lama makin sulit)',min:15,cond:()=>P.rokok,e:()=>{
  const peluang=clamp(0.55-P.nikotin/200+(P.terapi?0.1:0)+P.st.smart/400,0.15,0.85);
  if(r()<peluang){P.rokok=false;P.nikotin=clamp(P.nikotin-30,0,100);addLog('Anda berhasil berhenti merokok!'+(P.nikotin>20?' Sisa keinginan masih mengintai saat stres.':'')+fx({health:+5,stress:+4}),'good');milestone('Berhenti merokok');}
  else addLog('Tiga hari tahan, hari keempat menyerah. Nikotin memang licik.'+fx({stress:+3}),'bad');}},
{k:'kucing',tab:'diri',lbl:'Adopsi kucing',sub:'Rp 1 jt · teman di rumah',min:17,cond:()=>!P.pet&&P.money>=1e6,e:()=>{
  P.pet={nama:pick(NAMA_KUCING),lahirAt:P.age};
  addLog('Anda mengadopsi kucing dan menamainya <b>'+P.pet.nama+'</b>. Rumah jadi lebih hangat.'+fx({money:-1e6,happy:+5}),'good');}},
{k:'sambilan',tab:'diri',lbl:'Kerja sambilan',sub:'Uang tambahan',min:15,cond:()=>!P.job,e:()=>{const u=ri(2,5)*1e6;
  addLog('Anda kerja serabutan demi tambahan.'+fx({money:u,stress:+3}));}},
{k:'cariTeman',tab:'diri',lbl:'Cari teman baru',sub:'Perluas lingkaran (maks. 6)',min:12,multi:true,cond:()=>P.teman.length<6,e:()=>{
  const t=buatTeman(); P.teman.push(t);
  addLog('Anda berkenalan dengan <b>'+t.nama+'</b> — orangnya '+t.sifat.n+'. Lingkaran pertemanan bertambah.'+fx({charm:+2,relasi:+4,happy:+2}),'good');}},
{k:'nongkrongTeman',tab:'diri',lbl:'Nongkrong bareng teman',sub:'Kedekatan & mood naik',min:12,multi:true,cond:()=>P.teman.length>0,e:()=>{
  P.teman.forEach(t=>t.dekat=clamp(t.dekat+ri(4,9),0,100));
  addLog('Anda nongkrong bareng geng. Ketawa lepas, beban hidup berkurang.'+fx({happy:+5,stress:-5,relasi:+3}));}},
{k:'bantuTeman',tab:'diri',lbl:'Minta bantuan teman',sub:'Referral kerja / pinjam modal / curhat',min:18,cond:()=>P.teman.some(t=>t.dekat>=55),e:()=>{
  const t=pick(P.teman.filter(x=>x.dekat>=55));
  ask({title:'MINTA BANTUAN '+t.nama.toUpperCase(),text:t.nama+' (teman dekat, '+t.sifat.n+'). Minta tolong apa?',opts:[
    {t:'Titip CV / referral kerja',cond:()=>!P.job&&!P.kuliah&&!P.retired,e:()=>{
      t.dekat=clamp(t.dekat-8,0,100);
      if(r()<0.45+((t.sifat.k==='koneksian'||t.sifat.k==='sukses')?0.3:0)){addLog(t.nama+' merujuk Anda ke kantornya — ada panggilan!','good');jobOffers(buildPool(),2);}
      else addLog(t.nama+' coba bantu, tapi belum ada lowongan yang cocok.'+fx({happy:-2}));}},
    {t:'Pinjam modal',sub:'Saat kepepet',cond:()=>P.money<20e6,e:()=>{
      t.dekat=clamp(t.dekat-10,0,100);
      if(t.sifat.k==='sukses'||t.sifat.k==='koneksian'||r()<0.4){const u=ri(10,30)*1e6;addLog(t.nama+' meminjamkan '+rp(u)+' tanpa bunga. "Bayar kalau sudah ada, ya."'+fx({money:u,relasi:+2}),'good');}
      else addLog(t.nama+' menolak halus — lagi seret juga katanya.'+fx({happy:-3}));}},
    {t:'Curhat saja',e:()=>{t.dekat=clamp(t.dekat+5,0,100);addLog('Anda curhat panjang ke '+t.nama+'. Lega rasanya didengarkan.'+fx({stress:-6,happy:+3}));}},
    {t:'Batal',e:()=>{}}
  ]});}},
{k:'terapi',tab:'diri',lbl:'Konseling / terapi',sub:'Rp 5 jt · Stres −15, pulihkan kesehatan jiwa',min:18,multi:true,cond:()=>P.money>=5e6&&P.st.stress>=25,e:()=>{
  P.money-=5e6; P.terapi=true; P.mental=clamp(P.mental+ri(7,13),0,100);
  addLog('Anda rutin sesi dengan psikolog. Beban yang lama dipendam pelan-pelan terurai, daya tahan mental menguat.'+fx({stress:-15,happy:+5,health:+2}),'good');}},
{k:'detoxJudi',tab:'diri',lbl:'Pulih dari kecanduan judi',sub:'Lepas dari jerat taruhan',min:18,cond:()=>P.judi>=20,e:()=>{
  const before=P.judi;
  if(r()<0.55){P.judi=clamp(P.judi-40,0,100);
    addLog('Anda ikut konseling adiksi dan blokir semua aplikasi taruhan. Cengkeraman judi mengendur.'+fx({stress:+4,happy:+3}),'good');
    if(P.judi<20&&before>=45)ach('comeback');}
  else addLog('Niat berhenti kuat di pagi hari, runtuh saat notifikasi promo masuk malamnya.'+fx({stress:+5}),'bad');}},
{k:'merantau',tab:'diri',lbl:'Merantau / pindah kota',sub:'Rp 15 jt · awal baru di kota lain',min:18,multi:true,cond:()=>P.money>=15e6,e:()=>{
  const opsi=KOTA.filter(c=>c!==P.kota).sort(()=>r()-0.5).slice(0,4);
  ask({title:'MERANTAU',text:'Tinggalkan '+P.kota+' demi peluang baru? Kota metro = peluang besar tapi biaya hidup tinggi; kota kecil = santai & murah. Relasi lokal akan mengendur.',
    opts:opsi.map(c=>({t:'Pindah ke '+c,sub:KOTA_METRO.includes(c)?'metro · biaya hidup tinggi':'kota kecil · santai',cond:()=>P.money>=15e6,e:()=>{
      P.money-=15e6; P.kota=c; P.pernahRantau=true; P.st.relasi=clamp(P.st.relasi-10,0,100);
      addLog('Anda merantau ke <b>'+c+'</b>. Kos baru, wajah-wajah baru, semangat baru (dan sedikit homesick).'+fx({stress:+6,happy:+3}),'sys');
      milestone('Merantau ke '+c);
      if(!P.job&&!P.kuliah&&!P.retired&&r()<0.5){addLog('Kota baru, rezeki baru — ada panggilan kerja!','good');jobOffers(buildPool(),2,KOTA_METRO.includes(c)?1.2:1);}
    }})).concat([{t:'Batal',e:()=>{}}])});}},
{k:'silsilah',tab:'diri',lbl:'Buka arsip silsilah keluarga',sub:'Ringkasan generasi pendahulu',min:6,multi:true,cond:()=>P.silsilah&&P.silsilah.length>0,e:()=>{
  const rows=P.silsilah.map(s=>'<b>Generasi '+s.gen+' — '+s.nama+'</b><br><span class="d">'+s.kota+' · wafat usia '+s.age+(s.sebab?' ('+s.sebab+')':'')+' · '+s.edu+' · kekayaan puncak '+rp(s.maxNet)+' · '+s.kids+' anak · '+s.ach+' pencapaian</span>').join('<br><br>');
  ask({title:'SILSILAH KELUARGA',text:'Jejak para pendahulu yang mengantar Anda sampai di sini:<br><br>'+rows,opts:[{t:'Tutup arsip',e:()=>{}}]});}},
/* ---- ASMARA ---- */
{k:'cari',tab:'asmara',lbl:'Cari pasangan',sub:'Buka hati, buka peluang',min:18,cond:()=>!P.love,e:()=>{
  ask({title:'CARI PASANGAN',text:'Mau lewat jalur mana?',opts:[
    {t:'Aplikasi kencan',sub:'Gratis, untung-untungan',e:()=>caloni(0.25+P.st.charm/250,'lewat aplikasi kencan','Swipe kanan-kiri sebulan penuh, hasilnya cuma pegal jempol.',{happy:-2})},
    {t:'Minta dikenalkan teman',sub:'Peluang lumayan',e:()=>caloni(0.45,'setelah dikenalkan teman','Teman Anda mengenalkan seseorang, tapi obrolan tidak nyambung.',{stress:+2})},
    {t:'Dekati kenalan langsung',sub:'Modal nekat & karisma',e:()=>caloni(0.15+P.st.charm/130,'setelah Anda dekati langsung','Pendekatan Anda ditolak halus. Sakit, tapi pengalaman.',{happy:-4,charm:+2,stress:+3},'bad')},
    {t:'Batal',e:()=>{}}
  ]});}},
{k:'kencan',tab:'asmara',lbl:'Quality time',sub:'Rp 2 jt · Hubungan +6',min:18,multi:true,cond:()=>!!P.love&&P.money>=2e6,e:()=>{
  P.money-=2e6;
  addLog('Anda dan '+P.love.nama.split(' ')[0]+' menghabiskan waktu berdua. Sederhana tapi berkesan.'+fx({rel:+6,happy:+3}));}},
{k:'hadiah',tab:'asmara',lbl:'Beri hadiah',sub:'Rp 5 jt · Hubungan +10',min:18,multi:true,cond:()=>!!P.love&&P.money>=5e6,e:()=>{
  P.money-=5e6;
  addLog('Hadiah kejutan untuk '+P.love.nama.split(' ')[0]+'. Matanya berbinar.'+fx({rel:+10,happy:+2}));}},
{k:'lamar',tab:'asmara',lbl:'Lamar pasangan',sub:'Bawa hubungan ke jenjang serius',min:20,
  cond:()=>P.gender==='L'&&!!P.love&&!P.love.married&&P.love.rel>=58&&P.love.thn>=1&&P.money>=30e6,e:()=>{
  const nm=P.love.nama.split(' ')[0];
  const terima = P.love.rel>=70 || (P.love.rel>=60 && r()<0.7) || (P.love.rel>=58 && r()<0.4);
  if(!terima){ P.love.rel=clamp(P.love.rel-3,0,100);
    addLog('Anda memberanikan diri melamar, tapi '+nm+' merasa belum siap. "Aku sayang kamu, tapi beri aku waktu sedikit lagi, ya."'+fx({stress:+5,happy:-4}),'bad'); return; }
  addLog(nm+' menerima lamaranmu dengan haru. "Iya, aku mau!"','good');
  ask({title:'MELAMAR '+nm.toUpperCase(),text:'Lamaran diterima! Pestanya mau seperti apa?',opts:[
    {t:'Nikah sederhana',sub:'Biaya '+rp(30e6),e:()=>nikah(30e6,6)},
    {t:'Pesta sedang',sub:'Biaya '+rp(80e6),cond:()=>P.money>=80e6,e:()=>nikah(80e6,10,2)},
    {t:'Pesta besar',sub:'Biaya '+rp(200e6),cond:()=>P.money>=200e6,e:()=>nikah(200e6,14,5)},
    {t:'Batal, belum siap',e:()=>{P.love.rel-=3;addLog('Anda mengurungkan niat di detik terakhir. '+nm+' tersenyum, tapi matanya berkata lain.'+fx({stress:+3}));}}
  ]});}},
{k:'doronk',tab:'asmara',lbl:'Bicarakan jenjang serius',sub:'Tanya kesiapan pasangan untuk menikah',min:20,cond:()=>P.gender==='P'&&!!P.love&&!P.love.married,e:()=>{
  const nm=P.love.nama.split(' ')[0];
  const income=P.love.income||(P.love.gajiBln||0)*12;
  if(P.love.rel<55){ P.love.rel=clamp(P.love.rel-2,0,100);
    addLog('Anda memberi kode untuk serius, tapi '+nm+' belum menanggapi. Sepertinya ia memang belum siap.'+fx({stress:+4,happy:-3}),'bad'); }
  else if(income<48e6 && r()<0.6){ P.love.rel=clamp(P.love.rel+2,0,100);
    addLog(nm+' jujur: ia ingin menikahimu, tapi merasa belum mapan secara finansial. Ia minta waktu menabung dulu.'+fx({stress:+2})); }
  else { addLog(nm+' menyatakan kesiapannya, lalu datang melamar!','good'); lamaranMasuk(nm); }}},
{k:'momongan',tab:'asmara',lbl:'Program momongan',sub:'Rencanakan buah hati',min:20,
  cond:()=>!!P.love&&P.love.married&&P.kids.length<4&&P.age<48,e:()=>{
  const ch=P.age<35?0.75:P.age<43?0.45:0.15;
  if(r()<ch)lahirAnak();
  else addLog('Kalian sudah berusaha, tapi belum rezeki tahun ini. Sabar, ya.'+fx({stress:+3}));}},
{k:'adopsi',tab:'asmara',lbl:'Adopsi anak',sub:'Rp 20 jt · beri rumah bagi yang membutuhkan',min:28,multi:true,cond:()=>P.kids.length<4&&P.money>=20e6&&((P.love&&P.love.married)||P.age>=35),e:()=>adopsiAnak()},
{k:'libkel',tab:'asmara',lbl:'Liburan keluarga',sub:'Rp 10 jt · semua senang',min:20,multi:true,cond:()=>!!P.love&&P.love.married&&P.money>=10e6,e:()=>{
  P.money-=10e6; if(P.kids.length)P.dekatAnak=clamp(P.dekatAnak+4,0,100);
  addLog('Liburan keluarga ke '+pick(['pantai','puncak','Bali','rumah nenek'])+'. Foto-fotonya penuh tawa.'+fx({rel:+8,happy:+6,stress:-8}));}},
{k:'anakTime',tab:'asmara',lbl:'Waktu bersama anak',sub:'Main, antar sekolah, dengarkan ceritanya',min:20,cond:()=>P.kids.length>0,e:()=>{
  P.dekatAnak=clamp(P.dekatAnak+8,0,100);
  P.kids.forEach(k=>{ if(P.age-k.lahirAt<20)k.didik=clamp((k.didik||40)+3,0,100); });
  addLog('Anda meluangkan waktu penuh untuk anak-anak. Hal kecil yang tidak akan mereka lupakan.'+fx({happy:+5,stress:-3}),'good');}},
{k:'didikAnak',tab:'asmara',lbl:'Investasi pendidikan anak',sub:'Les, buku, karakter — bekal masa depan',min:20,multi:true,cond:()=>P.kids.some(k=>P.age-k.lahirAt<20)&&P.money>=8e6,e:()=>{
  const muda=P.kids.filter(k=>P.age-k.lahirAt<20);
  ask({title:'DIDIK ANAK',text:'Investasi terbaik orang tua adalah pada anaknya. Untuk siapa? (Biaya '+rp(8e6)+')',
    opts:muda.map(k=>({t:k.nama+' ('+(P.age-k.lahirAt)+' th)',sub:'Bekal +',cond:()=>P.money>=8e6,e:()=>{
      P.money-=8e6; k.didik=clamp((k.didik||40)+ri(8,14),0,100); P.dekatAnak=clamp(P.dekatAnak+2,0,100);
      addLog('Anda membiayai les, buku, dan kegiatan untuk <b>'+k.nama+'</b>. Bekal hidupnya bertambah kuat.'+fx({happy:+3}),'good');}}))
      .concat([{t:'Batal',e:()=>{}}])});}},
{k:'putus',tab:'asmara',lbl:'Akhiri hubungan',sub:'Putus baik-baik',min:18,cond:()=>!!P.love&&!P.love.married,e:()=>{
  const nm=P.love.nama.split(' ')[0];
  ask({title:'AKHIRI HUBUNGAN?',text:'Anda yakin ingin mengakhiri hubungan dengan '+nm+'?',opts:[
    {t:'Ya, akhiri baik-baik',e:()=>{addLog('Anda dan '+nm+' berpisah secara dewasa.'+fx({happy:-10,stress:-3}),'bad');P.love=null;}},
    {t:'Tidak jadi',e:()=>addLog('Anda mengurungkan niat dan memberi kesempatan sekali lagi.')}
  ]});}},
{k:'cerai',tab:'asmara',lbl:'Gugat cerai',sub:'Harta dibagi dua',min:20,cond:()=>!!P.love&&P.love.married,e:()=>{
  const nm=P.love.nama.split(' ')[0];
  ask({title:'GUGAT CERAI?',text:'Bercerai dari '+nm+' berarti harta dibagi dua dan luka untuk semua. Yakin?',opts:[
    {t:'Ya, sudah bulat',e:()=>cerai()},
    {t:'Batalkan',e:()=>addLog('Anda menarik napas panjang dan memilih bertahan.')}
  ]});}},
/* ---- KARIER ---- */
{k:'lamarKerja',tab:'karier',lbl:'Lamar kerja',sub:'Sebar CV ke mana-mana',min:18,cond:()=>!P.job&&!P.kuliah&&!P.retired,e:()=>{
  if(r()<0.4+P.st.smart/250+P.st.charm/300+P.sert*0.05+P.st.relasi/500)jobOffers(buildPool(),ri(2,3));
  else addLog('Puluhan lamaran terkirim, belum ada panggilan. Sabar.'+fx({stress:+5,happy:-2}),'bad');}},
{k:'profesi',tab:'karier',lbl:'Daftar profesi negara',sub:'Polri, TNI, Intel, PNS, Pilot, Pelaut, Damkar',min:18,cond:()=>!P.job&&!P.kuliah&&!P.retired,e:()=>daftarProfesi()},
{k:'lembur',tab:'karier',lbl:'Kerja lembur setahun',sub:'Bonus, performa & reputasi kerja naik',min:18,cond:()=>!!P.job,e:()=>{
  const bonus=Math.round(P.job.g*0.12); P.perf=clamp(P.perf+1,0,3); P.reputasiKerja=clamp(P.reputasiKerja+ri(2,4),0,100); P._lemburTahunIni=true;
  addLog('Anda pasang badan setahun penuh — lembur jadi makanan harian. Atasan mencatat dedikasi Anda.'+fx({money:bonus,stress:+8,health:-2}));}},
{k:'naikGaji',tab:'karier',lbl:'Minta naik gaji',sub:'Nego ke atasan',min:18,cond:()=>!!P.job,e:()=>{
  if(r()<0.22+P.perf*0.2+P.st.charm/300+(P.reputasiKerja-50)/400+(P.ipk>=3.3?0.05:0)){
    P.job.g=Math.round(P.job.g*1.12); P.perf=0;
    addLog('Negosiasi berhasil — gaji naik jadi '+rp(Math.round(P.job.g/12))+'/bulan.','good');
  } else addLog('Atasan bilang "kita lihat tahun depan, ya." Klasik.'+fx({stress:+4}),'bad');}},
{k:'promosi',tab:'karier',lbl:'Ajukan promosi',sub:'Incar jabatan lebih tinggi',min:18,cond:()=>!!P.job&&P.job.level<4,e:()=>{
  if(r()<0.18+P.perf*0.25+P.st.smart/400+(P.s2?0.1:0)+(P.ipk>=3.3?0.08:0)+(P.reputasiKerja-50)/300){
    P.job.level++; P.job.g=Math.round(P.job.g*1.35); P.perf=0; P.reputasiKerja=clamp(P.reputasiKerja+5,0,100);
    addLog('Pengajuan diterima! Anda kini '+LV[P.job.level]+P.job.title+'.'+fx({stress:+8,happy:+6}),'good');
    milestone('Promosi: '+LV[P.job.level]+P.job.title);
  } else addLog('Promosi jatuh ke orang lain. Politik kantor memang kejam.'+fx({stress:+5,happy:-3}),'bad');}},
{k:'pindah',tab:'karier',lbl:'Cari kerja baru',sub:'Lirik perusahaan lain',min:18,cond:()=>!!P.job,e:()=>{
  if(r()<0.3+P.st.charm/300+P.sert*0.05+P.st.relasi/500)jobOffers(buildPool(),2,1.15);
  else addLog('Beberapa interview, belum ada yang lebih baik dari posisi sekarang.');}},
{k:'resign',tab:'karier',lbl:'Resign',sub:'Tinggalkan pekerjaan',min:18,cond:()=>!!P.job,e:()=>{
  ask({title:'RESIGN?',text:'Berhenti dari posisi '+LV[P.job.level]+P.job.title+' tanpa pegangan baru. Yakin?',opts:[
    {t:'Ya, saya butuh hidup baru',e:()=>{addLog('Anda menyerahkan surat resign. Lega bercampur cemas.'+fx({stress:-10,happy:+4}));milestone('Resign dari '+P.job.title);P.job=null;}},
    {t:'Batal',e:()=>addLog('Anda menyimpan lagi surat resign di laci.')}
  ]});}},
{k:'sertif',tab:'karier',lbl:'Ikut sertifikasi',sub:'Rp 8 jt · nilai jual naik',min:18,multi:true,cond:()=>P.money>=8e6&&P.sert<5,e:()=>{
  P.money-=8e6; P.sert++;
  addLog('Sertifikat baru di tangan. CV makin berbobot.'+fx({smart:+3,stress:+3}),'good');}},
{k:'s2',tab:'karier',lbl:'Ambil S2',sub:'Rp 60 jt · gerbang karier atas',min:22,cond:()=>P.eduLevel>=4&&!P.s2&&!P.kuliah&&P.money>=60e6,e:()=>{
  P.money-=60e6; P.s2=true; P.edu+=' + S2';
  addLog('Dua tahun penuh tesis dan begadang — Anda resmi MAGISTER.'+fx({smart:+8,stress:+8}),'good');
  stamp('LULUS S2','green'); milestone('Lulus S2');}},
/* ---- POLITIK & WARGA ---- */
{k:'maju',tab:'politik',lbl:'Maju pemilihan jabatan',sub:'RT → RW → Lurah → DPRD → Bupati',min:25,cond:()=>(!P.politik||P.politik.idx<PJAB.length-1)&&!P.retired,e:()=>majuPolitik()},
{k:'blusukan',tab:'politik',lbl:'Blusukan ke warga',sub:'Dengar keluhan, dongkrak pamor',min:25,multi:true,cond:()=>!!P.politik,e:()=>{
  P.pamor=clamp(P.pamor+ri(4,9),0,100);
  addLog('Anda turun ke gang-gang, menyalami warga, mendengar keluhan langsung. Mereka merasa diperhatikan.'+fx({relasi:+4,charm:+2,stress:+3,happy:+1}));}},
{k:'sembako',tab:'politik',lbl:'Bagi sembako & baksos',sub:'Rp 20 jt · pamor melonjak',min:25,multi:true,cond:()=>!!P.politik&&P.money>=20e6,e:()=>{
  P.money-=20e6; P.pamor=clamp(P.pamor+ri(6,12),0,100);
  addLog('Anda menggelar bakti sosial dan bagi sembako. Warga bersorak, sebagian sibuk berswafoto.'+fx({relasi:+3,happy:+2}),'good');}},
{k:'korupsi',tab:'politik',lbl:'Sunat anggaran',sub:'Perkaya diri diam-diam · sangat berisiko',min:25,multi:true,cond:()=>!!P.politik&&P.politik.idx>=1,e:()=>{
  const ambil=ri(20,80)*1e6*(P.politik.idx+1);
  P.money+=ambil; P.korup=clamp(P.korup+ri(10,22),0,100); P.korupTotal+=ambil; P.pamor=clamp(P.pamor-2,0,100); P.integritas=clamp(P.integritas-ri(8,15),0,100);
  addLog('Anda menyunat anggaran lewat proyek fiktif — '+rp(ambil)+' masuk kantong pribadi. Rekening gemuk, tapi jejak (dan integritas) makin terkikis.'+fx({stress:+6,happy:-2}),'bad');}},
{k:'mundur',tab:'politik',lbl:'Mundur dari jabatan',sub:'Lepas amanah publik',min:25,cond:()=>!!P.politik,e:()=>{
  ask({title:'MUNDUR?',text:'Lepaskan jabatan '+PJAB[P.politik.idx].n+'?',opts:[
    {t:'Ya, mundur',e:()=>{const n=PJAB[P.politik.idx].n;P.politik=null;addLog('Anda mengundurkan diri dari '+n+'. Sebagian warga kehilangan, sebagian lega.'+fx({stress:-6,happy:+2}));milestone('Mundur dari '+n);}},
    {t:'Batal',e:()=>{}}
  ]});}},
/* ---- USAHA ---- */
{k:'buka',tab:'usaha',lbl:'Buka usaha baru',sub:'Maks. 3 usaha berjalan',min:18,multi:true,cond:()=>P.biz.length<3,e:()=>bukaUsahaCard()},
{k:'promo',tab:'usaha',lbl:'Promosi / iklan',sub:'Dongkrak omzet tahun ini',min:18,multi:true,cond:()=>P.biz.length>0,e:()=>pickBiz('PROMOSI USAHA',b=>{
  const c=3e6*b.level;
  if(P.money<c)return addLog('Dana promosi tidak cukup ('+rp(c)+').','bad');
  P.money-=c; b.hype=Math.min(b.hype+2,4);
  addLog('Kampanye iklan '+b.nama+' berjalan — nama usaha makin dikenal.'+fx({stress:+2}),'good');})},
{k:'rekrut',tab:'usaha',lbl:'Rekrut karyawan',sub:'Gaji per orang ikut skala usaha · tanpa batas',min:18,multi:true,cond:()=>P.biz.length>0,e:()=>pickBiz('REKRUT KARYAWAN',b=>{
  ask({title:'REKRUT UNTUK '+b.nama.toUpperCase(),text:'Saat ini '+b.kary+' karyawan. Berapa orang lagi? Catatan: makin gemuk tim, tambahan produktivitas per orang makin kecil — gaji di '+b.nama+' '+rp(gajiKary(b))+'/orang/thn.',
    opts:[1,3,5,10].map(n=>({t:n+' orang',sub:'Beban gaji +'+rp(gajiKary(b)*n)+'/thn',e:()=>{
      b.kary+=n;
      addLog(n+' karyawan baru bergabung di '+b.nama+' (total '+b.kary+' orang).'+fx({stress:-3}),'good');}}))
    .concat([{t:'Batal',e:()=>{}}])});})},
{k:'pecat',tab:'usaha',lbl:'Kurangi karyawan',sub:'Pesangon Rp 5 jt/orang',min:18,multi:true,cond:()=>P.biz.some(b=>b.kary>0),e:()=>pickBiz('KURANGI KARYAWAN',b=>{
  if(b.kary<1)return addLog(b.nama+' tidak punya karyawan.');
  const ops=[1,3,5].filter(n=>n<b.kary).map(n=>({t:n+' orang',sub:'Pesangon '+rp(5e6*n),e:()=>{
    b.kary-=n;P.money-=5e6*n;
    addLog(n+' karyawan '+b.nama+' dirumahkan dengan pesangon (sisa '+b.kary+').'+fx({stress:+2}),'bad');}}));
  ops.push({t:'Semua ('+b.kary+' orang)',sub:'Pesangon '+rp(5e6*b.kary),e:()=>{
    const n=b.kary;b.kary=0;P.money-=5e6*n;
    addLog('Seluruh '+n+' karyawan '+b.nama+' dirumahkan. Anda kembali kerja sendirian.'+fx({stress:+4}),'bad');}});
  ops.push({t:'Batal',e:()=>{}});
  ask({title:'KURANGI KARYAWAN '+b.nama.toUpperCase(),text:'Karyawan saat ini: '+b.kary+' orang. Beban gaji '+rp(gajiKary(b)*b.kary)+'/thn.',opts:ops});})},
{k:'ekspansi',tab:'usaha',lbl:'Ekspansi / buka cabang',sub:'Modal = modal awal',min:18,multi:true,cond:()=>P.biz.some(b=>b.level<5&&P.money>=b.modal),e:()=>pickBiz('EKSPANSI USAHA',b=>{
  if(b.level>=5)return addLog(b.nama+' sudah di skala maksimal.');
  if(P.money<b.modal)return addLog('Modal ekspansi kurang ('+rp(b.modal)+').','bad');
  P.money-=b.modal; b.level++;
  addLog('Cabang baru '+b.nama+' dibuka! Kini level '+b.level+'.'+fx({stress:+5,happy:+4}),'good');
  milestone('Ekspansi '+b.nama+' lv.'+b.level);})},
{k:'jualBiz',tab:'usaha',lbl:'Jual usaha',sub:'Lepas ke pembeli',min:18,multi:true,cond:()=>P.biz.length>0,e:()=>pickBiz('JUAL USAHA',b=>{
  const harga=bizValue(b);
  ask({title:'JUAL '+b.nama.toUpperCase()+'?',text:'Ada pembeli serius menawar '+rp(harga)+'. Lepas?',opts:[
    {t:'Jual',e:()=>{P.money+=harga;P.biz.splice(P.biz.indexOf(b),1);
      addLog('Usaha '+b.nama+' resmi berpindah tangan seharga '+rp(harga)+'.','good');milestone('Jual usaha '+b.nama);}},
    {t:'Tidak jadi',e:()=>addLog('Anda menolak tawaran. '+b.nama+' tetap milik Anda.')}
  ]});})},
/* ---- UANG & ASET ---- */
{k:'invest',tab:'uang',lbl:'Investasi',sub:'Deposito, emas, saham, kripto',min:18,multi:true,cond:()=>P.money>=10e6,e:()=>{
  ask({title:'PILIH INSTRUMEN',text:'Uang yang diinvestasikan akan tumbuh (atau menyusut) tiap tahun:',
    opts:INV.map(v=>({t:v.n,sub:v.desc,e:()=>{
      const amts=[10e6,25e6,50e6,100e6,250e6,500e6,1e9].filter(x=>x<=P.money);
      ask({title:'SETOR KE '+v.n.toUpperCase(),text:'Berapa yang mau disetor? (Uang tunai: '+rp(P.money)+')',
        opts:amts.map(x=>({t:rp(x),e:()=>{P.money-=x;P.inv[v.k]+=x;
          addLog('Anda menempatkan '+rp(x)+' di '+v.n+'.','good');}}))
          .concat([{t:'Semua uang tunai',cond:()=>P.money>0,e:()=>{const x=P.money;P.money=0;P.inv[v.k]+=x;
            addLog('All-in! Seluruh '+rp(x)+' masuk ke '+v.n+'. Berani juga.','good');}},
          {t:'Batal',e:()=>{}}])});
    }})).concat([{t:'Batal',e:()=>{}}])});}},
{k:'tarik',tab:'uang',lbl:'Cairkan investasi',sub:'Tarik seluruh saldo instrumen',min:18,multi:true,cond:()=>INV.some(v=>P.inv[v.k]>0),e:()=>{
  ask({title:'CAIRKAN INVESTASI',text:'Pilih instrumen yang mau dicairkan seluruhnya:',
    opts:INV.filter(v=>P.inv[v.k]>0).map(v=>({t:v.n,sub:'Saldo '+rp(P.inv[v.k]),e:()=>{
      const x=P.inv[v.k]; P.inv[v.k]=0; P.money+=x;
      addLog('Anda mencairkan '+v.n+' senilai '+rp(x)+'.','good');}}))
      .concat([{t:'Batal',e:()=>{}}])});}},
{k:'judi',tab:'uang',lbl:'Judi online',sub:'"Cuan instan" — bikin kecanduan, sering buntung',min:18,multi:true,cond:()=>P.money>=2e6,e:()=>{
  const tiers=[2e6,10e6,50e6].filter(x=>x<=P.money);
  ask({title:'JUDI ONLINE',text:'Slot, sabung, bola — "sekali ini aja". Pasang berapa? (Menang jarang, kalah sering, kecanduan pasti.)',
    opts:tiers.map(x=>({t:'Pasang '+rp(x),e:()=>{
      P.judi=clamp(P.judi+ri(8,16),0,100); P.judiTotal+=x;
      if(r()<0.34){const w=x*(r()<0.18?5:2);P.money+=(w-x);
        addLog('JACKPOT! Anda menang '+rp(w-x)+'. Otak langsung mengira ini keahlian, bukan keberuntungan.'+fx({happy:+6,stress:-3}),'good');}
      else {P.money-=x;
        addLog('Kalah. "Sekali lagi pasti balik," bisik setan kecil di kepala.'+fx({happy:-5,stress:+6}),'bad');}
    }})).concat([{t:'Batal',e:()=>{}}])});}},
{k:'kta',tab:'uang',lbl:'Pinjam bank (KTA)',sub:'Bunga ±8%/thn flat · tenor 5 thn',min:21,cond:()=>!P.kta&&(!!P.job||P.biz.length>0),e:()=>{
  ask({title:'KREDIT TANPA AGUNAN',text:'Bank menyetujui plafon berdasarkan profil Anda. Total pengembalian 140%, dicicil rata 5 tahun.',
    opts:[50e6,100e6,250e6,500e6].map(x=>({t:'Pinjam '+rp(x),sub:'Cicilan '+rp(Math.round(x*1.4/5))+'/thn',e:()=>{
      P.money+=x; P.kta={sisa:Math.round(x*1.4),cicilan:Math.round(x*1.4/5),thn:5};
      addLog('Dana KTA '+rp(x)+' cair ke rekening. Gunakan dengan bijak — bank tidak kenal kata sungkan.'+fx({stress:+3}),'good');
      milestone('Ambil KTA '+rp(x));}}))
    .concat([{t:'Batal',e:()=>{}}])});}},
{k:'lunasKta',tab:'uang',lbl:'Lunasi KTA sekaligus',sub:'Bayar sisa pinjaman bank',min:21,cond:()=>!!P.kta&&P.money>=P.kta.sisa,e:()=>{
  const x=P.kta.sisa;P.money-=x;P.kta=null;
  addLog('KTA lunas '+rp(x)+' sekaligus. Satu beban bulanan hilang.'+fx({stress:-6,happy:+4}),'good');}},
{k:'gaya',tab:'uang',lbl:'Atur gaya hidup',sub:'Hemat / normal / mewah',min:18,e:()=>{
  ask({title:'GAYA HIDUP',text:'Saat ini: '+P.gaya.toUpperCase()+'. Standar pengeluaran menentukan biaya hidup dan suasana hati tiap tahun:',opts:[
    {t:'Hemat',sub:'Biaya hidup −30% · hiburan minim',cond:()=>P.gaya!=='hemat',e:()=>{P.gaya='hemat';
      addLog('Ikat pinggang dikencangkan: masak sendiri, jajan dipangkas, langganan dicabut.');}},
    {t:'Normal',sub:'Standar wajar',cond:()=>P.gaya!=='normal',e:()=>{P.gaya='normal';
      addLog('Pengeluaran kembali ke standar wajar. Cukup, tidak kurang, tidak lebay.');}},
    {t:'Mewah',sub:'Biaya hidup +80% · bahagia & gengsi naik',cond:()=>P.gaya!=='mewah',e:()=>{P.gaya='mewah';
      addLog('Kopi artisan, outfit branded, nongkrong di rooftop. Hidup cuma sekali, katanya.');}},
    {t:'Batal',e:()=>{}}
  ]});}},
{k:'beliAset',tab:'uang',lbl:'Beli aset & properti',sub:'Kendaraan, rumah, ruko, kos, vila — koleksi tanpa batas',min:17,multi:true,e:()=>{
  ask({title:'BELI ASET',text:'Koleksi aset sebanyak yang kamu mau. Properti bisa memberi sewa & nilainya naik tiap tahun. (Uang tunai: '+rp(P.money)+')',
    opts:ASET.filter(d=>P.age>=(d.kelas==='properti'?20:17)).map(d=>({t:d.n,sub:rp(d.harga)+(d.sewa?' · sewa '+rp(d.sewa)+'/th':'')+(d.tumbuh?' · nilai naik':''),e:()=>beliAsetCard(d)}))
      .concat([{t:'Batal',e:()=>{}}])});}},
{k:'jualAset',tab:'uang',lbl:'Jual aset',sub:'Lepas salah satu koleksi',min:17,multi:true,cond:()=>P.aset.length>0,e:()=>{
  ask({title:'JUAL ASET',text:'Aset mana yang dilepas? (Harga jual = nilai sekarang dikurangi sisa KPR)',
    opts:P.aset.map(a=>{const bersih=Math.max(0,Math.round(a.nilai-(a.kpr?a.kpr.sisa:0)));return {t:a.n+(a.kpr?' (KPR)':''),sub:rp(bersih),e:()=>{P.money+=bersih;P.aset.splice(P.aset.indexOf(a),1);addLog('Anda menjual '+a.n+' seharga '+rp(bersih)+'.'+fx({happy:-1}),'good');}};})
      .concat([{t:'Batal',e:()=>{}}])});}},
{k:'lunasKpr',tab:'uang',lbl:'Lunasi KPR aset',sub:'Bayar sisa cicilan properti sekaligus',min:20,cond:()=>P.aset.some(a=>a.kpr),e:()=>{
  ask({title:'LUNASI KPR',text:'KPR aset mana yang mau dilunasi sekaligus?',
    opts:P.aset.filter(a=>a.kpr).map(a=>({t:a.n,sub:'Sisa '+rp(a.kpr.sisa),cond:()=>P.money>=a.kpr.sisa,e:()=>{P.money-=a.kpr.sisa;a.kpr=null;addLog(a.n+' lunas, kini 100% milik Anda.'+fx({stress:-6,happy:+5}),'good');stamp('KPR LUNAS','green');}}))
      .concat([{t:'Batal',e:()=>{}}])});}},
{k:'asuransi',tab:'uang',lbl:'Ikut asuransi kesehatan',sub:'Premi Rp 6 jt/thn · biaya rawat ditanggung 80%',min:18,cond:()=>!P.asuransi,e:()=>{
  P.asuransi=true;
  addLog('Polis asuransi kesehatan aktif. Premi '+rp(6e6)+'/tahun masuk pengeluaran rutin.'+fx({stress:-3}),'good');}},
{k:'stopAsuransi',tab:'uang',lbl:'Stop asuransi kesehatan',sub:'Hentikan premi tahunan',min:18,cond:()=>P.asuransi,e:()=>{
  P.asuransi=false;
  addLog('Polis asuransi dihentikan. Semoga badan bisa diajak kompromi.');}},
{k:'lunasPinjol',tab:'uang',lbl:'Lunasi pinjol',sub:'Bayar tuntas, hidup tenang',min:18,cond:()=>P.pinjol>0&&P.money>=P.pinjol*6e6,e:()=>{
  const x=P.pinjol*6e6;P.money-=x;P.pinjol=0;
  addLog('Pinjol lunas total '+rp(x)+'. Nomor DC akhirnya bisa diblokir.'+fx({stress:-12,happy:+5}),'good');}},
/* ---- HOBI ---- */
{k:'mulaiHobi',tab:'hobi',lbl:'Mulai hobi baru',sub:'Maks. 4 hobi aktif',min:10,multi:true,cond:()=>P.hobi.length<4,e:()=>{
  ask({title:'HOBI BARU',text:'Hidup bukan cuma kerja. Mau menekuni apa?',
    opts:HOBI.filter(h=>!P.hobi.some(x=>x.k===h.k)&&(!h.g||h.g===P.gender)).map(h=>({t:h.n,
      sub:(h.mulai>0?'Modal awal '+rp(h.mulai):'Tanpa modal awal')+(h.b>0?' · biaya '+rp(h.b)+'/thn':''),
      cond:()=>P.age<18||P.money>=h.mulai,
      e:()=>{ if(P.age>=18)P.money-=h.mulai;
        P.hobi.push({k:h.k,level:1,xp:0});
        addLog('Anda mulai menekuni hobi baru: <b>'+h.n+'</b>.'+fx({happy:+4}),'good');
        milestone('Mulai hobi '+h.n);}}))
      .concat([{t:'Batal',e:()=>{}}])});}},
{k:'lepasHobi',tab:'hobi',lbl:'Lepas hobi',sub:'Pensiunkan satu hobi',min:10,multi:true,cond:()=>P.hobi.length>0,e:()=>{
  ask({title:'LEPAS HOBI',text:'Hobi mana yang mau ditinggalkan?',
    opts:P.hobi.map(h=>({t:HOBI.find(x=>x.k===h.k).n,sub:'Level '+h.level,e:()=>{
      P.hobi.splice(P.hobi.indexOf(h),1);
      addLog('Anda pamit dari hobi '+HOBI.find(x=>x.k===h.k).n+'. Mungkin suatu saat kembali.');}}))
      .concat([{t:'Batal',e:()=>{}}])});}}
];

function actAvail(a){
  if(P.age<a.min)return {ok:false,why:'Mulai umur '+a.min};
  if(a.cond&&!a.cond())return {ok:false,why:'Syarat belum terpenuhi'};
  if(!a.multi&&P.used[a.k])return {ok:false,why:'Sudah dilakukan tahun ini',used:true};
  return {ok:true};
}
function doAct(k){
  if(!P||G.current||G.over||!P.alive)return;
  if(k.startsWith('tekuni:')){
    const hk=k.slice(7);
    if(P.used[k]||!P.hobi.some(h=>h.k===hk))return;
    P.used[k]=true; G.acted++;
    tekuni(hk);
  } else {
    const a=ACTS.find(x=>x.k===k);
    if(!a)return;
    const av=actAvail(a);
    if(!av.ok)return;
    if(!a.multi)P.used[k]=true;
    G.acted++;
    a.e();
  }
  if(G.acted>5){ P.st.stress=clamp(P.st.stress+2,0,100); }
  checkAch();
  render();
}

