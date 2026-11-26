'use strict';
/* ================= MAJU TAHUN ================= */
function advance(){
  if(!P||G.current||G.over)return;
  P.age++; N.tahun++;
  P.used={}; G.acted=0;
  yearHeader();
  negaraDrift();
  drift();
  if(P.alive&&P.penjara<=0)events();
  if(P.alive)kasusCheck();
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
function kebutuhan(){
  /* kepala daerah: acuan sorotan adalah indikator daerahnya, bukan nasional */
  if(isKepda()&&P.jabData&&P.jabData.daerah){
    const D=P.jabData.daerah;
    const md=[['infrastruktur daerah tertinggal',100-D.infra],['ekonomi daerah lesu',100-D.ekonomi],
      ['kesejahteraan warga rendah',100-D.sejahtera],['layanan publik buruk',100-D.layanan],['warga kurang puas',100-D.kepuasan]];
    md.sort((a,b)=>b[1]-a[1]);
    return md[0][0]+' (di '+P.jabData.wilayah+')';
  }
  const m=[
    ['kemiskinan tinggi',clamp(N.kemiskinan*2.4,0,100)],
    ['ekonomi lesu',100-N.ekonomi],
    ['inflasi liar',N.inflasi*4],
    ['pengangguran masif',N.pengangguran*4],
    ['korupsi merajalela',N.korupsi],
    ['infrastruktur tertinggal',100-N.infra],
    ['layanan kesehatan buruk',100-N.keswa],
    ['pendidikan tertinggal',100-N.pendidikan],
    ['kerusakan lingkungan',100-N.lingkungan],
    ['kebebasan sipil terkikis',100-N.kebebasan],
    ['demokrasi merosot',100-N.demokrasi],
    ['keamanan rawan',100-N.keamanan],
    ['militer rapuh',(100-N.militer)*0.6],
    ['diplomasi memburuk',(100-N.diplomasi)*0.6]
  ];
  if(N.perang)m.push(['perang berkecamuk',95]);
  if(N.separatis)m.push(['ancaman separatis',85]);
  if(N.sanksi)m.push(['sanksi internasional',85]);
  m.sort((a,b)=>b[1]-a[1]);
  return m[0][0];
}
function sektorNama(s){ return {korupsi:'pemberantasan korupsi',kas:'keuangan negara',infra:'infrastruktur',pendidikan:'pendidikan',keswa:'kesehatan publik',lingkungan:'lingkungan',militer:'pertahanan',kemiskinan:'kesejahteraan sosial'}[s]||s; }
function renderJabCard(){
  if(!hasDoc)return;
  const card=$('jabCard');
  if(!P.jab){ card.style.display='none'; return; }
  card.style.display='';
  const k=P.jab.k, j=JAB[k], jd=P.jabData||{};
  function row(l,v){return '<div class="idrow"><span class="lab">'+l+'</span><b>'+v+'</b></div>';}
  function wewenang(t){return '<div class="idrow" style="border:none;padding-top:6px"><span class="lab" style="font-style:italic;font-size:11px;text-align:left">Kewenangan: '+t+'</span></div>';}
  $('jabCardTitle').textContent=j.n.toUpperCase();
  let h='';
  if(j.max2) h+=row('Periode', (P.terms[k]||1)+' / 2'+((P.terms[k]||1)>=2?' · terakhir':''));
  else if(k==='dpr'||k==='dprd') h+=row('Periode ke', (P.terms[k]||1));
  h+=row('Sisa masa', P.jab.sisa+' th'+(k==='menteri'?' (ikut periode)':''));
  h+=row('Gaji jabatan', rp(j.gaji)+'/th');
  if(k==='dpr'||k==='dprd'){
    h+=row('Komisi', jd.komisi?jd.komisi.n:'—');
    h+=row('Fraksi', jd.fraksi||'—');
    h+=row('RUU diperjuangkan', jd.ruu||0);
    h+=wewenang('Legislasi & pengawasan'+(jd.komisi?', fokus '+sektorNama(jd.komisi.sektor):''));
  } else if(k==='walikota'||k==='gubernur'){
    h+=row('Wilayah', jd.wilayah||P.kota);
    h+=row('Pagu APBD', rpT(jd.apbd||0));
    h+=row('Indeks daerah', daerahRata()+'/100');
    const D=jd.daerah||{};
    h+=nbar('Infrastruktur',D.infra||0)+nbar('Ekonomi daerah',D.ekonomi||0)+nbar('Kesejahteraan',D.sejahtera||0)+nbar('Layanan publik',D.layanan||0)+nbar('Kepuasan warga',D.kepuasan||0);
    h+=wewenang('Eksekutif daerah. Acuan capaian Anda = indikator '+(jd.wilayah||P.kota)+', bukan nasional');
  } else if(k==='menteri'){
    h+=row('Portofolio', jd.kementerian?jd.kementerian.n:'—');
    h+=wewenang('Kebijakan sektoral nasional');
  } else if(k==='presiden'){
    h+=row('Periode', (P.terms.presiden||1)+' / 2'+(P.tigaOk?' · +amandemen':''));
    h+=row('Koalisi parlemen', N.koalisi+'/100');
    if(P.wapres)h+=row('Wakil presiden', P.wapres.nama.split(' ')[0]+' ('+P.wapres.label+')');
    if(N.kabinet.length)h+=row('Mutu kabinet', N.kabinetMutu+'/100');
    h+=wewenang('Kebijakan nasional penuh + politik luar negeri & militer');
  }
  $('jabCardBody').innerHTML=h;
}
function render(){
  if(!hasDoc||!P)return;
  $('hdrNow').textContent='TAHUN '+N.tahun+' • USIA '+P.age+(isPemilu()?' • TAHUN POLITIK':' • pemilu dlm '+pemiluIn()+' th');
  $('iNama').textContent=P.nama;
  $('iUmur').textContent=P.age+' th / '+N.tahun;
  $('iJab').textContent=P.penjara>0?'Warga binaan lapas ('+P.penjara+' th)':(P.jab?JAB[P.jab.k].n+(P.jab.k!=='menteri'?' · sisa '+P.jab.sisa+' th':''):(P.retired?'Pensiunan politik':'Warga sipil'));
  $('iEdu').textContent=P.edu+(P.study?' · kuliah '+P.study.target+' ('+P.study.sisa+' th lagi)':'');
  $('iPartai').textContent=P.partai?P.partai.n.replace('Partai ','')+' ('+P.partai.dukungan+')':'—';
  const u=$('iUang'); u.textContent=rp(P.money+P.depo); u.classList.toggle('neg',P.money<0);
  $('iGelap').textContent=P.gelap>0?rp(P.gelap):'—';
  $('stats').innerHTML=bar('Kesehatan',P.st.kesehatan)+bar('Integritas',P.st.integritas)+
    bar('Popularitas',P.st.popularitas)+bar('Pengaruh',P.st.pengaruh)+
    bar('Kompetensi',P.st.kompetensi)+bar('Stres',P.st.stres,true)+bar('Sorotan hukum',P.heat,true);
  renderJabCard();
  /* negara */
  let extra='';
  if(N.mbg)extra+='<div class="idrow"><span class="lab">MBG</span><b>aktif · '+N.mbgThn+' th</b></div>';
  if(N.iknFase>0)extra+='<div class="idrow"><span class="lab">IKN</span><b>fase '+N.iknFase+'/3</b></div>';
  if(N.perang)extra+='<div class="idrow"><span class="lab gelap">PERANG</span><b class="gelap">vs '+N.perang.dengan+' · '+N.perang.thn+' th</b></div>';
  if(N.separatis)extra+='<div class="idrow"><span class="lab gelap">Separatis</span><b class="gelap">'+N.separatis.wilayah+'</b></div>';
  if(N.sanksi)extra+='<div class="idrow"><span class="lab gelap">Sanksi LN</span><b class="gelap">'+N.sanksiThn+' th lagi</b></div>';
  $('negara').innerHTML=
    '<div class="idrow"><span class="lab">Kas negara</span><b>'+rpT(N.kas)+'</b></div>'+
    '<div class="idrow"><span class="lab">Utang</span><b>'+rpT(N.utang)+'</b></div>'+
    '<div class="idrow"><span class="lab">Pajak</span><b>'+N.pajak+'%</b></div>'+
    '<div class="idrow"><span class="lab">Inflasi</span><b>'+N.inflasi.toFixed(1)+'%</b></div>'+
    '<div class="idrow"><span class="lab">Pengangguran</span><b>'+N.pengangguran.toFixed(1)+'%</b></div>'+
    '<div class="idrow"><span class="lab">Kemiskinan</span><b>'+N.kemiskinan.toFixed(1)+'%</b></div>'+
    '<div class="idrow"><span class="lab">Hub. luar negeri</span><b>'+(N.hubLN==='blok_barat'?'condong Barat':N.hubLN==='blok_timur'?'condong Timur':N.hubLN==='non_blok'?'non-blok':'netral')+'</b></div>'+
    '<div class="idrow"><span class="lab">Rezim</span><b>'+(isPres()?'ANDA':N.rezim)+'</b></div>'+
    extra+
    nbar('Ekonomi',N.ekonomi)+nbar('Kepuasan publik',N.mood)+
    nbar('Infrastruktur',N.infra)+nbar('Pendidikan',N.pendidikan)+
    nbar('Kesehatan publik',N.keswa)+nbar('Lingkungan',N.lingkungan)+
    nbar('Kebebasan sipil',N.kebebasan)+nbar('Indeks demokrasi',N.demokrasi)+
    nbar('Keamanan',N.keamanan)+nbar('Militer',N.militer)+
    nbar('Diplomasi',N.diplomasi)+nbar('Indeks korupsi',N.korupsi,true)+
    (isPres()?nbar('Koalisi parlemen',N.koalisi):'')+nbar('Standing pers',N.pers);
  $('butuh').textContent='Sorotan publik saat ini: '+kebutuhan()+'.';
  /* riwayat & keluarga */
  let f='';
  if(P.keluarga)f+='<div class="fr"><span>Keluarga</span><span>menikah'+(P.anak?' · '+P.anak+' anak':'')+'</span></div>';
  if(P.lsm)f+='<div class="fr"><span>LSM</span><span>aktif</span></div>';
  if(P.anakKader)f+='<div class="fr"><span>Dinasti</span><span>anak di politik</span></div>';
  if(P.wapres)f+='<div class="fr"><span>Wapres</span><span>'+P.wapres.nama.split(' ')[0]+'</span></div>';
  if(P.rival)f+='<div class="fr"><span>Rival</span><span>'+P.rival.nama.split(' ')[0]+' · '+(P.rival.hub==='sekutu'?'sekutu':'bebuyutan')+' ('+P.rival.kalah+'–'+P.rival.menang+')</span></div>';
  if(P.janji&&P.janji.length){
    f+='<div class="fr"><span>Janji aktif</span><span>'+P.janji.length+' poin</span></div>';
    for(const c of P.janji){const def=JANJI.find(x=>x.k===c);if(def)f+='<div class="fr"><span class="muted">·</span><span style="font-size:11.5px">'+def.n+'</span></div>';}
  }
  const rw=P.riwayat.slice(-6).reverse();
  for(const x of rw)f+='<div class="fr"><span>'+x.th+'</span><span>'+x.t+'</span></div>';
  $('fam').innerHTML=f||'<span class="muted">Belum ada catatan.</span>';
  const ak=Object.keys(P.ach);
  $('ach').innerHTML=ak.length?ak.map(k=>'<span class="chip au">'+ACH_DEF[k]+'</span>').join(''):'<span class="muted">Belum ada.</span>';
  /* tabs */
  $('tabs').innerHTML=TABS.map(t=>'<button data-tab="'+t[0]+'" class="'+(G.tab===t[0]?'on':'')+'" role="tab">'+t[1]+'</button>').join('');
  /* meja aksi */
  const busy=!!G.current||G.over;
  let html='';
  for(const a of ACTS.filter(a=>a.tab===G.tab)){
    const av=actAvail(a);
    if(!av.ok&&av.why==='Hanya dari dalam lapas')continue;
    if(!av.ok&&a.cond&&!a.cond()&&!av.used&&av.why==='Syarat belum terpenuhi'&&G.tab==='kebijakan')continue;
    const dis=busy||!av.ok;
    html+='<button data-act="'+a.k+'" '+(dis?'disabled':'')+' class="'+(av.used?'used':'')+'" title="'+(av.ok?'':av.why||'')+'">'+
      '<b>'+a.lbl+(a.multi?' ↻':'')+'</b><span>'+(a.sub||'')+'</span></button>';
  }
  if(!html)html='<div class="empty">'+(G.tab==='kebijakan'?'Tidak ada kewenangan kebijakan — raihlah jabatan dulu.':'Tidak ada aksi tersedia di laci ini.')+'</div>';
  $('acts').innerHTML=html;
  $('actInfo').textContent=G.over?'':(P.penjara>0?'Anda di dalam lapas — pilihan terbatas.':(G.acted>5?'Tahun yang sangat padat — stres merayap naik.':'Aksi bertanda ↻ bisa diulang dalam setahun; lainnya sekali per tahun.'));
  $('nextBtn').disabled=!!G.current||G.over;
  if(window.ArsipArt)ArsipArt.update('negara',P);
  renderKartu();
  saveGame();
}

