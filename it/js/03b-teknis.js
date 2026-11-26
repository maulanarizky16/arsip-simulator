'use strict';
/* ================= TEKNIS, KANTOR & SATIR (Simulator IT) =================
   Memakai Kuis.lembar (assets/kuis.js): form pilihan ganda maks. 5 soal.
   1. Mini-game teknis: belajar, ujian sertifikasi, CTF, wawancara teknis
   2. Kejadian satir khas orang IT Indonesia
   3. Latar belakang acak (kampus top, bootcamp, otodidak, SMK TKJ, career switcher)
   4. Jalur baru: remote luar negeri, freelance global, mengajar bootcamp, tech content creator
   5. Kehidupan kantor: penilaian kinerja, PIP, 1-on-1
   6. Postmortem insiden & budaya tim */

/* ---------- bank soal teknis (opsi benar ditulis pertama; diacak saat tampil) ---------- */
const SOAL_IT={
net:[
  {q:'Subnet /24 punya berapa alamat host yang bisa dipakai?',o:['254','256','255','252'],x:'256 alamat dikurangi alamat network & broadcast.'},
  {q:'Protokol yang menerjemahkan nama domain menjadi alamat IP adalah...',o:['DNS','DHCP','ARP','NTP'],x:'"It\'s always DNS."'},
  {q:'Port default HTTPS adalah...',o:['443','80','22','8080'],x:'80 untuk HTTP, 22 untuk SSH.'},
  {q:'Perangkat yang bekerja di Layer 3 (network) model OSI adalah...',o:['router','switch','hub','repeater'],x:'Switch umumnya bekerja di Layer 2.'},
  {q:'Protokol yang memberikan alamat IP otomatis ke klien adalah...',o:['DHCP','DNS','SNMP','FTP'],x:'Dynamic Host Configuration Protocol.'},
  {q:'Perintah Windows untuk melacak rute paket ke tujuan adalah...',o:['tracert','ping','ipconfig','netstat'],x:'Di Linux namanya traceroute.'}
],
linux:[
  {q:'Perintah Linux untuk memantau proses secara real-time adalah...',o:['top','ls','cd','chmod'],x:'Alternatif populer: htop.'},
  {q:'chmod 755 memberi pemilik file izin...',o:['baca, tulis, dan eksekusi (rwx)','baca saja','tulis saja','tidak ada izin'],x:'7 = 4 (r) + 2 (w) + 1 (x).'},
  {q:'File konfigurasi mount otomatis saat boot di Linux adalah...',o:['/etc/fstab','/etc/passwd','/etc/hosts','/var/log/syslog'],x:'Salah tulis fstab bisa bikin server gagal boot.'},
  {q:'Perintah untuk melihat sisa ruang disk per filesystem adalah...',o:['df -h','du -sh','free -m','ps aux'],x:'du menghitung ukuran folder, free untuk memori.'},
  {q:'Log sistem pada distro berbasis systemd dibaca dengan...',o:['journalctl','crontab','systemctl enable','uname'],x:'Contoh: journalctl -u nginx.'}
],
code:[
  {q:'Kode status HTTP 404 berarti...',o:['Not Found','Internal Server Error','Unauthorized','OK'],x:'500 = error di server, 401 = belum terautentikasi.'},
  {q:'Perintah git untuk mengambil perubahan dari remote sekaligus menggabungkannya adalah...',o:['git pull','git fetch','git commit','git stash'],x:'git fetch hanya mengambil tanpa menggabungkan.'},
  {q:'Kompleksitas mengakses elemen array berdasarkan indeks adalah...',o:['O(1)','O(n)','O(log n)','O(n²)'],x:'Akses langsung ke alamat memori.'},
  {q:'Kode status HTTP 500 menandakan...',o:['kesalahan di sisi server','data tidak ditemukan','permintaan berhasil','harus login dulu'],x:'Saatnya membuka log aplikasi.'},
  {q:'Prinsip "Don\'t Repeat Yourself" disingkat...',o:['DRY','KISS','YAGNI','SOLID'],x:'KISS = Keep It Simple, YAGNI = You Aren\'t Gonna Need It.'},
  {q:'Struktur data untuk antrean FIFO (first in, first out) adalah...',o:['queue','stack','tree','graph'],x:'Stack memakai LIFO.'}
],
sec:[
  {q:'Serangan yang menyisipkan perintah SQL lewat input pengguna disebut...',o:['SQL injection','XSS','CSRF','DDoS'],x:'Cegah dengan parameterized query.'},
  {q:'Cara yang benar menyimpan password pengguna adalah...',o:['hash + salt (misalnya bcrypt)','teks biasa','encode Base64','enkripsi XOR sederhana'],x:'Base64 bukan enkripsi, apalagi hashing.'},
  {q:'Serangan yang menyisipkan skrip berbahaya ke halaman yang dibuka pengguna lain disebut...',o:['XSS','SQL injection','brute force','MITM'],x:'Cross-Site Scripting.'},
  {q:'Prinsip memberi akses seminimal mungkin sesuai kebutuhan disebut...',o:['least privilege','defense in depth','zero day','security by obscurity'],x:'Batasi dampak kalau akun dibobol.'},
  {q:'Autentikasi dua faktor (2FA) menggabungkan...',o:['sesuatu yang diketahui dan sesuatu yang dimiliki','dua password berbeda','username dan email','captcha dan password'],x:'Misalnya password + kode OTP di HP.'}
],
cloud:[
  {q:'Unit terkecil yang bisa di-deploy di Kubernetes adalah...',o:['Pod','Node','Cluster','Namespace'],x:'Satu Pod bisa berisi satu atau beberapa container.'},
  {q:'File yang mendefinisikan cara membangun image Docker adalah...',o:['Dockerfile','docker-compose.yml','Makefile','package.json'],x:'docker-compose mengatur banyak service, bukan membangun image.'},
  {q:'Mengelola infrastruktur lewat kode (misalnya Terraform) disebut...',o:['Infrastructure as Code','Serverless','Microservices','Monolith'],x:'Infrastruktur jadi bisa di-review dan di-versioning.'},
  {q:'Tujuan utama CI/CD adalah...',o:['mengotomasi build, tes, dan rilis perangkat lunak','mendesain antarmuka','mengelola anggaran proyek','menulis dokumentasi manual'],x:'Continuous Integration / Continuous Delivery.'},
  {q:'Objek Kubernetes untuk mengekspos aplikasi ke jaringan adalah...',o:['Service','ConfigMap','Secret','PersistentVolume'],x:'Service memberi alamat stabil untuk sekumpulan Pod.'}
],
iot:[
  {q:'Protokol publish/subscribe ringan yang populer untuk IoT adalah...',o:['MQTT','FTP','SMTP','POP3'],x:'Hemat bandwidth, cocok untuk perangkat kecil.'},
  {q:'Dalam MQTT, perangkat mengirim pesan ke...',o:['broker','server DNS','database secara langsung','printer'],x:'Broker meneruskan pesan ke subscriber topik.'},
  {q:'Sensor yang menentukan posisi lewat sinyal satelit adalah...',o:['GPS','LiDAR','termokopel','akselerometer'],x:'Dasar pelacakan armada kendaraan.'},
  {q:'Memperbarui firmware perangkat dari jarak jauh disebut...',o:['OTA (over-the-air)','SSH tunneling','hot swap','bootstrapping'],x:'OTA yang gagal bisa membuat perangkat "brick".'},
  {q:'Jaringan berdaya rendah dan jarak jauh untuk sensor di lapangan adalah...',o:['LoRaWAN','Bluetooth Classic','Wi-Fi 6','NFC'],x:'Cocok untuk perkebunan atau tambang.'}
],
data:[
  {q:'Perintah SQL untuk menggabungkan dua tabel berdasarkan kolom yang berelasi adalah...',o:['JOIN','UNION','GROUP BY','ORDER BY'],x:'UNION menumpuk hasil dua query, bukan menghubungkan kolom.'},
  {q:'Fungsi SQL untuk menghitung jumlah baris adalah...',o:['COUNT()','SUM()','AVG()','MAX()'],x:'SUM menjumlahkan nilai, bukan baris.'},
  {q:'Normalisasi basis data bertujuan untuk...',o:['mengurangi redundansi data','mempercepat koneksi internet','menambah duplikasi data','mengenkripsi data'],x:'Biasanya sampai bentuk normal ketiga (3NF).'},
  {q:'ETL adalah singkatan dari...',o:['Extract, Transform, Load','Encrypt, Transfer, Log','Edit, Test, Launch','Export, Track, Link'],x:'Alur memindahkan data ke data warehouse.'},
  {q:'Kolom yang mengidentifikasi setiap baris tabel secara unik disebut...',o:['primary key','foreign key','index biasa','view'],x:'Foreign key merujuk ke primary key tabel lain.'}
],
support:[
  {q:'Pengguna lapor "internet mati". Langkah pertama yang paling tepat?',o:['Cek apakah dialami satu orang atau semua orang','Langsung ganti router','Install ulang Windows','Eskalasi ke vendor'],x:'Persempit cakupan masalah dulu.'},
  {q:'Perintah Windows untuk melihat konfigurasi IP adalah...',o:['ipconfig','ifconfig','ls','chkdsk'],x:'ifconfig dipakai di Linux/macOS lama.'},
  {q:'Tiket helpdesk sebaiknya diprioritaskan berdasarkan...',o:['dampak dan urgensi','siapa yang paling keras komplain','urutan alfabet nama','jabatan pelapor saja'],x:'Matriks prioritas dampak × urgensi.'},
  {q:'"Sudah dicoba restart?" termasuk langkah troubleshooting untuk...',o:['membersihkan status sementara yang bermasalah','mengganti perangkat keras','menulis ulang aplikasi','mengubah topologi jaringan'],x:'Klasik karena memang sering berhasil.'},
  {q:'Supaya data tidak hilang saat laptop rusak, sebaiknya...',o:['backup rutin ke lokasi terpisah','simpan semua di desktop','matikan antivirus','pakai satu flashdisk untuk semua'],x:'Aturan 3-2-1: 3 salinan, 2 media, 1 di luar lokasi.'}
],
pm:[
  {q:'Dalam Scrum, periode kerja tetap untuk menyelesaikan sekumpulan pekerjaan disebut...',o:['sprint','backlog','epic','retro'],x:'Biasanya 1–4 minggu.'},
  {q:'Rangkaian aktivitas terpanjang yang menentukan durasi proyek disebut...',o:['critical path','scope creep','milestone','baseline'],x:'Terlambat di jalur ini berarti proyek terlambat.'},
  {q:'Bertambahnya lingkup proyek tanpa kendali disebut...',o:['scope creep','burn down','sprint review','kickoff'],x:'"Sekalian tambahin fitur ini ya..."'},
  {q:'Peran yang memprioritaskan product backlog dalam Scrum adalah...',o:['Product Owner','Scrum Master','Stakeholder','QA'],x:'Scrum Master menjaga proses, bukan isi backlog.'},
  {q:'Pertemuan di akhir sprint untuk membahas apa yang bisa diperbaiki disebut...',o:['sprint retrospective','daily standup','sprint planning','demo day'],x:'Fokus pada proses tim, bukan menyalahkan orang.'}
],
ctf:[
  {q:'String Base64 <code>aGFsbw==</code> jika di-decode menjadi...',o:['halo','hello','hola','hallo'],x:'Base64 hanya encoding, siapa pun bisa membalikkannya.'},
  {q:'ROT13 dari <code>SYNT</code> adalah...',o:['FLAG','SYNC','GLAD','FLAT'],x:'Setiap huruf digeser 13 posisi.'},
  {q:'Hash <code>5f4dcc3b5aa765d61d8327deb882cf99</code> (32 karakter heksadesimal) paling cocok dengan algoritma...',o:['MD5','SHA-256','bcrypt','SHA-512'],x:'Itu MD5 dari kata "password". MD5 sudah tidak aman.'},
  {q:'Input login <code>\' OR \'1\'=\'1</code> adalah percobaan serangan...',o:['SQL injection','XSS','path traversal','buffer overflow'],x:'Kondisi selalu benar, login bisa terlewati.'},
  {q:'File di root situs yang sering "membocorkan" path tersembunyi adalah...',o:['robots.txt','favicon.ico','index.html','style.css'],x:'Isinya daftar path yang tidak boleh diindeks mesin pencari.'},
  {q:'Nilai heksadesimal <code>0x41</code> dalam tabel ASCII adalah huruf...',o:['A','B','Z','a'],x:'0x41 = 65 desimal = "A".'}
],
sd:[
  {q:'"Aplikasi melambat saat traffic naik 10×. Langkah pertama Anda?"',o:['Ukur dulu: cek metrik & profil bottleneck','Tambah cache di bagian yang terbukti lambat','Langsung tambah server','Tulis ulang semuanya pakai bahasa lain'],w:[5,4,3,1]},
  {q:'"Bug kritis muncul di produksi tengah malam. Apa yang Anda lakukan?"',o:['Mitigasi dulu (rollback/feature flag), lalu cari akar masalah','Hotfix langsung di server produksi','Tunggu pagi sambil berharap','Salahkan deploy rekan'],w:[5,2,1,1]},
  {q:'"Kapan memilih microservices dibanding monolith?"',o:['Saat tim & domain sudah besar dan butuh deploy independen','Selalu, karena lebih modern','Tidak pernah','Kalau sedang tren di LinkedIn'],w:[5,2,2,1]},
  {q:'"Rekan satu tim menolak code review Anda. Bagaimana?"',o:['Diskusikan alasan teknisnya dengan kepala dingin','Minta pendapat orang ketiga','Merge diam-diam','Balas menolak semua PR-nya'],w:[5,4,1,1]},
  {q:'"Desain layanan pemendek URL (seperti bit.ly). Hal terpenting?"',o:['ID unik, penyimpanan key-value, dan cache untuk baca yang dominan','Satu file teks di server','Pakai blockchain','Warna logonya'],w:[5,2,1,1]}
]
};
/* kategori soal per spesialisasi & per fokus belajar & per sertifikasi */
const KAT_SPES={support:['support','net'],sysadmin:['linux','net'],devops:['cloud','linux'],network:['net','iot'],iot:['iot','net'],security:['sec','net'],backend:['code','data'],data:['data','code']};
const KAT_FOKUS={ngoding:['code','data'],sistem:['linux','cloud'],jaringan:['net','iot'],keamanan:['sec']};
const KAT_SERT={cloud:'cloud',cka:'cloud',ccnp:'net',oscp:'sec',pmp:'pm'};
function soalIT(kats,n){
  const pool=[]; for(const k of kats)for(const s of (SOAL_IT[k]||[]))pool.push(s);
  return pool.sort(()=>r()-0.5).slice(0,Math.min(n,5));
}

/* ================= 3. LATAR BELAKANG ACAK ================= */
const LATAR_IT=[
  {k:'kampus',n:'Lulusan Informatika kampus top',w:22,age:22,st:{ngoding:+8,sistem:+5,soft:+3},rep:+6,money:5e6,
    d:'Kamu lulus dari jurusan Informatika kampus negeri ternama. Grup alumni penuh senior di unicorn dan perusahaan luar negeri.'},
  {k:'bootcamp',n:'Lulusan bootcamp',w:22,age:24,st:{ngoding:+6,soft:+6},rep:+2,money:-15e6,
    d:'Kuliahmu jurusan lain. Kamu banting setir lewat bootcamp coding 3 bulan dengan skema bayar belakangan (ISA): biaya dipotong dari gaji nanti.'},
  {k:'otodidak',n:'Otodidak dari YouTube & forum',w:20,age:21,st:{ngoding:+4,keamanan:+5,sistem:+3},rep:-2,money:2e6,
    d:'Semua ilmu dari tutorial YouTube, dokumentasi, dan forum tengah malam. Tanpa ijazah IT, modal portofolio GitHub.'},
  {k:'smk',n:'Lulusan SMK TKJ',w:20,age:19,st:{jaringan:+10,sistem:+6},rep:0,money:1e6,
    d:'Lulusan SMK Teknik Komputer & Jaringan. Jago crimping kabel dan setting router sejak umur 16, tapi banyak lowongan menulis "minimal S1".'},
  {k:'switcher',n:'Career switcher',w:16,age:27,st:{soft:+10,ngoding:-4,sistem:-4},rep:+1,money:40e6,
    d:'Lima tahun kerja di bidang lain (akuntansi), lalu memutuskan pindah ke IT. Lebih tua dari rekan seangkatan, tapi lebih paham bisnis dan komunikasi.'}
];
function acakLatarIT(){ const t=LATAR_IT.reduce((a,l)=>a+l.w,0); let x=r()*t; for(const l of LATAR_IT){ x-=l.w; if(x<=0)return l; } return LATAR_IT[0]; }
function terapkanLatarIT(){
  const l=acakLatarIT();
  P.latar=l.k; P.latarN=l.n;
  P.age=l.age; P.lahir=N.tahun-l.age;
  for(const k in l.st)P.st[k]=clamp(P.st[k]+l.st[k],0,100);
  P.reputasi=clamp(P.reputasi+l.rep,0,100); P.money+=l.money;
  if(l.k==='bootcamp')P.isa=24;              /* cicilan ISA 2 tahun */
  addLog('Latar belakang: <b>'+l.n+'</b>. '+l.d,'sys');
  milestone('Latar: '+l.n);
  ask({title:'LATAR BELAKANG',text:'<b>'+l.n.toUpperCase()+'</b><br><br>'+l.d+'<br><br>Usia mulai: <b>'+l.age+' tahun</b>'+(l.money?' · Uang awal: <b>'+rp(l.money)+'</b>':'')+'.',opts:[{t:'Lanjut »',e:()=>{}}]});
}

/* ================= 1. MINI-GAME TEKNIS ================= */
/* belajar: pilih fokus → 3 soal sesuai fokus & spesialisasi */
function belajarTeknis(){
  const fokus=[['ngoding','Coding & scripting'],['sistem','Server, cloud & container'],['jaringan','Jaringan & IoT'],['keamanan','Keamanan siber']];
  ask({title:'FOKUS BELAJAR TAHUN INI',text:'Teknologi bergerak cepat. Mau perdalam yang mana? Kamu akan mengerjakan 3 soal latihan.',
    opts:fokus.map(f=>({t:f[1],e:()=>{
      P.usedSkill[f[0]]=true;
      Kuis.lembar('LATIHAN '+f[1].toUpperCase(),'Kopi sachet, terminal terbuka, dokumentasi di tab sebelah. Kerjakan soal latihan ini:',soalIT(KAT_FOKUS[f[0]].concat(KAT_SPES[P.spes]||[]),3),h=>{
        const naik=2+h.benar*2;
        const o={}; o[f[0]]=naik; o.stres=+2;
        if(h.benar===h.jumlah&&h.jumlah){ o.reputasi=+1; addLog('Semua soal benar. Konsepnya benar-benar nempel.'+fx(o),'good'); }
        else addLog('Kamu mempelajari ulang bagian yang salah.'+fx(o),'good');
      });
    }}))});
}
/* ujian sertifikasi: 5 soal, lulus jika ≥ 4 benar; gagal = biaya hangus */
function ujianSertifikasi(s){
  P.money-=s.biaya;
  Kuis.lembar('UJIAN '+s.n.toUpperCase(),'Biaya ujian '+rp(s.biaya)+' sudah dibayar. Ruang ujian sunyi, webcam pengawas menyala. Lulus jika minimal 4 dari 5 benar:',soalIT([KAT_SERT[s.k]||'code'],5),h=>{
    if(h.benar>=4){
      P.sertifikat.push(s.k);
      addLog('<b>LULUS</b> ujian '+s.n+'! Satu baris baru di LinkedIn, satu lonjakan kemampuan.'+fx(Object.assign({reputasi:+2},s.st)),'good');
      milestone('Sertifikasi: '+s.n); stamp('LULUS SERTIFIKASI','green'); ach('lulusSertif'); if(P.sertifikat.length>=4)ach('sertifikat');
    } else addLog('Nilaimu belum mencapai batas lulus. Biaya '+rp(s.biaya)+' hangus, tapi kamu tahu bagian mana yang harus diulang.'+fx({stres:+5,reputasi:-1}),'bad');
  });
}
/* CTF: 3 tantangan; menang jika ≥ 2 flag */
function ctfMain(){
  P.usedSkill.keamanan=true;
  Kuis.lembar('KOMPETISI CTF','Papan skor menyala, timer berjalan. Rebut flag dari tantangan berikut:',soalIT(['ctf'],3),h=>{
    P.hackWhite++;
    if(h.benar>=2){ P.ctfMenang++; const u=ri(5,20)*1e6;
      addLog('Tim kamu naik podium CTF dengan '+h.benar+' flag!'+fx({keamanan:+4,reputasi:+4,money:+u}),'good'); ach('ctfJuara'); leg(2,1);
      if(h.benar===h.jumlah)ach('ctfSempurna'); }
    else { addLog('Belum naik podium, tapi teknik baru terserap dari soal-soalnya.'+fx({keamanan:+3,stres:+2}),'sys'); leg(1,0); }
  });
}
/* wawancara teknis: 2 soal teknis + 1 system design → done(rasio 0..1) */
function wawancaraTeknis(konteks,done){
  const soal=soalIT(KAT_SPES[P.spes]||['code'],2).concat(soalIT(['sd'],1));
  Kuis.lembar('WAWANCARA TEKNIS',konteks+' Dua engineer senior di layar Zoom membuka sesi teknis:',soal,h=>{
    const rasio=(h.jumlah?h.benar/h.jumlah:0.5)*0.6+(h.poinMaks?h.poin/h.poinMaks:0.5)*0.4;
    if(rasio>=0.95)ach('wawancaraAce');
    done(rasio);
  },{tombol:'Akhiri wawancara »'});
}

/* ================= 4. JALUR KARIER BARU ================= */
function lamarRemoteLN(){
  wawancaraTeknis('Perusahaan di Eropa membuka posisi remote. Wawancara dalam bahasa Inggris, jam 10 malam waktu Indonesia.',rs=>{
    if(rs>=0.65){ P.tempat='remote'; P.tempatN='Remote untuk Perusahaan Luar'; P.tenure=0; P.jobHops=(P.jobHops||0)+1;
      addLog('<b>Diterima kerja remote untuk perusahaan luar negeri!</b> Gaji dolar, meeting jam 11 malam.'+fx({reputasi:+3,stres:+3}),'good'); stamp('GAJI DOLAR','gold'); ach('gajiDolar'); milestone('Kerja remote perusahaan luar negeri'); leg(0,4); }
    else addLog('Email penolakan datang dengan bahasa yang sangat sopan: "We decided to move forward with other candidates."'+fx({stres:+4}),'bad');
  });
}

/* ================= 6. POSTMORTEM & BUDAYA TIM ================= */
function postmortem(c,sukses){
  ask({title:'POSTMORTEM INSIDEN',text:'Insiden besar <b>'+c.jenis.n+'</b> '+(sukses?'berhasil dipulihkan':'sempat lepas kendali')+'. Manajemen minta rapat postmortem. Arah rapatnya?',opts:[
    {t:'Blameless: fokus memperbaiki sistem & proses',sub:'Tim belajar, kepercayaan tumbuh',e:()=>{ P.budaya=clamp((P.budaya||50)+8,0,100); P.pmBlameless=(P.pmBlameless||0)+1;
      addLog('Kalian menulis linimasa, akar masalah, dan action item tanpa menunjuk siapa pun. Tim merasa aman untuk jujur.'+fx({soft:+2,reputasi:+2}),'good'); if(P.pmBlameless>=3)ach('blameless'); leg(2,0); }},
    {t:'Cari siapa yang salah',sub:'Puas sesaat, tim jadi takut',e:()=>{ P.budaya=clamp((P.budaya||50)-10,0,100);
      addLog('Satu nama disebut berulang-ulang di rapat. Sejak hari itu, orang-orang mulai menyembunyikan kesalahan kecil.'+fx({reputasi:+1,soft:-2}),'bad'); leg(-2,1); }},
    {t:'Skip postmortem, lanjut kerja',e:()=>{ P.budaya=clamp((P.budaya||50)-3,0,100); addLog('Tidak ada yang mencatat pelajaran. Insiden serupa menunggu giliran.'+fx({stres:-1})); }}
  ]});
}

/* ================= 5. KEHIDUPAN KANTOR ================= */
function penilaianKinerja(){
  const dB=P.beres-(P.revBeres||0), dG=P.gagal-(P.revGagal||0);
  P.revBeres=P.beres; P.revGagal=P.gagal;
  let skor=50+dB*8-dG*10+(P.reputasi-40)/2+(P.st.soft-50)/3+((P.budaya||50)-50)/5+ri(-8,8);
  ask({title:'PENILAIAN KINERJA TAHUNAN',text:'Formulir self-assessment dibuka: tahun ini kamu menangani '+dB+' insiden dengan baik dan '+dG+' yang meleset. Cara mengisinya?',opts:[
    {t:'Jujur, lengkap dengan data & dampak',e:()=>hasilKinerja(skor+5)},
    {t:'Merendah: "biasa saja, Pak"',e:()=>hasilKinerja(skor-6)},
    {t:'Klaim semua keberhasilan tim',sub:'Bisa dipercaya, bisa juga ketahuan',e:()=>{ P.budaya=clamp((P.budaya||50)-5,0,100); hasilKinerja(r()<0.4?skor-12:skor+8); }}
  ]});
}
function hasilKinerja(skor){
  const g=gajiTahun();
  if(skor>=70){ const b=Math.round(g/6); addLog('Rating: <b>Exceeds Expectations</b>. Bonus '+rp(b)+' cair, manajer menyebut namamu di rapat besar.'+fx({money:+b,reputasi:+3}),'good'); ach('exceeds'); P.pip=0; leg(1,2); }
  else if(skor>=45){ const b=Math.round(g/12); addLog('Rating: <b>Meets Expectations</b>. Bonus '+rp(b)+'. Aman, standar, tidak ada yang istimewa.'+fx({money:+b}),'sys'); P.pip=0; }
  else { P.pip=(P.pip||0)+1; addLog('Rating: <b>Below Expectations</b>. "Kita perlu bicara soal performa."'+fx({stres:+8,reputasi:-2}),'bad');
    if(P.pip>=2)ask({title:'PERFORMANCE IMPROVEMENT PLAN',text:'Kamu resmi masuk <b>PIP</b> 90 hari: target mingguan, check-in setiap Jumat, dan semua orang tahu artinya.',opts:[
      {t:'Jalani PIP dengan serius',sub:'Lembur, tapi kesempatan bertahan',e:()=>{ if(r()<0.55+P.st.soft/300){ P.pip=0; addLog('Kamu lolos PIP. Manajer bilang "kerja bagus", tanpa senyum.'+fx({stres:+10,reputasi:+2}),'good'); ach('lolosPIP'); }
        else { addLog('PIP tidak terlewati. Undangan Zoom 5 menit dari HR tiba hari Senin pagi.'+fx({stres:+12,reputasi:-3}),'bad'); milestone('Diberhentikan setelah PIP'); cariKerja(); } }},
      {t:'Resign duluan dengan kepala tegak',e:()=>{ addLog('Kamu mengundurkan diri sebelum PIP selesai. Lega, sekaligus deg-degan.'+fx({stres:-5}),'sys'); milestone('Resign saat PIP'); cariKerja(); }}
    ]});
  }
}
function satuSatu(){
  ask({title:'1-ON-1 DENGAN MANAJER',text:'Manajer membuka kalender: "Gimana kabarnya? Ada yang mau dibahas?"',opts:[
    {t:'Minta naik gaji, bawa data pencapaian',e:()=>{ if(r()<0.25+P.reputasi/250+(P.pip?-0.2:0)){ const n=Math.round(gajiTahun()*0.1); addLog('Manajer setuju mengajukan penyesuaian gaji '+rp(n)+'/tahun.'+fx({money:+n,stres:-2}),'good'); }
      else addLog('"Budget tahun ini sudah dikunci. Nanti kita lihat di siklus berikutnya ya."'+fx({stres:+3}),'bad'); }},
    {t:'Curhat beban kerja & on-call',e:()=>{ P.lembur=clamp((P.lembur||0)-15,0,100); addLog('Manajer mengatur ulang rotasi on-call. Akhirnya ada yang mendengar.'+fx({stres:-6,soft:+1}),'good'); }},
    {t:'Minta jalur belajar & mentor',e:()=>addLog('Kamu dijadwalkan mentoring rutin dengan engineer senior.'+fx({ngoding:+2,sistem:+2,soft:+1}),'good')},
    {t:'"Aman, Pak. Nggak ada."',e:()=>addLog('Rapat selesai dalam 4 menit. Rekor.')}
  ]});
}

/* ================= 2. KEJADIAN SATIR & KHUSUS LATAR ================= */
const kerjaAktif=()=>!P.retired&&!P.dipecat&&P.penjara<=0;
const EV_IT=[
{k:'printer',w:3,cd:3,run:()=>ask({title:'"KAMU ANAK IT, KAN?"',text:'Tetangga datang membawa printer macet, HP yang "kena virus", dan password WiFi yang lupa. "Kamu kan kerja di IT, pasti bisa."',opts:[
  {t:'Bantu semuanya',e:()=>{ P.servisKali=(P.servisKali||0)+1; addLog('Printer jalan lagi setelah dicabut-colok. Kamu dibayar pisang goreng dan reputasi "teknisi satu RT".'+fx({soft:+2,stres:+3}),'good'); if(P.servisKali>=3)ach('tukangServis'); }},
  {t:'"Itu bukan bidangku, Bu"',e:()=>addLog('Tetangga tidak percaya. "Masa anak IT nggak bisa benerin printer?"'+fx({soft:-1}))},
  {t:'Pura-pura sedang on-call',e:()=>addLog('Kamu kabur dengan alasan "server kantor down". Kali ini bohong, besok mungkin kenyataan.'+fx({stres:-1}))}]})},
{k:'jumat',w:3,cd:3,cond:kerjaAktif,run:()=>ask({title:'DEPLOY JUMAT SORE',text:'Jumat, 16.30. Atasan: "Fiturnya deploy sekarang aja ya, biar Senin klien bisa lihat."',opts:[
  {t:'Tolak sopan, jadwalkan Senin pagi',e:()=>{ if(r()<0.6)addLog('Atasan setuju setelah kamu jelaskan risikonya. Akhir pekan tetap damai.'+fx({soft:+2,stres:-2}),'good'); else addLog('Atasan kesal: "Kok susah banget sih?" Tapi akhir pekanmu aman.'+fx({reputasi:-1})); }},
  {t:'Deploy sekarang',e:()=>{ if(r()<0.4){ P.deployGagal++; addLog('Deploy gagal jam 18.00. Akhir pekanmu hilang di depan log error.'+fx({stres:+10,kesehatan:-2,reputasi:-1}),'bad'); } else addLog('Deploy lancar. Kamu tetap tidak bisa tidur nyenyak sampai Senin.'+fx({stres:+3})); }}]})},
{k:'kondangan',w:2,cd:4,cond:kerjaAktif,run:()=>ask({title:'PRODUCTION DOWN SAAT KONDANGAN',text:'Kamu sedang antre prasmanan di kondangan sepupu. HP bergetar: "SEV-1: checkout error 100%".',opts:[
  {t:'Buka laptop di parkiran',e:()=>addLog('Kamu memulihkan layanan dari jok motor, berbaju batik, ditemani suara organ tunggal.'+fx({reputasi:+2,stres:+5}),'good')},
  {t:'Serahkan ke rekan on-call',e:()=>{ if((P.budaya||50)>=50)addLog('Rekanmu sigap menangani. Kamu kembali ke antrean rendang.'+fx({stres:-1}),'good'); else addLog('Rekanmu panik dan menelepon balik 9 kali. Rendangnya keburu habis.'+fx({stres:+5})); }}]})},
{k:'lowongan',w:2,cd:6,run:()=>addLog('Lowongan di LinkedIn: "Dibutuhkan Senior Engineer, pengalaman 5 tahun di framework yang baru rilis 2 tahun lalu, menguasai 14 bahasa pemrograman, gaji UMR, suasana kekeluargaan." Kamu menutup tab dengan tenang.'+fx({stres:+1}),'sys')},
{k:'logo',w:3,cd:4,cond:()=>kerjaAktif()&&(P.tempat==='agency'||P.tempat==='remote'),run:()=>ask({title:'"LOGONYA DIBESARKAN, TAPI JANGAN TERLALU BESAR"',text:'Klien mengirim revisi ke-11: "Warnanya lebih ngejreng tapi elegan. Pokoknya yang wow tapi simpel."',opts:[
  {t:'Kerjakan dengan sabar',e:()=>addLog('Revisi ke-12 akhirnya disetujui. Isinya sama persis dengan versi pertama.'+fx({soft:+2,stres:+5}))},
  {t:'Ajak diskusi: tanya tujuan bisnisnya',e:()=>addLog('Setelah diskusi, klien sadar yang dia butuhkan bukan logo baru, tapi landing page yang cepat. Proyek berubah jadi lebih masuk akal.'+fx({soft:+3,reputasi:+2}),'good')}]})},
{k:'aiBos',w:2,cd:6,cond:kerjaAktif,run:()=>ask({title:'"PAKAI AI UNTUK SEMUA"',text:'Atasan baru pulang seminar: "Mulai besok semua kerjaan pakai AI ya. Kalau AI bisa, kenapa harus kita?"',opts:[
  {t:'Susun panduan pemakaian AI yang aman',e:()=>{ P.pelatihanAI=true; addLog('Kamu membuat panduan: kapan AI membantu, kapan berbahaya (data rahasia, kode tanpa review). Atasan menyebutnya "visioner".'+fx({reputasi:+3,soft:+2}),'good'); }},
  {t:'Copy-paste semua jawaban AI ke produksi',e:()=>addLog('Kode hasil AI jalan... sampai tidak. Ada fungsi yang memanggil library yang tidak pernah ada.'+fx({stres:+6,reputasi:-2}),'bad')}]})},
{k:'standup',w:2,cd:4,cond:kerjaAktif,run:()=>addLog('Stand-up meeting "15 menit" berlangsung 1 jam 10 menit. Separuhnya membahas siapa yang menghabiskan galon di pantry.'+fx({stres:+2}),'sys')},
{k:'winupdate',w:2,cd:6,cond:kerjaAktif,run:()=>addLog('Laptop kantor memaksa update Windows tepat 5 menit sebelum demo ke klien. "Jangan matikan komputer Anda. 3% selesai."'+fx({stres:+4}),'bad')},
{k:'legacy',w:2,cd:5,cond:kerjaAktif,run:()=>ask({title:'KODE WARISAN TANPA DOKUMENTASI',text:'Kamu mewarisi modul pembayaran berumur 9 tahun. Satu-satunya komentar: <code>// jangan diubah, nggak tahu kenapa bisa jalan</code>',opts:[
  {t:'Tulis tes dulu, refactor pelan-pelan',e:()=>{ const app=infraGet('app'); if(app)app.debt=clamp((app.debt||0)-10,0,100); addLog('Butuh berminggu-minggu, tapi sekarang modul itu punya tes dan dokumentasi.'+fx({ngoding:+3,stres:+3,reputasi:+1}),'good'); }},
  {t:'Ikuti petunjuk komentar: jangan diubah',e:()=>addLog('Modul itu tetap jalan. Entah sampai kapan.'+fx({stres:-1}))}]})},
{k:'hackIG',w:2,cd:8,run:()=>ask({title:'"BISA HACK IG MANTANKU?"',text:'Teman lama tiba-tiba chat: "Bro/Sis, kamu kan anak IT. Bisa bantu buka IG mantanku? Bayar deh."',opts:[
  {t:'Tolak, jelaskan itu melanggar hukum',e:()=>addLog('Kamu menolak dan menjelaskan soal UU ITE. Temanmu membalas "yaelah, serius amat".'+fx({soft:+1}),'good')},
  {t:'Ajari dia pasang 2FA di akunnya sendiri',e:()=>addLog('Topik beralih ke keamanan akunnya sendiri. Dia malah berterima kasih.'+fx({soft:+2,keamanan:+1}),'good')},
  {t:'Terima bayarannya',e:()=>{ P.hackBlack++; addLog('Kamu mengerjakannya diam-diam. Uangnya kecil, risikonya besar, nuraninya sedikit tercoreng.'+fx({money:+2e6,heat:+4}),'bad'); setTopi(); }}]})},
{k:'onCallLibur',w:2,cd:5,cond:kerjaAktif,run:()=>addLog('Liburan keluarga ke pantai. Kamu menghabiskan hari kedua di lobi hotel demi sinyal stabil, menangani alert yang ternyata false positive.'+fx({stres:+5,kesehatan:-1}),'bad')},
{k:'gojek',w:2,cd:8,run:()=>addLog('Om di arisan keluarga: "Kerja IT bertahun-tahun kok belum bikin aplikasi kayak Gojek sendiri?" Kamu tersenyum dan mengambil kue lagi.'+fx({stres:+1}),'sys')},
{k:'remoteMalam',w:3,cd:3,cond:()=>kerjaAktif()&&P.tempat==='remote',run:()=>addLog('Meeting sinkron tim global jam 23.00 WIB. Kamu presentasi dengan kopi ketiga sementara rekanmu di Eropa baru sarapan.'+fx({stres:+4,kesehatan:-1}),'sys')},
{k:'budayaBuruk',w:3,cd:6,cond:()=>kerjaAktif()&&(P.budaya||50)<35,run:()=>{ addLog('Engineer terbaik di timmu resign. Di exit interview dia bilang: "Di sini salah sedikit langsung disalahkan."'+fx({stres:+6,reputasi:-2}),'bad'); for(const a of P.infra)a.debt=clamp((a.debt||0)+4,0,100); }},
/* --- khusus latar --- */
{k:'minS1',w:4,cd:99,cond:()=>P.latar==='smk'&&kerjaAktif(),run:()=>ask({title:'"MINIMAL S1"',text:'Tawaran naik posisi tertahan: sistem HR menolak otomatis karena syarat "minimal S1".',opts:[
  {t:'Kuliah sambil kerja (kelas karyawan)',sub:'Rp 20 jt/tahun, lelah, tapi syarat terpenuhi',e:()=>{ P.money-=20e6; P.kuliahMalam=true; addLog('Kamu mendaftar kuliah kelas karyawan. Senin-Jumat kerja, Sabtu-Minggu kuliah.'+fx({stres:+8,soft:+3}),'sys'); milestone('Kuliah sambil kerja'); }},
  {t:'Buktikan lewat portofolio & sertifikasi',e:()=>addLog('Kamu menyusun portofolio proyek nyata. Beberapa perusahaan mulai melihat kemampuan, bukan ijazah.'+fx({reputasi:+3}),'good')}]})},
{k:'impostor',w:3,cd:12,cond:()=>(P.latar==='otodidak'||P.latar==='bootcamp')&&kerjaAktif(),run:()=>ask({title:'IMPOSTOR SYNDROME',text:'Di rapat teknis, rekan lulusan kampus top membahas istilah yang belum pernah kamu dengar. "Jangan-jangan aku memang tidak pantas di sini?"',opts:[
  {t:'Tanya, lalu pelajari malamnya',e:()=>addLog('Ternyata rekanmu juga baru membacanya minggu lalu. Semua orang sedang belajar.'+fx({soft:+2,ngoding:+2,stres:-2}),'good')},
  {t:'Diam & pura-pura paham',e:()=>addLog('Kamu mengangguk sepanjang rapat dan pulang dengan kepala penuh tanda tanya.'+fx({stres:+5}))}]})},
{k:'alumni',w:3,cd:12,cond:()=>P.latar==='kampus'&&kerjaAktif()&&P.reputasi>=30,run:()=>addLog('Grup alumni ramai: senior di perusahaan besar membagikan lowongan internal dan menawarkan referral. Jaringan kampus memang aset.'+fx({reputasi:+3}),'good')},
{k:'mantanAkuntan',w:3,cd:12,cond:()=>P.latar==='switcher'&&kerjaAktif(),run:()=>addLog('"Kamu kan dulu akuntan? Sekalian bantu cek laporan pajak tim ya." Pengalaman lamamu ternyata membuatmu jadi jembatan antara tim teknis dan bisnis.'+fx({soft:+3,reputasi:+2}),'good')}
];
function eventsIT(){
  P.cd=P.cd||{};
  if(P.budaya==null)P.budaya=50;
  /* cicilan ISA bootcamp */
  if(P.isa>0&&P.jab){ P.isa-=12; const pot=Math.round(gajiTahun()*0.12); P.money-=pot; addLog('Cicilan ISA bootcamp memotong '+rp(pot)+' dari gajimu tahun ini'+(P.isa<=0?'. Akhirnya lunas!':'.'),'sys'); }
  if(P.kuliahMalam&&!P.s1Malam&&r()<0.35){ P.s1Malam=true; P.kuliahMalam=false; addLog('Kamu diwisuda dari kelas karyawan. Syarat "minimal S1" bukan penghalang lagi.'+fx({reputasi:+4,stres:-5}),'good'); stamp('WISUDA S1','green'); milestone('Lulus S1 kelas karyawan'); }
  if(P.retired||P.dipecat||P.penjara>0)return;
  /* kehidupan kantor */
  if(P.jab&&P.tempat!=='remote'&&r()<0.75)penilaianKinerja();
  else if(P.jab&&r()<0.5)penilaianKinerja();
  if(P.jab&&r()<0.22)satuSatu();
  if((P.budaya||50)>=75)ach('blameless');
  /* satu kejadian satir/latar per tahun */
  if(r()<0.85){
    const pool=EV_IT.filter(e=>(!P.cd[e.k]||P.years-P.cd[e.k]>=e.cd)&&(!e.cond||e.cond()));
    if(pool.length){ const t=pool.reduce((a,e)=>a+e.w,0); let x=r()*t; let ev=pool[pool.length-1]; for(const e of pool){ x-=e.w; if(x<=0){ ev=e; break; } } P.cd[ev.k]=P.years; ev.run(); }
  }
}
