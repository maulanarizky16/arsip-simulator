'use strict';
/* ================= EVENTS ================= */
function events(){
  const s=P.st;
  /* tahun politik */
  if(isPemilu()){
    addLog('<b>TAHUN POLITIK.</b> Baliho memenuhi tiang listrik, janji memenuhi udara. Pemilu serentak digelar.','sys');
    if(!isPres()&&r()<0.8){
      N.rezim=pick(REZIM);
      addLog('Pemerintahan baru terbentuk — gaya rezim: <b>'+N.rezim+'</b>.','sys');
    }
  }
  /* dinamika global */
  const ev=r();
  if(ev<0.06){
    addLog('Krisis keuangan global menghantam. Rupiah Nusantara terjun bebas.'+nx({ekonomi:-7,mood:-5,kas:-120}),'bad');
  } else if(ev<0.13){
    addLog('Harga komoditas dunia melonjak — ekspor Nusantara panen besar.'+nx({ekonomi:+5,kas:+130}),'good');
  } else if(ev<0.24){
    addLog('Bencana alam melanda beberapa daerah.'+nx({kas:-60,mood:-4,infra:-3}),'bad');
    if(isKepda()||isPres()){
      ask({title:'TANGGAP DARURAT',text:'Wilayah Anda termasuk yang terdampak. Publik menunggu pemimpinnya.',opts:[
        {t:'Turun langsung ke lokasi',sub:'Kerahkan semua sumber daya',e:()=>{
          addLog('Anda tidur di tenda pengungsian, memimpin evakuasi. Foto itu menyebar ke mana-mana.'+fx({popularitas:+9,stres:+8})+nx({mood:+4}),'good');leg(6,3);}},
        {t:'Pantau dari kantor',sub:'Delegasikan ke bawahan',e:()=>{
          addLog('Anda memantau "secara virtual". Warganet membandingkan dengan pejabat sebelah yang basah kuyup di lokasi.'+fx({popularitas:-7}),'bad');leg(-5,0);}}
      ]});
    }
  }
  if(!P.pandemi&&r()<0.015){
    P.pandemi=true;
    addLog('<b>WABAH NASIONAL.</b> Rumah sakit penuh, ekonomi lumpuh.'+nx({ekonomi:-10,keswa:-10,mood:-10,kas:-200}),'bad');
    if(isPres()){
      ask({title:'KEBIJAKAN WABAH',text:'Seluruh negeri menunggu keputusan Anda:',opts:[
        {t:'Karantina ketat + bansos besar',sub:'Selamatkan nyawa dulu',e:()=>{
          addLog('Anda mengunci negeri dan membuka lumbung negara.'+nx({kas:-250,keswa:+8,mood:+6,ekonomi:-4}),'good');leg(8,2);}},
        {t:'Ekonomi jalan terus',sub:'"Wabah ini hanya flu besar"',e:()=>{
          addLog('Anda memilih ekonomi. Angka korban jadi polemik tahunan.'+nx({ekonomi:+2,keswa:-8,mood:-8}),'bad');leg(-8,2);}}
      ]});
    }
  }
  /* === EVENT GEOPOLITIK: AJAKAN PERANG / ALIANSI === */
  if(isPres()&&!N.perang&&N.militer>=30&&r()<0.08){
    const lawan=pick(['Negara Sebrang','Republik Utara','Federasi Selat','Kerajaan Sebelah']);
    const sebab=pick(['sengketa perbatasan laut','klaim sepihak atas pulau kecil','penembakan kapal nelayan','provokasi pesawat tempur']);
    ask({title:'GENDERANG PERANG?',text:'<b>'+lawan+'</b> melakukan provokasi: '+sebab+'. Aparat militer Anda menanti perintah. Pers bertanya kapan kabinet rapat.',opts:[
      {t:'Kerahkan pasukan — perang!',sub:'Modal militer '+N.militer+'/100',e:()=>{
        N.perang={dengan:lawan,sejak:N.tahun,thn:0,sebab};
        P._perangBaru=true;
        addLog('Anda memerintahkan operasi militer terhadap '+lawan+'. Bendera dikibarkan, doa dipanjatkan. Ekonomi langsung pucat.'+nx({keamanan:-5,kas:-150,mood:+4})+fx({pengaruh:+8,stres:+15}),'bad');
        stamp('PERANG DIMULAI');milestone('Memulai perang dengan '+lawan);leg(-2,5);}},
      {t:'Tempuh jalur diplomasi',sub:'Negosiasi & arbitrase internasional',cond:()=>N.diplomasi>=30,e:()=>{
        if(r()<0.45+N.diplomasi/300){
          addLog('Setelah berminggu pertemuan tertutup, '+lawan+' setuju arbitrase internasional. Tidak ada darah tertumpah.'+nx({diplomasi:+8,mood:+5})+fx({popularitas:+6,integritas:+3}),'good');
          ach('merpati');leg(7,3);stamp('PERDAMAIAN','green');}
        else {addLog('Diplomasi mentok — '+lawan+' tetap keras. Status saling mengintip di perbatasan.'+nx({keamanan:-3,diplomasi:-2}),'bad');leg(-1,-1);}}},
      {t:'Tunduk — terima tuntutan mereka',sub:'Harga diri murah, nyawa selamat',e:()=>{
        addLog('Anda mengakui klaim '+lawan+'. Sebagian wilayah dilepas. "Demi rakyat", kata juru bicara, dengan wajah datar.'+nx({mood:-10,keamanan:-5,diplomasi:-5})+fx({popularitas:-12,integritas:-5}),'bad');leg(-8,-10);}}
    ]});
  }
  /* misi perdamaian PBB */
  if(isPres()&&!N.perang&&N.militer>=50&&r()<0.06){
    ask({title:'MISI PERDAMAIAN PBB',text:'PBB meminta Nusantara mengirim pasukan untuk misi perdamaian di kawasan konflik. Bagus untuk citra, mahal di kantong.',opts:[
      {t:'Kirim kontingen',sub:'Biaya '+rpT(40)+' · diplomasi naik',e:()=>{
        addLog('Bendera Nusantara berkibar di seragam pasukan biru PBB. Kabar baik di koran luar negeri.'+nx({kas:-40,diplomasi:+10,militer:+2})+fx({popularitas:+5}),'good');
        ach('diplomat');leg(4,5);}},
      {t:'Pikir-pikir dulu',e:()=>addLog('Anda menahan keputusan. Tetangga mengirim kontingennya — sorotan pindah ke sana.','sys')}
    ]});
  }
  /* sanksi internasional */
  if(isPres()&&!N.sanksi&&(N.kebebasan<35||N.demokrasi<30)&&r()<0.15){
    N.sanksi=true;N.sanksiThn=ri(3,6);
    addLog('<b>SANKSI INTERNASIONAL DIJATUHKAN</b> — pelanggaran HAM dan demokrasi. Bank-bank dunia menutup pintu.'+nx({ekonomi:-6,diplomasi:-15,mood:-3}),'bad');
    stamp('SANKSI DIJATUHKAN');milestone('Negara terkena sanksi internasional');leg(-3,-8);
  }
  /* gerakan separatis */
  if(!N.separatis&&(N.kemiskinan>22||N.kebebasan<30)&&r()<0.04){
    const w=pick(['ujung timur','ujung barat','kepulauan utara','pegunungan tengah']);
    N.separatis={wilayah:w,thn:0};
    addLog('<b>GERAKAN SEPARATIS</b> berkobar di '+w+'. Bendera asing berkibar, lagu kebangsaan tandingan dinyanyikan.'+nx({keamanan:-8,mood:-3}),'bad');
    if(isPres()){
      ask({title:'GERAKAN SEPARATIS',text:'Wilayah '+w+' menuntut merdeka. Pilihan Anda menentukan banyak nasib.',opts:[
        {t:'Operasi militer total',sub:'Tumpas habis',e:()=>addLog('Pasukan dikirim, kampung-kampung disisir. Korban sipil jadi angka.'+nx({keamanan:+5,kebebasan:-8,diplomasi:-6})+fx({integritas:-8,heat:+5}),'bad')},
        {t:'Dialog & otonomi khusus',sub:'Biaya '+rpT(50)+' · jangka panjang',cond:()=>N.kas>=-50,e:()=>{addLog('Anda membuka meja perundingan — otonomi luas, dana khusus.'+nx({kas:-50,mood:+4,keamanan:+3,diplomasi:+4})+fx({integritas:+5}),'good');leg(5,3);}},
        {t:'Diamkan dulu',e:()=>addLog('Anda memilih wait and see. Masalah ditunda, bukan diselesaikan.'+fx({stres:+5}))}
      ]});
    }
  }
  /* inflasi parah */
  if(N.inflasi>=20&&r()<0.4){
    addLog('<b>HIPERINFLASI</b> mengamuk — harga beras naik 30% dalam sebulan. Ibu rumah tangga menyimpan uang dalam karung.'+nx({mood:-8,kemiskinan:+1.5}),'bad');
    if(isPres()){
      ask({title:'KEBIJAKAN MONETER DARURAT',text:'Inflasi '+N.inflasi+'%. Bank sentral menunggu arah angin Anda:',opts:[
        {t:'Naikkan suku bunga drastis',sub:'Tekan inflasi · ekonomi mengerem',e:()=>{addLog('Suku bunga dinaikkan tajam. Inflasi pelan turun, KPR rakyat menjerit.'+nx({inflasi:-6,ekonomi:-3,mood:-2}),'sys');leg(-1,3);}},
        {t:'Subsidi pangan besar-besaran',sub:'Biaya '+rpT(80)+' · redam harga',e:()=>{addLog('Operasi pasar di seluruh kota. Harga beras dipaksa turun.'+nx({kas:-80,inflasi:-4,mood:+5,kemiskinan:-0.5}),'good');leg(5,1);}},
        {t:'Sebut "inflasi terkendali"',sub:'Pidato di TV, nasib pasrah',e:()=>{addLog('Anda berpidato bahwa inflasi "lebih rendah dari proyeksi". Warganet menertawakan grafik.'+nx({inflasi:+2,mood:-5})+fx({popularitas:-6}),'bad');leg(-5,0);}}
      ]});
    }
  }
  /* pengangguran masif → demo buruh */
  if(N.pengangguran>=15&&r()<0.35){
    addLog('Ribuan buruh tergabung dalam aksi nasional menuntut lapangan kerja. Pabrik-pabrik berhenti produksi.'+nx({keamanan:-3,mood:-4}),'bad');
    if(isPres()||isMen()){
      ask({title:'KRISIS LAPANGAN KERJA',text:'Pengangguran '+N.pengangguran+'%. Tindakan?',opts:[
        {t:'Program padat karya nasional',sub:'Biaya '+rpT(60),cond:()=>N.kas>=-30,e:()=>{addLog('Ratusan ribu pekerja diserap proyek padat karya — infrastruktur kecil di seluruh negeri.'+nx({kas:-60,pengangguran:-3,infra:+2,mood:+4}),'good');leg(5,2);}},
        {t:'Insentif pajak untuk investor',sub:'Pajak korporat dipangkas',e:()=>{addLog('Investor asing dirayu dengan tax holiday. Pabrik baru dijanjikan, kapan jadinya entah.'+nx({pajak:-2,ekonomi:+2,pengangguran:-1})+fx({pengaruh:-3}),'sys');leg(0,2);}},
        {t:'Tunggangi narasi: "salah generasi sebelumnya"',e:()=>{addLog('Anda menyalahkan pemerintahan terdahulu di setiap kesempatan. Linimasa heboh, masalah tetap di tempat.'+nx({mood:-3}),'bad');leg(-3,-1);}}
      ]});
    }
  }
  /* skandal MBG (kalau program aktif) */
  if(N.mbg&&r()<0.18){
    const k=pick(['vendor catering fiktif','keracunan massal di 3 sekolah','menu pelajar hanya tahu rebus','kotak makan dikorupsi DPR']);
    addLog('<b>SKANDAL MBG:</b> '+k+'. Media menggali, vendor menghilang.'+nx({mood:-4,korupsi:+1}),'bad');
    if(isPres()){
      ask({title:'SKANDAL PROGRAM MBG',text:'Skandal: '+k+'. Anda baru saja mengklaim program ini berhasil.',opts:[
        {t:'Bentuk tim audit independen',e:()=>{addLog('Audit menyeluruh diumumkan. Beberapa vendor dipidana. Citra Anda diselamatkan, sedikit.'+nx({korupsi:-2,mood:+2})+fx({integritas:+4}),'good');leg(3,2);}},
        {t:'Sebut "oknum nakal" & lanjut',e:()=>{addLog('Kabar tenggelam dalam isu artis. "Oknum" jadi kata favorit jubir Anda.'+nx({mood:-2,korupsi:+1})+fx({integritas:-3}),'bad');leg(-2,0);}}
      ]});
    }
  }
  /* embargo dagang dari negara lain */
  if(N.diplomasi<30&&!N.sanksi&&r()<0.08){
    addLog('Negara mitra dagang memberlakukan tarif tinggi atas produk Nusantara — diplomasi kita memang sedang buruk.'+nx({ekonomi:-3,diplomasi:-2}),'bad');
  }
  /* IKN: insiden kebakaran/banjir */
  if(N.iknFase>=1&&N.iknFase<3&&r()<0.12){
    const i=pick(['kebakaran lahan di area inti','banjir bandang menerjang proyek','batu prasasti retak diresmikan','listrik padam saat upacara']);
    addLog('Insiden di IKN: '+i+'. Foto-fotonya viral disertai meme.'+fx({popularitas:isPres()?-4:0})+nx({mood:-2}),'bad');
  }
  /* tawaran perjanjian dagang regional */
  if(isPres()&&r()<0.05&&N.diplomasi>=40){
    ask({title:'PERJANJIAN DAGANG REGIONAL',text:'Forum ekonomi kawasan menawarkan Anda kursi pemimpin perundingan dagang multilateral.',opts:[
      {t:'Tandatangani — buka pasar',e:()=>{addLog('Tarif diturunkan, ekspor Nusantara membanjiri kawasan. UMKM lokal panik.'+nx({ekonomi:+4,diplomasi:+8,pengangguran:+0.5}),'good');leg(2,5);}},
      {t:'Tolak — lindungi pasar dalam negeri',e:()=>{addLog('Anda menutup pintu demi UMKM. Diplomat kawasan kecewa, pedagang pasar bersorak.'+nx({diplomasi:-5,pengangguran:-0.5,mood:+2}),'sys');leg(3,-2);}}
    ]});
  }
  /* gejolak publik */
  if(N.mood<32&&r()<0.5){
    addLog('Gelombang demonstrasi pecah di kota-kota besar. Ban dibakar, tuntutan diteriakkan.'+nx({keamanan:-3,mood:-2}),'bad');
    if(isPres()){
      ask({title:'ISTANA DIKEPUNG MASSA',text:'Ratusan ribu orang di depan istana menuntut perubahan.',opts:[
        {t:'Temui perwakilan, dengarkan tuntutan',e:()=>{
          addLog('Anda membuka pintu istana untuk perwakilan massa. Sebagian tuntutan diakomodasi.'+nx({mood:+7})+fx({pengaruh:-4}),'good');leg(6,-2);}},
        {t:'Bubarkan dengan aparat',sub:'Stabilitas di atas segalanya',e:()=>{
          addLog('Gas air mata memenuhi langit ibu kota. Tagar internasional menyorot Nusantara.'+nx({keamanan:+4,kebebasan:-8,mood:-5})+fx({integritas:-8}),'bad');leg(-10,3);}}
      ]});
    }
  }
  /* pemakzulan */
  if(isPres()&&(N.mood<24||(P.heat>=60&&r()<0.4))&&r()<0.45){
    ask({title:'SIDANG ISTIMEWA',text:'Parlemen menggalang hak menyatakan pendapat. Wacana pemakzulan menggelinding kencang.',opts:[
      {t:'Lobi pimpinan partai-partai',sub:'Butuh Pengaruh tinggi',cond:()=>s.pengaruh>=55,e:()=>{
        if(r()<0.5+s.pengaruh/300){addLog('Setelah pertemuan tengah malam di sebuah rumah dinas, wacana pemakzulan layu sebelum berkembang.'+fx({pengaruh:-12}));}
        else {makzul();}}},
      {t:'Mundur secara terhormat',e:()=>{
        endJab('mengundurkan diri di tengah tekanan');
        addLog('Anda berpidato perpisahan dengan suara bergetar. Sebagian mencaci, sebagian menangis.'+fx({popularitas:-5,stres:-10}));leg(2,-5);}},
      {t:'Hadapi sidang',e:()=>{ if(r()<0.55)makzul(); else addLog('Voting parlemen gagal mencapai kuorum. Anda selamat — untuk sekarang.'+fx({stres:+10}));}}
    ]});
  }
  /* tawaran menteri */
  if(!P.jab&&!P.retired&&!isPres()&&s.kompetensi>=68&&s.pengaruh>=45&&r()<0.13){
    ask({title:'PANGGILAN DARI ISTANA',text:'Presiden mengundang Anda: ada kursi menteri yang kosong dan nama Anda ada di kertasnya.',opts:[
      {t:'Terima jabatan menteri',e:()=>{setJab('menteri');addLog('Anda dilantik sebagai menteri. Mobil dinas berpelat khusus terparkir di rumah.'+fx({pengaruh:+10,stres:+8}),'good');}},
      {t:'Tolak dengan hormat',e:()=>addLog('Anda menolak halus. Idealisme (atau perhitungan) menahan langkah Anda.'+fx({integritas:+3,popularitas:+2}))}
    ]});
  }
  /* teror untuk pembongkar */
  if(P.cWhistle>0&&N.kebebasan<50&&r()<0.12){
    addLog('Tengah malam, rumah Anda dilempari dan ban mobil disayat. Pesan tanpa kata, tapi jelas maknanya.'+fx({stres:+10,kesehatan:-3}),'bad');
  }
  /* serangan rival politik */
  if(P.rival&&P.rival.hub!=='sekutu'&&P.maxLv>=2&&r()<0.1){
    const rv=P.rival; rv.pop=clamp(rv.pop+2,0,100);
    addLog('Rival lama Anda, <b>'+rv.nama+'</b>, melancarkan serangan: konferensi pers, baliho sindiran, dan pasukan buzzer mengarah ke Anda.'+fx({popularitas:-4,stres:+4,heat:+2}),'bad');
  }
  /* skandal pribadi */
  if(s.popularitas>=55&&r()<0.05){
    addLog('Gosip miring tentang Anda beredar di media sosial — foto lama, konteks dipelintir.'+fx({popularitas:-5,stres:+5}),'bad');
  }
  /* buzzer terbongkar */
  if(P.buzzed>0&&r()<0.15){
    P.buzzed=0;
    addLog('Investigasi media membongkar jaringan pendengung bayaran Anda. Percakapan grupnya bocor semua.'+fx({popularitas:-10,integritas:-3,heat:+4}),'bad');
  }
  /* penghargaan */
  if(s.integritas>=85&&s.popularitas>=55&&r()<0.07){
    addLog('Lembaga antikorupsi internasional memberi Anda penghargaan integritas.'+fx({popularitas:+5}),'good');leg(3,1);
  }
  /* keluarga */
  if(P.keluarga&&P.anak<3&&r()<0.18&&P.age<46){
    P.anak++;
    addLog('Anak Anda lahir di tengah hiruk pikuk politik. Sejenak, semua jabatan tidak penting.'+fx({stres:-4}),'good');
    milestone('Anak ke-'+P.anak+' lahir');
  }
  /* cukong menagih utang budi serangan fajar */
  if(P.cukong&&P.jab&&r()<0.14){
    ask({title:'CUKONG MENAGIH',text:'Pemodal yang dulu menalangi kampanye Anda datang menagih. Ia minta proyek/izin dimuluskan untuk bisnisnya.',opts:[
      {t:'Penuhi permintaannya',sub:'Aman dari ancaman, tangan kotor',e:()=>{P.cukong=false;
        addLog('Anda meneken yang dia minta. Utang budi lunas, tapi catatan integritas Anda ikut ternoda.'+fx({gelap:+ri(2,5)*1e9,integritas:-8,heat:+8})+nx({korupsi:+1}),'bad');leg(-4,0);}},
      {t:'Tolak & putus hubungan',sub:'Berani, tapi ia bisa membongkar',e:()=>{P.cukong=false;
        if(r()<0.5){addLog('Anda menolak tegas. Ia pergi dengan wajah masam — untungnya tak jadi membongkar apa pun.'+fx({integritas:+5,stres:+5}),'good');leg(3,0);}
        else {addLog('Anda menolak, dan ia balas dendam: rekaman lama bocor ke media. Sorotan hukum melonjak.'+fx({integritas:+3,heat:+15,popularitas:-5}),'bad');leg(2,-2);}}}
    ]});
  }
  /* pembelotan koalisi parlemen */
  if(isPres()&&N.koalisi>28&&(N.mood<38||s.popularitas<35)&&r()<0.22){
    const turun=ri(8,16); N.koalisi=clamp(N.koalisi-turun,0,100);
    addLog('<b>SATU PARTAI HENGKANG DARI KOALISI.</b> Merasa Anda jadi beban elektoral, mereka menyeberang ke oposisi. Kursi parlemen Anda menipis.'+fx({pengaruh:-3,stres:+6}),'bad');
    milestone('Ditinggal partai koalisi'); leg(-1,-2);
  }
  /* dinamika wakil presiden */
  if(isPres()&&P.wapres&&r()<0.14){
    const w=P.wapres;
    if(w.ambisi>=0.6&&(N.koalisi<58||s.popularitas<48)){
      N.koalisi=clamp(N.koalisi-ri(4,9),0,100);
      addLog('Wapres <b>'+w.nama.split(' ')[0]+'</b> diam-diam membangun blok sendiri di parlemen, bersiap untuk pemilu berikutnya. Manuvernya menggerus dukungan Anda.'+fx({pengaruh:-3,stres:+4}),'bad');
    } else if(w.ambisi<0.45){
      N.koalisi=clamp(N.koalisi+ri(2,5),0,100);
      addLog('Wapres <b>'+w.nama.split(' ')[0]+'</b> loyal mengamankan agenda Anda di lapangan dan meredam gejolak koalisi.'+fx({pengaruh:+2})+nx({mood:+1}),'good');
    }
  }
  /* === PERCABANGAN BARU === */
  /* harga minyak dunia melonjak — dilema subsidi BBM */
  if(isPres()&&r()<0.09){
    ask({title:'DILEMA SUBSIDI BBM',text:'Harga minyak dunia melonjak. Subsidi BBM membengkak dan menggerogoti APBN. Menteri keuangan menaruh tiga skenario di meja Anda:',opts:[
      {t:'Tahan harga — subsidi jalan terus',sub:'Kas '+rpT(-120),e:()=>{
        addLog('Harga di SPBU tak bergerak. Rakyat tenang, bendahara negara pucat.'+nx({kas:-120,mood:+3}),'sys');leg(4,-4);}},
      {t:'Naikkan harga BBM',sub:'Selamatkan APBN, siap-siap demo',e:()=>{
        addLog('Pengumuman kenaikan disiarkan malam-malam. Esoknya antrean panik di SPBU dan demo di mana-mana.'+nx({kas:+90,mood:-8,inflasi:+2.5,kemiskinan:+0.8})+fx({popularitas:-7}),'bad');leg(-6,6);}},
      {t:'Naik bertahap + bantalan bansos',sub:'Kas '+rpT(-50),cond:()=>N.kas>=-100,e:()=>{
        addLog('Harga naik pelan disertai bansos tunai. Gerutu tetap ada, gejolak bisa diredam.'+nx({kas:-50,mood:-2,inflasi:+1,kemiskinan:-0.3})+fx({popularitas:-2}),'sys');leg(1,4);}}
    ]});
  }
  /* kebakaran hutan & kabut asap lintas negara */
  if(isPres()&&N.lingkungan<60&&r()<0.08){
    addLog('Musim kering panjang: kebakaran hutan meluas, kabut asap menyeberang ke negara tetangga. Nota protes berdatangan.'+nx({lingkungan:-4,keswa:-3,diplomasi:-3}),'bad');
    ask({title:'KABUT ASAP LINTAS NEGARA',text:'Titik api terbanyak ada di konsesi korporasi besar — beberapa pemiliknya dekat dengan lingkar kekuasaan.',opts:[
      {t:'Seret korporasi pembakar ke pengadilan',e:()=>{
        addLog('Izin dicabut, direksi diadili. Lobi-lobi menelepon tengah malam — Anda tak mengangkat.'+nx({lingkungan:+7,diplomasi:+4,ekonomi:-2,korupsi:-1})+fx({integritas:+6,popularitas:+4}),'good');leg(5,5);}},
      {t:'Padamkan saja, jangan usik investor',sub:'Kas '+rpT(-40),e:()=>{
        addLog('Ribuan personel dan helikopter dikerahkan. Api padam oleh hujan, korporasi aman, tahun depan terbakar lagi.'+nx({kas:-40,lingkungan:+2})+fx({integritas:-4}),'sys');leg(-2,0);}},
      {t:'Salahkan cuaca di konferensi pers',e:()=>{
        addLog('"Ini fenomena alam," kata Anda. Negara tetangga menskors penerbangan, meme bertebaran.'+nx({diplomasi:-5,mood:-4})+fx({popularitas:-5}),'bad');leg(-5,-3);}}
    ]});
  }
  /* kebocoran data nasional */
  if(isPres()&&!P.evDataBocor&&r()<0.06){
    P.evDataBocor=true;
    ask({title:'KEBOCORAN DATA NASIONAL',text:'Peretas anonim menjual jutaan data penduduk di forum gelap — KTP, KK, nomor HP. Publik panik, pejabat saling lempar tanggung jawab.',opts:[
      {t:'Akui, minta maaf, rombak sistem',sub:'Kas '+rpT(-30),e:()=>{
        addLog('Anda mengakui kebobolan dan memerintahkan audit keamanan siber total. Pahit di awal, dipercaya kemudian.'+nx({kas:-30,keamanan:+4,mood:+2})+fx({integritas:+5}),'good');leg(4,4);}},
      {t:'Bantah: "itu data lama"',e:()=>{
        addLog('Bantahan resmi dirilis. Peretas membalas dengan membocorkan data para menteri — termasuk nomor pribadi Anda.'+nx({mood:-5,keamanan:-3})+fx({popularitas:-6,stres:+5}),'bad');leg(-4,-3);}}
    ]});
  }
  /* menteri tertangkap tangan */
  if(isPres()&&r()<0.08){
    const km=pick(KEMENTERIAN);
    ask({title:'MENTERI KENA OTT',text:'Lembaga antikorupsi menangkap tangan <b>'+km.n+'</b> dengan koper berisi suap proyek. Partai pengusungnya langsung pasang badan.',opts:[
      {t:'Copot & serahkan ke proses hukum',e:()=>{N.koalisi=clamp(N.koalisi-ri(5,10),0,100);
        addLog('Anda mencopotnya hari itu juga. Partainya mengancam keluar koalisi, rakyat bertepuk tangan.'+nx({korupsi:-2,mood:+5})+fx({integritas:+6,popularitas:+5}),'good');leg(6,4);}},
      {t:'Lindungi: "praduga tak bersalah"',e:()=>{
        addLog('Anda memintanya "tetap fokus bekerja" sementara kasus berjalan. Koalisi adem, publik mencatat.'+nx({korupsi:+2,mood:-5})+fx({integritas:-6,heat:+4}),'bad');leg(-6,-2);}}
    ]});
  }
  /* WNI terancam hukuman mati di luar negeri */
  if(isPres()&&r()<0.06){
    ask({title:'WNI TERANCAM HUKUMAN MATI',text:'Seorang pekerja migran Nusantara divonis mati di negeri orang atas kasus yang janggal. Keluarganya menangis di televisi; publik menuntut negara hadir.',opts:[
      {t:'Lobi tingkat tinggi + bayar diyat',sub:'Kas '+rpT(-25),cond:()=>N.kas>=-50,e:()=>{
        if(r()<0.7){addLog('Setelah diplomasi senyap berbulan-bulan, ia dibebaskan dan pulang. Tangis keluarganya disiarkan langsung.'+nx({kas:-25,diplomasi:+5,mood:+6})+fx({popularitas:+7}),'good');leg(7,4);}
        else {addLog('Segala upaya dikerahkan, namun eksekusi tetap berjalan. Anda mengumumkannya dengan suara berat.'+nx({kas:-25,mood:-4})+fx({popularitas:-2,stres:+5}),'bad');leg(2,1);}}},
      {t:'Sebatas nota protes diplomatik',e:()=>{
        addLog('Negara hadir sebatas kertas. Eksekusi berlangsung; tagar kemarahan menyala berhari-hari.'+nx({mood:-6,diplomasi:-2})+fx({popularitas:-6}),'bad');leg(-6,-2);}}
    ]});
  }
  /* RUU kontroversial disahkan kilat */
  if(isPres()&&r()<0.07){
    ask({title:'RUU KONTROVERSIAL',text:'Parlemen mengesahkan RUU yang dinilai memangkas kebebasan sipil — dibahas kilat tengah malam. Mahasiswa turun ke jalan di puluhan kota.',opts:[
      {t:'Terbitkan Perppu, batalkan',sub:'Rakyat senang, parlemen tersinggung',e:()=>{N.koalisi=clamp(N.koalisi-ri(6,12),0,100);
        addLog('Anda menganulir lewat Perppu. Gedung parlemen mendidih, jalanan bersorak.'+nx({kebebasan:+6,demokrasi:+4,mood:+7})+fx({popularitas:+8,pengaruh:-4}),'good');leg(8,-2);}},
      {t:'Biarkan berlaku',sub:'Stabilitas elite terjaga',e:()=>{N.koalisi=clamp(N.koalisi+ri(3,7),0,100);
        addLog('Anda meneken dan meminta semua pihak "menghormati proses". Demonstrasi dibalas pagar kawat.'+nx({kebebasan:-7,demokrasi:-5,mood:-7})+fx({integritas:-4}),'bad');leg(-8,2);}},
      {t:'Tunda pemberlakuan, buka dialog',e:()=>{
        addLog('Anda menunda pelaksanaan dan mengundang perwakilan mahasiswa ke istana. Suhu turun, masalah menggantung.'+nx({mood:+2,demokrasi:+1})+fx({stres:+4}),'sys');leg(2,0);}}
    ]});
  }
  /* kasus hukum viral: tajam ke bawah */
  if(P.jab&&r()<0.06){
    const kasus=pick(['nenek pencuri tiga buah kakao dituntut 5 tahun','petani penolak tambang dijerat pasal karet','ibu pengkritik layanan RS digugat pencemaran nama baik','nelayan tua dipidana karena melaut di zona konservasi']);
    ask({title:'KEADILAN JADI TRENDING',text:'Kasus '+kasus+' viral nasional. Publik murka pada hukum yang tajam ke bawah, tumpul ke atas. Sorot kamera kini menunggu sikap Anda.',opts:[
      {t:'Bersuara membela si kecil',e:()=>{
        addLog('Anda angkat suara dan mengirim tim bantuan hukum. Kasus berakhir damai; nama Anda ikut harum.'+fx({popularitas:+6,integritas:+3})+nx({mood:+3}),'good');leg(4,0);}},
      {t:'"Hormati proses hukum"',e:()=>{
        addLog('Jawaban normatif Anda dipotong jadi video sindiran. Aman secara prosedur, dingin di mata publik.'+fx({popularitas:-4})+nx({mood:-2}),'bad');leg(-3,1);}}
    ]});
  }
  /* godaan dinasti politik */
  if(isPres()&&P.anak>0&&P.age>=48&&!P.evDinasti&&r()<0.1){
    P.evDinasti=true;
    ask({title:'GODAAN DINASTI',text:'Lingkaran dalam mendorong anak Anda maju di pilkada — "mumpung bapak masih menjabat". Partai-partai sudah antre menyodorkan tiket.',opts:[
      {t:'Dorong — amankan trah politik',e:()=>{
        if(r()<0.7){addLog('Anak Anda menang mudah; semua mesin bekerja untuknya. Media menyematkan satu kata yang melekat: dinasti.'+nx({demokrasi:-5,mood:-4})+fx({pengaruh:+6,popularitas:-6,heat:+4}),'bad');leg(-6,-4);milestone('Membangun dinasti politik');}
        else {addLog('Anak Anda kalah memalukan — rakyat menghukum lewat kotak suara. Nama Anda ikut tergores.'+fx({popularitas:-8,pengaruh:-4})+nx({demokrasi:+2}),'bad');leg(-3,-2);}}},
      {t:'Larang — biar merintis sendiri',e:()=>{
        addLog('Anda menolak memuluskan jalan anak sendiri. Lingkaran dalam kecewa; sejarah mencatat hormat.'+fx({integritas:+7,popularitas:+4})+nx({demokrasi:+2}),'good');leg(5,3);}}
    ]});
  }
  /* tawaran jadi timses bayaran (karier awal) */
  if(!P.jab&&!P.retired&&P.maxLv===0&&P.age<=35&&r()<0.08){
    ask({title:'TAWARAN DARI TIMSES',text:'Seorang calon anggota dewan menawari Anda jadi koordinator lapangan timsesnya. Bayaran lumayan; tugasnya termasuk "mengondisikan" suara.',opts:[
      {t:'Terima — belajar politik dari dalam',e:()=>{
        addLog('Anda turun ke lorong-lorong, mengatur logistik dan amplop. Ilmu lapangan bertambah, idealisme menipis.'+fx({money:+ri(20,60)*1e6,pengaruh:+5,kompetensi:+3,integritas:-6,heat:+3}),'sys');leg(-2,0);}},
      {t:'Terima, tapi tolak bagian kotor',e:()=>{
        addLog('Anda pegang logistik resmi saja dan menolak urusan amplop. Bayaran lebih kecil, tidur lebih nyenyak.'+fx({money:+ri(8,20)*1e6,pengaruh:+3,kompetensi:+3,integritas:+2}),'good');leg(1,0);}},
      {t:'Tolak mentah-mentah',e:()=>{
        addLog('Anda menolak. Jalan Anda mungkin lebih lambat, tapi bersih sejak langkah pertama.'+fx({integritas:+3}),'sys');}}
    ]});
  }
  /* konflik agraria: proyek vs warga */
  if((isPres()||isKepda())&&r()<0.07){
    const lok=pick(['kawasan industri baru','proyek bendungan','perkebunan sawit raksasa','tambang nikel']);
    ask({title:'KONFLIK AGRARIA',text:'Pembangunan '+lok+' menggusur kampung yang dihuni turun-temurun. Warga bertahan; aparat dan alat berat sudah di lokasi.',opts:[
      {t:'Hentikan, ukur ulang & ganti untung layak',sub:isPres()?'Kas '+rpT(-35):'Dialog panjang',e:()=>{
        if(isPres())addLog('Anda memerintahkan moratorium dan ganti untung di atas harga pasar. Investor menggerutu, warga menyimpan nama Anda dalam doa.'+nx({kas:-35,mood:+6,ekonomi:-2})+fx({popularitas:+6,integritas:+5}),'good');
        else addLog('Anda turun ke lokasi, menghentikan alat berat, dan duduk bersama warga sampai angka ganti untung disepakati.'+dx({kepuasan:+8,sejahtera:+3,ekonomi:-2})+fx({popularitas:+6,integritas:+5}),'good');
        leg(6,1);}},
      {t:'Lanjutkan — pembangunan tak boleh mundur',e:()=>{
        if(isPres())addLog('Penggusuran berjalan dikawal aparat. Video ibu-ibu menghadang ekskavator menyayat linimasa.'+nx({ekonomi:+3,mood:-7,kebebasan:-4})+fx({popularitas:-7,integritas:-5}),'bad');
        else addLog('Anda memilih investor. Proyek jalan, tapi tiap kunjungan kerja disambut poster protes.'+dx({ekonomi:+4,kepuasan:-8})+fx({popularitas:-6,integritas:-5}),'bad');
        leg(-7,3);}}
    ]});
  }
  /* langganan banjir (khusus kepala daerah) */
  if(isKepda()&&r()<0.1){
    ask({title:'KOTA LANGGANAN BANJIR',text:'Hujan deras semalam dan separuh wilayah Anda terendam. Warga mengungsi di tanggul sambil menyebut-nyebut nama Anda.',opts:[
      {t:'Normalisasi sungai & benahi drainase',sub:'Kerja sunyi, hasil pelan',e:()=>{
        addLog('Anda mulai kerja sunyi: keruk sungai, tertibkan bangunan liar, perlebar drainase. Tahun ini masih banjir, tahun depan mulai surut.'+dx({infra:+6,layanan:+3,kepuasan:+2})+fx({stres:+5}),'good');leg(3,4);}},
      {t:'Blusukan + santunan cepat',e:()=>{
        addLog('Anda menggulung celana, menggendong lansia, membagikan nasi bungkus. Warga terhibur; akar masalahnya menunggu musim hujan berikutnya.'+dx({kepuasan:+6})+fx({popularitas:+5,stres:+4}),'sys');leg(3,-2);}},
      {t:'Salahkan banjir kiriman daerah tetangga',e:()=>{
        addLog('"Ini banjir kiriman," kata Anda. Kepala daerah tetangga membalas di media — perang pernyataan dimulai.'+dx({kepuasan:-6})+fx({popularitas:-4}),'bad');leg(-4,-2);}}
    ]});
  }
  /* survei tahunan */
  if(P.jab&&r()<0.6){
    const ap=Math.round((s.popularitas+N.mood)/2);
    addLog('Survei nasional: tingkat kepuasan terhadap Anda '+ap+'%.','sys');
  }
}
function makzul(){
  endJab('DIMAKZULKAN parlemen');
  stamp('DIMAKZULKAN');
  addLog('Sidang istimewa memutuskan: Anda <b>diberhentikan</b> dari jabatan. Sejarah mencatat dengan tinta tebal.'+fx({popularitas:-12,pengaruh:-20,stres:+15}),'bad');
  milestone('Dimakzulkan'); leg(-5,-15);
}

