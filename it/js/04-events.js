'use strict';
/* ================= EVENT TAHUNAN ================= */
function events(){
  const s=P.st;
  cekPromosi();
  /* === penegakan hukum siber (analog OTT) === */
  razia();
  if(P.penjara>0||G.over)return;

  /* === MASIH MENGANGGUR: tiap tahun kembali mencoba melamar === */
  if(P.menganggur&&!P.retired&&!P.dipecat)cariKerja();
  /* === SOFTWARE HOUSE: kejadian dengan klien (03d-usaha.js) === */
  kejadianSH();

  /* === GELOMBANG AI: skill bisa usang (baru relevan sejak era LLM, 2023+) === */
  if(N.tahun>=2023&&N.tren&&N.tren.indexOf('AI')>=0&&!P.pelatihanAI&&r()<0.3){
    ask({title:'GELOMBANG AI MENERJANG',text:'Tools AI menulis kode, mengotomasi ops, dan manajemen bertanya "apakah peran ini masih perlu?". Cara Anda merespons menentukan relevansi Anda.',opts:[
      {t:'Belajar & adopsi AI ke alur kerja',sub:'Naikkan nilai, jadi lebih produktif',e:()=>{P.pelatihanAI=true;ach('antiAI');
        addLog('Anda memeluk gelombang itu: pakai AI sebagai pengganda tenaga, bukan ancaman. Output Anda melonjak.'+fx({ngoding:+5,sistem:+3,reputasi:+4}),'good');leg(2,2);}},
      {t:'Abaikan, "cuma hype sesaat"',e:()=>{addLog('Anda menutup mata. Setahun-dua tahun lagi, lowongan minta skill yang tak Anda punya.'+fx({reputasi:-3}),'bad');leg(0,-2);}}
    ]});
  }
  /* === DIBAJAK PERUSAHAAN (headhunt) — sering loncat = "flight risk", tawaran menyusut. Founder tidak di-headhunt.
     Kenaikan gaji bersifat PERMANEN (P.gajiAdj); tempat baru tak boleh menurunkan gaji tahunan. === */
  if(kerjaAktif()&&!P.founder&&P.reputasi>=40&&!P.evCounterOffer&&r()<((N.pasar==='boom'?0.22:0.1)*((P.jobHops||0)>=3?0.5:1))){
    const lama=gajiTahun(), pct=(0.2+r()*0.3)*((P.jobHops||0)>=3?0.7:1), naik=Math.round(lama*pct);
    ask({title:'DI-HEADHUNT',text:'Seorang recruiter menawarkan posisi serupa di tempat lain dengan gaji +'+rp(naik)+'/tahun (±'+Math.round(pct*100)+'%). Pindah?',opts:[
      {t:'Ikut wawancara teknis, lalu pindah',sub:'Tawaran akhir tergantung hasil wawancara',e:()=>wawancaraTeknis('Recruiter menjadwalkan sesi teknis sebelum memberi tawaran resmi.',rs=>{
        if(rs<0.4){ addLog('Kamu tidak lolos wawancara teknis. Tawaran batal, kamu tetap di tempat lama.'+fx({stres:+3}),'bad'); return; }
        const p2=pct*(0.6+rs*0.6), target=Math.round(lama*(1+p2));
        const curX=(TEMPAT.find(t=>t.k===P.tempat)||{gajiX:0}).gajiX;
        let cand=TEMPAT.filter(t=>t.k!=='remote'&&t.k!==P.tempat&&t.gajiX>=curX);
        if(!cand.length)cand=TEMPAT.filter(t=>t.k!=='remote'&&t.k!==P.tempat);   /* gajiAdj di bawah yang mengompensasi */
        const tm=pick(cand); P.tempat=tm.k; P.tempatN=tm.n; P.tahunJab=Math.max(0,P.tahunJab-1); P.jobHops=(P.jobHops||0)+1; kondisiKantorBaru();
        P.gajiAdj=target/gajiTahun();   /* gaji baru = gaji lama + kenaikan yang disepakati */
        const bonus=Math.round(target/12*(rs>=0.8?1:0.5));   /* bonus tanda tangan kecil, sekali cair */
        if(tm.k==='startup'){P.ekuitas=(P.ekuitas||0)+esopBaru(0.3,0.8);P.startupSaham=true;}
        addLog('Anda menerima tawaran dan pindah ke <b>'+tm.n+'</b> dengan gaji '+rp(target)+'/tahun (+'+Math.round(p2*100)+'%) dan bonus tanda tangan. Lembaran (dan tumpukan teknologi) baru.'+fx({money:+bonus,stres:+5,reputasi:+2}),'good');milestone('Pindah kerja ke '+tm.n);leg(0,3);})},
      {t:'Bertahan & minta counter-offer',cond:()=>P.tempat!=='freelance',e:()=>{P.evCounterOffer=true;
        if(r()<0.6){const k=pct*0.6; P.gajiAdj=(P.gajiAdj||1)*(1+k); addLog('Manajemen menahan Anda dengan kenaikan gaji '+Math.round(k*100)+'% (±'+rp(Math.round(lama*k))+'/tahun, permanen).'+fx({reputasi:+1}),'good');leg(0,2);}
        else addLog('Counter-offer ditolak atasan. Anda bertahan dengan gaji lama dan sedikit kecewa.'+fx({stres:+3}),'sys');}},
      {t:'Tolak dengan sopan',e:()=>addLog('Anda berterima kasih pada recruiter dan menolak. Nomornya tetap disimpan, siapa tahu.'+fx({stres:-1}),'sys')}
    ]});
  }
  /* === LAYOFF saat winter (karyawan saja; founder & freelancer tak bisa "dirumahkan") === */
  if(punyaAtasan()&&N.pasar==='krisis'&&r()<0.16){
    const bln=Math.min(9,1+(P.tenure||0)), pesangon=Math.round(gajiTahun()/12*bln);   /* pesangon ikut masa kerja (PP 35/2021, disederhanakan) */
    addLog('<b>RESTRUKTURISASI.</b> Undangan video call 5 menit dari HR jam 8 pagi, kamera HR mati, naskah dibacakan cepat. Divisi Anda dirampingkan — Anda termasuk yang dirumahkan. Pesangon '+rp(pesangon)+' ('+bln+'× gaji bulanan sesuai masa kerja).'+fx({money:+pesangon,stres:+12,reputasi:-2}),'bad');
    milestone('Kena layoff'); leg(0,-2);
    cariKerja();   /* ekuitas startup yang belum vesting hangus di sini */
  }
  /* === AKUISISI STARTUP (exit) — hanya ekuitas startup tempat Anda MASIH bekerja === */
  if(P.startupSaham&&(P.ekuitas||0)>0&&kerjaAktif()&&!P.evAkuisisi&&r()<0.07){
    P.evAkuisisi=true;
    const cuan=P.ekuitas*ri(2,6); P.ekuitas=0; P.money+=cuan;
    addLog('<b>EXIT!</b> '+(P.founder?'Startup yang Anda dirikan':'Startup tempat Anda bekerja')+' diakuisisi raksasa teknologi. Ekuitas Anda dicairkan jadi '+rp(cuan)+'.'+fx({reputasi:+5}),'good');
    stamp('EXIT STARTUP','green'); milestone('Cuan dari exit startup'); ach('exit'); leg(1,8);
  }
  /* === MOONLIGHT: kerja dobel diam-diam (sekali seumur karier) === */
  if(punyaAtasan()&&!P.evMoonlight&&s.ngoding>=55&&P.heat<40&&r()<0.06){
    const u=ri(60,140)*1e6;
    ask({title:'TAWARAN KERJA DOBEL',text:'Sebuah perusahaan lain menawari kontrak penuh waktu juga — dua gaji sekaligus, asal tak ketahuan kantor utama.',opts:[
      {t:'Ambil, kerja dobel diam-diam',sub:'+'+rp(u)+'/th · risiko & lelah',e:()=>{P.evMoonlight=true;
        addLog('Dua laptop, dua standup, satu badan. Saldo gemuk, tidur kurus.'+fx({money:+u,stres:+12,kesehatan:-4}),'sys');leg(-1,3);
        if(r()<0.3){addLog('Kantor utama mencium kerja dobelmu. Anda ditegur keras, nyaris dipecat.'+fx({reputasi:-6,stres:+6,heat:+3}),'bad');}}},
      {t:'Tolak, fokus satu tempat',e:()=>addLog('Anda menolak demi waras dan integritas kontrak.'+fx({stres:-2,reputasi:+1}),'good')}
    ]});
  }
  /* === KONTRIBUSI OPEN SOURCE / KONFERENSI === */
  if(!P.retired&&s.ngoding>=50&&r()<0.12){
    if(r()<0.5){
      addLog('Proyek open source Anda dapat banyak bintang di GitHub dan dipakai perusahaan lain.'+fx({reputasi:+5,ngoding:+2}),'good');
      if(!P.openSource){P.openSource=true;milestone('Rilis proyek open source');}
      if(P.reputasi>=70)ach('ossLegend'); leg(3,1);
    } else {
      addLog('Anda jadi pembicara di konferensi teknologi. Nama Anda makin dikenal di komunitas.'+fx({reputasi:+4,soft:+2,stres:+2}),'good');leg(2,1);
    }
  }
  /* === MENTORING JUNIOR === */
  if(adaKantor()&&lvNow()>=3&&r()<0.14){
    P.mentorKali++;
    addLog('Anda membimbing engineer junior melewati bug pertamanya yang menakutkan. Ada kepuasan yang gaji tak bisa beli.'+fx({soft:+2,reputasi:+2,stres:-1}),'good');
    if(P.mentorKali>=5)ach('mentor'); leg(2,0);
  }
  /* === BURNOUT (stres tinggi ATAU on-call fatigue menumpuk) === */
  if(!P.retired&&(s.stres>=85||(P.lembur||0)>=85)&&r()<0.5){
    ask({title:'BURNOUT',text:'On-call tengah malam, sprint tanpa henti, layar yang tak pernah padam. Tubuh dan pikiran Anda menyerah serentak.',opts:[
      {t:'Ambil cuti panjang & pulihkan diri',sub:'Reset, meski karier sedikit melambat',e:()=>{P.burnoutKali++;P.lembur=clamp((P.lembur||0)-50,0,100);
        addLog('Anda rehat total: lepas laptop, tidur cukup, jauh dari grup chat kantor. Pelan-pelan pulih.'+fx({stres:-35,kesehatan:+8,reputasi:-1}),'good');ach('burnoutSurvivor');}},
      {t:'Paksakan terus, gas pol',e:()=>{P.burnoutKali++;
        addLog('Anda menelan lelah dan terus ngebut. Tubuh membalas tagihannya.'+fx({kesehatan:-14,stres:+4,reputasi:-2}),'bad');
        if(r()<0.3&&kerjaAktif()&&!P.founder){addLog('Anda kolaps di depan laptop dan terpaksa berhenti kerja.','bad');milestone('Berhenti kerja karena kolaps');cariKerja();}}}
    ]});
  }
  /* === KELUARGA & KESEHATAN === */
  if(!P.keluarga&&P.age>=27&&r()<0.22){ P.keluarga=true; addLog('Anda menikah. Ada alasan untuk menutup laptop tepat waktu (kadang).'+fx({stres:-5,kesehatan:+2}),'good'); milestone('Menikah'); }
  if(P.keluarga&&P.anak<3&&P.age<46&&r()<0.18){ P.anak++; addLog('Anak ke-'+P.anak+' lahir. Commit paling penting dalam hidup Anda.'+fx({stres:-2,kesehatan:-1}),'good'); }
  if(P.age>=45&&s.kesehatan<58&&r()<0.25){ const tg=kerjaAktif(), b=Math.round(ri(8,25)*1e6*(tg?0.3:1)); addLog('Gaya hidup duduk 12 jam & begadang menagih — Anda sempat dirawat. Biaya '+rp(b)+(tg?' (sisa setelah ditanggung BPJS/asuransi kantor)':'')+'.'+fx({money:-b,kesehatan:+6,stres:+3}),'bad'); }
  /* === SURVEI / KABAR INDUSTRI === */
  if(r()<0.4){
    const avg=Math.round((P.reputasi+uptimeRata())/2);
    addLog('Catatan tahunan: reputasi teknis '+P.reputasi+'/100, rata-rata uptime sistem '+uptimeRata()+'%. Tren panas tahun ini: <b>'+N.tren+'</b>.','sys');
    if(avg>=80&&P.reputasi>=78)ach('rajaUptime');
  }
  /* === KEHIDUPAN KANTOR, SATIR & LATAR (03b-teknis.js) === */
  eventsIT();
  /* === PENSIUN / FIRE (MRR ikut menopang kemandirian finansial) === */
  const kaya=P.money+P.saham+(P.saasMRR||0)*36>=15e9;
  if(!P.retired&&((P.age>=58)||(kaya&&P.age>=42&&r()<0.25))){
    P.retired=true;
    if(kaya&&P.age<58){ ach('fire'); addLog('Dengan portofolio yang cukup, Anda memutuskan <b>pensiun dini (FIRE)</b> di usia '+P.age+'. Cukup sudah on-call seumur hidup.'+fx({stres:-20}),'good'); stamp('FIRE','green'); milestone('Pensiun dini (FIRE)'); leg(1,4); }
    else { addLog('Di usia '+P.age+', Anda gantung keyboard. Generasi baru engineer mengambil alih pager Anda.'+fx({stres:-18}),'sys'); stamp('PENSIUN'); milestone('Pensiun dari dunia IT'); }
  }
}

/* mencari kerja setelah layoff/berhenti: selama belum diterima, P.menganggur = tanpa gaji, insiden, maupun urusan kantor */
function cariKerja(){
  const lagi=!!P.menganggur;
  if(!lagi)jadiMenganggur();
  ask({title:'MENCARI KERJA',text:(!P.pernahKerja?'Anda belum punya pekerjaan pertama.':'Anda '+(lagi?'masih':'kini')+' menganggur, tanpa gaji.')+' Pasar sedang '+(N.pasar==='krisis'?'beku':N.pasar==='boom'?'panas':'biasa')+'. Langkah berikutnya?',opts:[
    {t:'Sebar lamaran & tunggu panggilan',sub:'Yang memanggil bisa dipilih, lalu wawancara teknis',e:()=>panggilanWawancara()},
    {t:'Banting setir jadi freelance/konsultan',cond:()=>P.pernahKerja||P.st.ngoding>=45||P.st.sistem>=45,e:()=>{P.tempat='freelance';P.tempatN='Freelance / Konsultan';P.tahunJab=0;P.jobHops=(P.jobHops||0)+1;P.pernahKerja=true;kondisiKantorBaru();
      addLog('Anda jadi konsultan lepas: penghasilan naik-turun mengikuti proyek, tanpa atasan, tanpa penilaian kinerja.'+fx({stres:-2,reputasi:+1}),'sys');milestone('Jadi freelancer');}},
    {t:P.pernahKerja?'Rehat dulu, kuras tabungan':'Belum melamar tahun ini',e:()=>addLog(P.pernahKerja?'Anda memilih jeda setahun tanpa gaji. Tabungan menipis, tapi kepala lebih jernih.'+fx({stres:-8}):'Anda menunda melamar. Tetangga mulai bertanya, "Sekarang kerja di mana?"'+fx({stres:+2}),'sys')}
  ]});
}

/* ================= PENEGAKAN HUKUM SIBER ================= */
function razia(){
  if(P.penjara>0||G.over||P.buronan)return;   /* eks-napi & yang tercoreng tetap bisa dibidik lagi; buronan sudah di luar yurisdiksi */
  /* aparat mengingat rekam jejak: makin banyak operasi gelap & uang gelap menumpuk, makin gampang dibidik */
  const pelu=(P.heat-28)/130 + (P.hackBlack||0)*0.01 + clamp((P.gelapTotal||0)/2e10,0,0.15) + clamp((P.dicuciTotal||0)/2e10,0,0.1);   /* transaksi cucian ikut dilacak PPATK */
  const ambang=Math.max(24,32-(P.hackBlack||0));   /* makin sering = makin cepat masuk radar */
  if(P.heat>=ambang&&r()<pelu){
    stamp('PENYELIDIKAN SIBER');
    ask({title:'DIGITAL FORENSICS MENGETUK PINTU',text:'Tim siber kepolisian menelusuri jejak transaksi kripto dan log serangan ke aktivitasmu. Laptop disita, rekening dibekukan. <span class="d">(Sorotan: '+P.heat+'/100)</span>',opts:[
      {t:'Sewa pengacara siber terbaik',sub:'Rp 1,5 M · perlemah jeratan',cond:()=>P.money>=1.5e9,e:()=>{P.money-=1.5e9;resolveRazia(0.28);}},
      {t:'Hapus jejak & andalkan opsec',sub:'Butuh Keamanan tinggi',cond:()=>P.st.keamanan>=70,e:()=>resolveRazia(0.1+P.st.keamanan/250)},
      {t:'Suap penyidik',sub:'Rp 3 M (boleh gelap) · berisiko',cond:()=>P.money+P.gelap>=3e9,e:()=>{const c=3e9,dg=Math.min(P.gelap,c);P.gelap-=dg;P.money-=(c-dg);resolveRazia(0.34);}},
      {t:'Pasrah, hadapi apa adanya',e:()=>resolveRazia(0)}
    ]});
  }
}
function resolveRazia(bonus){
  const selamat=clamp(0.12+bonus+P.st.keamanan/350+P.reputasi/500,0.05,0.9);
  const x=r();
  if(x<selamat){
    /* lolos dengan uang gelap besar & sorotan tinggi → memilih jadi buronan, kabur dengan harta */
    if(P.heat>=70&&P.gelap>5e9&&r()<0.5){
      P.buronan=true; P.dipecat=true; P.heat=clamp(P.heat-20,0,100);
      addLog('Sebelum borgol terpasang, Anda lebih dulu menghilang ke luar yurisdiksi membawa aset kripto. Kini Anda <b>buronan siber</b> — kaya, bebas, tapi tak bisa pulang.'+fx({stres:+10}),'bad');
      ach('buronan'); leg(-6,2); milestone('Kabur jadi buronan siber'); return;
    }
    addLog('Bukti dianggap tak cukup kuat, jejak terlalu kabur. Anda <b>LOLOS</b> — kali ini. Tangan dingin di keyboard menyelamatkanmu.'+fx({heat:-34,stres:+6}),'sys');
    leg(-4,0); milestone('Lolos dari razia siber');
  } else if(x<selamat+0.3){
    addLog('Anda lolos dari pidana, tapi nama dan wajah Anda beredar di berita sebagai "diduga peretas". Industri menutup pintu.'+fx({heat:-14,reputasi:-22,stres:+8}),'bad');
    P.dipecat=true; leg(-3,-4); milestone('Tercoreng sebagai tersangka siber');
  } else {
    ditangkap();
  }
}
function ditangkap(){
  let th=ri(3,8);
  const sita=P.gelap; P.gelap=0;
  /* UU TPPU 8/2010: harta hasil pencucian ikut dirampas, walau sudah "bersih" di rekening */
  const sitaCuci=Math.min(Math.max(0,P.money),Math.round((P.dicuciTotal||0)*ri(60,90)/100)); P.money-=sitaCuci; P.dicuciTotal=0;
  P.vonis=true; P.penjara=th; P.dipecat=true; P.menganggur=false; P.buronan=false;
  addLog('Palu hakim mengetuk untukmu: <b>vonis '+th+' tahun penjara</b> atas kejahatan siber'+(sitaCuci>0?' dan pencucian uang':'')+', aset gelap '+rp(sita)+(sitaCuci>0?' plus hasil cucian '+rp(sitaCuci)+' (UU TPPU)':'')+' disita negara. Karier yang dibangun bertahun-tahun runtuh dalam satu sidang.'+fx({reputasi:-30,stres:+15}),'bad');
  stamp('VONIS '+th+' TAHUN'); ach('jeruji'); milestone('Divonis '+th+' tahun atas kejahatan siber');
  leg(-18,-15);
}
