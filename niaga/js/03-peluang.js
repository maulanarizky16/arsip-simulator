'use strict';
/* ================= PELUANG BISNIS (mekanik inti) ================= */
function buatPeluang(){
  const jenis=pick(PELUANG);
  let sektor=null;
  if(jenis.tipe==='buka'||jenis.tipe==='mitra')sektor=pick(SEKTOR);
  /* peluang di sektor yang sedang naik daun / harganya tinggi lebih sering "emas" */
  let pBagus=0.34;
  if(sektor){ if(N.tren===sektor.k)pBagus+=0.12; const h=(N.harga&&N.harga[sektor.k])||1; if(h>=1.2)pBagus+=0.08; else if(h<=0.8)pBagus-=0.08; }
  const x=r();
  const mutu=x<pBagus?'bagus':x<pBagus+0.36?'biasa':'jebakan';
  let base=Math.round((Math.max(P.kas,30e6)*0.5+80e6)*(0.5+r()*1.3));
  if(sektor)base=Math.max(base,Math.round(sektor.modalMin*(0.8+r()*0.9)));
  return {jenis,tipe:jenis.tipe,mutu,cost:base,sektor,clues:[],checked:{},done:false};
}
function peluang(){
  if(P.penjara>0||P.retired||!P.alive||G.over)return;
  if(r()<0.62)tawarkanPeluang(buatPeluang());
}
function tawarkanPeluang(c){
  const sekTxt=c.sektor?(' di sektor <b>'+c.sektor.n+'</b>'):'';
  const nilaiTxt=c.tipe==='dana'?('Tawaran dana ~'+rp(c.cost)):('Perkiraan modal ~'+rp(c.cost));
  let txt='Sebuah peluang menghampiri: <b>'+c.jenis.n+'</b>'+sekTxt+'. '+nilaiTxt+'.<br><span class="d">Peluang bagus dan jebakan kadang terlihat sama. Lakukan due diligence dulu, atau percaya insting.</span>';
  ask({title:'PELUANG BISNIS',text:txt,opts:[
    {t:'Lakukan due diligence',sub:'Teliti dulu sebelum tanam modal',e:()=>dueDiligence(c)},
    {t:'Ambil cepat (insting)',sub:'Lewati pemeriksaan, langsung putuskan',e:()=>putusanDeal(c)},
    {t:'Lewatkan',e:()=>{P.dealLewat++;addLog('Anda melewatkan peluang ini. Mungkin selamat dari jebakan, mungkin kehilangan emas. Tak akan pernah tahu.','sys');}}
  ]});
}
function ambilPetunjuk(c,kat){
  const sk=Math.round((P.st.bisnis+P.st.finansial)/2);
  const pTepat=clamp(0.55+(sk-50)/200,0.3,0.9);
  const diag=DD.find(d=>d.k===kat).n;
  let lean;
  if(r()<pTepat)lean='tepat'; else lean=r()<0.5?'ambigu':'sesat';
  let text=pick(KLU[lean]).replace('{d}',diag);
  if(lean==='tepat')text+=' Indikasi: <b>'+MUTU_LBL[c.mutu]+'</b>.';
  return {lean,text};
}
function dueDiligence(c){
  let ring;
  if(c.clues.length)ring='<br><b>Temuan sejauh ini:</b><br>'+c.clues.map(f=>'• '+f.text+' <span class="d">['+f.lean+']</span>').join('<br>');
  else ring='<br><span class="d">Belum diperiksa. Pilih aspek yang mau ditelusuri (memakan biaya & waktu).</span>';
  const opts=DD.filter(d=>!c.checked[d.k]).map(d=>({t:d.n,e:()=>{
    c.checked[d.k]=true; P.ddKali++;
    P.kas-=Math.max(300e3,Math.round(c.cost*ri(3,8)/1000));   /* biaya konsultan/riset 0,3–0,8% nilai deal (dulu flat 2–8 jt: mencekik pemain bermodal 40 jt) */
    c.clues.push(ambilPetunjuk(c,d.k));
    if(P.ddKali>=10)ach('dueDiligence');
    dueDiligence(c);
  }}));
  opts.push({t:'Cukup, ambil keputusan »',e:()=>putusanDeal(c)});
  ask({title:'DUE DILIGENCE',text:'Memeriksa peluang <b>'+c.jenis.n+'</b>'+(c.sektor?(' ('+c.sektor.n+')'):'')+'.'+ring,opts});
}
function putusanDeal(c){
  const t=c.clues.filter(f=>f.lean==='tepat').length;
  const ringkas=c.clues.length?('Temuan meyakinkan: <b>'+t+'</b> dari '+c.clues.length+' pemeriksaan.'):'<b>Tanpa due diligence</b> — Anda bertaruh pada insting.';
  let opts;
  if(c.tipe==='dana'){
    opts=[
      {t:'Terima dana penuh',sub:rp(c.cost)+' masuk',e:()=>eksekusiDeal(c,'penuh')},
      {t:'Terima sebagian',sub:'Dilusi/risiko lebih kecil',e:()=>eksekusiDeal(c,'negosiasi')},
      {t:'Tolak',e:()=>{P.dealLewat++;addLog('Anda menolak suntikan dana itu. Tetap mandiri, tetap pegang kendali penuh.','sys');}}
    ];
  } else {
    const negCost=Math.round(c.cost*0.62);
    opts=[
      {t:'Ambil penuh',sub:'Modal '+rp(c.cost),cond:()=>P.kas>=c.cost,e:()=>eksekusiDeal(c,'penuh')},
      {t:'Ambil sebagian / negosiasi',sub:'Modal '+rp(negCost)+' · skala lebih kecil',cond:()=>P.kas>=negCost,e:()=>eksekusiDeal(c,'negosiasi')},
      {t:'Lewatkan',e:()=>{P.dealLewat++;addLog('Anda mundur dari peluang ini di menit terakhir.','sys');}}
    ];
  }
  if(DD.some(d=>!c.checked[d.k])&&c.tipe!=='dana')opts.splice(opts.length-1,0,{t:'Belum yakin, periksa lagi',e:()=>dueDiligence(c)});
  ask({title:'KEPUTUSAN',text:'Soal <b>'+c.jenis.n+'</b>. '+ringkas+'<br><span class="d">Kalau ini jebakan, modal bisa lenyap. Kalau emas, bisa jadi lompatan besar.</span>',opts});
}
function eksekusiDeal(c,mode){
  if(c.done)return; c.done=true;
  P.dealAmbil++; if(P.dealAmbil>=8)ach('dealmaker');
  const neg=mode==='negosiasi', q=c.mutu;
  if(q==='bagus')P.dealBagus++; else if(q==='jebakan')P.dealJebakan++;
  const cost=neg?Math.round(c.cost*0.62):c.cost;
  if(c.tipe!=='dana')P.kas-=cost;
  switch(c.tipe){
    case 'buka':{
      const s=c.sektor;
      if(q==='jebakan'){
        const u=bukaUsahaObj(s.k,Math.round(cost*0.5),{kinerja:ri(30,45),brand:ri(5,12)});
        P.usaha.push(u); P.usahaDibuka++; P.utang+=Math.round(cost*0.3);
        addLog('Setelah deal diteken, topengnya lepas: <b>'+u.n+'</b> jauh lebih jelek dari yang dijanjikan, lengkap dengan utang tersembunyi.'+fx({stres:+7}),'bad'); leg(-2,-1);
      } else {
        const kin=q==='bagus'?ri(68,85):ri(54,68), br=q==='bagus'?ri(25,40):ri(12,24);
        const u=bukaUsahaObj(s.k,Math.round(cost*(neg?0.9:1.2)),{kinerja:kin,brand:br});
        P.usaha.push(u); P.usahaDibuka++;
        addLog('Anda menambah <b>'+u.n+'</b> ('+s.n+', '+SKALA_LBL[u.skala]+') ke portofolio. '+(q==='bagus'?'Arus kasnya emas, langsung produktif.':'Lumayan, tinggal dibesarkan.')+fx({reputasi:+ (q==='bagus'?2:1)}),'good'); leg(q==='bagus'?3:1,0);
      }
      if(c.jenis.k==='akuisisi'){P.akuisisiKali++;if(P.akuisisiKali>=3)ach('akuisitor');}
      if(c.jenis.k==='waralabaBeli'){P.franchiseKali++;if(P.franchiseKali>=2)ach('waralabaRaja');}
      ach('pertama'); cekSkalaAch();
      break;
    }
    case 'kontrak':{
      if(q==='jebakan'){ addLog('Anda mengerahkan modal memenuhi pesanan besar... lalu klien menghilang tanpa membayar. Modal kerja Anda raib.'+fx({stres:+8}),'bad'); leg(-1,-1); }
      else { const bayar=Math.round(cost*(q==='bagus'?ri(185,260):ri(120,165))/100); addLog('Kontrak dipenuhi dan dibayar penuh. Omzet '+rp(bayar)+' masuk, nama Anda terangkat di kalangan bisnis.'+fx({kas:+bayar,reputasi:+3}),'good'); leg(2,1); }
      break;
    }
    case 'flip':{
      if(q==='jebakan'){ addLog('Barang ternyata cacat/abal-abal (atau sertifikat properti bermasalah). Modal nyangkut, susah dijual.'+fx({stres:+6}),'bad'); leg(-1,-1); }
      else { const jual=Math.round(cost*(q==='bagus'?ri(150,215):ri(110,140))/100); addLog('Anda memutar aset itu dan menjualnya kembali. Untung bersih '+rp(jual-cost)+'.'+fx({kas:+jual}),'good'); leg(1,0); }
      break;
    }
    case 'dana':{
      const dana=cost;
      if(q==='jebakan'){
        if(r()<0.5){ P.utang+=Math.round(dana*1.4); P.kas+=dana; P.heat=clamp(P.heat+8,0,100); addLog('Dana cair... tapi ini rentenir berbunga mencekik dengan jaminan aset. Anda terjerat lebih dalam.'+fx({stres:+8}),'bad'); leg(-1,-2); }
        else { addLog('"Investor" minta transfer biaya administrasi dulu sebagai syarat pencairan. Anda kirim, ia raib. Investasi bodong klasik.'+fx({kas:-Math.round(dana*0.1),stres:+6}),'bad'); leg(-1,-1); }
      } else {
        const dilusi=neg?0.08:0.16;
        if(P.usaha.length){ const u=P.usaha.slice().sort((a,b)=>nilaiUsaha(b)-nilaiUsaha(a))[0]; u.milik=clamp(u.milik-dilusi,0.25,1); }
        P.kas+=dana;
        addLog('Investor menyuntik modal segar '+rp(dana)+(P.usaha.length?', menukar '+Math.round(dilusi*100)+'% saham usaha utama Anda.':'.')+fx({relasi:+3}),'good'); leg(1,2);
      }
      break;
    }
    case 'mitra':{
      if(q==='jebakan'){ addLog('Mitra Anda membawa kabur modal patungan dan menghilang ke luar kota. Pelajaran mahal soal kepercayaan.'+fx({stres:+8,relasi:-3}),'bad'); leg(-2,-2); }
      else { const s=c.sektor; const u=bukaUsahaObj(s.k,Math.round(cost*1.6),{kinerja:ri(60,78),brand:ri(15,30),milik:0.55}); P.usaha.push(u); P.usahaDibuka++;
        addLog('Joint venture <b>'+u.n+'</b> ('+s.n+') berdiri. Anda pegang 55%, mitra menanggung sisanya — modal & risiko dibagi.'+fx({relasi:+3}),'good'); leg(2,1); cekSkalaAch(); }
      break;
    }
  }
}
