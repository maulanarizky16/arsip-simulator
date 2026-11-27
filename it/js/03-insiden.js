'use strict';
/* ================= KARIER (PROMOSI) ================= */
/* sertifikasi yang relevan menambah peluang fix insiden di domainnya */
function certBonus(c){
  /* grade tertinggi di jalur sedomain: Fundamental +1% · Associate +2,5% · Professional +5% · Expert +8% */
  return sertBonusDomain(SKILL_INSIDEN[c.jenis.k]);
}
/* skill karier = skill utama spesialisasi (65%) + skill pendukung kedua (35%), dari bonus SPES.
   Dulu rata-rata 4 skill: spesialis (mis. Network Engineer) tertahan oleh skill di luar bidangnya,
   sehingga 64% pemain wajar tak pernah lepas dari Junior dan 0% mencapai Lead. */
function skillKarier(){
  const sp=SPES.find(x=>x.k===P.spes);
  const urut=Object.entries(sp?sp.boost:{ngoding:1}).filter(([k])=>k!=='soft').sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  const a=urut[0]||'ngoding', b=urut[1]||a;
  return Math.round(0.65*P.st[a]+0.35*P.st[b]);
}
function cekPromosi(){
  if(P.retired||P.penjara>0||lvNow()>=6)return;
  const next=JAB_NEXT[P.jab]; if(!next)return;
  const s=P.st, lv=lvNow();
  if(P.menganggur||P.dipecat||P.founder||P.tempat==='freelance')return;   /* promosi hanya untuk karyawan aktif (freelancer & founder tak punya atasan) */
  const skillInti=skillKarier();
  /* Lead ke atas: kinerja tim yang dipimpin ikut menentukan (lihat 03c-tim.js) */
  const timOk = lv<4 || timSkor()>=(lv>=5?60:45);   /* ke CTO: tim harus benar-benar kuat */
  const layak = P.tahunJab>=ri(2,4) && P.reputasi>=(28+lv*8) && skillInti>=(40+lv*7) && P.heat<55 && timOk;
  /* sertifikasi manajemen proyek / ITSM melonggarkan syarat soft-skill untuk jalur kepemimpinan */
  const gPM=Math.max(sertGrade('pm'),sertGrade('itsm')-1);
  const softGate = 50+lv*5-(gPM>=2?8:gPM>=1?4:0);
  const layakSoft = lv>=3 && s.soft>=softGate;
  const loyal = (P.tenure||0)>=3;   /* loyalitas mempercepat promosi */
  const kursi = lv>=5 ? 0.3 : 1;   /* kursi CTO hanya satu: peluang jauh lebih kecil */
  if(layak && (lv<3 || layakSoft) && r()<(loyal?0.7:0.55)*kursi){
    const titel=JAB[next].n+' '+P.spesN;
    ask({title:'TAWARAN PROMOSI',text:'Manajemen menilai Anda layak naik menjadi <b>'+titel+'</b>. Gaji & tanggung jawab naik bersamaan.',opts:[
      {t:'Terima promosi',e:()=>{naikJab(next);addLog('Anda dipromosikan menjadi <b>'+titel+'</b>. Cakupan tanggung jawab (dan tekanan) melebar.'+fx({stres:+6,reputasi:+3}),'good');leg(1,6);}},
      lv>=3
        ?{t:'Tolak, fokus jadi IC',sub:'Tetap di jalur teknis murni, tanpa memimpin tim',e:()=>addLog('Anda menolak naik ke jalur manajemen, memilih tetap individual contributor. "Saya mau ngoding, bukan rapat."'+fx({stres:-3,reputasi:+1}),'sys')}
        :{t:'Belum siap, perdalam skill dulu',sub:'Tawaran bisa datang lagi tahun depan',e:()=>addLog('Anda meminta waktu setahun lagi untuk memperdalam skill sebelum naik jenjang.'+fx({stres:-2}),'sys')}
    ]});
  }
}
function naikJab(k){
  const lama=P.jab?gajiTahun():0;
  P.jab=k; P.tahunJab=0; if(JAB[k].lv>P.maxLv)P.maxLv=JAB[k].lv;
  /* kenaikan gaji hasil negosiasi terserap ke rentang gaji jenjang baru: gaji baru = maks(band baru, gaji lama +5%) */
  if((P.gajiAdj||1)!==1){ P.gajiAdj=1; const baru=gajiTahun(); if(lama*1.05>baru)P.gajiAdj=lama*1.05/baru; }
  if(JAB[k].lv>=4&&!P.tim)buatTimAwal();   /* mulai memimpin tim (03c-tim.js) */
  stamp((JAB[k].n+' '+P.spesN).toUpperCase(),'green'); milestone('Naik: '+JAB[k].n+' '+P.spesN);
  if(ACH_DEF[k])ach(k);
}

/* ================= INSIDEN ================= */
const SKILL_INSIDEN={
  outage:'sistem', db:'sistem', diskfull:'sistem', cloudbill:'sistem', k8scrash:'sistem', lbconf:'sistem', firmware:'sistem', cert:'sistem',
  deploy:'ngoding', apilat:'ngoding', mqbacklog:'ngoding', pipeline:'ngoding', baddata:'ngoding',
  iotmati:'jaringan', jaringan:'jaringan', dns:'jaringan', vpn:'jaringan', sensordrift:'jaringan',
  ddos:'keamanan', breach:'keamanan', ransom:'keamanan', phish:'keamanan', secret:'keamanan', supplychain:'keamanan'
};

function buatInsiden(){
  /* bobot: insiden cocok spesialisasi & infra lebih sering; insiden keamanan ikut ancaman global */
  let pool=[];
  for(const j of INSIDEN){
    if(j.th&&N.tahun<j.th)continue;   /* teknologinya belum lazim (mis. Kubernetes sebelum 2016) */
    let w=1;
    if(infraGet(j.infra))w+=2;
    if(j.sec)w+=Math.round((N.ancaman-40)/15)-Math.round((P.bluTeam||0)/30);   /* postur blue-team menekan insiden keamanan */
    if((P.spes==='security')&&j.sec)w+=2;
    if((P.spes==='iot')&&j.k==='iotmati')w+=3;
    if((P.spes==='network')&&j.k==='jaringan')w+=2;
    if((P.spes==='devops'||P.spes==='backend')&&(j.k==='deploy'||j.k==='cloudbill'))w+=2;
    if(j.spesAff&&P.spes&&j.spesAff.indexOf(P.spes)>=0)w+=2;   /* afinitas spesialisasi per insiden */
    if(j.k==='ransom'&&(P.ransomPaid||0)>0)w+=2;   /* pembayar tebusan jadi target langganan */
    w=Math.max(1,w);
    for(let i=0;i<w;i++)pool.push(j);
  }
  const jenis=pick(pool);
  const target=infraGet(jenis.infra)||pick(P.infra)||null;
  /* makin lemah aset & makin tinggi utang teknisnya, makin besar peluang insiden parah; monitoring meredam */
  const lemah=target?(100-target.sehat):20;
  const roll=r()*100+lemah*0.5+(target?(target.debt||0)*0.4:0)-(P.obsv?12:0);
  const parah=roll>78?'besar':roll>42?'sedang':'kecil';
  return {jenis,target,parah,clues:[],diagnosed:{},done:false};
}
function insiden(){
  if(P.penjara>0||P.retired||!P.alive||G.over)return;
  if(!kerjaAktif())return;   /* menganggur / dipecat: tak ada sistem yang dijaga, tak ada on-call */
  let n=1;
  if(r()<0.42)n++;
  if(r()<0.12)n=0;                         /* tahun yang relatif tenang */
  if(N.ancaman>=75&&r()<0.5)n++;
  for(let i=0;i<n;i++)gelarInsiden(buatInsiden());
}
function gelarInsiden(c){
  P.insidenTotal++;
  /* menangani insiden = jam on-call → kelelahan menumpuk; skill domainnya terpakai (lebih awet) */
  P.lembur=clamp((P.lembur||0)+(c.parah==='besar'?6:3),0,100);
  if(P.usedSkill)P.usedSkill[SKILL_INSIDEN[c.jenis.k]]=true;
  /* insiden langsung menggerus aset terdampak */
  const dmg=c.parah==='besar'?ri(16,24):c.parah==='sedang'?ri(9,14):ri(4,7);
  if(c.target)c.target.sehat=clamp(c.target.sehat-dmg,0,100);
  const sev=c.parah==='besar'?'<b>SEV-1 (kritis)</b>':c.parah==='sedang'?'SEV-2 (serius)':'SEV-3 (minor)';
  const tgt=c.target?(' pada <b>'+c.target.n+'</b>'):'';
  let txt='Notifikasi on-call berbunyi. <b>'+c.jenis.n+'</b>'+tgt+'. Tingkat keparahan: '+sev+'.';
  if(c.jenis.sec)txt+='<br><span class="d">Insiden keamanan — tiap menit penyerang masih di dalam berarti kerugian.</span>';
  txt+='<br><span class="d">Diagnosa dulu untuk memastikan akar masalah, atau langsung ambil tindakan.</span>';
  ask({title:'INSIDEN — ON CALL',text:txt,opts:[
    {t:'Tangani sendiri (diagnosa)',e:()=>diagnosa(c)},
    {t:'Eskalasi ke vendor / tim lain',sub:'Aman, tapi biaya & reputasi tergerus',e:()=>eskalasi(c)}
  ]});
}
/* probe diagnosa: pakai yang KHAS insiden kalau ada, kalau tidak jatuh ke DIAG generik */
function probesFor(c){ return (c.jenis.probes&&c.jenis.probes.length)?c.jenis.probes:DIAG; }
function ambilPetunjuk(c,kat){
  const sk=P.st[SKILL_INSIDEN[c.jenis.k]]||40;
  const jelas=c.parah==='besar'?0.5:0.68;
  const pTepat=clamp(jelas+(sk-50)/200+(P.obsv?0.08:0),0.3,0.9);   /* monitoring memperjelas diagnosa */
  const probe=probesFor(c).find(d=>d.k===kat);
  const diag=probe?probe.n:kat;
  let lean;
  if(r()<pTepat)lean='tepat';
  else lean=r()<0.5?'ambigu':'sesat';
  let text;
  if(lean==='tepat')text=(probe&&probe.tepat)?probe.tepat:(pick(KLU.tepat).replace('{d}',diag)+' Mengarah ke: <b>'+c.jenis.petunjuk+'</b>.');
  else text=pick(KLU[lean]).replace('{d}',diag);
  return {lean,text};
}
function diagnosa(c){
  let ring;
  if(c.clues.length)ring='<br><b>Temuan sejauh ini:</b><br>'+c.clues.map(f=>'• '+f.text+' <span class="d">['+f.lean+']</span>').join('<br>');
  else ring='<br><span class="d">Belum ada diagnosa. Pilih apa yang mau ditelusuri (tiap langkah memakan waktu & sedikit stres).</span>';
  const opts=probesFor(c).filter(d=>!c.diagnosed[d.k]).map(d=>({t:d.n,e:()=>{
    c.diagnosed[d.k]=true;
    c.clues.push(ambilPetunjuk(c,d.k));
    P.st.stres=clamp(P.st.stres+1,0,100);
    diagnosa(c);
  }}));
  opts.push({t:'Cukup, terapkan perbaikan »',sub:'Putuskan tindakan berdasar temuan',e:()=>perbaikanCard(c)});
  ask({title:'DIAGNOSA INSIDEN',text:'Menelusuri <b>'+c.jenis.n+'</b>'+(c.target?(' ('+c.target.n+')'):'')+'.'+ring,opts});
}
function perbaikanCard(c){
  const t=c.clues.filter(f=>f.lean==='tepat').length;
  const ringkas=c.clues.length?('Temuan tepat <b>'+t+'</b> dari '+c.clues.length+' diagnosa.'):'<b>Tanpa diagnosa</b> — Anda menebak di tengah gelap.';
  const txt='Saatnya bertindak atas <b>'+c.jenis.n+'</b>. '+ringkas+'<br><span class="d">Pilih tindakan yang menurutmu menyasar akar masalah.</span>';
  const opts=c.jenis.opsi.map(o=>({t:o.t,sub:o.sub,e:()=>terapkan(c,o)}));
  opts.push({t:'Akali cepat (restart paksa / hotfix)',sub:'Tambal kilat — manjur untuk masalah kecil, bahaya untuk yang besar',e:()=>terapkan(c,{quick:true})});
  if(c.jenis.k==='ransom')opts.push({t:'Bayar tebusan ke peretas',sub:'Crypto keluar, data "katanya" balik — mendanai penjahat',e:()=>terapkan(c,{dark:'ransom'})});
  else if(c.jenis.sec)opts.push({t:'Tutupi diam-diam, jangan umumkan',sub:'Selamatkan citra, korbankan korban kebocoran',e:()=>terapkan(c,{dark:'tutup'})});
  if(probesFor(c).some(d=>!c.diagnosed[d.k]))opts.push({t:'Belum yakin, diagnosa lagi',e:()=>diagnosa(c)});
  ask({title:'TERAPKAN PERBAIKAN',text:txt,opts});
}
function terapkan(c,opt){
  if(c.done)return; c.done=true;
  const sk=P.st[SKILL_INSIDEN[c.jenis.k]]||40;
  const teliti=c.clues.filter(f=>f.lean==='tepat').length;
  const parahPen=c.parah==='besar'?0.16:c.parah==='sedang'?0.05:0;
  if(c.jenis.k==='deploy')P.deployTotal++;
  /* === JALAN GELAP === */
  if(opt&&opt.dark==='ransom'){
    const tebus=Math.round(ri(2,8)*1e8*(1+(P.ransomPaid||0)*0.4));   /* langganan = tebusan makin mahal */
    P.ransomPaid=(P.ransomPaid||0)+1;
    /* tebusan adalah biaya PERUSAHAAN. Membayarnya bukan pidana, tapi tak etis & mengecap korban sebagai "pembayar" */
    if(P.founder){ P.money-=tebus;
      addLog('Kas startup-mu menguras '+rp(tebus)+' untuk tebusan kripto. Kunci dekripsi datang — kali ini. Kamu baru saja mendanai sindikat untuk menyerang korban berikutnya (dan mengecap startup-mu sebagai pembayar).'+ix(c.target,+12)+fx({stres:+4}),'bad'); }
    else addLog('Manajemen membayar tebusan '+rp(tebus)+' dalam kripto atas rekomendasimu. Kunci dekripsi datang — kali ini. Perusahaan baru saja mendanai sindikat dan dicap sebagai pembayar; rekan-rekan tahu itu usulmu.'+ix(c.target,+12)+fx({reputasi:-3,stres:+4}),'bad');
    leg(-6,-1); milestone('Bayar tebusan ransomware'); return;   /* membayar tebusan bukan "beres" yang bersih — tak dihitung di rasio karya */
  }
  if(opt&&opt.dark==='tutup'){
    P.dataHilang++; P.coverUps=(P.coverUps||0)+1;
    addLog('Anda menutup insiden diam-diam tanpa lapor regulator maupun user. Layanan "normal" lagi, tapi data pengguna sudah di luar sana.'+ix(c.target,+10)+fx({heat:+2}),'bad');
    leg(-7,1);   /* penutupan bukan resolusi bersih — tak menambah rasio karya */
    /* makin sering menutup-nutupi, makin besar peluang terbongkar (postur keamanan baik sedikit meredam) */
    const expo=clamp(0.22+(P.coverUps||0)*0.08-(P.bluTeam||0)/300,0.22,0.85);
    if(r()<expo){
      const denda=ri(2,6)*1e8;   /* sanksi administratif (UU PDP) dijatuhkan ke perusahaan sebagai pengendali data */
      if(P.founder)addLog('Bocoran itu akhirnya terbongkar jurnalis. Publik murka, regulator menjatuhkan sanksi administratif '+rp(denda)+' ke startup-mu.'+fx({reputasi:-12,heat:+3,money:-denda}),'bad');
      else addLog('Bocoran itu akhirnya terbongkar jurnalis. Publik murka, regulator menjatuhkan sanksi administratif '+rp(denda)+' ke perusahaan — dan namamu disebut sebagai yang menutupinya.'+fx({reputasi:-12,heat:+3,stres:+8}),'bad');
      leg(-4,-4); milestone('Penutupan kebocoran terbongkar'); }
    return;
  }
  /* === peluang sukses === */
  let p;
  if(opt&&opt.quick)p=(c.parah==='besar'?0.24:c.parah==='sedang'?0.5:0.8);
  else if(opt&&opt.ok)p=(c.jenis.k==='ransom')?(P.backupKuat?0.74:0.30):0.64;   /* pulih dari backup butuh backup bersih */
  else p=0.2;
  p+=teliti*0.08 + (sk-50)/280 - parahPen + certBonus(c) - (P.lembur||0)/400;
  if(c.jenis.sec)p+=(P.bluTeam||0)/300;
  p+=((P.budaya!=null?P.budaya:50)-50)/400;
  p+=timBonusInsiden();   /* tim yang kuat & fokus stabilitas membantu pemulihan */   /* tim yang saling percaya lebih cepat menemukan akar masalah */
  p=clamp(p,0.05,0.95);
  /* tambalan cepat/hotfix meninggalkan utang teknis di aset itu */
  if(opt&&opt.quick&&c.target)c.target.debt=clamp((c.target.debt||0)+ri(4,8),0,100);
  if(c.jenis.k==='ransom'&&opt&&opt.ok&&!P.backupKuat)addLog('Anda mencoba memulihkan dari backup... yang ternyata ikut terenkripsi / basi. Pemulihan jadi taruhan.','sys');
  const sukses=r()<p;
  if(sukses){
    P.beres++;
    const gain=c.parah==='besar'?ri(20,26):c.parah==='sedang'?ri(13,18):ri(8,12);
    const rep=c.parah==='besar'?ri(4,6):c.parah==='sedang'?2:1;
    let msg;
    if(opt&&opt.quick)msg='Akalan cepat Anda ternyata menahan masalah. Tidak elegan (utang teknis bertambah), tapi layanan pulih.';
    else if(opt&&opt.ok)msg='Tepat sasaran. Akar masalah teratasi, sistem kembali sehat'+(teliti>=2?' — diagnosa Anda terbukti jitu.':'.');
    else msg='Untung-untungan, tindakan Anda kebetulan memulihkan layanan.';
    addLog(msg+ix(c.target,+gain)+fx({reputasi:+rep,stres:+ (c.parah==='besar'?5:2)}),'good');
    if(c.parah==='besar')leg(4,1); else leg(2,0);
    stamp('INSIDEN BERES','green');
  } else {
    P.gagal++; if(c.jenis.k==='deploy')P.deployGagal++;
    const loss=c.parah==='besar'?ri(10,16):c.parah==='sedang'?ri(6,10):ri(2,5);
    const rep=c.parah==='besar'?ri(5,8):c.parah==='sedang'?3:1;
    addLog('Tindakan Anda meleset dari akar masalah. Insiden berlarut, downtime memanjang, atasan menelepon.'+ix(c.target,-loss)+fx({reputasi:-rep,stres:+(c.parah==='besar'?8:4)}),'bad');
    leg(-(c.parah==='besar'?4:2),0);
    if(c.parah==='besar'){
      P.outageBesar++; stamp('OUTAGE BESAR'); milestone('Outage besar: '+c.jenis.n);
      if(c.jenis.sec){ P.dataHilang++; addLog('Lebih buruk: dalam kekacauan, data sensitif ikut bocor.'+fx({reputasi:-3}),'bad');   /* kelalaian, bukan pidana */ }
    }
  }
  if(c.parah==='besar')postmortem(c,sukses);
}
function eskalasi(c){
  P.eskalasi++;
  const biaya=c.parah==='besar'?ri(80,160)*1e6:c.parah==='sedang'?ri(30,70)*1e6:ri(8,20)*1e6;
  /* tagihan vendor dibayar perusahaan (founder: kas startup sendiri); karyawan menanggung sorotan atasan & finance */
  if(P.founder)P.money-=biaya;
  const siapa=P.founder?'dari kas startup-mu':'dibebankan ke anggaran divisi';
  /* untuk SEV-1, vendor pun bisa meleset dari SLA — eskalasi bukan jaminan */
  if(c.parah==='besar'&&r()<0.25){
    if(c.jenis.k==='deploy')P.deployGagal++;
    addLog('Vendor lambat merespons SLA — insiden kritis tetap berlarut meski sudah Anda lempar. Tagihan '+rp(biaya)+' '+siapa+' melayang sia-sia.'+ix(c.target,+ri(2,5))+fx(P.founder?{reputasi:-3,stres:+4}:{reputasi:-4,stres:+6}),'bad');
    P.outageBesar++; leg(-2,-1);
  } else {
    addLog('Anda melempar insiden ke vendor/tim lain. Beres tanpa tangan Anda kotor, tapi tagihan '+rp(biaya)+' '+siapa+' dan rekan menilai Anda lepas tangan.'+ix(c.target,+ri(6,12))+fx(P.founder?{reputasi:-2,stres:-2}:{reputasi:-3,stres:-1}),'sys');
    leg(-1,-1);
  }
}
