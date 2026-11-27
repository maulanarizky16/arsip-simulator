'use strict';
/* ================= KEJADIAN ACAK BULANAN =================
   Tiap kejadian: k (kunci), w (bobot), cd (jeda bulan sebelum bisa muncul lagi), cond, run. */
const kerjaKantor=()=>P.profesi==='karyawan'||P.profesi==='outsourcing'||P.profesi==='guru';
const EVENTS=[
/* serangan fajar: pemilihan kepala desa / ketua RW bisa terjadi kapan saja (tanda jasa "Tolak Serangan Fajar" dulu tak punya pemicu) */
{k:'fajar',w:1,cd:14,run:()=>ask({title:'SERANGAN FAJAR',text:'Besok pemilihan kepala desa di kampung halaman / ketua RW di lingkunganmu. Subuh-subuh pintu kos diketuk: seorang "tim sukses" menyodorkan amplop berisi '+rp(150e3)+'. "Titip suara ya. Ingat nomor dua."',opts:[
  {t:'Tolak amplopnya',e:()=>{ ach('tolakAmplop'); addLog('Kamu menolak dengan sopan. Si tim sukses bengong, lalu pindah ke pintu sebelah yang langsung dibuka lebar.'+fx({waras:+3,gengsi:+1}),'good'); }},
  {t:'Ambil uangnya, pilih sesuka hati',e:()=>addLog('"Ambil uangnya, jangan pilih orangnya," katamu dalam hati. Rp 150 ribu habis untuk token listrik dan gas. Lima tahun ke depan jalan depan gang tetap berlubang.'+fx({saldo:150e3,nrimo:+2}),'sys')},
  {t:'Ambil & benar-benar pilih nomor dua',e:()=>addLog('Kamu menepati "janji". Calon nomor dua menang, dan modal amplopnya harus balik dari suatu tempat.'+fx({saldo:150e3,waras:-2}),'bad')}
]})},
{k:'token',w:3,cd:4,run:()=>ask({title:'TOKEN LISTRIK BUNYI',text:'Jam 23.15. "Tit... tit... tit..." Meteran listrik menjerit, token tinggal 2 kWh. Semua orang di rumah pura-pura tidak dengar.',opts:[
  {t:'Beli token sekarang',sub:'Rp 100 rb',e:()=>addLog('Kamu beli token lewat m-banking sambil berdiri di depan meteran seperti penjinak bom.'+fx({saldo:-Math.round(100e3*N.harga)}))},
  {t:'Tahan sampai gajian',e:()=>addLog('Listrik padam jam 3 pagi. Kipas mati, nyamuk berpesta, kamu bangun dengan mood tanggal tua.'+fx({waras:-4,sehat:-2}),'bad')}]})},
{k:'cabai',w:2,cd:5,run:()=>{ N.harga=+(N.harga*1.012).toFixed(4); addLog('Harga cabai rawit tembus '+rp(Math.round(110e3*N.harga))+'/kg, beras premium ikut naik. Penjual gorengan mengecilkan bakwan diam-diam. Kamu menyadarinya. Kamu tidak protes.'+fx({nrimo:+1}),'sys'); }},
{k:'gas',w:2,cd:6,run:()=>ask({title:'GAS MELON LANGKA',text:'Gas 3 kg habis pas mau masak. Warung pertama kosong, warung kedua kosong, warung ketiga "tinggal yang non-subsidi, Mas/Mbak".',opts:[
  {t:'Keliling sampai dapat',e:()=>addLog('Warung ketujuh akhirnya punya. Kamu pulang membawa tabung hijau seperti piala.'+fx({waras:-3,sehat:-1}))},
  {t:'Beli yang non-subsidi',sub:'Lebih mahal',e:()=>addLog('Tabung biru 5,5 kg, harga dua kali lipat. Masakanmu tidak jadi lebih enak.'+fx({saldo:-Math.round(140e3*N.harga)}))},
  {t:'Beli makan di luar saja',e:()=>addLog('Nasi padang dibungkus. Masalah selesai, masalah dompet dimulai.'+fx({saldo:-Math.round(60e3*N.harga),waras:+1}))}]})},
{k:'tilang',w:2,cd:8,cond:()=>P.motor,run:()=>{ if(!P.sim)addLog('Petugas juga meminta SIM. Kamu belum punya. Masalah bertambah.'+fx({saldo:-250e3,waras:-2}),'bad'); ask({title:'RAZIA DI PERTIGAAN',text:'"Selamat pagi. Bisa lihat SIM dan STNK-nya?" Pajak motormu ternyata telat 2 bulan.',opts:[
  {t:'Terima tilang, ikut sidang',sub:'Resmi, tapi ribet',e:()=>addLog('Kamu ikut sidang tilang, antre 3 jam, bayar denda resmi. Warga negara taat, waktu terbuang.'+fx({saldo:-Math.round(150e3*N.harga),waras:-4,nrimo:+2}))},
  {t:'"Damai di tempat aja, Pak"',sub:'Cepat, tapi...',e:()=>{ ach('damai'); addLog('Selembar uang berpindah tangan dengan gerakan secepat sulap. Kamu lanjut jalan, dengan rasa bersalah kecil yang ikut membonceng.'+fx({saldo:-200e3,nrimo:-3}),'bad'); }},
  {t:'Rekam & unggah ke medsos',e:()=>{ if(r()<0.3){ P.viralKali++; ach('viral'); addLog('Videomu viral! Komentar netizen membela kamu, dan kamu dilepas dengan senyum. Tapi tilang tetap jalan.'+fx({gengsi:+8,waras:+3,saldo:-150e3}),'good'); }
    else addLog('Videomu ditonton 37 orang, 12 di antaranya bot. Tilang tetap jalan, ditambah tatapan tidak ramah.'+fx({saldo:-150e3,waras:-3}),'bad'); }}]}); }},
{k:'ban',w:2,cd:5,cond:()=>P.motor,run:()=>addLog('Ban motor bocor kena paku di jalan yang "baru diaspal". Tambal ban '+rp(25e3)+', telat masuk kerja, dan tukang tambal yang lokasinya "kebetulan" persis setelah tempat paku bertebaran.'+fx({saldo:-25e3,waras:-2}),'bad')},
{k:'bos',w:3,cd:3,cond:kerjaKantor,run:()=>ask({title:'BOS CHAT JAM 10 MALAM',text:'"Maaf ganggu malam-malam, tolong revisi sedikit ya, besok pagi dipakai." Kata "sedikit" di sini mengandung 40 slide.',opts:[
  {t:'Kerjakan sampai subuh',e:()=>addLog('Revisi beres jam 3 pagi. Bos membalas "ok" tanpa kapital. Begitulah penghargaan.'+fx({waras:-6,sehat:-2,skill:+2}))},
  {t:'Centang biru, balas besok',e:()=>{ if(r()<0.3)addLog('Besok pagi kamu dipanggil: "Kok semalam cuma di-read?" Suasana kantor dingin seminggu.'+fx({waras:-4,gengsi:-2}),'bad'); else addLog('Besok pagi bos lupa sendiri dia pernah minta. Kemenangan kecil.'+fx({waras:+3}),'good'); }},
  {t:'Matikan HP, tidur',e:()=>addLog('Kamu tidur nyenyak. Ini namanya work-life balance, atau di kantormu: "kurang loyal".'+fx({waras:+4,gengsi:-2}))}]})},
{k:'kondangan',w:3,cd:2,run:()=>ask({title:'UNDANGAN NIKAH LAGI',text:'Undangan digital masuk lagi. Ini yang ketiga bulan ini. Teman SMA yang terakhir ngobrol 6 tahun lalu, tapi namamu tertulis jelas.',opts:[
  {t:'Datang & isi amplop',sub:'±Rp 200 rb',e:()=>kondangan(200e3,'Kamu datang, salaman, foto, makan prasmanan secepat kilat. Amplop masuk kotak, nama tertulis di belakangnya, untuk "dicatat".',+5)},
  {t:'Transfer amplop digital',sub:'Rp 100 rb',e:()=>kondangan(100e3,'Kamu kirim lewat QRIS di undangan digital. Modern, efisien, tanpa macet.',+2)},
  {t:'Pura-pura tidak lihat',e:()=>addLog('Kamu tidak datang. Nanti kalau kamu menikah, dia juga tidak datang. Adil.'+fx({relasi:-4}))}]})},
{k:'mlm',w:2,cd:9,cond:()=>!P.bodong,run:()=>ask({title:'"BRO, ADA PELUANG BISNIS"',text:'Teman lama tiba-tiba ramah sekali. Ia bercerita soal "investasi robot trading" dengan profit 30% per bulan, "aman, sudah terdaftar, ada kantornya".',opts:[
  {t:'Ikut, taruh Rp 3 jt',cond:()=>P.saldo>=3e6,e:()=>{ P.saldo-=3e6; P.bodong={modal:3e6,ke:N.ke}; addLog('Kamu transfer 3 juta. Dashboard menunjukkan saldo naik tiap hari. Indah sekali, seperti mimpi. Seperti mimpi.','bad'); }},
  {t:'Tolak sopan',e:()=>addLog('"Nanti aku pikir-pikir dulu ya." Kamu tidak memikirkannya. Pilihan tepat.'+fx({nrimo:+1}))},
  {t:'Kirim link berita penipuan',e:()=>addLog('Kamu kirim artikel soal investasi bodong. Temanmu membalas "itu beda, bro". Pertemanan mendingin, dompet tetap hangat.'+fx({relasi:-3}))}]})},
{k:'bodong',w:6,cd:1,cond:()=>P.bodong&&N.ke-P.bodong.ke>=2,run:()=>{ const m=P.bodong.modal; P.bodong=null;
  addLog('<b>Platform robot trading tidak bisa diakses.</b> Grup Telegram dibubarkan, admin hilang, kantornya ternyata ruko kosong. Uangmu '+rp(m)+' ikut menguap.'+fx({waras:-12,gengsi:-5}),'bad'); P.burukKali++; milestone('Tertipu investasi bodong'); }},
{k:'pinjamSaudara',w:2,cd:7,run:()=>ask({title:'SAUDARA MAU PINJAM UANG',text:'Sepupu chat: "Mbak/Mas, boleh pinjam sejuta dulu? Bulan depan pasti dibalikin." Kalimat "pasti dibalikin" itu sudah kamu dengar 4 kali sebelumnya.',opts:[
  {t:'Pinjamkan',sub:'Rp 1 jt',cond:()=>P.saldo>=1e6,e:()=>{ P.saldo-=1e6; if(r()<0.35){ addLog('Ajaib, bulan depan dia benar-benar mengembalikan! Kamu terharu sampai lupa bersyukur.'+fx({relasi:+5}),'good'); P.saldo+=1e6; } else addLog('Bulan depan dia upload foto liburan. Uangmu belum kembali. Mungkin sedang mudik juga.'+fx({relasi:+3,waras:-3}),'bad'); }},
  {t:'Kasih setengah, anggap sedekah',sub:'Rp 500 rb',cond:()=>P.saldo>=500e3,e:()=>addLog('Kamu kasih 500 ribu tanpa berharap kembali. Hati lega, saldo mengecil.'+fx({saldo:-500e3,relasi:+3,nrimo:+3}))},
  {t:'Tolak halus',e:()=>addLog('"Aduh, lagi seret juga nih." Kalimat sejuta umat. Hubungan agak canggung.'+fx({relasi:-4}))}]})},
{k:'banjir',w:5,cd:2,cond:()=>(N.bulan===12||N.bulan<=2)&&r()<P.banjirP,run:()=>ask({title:'BANJIR MASUK RUMAH',text:'Hujan semalaman. Pagi-pagi air setinggi lutut sudah masuk kamar. Kasur, rice cooker, dan dokumen penting ada di lantai.',opts:[
  {t:'Selamatkan barang, bersih-bersih',e:()=>addLog('Kamu angkat barang ke atas lemari, lalu seharian menguras lumpur. Rice cooker gugur dalam tugas.'+fx({saldo:-Math.round(400e3*N.harga),sehat:-5,waras:-6}),'bad')},
  {t:'Ngungsi ke rumah teman',e:()=>addLog('Kamu numpang tidur di kos teman. Persahabatan diuji, ternyata kuat.'+fx({relasi:+4,waras:-3,saldo:-150e3}))}]})},
{k:'zoom',w:2,cd:6,cond:()=>P.profesi==='freelancer'||P.profesi==='karyawan',run:()=>addLog('Sinyal hilang tepat saat kamu presentasi di Zoom. Di layar orang lain, wajahmu membeku dengan mulut setengah terbuka selama 47 detik. Screenshot-nya sudah beredar di grup kantor.'+fx({waras:-3,gengsi:-3}),'bad')},
{k:'viral',w:1,cd:10,run:()=>ask({title:'VIDEO KAMU MULAI RAMAI',text:'Video curhat tanggal tuamu di media sosial tiba-tiba ditonton ribuan orang.',opts:[
  {t:'Bikin video lanjutan',e:()=>{ if(r()<0.55){ P.viralKali++; ach('viral'); const x=P.profesi==='olshop'?ri(15,40)*100e3:ri(3,10)*100e3; addLog('Video lanjutanmu meledak. Endorse kecil-kecilan berdatangan: '+rp(x)+'. Seleb dadakan.'+fx({saldo:x,gengsi:+10,waras:+4}),'good'); }
    else addLog('Netizen berbalik menghujat: "konten kemiskinan", "kerja dong". Kolom komentar jadi medan perang.'+fx({waras:-8,gengsi:-4}),'bad'); }},
  {t:'Arsipkan, tidak usah cari perhatian',e:()=>addLog('Kamu memilih tenang. Viral itu melelahkan.'+fx({nrimo:+3}))}]})},
{k:'cancel',w:2,cd:5,cond:()=>!P.motor,run:()=>addLog('Driver ojol meng-cancel pesananmu 5 kali berturut-turut. Akhirnya kamu jalan kaki 2 km sambil menghayati lagu galau.'+fx({waras:-3,sehat:+1}),'bad')},
{k:'temanPHK',w:2,cd:8,run:()=>addLog('Teman dekatmu kena PHK dan curhat sampai jam 1 pagi. Kamu mendengarkan sambil diam-diam menghitung pesangonmu sendiri seandainya giliranmu tiba.'+fx({relasi:+4,waras:-2}))},
{k:'karaoke',w:2,cd:6,run:()=>ask({title:'TETANGGA KARAOKE JAM 2 PAGI',text:'"KAU YANG MENGAKHIRI, KAU YANG MENGAWALI..." Speaker tetangga menggelegar. Besok kamu harus berangkat jam 6.',opts:[
  {t:'Tegur baik-baik',e:()=>{ if(r()<0.5)addLog('Tetangga minta maaf dan mematikan speaker. Langka, tapi terjadi.'+fx({waras:+2})); else addLog('Tetangga tersinggung. Besoknya kamu tidak diundang syukuran. Tidak apa-apa, sebenarnya.'+fx({relasi:-5})); }},
  {t:'Ikut nyanyi dari kamar',e:()=>addLog('Kalau tidak bisa melawan, bergabunglah. Kamu menyanyikan bagian reff dengan sepenuh hati.'+fx({waras:+3,sehat:-2}))},
  {t:'Pakai earphone, pasrah',e:()=>addLog('Kamu tidur dengan suara dangdut sayup-sayup. Nrimo level dewa.'+fx({nrimo:+3,sehat:-1}))}]})},
{k:'parkir',w:2,cd:4,run:()=>addLog('Tukang parkir liar muncul dari ketiadaan saat kamu mau pergi setelah 4 menit beli air mineral. "Dua ribu, Mas/Mbak." Ia tidak membantu apa-apa, tapi ia ada.'+fx({saldo:-2e3,nrimo:+1}))},
{k:'tawarPinjol',w:3,cd:4,cond:()=>P.saldo<biayaPokok()*0.6,run:()=>ask({title:'SMS: "SELAMAT! LIMIT ANDA Rp 10 JT"',text:'SMS dan WhatsApp masuk bergantian: "Pinjaman cair 5 menit, tanpa jaminan, bunga rendah!" Waktunya pas sekali, saat saldo sekarat.',opts:[
  {t:'Ambil Rp 3 jt',e:()=>ambilPinjol(3e6,'bertahan sampai gajian')},
  {t:'Abaikan & blokir',e:()=>addLog('Kamu blokir nomornya. Besok datang dari nomor lain. Begitu seterusnya, seperti kutukan.'+fx({nrimo:+2}))}]})},
{k:'flexing',w:3,cd:5,run:()=>ask({title:'TEMAN FLEXING DI MEDSOS',text:'Teman seangkatan posting foto di Jepang, lengkap dengan caption "Alhamdulillah, hasil kerja keras sendiri." Kamu sedang makan mi instan rasa soto.',opts:[
  {t:'Like, lalu lanjut hidup',e:()=>addLog('Kamu kasih love dan lanjut scroll. Hidup bukan lomba. Setidaknya begitu katamu.'+fx({nrimo:+3}))},
  {t:'Liburan juga, pakai paylater',sub:'Cicilan 12 bulan',e:()=>{ const x=Math.round(ri(6,10)*1e6*N.harga); tambahCicilan('Paylater liburan',x,12,true); addLog('Kamu liburan ke Bali, cicilan '+rp(x)+' selama 12 bulan. Foto-fotonya bagus. Tagihannya juga "bagus".'+fx({gengsi:+12,waras:+6}),'bad'); }},
  {t:'Iri diam-diam',e:()=>addLog('Kamu stalking akunnya sampai foto tahun 2017. Tidak ada yang membaik.'+fx({waras:-4,gengsi:+2}),'bad')}]})},
{k:'hoax',w:3,cd:5,run:()=>Kuis.hoax((b,n)=>{
  if(b===n){ addLog('Kamu meluruskan semuanya dengan tautan sumber resmi. Grup hening sejenak, lalu Om membalas "oh gitu, makasih". Kemenangan langka.'+fx({relasi:+3,waras:+4}),'good'); ach('pemburuHoax'); }
  else if(b>=n-1)addLog('Hampir semua berhasil kamu cek. Satu hoax lolos dan sudah keburu disebar Tante ke 12 grup.'+fx({waras:+1}));
  else addLog('Kamu ikut termakan beberapa hoax, bahkan sempat meneruskannya. Malu sendiri setelah ada yang membalas dengan link cek fakta.'+fx({waras:-3,gengsi:-3}),'bad'); })},
{k:'kuota',w:2,cd:4,run:()=>ask({title:'KUOTA HABIS DI TANGGAL TUA',text:'Kuota internetmu habis, padahal masih tanggal 20. Hidup tanpa internet terasa seperti zaman batu.',opts:[
  {t:'Beli paket darurat',sub:'Rp 50 rb',e:()=>addLog('Paket 5 GB berlaku 3 hari. Mahal per GB-nya, tapi kamu hidup kembali.'+fx({saldo:-Math.round(50e3*N.harga)}))},
  {t:'Numpang wifi warkop',e:()=>addLog('Kamu pesan es teh paling murah dan duduk 4 jam demi wifi. Pemilik warkop menatap. Kamu pura-pura sibuk.'+fx({saldo:-8e3,gengsi:-2}))}]})},
{k:'hp',w:2,cd:12,run:()=>ask({title:'HP JATUH, LCD PECAH',text:'HP-mu meluncur dari saku dan mendarat telungkup di aspal. Layarnya kini menyerupai jaring laba-laba.',opts:[
  {t:'Servis ganti LCD',sub:'±Rp 800 rb',e:()=>addLog('LCD baru, KW super. Warnanya agak kebiruan, tapi bisa dipakai.'+fx({saldo:-Math.round(800e3*N.harga)}))},
  {t:'Pakai saja, retak-retak',e:()=>addLog('Kamu mengetik dengan jari tergores sedikit. Gengsi retak bersama layarnya.'+fx({gengsi:-6,nrimo:+2}))},
  {t:'Beli HP baru, cicil 12 bulan',e:()=>{ const x=Math.round(ri(4,8)*1e6*N.harga); tambahCicilan('Cicilan HP baru',x,12,true); addLog('HP baru keluaran terbaru, cicilan 12 bulan. Kamera 200 MP untuk memotret struk tagihan.'+fx({gengsi:+10,waras:+3}),'bad'); }}]})},
{k:'bbm',w:3,cd:99,cond:()=>N.ke>=6&&!N.bbmNaik,run:()=>{ N.bbmNaik=true; N.harga=+(N.harga*1.035).toFixed(4);
  addLog('<b>HARGA BBM NAIK.</b> Antrean SPBU mengular semalam sebelumnya. Ongkos angkot naik, harga sayur ikut naik, gaji tidak ikut naik.'+fx({waras:-4}),'bad'); if(P.profesi==='ojol'){ P.gaji=Math.round(P.gaji*0.94); addLog('Tarif ojol belum disesuaikan. Pendapatan bersihmu turun.','bad'); } }},
{k:'sakit',w:2,cd:5,cond:()=>P.st.sehat<55||r()<0.25,run:()=>{ const pyk=pick(PENYAKIT); ask({title:'JATUH SAKIT',text:'Badan panas, lemas, perut melilit. Kata dokter jaga, kemungkinan '+pyk+'.',opts:[
  {t:'Berobat pakai BPJS',sub:'Murah, antre panjang',e:()=>{ ach('bpjs'); addLog('Kamu antre dari subuh, dapat nomor 87, dipanggil jam 2 siang. Obatnya gratis, sabarnya mahal.'+fx({sehat:+12,waras:-4,nrimo:+2}),'good'); }},
  {t:'Klinik swasta',sub:'Rp 500 rb',e:()=>addLog('Cepat, ber-AC, dokternya ramah. Tagihannya juga ramah, ramah ke rekening klinik.'+fx({saldo:-Math.round(500e3*N.harga),sehat:+12}))},
  {t:'Obat warung & tidur',e:()=>{ if(r()<0.5)addLog('Ajaibnya kamu sembuh setelah tidur 14 jam. Imun +62 memang beda.'+fx({sehat:+4})); else addLog('Tidak membaik. Kamu tetap masuk kerja dengan muka pucat.'+fx({sehat:-8,waras:-3}),'bad'); }}]}); }},
{k:'macet',w:2,cd:2,cond:()=>r()<P.macet,run:()=>addLog('Macet total gara-gara ada galian kabel, galian pipa, dan galian entah apa lagi di jalan yang sama. Perjalanan 30 menit jadi 2 jam. Kamu sempat menua di jalan.'+fx({waras:-3}),'bad')},
{k:'jobdesk',w:2,cd:6,cond:kerjaKantor,run:()=>ask({title:'"TOLONG HANDLE INI DULU YA"',text:'Rekan kerja resign. Pekerjaannya "dibagi rata", artinya diberikan semua ke kamu. Gaji? "Nanti dievaluasi."',opts:[
  {t:'Terima dengan lapang dada',e:()=>addLog('Kamu mengerjakan dua posisi dengan satu gaji. Skill naik, kewarasan turun, seperti jungkat-jungkit.'+fx({skill:+4,waras:-6}))},
  {t:'Tolak halus, minta kejelasan',e:()=>{ if(r()<0.4){ const n=Math.round(P.gaji*0.08); P.gaji+=n; addLog('HR setuju menaikkan tunjangan '+rp(n)+'/bulan. Kadang berani bicara itu berbayar.'+fx({waras:+3}),'good'); }
    else addLog('Kamu dicap "kurang kooperatif". Tugasnya tetap diberikan ke kamu.'+fx({waras:-4,gengsi:-2}),'bad'); }}]})},
{k:'lowongan',w:4,cd:2,cond:()=>!P.profesi,run:()=>tawaranKerja('Ada panggilan wawancara dari lamaran yang kamu sebar.')},
{k:'judolIklan',w:2,cd:6,cond:()=>P.judol<30,run:()=>ask({title:'IKLAN SLOT "GACOR"',text:'Saat nonton bola streaming, iklan muncul: "GACOR HARI INI! Deposit 50 rb, menang 5 juta!" Ada animasi koin emas berjatuhan.',opts:[
  {t:'Tutup iklannya',e:()=>addLog('Kamu menutup iklan tanpa ragu. Keputusan terbaik bulan ini, dan tidak ada yang tahu.'+fx({nrimo:+2}),'good')},
  {t:'Iseng coba 50 rb',e:()=>{ P.judol+=20; if(r()<0.6){ P.saldo+=250e3; addLog('Kamu menang 300 ribu! Jantung berdebar, dopamin meledak. Ini... gampang sekali? (Begitulah cara jebakan bekerja.)','bad'); }
    else { P.saldo-=50e3; P.judolRugi+=50e3; addLog('Kalah 50 ribu. "Ah, cuma 50 ribu."','bad'); } }}]})},
{k:'judolKambuh',w:5,cd:1,cond:()=>P.judol>=20,run:()=>ask({title:'"SEKALI LAGI, PASTI BALIK MODAL"',text:'Jarimu gatal membuka aplikasi itu lagi. Kerugian sejauh ini: <b>'+rp(P.judolRugi)+'</b>. Bisikan di kepala bilang kali ini pasti menang.',opts:[
  {t:'Main lagi',e:()=>{ const x=Math.min(Math.max(P.saldo,0),Math.round(ri(3,15)*100e3)); P.saldo-=x; P.judolRugi+=x; P.judol=clamp(P.judol+12,0,100); addLog('Kamu deposit '+rp(x)+'. Hilang dalam 9 menit. Bisikan itu menyuruhmu "sekali lagi".'+fx({waras:-7}),'bad'); P.burukKali++; }},
  {t:'Hapus aplikasi, cerita ke orang terdekat',e:()=>{ P.judol=clamp(P.judol-25,0,100); addLog('Kamu menghapus aplikasinya dan cerita ke sahabat. Malu, tapi kamu tidak sendirian lagi.'+fx({waras:+4,relasi:+3}),'good'); if(P.judol<=0)ach('sadarJudol'); }}]})},
{k:'nikahDesak',w:4,cd:6,cond:()=>P.pasangan&&!P.menikah&&N.ke-(P.pacaranSejak||0)>=8,run:()=>Kuis.mertua('pasanganmu',rs=>{
  if(rs<0.5){ addLog('Calon mertua tersenyum tipis lalu bilang "nanti kami pikirkan dulu". Restu belum turun. Pasanganmu menghela napas panjang.'+fx({relasi:-4,waras:-5}),'bad'); return; }
  addLog(rs>=0.85?'Calon mertua tertawa lepas dan menepuk pundakmu: "Kapan mau dilamar resmi?"':'Calon mertua mengangguk pelan. Restu turun, walau dengan beberapa catatan.','good');
  ask({title:'"KAPAN DIHALALKAN?"',text:'Keluarga pasanganmu mulai bertanya serius. Calon mertua menyebut angka resepsi yang membuatmu ingin pingsan sopan.',opts:[
  {t:'Nikah sederhana di KUA',sub:'±Rp 3 jt · syukuran kecil',e:()=>nikah(3e6,'Akad di KUA, syukuran nasi kotak. Sah! Tetangga bilang "kok sepi", kamu bilang "yang penting berkah".',-4)},
  {t:'Resepsi meriah (dicicil)',sub:'Rp 60 jt · cicilan 24 bulan',e:()=>{ tambahCicilan('Cicilan resepsi',60e6,24,true); nikah(0,'Resepsi 800 tamu, tiga kali ganti baju, katering lengkap. Gengsi terselamatkan. Dompet dicicil 2 tahun.',+12); }},
  {t:'Tunda dulu, belum siap',e:()=>addLog('"Belum siap" diterjemahkan keluarganya sebagai "tidak serius". Suasana mendingin.'+fx({relasi:-6,waras:-3}),'bad')}]}); })},
{k:'transferNyasar',w:1,cd:20,run:()=>ask({title:'TRANSFER NYASAR Rp 2 JT',text:'Tiba-tiba ada transfer 2 juta dari nama yang tidak kamu kenal. Lalu WA masuk: "Maaf kak, salah transfer, mohon dikembalikan ya."',opts:[
  {t:'Kembalikan',e:()=>addLog('Kamu kembalikan lewat bank, tidak lewat link yang dia kirim. Jujur dan waspada sekaligus.'+fx({nrimo:+4,relasi:+1}),'good')},
  {t:'Pura-pura tidak tahu',e:()=>{ P.saldo+=2e6; if(r()<0.6){ P.saldo-=2e6; addLog('Bank memblokir dana itu karena laporan salah transfer. Kamu malah harus datang ke kantor cabang untuk klarifikasi.'+fx({waras:-5}),'bad'); }
    else addLog('Tidak ada kabar lagi. Uangnya diam di rekening, kamu yang tidak tenang tiap ada telepon masuk.'+fx({waras:-3})); }}]})},
{k:'kos',w:2,cd:12,cond:()=>!P.rumah&&N.ke>=6,run:()=>ask({title:'HARGA KOS NAIK',text:'Ibu kos mengumumkan di grup penghuni: "Mulai bulan depan sewa naik 15% karena listrik & air naik ya. Terima kasih atas pengertiannya 🙏"',opts:[
  {t:'Bertahan, bayar lebih',e:()=>{ P.kotaIdx=+(P.kotaIdx*1.04).toFixed(3); addLog('Kamu bertahan. Pindah juga butuh tenaga, dan tenagamu sudah habis untuk hidup.'+fx({nrimo:+2})); }},
  {t:'Pindah ke kos lebih murah, lebih jauh',e:()=>addLog('Kos baru lebih murah, tapi 40 menit lebih jauh dan kamar mandinya di luar. Ada harga, ada rupa.'+fx({saldo:-300e3,sehat:-2,waras:-3}))}]})},
/* --- khusus nasib lahir --- */
{k:'ott',w:3,cd:99,cond:()=>P.latar==='pejabat'&&P.kiriman>0&&N.ke>=8,run:()=>{ P.kiriman=0; P.orangDalam=false; P.burukKali++; ach('tamatPrivilege'); milestone('Papa terjaring OTT KPK'); stamp('PAPA DI-OTT');
  ask({title:'PAPA DIJEMPUT KPK',text:'Breaking news di semua kanal: papamu terjaring OTT KPK. Rekening keluarga dibekukan, kiriman bulanan berhenti, dan nama belakangmu mendadak trending.',opts:[
    {t:'Bela papa di medsos',e:()=>addLog('Kamu menulis thread pembelaan. Netizen membalas dengan tangkapan layar harta keluarga. Kolom komentarmu jadi kuburan.'+fx({waras:-15,gengsi:-15,relasi:-5}),'bad')},
    {t:'Diam & fokus menata hidup sendiri',e:()=>addLog('Kamu mematikan media sosial dan untuk pertama kalinya mengecek harga gas melon. Hidup mandiri dimulai, tanpa orang dalam.'+fx({waras:-8,gengsi:-12,nrimo:+10}),'bad')}]}); }},
{k:'spill',w:2,cd:12,cond:()=>(P.latar==='pejabat'||P.latar==='sultan')&&P.st.gengsi>=40,run:()=>ask({title:'NETIZEN MULAI SPILL',text:'Fotomu di depan mobil mewah dengan caption "kerja keras tidak mengkhianati hasil" sampai ke akun gosip. Netizen mulai membongkar: "Bapaknya kerja di mana ya?"',opts:[
  {t:'Hapus postingan, private akun',e:()=>addLog('Akunmu dikunci. Tangkapan layarnya tetap abadi di internet.'+fx({gengsi:-8,waras:-5}),'bad')},
  {t:'Klarifikasi: "Ini mobil teman"',e:()=>{ P.viralKali++; addLog('Klarifikasimu malah jadi meme nasional. "Mobil teman" kini jadi kosakata baru netizen.'+fx({gengsi:-12,waras:-8}),'bad'); }}]})},
{k:'orangDalam',w:3,cd:8,cond:()=>P.orangDalam&&P.profesi!=='staf',run:()=>ask({title:'"OM BISA BANTU, TENANG SAJA"',text:'Om kenalan papa menelepon: "Ada posisi staf ahli, gaji '+rp(12e6*N.harga)+'. Tidak perlu tes, berkasnya Om yang urus."',opts:[
  {t:'Terima, rezeki jangan ditolak',e:()=>{ setProfesi('staf',12e6*N.harga); addLog('Kamu mulai bekerja minggu depan. Meja sudah siap, tugas belum ada. Rekan kerja menatapmu dengan tatapan yang sulit dijelaskan.'+fx({gengsi:+8,nrimo:-6}),'sys'); }},
  {t:'Tolak, mau berjuang sendiri',e:()=>{ ach('tolakOrangDalam'); addLog('Kamu menolak. Om terdiam lama, lalu bilang "anak zaman sekarang aneh". Kamu tidur nyenyak.'+fx({waras:+6,nrimo:+5}),'good'); }}]})},
{k:'terusin',w:3,cd:8,cond:()=>P.latar==='pengusaha'&&P.kiriman>0&&P.profesi!=='penerus',run:()=>ask({title:'"KAPAN KAMU TERUSIN USAHA PAPA?"',text:'Papa menelepon dengan suara serius: "Gudang makin ramai, papa makin tua. Sudah waktunya kamu pulang dan pegang usaha keluarga."',opts:[
  {t:'Pulang, terusin usaha',e:()=>{ setProfesi('penerus',9e6*N.harga); addLog('Kamu resmi jadi penerus. Karyawan memanggilmu "Bos Muda", padahal kamu belum tahu bedanya faktur dan kuitansi.'+fx({relasi:+8,gengsi:+5,waras:-3}),'sys'); }},
  {t:'Tolak, ingin berkarier sendiri',e:()=>addLog('Papa menutup telepon dengan "terserah kamu". Kiriman bulanan tetap jalan, tapi makan malam keluarga jadi canggung.'+fx({relasi:-8,waras:+2}),'bad')}]})},
{k:'usahaBangkrut',w:2,cd:99,cond:()=>P.latar==='pengusaha'&&P.kiriman>0&&N.ke>=10,run:()=>{ P.kiriman=0; P.burukKali++; ach('tamatPrivilege'); milestone('Usaha keluarga bangkrut'); const x=Math.round(Math.min(Math.max(P.saldo,0),ri(5,15)*1e6));
  addLog('<b>Usaha keluarga bangkrut</b> digulung kompetitor & utang bank. Kiriman bulanan berhenti, dan kamu ikut menyetor '+rp(x)+' untuk menutup gaji karyawan terakhir.'+fx({saldo:-x,waras:-12,gengsi:-10}),'bad');
  if(P.profesi==='penerus'){ P.profesi=null; P.profesiN='Pencari kerja'; P.gaji=0; addLog('Posisimu sebagai penerus ikut hilang bersama usahanya.','bad'); } }},
{k:'adik',w:3,cd:6,cond:()=>P.latar==='sandwich',run:()=>{ const x=Math.round(ri(15,40)*100e3*N.harga); ask({title:'ADIK BUTUH BIAYA SEKOLAH',text:'Ibu telepon pelan-pelan: adikmu harus bayar uang gedung & seragam '+rp(x)+'. "Kalau ada saja, Nak."',opts:[
  {t:'Kirim penuh',cond:()=>P.saldo>=x,e:()=>{ P.kirimanTotal-=x; addLog('Kamu transfer tanpa banyak tanya. Adikmu mengirim stiker "makasih kak" dan kamu tersenyum walau saldo menipis.'+fx({saldo:-x,relasi:+6,nrimo:+3}),'good'); }},
  {t:'Pinjol dulu demi adik',e:()=>{ ambilPinjol(x,'biaya sekolah adik'); P.saldo-=x; P.kirimanTotal-=x; addLog('Adikmu bisa sekolah. Utangnya biar kamu yang pikirkan.'+fx({relasi:+6,waras:-4}),'bad'); }},
  {t:'Minta waktu, kirim bulan depan',e:()=>addLog('Ibu bilang "iya, nggak apa-apa". Kamu tahu itu artinya ibu akan pinjam ke tetangga.'+fx({relasi:-5,waras:-5}),'bad')}]}); }},
{k:'ortuSakit',w:2,cd:12,cond:()=>P.latar==='sandwich'||P.latar==='petani'||P.latar==='menengah',run:()=>{ const x=Math.round(ri(2,6)*1e6*N.harga); ask({title:'ORANG TUA MASUK RUMAH SAKIT',text:'Bapak dirawat di rumah sakit daerah. Ada biaya yang tidak ditanggung BPJS: sekitar '+rp(x)+'.',opts:[
  {t:'Tanggung semuanya',cond:()=>P.saldo+P.tabungan>=x,e:()=>{ const dt=Math.min(P.tabungan,x); P.tabungan-=dt; P.saldo-=(x-dt); P.kirimanTotal-=x; addLog('Kamu bayar dari tabungan dan saldo. Dana darurat memang untuk saat seperti ini.'+fx({relasi:+8,waras:-4}),'good'); }},
  {t:'Patungan dengan saudara',e:()=>{ const y=Math.round(x/2); P.saldo-=y; P.kirimanTotal-=y; addLog('Kalian patungan. Grup WA keluarga mendadak serius dan penuh angka.'+fx({relasi:+4,waras:-3})); }},
  {t:'Urus surat keterangan tidak mampu',e:()=>addLog('Kamu bolak-balik ke kelurahan & dinas. Biaya tertutup sebagian, tenagamu habis seluruhnya.'+fx({waras:-8,nrimo:+3}))}]}); }},
{k:'gagalPanen',w:3,cd:10,cond:()=>P.latar==='petani',run:()=>ask({title:'GAGAL PANEN',text:'Hama wereng dan hujan yang datang terlambat. Sawah keluarga gagal panen. Bapak bilang "tidak apa-apa" di telepon, dengan suara yang jelas apa-apa.',opts:[
  {t:'Kirim Rp 2 jt untuk modal tanam ulang',cond:()=>P.saldo>=2e6,e:()=>{ P.kirimanTotal-=2e6; addLog('Kamu kirim modal tanam ulang. Bulan depan bapak kirim foto padi yang mulai menghijau.'+fx({saldo:-2e6,relasi:+8,nrimo:+2}),'good'); }},
  {t:'Kirim seadanya',e:()=>{ P.kirimanTotal-=500e3; addLog('Kamu kirim 500 ribu dan doa. Kadang hanya itu yang bisa.'+fx({saldo:-500e3,relasi:+3,waras:-3})); }}]})},
{k:'cpns',w:3,cd:12,cond:()=>P.latar==='pns'&&P.profesi!=='pns',run:()=>ask({title:'"DAFTAR CPNS, NAK"',text:'Pendaftaran CPNS dibuka. Bapak sudah menyiapkan map berisi fotokopi ijazah yang dilegalisir 10 rangkap. "Ini kesempatan, Nak. Kerja beneran."',opts:[
  {t:'Ikut tes CPNS',e:()=>ikutCPNS()},
  {t:'Tolak, bukan jalanku',e:()=>addLog('"Terus mau jadi apa kamu?" Pertanyaan itu menggema sampai lebaran berikutnya.'+fx({relasi:-8,waras:+2}),'bad')}]})},
{k:'krl',w:3,cd:99,cond:()=>P.latar==='sultan',run:()=>addLog('Untuk konten, kamu naik KRL pertama kalinya di jam sibuk. Kamu terdorong, terjepit, kehilangan satu sepatu, dan untuk pertama kalinya benar-benar paham kenapa orang-orang terlihat lelah. Kontennya viral: "Anak sultan coba jadi rakyat jelata".'+fx({waras:-5,nrimo:+6,gengsi:+5}))},
{k:'traktir',w:2,cd:5,cond:()=>P.latar==='sultan'||P.latar==='pejabat',run:()=>{ const x=Math.round(ri(10,30)*100e3); addLog('Teman-teman "kebetulan" selalu lupa bawa dompet tiap kalian makan bareng. Kamu traktir lagi '+rp(x)+'. Kamu mulai curiga siapa teman sungguhan.'+fx({saldo:-x,relasi:+2,waras:-2})); }},
{k:'yatimSepi',w:2,cd:12,cond:()=>P.latar==='yatim'&&P.st.relasi<40,run:()=>ask({title:'SEPI DI KOTA ORANG',text:'Malam minggu. Grup WA sepi, kamar kos sunyi. Tidak ada yang menanyakan kabarmu hari ini.',opts:[
  {t:'Datangi komunitas / rumah ibadah',e:()=>addLog('Kamu datang ke kegiatan komunitas. Orang-orang asing menyapamu hangat. Pelan-pelan, kota ini terasa seperti rumah.'+fx({relasi:+10,waras:+5}),'good')},
  {t:'Tidur saja',e:()=>addLog('Kamu tidur lebih awal. Besok pagi, perasaan itu masih ada.'+fx({waras:-5}))}]})},
/* --- khusus profesi --- */
{k:'algoritma',w:3,cd:4,cond:()=>P.profesi==='olshop',run:()=>{ if(r()<0.5){ const x=ri(10,25)*100e3; addLog('Produkmu masuk rekomendasi marketplace! Pesanan membanjir, tambahan '+rp(x)+' bulan ini.'+fx({saldo:x,waras:+3}),'good'); }
  else addLog('Algoritma marketplace berubah lagi. Tokomu tenggelam, ditambah satu ulasan bintang 1: "barang sesuai foto tapi saya tidak suka".'+fx({waras:-5,saldo:-200e3}),'bad'); }},
{k:'klienTelat',w:3,cd:3,cond:()=>P.profesi==='freelancer',run:()=>ask({title:'KLIEN BELUM BAYAR',text:'Proyek sudah selesai sebulan. Klien bilang "invoice-nya lagi diproses finance ya". Finance-nya mungkin sedang mudik permanen.',opts:[
  {t:'Tagih sopan tiap minggu',e:()=>{ if(r()<0.6){ const x=ri(15,40)*100e3; addLog('Setelah 6 kali follow-up, pembayaran '+rp(x)+' masuk. Kamu hampir menangis bahagia.'+fx({saldo:x,waras:+2}),'good'); } else addLog('Klien mulai membalas dengan stiker. Belum cair juga.'+fx({waras:-4,nrimo:+2})); }},
  {t:'Ancam unggah thread di medsos',e:()=>{ if(r()<0.5){ const x=ri(15,40)*100e3; addLog('Dalam 2 jam uang masuk lengkap. Kekuatan netizen nyata.'+fx({saldo:x,gengsi:+4}),'good'); } else addLog('Klien memblokirmu. Uang hilang, portofolio juga.'+fx({waras:-6}),'bad'); }}]})},
{k:'tarifOjol',w:3,cd:4,cond:()=>P.profesi==='ojol',run:()=>{ if(r()<0.5)addLog('Aplikasi memotong komisi lebih besar dan menambah "biaya layanan". Kamu narik lebih lama untuk hasil yang sama.'+fx({waras:-4,sehat:-2}),'bad');
  else { const x=ri(4,10)*100e3; addLog('Musim hujan, orderan membludak. Bonus harian tercapai: +'+rp(x)+'. Basah kuyup, tapi senyum.'+fx({saldo:x,sehat:-2}),'good'); } }},
{k:'pppk',w:3,cd:6,cond:()=>P.profesi==='guru'&&!P.pppk,run:()=>ask({title:'SELEKSI PPPK DIBUKA',text:'Formasi PPPK untuk guru dibuka! Ini kesempatan keluar dari status honorer, kalau lolos tesnya.',opts:[
  {t:'Belajar keras & ikut tes',e:()=>{ if(r()<0.25+P.skill/180){ P.pppk=true; P.gaji=4.3e6; ach('naikKelas'); milestone('Lolos PPPK'); stamp('LOLOS PPPK','green');
    addLog('<b>KAMU LOLOS PPPK!</b> Gaji naik jadi '+rp(P.gaji)+'/bulan. Murid-murid bertepuk tangan, kamu menangis di ruang guru.'+fx({waras:+15,gengsi:+8}),'good'); }
    else addLog('Nilaimu kurang 2 poin dari ambang batas. Coba lagi tahun depan, kata panitia. Seperti tahun lalu.'+fx({waras:-6,skill:+3}),'bad'); }},
  {t:'Tidak ikut, sudah lelah berharap',e:()=>addLog('Kamu tidak ikut. Nrimo sudah jadi gaya hidup.'+fx({nrimo:+4,waras:-2}))}]})}
];
function kondangan(x,txt,rel){
  P.kondanganKali++; if(P.kondanganKali>=5)ach('kondangan');
  addLog(txt+fx({saldo:-Math.round(x*N.harga),relasi:rel}));
}
function nikah(biaya,txt,gengsi){
  P.menikah=true; ach('nikah'); stamp('SAH!','green'); milestone('Menikah');
  const o={gengsi:gengsi,waras:+8,relasi:+6}; if(biaya)o.saldo=-biaya;
  addLog(txt+fx(o),'good');
}
function tawaranKerja(pengantar){
  const opsi=[];
  const pool=(P.orangDalam?['staf']:[]).concat(['karyawan','outsourcing','ojol','olshop','freelancer','guru']);
  for(const k of pool){
    if(opsi.length>=3)break;
    if(r()<0.6||k==='ojol'||k==='staf'){ const p=PROF[k]; const g=Math.round(gajiKota(p)*N.harga*(0.9+P.skill/250)); opsi.push({k,g}); }
  }
  ask({title:'PANGGILAN KERJA',text:pengantar+' Pilihannya (syarat-syarat absurd sudah kamu abaikan, seperti "maks. 25 tahun, pengalaman 5 tahun"):',
    opts:opsi.map(o=>({t:PROF[o.k].n,sub:'±'+rp(o.g)+'/bulan'+(o.k==='staf'?' · tanpa wawancara':' · lanjut wawancara'),e:()=>{
      const terima=g=>{ setProfesi(o.k,g); if(o.k==='ojol'&&!P.motor)addLog('Catatan: jadi ojol tanpa motor sendiri berarti sewa motor, pendapatan bersih jauh lebih kecil.','sys');
        addLog('Kamu diterima sebagai <b>'+PROF[o.k].n.toLowerCase()+'</b> dengan gaji '+rp(g)+'/bulan. Akhirnya, slip gaji lagi.'+fx({waras:+10,gengsi:+4}),'good'); stamp('DITERIMA KERJA','green'); };
      if(o.k==='staf'){ addLog('"Tidak perlu wawancara, Om sudah atur semuanya."','sys'); terima(o.g); return; }
      Kuis.wawancara(PROF[o.k].n,rs=>{
        if(rs<0.4&&r()<0.65){ addLog('Seminggu kemudian email masuk: "Terima kasih atas minat Anda, namun saat ini kami belum dapat melanjutkan..."'+fx({waras:-5}),'bad'); return; }
        const g=Math.round(o.g*(0.9+rs*0.25));
        if(rs>=0.85)addLog('Pewawancara terkesan: "Jawaban Anda paling meyakinkan hari ini." Tawaran gajinya dinaikkan.','good');
        terima(g); }); }}))
      .concat([{t:'Tolak semua, tunggu yang lebih baik',e:()=>addLog('Kamu menolak. Idealisme masih ada, saldo makin tipis.'+fx({waras:-2}))}])});
}
function events(){
  const pilih=()=>{
    const pool=EVENTS.filter(e=>siap(e.k,e.cd)&&(!e.cond||e.cond()));
    if(!pool.length)return null;
    const tot=pool.reduce((a,e)=>a+e.w,0); let x=r()*tot;
    for(const e of pool){ x-=e.w; if(x<=0)return e; }
    return pool[pool.length-1];
  };
  const n=r()<0.85?(r()<0.35?2:1):0;
  for(let i=0;i<n;i++){ const e=pilih(); if(!e)break; pakai(e.k); e.run(); }
}
