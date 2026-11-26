'use strict';
/* ================= MAJU TAHUN ================= */
function advance(){
  if(!P||G.current||G.over)return;
  P.age++; N.tahun++;
  P.used={}; G.acted=0;
  yearHeader();
  rollEkonomi();
  drift();
  if(P.alive&&P.penjara<=0&&!P.retired)peluang();
  if(P.alive&&P.penjara<=0)events();
  if(P.alive)deathCheck();
  if(P.alive)checkAch();
  render();
}

/* ================= RENDER ================= */
function renderKartu(){
  if(!hasDoc)return;
  const k=$('kartu');
  if(!G.current){k.innerHTML='';return;}
  const d=G.current;
  k.innerHTML='<div class="kartu"><div class="kh">LEMBAR KEPUTUSAN — '+d.title+'</div>'+
    '<div class="kt">'+d.text+'</div>'+
    d.opts.map((o,i)=>'<button data-i="'+i+'"><span class="num">'+(i+1)+'.</span> '+o.t+(o.sub?'<small>'+o.sub+'</small>':'')+'</button>').join('')+
    '</div>';
  if(G._kartuFocus!==d){ G._kartuFocus=d; const fb=k.querySelector('button'); if(fb)fb.focus(); }
}
function bar(label,val,invert){
  const pct=Math.round(clamp(val,0,100));
  const cls=invert?(pct>66?'low':pct>33?'mid':''):(pct<34?'low':pct<67?'mid':'');
  return '<div class="stat"><div class="sl"><span>'+label+'</span><span>'+pct+'</span></div>'+
    '<div class="sbar"><i class="'+cls+'" style="width:'+pct+'%"></i></div></div>';
}
function nbar(label,val,invert){
  const pct=Math.round(clamp(val,0,100));
  const cls=invert?(pct>66?'low':pct>33?'mid':''):(pct<34?'low':pct<67?'mid':'');
  return '<div class="ng"><div class="nl"><span>'+label+'</span><span>'+Math.round(val)+'</span></div>'+
    '<div class="sbar"><i class="'+cls+'" style="width:'+pct+'%"></i></div></div>';
}
function miniBar(val){
  const pct=Math.round(clamp(val,0,100));
  const cls=pct<34?'low':pct<67?'mid':'';
  return '<div class="sbar"><i class="'+cls+'" style="width:'+pct+'%"></i></div>';
}
const EKON_LBL={boom:'Boom (tumbuh pesat)',normal:'Normal',resesi:'Resesi (lesu)'};
function render(){
  if(!hasDoc||!P)return;
  $('hdrNow').textContent='TAHUN '+N.tahun+' • USIA '+P.age;
  $('iNama').textContent=P.nama+(P.penjara>0?' (terpidana)':P.retired?' (pensiun)':'');
  $('iUmur').textContent=P.age+' th / '+N.tahun;
  const net=netWorth();
  const nw=$('iNet'); nw.textContent=rp(net); nw.classList.toggle('neg',net<0);
  const kk=$('iKas'); kk.textContent=rp(P.kas)+' / utang '+rp(P.utang); kk.classList.toggle('neg',P.kas<0);
  $('iGelap').textContent=P.gelap>0?rp(P.gelap):'—';
  $('stats').innerHTML=bar('Naluri Bisnis',P.st.bisnis)+bar('Operasional',P.st.operasi)+
    bar('Pemasaran',P.st.pemasaran)+bar('Finansial',P.st.finansial)+bar('Relasi & Koneksi',P.st.relasi)+
    bar('Reputasi',P.reputasi)+bar('Kesehatan',P.st.kesehatan)+
    bar('Stres',P.st.stres,true)+bar('Sorotan hukum',P.heat,true);
  /* portofolio usaha */
  let bl='';
  if(P.usaha.length){
    for(const u of P.usaha){
      const tag=[];
      if(u.waralaba)tag.push('waralaba');
      if(u.proyek>0)tag.push('proyek '+u.proyek+'th');
      if(u.k==='tek'&&(u.kinerja+u.brand)<110)tag.push('runway '+(u.runway||0)+'th');
      if(u.keyKaryawan>0)tag.push('★'+u.keyKaryawan);
      bl+='<div class="biz-row"><span class="bn">'+u.n+'<small><span class="tag-sek">'+SEKTOR_MAP[u.k].n+'</span> '+SKALA_LBL[u.skala]+' · pangsa '+(u.share||5)+'%'+(u.milik<1?(' · milik '+Math.round(u.milik*100)+'%'):'')+(tag.length?' · '+tag.join(' · '):'')+'</small></span>'+
        '<span class="bbar">'+miniBar(u.kinerja)+'</span><span class="bsk">'+u.kinerja+'%</span></div>';
    }
  } else bl='<span class="muted">Belum punya usaha. Buka usaha pertamamu di laci "Usaha & Operasi".</span>';
  $('bizList').innerHTML=bl;
  $('bizNote').textContent=P.usaha.length?(P.usaha.length+' usaha · '+jumlahSektor()+' sektor · '+totalKaryawan()+' karyawan · skala tertinggi '+(SKALA_LBL[maxSkala()]||'—')):'';
  /* ekonomi & pasar */
  /* harga/komoditas sektor yang sedang digeluti pemain (kalau ada), atau sektor tren */
  let hargaTxt='';
  const sekPunya=[...new Set(P.usaha.map(u=>u.k))].slice(0,4);
  const sekTampil=sekPunya.length?sekPunya:[N.tren];
  for(const k of sekTampil){
    const h=(N.harga&&N.harga[k])?N.harga[k]:1;
    const arah=h>=1.15?'▲':h<=0.85?'▼':'·';
    hargaTxt+='<div class="idrow"><span class="lab">Harga '+SEKTOR_MAP[k].n+'</span><b>'+arah+' '+Math.round(h*100)+'%</b></div>';
  }
  $('pasar').innerHTML=
    '<div class="idrow"><span class="lab">Kondisi ekonomi</span><b>'+(EKON_LBL[N.ekonomi]||'—')+'</b></div>'+
    '<div class="idrow"><span class="lab">Tren pasar</span><b>'+SEKTOR_MAP[N.tren].n+'</b></div>'+
    (N.pandemiSisa>0?'<div class="idrow"><span class="lab">Wabah</span><b style="color:var(--red)">pemulihan '+N.pandemiSisa+' th lagi</b></div>':'')+
    hargaTxt+
    '<div class="idrow"><span class="lab">Inflasi / bunga</span><b>'+N.inflasi+'% / '+N.suku+'%</b></div>'+
    '<div class="idrow"><span class="lab">Pajak</span><b>'+(P.modusPajak==='patuh'?'Patuh':'Menghindar')+'</b></div>'+
    nbar('Daya beli konsumen',N.daya)+
    nbar('Kesejahteraan pekerja',P.buruh);
  $('butuh').textContent=N.pandemiSisa>0?'Wabah menekan sebagian sektor — alihkan fokus ke sektor yang panen.':N.ekonomi==='resesi'?'Resesi: jaga kas, hati-hati ekspansi.':N.ekonomi==='boom'?'Ekonomi boom: saat tepat berekspansi & menanam modal.':P.heat>=50?'Sorotan hukum tinggi — bersihkan jejak sebelum diperiksa.':'Pasar stabil, jalankan strategimu.';
  /* riwayat */
  let f='';
  if(P.keluarga)f+='<div class="fr"><span>Keluarga</span><span>menikah'+(P.anak?' · '+P.anak+' anak':'')+'</span></div>';
  if(P.hajiDone)f+='<div class="fr"><span>Spiritual</span><span>sudah berhaji</span></div>';
  const rw=P.riwayat.slice(-6).reverse();
  for(const x of rw)f+='<div class="fr"><span>'+x.th+'</span><span>'+x.t+'</span></div>';
  $('riwayat').innerHTML=f||'<span class="muted">Belum ada catatan.</span>';
  const ak=Object.keys(P.ach);
  $('ach').innerHTML=ak.length?ak.map(k=>'<span class="chip au">'+ACH_DEF[k]+'</span>').join(''):'<span class="muted">Belum ada.</span>';
  /* tabs */
  $('tabs').innerHTML=TABS.map(t=>'<button data-tab="'+t[0]+'" class="'+(G.tab===t[0]?'on':'')+'" role="tab">'+t[1]+'</button>').join('');
  /* meja aksi */
  const busy=!!G.current||G.over;
  let html='';
  for(const a of ACTS.filter(a=>a.tab===G.tab)){
    const av=actAvail(a);
    if(!av.ok&&a.cond&&!a.cond()&&!av.used&&av.why==='Syarat belum terpenuhi')continue;
    const dis=busy||!av.ok;
    html+='<button data-act="'+a.k+'" '+(dis?'disabled':'')+' class="'+(av.used?'used':'')+'" title="'+(av.ok?'':av.why||'')+'">'+
      '<b>'+a.lbl+(a.multi?' ↻':'')+'</b><span>'+(a.sub||'')+'</span></button>';
  }
  if(!html)html='<div class="empty">Tidak ada aksi tersedia di laci ini.</div>';
  $('acts').innerHTML=html;
  $('actInfo').textContent=G.over?'':(P.penjara>0?'Anda di dalam lapas — hanya bisa menjalani waktu.':(G.acted>5?'Tahun yang padat — stres merayap naik.':'Aksi bertanda ↻ bisa diulang dalam setahun; lainnya sekali per tahun.'));
  $('nextBtn').disabled=!!G.current||G.over;
  renderKartu();
  saveGame();
}
