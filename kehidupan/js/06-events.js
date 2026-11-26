'use strict';
/* ================= EVENT TAHUNAN (otomatis) ================= */
function events(){
  const a=P.age;
  /* ---- RELASI & PERTEMANAN ---- */
  if(a>=20&&P.st.relasi>=60&&r()<0.08){
    const u=ri(5,30)*1e6;
    addLog('Seorang kenalan lama mengajak Anda ikut proyek sampingan. Hasilnya lumayan.'+fx({money:u,relasi:+3}),'good');
  } else if(a>=20&&P.st.relasi>=35&&r()<0.06){
    const u=ri(5,15)*1e6;
    ask({title:'TEMAN PINJAM UANG',text:'Teman lama tiba-tiba menghubungi: butuh pinjaman '+rp(u)+' untuk keperluan mendesak.',opts:[
      {t:'Pinjamkan',cond:()=>P.money>=u,e:()=>{
        if(r()<0.6)addLog('Anda meminjamkan '+rp(u)+'. Setahun kemudian dikembalikan utuh, plus rasa hormat.'+fx({relasi:+6,happy:+3}),'good');
        else addLog('Anda meminjamkan '+rp(u)+'... lalu nomor teman itu mendadak tidak aktif.'+fx({money:-u,relasi:-4,stress:+5}),'bad');}},
      {t:'Tolak halus',e:()=>addLog('Anda menolak dengan alasan kondisi. Hubungan sedikit merenggang.'+fx({relasi:-5}))}
    ]});
  }
  /* ---- TEMAN BERNAMA ---- */
  if(P.teman.length&&a>=15&&r()<0.13){
    const t=pick(P.teman);
    if(t.sifat.k==='tukangutang'&&P.money>=5e6&&r()<0.6){
      const u=ri(3,12)*1e6;
      ask({title:t.nama.toUpperCase()+' PINJAM UANG',text:t.nama+' (teman, '+t.sifat.n+') lagi kepepet, minta pinjam '+rp(u)+'.',opts:[
        {t:'Pinjamkan',cond:()=>P.money>=u,e:()=>{ if(r()<0.35){t.dekat=clamp(t.dekat+8,0,100);addLog(t.nama+' mengembalikan tepat waktu. Pertemanan makin solid.'+fx({relasi:+3}),'good');}
          else {t.dekat=clamp(t.dekat-15,0,100);addLog(t.nama+' menghilang dengan uang Anda. '+rp(u)+' dan satu pertemanan melayang.'+fx({money:-u,happy:-5,stress:+4}),'bad');}}},
        {t:'Tolak',e:()=>{t.dekat=clamp(t.dekat-10,0,100);addLog('Anda menolak. '+t.nama+' kecewa, hubungan merenggang.'+fx({relasi:-2}));}}
      ]});
    } else if((t.sifat.k==='sukses'||t.sifat.k==='koneksian')&&t.dekat>=60&&r()<0.5){
      const u=ri(8,25)*1e6;
      addLog(t.nama+' mengajak Anda proyek bareng. Hasilnya lumayan.'+fx({money:u,relasi:+3,happy:+3}),'good');
    } else if(t.sifat.k==='drama'&&r()<0.5){
      ask({title:'DRAMA '+t.nama.toUpperCase(),text:t.nama+' (teman, '+t.sifat.n+') menyeret Anda ke konflik dengan teman lain — gosip, salah paham, grup chat memanas. Sikap Anda?',opts:[
        {t:'Jadi penengah, redakan',e:()=>{ if(r()<0.55){t.dekat=clamp(t.dekat+6,0,100);addLog('Anda berhasil menjadi penengah. Semua reda, Anda dihormati.'+fx({charm:+3,relasi:+3,stress:+3}),'good');}
          else {addLog('Niat baik Anda malah dianggap memihak. Pusing sendiri.'+fx({stress:+6,happy:-3}),'bad');}}},
        {t:'Jaga jarak dari dramanya',e:()=>{t.dekat=clamp(t.dekat-6,0,100);addLog('Anda menarik diri dari pusaran drama '+t.nama+'. Hubungan agak renggang, tapi kepala lebih tenang.'+fx({stress:-3}));}}
      ]});
    } else if(t.sifat.k==='setia'&&(P.money<0||P.st.stress>=80)&&t.dekat>=45&&r()<0.6){
      if(P.money<0){const u=ri(8,20)*1e6;addLog('Tahu Anda sedang terpuruk, '+t.nama+' (sahabat setia) datang membawa pinjaman tanpa diminta. "Bayar kalau sudah lapang, jangan dipikirin."'+fx({money:u,happy:+5,stress:-5}),'good');}
      else {addLog(t.nama+' (sahabat setia) menemani Anda melewati masa berat tanpa banyak tanya. Kehadiran yang menenangkan.'+fx({stress:-8,happy:+4}),'good');}
      t.dekat=clamp(t.dekat+5,0,100);
    } else if(t.dekat<22&&r()<0.4){
      addLog('Anda dan '+t.nama+' makin jarang kontak — pelan-pelan jadi sekadar nama di kontak HP.'+fx({happy:-2}));
      P.teman.splice(P.teman.indexOf(t),1);
    } else if(r()<0.3){
      addLog('Reuni dadakan bareng '+t.nama+' dan teman lama. Nostalgia mengalir deras.'+fx({happy:+4,stress:-3}));
      t.dekat=clamp(t.dekat+5,0,100);
    }
  }
  /* ---- MASA TUA & ANAK ---- */
  if(a>=66&&P.kids.length){
    if(P.dekatAnak>=60&&r()<0.45)
      addLog('Anak-anak datang berkunjung membawa cucu dan masakan kesukaan Anda. Rumah ramai lagi.'+fx({happy:+6,health:+2}),'good');
    else if(P.dekatAnak<35&&r()<0.3)
      addLog('Hari raya lewat lagi tanpa kabar dari anak-anak. Rumah terasa terlalu besar.'+fx({happy:-6,stress:+3}),'bad');
  }
  /* ---- PENDIDIKAN ---- */
  if(a===6){
    P.edu='SD'; stamp('MASUK SD','green'); milestone('Masuk SD');
    addLog('Hari pertama sekolah. Seragam merah putih masih kebesaran.');
    ask({title:'POLA BELAJAR',text:'Orang tua bertanya: mau jadi anak yang bagaimana di sekolah?',opts:[
      {t:'Rajin belajar, kejar ranking',e:()=>addLog('Anda tekun mengerjakan PR tiap malam.'+fx({smart:+8,happy:-2}))},
      {t:'Yang penting banyak teman',e:()=>addLog('Anda jadi anak paling ramai di kelas.'+fx({charm:+8,smart:-2}))},
      {t:'Seimbang saja',e:()=>addLog('Belajar iya, main iya.'+fx({smart:+4,charm:+4}))}
    ]});
  }
  if(a===12){
    ujianAkhir('SD');
    P.eduLevel=1; P.edu='SMP'; addLog('Anda lulus SD dan masuk SMP. Masa puber dimulai.','good'); milestone('Lulus SD');
    ask({title:'JATI DIRI REMAJA',text:'Di SMP, semua orang mencari identitas. Anda tipe yang mana?',opts:[
      {t:'Kutu buku',e:()=>addLog('Perpustakaan jadi rumah kedua.'+fx({smart:+8,charm:-3}))},
      {t:'Anak gaul',e:()=>addLog('Anda kenal semua angkatan, dari kelas 7 sampai 9.'+fx({charm:+8,smart:-3}))},
      {t:'Anak rumahan',e:()=>addLog('Pulang sekolah langsung pulang. Aman dan tenteram.'+fx({happy:+4,health:+3,charm:-2}))}
    ]});
  }
  if(a===14){
    ask({title:'AJAKAN BERBAHAYA',text:'Teman sebangku mengajak bolos dan mencoba rokok di belakang sekolah.',opts:[
      {t:'Ikut, biar dianggap berani',e:()=>{P.rokok=true;
        addLog('Anda mulai merokok diam-diam. Kantong dan paru-paru sama-sama protes.'+fx({charm:+5,health:-6,stress:-3}),'bad');
        if(r()<0.4)addLog('Ketahuan orang tua. Diceramahi tiga jam nonstop.'+fx({happy:-6,stress:+6}),'bad');}},
      {t:'Tolak halus',e:()=>addLog('Anda menolak. Sedikit diejek, tapi dompet dan paru-paru selamat.'+fx({smart:+3,charm:-2}))}
    ]});
  }
  if(a===15){
    ujianAkhir('SMP');
    P.eduLevel=2; addLog('Lulus SMP. Saatnya memilih sekolah lanjutan.','good'); milestone('Lulus SMP');
    ask({title:'SEKOLAH LANJUTAN',text:'Pilihan ini menentukan arah hidup Anda:',opts:[
      {t:'SMA jurusan IPA',sub:'Butuh otak encer',cond:()=>P.st.smart>=55,e:()=>{P.track='ipa';P.edu='SMA IPA';
        addLog('Anda masuk IPA. Fisika dan kimia siap menghantui.'+fx({smart:+6,stress:+4}));}},
      {t:'SMA jurusan IPS',e:()=>{P.track='ips';P.edu='SMA IPS';
        addLog('Anda masuk IPS. Hafalan banyak, tapi diskusinya seru.'+fx({charm:+4,smart:+2}));}},
      {t:'SMK — siap kerja',e:()=>{P.track='smk';P.edu='SMK';
        addLog('Anda masuk SMK. Praktik bengkel dan magang menanti.'+fx({smart:+3,health:+2}));}}
    ]});
  }
  if(a===17&&P.st.charm>=55&&r()<0.7){
    const calon=namaOrang(P.gender==='L'?'P':'L').split(' ')[0];
    ask({title:'CINTA MONYET',text:calon+', teman sekelas, sepertinya juga memperhatikan Anda. Nembak nggak?',opts:[
      {t:'Nembak setelah pulang sekolah',e:()=>{ if(r()<P.st.charm/110){
          addLog(calon+' menerima! Dunia mendadak berwarna pink.'+fx({happy:+10,smart:-2}),'good');
          if(r()<0.7)addLog('Setahun kemudian kandas karena LDR kelulusan. Namanya juga cinta monyet.'+fx({happy:-5}));
        } else addLog('Ditolak dengan kata legendaris: "kita temenan aja ya."'+fx({happy:-8,charm:+3,stress:+4}),'bad');}},
      {t:'Fokus belajar dulu',e:()=>addLog('Anda memendam rasa demi masa depan.'+fx({smart:+4,happy:-2}))}
    ]});
  }
  if(a===18){
    ujianAkhir('SMA');
    P.eduLevel=3; P.edu='Lulus '+(P.track==='smk'?'SMK':'SMA');
    stamp('LULUS SMA/SMK'); milestone('Lulus '+(P.track==='smk'?'SMK':'SMA'));
    addLog('Toga abu-abu dilempar ke udara. Sekarang: dunia nyata. Meja Aksi terbuka penuh — atur hidup Anda dari sana.');
    const bisaKuliah=P.kelas!=='miskin'||P.st.smart>=60;   /* anak kurang mampu bisa lewat beasiswa (Bidikmisi/KIP Kuliah) */
    ask({title:'PERSIMPANGAN BESAR',text:'Inilah keputusan terbesar pertama dalam hidup Anda:',opts:[
      {t:'Kuliah',sub:bisaKuliah?'Ikut seleksi masuk perguruan tinggi':'',cond:()=>bisaKuliah,e:()=>masukKuliah()},
      {t:'Langsung kerja',e:()=>jobOffers(P.track==='smk'?POOL_SMK:POOL_UMUM,3)},
      {t:'Buka usaha',e:()=>bukaUsahaCard()},
      {t:'Gap year — istirahat dulu',e:()=>addLog('Anda rebahan setahun "mencari jati diri". Orang tua mulai menyindir.'+fx({happy:+6,stress:-6}))}
    ]});
  }
  /* kuliah: semester demi semester (lihat 03c-sekolah.js) */
  if(P.gapKuliah&&!P.kuliah&&!P.job&&a<=20){ P.gapKuliah=false; masukKuliah(); }
  if(P.kuliah)kuliahTahunan(a);
  if(a>=58&&P.job&&!P.retired){
    const pesangon=Math.round(P.job.g*1.5);
    P.pensiun=Math.round(P.job.g*0.3); P.retired=true;
    addLog('Anda pensiun dari posisi '+LV[P.job.level]+P.job.title+'. Pesangon '+rp(pesangon)+'.'+fx({money:pesangon,stress:-15,happy:+5}),'good');
    stamp('PENSIUN'); milestone('Pensiun'); P.job=null;
  }
  /* ---- MASA KECIL & REMAJA RANDOM ---- */
  if(a>=1&&a<=5&&r()<0.6){
    pick([
      ()=>addLog('Anda jatuh saat belajar sepeda. Lutut lecet, tapi besoknya naik lagi.'+fx({health:-2,happy:+2})),
      ()=>addLog('Kata pertama Anda bikin satu rumah tertawa berhari-hari.'+fx({happy:+3})),
      ()=>addLog('Main hujan-hujanan, besoknya demam.'+fx({health:-3})),
      ()=>addLog('Nenek datang membawa oleh-oleh. Hari terbaik tahun ini.'+fx({happy:+4}))
    ])();
  }
  if(a>=7&&a<=11&&r()<0.6){
    const pool=[
      ()=>addLog('Anda punya sahabat baru yang selalu sebangku.'+fx({charm:+4,happy:+3})),
      ()=>addLog('Dimarahi guru karena mengantuk di kelas.'+fx({happy:-2,stress:+2})),
      ()=>addLog('Juara lomba balap karung 17 Agustusan!'+fx({happy:+5,health:+2}))
    ];
    if(P.st.smart>65)pool.push(()=>addLog('Anda juara kelas! Foto Anda dipajang di mading.'+fx({smart:+3,happy:+5}),'good'));
    pick(pool)();
  }
  if(a>=13&&a<=17&&r()<0.5){
    const pool=[
      ()=>addLog('Anda ikut lomba antarsekolah dan masuk tiga besar.'+fx({charm:+3,happy:+4}),'good'),
      ()=>addLog('Begadang main game, besoknya remedial.'+fx({smart:-2,stress:+3}))
    ];
    if(P.st.charm<45)pool.push(()=>addLog('Anda sempat jadi sasaran ledekan kakak kelas. Masa yang berat.'+fx({happy:-7,stress:+7}),'bad'));
    pick(pool)();
  }
  /* ---- PERTEMUAN TAK SENGAJA ---- */
  if(!P.love&&a>=19&&a<=45&&r()<0.18){
    const c=newCandidate();
    ask({title:'PERTEMUAN',text:'Anda berkenalan dengan <b>'+c.nama+'</b> '+pick(['di acara teman','di tempat kerja','lewat media sosial','di warung kopi langganan'])+'. Ada getaran aneh.<br>'+profilCalon(c),opts:[
      {t:'Dekati pelan-pelan',e:()=>{ if(r()<0.35+P.st.charm/200)jadian(c);
        else addLog(c.nama.split(' ')[0]+' ternyata sudah punya pasangan. Yah.'+fx({happy:-4}),'bad');}},
      {t:'Cuek, fokus diri sendiri',e:()=>addLog('Anda memilih fokus pada hidup sendiri dulu.'+fx({stress:-2}))}
    ]});
  }
  /* ---- DILAMAR (khusus pemain perempuan: pasangan yang melamar) ---- */
  if(P.gender==='P'&&P.love&&!P.love.married&&P.love.rel>=60&&P.love.thn>=1&&a>=20&&r()<0.5){
    const nm=P.love.nama.split(' ')[0];
    const income=P.love.income||(P.love.gajiBln||0)*12;
    if(income<48e6&&r()<0.5){
      addLog(nm+' ingin sekali melamar, tapi mengaku belum mapan secara finansial. "Beri aku waktu sedikit lagi buat nabung, ya."'+fx({stress:+2}));
      P.love.rel=clamp(P.love.rel+1,0,100);
    } else lamaranMasuk(nm);
  }
  /* ---- HUBUNGAN KRITIS (otomatis) ---- */
  if(P.love&&!P.love.married&&P.love.rel<18){
    const nm=P.love.nama.split(' ')[0];
    ask({title:'HUBUNGAN DI UJUNG TANDUK',text:'Hubungan dengan '+nm+' makin dingin. Sudah jarang bicara.',opts:[
      {t:'Akhiri baik-baik',e:()=>{addLog('Anda dan '+nm+' berpisah. Sakit, tapi lega.'+fx({happy:-12,stress:-5}),'bad');P.love=null;}},
      {t:'Perjuangkan lagi',e:()=>{ if(r()<0.5){P.love.rel+=30;addLog('Liburan berdua memperbaiki semuanya.'+fx({happy:+6,money:-5e6}),'good');}
        else {addLog('Usaha Anda bertepuk sebelah tangan. '+nm+' pamit.'+fx({happy:-15,stress:+8}),'bad');P.love=null;}}}
    ]});
  } else if(P.love&&!P.love.married&&r()<0.2){
    addLog('Anda dan '+P.love.nama.split(' ')[0]+' bertengkar soal hal sepele.'+fx({rel:-8,stress:+3}));
  }
  if(P.love&&P.love.married&&P.love.rel<15){
    const nm=P.love.nama.split(' ')[0];
    ask({title:'RUMAH TANGGA RETAK',text:'Pernikahan dengan '+nm+' di titik terendah. Sering diam-diaman berminggu-minggu.',opts:[
      {t:'Konseling & perbaiki',e:()=>{ if(r()<0.55){P.love.rel+=35;addLog('Pelan-pelan kalian saling menemukan lagi.'+fx({happy:+8,money:-6e6}),'good');}
        else cerai();}},
      {t:'Bercerai',e:()=>cerai()}
    ]});
  }
  if(P.love&&a>72&&r()<0.04){
    addLog('Pasangan hidup Anda, '+P.love.nama+', berpulang lebih dulu. Separuh jiwa ikut pergi.'+fx({happy:-25,stress:+10,health:-5}),'bad');
    milestone('Ditinggal pasangan'); P.love=null;
  }
  /* ---- ANAK & CUCU ---- */
  if(P.kids.length&&r()<0.35){
    const k=pick(P.kids), ua=a-k.lahirAt;
    if(ua===6)addLog(k.nama+' masuk SD hari ini. Anda yang lebih gugup dari anaknya.'+fx({happy:+4}));
    else if(ua===18){
      addLog(k.nama+' lulus sekolah.','good');
      ask({title:'ANAK MAU KULIAH',text:k.nama+' ingin melanjutkan kuliah. Biaya total sekitar '+rp(80e6)+'.',opts:[
        {t:'Biayai penuh',cond:()=>P.money>=80e6,e:()=>{P.money-=80e6;k.kuliah=true;k.didik=clamp((k.didik||40)+15,0,100);
          addLog('Anda membiayai kuliah '+k.nama+'. Investasi terbaik seorang orang tua.'+fx({happy:+8}),'good');milestone(k.nama+' kuliah');}},
        {t:'Dorong cari beasiswa / kerja dulu',e:()=>addLog(k.nama+' berjuang lewat jalur beasiswa dan kerja sambilan.'+fx({happy:-2}))}
      ]});
    }
    else if(ua>0&&ua<18&&r()<0.4)addLog(k.nama+' sakit dan harus ke dokter.'+fx({money:-3e6,stress:+3}));
    else if(ua>2&&ua<18)addLog(k.nama+' memeluk Anda tanpa alasan sepulang kerja. Lelah langsung hilang.'+fx({happy:+5}));
  }
  for(const k of P.kids){
    const ua=a-k.lahirAt;
    if(ua>=25&&!k.nikah&&r()<0.25){ k.nikah=true;
      addLog(k.nama+' menikah! Anda menangis di kursi orang tua.'+fx({happy:+10,money:-15e6}),'good'); milestone(k.nama+' menikah'); }
    if(k.nikah&&!k.anak&&r()<0.3){ k.anak=true; P.cucu++;
      addLog('Cucu pertama dari '+k.nama+' lahir. Anda resmi jadi '+(P.gender==='L'?'kakek':'nenek')+'.'+fx({happy:+10}),'good'); milestone('Cucu lahir'); }
  }
  /* ---- KARIER OTOMATIS ---- */
  if(P.job&&!P.retired){
    /* performa & reputasi kerja menentukan: ditawari promosi lebih sering, lebih aman dari PHK, lebih sering dibajak */
    if(P.job.level<4&&r()<0.1+P.perf*0.03+(P.reputasiKerja-50)/400){
      const gBaru=Math.round(P.job.g*1.4);
      ask({title:'TAWARAN PROMOSI',text:'Atasan menawarkan posisi '+LV[P.job.level+1]+P.job.title+', gaji '+rp(Math.round(gBaru/12))+'/bulan. Tapi tanggung jawab berlipat.',opts:[
        {t:'Ambil!',e:()=>{if(!P.job)return;P.job.level++;P.job.g=gBaru;P.reputasiKerja=clamp(P.reputasiKerja+4,0,100);
          addLog('Anda naik jabatan jadi '+LV[P.job.level]+P.job.title+'.'+fx({stress:+10,happy:+5}),'good');
          milestone('Promosi: '+LV[P.job.level]+P.job.title);}},
        {t:'Tolak, jaga keseimbangan hidup',e:()=>addLog('Anda memilih waras daripada jabatan.'+fx({happy:+4,stress:-4}))}
      ]});
    } else if(r()<(G.mkt.label==='krisis'?0.1:0.03)*clamp(1-(P.perf*0.15+(P.reputasiKerja-50)/200),0.25,1)){
      const pesangon=Math.round(P.job.g*0.5);
      addLog('Perusahaan efisiensi besar-besaran — Anda kena PHK. Pesangon '+rp(pesangon)+'.'+(P.reputasiKerja>=65?' (Atasan menyesal melepas Anda.)':'')+fx({money:pesangon,happy:-12,stress:+12}),'bad');
      milestone('Kena PHK'); P.job=null; P.reputasiKerja=clamp(P.reputasiKerja-5,0,100);
    } else if(r()<0.03+(P.reputasiKerja>=60?0.05:0)){
      const gBaru=Math.round(P.job.g*1.25);
      ask({title:'DIBAJAK PERUSAHAAN LAIN',text:'Kompetitor menawari posisi sama, gaji '+rp(Math.round(gBaru/12))+'/bulan.',opts:[
        {t:'Pindah',e:()=>{if(!P.job)return;P.job.g=gBaru;addLog('Anda pindah kantor. Gaji naik, suasana baru.'+fx({happy:+4,stress:+4}),'good');}},
        {t:'Bertahan, loyalitas',e:()=>addLog('Anda bertahan. Atasan diam-diam menghargainya.'+fx({happy:+2}))}
      ]});
    }
  }
  /* ---- TUGAS DINAS PROFESI ---- */
  if(P.job&&P.job.bidang&&P.job.bidang!=='sipil'&&!P.retired&&r()<0.4)dinasEvent(P.job.bidang);
  /* ---- KEHIDUPAN POLITIK ---- */
  if(P.politik&&r()<0.55)politikEvent();
  /* ---- USAHA OTOMATIS ---- */
  for(const b of P.biz.slice()){
    if(P.money<-30e6&&r()<0.5){
      addLog('Usaha '+b.nama+' tidak tertolong — Anda gulung tikar.'+fx({happy:-12,stress:+12}),'bad');
      milestone('Usaha bangkrut: '+b.nama); P.biz.splice(P.biz.indexOf(b),1); continue;
    }
    if(r()<0.12)addLog('Supplier nakal hampir menipu usaha '+b.nama+'. Untung cepat sadar.'+fx({smart:+2,stress:+4}));
  }
  /* ---- KESEHATAN ---- */
  if(a>=10&&r()<(100-P.st.health)/400+(a>50?0.05:0.02)){
    const parah=P.st.health<40;
    const nama_sakit=parah?pick(['tipes berat','demam berdarah','infeksi paru']):pick(['tipes','demam berdarah ringan','maag kambuh parah']);
    ask({title:'JATUH SAKIT',text:'Anda terkena '+nama_sakit+'. Badan remuk semua.',opts:[
      {t:'Berobat ke rumah sakit',sub:'Biaya '+rp(parah?15e6:4e6),
        e:()=>{ if(a>=18)P.money-=(parah?15e6:4e6);
          addLog('Anda dirawat dan pulih.'+fx({health:+(parah?10:6),stress:+2}));}},
      {t:'Tahan saja, minum obat warung',e:()=>addLog('Anda memaksakan diri. Badan tidak pernah benar-benar pulih.'+fx({health:-(parah?14:8),stress:+5}),'bad')}
    ]});
  }
  if(P.rokok&&a>=25&&r()<0.15){
    ask({title:'BATUK TAK KUNJUNG SEMBUH',text:'Batuk Anda makin sering. Dokter menyarankan berhenti merokok.',opts:[
      {t:'Berhenti total',e:()=>{P.rokok=false;addLog('Anda berhenti merokok. Berat, tapi paru-paru berterima kasih.'+fx({health:+6,stress:+5}),'good');}},
      {t:'Nanti-nanti saja',e:()=>addLog('Anda menunda lagi. Batuknya ikut menunda sembuh.'+fx({health:-3}),'bad')}
    ]});
  }
  /* ---- KEUANGAN RANDOM ---- */
  if(a>=20&&P.money>=30e6&&netWorth()<3e9&&r()<0.05){
    ask({title:'INVESTASI BODONG?',text:'Kenalan menawarkan "investasi" untung 30% per bulan, tinggal setor '+rp(20e6)+'. Banyak yang sudah "membuktikan".',opts:[
      {t:'Setor — siapa tahu rezeki',e:()=>{ if(r()<0.9){
          addLog('Tiga bulan kemudian grupnya bubar, adminnya hilang. Uang Anda raib.'+fx({money:-20e6,happy:-10,stress:+10,smart:+5}),'bad');
        } else addLog('Anehnya Anda sempat untung dan menarik semua dana tepat waktu.'+fx({money:+15e6}),'good');}},
      {t:'Tolak mentah-mentah',e:()=>addLog('"Kalau untungnya segitu, kenapa dia masih nawarin orang?" — Anda lolos jebakan.'+fx({smart:+3}))}
    ]});
  }
  if(a>=18&&P.money<-8e6&&P.pinjol===0&&r()<0.4){
    ask({title:'GODAAN PINJOL',text:'Iklan pinjaman online muncul terus: "Cair 5 menit, tanpa jaminan!"',opts:[
      {t:'Pinjam '+rp(10e6),e:()=>{P.money+=10e6;P.pinjol=3;
        addLog('Dana cair. Anda belum sadar bunganya akan mencekik 3 tahun ke depan.'+fx({stress:+5}),'bad');}},
      {t:'Tahan diri, hidup hemat',e:()=>addLog('Anda mengencangkan ikat pinggang. Pelan tapi selamat.'+fx({stress:+3,smart:+2}))}
    ]});
  }
  if(a>=18&&r()<0.025){
    const rejeki=ri(2,15)*1e6;
    addLog(pick(['Anda menang giveaway media sosial','THR tak terduga dari saudara jauh','Uang lama ditemukan di jaket bekas'])+'.'+fx({money:rejeki,happy:+4}),'good');
  }
  if(punyaAset('motor')&&a<60&&r()<0.03){
    addLog('Anda kecelakaan motor — diserempet di perempatan.'+fx({health:-12,money:-4e6,stress:+8}),'bad');
  }
  /* ---- KESEHATAN MENTAL & KEBIASAAN ---- */
  /* daya tahan mental & terapi menurunkan peluang burnout; mental rendah menaikkannya */
  if((P.st.stress>=88||(P.st.stress>=78&&P.mental<=30))&&(P.job||P.biz.length)&&r()<clamp(0.45-(P.mental-50)/200-(P.terapi?0.1:0),0.15,0.7)){
    ask({title:'BURNOUT',text:'Badan dan pikiran Anda menyerah serentak. Bangun pagi pun terasa seperti memikul beton.',opts:[
      {t:'Ambil jeda panjang, rawat diri',sub:'Rp 8 jt',cond:()=>P.money>=8e6,e:()=>{P.money-=8e6;P.mental=clamp(P.mental+10,0,100);
        addLog('Anda rehat total beberapa bulan — terapi, tidur cukup, lepas dari notifikasi. Pulih perlahan.'+fx({stress:-30,health:+8,happy:+5}),'good');}},
      {t:'Paksakan terus, gigit jari',e:()=>{
        addLog('Anda memaksa terus bekerja. Tubuh membalas: tumbang di tengah jalan.'+fx({health:-18,stress:-6,happy:-8}),'bad');
        if(P.job&&r()<0.3){P.job=null;addLog('Anda akhirnya kolaps dan terpaksa berhenti kerja.','bad');milestone('Berhenti kerja karena burnout');}}}
    ]});
  }
  if(a>=40&&a<=52&&!P.midlife&&r()<0.13){
    P.midlife=true;
    ask({title:'KRISIS PARUH BAYA',text:'Anda terbangun bertanya: "Cuma begini saja hidup saya?" Dorongan untuk mengubah sesuatu menggebu-gebu.',opts:[
      {t:'Foya-foya — beli yang selama ini ditahan',sub:'Senang sesaat, dompet meringis',cond:()=>P.money>=50e6,e:()=>{const x=ri(30,80)*1e6;P.money-=x;
        addLog('Moge, gadget, liburan mahal — '+rp(x)+' melayang demi rasa "hidup". Sesaat puas.'+fx({happy:+10,stress:-6}),'good');}},
      {t:'Banting setir, kejar mimpi lama',e:()=>addLog('Anda memulai hal yang sejak muda diidamkan. Menyegarkan, meski berisiko.'+fx({happy:+8,stress:+5,smart:+3,charm:+2}))},
      {t:'Refleksi & syukuri yang ada',e:()=>addLog('Anda memilih berdamai dengan hidup. Tidak semua resah harus dituruti.'+fx({happy:+6,stress:-8,health:+2}),'good')}
    ]});
  }
  if(P.judi>=55&&P.money<5e6&&r()<0.5){
    addLog('Tabungan ludes ke meja judi. Anda menatap saldo Rp 0 dan grup taruhan yang masih menyala.'+fx({stress:+10,happy:-8,health:-3}),'bad');
    if(P.pinjol===0&&r()<0.6){P.pinjol=3;P.money+=8e6;
      addLog('Demi modal "balik modal", Anda nekat ambil pinjol. Lubang makin dalam.'+fx({stress:+6}),'bad');}
  }
  /* ---- CABANG HIDUP TAMBAHAN ---- */
  if((P.ortu.ayah||P.ortu.ibu)&&a>=25&&a<=62&&r()<0.05){
    const who=P.ortu.ayah&&(!P.ortu.ibu||r()<0.5)?'Ayah':'Ibu';
    const biaya=ri(20,60)*1e6;
    ask({title:'ORANG TUA SAKIT',text:who+' Anda jatuh sakit dan butuh biaya pengobatan '+rp(biaya)+'.',opts:[
      {t:'Tanggung sepenuhnya',sub:rp(biaya),cond:()=>P.money>=biaya,e:()=>{P.money-=biaya;addLog('Anda membiayai pengobatan '+who+'. Beliau berangsur pulih, dan diam-diam bangga punya anak seperti Anda.'+fx({happy:+6,stress:+3}),'good');}},
      {t:'Bantu semampunya',e:()=>{const b=Math.min(Math.max(P.money,0),Math.round(biaya*0.4));
        if(b<=0){addLog('Anda ingin membantu, tapi dompet sedang kosong. '+who+' berobat seadanya, dan rasa bersalah itu menetap.'+fx({happy:-7,stress:+6}),'bad');}
        else{P.money-=b;addLog('Anda membantu seadanya ('+rp(b)+'). '+who+' tetap berobat, meski Anda menahan rasa bersalah.'+fx({happy:-3,stress:+5}));}}},
      {t:'Tidak mampu membantu',e:()=>addLog('Anda tak bisa berbuat banyak. Beban batin itu tinggal lama.'+fx({happy:-8,stress:+6}),'bad')}
    ]});
  }
  if(P.love&&P.love.married&&a>=28&&a<=55&&P.love.rel<55&&r()<0.06){
    ask({title:'GODAAN HADIR',text:'Seseorang yang penuh perhatian hadir saat rumah tangga Anda sedang hambar. Ada tarikan yang berbahaya.',opts:[
      {t:'Tahan diri, perbaiki rumah tangga',e:()=>{P.love.rel=clamp(P.love.rel+8,0,100);addLog('Anda memilih setia dan mengajak pasangan memperbaiki keadaan.'+fx({happy:+3,stress:-2}),'good');}},
      {t:'Layani godaan diam-diam',e:()=>{ P.selingkuh=true; if(r()<0.45){P.love.rel=clamp(P.love.rel-40,0,100);addLog('Perselingkuhan Anda terbongkar. Rumah tangga retak parah, kepercayaan hancur.'+fx({happy:-15,stress:+15}),'bad');}
        else addLog('Sejenak Anda merasa hidup lagi, ditemani rasa bersalah yang menggerogoti.'+fx({happy:+3,stress:+9}),'bad');}}
    ]});
  }
  if(P.job&&a>=23&&a<=50&&r()<0.04){
    const gBaru=Math.round(P.job.g*2.2);
    ask({title:'TAWARAN KERJA LUAR NEGERI',text:'Sebuah perusahaan menawarkan posisi di luar negeri, gaji '+rp(Math.round(gBaru/12))+'/bulan. Tapi jauh dari keluarga dan tanah air.',opts:[
      {t:'Ambil, merantau jauh',e:()=>{if(!P.job)return;P.job.g=gBaru;P.pernahRantau=true;P.st.relasi=clamp(P.st.relasi-12,0,100);if(P.kids.length)P.dekatAnak=clamp(P.dekatAnak-10,0,100);addLog('Anda terbang ke negeri orang. Gaji berlipat, tapi rindu kampung halaman menemani tiap malam.'+fx({happy:+4,stress:+6}),'good');}},
      {t:'Tolak, tetap dekat keluarga',e:()=>addLog('Anda memilih keluarga di atas gaji besar. Tidak semua paham, tapi hati Anda tenang.'+fx({happy:+3,stress:-3}))}
    ]});
  }
  /* ---- DRAMA KELUARGA ---- */
  if(P.love&&P.love.married&&a>=28&&P.love.rel<48&&r()<0.05){
    const nm=P.love.nama.split(' ')[0];
    ask({title:'PASANGAN BERUBAH',text:'Belakangan '+nm+' sering pulang malam, HP selalu ditelungkupkan. Firasat Anda tak enak.',opts:[
      {t:'Selidiki diam-diam',e:()=>{
        if(r()<0.6){
          P.love.rel=clamp(P.love.rel-35,0,100);
          addLog('Benar saja — '+nm+' berselingkuh. Dunia Anda runtuh seketika.'+fx({happy:-18,stress:+15}),'bad');
          ask({title:'PENGKHIANATAN TERBONGKAR',text:nm+' akhirnya mengakui semuanya. Mau bagaimana?',opts:[
            {t:'Ceraikan sekarang juga',e:()=>cerai()},
            {t:'Beri kesempatan, perbaiki',e:()=>{ if(r()<0.4){P.love.rel=clamp(P.love.rel+25,0,100);addLog('Lewat air mata dan konseling panjang, kalian mencoba membangun ulang kepercayaan.'+fx({stress:+6}));}
              else addLog('Luka itu terlalu dalam. Hubungan jalan di tempat, dingin dan penuh curiga.'+fx({happy:-6,stress:+6}),'bad'); }}
          ]});
        } else addLog('Ternyata '+nm+' cuma sibuk lembur proyek. Anda lega sekaligus malu pada kecurigaan sendiri.'+fx({stress:-2}));
      }},
      {t:'Ajak bicara baik-baik',e:()=>{P.love.rel=clamp(P.love.rel+6,0,100);addLog('Kalian duduk dan bicara jujur. Ada jarak yang selama ini didiamkan, kini mulai dijembatani.'+fx({happy:+3,stress:-2}),'good');}}
    ]});
  }
  if(P.love&&P.love.married&&P.love.sifat.k==='posesif'&&P.love.rel<40&&a>=24&&!P.kdrt&&r()<0.06){
    P.kdrt=true;
    const nm=P.love.nama.split(' ')[0];
    ask({title:'RUMAH YANG TAK AMAN',text:'Pertengkaran dengan '+nm+' berubah jadi kekerasan. Rumah yang seharusnya tempat pulang kini terasa mencekam.',opts:[
      {t:'Cari bantuan & ambil jarak',e:()=>{addLog('Anda memberanikan diri mencari bantuan dan mengambil langkah berpisah. Berat, tapi Anda memilih keselamatan diri.'+fx({happy:-8,stress:+6,health:-4}),'bad');cerai();}},
      {t:'Bertahan, pendam sendiri',e:()=>{P.love.rel=clamp(P.love.rel-5,0,100);addLog('Anda memilih bertahan dan memendam semuanya. Luka itu menumpuk dalam diam.'+fx({happy:-12,stress:+12,health:-6}),'bad');}}
    ]});
  }
  if(P.selingkuh&&!P.anakRahasia&&a>=30&&r()<0.05){
    P.anakRahasia=true;
    ask({title:'MASA LALU MENGETUK PINTU',text:'Seseorang datang membawa kabar mengejutkan: ada anak hasil hubungan gelap Anda dulu, dan ia butuh tanggung jawab.',opts:[
      {t:'Akui & tanggung nafkahnya',e:()=>{P.nafkah={per:18e6,sisa:ri(8,15)};addLog('Anda mengakui dan menafkahi anak itu. Beban finansial dan batin, tapi Anda memilih bertanggung jawab.'+fx({happy:-4,stress:+8}));
        if(P.love&&P.love.married){const pn=P.love.nama.split(' ')[0];P.love.rel=clamp(P.love.rel-30,0,100);addLog(pn+' mengetahui semuanya. Kepercayaan retak parah.'+fx({stress:+8}),'bad');}}},
      {t:'Tutup rapat, sangkal',e:()=>{addLog('Anda menyangkal dan menutup pintu rapat-rapat. Aman sesaat, tapi bayang-bayang rasa bersalah ikut ke mana-mana.'+fx({stress:+10,happy:-6}),'bad');}}
    ]});
  }
  if((!P.ortu.ayah||!P.ortu.ibu)&&a>=30&&!P.sengketaWaris&&r()<0.05){
    P.sengketaWaris=true;
    const nilai=ri(80,400)*1e6;
    ask({title:'SENGKETA WARISAN',text:'Tanah dan rumah peninggalan orang tua jadi rebutan. Saudara Anda mengklaim bagian lebih besar. Nilai yang dipersengketakan sekitar '+rp(nilai)+'.',opts:[
      {t:'Tempuh jalur hukum',sub:'Bayar pengacara · bisa menang besar',cond:()=>P.money>=15e6,e:()=>{P.money-=15e6;
        if(r()<0.5){P.money+=nilai;addLog('Pengadilan memenangkan Anda. Bagian '+rp(nilai)+' jatuh ke tangan Anda, tapi hubungan dengan saudara putus.'+fx({happy:-4,stress:+6,relasi:-8}),'good');}
        else addLog('Anda kalah di pengadilan. Biaya pengacara hangus dan tali persaudaraan ikut putus.'+fx({happy:-8,stress:+8,relasi:-8}),'bad');}},
      {t:'Mengalah demi kerukunan',e:()=>{const dapat=Math.round(nilai*0.3);P.money+=dapat;addLog('Anda memilih mengalah, hanya menerima '+rp(dapat)+', tapi hubungan keluarga tetap hangat.'+fx({happy:+4,relasi:+4,stress:-2}),'good');}},
      {t:'Rebut dengan segala cara',e:()=>{ if(r()<0.55){P.money+=Math.round(nilai*1.2);addLog('Anda menguasai hampir seluruh warisan dengan tekanan dan akal. Kaya, tapi dibenci seluruh keluarga besar.'+fx({happy:-6,relasi:-15}),'bad');}
        else addLog('Manuver Anda gagal dan memicu permusuhan terbuka. Tidak dapat apa-apa selain cap "perebut harta".'+fx({happy:-8,stress:+8,relasi:-15}),'bad'); }}
    ]});
  }
  for(const k of P.kids){
    const ua=a-k.lahirAt;
    if(ua>=13&&ua<=22&&!k.bermasalah&&(k.didik||40)<48&&r()<0.07){
      k.bermasalah=true;
      ask({title:k.nama.toUpperCase()+' TERSANDUNG MASALAH',text:k.nama+' ('+ua+' th) terlibat masalah: '+pick(['tawuran & terancam dikeluarkan sekolah','utang judi online','terjerat pergaulan narkoba','kabur dari rumah ikut pacar'])+'. Sebagai orang tua, apa langkah Anda?',opts:[
        {t:'Dampingi & rehabilitasi sepenuh hati',sub:'Rp 25 jt · waktu & perhatian',cond:()=>P.money>=25e6,e:()=>{P.money-=25e6;
          if(r()<0.6+P.dekatAnak/300){k.bermasalah=false;k.didik=clamp((k.didik||40)+15,0,100);P.dekatAnak=clamp(P.dekatAnak+6,0,100);addLog('Dengan kesabaran dan pendampingan, '+k.nama+' perlahan kembali ke jalur. Lega luar biasa.'+fx({happy:+6,stress:+4}),'good');}
          else addLog('Anda sudah berusaha keras, tapi '+k.nama+' masih bergulat dengan masalahnya. Butuh waktu lebih panjang.'+fx({happy:-6,stress:+8}),'bad');}},
        {t:'Marahi keras & batasi',e:()=>{P.dekatAnak=clamp(P.dekatAnak-10,0,100);
          if(r()<0.4){k.bermasalah=false;addLog('Ketegasan Anda membuat '+k.nama+' jera, meski hubungan jadi berjarak.'+fx({stress:+5}));}
          else addLog(k.nama+' makin memberontak dan menjauh. Rumah jadi medan perang dingin.'+fx({happy:-10,stress:+10}),'bad');}},
        {t:'Biarkan, sibuk urusan sendiri',e:()=>{P.dekatAnak=clamp(P.dekatAnak-15,0,100);k.didik=clamp((k.didik||40)-10,0,100);addLog('Anda terlalu sibuk untuk menangani. Masalah '+k.nama+' membesar tanpa pegangan.'+fx({happy:-12,stress:+8}),'bad');}}
      ]});
      break;
    }
  }
  /* ---- CABANG HIDUP BARU ---- */
  /* banjir besar melanda rumah */
  if(a>=23&&P.aset.some(x=>x.k==='rumah'||x.k==='vila')&&r()<0.04){
    ask({title:'BANJIR BESAR',text:'Hujan berhari-hari tanpa jeda — rumah Anda terendam sepaha. Perabot rusak, dinding lembap, keluarga mengungsi ke tempat saudara.',opts:[
      {t:'Renovasi & tinggikan rumah',sub:rp(40e6)+' · beres jangka panjang',cond:()=>P.money>=40e6,e:()=>{P.money-=40e6;
        addLog('Rumah ditinggikan dan diperbaiki total. Banjir berikutnya cuma numpang lewat di depan pagar.'+fx({stress:+4,happy:+3}),'good');}},
      {t:'Perbaiki seadanya',sub:rp(8e6),cond:()=>P.money>=8e6,e:()=>{P.money-=8e6;
        addLog('Anda menambal yang rusak seperlunya. Setiap mendung datang, jantung ikut deg-degan.'+fx({stress:+6,health:-3,happy:-4}),'bad');}},
      {t:'Kerja bakti bareng warga, tanpa renovasi',e:()=>addLog('Anda dan tetangga bahu-membahu membersihkan lumpur. Kerugian tetap ada, tapi guyubnya dapat.'+fx({money:-4e6,relasi:+6,health:-2}))}
    ]});
  }
  /* mafia tanah mengincar aset */
  if(!P.mafiaTanah&&a>=30&&P.aset.some(x=>x.k==='tanah')&&r()<0.04){
    P.mafiaTanah=true;
    const tnh=P.aset.find(x=>x.k==='tanah');
    ask({title:'MAFIA TANAH',text:'Seseorang mengklaim tanah Anda dengan sertifikat ganda. Surat panggilan pengadilan datang ke rumah — modus mafia tanah klasik.',opts:[
      {t:'Lawan habis-habisan di pengadilan',sub:'Pengacara '+rp(25e6),cond:()=>P.money>=25e6,e:()=>{P.money-=25e6;
        if(r()<0.65)addLog('Setelah sidang panjang, sertifikat Anda dinyatakan sah dan sindikatnya justru jadi tersangka. Lega bukan main.'+fx({happy:+6,stress:+6,smart:+3}),'good');
        else {P.aset.splice(P.aset.indexOf(tnh),1);
          addLog('Hakim memenangkan pihak lawan — tanah Anda lepas secara "legal". Anda kalah oleh sindikat yang lebih licin.'+fx({happy:-12,stress:+10}),'bad');milestone('Kehilangan tanah ke mafia tanah');}}},
      {t:'Bayar "uang damai"',sub:rp(30e6),cond:()=>P.money>=30e6,e:()=>{P.money-=30e6;
        addLog('Anda membayar agar gugatan dicabut. Tanah aman, harga diri tergores, sindikat pindah ke korban lain.'+fx({stress:+5,happy:-4}),'bad');}},
      {t:'Abaikan panggilan sidang',e:()=>{ if(r()<0.5)addLog('Gugatan gugur — ternyata cuma gertakan untuk menakut-nakuti.'+fx({stress:+3}));
        else {P.aset.splice(P.aset.indexOf(tnh),1);
          addLog('Anda kalah verstek karena tak pernah hadir. Tanah berpindah tangan di atas kertas.'+fx({happy:-12,stress:+10}),'bad');milestone('Kehilangan tanah ke mafia tanah');}}}
    ]});
  }
  /* kecurangan di kantor — jadi pembongkar? */
  if(!P.whistleKantor&&P.job&&a>=25&&a<=55&&r()<0.035){
    P.whistleKantor=true;
    ask({title:'KECURANGAN DI KANTOR',text:'Anda tak sengaja menemukan bukti manipulasi anggaran oleh petinggi kantor. Nilainya miliaran, dan hanya Anda yang tahu.',opts:[
      {t:'Laporkan ke pihak berwenang',e:()=>{ if(r()<0.5){
          addLog('Kasus pecah, petinggi itu diproses hukum. Anda dipuji sebagai pembongkar — kantor segan, tidur Anda nyenyak.'+fx({happy:+6,smart:+3,relasi:+4,stress:+6}),'good');milestone('Membongkar kecurangan kantor');}
        else {P.job=null;
          addLog('Laporan Anda "dibelokkan". Posisi Anda yang justru dihabisi — dipecat dengan alasan efisiensi.'+fx({happy:-10,stress:+12}),'bad');milestone('Dipecat karena membongkar kecurangan');}}},
      {t:'Diam, amankan posisi',e:()=>addLog('Anda menutup mata. Gaji tetap mengalir, tapi tiap rapat dengan petinggi itu rasanya getir.'+fx({stress:+5,happy:-3}))},
      {t:'Minta "jatah tutup mulut"',e:()=>{const x=ri(15,40)*1e6;
        addLog('Anda justru ikut bermain. '+rp(x)+' masuk rekening, nurani Anda yang membayar bunganya.'+fx({money:x,stress:+7,happy:-4}),'bad');}}
    ]});
  }
  /* memberangkatkan umroh orang tua */
  if(!P.umrohOrtu&&(P.ortu.ayah||P.ortu.ibu)&&a>=28&&P.money>=70e6&&r()<0.05){
    ask({title:'UMROH ORANG TUA',text:'Usia orang tua terus bertambah. Terbersit keinginan memberangkatkan mereka umroh selagi masih kuat berjalan.',opts:[
      {t:'Berangkatkan tahun ini',sub:rp(60e6),e:()=>{P.money-=60e6;P.umrohOrtu=true;
        addLog('Anda melepas orang tua di bandara. Mereka memeluk Anda lama sekali — tak ada hadiah yang lebih besar dari ini.'+fx({happy:+12,stress:-6}),'good');
        stamp('UMROH ORTU','green');milestone('Memberangkatkan umroh orang tua');}},
      {t:'Tunda, dana untuk kebutuhan lain',e:()=>addLog('Anda menunda niat itu. Semoga umur dan rezeki masih berjodoh.'+fx({stress:+2}))}
    ]});
  }
  /* reuni akbar sekolah */
  if(a>=28&&a<=55&&r()<0.05){
    ask({title:'REUNI AKBAR',text:'Grup alumni mendadak ramai: reuni akbar angkatan digelar bulan depan. Datang atau tidak?',opts:[
      {t:'Datang',e:()=>{ const z=r();
        if(z<0.4){const x=ri(10,30)*1e6;
          addLog('Obrolan reuni berbuah: teman lama mengajak kerja sama kecil-kecilan yang ternyata jalan.'+fx({money:x,relasi:+6,happy:+5}),'good');}
        else if(z<0.65)addLog('Melihat teman-teman yang "sudah jadi orang", Anda pulang membawa nostalgia bercampur minder.'+fx({happy:-3,stress:+3,relasi:+3}));
        else addLog('Tawa pecah sepanjang malam mengenang masa sekolah. Hati hangat sampai berminggu-minggu.'+fx({happy:+6,stress:-4,relasi:+4}),'good');}},
      {t:'Tidak usah',e:()=>addLog('Anda memilih di rumah. Foto-foto reuni lewat di linimasa, sesekali bikin senyum.'+fx({stress:-1}))}
    ]});
  }
  /* anak dewasa minta modal usaha */
  const anakDws=P.kids.find(k=>a-k.lahirAt>=22&&a-k.lahirAt<=30&&!k.modalUsaha);
  if(anakDws&&r()<0.06){
    anakDws.modalUsaha=true;
    ask({title:anakDws.nama.toUpperCase()+' MINTA MODAL',text:anakDws.nama+' datang dengan wajah serius: ingin membuka usaha sendiri dan minta modal '+rp(50e6)+'.',opts:[
      {t:'Modali penuh',sub:rp(50e6),cond:()=>P.money>=50e6,e:()=>{P.money-=50e6;
        if(r()<0.4+(anakDws.didik||40)/200){P.dekatAnak=clamp(P.dekatAnak+8,0,100);
          addLog('Usaha '+anakDws.nama+' tumbuh sehat. Ia kini berdiri di kakinya sendiri — dan tak pernah lupa siapa yang memodali.'+fx({happy:+8}),'good');}
        else addLog('Usaha '+anakDws.nama+' tumbang di tahun pertama. Uang hilang, tapi ia belajar mahal — dan Anda tetap memeluknya.'+fx({happy:-4,stress:+4}),'bad');}},
      {t:'Modali separuh + ikut membimbing',sub:rp(25e6),cond:()=>P.money>=25e6,e:()=>{P.money-=25e6;P.dekatAnak=clamp(P.dekatAnak+4,0,100);
        addLog('Anda memodali separuh sambil ikut mengawasi pembukuan. Usahanya merangkak pelan tapi sehat.'+fx({happy:+5,stress:+3}),'good');}},
      {t:'Suruh kerja & menabung dulu',e:()=>{P.dekatAnak=clamp(P.dekatAnak-5,0,100);
        addLog('"Kerja dulu, kumpulkan jam terbang." '+anakDws.nama+' kecewa, walau mungkin kelak ia paham.'+fx({happy:-2}));}}
    ]});
  }
  /* rekening dibobol */
  if(a>=20&&P.money>=15e6&&r()<0.035){
    const x=Math.min(ri(5,25)*1e6,P.money);   /* yang raib tak melebihi saldo yang ada */
    ask({title:'REKENING DIBOBOL',text:'Anda terlanjur mengklik tautan palsu — m-banking dibobol, '+rp(x)+' raib dalam semalam.',opts:[
      {t:'Lapor polisi & blokir semua akun',e:()=>{ if(r()<0.45){const back=Math.round(x*0.7);
          addLog('Bank dan polisi bergerak cepat — '+rp(back)+' berhasil dibekukan dan kembali. Sisanya jadi biaya pelajaran.'+fx({money:-(x-back),stress:+5,smart:+3}));}
        else addLog('Laporan diproses, tapi uangnya sudah berpindah lewat puluhan rekening. Hilang.'+fx({money:-x,stress:+8,happy:-5,smart:+3}),'bad');}},
      {t:'Ikhlaskan, ganti semua kata sandi',e:()=>addLog('Anda mengikhlaskan dan memperketat semua akun. Mahal, tapi tak terulang.'+fx({money:-x,happy:-4,smart:+2}),'bad')}
    ]});
  }
  /* dicalonkan jadi ketua RT */
  if(!P.ketuaRT&&a>=35&&a<=60&&P.aset.some(x=>x.k==='rumah')&&P.st.relasi>=45&&r()<0.04){
    ask({title:'DICALONKAN JADI KETUA RT',text:'Warga sepakat mencalonkan Anda jadi Ketua RT. "Yang muda yang jujur," kata mereka sambil menyodorkan formulir.',opts:[
      {t:'Terima amanah',e:()=>{P.ketuaRT=true;
        addLog('Anda resmi jadi Ketua RT. Hidup kini berisi rapat warga, surat pengantar, dan keluhan saluran air — tapi nama Anda harum satu kampung.'+fx({relasi:+10,charm:+3,stress:+5,happy:+3}),'good');milestone('Jadi Ketua RT');}},
      {t:'Tolak halus',e:()=>addLog('Anda menolak dengan alasan kesibukan. Warga memaklumi, sebagian menggerutu.'+fx({relasi:-3}))}
    ]});
  }
  /* musibah kebakaran tempat usaha */
  if(P.biz.length&&r()<0.025){
    const bz=pick(P.biz);
    const rugi=Math.round(bz.modal*0.35);
    ask({title:'KEBAKARAN DI '+bz.nama.toUpperCase(),text:'Korsleting listrik — tempat usaha '+bz.nama+' terbakar sebagian. Kerugian ditaksir '+rp(rugi)+'.',opts:[
      {t:'Bangun ulang lebih baik',sub:rp(rugi),cond:()=>P.money>=rugi,e:()=>{P.money-=rugi;bz.hype=(bz.hype||0)+1;
        addLog('Anda merenovasi total. Pelanggan lama kembali, tempat baru malah lebih ramai dari sebelumnya.'+fx({stress:+6,happy:+3}),'good');}},
      {t:'Perbaiki seperlunya',e:()=>{P.money-=Math.round(rugi*0.4);bz.level=Math.max(1,bz.level-1);
        addLog('Anda menambal seadanya. Usaha jalan lagi, tapi kapasitasnya turun.'+fx({stress:+5,happy:-3}),'bad');}},
      {t:'Tutup usaha ini',e:()=>{const nilai=Math.round(bizValue(bz)*0.5);P.money+=nilai;P.biz.splice(P.biz.indexOf(bz),1);
        addLog('Anda menjual sisa aset '+bz.nama+' senilai '+rp(nilai)+' dan menutup babak itu.'+fx({happy:-6,stress:-3}));milestone('Usaha '+bz.nama+' tutup karena kebakaran');}}
    ]});
  }
  /* ---- HARI TUA ---- */
  if(a>=60&&r()<0.3){
    if(P.cucu>0&&r()<0.5)addLog('Cucu Anda datang menginap. Rumah ramai lagi seperti dulu.'+fx({happy:+8}),'good');
    else addLog(pick(['Anda menyiram tanaman tiap pagi sambil menyapa tetangga','Anda membuka album foto lama dan tersenyum sendiri','Teman lama mampir, kalian tertawa mengenang masa muda'])+'.'+fx({happy:+5,stress:-3}));
  }
}

/* ================= TUGAS DINAS PER PROFESI ================= */
function dinasEvent(b){
  function naik(){ if(!P.job)return; if(P.job.level<4&&r()<0.5){ P.job.level++; P.job.g=Math.round(P.job.g*1.3);
    addLog('Anda naik pangkat menjadi <b>'+PANGKAT[b][P.job.level]+'</b>!'+fx({happy:+6,stress:+4}),'good'); milestone('Naik pangkat: '+PANGKAT[b][P.job.level]); } }
  const pools={
    polisi:[
      ()=>ask({title:'OPERASI DI LAPANGAN',text:'Saat razia, seorang pengusaha menyelipkan amplop agar masalahnya "beres".',opts:[
        {t:'Tolak & tindak sesuai aturan',e:()=>addLog('Anda menolak suap dan bertindak sesuai aturan. Integritas terjaga.'+fx({happy:+3,relasi:+1}),'good')},
        {t:'Terima amplopnya',e:()=>addLog('Amplop masuk kantong. Sedikit uang, sedikit nurani tergerus.'+fx({money:+ri(3,12)*1e6,stress:+3,happy:-2}),'bad')}
      ]}),
      ()=>{addLog('Anda berhasil mengungkap kasus besar. Nama Anda dipuji atasan.'+fx({happy:+5,smart:+2}),'good');naik();},
      ()=>ask({title:'BAKU TEMBAK',text:'Penggerebekan bandar narkoba berujung baku tembak.',opts:[
        {t:'Maju memimpin penangkapan',e:()=>{ if(r()<0.25)addLog('Anda tertembak saat bertugas, dirawat lama, tapi jadi pahlawan.'+fx({health:-18,happy:+4,stress:+8}),'bad'); else {addLog('Penggerebekan sukses tanpa korban di pihak Anda. Heroik!'+fx({happy:+7,stress:+5}),'good');naik();} }},
        {t:'Pimpin dari belakang',e:()=>addLog('Anda mengoordinasi dari jarak aman. Operasi tetap berhasil.'+fx({stress:+3}))}
      ]}),
      ()=>addLog('Anda mengamankan demo besar seharian. Lelah, panas, sempat dilempari.'+fx({health:-3,stress:+6}),'bad')
    ],
    tentara:[
      ()=>ask({title:'PENUGASAN OPERASI',text:'Anda ditugaskan ke daerah operasi perbatasan berbulan-bulan. Jauh dari keluarga, tunjangan besar.',opts:[
        {t:'Berangkat tugas',e:()=>{P.money+=ri(20,50)*1e6;if(P.kids.length)P.dekatAnak=clamp(P.dekatAnak-6,0,100);if(P.love)P.love.rel=clamp(P.love.rel-4,0,100);addLog('Anda berangkat ke medan tugas. Pulang membawa tunjangan dan rindu yang menumpuk.'+fx({stress:+6,health:-3}),'sys');naik();}},
        {t:'Minta penangguhan demi keluarga',e:()=>addLog('Anda minta ditunda demi keluarga. Atasan mencatat, karier sedikit melambat.'+fx({happy:+2}))}
      ]}),
      ()=>{addLog('Anda terpilih ikut misi perdamaian PBB di luar negeri. Bangga dan berpenghasilan.'+fx({money:+ri(40,90)*1e6,charm:+3,happy:+5,stress:+4}),'good');naik();},
      ()=>addLog('Latihan tempur berat menguras fisik, tapi tubuh makin tangguh.'+fx({health:+4,stress:+4})),
      ()=>addLog('Anda dikerahkan membantu korban bencana. Warga berterima kasih dengan air mata.'+fx({happy:+6,health:-2,relasi:+3}),'good')
    ],
    intel:[
      ()=>ask({title:'MISI PENYAMARAN',text:'Anda ditugaskan menyamar menyusup jaringan berbahaya.',opts:[
        {t:'Jalankan misi',e:()=>{ if(r()<0.2)addLog('Penyamaran Anda nyaris terbongkar. Lolos tipis, tapi trauma membekas.'+fx({stress:+12,health:-5}),'bad'); else {addLog('Misi penyamaran sukses. Informasi penting diraih, bonus rahasia cair.'+fx({money:+ri(20,60)*1e6,smart:+3,stress:+6}),'good');naik();} }},
        {t:'Tolak, terlalu berisiko',e:()=>addLog('Anda menolak misi. Atasan kecewa diam-diam.'+fx({stress:+2}))}
      ]}),
      ()=>addLog('Anda merekrut informan kunci. Jaringan intelijen Anda meluas.'+fx({smart:+2,relasi:+2,money:+ri(5,15)*1e6})),
      ()=>addLog('Identitas asli Anda hampir bocor ke pihak asing. Hidup ganda memang melelahkan.'+fx({stress:+10,happy:-3}),'bad'),
      ()=>{addLog('Operasi rahasia Anda menyelamatkan rencana besar negara. Tak ada medali, hanya kepuasan yang diam.'+fx({happy:+4}),'good');naik();}
    ],
    pns:[
      ()=>ask({title:'PROYEK PENGADAAN',text:'Anda memegang proyek. Rekanan menawarkan "fee" jika tendernya dimuluskan.',opts:[
        {t:'Tolak, jaga integritas',e:()=>addLog('Anda menjalankan tender bersih. Tidur Anda nyenyak.'+fx({happy:+2}),'good')},
        {t:'Terima fee',e:()=>addLog('Fee proyek masuk rekening. Rumah Anda diam-diam membesar.'+fx({money:+ri(10,40)*1e6,stress:+4,happy:-2}),'bad')}
      ]}),
      ()=>addLog('Perjalanan dinas (SPPD) datang beruntun. Lumayan buat tambah-tambah.'+fx({money:+ri(3,10)*1e6,stress:-2})),
      ()=>{addLog('Kinerja Anda dinilai baik dalam evaluasi tahunan.'+fx({happy:+3}));naik();},
      ()=>addLog('Anda dimutasi ke unit baru. Adaptasi lagi dari awal.'+fx({stress:+5}))
    ],
    pilot:[
      ()=>addLog('Jam terbang padat lintas benua. Gaji dolar mengalir, jet lag tak kenal ampun.'+fx({money:+ri(15,40)*1e6,health:-2,stress:+4})),
      ()=>ask({title:'CUACA BURUK',text:'Pesawat Anda masuk turbulensi parah di atas samudra.',opts:[
        {t:'Kendalikan dengan tenang',e:()=>{ if(r()<0.85){addLog('Anda mendaratkan pesawat dengan selamat. Penumpang bertepuk tangan.'+fx({happy:+6,stress:+5}),'good');naik();} else addLog('Pendaratan darurat menegangkan, ada cedera ringan. Investigasi berjalan.'+fx({stress:+12,happy:-4}),'bad'); }}
      ]}),
      ()=>addLog('Layover beberapa hari di kota indah luar negeri. Sejenak melupakan penat.'+fx({happy:+6,stress:-5}))
    ],
    pelaut:[
      ()=>{addLog('Anda berlayar berbulan-bulan. Gaji dolar terkumpul, tapi rindu daratan menyiksa.'+fx({money:+ri(20,50)*1e6,stress:+6,happy:-3}));if(P.love)P.love.rel=clamp(P.love.rel-5,0,100);if(P.kids.length)P.dekatAnak=clamp(P.dekatAnak-6,0,100);},
      ()=>ask({title:'BADAI DI LAUT',text:'Kapal Anda dihantam badai besar.',opts:[
        {t:'Sigap mengamankan kapal',e:()=>{ if(r()<0.8){addLog('Kapal selamat berkat kesigapan kru. Nakhoda memuji Anda.'+fx({happy:+4,stress:+6}),'good');naik();} else addLog('Badai melukai Anda dan sebagian kru. Untung nyawa selamat.'+fx({health:-12,stress:+8}),'bad'); }}
      ]}),
      ()=>addLog('Kapal berlabuh di pelabuhan asing. Anda menjelajah kota baru sejenak.'+fx({happy:+5,charm:+2}))
    ],
    damkar:[
      ()=>ask({title:'KEBAKARAN BESAR',text:'Si jago merah melahap permukiman padat. Ada warga terjebak di lantai atas.',opts:[
        {t:'Masuk menyelamatkan warga',e:()=>{ if(r()<0.3)addLog('Anda terluka kena reruntuhan, tapi berhasil menyelamatkan nyawa. Pahlawan.'+fx({health:-14,happy:+8,relasi:+3}),'bad'); else {addLog('Anda menggendong keluar warga yang terjebak. Tepuk tangan pecah.'+fx({happy:+8,stress:+5}),'good');naik();} }},
        {t:'Padamkan dari luar saja',e:()=>addLog('Anda fokus memadamkan dari luar. Aman, meski ada yang menyayangkan.'+fx({stress:+3}))}
      ]}),
      ()=>addLog('Evakuasi banjir dan pohon tumbang sepanjang musim hujan. Lelah tapi dibutuhkan.'+fx({health:-2,stress:+4,relasi:+2})),
      ()=>addLog('Panggilan darurat ternyata cuma kucing di atap. Tetap dijalani dengan senyum.'+fx({happy:+2}))
    ]
  };
  const pool=pools[b]; if(pool)pick(pool)();
}

/* ================= KEHIDUPAN POLITIK ================= */
function politikEvent(){
  if(!P.politik)return;
  const t=PJAB[P.politik.idx];
  P.politik.thn++;
  /* korupsi tercium */
  if(P.korup>=40&&r()<P.korup/180){
    ask({title:'KASUS KORUPSI TERCIUM',text:'Aparat penegak hukum mulai mengendus aliran dana di masa jabatan Anda sebagai '+t.n+'.',opts:[
      {t:'Suap penyidik & main aman',sub:'Rp 100 jt',cond:()=>P.money>=100e6,e:()=>{P.money-=100e6;P.korup=clamp(P.korup-25,0,100);
        addLog('Kasus "menguap" setelah amplop tebal berpindah tangan. Aman, untuk sekarang.'+fx({stress:+8,happy:-3}),'bad');}},
      {t:'Hadapi pemeriksaan',e:()=>{
        if(r()<0.5+P.st.charm/300-P.korup/200){
          P.korup=clamp(P.korup-30,0,100); P.pamor=clamp(P.pamor-15,0,100);
          addLog('Anda lolos dari jerat hukum karena bukti dianggap kurang. Tapi nama Anda tercoreng di publik.'+fx({stress:+10,happy:-4}),'bad');
        } else {
          const denda=Math.min(Math.max(P.money,0),Math.round(P.korupTotal*0.8));
          P.money-=denda; const jn=t.n; P.politik=null; P.pamor=clamp(P.pamor-40,0,100); P.korup=0;
          addLog('Anda terbukti korupsi. Jabatan '+jn+' dicopot, harta '+rp(denda)+' disita, nama hancur di mata publik.'+fx({happy:-20,stress:+20}),'bad');
          stamp('TERSANGKA KORUPSI'); milestone('Tersandung korupsi, lengser dari '+jn);
        }
      }}
    ]});
    return;
  }
  /* pemilihan ulang kalau sudah lama menjabat */
  if(P.politik.thn>=5&&P.politik.idx>=1){
    P.politik.thn=0;
    if(P.pamor>=45||r()<0.4){ addLog('Masa jabatan '+t.n+' berakhir, dan Anda terpilih kembali untuk periode baru.'+fx({happy:+5}),'good'); P.pamor=clamp(P.pamor+3,0,100); }
    else { const jn=t.n; P.politik=null; addLog('Pemilihan ulang '+jn+' kali ini Anda kalah — pamor merosot. Anda kembali jadi warga biasa.'+fx({happy:-10,stress:+8}),'bad'); milestone('Kalah pemilihan ulang '+jn); }
    return;
  }
  const pool=[
    ()=>ask({title:'KELUHAN WARGA',text:'Warga mengeluh: jalan rusak dan drainase mampet di wilayah Anda.',opts:[
      {t:'Perbaiki cepat (dana pribadi)',sub:'Rp 15 jt',cond:()=>P.money>=15e6,e:()=>{P.money-=15e6;P.pamor=clamp(P.pamor+8,0,100);addLog('Perbaikan beres. Warga memuji Anda turun tangan cepat.'+fx({happy:+3,relasi:+2}),'good');}},
      {t:'Janjikan "nanti dianggarkan"',e:()=>{P.pamor=clamp(P.pamor-6,0,100);addLog('Anda menjawab dengan janji klasik. Warga mulai sangsi.'+fx({stress:+2}),'bad');}}
    ]}),
    ()=>{ if(P.pamor>=65){P.pamor=clamp(P.pamor+4,0,100);addLog('Program Anda dipuji dan diliput media lokal. Popularitas menanjak.'+fx({charm:+3,happy:+4}),'good');}
      else {P.pamor=clamp(P.pamor-5,0,100);addLog('Sekelompok warga berdemo menuntut Anda lebih becus. Spanduk protes terpampang di kantor.'+fx({stress:+8,happy:-5}),'bad');} },
    ()=>ask({title:'AMPLOP PENGUSAHA',text:'Pengusaha lokal ingin izin/proyeknya dimuluskan, menyodorkan "tanda terima kasih".',opts:[
      {t:'Tolak demi nama baik',e:()=>{P.pamor=clamp(P.pamor+3,0,100);addLog('Anda menolak. Integritas Anda jadi buah bibir baik di warung kopi.'+fx({happy:+2}),'good');}},
      {t:'Terima diam-diam',e:()=>{const x=ri(15,50)*1e6;P.money+=x;P.korup=clamp(P.korup+12,0,100);P.korupTotal+=x;addLog('Amplop '+rp(x)+' Anda terima. Mudah, tapi utang nurani bertambah.'+fx({stress:+5}),'bad');}}
    ]}),
    ()=>addLog('Anda sibuk menghadiri kondangan, melayat, dan rapat warga tiada habis. Lelah sosial yang nyata.'+fx({stress:+5,relasi:+3,charm:+1}))
  ];
  pick(pool)();
}

