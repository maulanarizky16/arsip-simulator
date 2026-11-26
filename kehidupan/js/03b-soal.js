'use strict';
/* ================= BANK SOAL =================
   Format soal biasa : {q, o:[jawaban BENAR dulu, pengecoh...], x:'pembahasan'}   (urutan opsi diacak saat ditampilkan)
   Format soal lucu  : {q, o:[...], r:[tanggapan untuk tiap opsi], lucu:true}      (tidak ada jawaban salah)
   Kategori dipilih otomatis sesuai jenjang/jurusan (lihat kategoriSoal di 03c-sekolah.js). */
const SOAL={
sd:[
  {q:'7 × 8 = ...',o:['56','54','63','48'],x:'7 × 8 = 56.'},
  {q:'1/2 + 1/4 = ...',o:['3/4','2/6','1/6','2/4'],x:'Samakan penyebut: 2/4 + 1/4 = 3/4.'},
  {q:'Tumbuhan membuat makanannya sendiri melalui proses...',o:['Fotosintesis','Respirasi','Penguapan','Penyerbukan'],x:'Fotosintesis butuh cahaya matahari, air, dan karbon dioksida.'},
  {q:'Sila ketiga Pancasila berbunyi...',o:['Persatuan Indonesia','Kemanusiaan yang adil dan beradab','Ketuhanan Yang Maha Esa','Keadilan sosial bagi seluruh rakyat Indonesia'],x:'Sila ke-3: Persatuan Indonesia.'},
  {q:'Planet yang paling dekat dengan Matahari adalah...',o:['Merkurius','Venus','Mars','Bumi'],x:'Urutannya: Merkurius, Venus, Bumi, Mars, dan seterusnya.'},
  {q:'Ibu kota Provinsi Kalimantan Timur adalah...',o:['Samarinda','Balikpapan','Banjarmasin','Pontianak'],x:'Balikpapan memang kota besar, tapi ibu kota provinsinya Samarinda.'},
  {q:'Sinonim kata "gembira" adalah...',o:['Senang','Sedih','Marah','Lelah'],x:'Gembira = senang.'},
  {q:'Hewan yang berkembang biak dengan bertelur disebut...',o:['Ovipar','Vivipar','Ovovivipar','Herbivora'],x:'Ovipar = bertelur; vivipar = melahirkan.'},
  {q:'125 + 375 = ...',o:['500','490','510','400'],x:'125 + 375 = 500.'},
  {q:'Lagu "Indonesia Raya" diciptakan oleh...',o:['W.R. Supratman','Ismail Marzuki','C. Simanjuntak','Ibu Sud'],x:'Wage Rudolf Supratman, dikumandangkan pertama kali saat Sumpah Pemuda 1928.'}
],
smp:[
  {q:'Jika 2x + 5 = 17, maka x = ...',o:['6','11','7','5'],x:'2x = 12, jadi x = 6.'},
  {q:'Proklamasi kemerdekaan Indonesia dibacakan pada tanggal...',o:['17 Agustus 1945','20 Mei 1908','28 Oktober 1928','1 Juni 1945'],x:'Dibacakan Soekarno-Hatta di Jalan Pegangsaan Timur 56.'},
  {q:'Sumpah Pemuda diikrarkan pada tahun...',o:['1928','1908','1945','1912'],x:'28 Oktober 1928, Kongres Pemuda II.'},
  {q:'Satuan SI untuk massa adalah...',o:['kilogram','newton','gram','liter'],x:'Newton adalah satuan gaya, bukan massa.'},
  {q:'"She ___ to school every day."',o:['goes','go','going','gone'],x:'Subjek orang ketiga tunggal di simple present: goes.'},
  {q:'Organ pernapasan utama manusia adalah...',o:['paru-paru','jantung','hati','ginjal'],x:'Pertukaran oksigen dan karbon dioksida terjadi di alveolus paru-paru.'},
  {q:'Luas persegi dengan sisi 9 cm adalah...',o:['81 cm²','36 cm²','18 cm²','72 cm²'],x:'Luas = sisi × sisi = 81 cm².'},
  {q:'Garis khayal yang membagi bumi menjadi belahan utara dan selatan adalah...',o:['khatulistiwa','garis bujur','garis balik utara','meridian Greenwich'],x:'Khatulistiwa (ekuator) berada di lintang 0°.'},
  {q:'(−3) × (−4) = ...',o:['12','−12','−7','7'],x:'Negatif dikali negatif hasilnya positif.'},
  {q:'Majas pada kalimat "Angin berbisik di telingaku" adalah...',o:['personifikasi','hiperbola','metafora','litotes'],x:'Benda mati diberi sifat manusia (berbisik) = personifikasi.'}
],
sma_ipa:[
  {q:'Turunan pertama dari f(x) = x² adalah...',o:['2x','x','2','x³/3'],x:'Turunan xⁿ adalah n·xⁿ⁻¹, jadi 2x.'},
  {q:'Rumus kimia air adalah...',o:['H₂O','CO₂','NaCl','O₂'],x:'Dua atom hidrogen dan satu atom oksigen.'},
  {q:'Organel sel tempat respirasi sel (penghasil energi) adalah...',o:['mitokondria','ribosom','nukleus','vakuola'],x:'Mitokondria dijuluki "pembangkit tenaga" sel.'},
  {q:'Hukum II Newton dirumuskan sebagai...',o:['F = m · a','E = mc²','V = I · R','P = F / A'],x:'Gaya sama dengan massa dikali percepatan.'},
  {q:'Nilai log 1000 (basis 10) adalah...',o:['3','10','100','4'],x:'10³ = 1000.'},
  {q:'Mobil menempuh 120 km dalam 2 jam. Kecepatan rata-ratanya...',o:['60 km/jam','240 km/jam','120 km/jam','30 km/jam'],x:'v = s / t = 120 / 2 = 60 km/jam.'},
  {q:'pH larutan netral pada suhu 25°C adalah...',o:['7','0','14','1'],x:'pH < 7 asam, pH > 7 basa.'},
  {q:'Nilai sin 30° adalah...',o:['1/2','√3/2','1','0'],x:'sin 30° = 1/2.'},
  {q:'Pembawa sifat keturunan di dalam sel adalah...',o:['DNA (gen)','protein','lemak','enzim amilase'],x:'Informasi genetik tersimpan dalam DNA.'}
],
sma_ips:[
  {q:'Menurut hukum permintaan, jika harga naik maka jumlah barang yang diminta...',o:['turun','naik','tetap','tidak menentu'],x:'Dengan asumsi faktor lain tetap (ceteris paribus).'},
  {q:'Kenaikan harga barang secara umum dan terus-menerus disebut...',o:['inflasi','deflasi','devaluasi','resesi'],x:'Deflasi adalah kebalikannya.'},
  {q:'VOC didirikan pada tahun...',o:['1602','1511','1799','1945'],x:'VOC berdiri 1602 dan dibubarkan 1799.'},
  {q:'Proses seseorang mempelajari nilai dan norma masyarakatnya disebut...',o:['sosialisasi','akulturasi','asimilasi','mobilitas sosial'],x:'Sosialisasi dimulai dari keluarga.'},
  {q:'Bank sentral Republik Indonesia adalah...',o:['Bank Indonesia','Bank Mandiri','OJK','Kementerian Keuangan'],x:'BI menjaga stabilitas nilai rupiah.'},
  {q:'Pada peta berskala 1:100.000, jarak 5 cm sama dengan jarak sebenarnya...',o:['5 km','50 km','500 m','0,5 km'],x:'5 × 100.000 cm = 500.000 cm = 5 km.'},
  {q:'Tokoh yang mengusulkan nama "Pancasila" pada sidang BPUPKI 1 Juni 1945 adalah...',o:['Ir. Soekarno','Moh. Hatta','Moh. Yamin','Soepomo'],x:'1 Juni kini diperingati sebagai Hari Lahir Pancasila.'},
  {q:'Bercampurnya dua kebudayaan tanpa menghilangkan unsur aslinya disebut...',o:['akulturasi','asimilasi','difusi','inovasi'],x:'Pada asimilasi, unsur asli melebur jadi budaya baru.'}
],
smk:[
  {q:'Menurut hukum Ohm, tegangan V = ...',o:['I × R','I / R','R / I','I + R'],x:'Tegangan = arus × hambatan.'},
  {q:'Persamaan dasar akuntansi adalah...',o:['Aset = Liabilitas + Ekuitas','Aset = Pendapatan − Beban','Ekuitas = Aset + Utang','Kas = Laba + Modal'],x:'Semua transaksi harus menjaga keseimbangan ini.'},
  {q:'Kunci untuk baut berkepala segi enam di bagian dalam adalah...',o:['kunci L (Allen)','kunci inggris','obeng plus','tang kombinasi'],x:'Kunci L juga disebut kunci hex.'},
  {q:'Perangkat yang menghubungkan beberapa jaringan berbeda adalah...',o:['router','monitor','printer','keyboard'],x:'Router meneruskan paket data antarjaringan.'},
  {q:'K3 dalam dunia kerja adalah singkatan dari...',o:['Keselamatan dan Kesehatan Kerja','Kerja Keras Konsisten','Komite Kerja Kantor','Kualitas Kinerja Karyawan'],x:'Wajib di bengkel, pabrik, dan proyek.'},
  {q:'Satuan daya listrik adalah...',o:['watt','volt','ampere','ohm'],x:'Volt = tegangan, ampere = arus, ohm = hambatan.'},
  {q:'Mesin 4 tak menyelesaikan satu siklus kerja dalam berapa langkah piston?',o:['4','2','1','6'],x:'Hisap, kompresi, usaha, buang.'}
],
utbk:[
  {q:'Lanjutkan pola: 2, 4, 8, 16, ...',o:['32','24','20','18'],x:'Setiap suku dikali 2.'},
  {q:'Semua mahasiswa rajin membaca. Andi mahasiswa. Kesimpulannya...',o:['Andi rajin membaca','Andi tidak rajin membaca','Sebagian mahasiswa malas','Tidak dapat disimpulkan'],x:'Silogisme sederhana.'},
  {q:'Harga 3 pensil Rp 6.000. Harga 7 pensil adalah...',o:['Rp 14.000','Rp 12.000','Rp 21.000','Rp 18.000'],x:'Satu pensil Rp 2.000, dikali 7.'},
  {q:'Antonim kata "optimis" adalah...',o:['pesimis','realistis','skeptis','apatis'],x:'Pesimis = memandang segala sesuatu dari sisi buruk.'},
  {q:'15% dari 200 adalah...',o:['30','15','20','35'],x:'0,15 × 200 = 30.'},
  {q:'A lebih tinggi dari B, dan B lebih tinggi dari C. Pernyataan yang pasti benar...',o:['A lebih tinggi dari C','C paling tinggi','B paling pendek','A dan C sama tinggi'],x:'Hubungan transitif.'},
  {q:'Lanjutkan pola huruf: A, C, E, G, ...',o:['I','H','J','K'],x:'Lompat satu huruf setiap langkah.'}
],
inggris:[
  {q:'"I have lived here ___ 2010."',o:['since','for','at','during'],x:'"Since" untuk titik waktu, "for" untuk durasi.'},
  {q:'Synonym of "huge":',o:['enormous','tiny','fragile','narrow'],x:'Huge = enormous = sangat besar.'},
  {q:'"If I ___ rich, I would travel the world."',o:['were','am','will be','been'],x:'Second conditional memakai "were".'},
  {q:'Past tense of "buy":',o:['bought','buyed','brought','buys'],x:'"Brought" adalah bentuk lampau dari "bring".'},
  {q:'Which sentence is correct?',o:['She doesn\'t like coffee.','She don\'t like coffee.','She not like coffee.','She doesn\'t likes coffee.'],x:'Setelah "doesn\'t", kata kerja kembali ke bentuk dasar.'}
],
umum:[
  {q:'Semboyan "Bhinneka Tunggal Ika" berarti...',o:['berbeda-beda tetapi tetap satu','bersatu kita teguh','maju tak gentar','satu nusa satu bangsa'],x:'Diambil dari kitab Sutasoma karya Mpu Tantular.'},
  {q:'Bunga deposito 5% per tahun dari Rp 10 juta, berapa bunganya setahun (sebelum pajak)?',o:['Rp 500 ribu','Rp 50 ribu','Rp 5 juta','Rp 1 juta'],x:'5% × 10 juta = 500 ribu.'},
  {q:'Lembaga yang mengawasi industri jasa keuangan, termasuk pinjol legal, adalah...',o:['OJK','BPK','KPK','BPS'],x:'Cek legalitas pinjol di situs OJK sebelum meminjam.'},
  {q:'Gaji Rp 5 juta, cicilan Rp 2 juta. Persentase cicilan terhadap gaji adalah...',o:['40%','25%','20%','50%'],x:'Banyak perencana keuangan menyarankan cicilan maksimal sekitar 30%.'},
  {q:'BPJS Kesehatan adalah program...',o:['jaminan kesehatan nasional','asuransi kendaraan','tabungan haji','pinjaman koperasi'],x:'Bagian dari Jaminan Kesehatan Nasional (JKN).'},
  {q:'Lambang negara Indonesia adalah...',o:['Garuda Pancasila','Bendera Merah Putih','Monas','Bhinneka Tunggal Ika'],x:'Bhinneka Tunggal Ika adalah semboyan pada pita yang dicengkeram Garuda.'}
],
/* ----- kuliah per jurusan ----- */
k_kedokteran:[
  {q:'Hormon dari pankreas yang menurunkan kadar gula darah adalah...',o:['insulin','glukagon','adrenalin','tiroksin'],x:'Glukagon justru menaikkan gula darah.'},
  {q:'Denyut nadi normal orang dewasa saat istirahat adalah...',o:['60–100 kali/menit','20–40 kali/menit','120–160 kali/menit','150–200 kali/menit'],x:'Di atas 100 disebut takikardia.'},
  {q:'Tulang paha disebut...',o:['femur','tibia','humerus','radius'],x:'Femur adalah tulang terpanjang di tubuh manusia.'},
  {q:'Sel darah yang berperan dalam pembekuan darah adalah...',o:['trombosit','eritrosit','leukosit','limfosit'],x:'Trombosit = keping darah.'},
  {q:'Golongan darah yang disebut donor universal adalah...',o:['O negatif','AB positif','A negatif','B positif'],x:'AB positif disebut resipien universal.'}
],
k_teknik:[
  {q:'Satuan gaya dalam SI adalah...',o:['newton','joule','pascal','watt'],x:'Joule = energi, pascal = tekanan, watt = daya.'},
  {q:'Tegangan (stress) pada material didefinisikan sebagai...',o:['gaya per luas penampang','massa per volume','gaya × jarak','energi per waktu'],x:'σ = F / A.'},
  {q:'Paduan besi dan karbon disebut...',o:['baja','kuningan','perunggu','duralumin'],x:'Kuningan = tembaga + seng, perunggu = tembaga + timah.'},
  {q:'Energi yang dimiliki benda karena geraknya disebut energi...',o:['kinetik','potensial','kalor','kimia'],x:'Ek = ½ m v².'},
  {q:'1 kilowatt sama dengan...',o:['1.000 watt','100 watt','10 watt','1.000.000 watt'],x:'Kilo = seribu.'}
],
k_informatika:[
  {q:'Bilangan biner 1010 sama dengan desimal...',o:['10','12','8','5'],x:'8 + 0 + 2 + 0 = 10.'},
  {q:'Kompleksitas waktu binary search pada data terurut adalah...',o:['O(log n)','O(n)','O(n²)','O(1)'],x:'Ruang pencarian dibagi dua tiap langkah.'},
  {q:'HTML adalah bahasa...',o:['markup','pemrograman berorientasi objek','query basis data','mesin'],x:'HyperText Markup Language.'},
  {q:'Struktur data dengan prinsip LIFO (last in, first out) adalah...',o:['stack','queue','linked list','hash table'],x:'Queue memakai FIFO.'},
  {q:'Perintah SQL untuk mengambil data adalah...',o:['SELECT','INSERT','DELETE','UPDATE'],x:'SELECT * FROM tabel;'},
  {q:'1 byte terdiri dari...',o:['8 bit','4 bit','16 bit','1024 bit'],x:'1 byte = 8 bit.'}
],
k_ekonomi:[
  {q:'PDB (Produk Domestik Bruto) mengukur...',o:['nilai barang & jasa akhir yang diproduksi di suatu negara','jumlah uang beredar','total utang negara','jumlah penduduk yang bekerja'],x:'Biasanya dihitung per tahun.'},
  {q:'Biaya peluang (opportunity cost) adalah...',o:['nilai alternatif terbaik yang dikorbankan','biaya produksi total','biaya tetap','biaya iklan'],x:'Memilih kuliah berarti mengorbankan gaji yang bisa didapat jika bekerja.'},
  {q:'Permintaan disebut elastis jika...',o:['perubahan harga menyebabkan perubahan jumlah diminta yang lebih besar','jumlah diminta tidak berubah','harga tidak berubah','permintaan selalu naik'],x:'Koefisien elastisitas lebih dari 1.'},
  {q:'Kebijakan moneter di Indonesia dijalankan oleh...',o:['Bank Indonesia','DPR','Kementerian Perdagangan','OJK'],x:'Contohnya penetapan suku bunga acuan.'},
  {q:'Pasar dengan satu penjual dan banyak pembeli disebut...',o:['monopoli','oligopoli','monopsoni','persaingan sempurna'],x:'Monopsoni = satu pembeli, banyak penjual.'}
],
k_akuntansi:[
  {q:'Persamaan dasar akuntansi adalah...',o:['Aset = Liabilitas + Ekuitas','Aset = Pendapatan − Beban','Ekuitas = Aset + Utang','Kas = Laba + Modal'],x:'Fondasi sistem pembukuan berpasangan.'},
  {q:'Membeli peralatan secara kredit akan...',o:['menambah aset dan menambah liabilitas','mengurangi kas','menambah ekuitas','mengurangi aset'],x:'Peralatan bertambah, utang bertambah.'},
  {q:'Laporan yang menunjukkan pendapatan dan beban dalam satu periode adalah...',o:['laporan laba rugi','neraca','laporan arus kas','jurnal umum'],x:'Neraca memotret posisi keuangan pada satu tanggal.'},
  {q:'Penyusutan (depresiasi) dikenakan pada...',o:['aset tetap seperti mesin dan kendaraan','tanah','kas','piutang'],x:'Tanah umumnya tidak disusutkan.'},
  {q:'Bertambahnya akun beban dicatat di sisi...',o:['debit','kredit','tidak dicatat','ekuitas'],x:'Beban bersaldo normal debit.'}
],
k_hukum:[
  {q:'Asas bahwa seseorang dianggap tidak bersalah sebelum ada putusan berkekuatan hukum tetap disebut...',o:['praduga tak bersalah','legalitas','retroaktif','ne bis in idem'],x:'Presumption of innocence.'},
  {q:'UUD 1945 telah diamandemen sebanyak...',o:['4 kali','2 kali','3 kali','5 kali'],x:'Amandemen dilakukan pada 1999–2002.'},
  {q:'Lembaga yang berwenang menguji undang-undang terhadap UUD 1945 adalah...',o:['Mahkamah Konstitusi','Mahkamah Agung','Komisi Yudisial','DPR'],x:'MA menguji peraturan di bawah undang-undang.'},
  {q:'Asas "tidak ada perbuatan yang dapat dipidana tanpa aturan yang ada sebelumnya" disebut asas...',o:['legalitas','oportunitas','praduga tak bersalah','kepastian'],x:'Nullum delictum nulla poena sine praevia lege poenali.'},
  {q:'Hukum yang mengatur hubungan antarindividu, seperti perjanjian dan waris, disebut hukum...',o:['perdata','pidana','tata negara','internasional publik'],x:'Hukum pidana mengatur kejahatan dan pelanggaran.'}
],
k_pendidikan:[
  {q:'Semboyan "Tut Wuri Handayani" berasal dari...',o:['Ki Hajar Dewantara','R.A. Kartini','Dewi Sartika','K.H. Ahmad Dahlan'],x:'Pendiri Taman Siswa, bapak pendidikan nasional.'},
  {q:'"Tut wuri handayani" artinya...',o:['dari belakang memberi dorongan','di depan memberi teladan','di tengah membangun semangat','belajar sepanjang hayat'],x:'"Ing ngarsa sung tuladha" = di depan memberi teladan.'},
  {q:'Hari Pendidikan Nasional diperingati setiap tanggal...',o:['2 Mei','21 April','25 November','17 Agustus'],x:'25 November adalah Hari Guru Nasional.'},
  {q:'Taksonomi Bloom digunakan untuk...',o:['mengklasifikasikan tujuan dan tingkat berpikir dalam belajar','mengukur IQ','menyusun jadwal pelajaran','menilai sikap guru'],x:'Dari mengingat sampai mencipta.'}
],
k_seni:[
  {q:'Warna primer dalam teori warna tradisional (cat/pigmen) adalah...',o:['merah, kuning, biru','hijau, ungu, oranye','hitam, putih, abu-abu','cokelat, krem, emas'],x:'Hijau, ungu, dan oranye adalah warna sekunder.'},
  {q:'Model warna untuk tampilan layar digital adalah...',o:['RGB','CMYK','Pantone','RYB'],x:'Red, Green, Blue (cahaya).'},
  {q:'Model warna untuk hasil cetak adalah...',o:['CMYK','RGB','HSL','HEX'],x:'Cyan, Magenta, Yellow, Key (hitam).'},
  {q:'Prinsip desain untuk menciptakan titik perhatian utama disebut...',o:['penekanan (emphasis)','keseimbangan','irama','kesatuan'],x:'Biasanya lewat ukuran, warna, atau kontras.'},
  {q:'Maestro lukis Indonesia yang dikenal dengan gaya ekspresionisme adalah...',o:['Affandi','Raden Saleh','Basuki Abdullah','W.R. Supratman'],x:'Affandi terkenal melukis langsung dari tube cat.'}
],
k_psikologi:[
  {q:'Hierarki kebutuhan yang puncaknya aktualisasi diri dikemukakan oleh...',o:['Abraham Maslow','Sigmund Freud','B.F. Skinner','Jean Piaget'],x:'Dari kebutuhan fisiologis sampai aktualisasi diri.'},
  {q:'Tokoh teori perkembangan kognitif anak (tahap sensorimotor, praoperasional, dst.) adalah...',o:['Jean Piaget','Carl Rogers','Ivan Pavlov','Erik Erikson'],x:'Erikson dikenal dengan teori perkembangan psikososial.'},
  {q:'Anjing yang mengeluarkan air liur saat mendengar bel adalah contoh...',o:['classical conditioning','operant conditioning','psikoanalisis','teori humanistik'],x:'Eksperimen Ivan Pavlov.'},
  {q:'Menurut Freud, struktur kepribadian terdiri dari...',o:['id, ego, superego','kognisi, afeksi, konasi','sadar, prasadar, tidak sadar','introvert, ekstrovert, ambivert'],x:'Sadar/prasadar/tidak sadar adalah tingkat kesadaran, bukan struktur kepribadian.'}
],
k_komunikasi:[
  {q:'Model komunikasi "Who says what in which channel to whom with what effect" dikemukakan oleh...',o:['Harold Lasswell','Aristoteles','Shannon & Weaver','Marshall McLuhan'],x:'Model Lasswell, 1948.'},
  {q:'Ungkapan "The medium is the message" berasal dari...',o:['Marshall McLuhan','Harold Lasswell','Noam Chomsky','Wilbur Schramm'],x:'Dari buku Understanding Media (1964).'},
  {q:'Dalam unsur berita 5W+1H, unsur yang menjawab "mengapa" adalah...',o:['why','what','who','how'],x:'What, who, when, where, why, how.'},
  {q:'Hak jawab dalam jurnalistik di Indonesia diatur dalam...',o:['UU Pers No. 40 Tahun 1999','UU ITE','KUHP','UU Penyiaran'],x:'Hak jawab dan hak koreksi diatur di UU Pers.'}
],
k_farmasi:[
  {q:'Parasetamol terutama digunakan sebagai...',o:['penurun demam dan pereda nyeri','antibiotik','antihistamin','antasida'],x:'Analgesik dan antipiretik.'},
  {q:'Antibiotik digunakan untuk mengatasi infeksi...',o:['bakteri','virus','alergi','cacing'],x:'Antibiotik tidak mempan untuk flu yang disebabkan virus.'},
  {q:'Lingkaran merah dengan huruf K pada kemasan obat menandakan obat...',o:['keras (harus dengan resep dokter)','bebas','bebas terbatas','jamu'],x:'Lingkaran hijau = obat bebas, biru = bebas terbatas.'},
  {q:'Lingkaran hijau pada kemasan obat berarti obat...',o:['bebas','keras','narkotika','bebas terbatas'],x:'Bisa dibeli tanpa resep.'}
],
k_pertanian:[
  {q:'Unsur hara makro N, P, dan K adalah...',o:['nitrogen, fosfor, kalium','natrium, fosfor, kalsium','nitrogen, kalium, klorin','neon, fosfat, karbon'],x:'Pupuk NPK memasok ketiganya.'},
  {q:'Hama wereng cokelat umumnya menyerang tanaman...',o:['padi','kelapa sawit','kakao','cabai'],x:'Wereng menghisap cairan batang padi.'},
  {q:'Bercocok tanam tanpa tanah dengan larutan nutrisi disebut...',o:['hidroponik','tumpang sari','rotasi tanaman','terasering'],x:'Cocok untuk lahan sempit di kota.'},
  {q:'Terasering di lahan miring bertujuan untuk...',o:['mencegah erosi','menambah hama','mempercepat panen','mengurangi sinar matahari'],x:'Seperti sawah berundak di Bali.'}
],
k_sastra:[
  {q:'"Romeo and Juliet" ditulis oleh...',o:['William Shakespeare','Charles Dickens','Jane Austen','Mark Twain'],x:'Tragedi karya Shakespeare, akhir abad ke-16.'},
  {q:'Penulis novel "Laskar Pelangi" adalah...',o:['Andrea Hirata','Tere Liye','Pramoedya Ananta Toer','Habiburrahman El Shirazy'],x:'Berlatar di Belitung.'},
  {q:'Novel "Bumi Manusia" ditulis oleh...',o:['Pramoedya Ananta Toer','Chairil Anwar','Andrea Hirata','W.S. Rendra'],x:'Bagian pertama Tetralogi Buru.'},
  {q:'Puisi "Aku" ("Aku ini binatang jalang...") ditulis oleh...',o:['Chairil Anwar','W.S. Rendra','Sapardi Djoko Damono','Taufiq Ismail'],x:'Penyair pelopor Angkatan \'45.'}
],
/* ----- soal lucu (semua jawaban "benar", tanggapannya beda-beda) ----- */
lucu_sekolah:[
  {lucu:true,q:'Guru bertanya, "Siapa yang belum mengerjakan PR?" Kamu belum. Apa yang kamu lakukan?',o:['Jujur angkat tangan','Pura-pura mencari di tas sampai bel bunyi','"Ketinggalan di rumah, Bu"','Pinjam punya teman, salin kilat di bawah meja'],
    r:['Kamu dihukum berdiri di depan kelas, tapi diam-diam guru menghargai kejujuranmu.','Strategi klasik. Bel bunyi, kamu selamat. Untuk hari ini.','Alasan legendaris sejak zaman kakek kita. Guru sudah hafal.','Kecepatan menyalinmu luar biasa. Sayang tulisannya tidak bisa dibaca siapa pun.']},
  {lucu:true,q:'Upacara bendera hari Senin, matahari terik, amanat pembina sudah 25 menit. Apa yang terjadi?',o:['Ada teman pingsan di barisan belakang','Kamu menghitung berapa kali pembina bilang "dan"','Kamu tidur sambil berdiri','Semua di atas'],
    r:['Tradisi suci upacara bendera.','Hasilnya 47 kali. Kamu bangga tanpa alasan yang jelas.','Bakat langka yang hanya dimiliki anak sekolah Indonesia.','Jawaban paling jujur. Kamu paham Indonesia.']},
  {lucu:true,q:'Ulangan matematika, kamu sama sekali tidak tahu jawabannya. Strategimu?',o:['Pilih C, karena "C paling sering benar"','Tulis rumus apa saja, siapa tahu dapat nilai cara','Berdoa dengan khusyuk','Melirik jawaban teman'],
    r:['Teori konspirasi pilihan ganda yang diwariskan turun-temurun.','Guru memberi nilai 2 karena "usahanya ada".','Doa memang penting, belajar juga.','Temanmu ternyata juga melirik jawabanmu. Lingkaran setan.']},
  {lucu:true,q:'Bel pulang sekolah berbunyi. Apa gerakan pertamamu?',o:['Memasukkan buku ke tas dalam 0,8 detik','Lari ke tukang cilok depan gerbang','Pura-pura tidak dengar karena jadwal piket','Langsung cek HP'],
    r:['Rekor dunia yang tidak pernah tercatat.','Cilok bumbu kacang adalah hak asasi pelajar.','Teman sekelompok piket mencatat namamu dalam hati.','Notifikasi grup kelas: "PR besok dikumpulkan ya".']}
],
lucu_kuliah:[
  {lucu:true,q:'Dosen bilang, "Kuliah dimulai jam 07.00 tepat." Jam berapa dosen biasanya datang?',o:['07.00 tepat','07.30 sambil bilang "maaf macet"','09.15, lalu kuliah dibatalkan','Tidak datang, hanya mengirim tugas lewat grup'],
    r:['Dosen langka. Lindungi beliau.','Mahasiswa yang datang 06.55 menatap kosong ke papan tulis.','Kamu bangun subuh demi pengumuman pembatalan.','Tugasnya dikumpulkan jam 23.59 malam ini.']},
  {lucu:true,q:'Dosen pembimbing bertanya, "Skripsinya sudah sampai mana?" Jawabanmu?',o:['"Sedang tahap pengolahan data, Pak"','"Masih di hati, Bu"','"Bab 1, revisi ke-7, Pak"','Pura-pura sinyal hilang'],
    r:['Kenyataannya datanya belum dikumpulkan sama sekali.','Dosen tertawa, lalu memberimu deadline minggu depan.','Kejujuran yang menyakitkan untuk semua pihak.','"Halo? Pak? Bapak putus-putus..." Kamu menutup laptop.']},
  {lucu:true,q:'Tugas kelompok 5 orang. Biasanya yang benar-benar mengerjakan ada berapa?',o:['1 orang','5 orang, kompak','2 orang, ditambah 3 yang "bantu doa"','Tergantung siapa yang paling takut nilai jelek'],
    r:['Dan orang itu biasanya kamu.','Kelompok impian. Mungkin hanya ada di brosur kampus.','Nama mereka tetap tercantum di halaman sampul.','Teori yang terbukti secara empiris.']},
  {lucu:true,q:'Akhir bulan, uang saku menipis. Menu andalanmu?',o:['Mi instan + telur (kalau sedang mewah)','Nasi + kecap','Datang ke seminar yang ada konsumsinya','Puasa sunah, dan yang tidak sunah'],
    r:['Makanan pokok mahasiswa se-Nusantara.','Sederhana, manis, dan sedikit menyedihkan.','Kamu jadi ahli topik apa pun yang konsumsinya enak.','Tubuh lebih ringan, dompet tetap ringan.']}
],
lucu_kerja:[
  {lucu:true,q:'Rapat yang sebenarnya cukup lewat email berlangsung 2 jam. Apa yang kamu lakukan?',o:['Mencatat dengan serius','Mengangguk setiap 30 detik','Diam-diam mengerjakan pekerjaan lain','Menyusun daftar belanja bulanan'],
    r:['Catatanmu jadi satu-satunya bukti rapat itu pernah terjadi.','Kamu terlihat sangat setuju dengan semua hal.','Produktivitas tersembunyi.','Rapat selesai, daftar belanja juga selesai.']},
  {lucu:true,q:'Atasan bilang, "Tolong ya, agak urgent." Artinya...',o:['Deadline-nya kemarin','Deadline-nya besok pagi','Sebenarnya belum urgent, tapi atasan gelisah','Semua jawaban benar'],
    r:['Kamu terlambat bahkan sebelum mulai.','Malam ini kamu tidak tidur.','Kamu mengerjakannya, lalu tidak pernah dibuka.','Kamu sudah berpengalaman.']},
  {lucu:true,q:'Grup WhatsApp kantor ramai jam 9 malam. Kamu...',o:['Balas cepat supaya terlihat responsif','Baca diam-diam, balas besok pagi','Mute grup selama 8 jam','Kirim stiker jempol saja'],
    r:['Atasan senang, kamu lelah.','Strategi bertahan yang bijak.','Pagi harinya ada 214 pesan yang belum dibaca.','Stiker jempol: jawaban universal untuk semua hal.']},
  {lucu:true,q:'Tanggal gajian akhirnya tiba. Saldo tinggal berapa lama?',o:['Utuh sampai akhir bulan','Bertahan seminggu','Habis dalam 3 hari: cicilan, tagihan, checkout','Belum masuk, "sistem payroll sedang maintenance"'],
    r:['Kamu makhluk langka. Ajari kami caranya.','Realistis.','Uang hanya numpang lewat.','HRD mengirim emoji minta maaf.']}
]
};
/* label kategori untuk judul pop-up */
const SOAL_LBL={sd:'SD',smp:'SMP',sma_ipa:'SMA IPA',sma_ips:'SMA IPS',smk:'SMK',utbk:'Penalaran',inggris:'Bahasa Inggris',umum:'Pengetahuan Umum',
  k_kedokteran:'Kedokteran',k_teknik:'Teknik',k_informatika:'Informatika',k_ekonomi:'Ekonomi',k_akuntansi:'Akuntansi',k_hukum:'Hukum',k_pendidikan:'Pendidikan',
  k_seni:'Seni & Desain',k_psikologi:'Psikologi',k_komunikasi:'Ilmu Komunikasi',k_farmasi:'Farmasi',k_pertanian:'Pertanian',k_sastra:'Sastra',
  lucu_sekolah:'Kehidupan Sekolah',lucu_kuliah:'Kehidupan Kampus',lucu_kerja:'Kehidupan Kantor'};
