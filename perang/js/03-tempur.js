'use strict';
/* ================= MESIN PERTEMPURAN (dihitung tiap minggu) =================
   N.front: −100 = ibu kota kita jatuh … 0 = perbatasan … +100 = ibu kota lawan jatuh
   N.udara / N.laut: −100 = dikuasai lawan … +100 = dikuasai kita */
function tekF(c){ return 0.55+c.tek/110; }
/* di udara & laut mutu jauh lebih menentukan daripada jumlah (satu kapal perusak modern ≠ satu korvet tua) */
function tekU(c){ return 0.25+Math.pow(c.tek/60,1.4); }
function kuatDarat(s,c){
  return (s.f.pasukan + s.f.tank*0.15 + s.f.heli*0.5 + s.f.drone*0.03) * tekF(c)
    * (0.45+s.st.moral/180) * (0.35+0.65*s.st.logistik/100) * (0.5+0.5*s.st.amunisi/100);
}
function kuatUdara(s,c){ return (s.f.jet + s.f.induk*30 + s.f.drone*0.02) * tekU(c) * (0.5+0.5*s.st.amunisi/100); }
function kuatLaut(s,c){ return (s.f.kapal + s.f.selam*1.6 + s.f.induk*10) * tekU(c); }
function sisiKita(){ return {f:P.f, st:P.st, post:P.post}; }
function kurangi(f,k,rate){ const x=Math.min(f[k],f[k]*rate); f[k]=Math.max(0,+(f[k]-x).toFixed(2)); return x; }   /* pecahan disimpan; tampilan dibulatkan */

function tempur(){
  const A=sisiKita(), B=N.e, cA=NEG[P.neg], cB=NEG[B.k];
  const f0=N.front;
  /* ---------- UDARA ---------- */
  let ua=kuatUdara(A,cA)*UDARA[A.post.u].k, ub=kuatUdara(B,cB)*UDARA[B.post.u].k;
  if(f0<0)ua*=1.15; else if(f0>0)ub*=1.15;                     /* pertahanan udara di wilayah sendiri */
  const tU=100*(ua-ub)/Math.max(ua+ub,1);
  N.udara=Math.round(N.udara+(tU-N.udara)*0.35);
  const sepiU=(A.post.u==='hemat'&&B.post.u==='hemat')?0.2:1;
  const jA=kurangi(A.f,'jet',0.02*sepiU*UDARA[A.post.u].loss*clamp(ub/Math.max(ua,1),0.3,2.5));
  const jB=kurangi(B.f,'jet',0.02*sepiU*UDARA[B.post.u].loss*clamp(ua/Math.max(ub,1),0.3,2.5));
  /* ---------- LAUT ---------- */
  const la=kuatLaut(A,cA)*LAUT[A.post.l].k, lb=kuatLaut(B,cB)*LAUT[B.post.l].k;
  const tL=(la+lb)<1?0:100*(la-lb)/(la+lb);
  N.laut=Math.round(N.laut+(tL-N.laut)*0.3);
  const sepiL=(A.post.l==='pangkalan'&&B.post.l==='pangkalan')?0.1:1;
  const kA=kurangi(A.f,'kapal',0.012*sepiL*LAUT[A.post.l].loss*clamp(lb/Math.max(la,1),0.3,2.5));
  const kB=kurangi(B.f,'kapal',0.012*sepiL*LAUT[B.post.l].loss*clamp(la/Math.max(lb,1),0.3,2.5));
  /* ---------- DARAT ---------- */
  let ga=kuatDarat(A,cA), gb=kuatDarat(B,cB);
  /* perang seberang laut: pasukan yang bisa dikerahkan di tanah lawan dibatasi daya angkut laut */
  if(N.seberang){
    const angkut=(s,c,kuasa)=>(s.f.kapal*6+s.f.induk*40+20)*tekF(c)*(0.5+Math.max(0,kuasa)/200);
    if(f0>=0)ga=Math.min(ga,angkut(A,cA,N.laut));
    if(f0<=0)gb=Math.min(gb,angkut(B,cB,-N.laut));
  }
  ga*=1+(A.post.u==='cas'?0.25:0.08)*Math.max(0,N.udara)/100;
  gb*=1+(B.post.u==='cas'?0.25:0.08)*Math.max(0,-N.udara)/100;
  const dA=DARAT[A.post.d], dB=DARAT[B.post.d];
  /* makin dalam masuk wilayah lawan: jalur suplai memanjang, penduduk melawan, pembela makin gigih */
  const dlmA=Math.max(0,f0)/100, dlmB=Math.max(0,-f0)/100;
  const atkA=ga*dA.a*(1-0.45*dlmA), atkB=gb*dB.a*(1-0.45*dlmB);
  const defA=ga*dA.d*(f0<0?1.15*MEDAN[cA.geo]:1)*(1+P.fort*0.04)*(1+0.6*dlmB);    /* bertahan di tanah sendiri + medan + kubu */
  const defB=gb*dB.d*(f0>0?1.15*MEDAN[cB.geo]:1)*(1+(B.fort||0)*0.04)*(1+0.6*dlmA);
  /* penyerang baru bisa maju bila unggul nyata atas pembela (kaidah lapangan: butuh ±3 banding 1 untuk menerobos cepat);
     keunggulan jumlah yang sangat besar hasilnya menurun karena lebar front terbatas */
  const dorong=(atk,def)=>Math.max(0,Math.pow(atk/Math.max(def,1),0.75)-0.85);
  const net=dA.i*dorong(atkA,defB)-dB.i*dorong(atkB,defA);
  let delta=net*3.2+(r()*2-1)*0.8;
  if(A.post.d==='mundur')delta-=2;
  if(B.post.d==='mundur')delta+=2;
  if(N.cuaca==='lumpur')delta*=0.5;
  if(N.jeda){ delta*=0.6; }                                     /* jeda kemanusiaan memperlambat operasi */
  /* negara terpisah laut: maju di wilayah lawan bergantung pada penguasaan laut */
  if(N.seberang){
    if(delta>0&&f0>=0)delta*=clamp(0.25+N.laut/80,0.1,1.1);
    if(delta<0&&f0<=0)delta*=clamp(0.25-N.laut/80,0.1,1.1);
  }
  /* operasi amfibi */
  let amfA=0, amfB=0;
  if(A.post.l==='amfibi'){ if(N.laut>=30){ delta+=1+N.laut/60; amfA=1; P.amfibiSukses=(P.amfibiSukses||0)+1; } else { amfA=-1; delta-=1; } }
  if(B.post.l==='amfibi'){ if(N.laut<=-30){ delta-=1-N.laut/60; amfB=1; } else { amfB=-1; delta+=1; } }
  delta=clamp(delta,-5,5);
  N.front=clamp(+(f0+delta).toFixed(1),-100,100);
  /* ---------- KERUGIAN DARAT ---------- */
  const rA=(0.002+0.008*dB.i*clamp(atkB/Math.max(defA,1),0.3,2.5)+0.006*dA.i*clamp(defB/Math.max(atkA,1),0.3,2.5))*dA.loss*(amfA<0?1.8:amfA>0?1.2:1);
  const rB=(0.002+0.008*dA.i*clamp(atkA/Math.max(defB,1),0.3,2.5)+0.006*dB.i*clamp(defA/Math.max(atkB,1),0.3,2.5))*dB.loss*(amfB<0?1.8:amfB>0?1.2:1);
  const pA=kurangi(A.f,'pasukan',rA), pB=kurangi(B.f,'pasukan',rB);
  kurangi(A.f,'tank',rA*1.4); kurangi(B.f,'tank',rB*1.4);
  kurangi(A.f,'heli',rA); kurangi(B.f,'heli',rB);
  kurangi(A.f,'drone',rA*2.5); kurangi(B.f,'drone',rB*2.5);
  P.tewas+=pA*0.3; P.tewasLawan+=pB*0.3;                         /* ±30% korban gugur, sisanya luka/tertawan */
  /* ---------- SERANGAN STRATEGIS & BLOKADE ---------- */
  let sipilTxt='';
  if(A.post.u==='strategis'&&N.udara>-30){
    B.st.logistik=clamp(B.st.logistik-(3+Math.max(0,N.udara)/20),0,100);
    B.st.amunisi=clamp(B.st.amunisi-2,0,100);
    const korban=(0.05+r()*0.2)*(1.4-cA.tek/100); P.sipilLawan+=korban;
    B.st.tekad=clamp(B.st.tekad+(N.minggu<=6?1:-1.2),0,100);       /* awalnya menyatukan rakyat lawan, lama-lama menggerus */
    P.st.dunia=clamp(P.st.dunia-0.8,0,100);
    sipilTxt+=' Serangan strategis Anda menewaskan sekitar '+org(korban)+' warga sipil lawan.';
  }
  if(B.post.u==='strategis'&&N.udara<30){
    A.st.logistik=clamp(A.st.logistik-(3+Math.max(0,-N.udara)/20),0,100);
    A.st.amunisi=clamp(A.st.amunisi-2,0,100);
    const korban=(0.05+r()*0.2)*(1.4-cB.tek/100)*(P.evakuasi>0?0.4:1); P.sipilKita+=korban;
    P.st.publik=clamp(P.st.publik+(N.minggu<=6?1:-1),0,100);
    sipilTxt+=' Kota-kota Anda dibom: sekitar '+org(korban)+' warga sipil tewas'+(P.evakuasi>0?' (evakuasi menyelamatkan banyak nyawa)':'')+'.';
  }
  if(A.post.l==='blokade'&&N.laut>15){ B.st.logistik=clamp(B.st.logistik-(2+N.laut/25),0,100); B.st.tekad=clamp(B.st.tekad-0.8,0,100); P.st.dunia=clamp(P.st.dunia-0.3,0,100); }
  if(B.post.l==='blokade'&&N.laut<-15){ A.st.logistik=clamp(A.st.logistik-(2-N.laut/25),0,100); P.st.publik=clamp(P.st.publik-0.6,0,100); }
  /* ---------- AMUNISI & LOGISTIK ---------- */
  const amU=u=>u==='rebut'||u==='strategis'?2:u==='hemat'?0:1;
  A.st.amunisi=clamp(A.st.amunisi-dA.am-amU(A.post.u)+(P.dana>=0?3:0),0,100);
  B.st.amunisi=clamp(B.st.amunisi-dB.am-amU(B.post.u)+(B.st.logistik>30?4.5:2.5),0,100);
  let lgA=4+(A.post.l==='kawal'?5:0)-dA.i*3-(N.front>0?N.front/10:0);
  let lgB=4+(B.post.l==='kawal'?5:0)-dB.i*3-(N.front<0?-N.front/10:0);
  if(N.seberang&&N.front>0&&N.laut<0)lgA-=-N.laut/12;            /* pasukan di seberang laut tanpa kendali laut = kelaparan */
  if(N.seberang&&N.front<0&&N.laut>0)lgB-=N.laut/12;
  A.st.logistik=clamp(A.st.logistik+lgA,0,100);
  B.st.logistik=clamp(B.st.logistik+lgB,0,100);
  /* ---------- MORAL, RAKYAT, TEKAD ---------- */
  A.st.moral=clamp(A.st.moral+delta*0.5-rA*250+(A.st.logistik<30?-3:A.st.logistik>70?0.5:0)+(N.front<0?0.8:0)-0.3,0,100);
  B.st.moral=clamp(B.st.moral-delta*0.5-rB*250+(B.st.logistik<30?-3:B.st.logistik>70?0.5:0)+(N.front>0?0.8:0)-0.3,0,100);
  P.st.publik=clamp(P.st.publik+delta*0.35-rA*120-(P.agresor?0.35:0.1)+(N.front<-20?0.6:0),0,100);
  B.st.tekad=clamp(B.st.tekad-delta*0.4-rB*120-0.2+(N.front>20&&N.minggu<10?0.5:0)-(B.st.moral<25?1:0),0,100);
  P.st.dunia=clamp(P.st.dunia+(P.agresor?-0.2:0.2),0,100);
  /* ---------- LAPORAN MINGGUAN ---------- */
  const arah=delta>=1?'maju':delta<=-1?'terdesak mundur':'tertahan';
  let t='Laporan front: pasukan Anda <b>'+arah+'</b> ('+(delta>=0?'+':'−')+Math.abs(delta).toFixed(1)+'). '+
    'Kerugian minggu ini — Anda: '+org(pA)+' personel'+(jA>=1?', '+Math.round(jA)+' pesawat':'')+(kA>=1?', '+Math.round(kA)+' kapal':'')+
    '; lawan: ±'+org(pB)+' personel'+(jB>=1?', '+Math.round(jB)+' pesawat':'')+(kB>=1?', '+Math.round(kB)+' kapal':'')+'.';
  if(amfA>0)t+=' Pendaratan amfibi Anda berhasil membuka pantai baru.';
  if(amfA<0)t+=' <b>Pendaratan amfibi gagal</b> — tanpa penguasaan laut, kapal pendarat jadi sasaran empuk.';
  if(amfB>0)t+=' Lawan mendarat di pantai Anda dari laut.';
  if(A.st.amunisi<15)t+=' <b>Amunisi menipis</b> — meriam mulai dijatah.';
  if(A.st.logistik<25)t+=' <b>Logistik kritis</b> — pasukan depan kekurangan BBM & ransum.';
  addLog(t+sipilTxt,delta>=1?'good':delta<=-1?'bad':'sys');
  if(amfA>0&&P.amfibiSukses>=2)ach('amfibi');
  N.jeda=false;
  if(N.udara>P.puncakUdara)P.puncakUdara=N.udara; if(N.laut>P.puncakLaut)P.puncakLaut=N.laut;
  return delta;
}

/* ================= KAS PERANG ================= */
function pendapatanMinggu(){
  const c=NEG[P.neg];
  let masuk=c.hankam*1000/52*1.5+c.pdb*0.4;
  if(P.st.dunia<25)masuk*=0.7;                                   /* sanksi */
  if(N.e.post.l==='blokade'&&N.laut<-15)masuk*=1-Math.min(0.4,-N.laut/250);
  return Math.round(masuk);
}
function biayaMinggu(){
  const f=P.f, d=DARAT[P.post.d];
  const dasar=f.pasukan*0.25+f.jet*0.15+f.kapal*0.6+f.selam*0.5+f.tank*0.02+f.heli*0.05+f.induk*6;
  return Math.round(dasar*(0.9+d.i*0.8)*(P.post.u==='hemat'?0.92:1.05)*(P.post.l==='pangkalan'?0.93:1.04));
}
function ekonomi(){
  const masuk=pendapatanMinggu(), keluar=biayaMinggu();
  P.dana+=masuk-keluar;
  if(P.dana<0){
    P.minusDana++;
    P.st.moral=clamp(P.st.moral-2,0,100); P.st.publik=clamp(P.st.publik-1,0,100);
    if(P.minusDana===1||P.minusDana%4===0)addLog('Kas perang minus '+usd(-P.dana)+'. Gaji prajurit telat, pabrik amunisi berhenti menerima pesanan.','bad');
    if(P.minusDana>=6)ach('bangkrut');
  }
  /* pesanan senjata tiba */
  const tiba=P.pesanan.filter(x=>x.tiba<=N.minggu);
  P.pesanan=P.pesanan.filter(x=>x.tiba>N.minggu);
  for(const x of tiba){ for(const k in x.apa)P.f[k]=(P.f[k]||0)+x.apa[k]; addLog('Kiriman tiba di pelabuhan: <b>'+x.n+'</b>.','good'); }
  if(P.intel>0)P.intel--;
  if(P.evakuasi>0)P.evakuasi--;
}

/* ================= PANGLIMA LAWAN ================= */
function aiMusuh(){
  const B=N.e, cA=NEG[P.neg], cB=NEG[B.k], s=B.sifat;
  const rasio=kuatDarat(B,cB)/Math.max(kuatDarat(sisiKita(),cA),1);
  /* darat */
  let d;
  if(B.st.amunisi<18||B.st.logistik<22)d='bertahan';
  else if(N.front>=55)d=rasio>1.1?'ofensif':'bertahan';             /* terdesak di tanah sendiri */
  else if(rasio>=1.25)d=s==='hati'&&r()<0.4?'tekan':'ofensif';
  else if(rasio>=0.85)d=s==='agresif'?(r()<0.6?'ofensif':'tekan'):s==='hati'?(r()<0.6?'bertahan':'tekan'):'tekan';
  else d=B.st.moral<30&&N.front<40&&r()<0.4?'mundur':'bertahan';
  if(P.tujuan==='bertahan'&&N.front>=-2&&rasio<1.1&&r()<0.6)d='bertahan';   /* terusir: menggali di perbatasan */
  if(r()<0.12)d=pick(['tekan','bertahan']);
  /* udara */
  const ru=kuatUdara(B,cB)/Math.max(kuatUdara(sisiKita(),cA),1);
  let u=ru>=1.3?(s==='licik'&&r()<0.6?'strategis':N.udara>-40?'rebut':'cas'):ru>=0.7?(d==='ofensif'?'cas':'rebut'):'hemat';
  if(s==='agresif'&&ru>=1&&r()<0.3)u='strategis';
  if(B.f.jet<5)u='hemat';
  /* laut */
  const rl=kuatLaut(B,cB)/Math.max(kuatLaut(sisiKita(),cA),1);
  let l=rl>=1.4?(s==='licik'||r()<0.5?'blokade':'kawal'):rl>=0.7?'kawal':'pangkalan';
  if(N.seberang&&rl>=1.6&&N.laut<=-35&&d==='ofensif'&&r()<0.5)l='amfibi';
  if(B.f.kapal+B.f.selam<2)l='pangkalan';
  B.post={d,u,l};
  /* mobilisasi cadangan saat terdesak */
  if(B.f.cad>0&&(B.f.pasukan<B.awal.pasukan*0.7||N.front>=35)&&B.mobil<4&&r()<0.5){
    const x=Math.min(B.f.cad,Math.max(15,B.awal.pasukan*0.15));
    B.f.cad-=x; B.f.pasukan+=x; B.mobil++; B.st.moral=clamp(B.st.moral-2,0,100);
    addLog('Intelijen: '+cB.n+' memobilisasi '+org(x)+' pasukan cadangan ke garis depan.','bad');
  }
  if(B.fort<5&&d==='bertahan'&&r()<0.25)B.fort++;
}
