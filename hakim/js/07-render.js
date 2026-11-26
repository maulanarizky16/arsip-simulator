'use strict';
/* ================= MAJU TAHUN ================= */
function advance(){
  if(!P||G.current||G.over)return;
  P.age++; N.tahun++;
  P.used={}; G.acted=0;
  yearHeader();
  drift();
  if(P.alive&&P.penjara<=0&&!P.retired&&!P.dipecat)sidang();
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
  const pct=Math.round(val);
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
function jabLabel(){
  if(P.penjara>0)return 'Terpidana ('+P.penjara+' th)';
  if(P.dipecat)return 'Dipecat (eks-hakim)';
  if(P.retired)return 'Pensiunan '+JAB[P.jab].sing;
  return JAB[P.jab].n+(P.tipikor?' · Tipikor':'');
}
function render(){
  if(!hasDoc||!P)return;
  $('hdrNow').textContent='TAHUN '+N.tahun+' • USIA '+P.age;
  $('iNama').textContent=P.nama+', '+P.gelar;
  $('iUmur').textContent=P.age+' th / '+N.tahun;
  $('iJab').textContent=jabLabel();
  $('iPos').textContent=(P.dipecat||P.penjara>0)?'—':P.posisi;
  const u=$('iUang'); u.textContent=rp(P.money); u.classList.toggle('neg',P.money<0);
  $('iGelap').textContent=P.gelap>0?rp(P.gelap):'—';
  $('stats').innerHTML=bar('Integritas',P.st.integritas)+bar('Kompetensi',P.st.kompetensi)+
    bar('Reputasi',P.st.reputasi)+bar('Nyali',P.st.nyali)+bar('Kesehatan',P.st.kesehatan)+
    bar('Stres',P.st.stres,true)+bar('Sorotan KY/KPK',P.heat,true);
  /* meja hakim */
  let mj='<div class="idrow"><span class="lab">Perkara ditangani</span><b>'+P.perkara+'</b></div>'+
    '<div class="idrow"><span class="lab">Putusan adil</span><b>'+P.adil+'</b></div>'+
    '<div class="idrow"><span class="lab">Menyimpang</span><b>'+P.takadil+'</b></div>'+
    '<div class="idrow"><span class="lab">Suap diterima</span><b>'+P.suapTerima+'×</b></div>';
  if(P.mediasi>0)mj+='<div class="idrow"><span class="lab">Perkara didamaikan</span><b>'+P.mediasi+'×</b></div>';
  if(P.dissent>0)mj+='<div class="idrow"><span class="lab">Dissenting opinion</span><b>'+P.dissent+'</b></div>';
  if(P.vonisMati>0)mj+='<div class="idrow"><span class="lab">Vonis mati</span><b>'+P.vonisMati+'</b></div>';
  if(P.mundur>0)mj+='<div class="idrow"><span class="lab">Perkara dimundurkan</span><b>'+P.mundur+'×</b></div>';
  mj+='<div class="idrow"><span class="lab">Koneksi & backing</span><b>'+P.koneksi+'/100</b></div>';
  mj+='<div class="idrow"><span class="lab">Lama bertugas</span><b>'+P.years+' th</b></div>';
  $('meja2').innerHTML=mj;
  /* wibawa peradilan */
  $('peradilan').innerHTML=nbar('Kepercayaan publik',N.kepercayaan)+
    '<div class="idrow"><span class="lab">Rasio adil</span><b>'+(P.perkara?Math.round(P.adil/((P.adil+P.takadil)||1)*100):0)+'%</b></div>';
  $('butuh').textContent=N.kepercayaan>=60?'Publik mulai percaya lagi pada pengadilan.':N.kepercayaan>=40?'Wibawa peradilan biasa saja di mata publik.':'Publik makin tak percaya pada lembaga peradilan.';
  /* riwayat */
  let f='';
  if(P.keluarga)f+='<div class="fr"><span>Keluarga</span><span>menikah'+(P.anak?' · '+P.anak+' anak':'')+'</span></div>';
  if(P.tipikor)f+='<div class="fr"><span>Penugasan</span><span>Hakim Tipikor</span></div>';
  if(P.study>0)f+='<div class="fr"><span>Studi S3</span><span>sisa '+P.study+' th</span></div>';
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
