'use strict';
/* ================= EVENT TAHUNAN ================= */
function events(){
  const s=P.st;
  cekPromosi();
  /* === penegakan hukum siber (analog OTT) === */
  razia();
  if(P.penjara>0||G.over)return;

  /* === GELOMBANG AI: skill bisa usang === */
  if(N.tren&&N.tren.indexOf('AI')>=0&&!P.pelatihanAI&&r()<0.3){
    ask({title:'GELOMBANG AI MENERJANG',text:'Tools AI menulis kode, mengotomasi ops, dan manajemen bertanya "apakah peran ini masih perlu?". Cara Anda merespons menentukan relevansi Anda.',opts:[
      {t:'Belajar & adopsi AI ke alur kerja',sub:'Naikkan nilai, jadi lebih produktif',e:()=>{P.pelatihanAI=true;ach('antiAI');
        addLog('Anda memeluk gelombang itu: pakai AI sebagai pengganda tenaga, bukan ancaman. Output Anda melonjak.'+fx({ngoding:+5,sistem:+3,reputasi:+4}),'good');leg(2,2);}},
      {t:'Abaikan, "cuma hype sesaat"',e:()=>{addLog('Anda menutup mata. Setahun-dua tahun lagi, lowongan minta skill yang tak Anda punya.'+fx({reputasi:-3}),'bad');leg(0,-2);}}
    ]});
  }
  /* === DIBAJAK PERUSAHAAN (headhunt) — sering loncat = "flight risk", tawaran menyusut === */
  if(!P.retired&&P.reputasi>=40&&!P.evCounterOffer&&r()<((N.pasar==='boom'?0.22:0.1)*((P.jobHops||0)>=3?0.5:1))){
    const naik=Math.round(gajiTahun()*(0.3+r()*0.4)*((P.jobHops||0)>=3?0.7:1));
    ask({title:'DI-HEADHUNT',text:'Seorang recruiter menawarkan posisi serupa di tempat lain dengan gaji +'+rp(naik)+'/tahun. Pindah?',opts:[
      {t:'Pindah kerja',e:()=>{
        const tm=pick(TEMPAT); P.tempat=tm.k; P.tempatN=tm.n; P.tahunJab=Math.max(0,P.tahunJab-1); P.tenure=0; P.jobHops=(P.jobHops||0)+1;
        if(tm.k==='startup'){P.saham+=ri(2,8)*1e8;P.startupSaham=true;}
        addLog('Anda menerima tawaran dan pindah ke <b>'+tm.n+'</b>. Lembaran (dan tumpukan teknologi) baru.'+fx({money:+naik,stres:+5,reputasi:+2}),'good');milestone('Pindah kerja ke '+tm.n);leg(0,3);}},
      {t:'Bertahan & minta counter-offer',e:()=>{P.evCounterOffer=true;
        if(r()<0.6){const c=Math.round(naik*0.6);addLog('Manajemen menahan Anda dengan kenaikan gaji.'+fx({money:+c,reputasi:+1}),'good');leg(0,2);}
        else addLog('Counter-offer ditolak atasan. Anda bertahan dengan gaji lama dan sedikit kecewa.'+fx({stres:+3}),'sys');}}
    ]});
  }
  /* === LAYOFF saat winter === */
  if(!P.retired&&N.pasar==='krisis'&&r()<0.16){
    const pesangon=Math.round(gajiTahun()*0.5);
    addLog('<b>RESTRUKTURISASI.</b> Divisi Anda dirampingkan — Anda termasuk yang dirumahkan. Pesangon '+rp(pesangon)+'.'+fx({money:+pesangon,stres:+12,reputasi:-2}),'bad');
    milestone('Kena layoff'); leg(0,-2);
    if(P.saham>0){addLog('Saham yang belum vesting hangus begitu saja.','bad');P.saham=Math.round(P.saham*0.3);}
    cariKerja();
  }
  /* === AKUISISI STARTUP (exit) === */
  if(P.startupSaham&&P.saham>0&&!P.evAkuisisi&&r()<0.07){
    P.evAkuisisi=true;
    const cuan=P.saham*ri(2,6);
    addLog('<b>EXIT!</b> Startup tempat Anda bekerja diakuisisi raksasa teknologi. Saham Anda dicairkan jadi '+rp(cuan)+'.'+fx({saham:-P.saham,money:+cuan,reputasi:+5}),'good');
    stamp('EXIT STARTUP','green'); milestone('Cuan dari exit startup'); ach('exit'); leg(1,8);
  }
  /* === MOONLIGHT: kerja dobel diam-diam (sekali seumur karier) === */
  if(!P.retired&&!P.evMoonlight&&s.ngoding>=55&&P.heat<40&&r()<0.06){
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
  if(!P.retired&&lvNow()>=3&&r()<0.14){
    P.mentorKali++;
    addLog('Anda membimbing engineer junior melewati bug pertamanya yang menakutkan. Ada kepuasan yang gaji tak bisa beli.'+fx({soft:+2,reputasi:+2,stres:-1}),'good');
    if(P.mentorKali>=5)ach('mentor'); leg(2,0);
  }
  /* === BURNOUT (stres tinggi ATAU on-call fatigue menumpuk) === */
  if(!P.retired&&(s.stres>=85||(P.lembur||0)>=85)&&r()<0.5){
    ask({title:'BURNOUT',text:'On-call tengah malam, sprint tanpa henti, layar yang tak pernah padam. Tubuh dan pikiran Anda menyerah serentak.',opts:[
      {t:'Ambil cuti panjang & pulihkan diri',sub:'Reset, meski karier sedikit melambat',e:()=>{P.burnoutKali++;P.lembur=clamp((P.lembur||0)-50,0,100);
        addLog('Anda rehat total: lepas laptop, tidur cukup, jauh dari Slack. Pelan-pelan pulih.'+fx({stres:-35,kesehatan:+8,reputasi:-1}),'good');ach('burnoutSurvivor');}},
      {t:'Paksakan terus, gas pol',e:()=>{P.burnoutKali++;
        addLog('Anda menelan lelah dan terus ngebut. Tubuh membalas tagihannya.'+fx({kesehatan:-14,stres:+4,reputasi:-2}),'bad');
        if(r()<0.3&&!P.retired){addLog('Anda kolaps di depan laptop dan terpaksa berhenti kerja sementara.','bad');cariKerja();}}}
    ]});
  }
  /* === KELUARGA & KESEHATAN === */
  if(!P.keluarga&&P.age>=27&&r()<0.22){ P.keluarga=true; addLog('Anda menikah. Ada alasan untuk menutup laptop tepat waktu (kadang).'+fx({stres:-5,kesehatan:+2}),'good'); milestone('Menikah'); }
  if(P.keluarga&&P.anak<3&&P.age<46&&r()<0.18){ P.anak++; addLog('Anak ke-'+P.anak+' lahir. Commit paling penting dalam hidup Anda.'+fx({stres:-2,kesehatan:-1}),'good'); }
  if(P.age>=45&&s.kesehatan<58&&r()<0.25){ const b=ri(8,25)*1e6; addLog('Gaya hidup duduk 12 jam & begadang menagih — Anda sempat dirawat. Biaya '+rp(b)+'.'+fx({money:-b,kesehatan:+6,stres:+3}),'bad'); }
  /* === SURVEI / KABAR INDUSTRI === */
  if(r()<0.4){
    const avg=Math.round((P.reputasi+uptimeRata())/2);
    addLog('Catatan tahunan: reputasi teknis '+P.reputasi+'/100, rata-rata uptime sistem '+uptimeRata()+'%. Tren panas tahun ini: <b>'+N.tren+'</b>.','sys');
    if(avg>=80&&P.reputasi>=78)ach('rajaUptime');
  }
  /* === PENSIUN / FIRE (MRR ikut menopang kemandirian finansial) === */
  const kaya=P.money+P.saham+(P.saasMRR||0)*36>=15e9;
  if(!P.retired&&((P.age>=58)||(kaya&&P.age>=42&&r()<0.25))){
    P.retired=true;
    if(kaya&&P.age<58){ ach('fire'); addLog('Dengan portofolio yang cukup, Anda memutuskan <b>pensiun dini (FIRE)</b> di usia '+P.age+'. Cukup sudah on-call seumur hidup.'+fx({stres:-20}),'good'); stamp('FIRE','green'); milestone('Pensiun dini (FIRE)'); leg(1,4); }
    else { addLog('Di usia '+P.age+', Anda gantung keyboard. Generasi baru engineer mengambil alih pager Anda.'+fx({stres:-18}),'sys'); stamp('PENSIUN'); milestone('Pensiun dari dunia IT'); }
  }
}

/* mencari kerja setelah layoff/berhenti */
function cariKerja(){
  ask({title:'MENCARI KERJA',text:'Anda kini menganggur. Pasar sedang '+(N.pasar==='krisis'?'beku':N.pasar==='boom'?'panas':'biasa')+'. Langkah berikutnya?',opts:[
    {t:'Lamar & wawancara di banyak tempat',sub:'Grinding leetcode & system design',e:()=>{
      const p=clamp(0.45+(P.reputasi-30)/120+(P.st.ngoding-40)/200+(N.pasar==='boom'?0.2:N.pasar==='krisis'?-0.15:0),0.1,0.95);
      if(r()<p){const tm=pick(TEMPAT);P.tempat=tm.k;P.tempatN=tm.n;P.tahunJab=0;P.tenure=0;P.jobHops=(P.jobHops||0)+1;
        addLog('Setelah belasan wawancara, Anda dapat tawaran di <b>'+tm.n+'</b>. Kembali punya penghasilan.'+fx({stres:-4,reputasi:+1}),'good');milestone('Diterima kerja di '+tm.n);
        if(tm.k==='startup'){P.saham+=ri(1,5)*1e8;P.startupSaham=true;}}
      else addLog('Belasan lamaran, banyak "kami akan kabari". Tahun ini Anda masih menganggur, makan tabungan.'+fx({stres:+8,money:-Math.round(gajiTahun()*0.2)}),'bad');}},
    {t:'Banting setir jadi freelance/konsultan',e:()=>{P.tempat='remote';P.tempatN='Freelance / Konsultan';P.tahunJab=0;P.tenure=0;P.jobHops=(P.jobHops||0)+1;
      addLog('Anda jadi konsultan lepas, gaji tak menentu tapi merdeka.'+fx({stres:-2,reputasi:+1}),'sys');milestone('Jadi freelancer');}},
    {t:'Rehat dulu, kuras tabungan',e:()=>addLog('Anda memilih jeda. Tabungan menipis, tapi kepala lebih jernih.'+fx({stres:-8,money:-Math.round(gajiTahun()*0.25)}),'sys')}
  ]});
}

/* ================= PENEGAKAN HUKUM SIBER ================= */
function razia(){
  if(P.penjara>0||G.over||P.dipecat)return;
  /* aparat mengingat rekam jejak: makin banyak operasi gelap & uang gelap menumpuk, makin gampang dibidik */
  const pelu=(P.heat-28)/130 + (P.hackBlack||0)*0.01 + clamp((P.gelapTotal||0)/2e10,0,0.15);
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
  P.vonis=true; P.penjara=th; P.dipecat=true; P.buronan=false;
  addLog('Palu hakim mengetuk untukmu: <b>vonis '+th+' tahun penjara</b> atas kejahatan siber, aset gelap '+rp(sita)+' disita negara. Karier yang dibangun bertahun-tahun runtuh dalam satu sidang.'+fx({reputasi:-30,stres:+15}),'bad');
  stamp('VONIS '+th+' TAHUN'); ach('jeruji'); milestone('Divonis '+th+' tahun atas kejahatan siber');
  leg(-18,-15);
}
