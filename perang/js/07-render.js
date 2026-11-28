'use strict';
/* ================= MAJU SATU MINGGU ================= */
function advance(){
  if(!P||!P.f||G.current||G.over)return;
  P.used={}; G.acted=0;
  tempur();
  ekonomi();
  cekAkhir();
  if(G.over){ render(); return; }
  N.minggu++;
  yearHeader();
  events();
  if(!G.over&&!G.current)cekAkhir();
  if(!G.over)aiMusuh();
  if(!G.over)checkAch(false);
  render();
}

/* ================= RENDER ================= */
function renderKartu(){
  if(!hasDoc)return;
  const k=$('kartu');
  if(!G.current){k.innerHTML='';return;}
  const d=G.current;
  k.innerHTML='<div class="kartu"><div class="kh">PERINTAH OPERASI — '+d.title+'</div>'+
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
/* batang dua arah (−100…+100): bagian kiri = dikuasai kita */
function dwiBar(label,val,kiri,kanan){
  const pct=Math.round(clamp((val+100)/2,0,100));
  return '<div class="dwi"><div class="sl"><span>'+label+'</span><span>'+(val>0?'+':'')+Math.round(val)+'</span></div>'+
    '<div class="dbar"><i style="width:'+pct+'%"></i><em style="left:50%"></em></div>'+
    '<div class="dl"><span>'+kiri+'</span><span>'+kanan+'</span></div></div>';
}
/* peta dunia (SVG, garis negara dari Natural Earth — lihat 01b-peta.js): biru = negara Anda · merah = lawan · abu-abu = sudah kalah */
const PD_VB=[40,36,1040,404];                 /* x, y, lebar, tinggi bagian peta yang ditampilkan */
/* geser label supaya tidak bertumpuk di kawasan padat */
const PD_GESER={prk:[-8,-11],kor:[-2,8],jpn:[18,0],mys:[-38,-14],tha:[-16,-6],vnm:[15,-3],sgp:[-24,11],idn:[12,9],phl:[16,0],isr:[-22,-3],egy:[-8,11],
  pak:[0,-5],ind:[0,7],ukr:[5,-3],deu:[7,-9],fra:[-9,7],gbr:[-11,-9],chn:[-12,5],tur:[2,-3]};
function petaDunia(){
  const d=dunia().kalah;
  const kelas=k=>d[k]?'mati':(P&&k===P.neg)?'kita':(P&&k===P.lawan)?'lawan':'';
  let s='<div class="pd-geser"><svg class="peta-dunia" viewBox="'+PD_VB.join(' ')+'" role="img" aria-label="Peta dunia: negara yang sudah kalah berwarna abu-abu">';
  s+='<path class="pd-lain" d="'+PETA.lain+'"/>';
  for(const c of NEGARA){ if(!PETA.neg[c.k])continue;
    const cls=kelas(c.k);
    s+='<path class="pd-ng '+cls+'" d="'+PETA.neg[c.k]+'"><title>'+c.n+(d[c.k]?' — sudah kalah ('+d[c.k].sebab+')':cls==='kita'?' — negara Anda':cls==='lawan'?' — lawan':'')+'</title></path>'; }
  /* garis perang */
  if(P&&P.neg&&P.lawan&&PETA.titik[P.neg]&&PETA.titik[P.lawan]){ const a=PETA.titik[P.neg], b=PETA.titik[P.lawan];
    s+='<line class="pd-perang" x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'"/>'; }
  /* label kode negara */
  for(const c of NEGARA){ const q=PETA.titik[c.k]; if(!q)continue;
    const g=PD_GESER[c.k]||[0,0], x=q[0]+g[0], y=q[1]+g[1], cls=kelas(c.k);
    if(Math.abs(g[0])+Math.abs(g[1])>=14||!PETA.neg[c.k])s+='<line class="pd-tuntun" x1="'+q[0]+'" y1="'+q[1]+'" x2="'+x+'" y2="'+y+'"/><circle class="pd-titik '+cls+'" cx="'+q[0]+'" cy="'+q[1]+'" r="2.2"/>';
    s+='<g class="pd-lbl '+cls+'"><rect x="'+(x-13)+'" y="'+(y-6.5)+'" width="26" height="13" rx="3"/><text x="'+x+'" y="'+(y+3.4)+'">'+KODE[c.k]+'</text>'+
      (d[c.k]?'<line class="pd-coret" x1="'+(x-11)+'" y1="'+(y+5)+'" x2="'+(x+11)+'" y2="'+(y-5)+'"/>':'')+'</g>'; }
  s+='</svg></div>';
  const mati=Object.keys(d);
  s+='<div class="pd-leg"><span><i class="kita"></i>Anda</span><span><i class="lawan"></i>lawan</span><span><i class="mati"></i>sudah kalah</span></div>';
  s+=mati.length?'<div class="butuh" style="color:var(--ink2)">Sudah kalah: '+mati.map(k=>NEG[k]?NEG[k].n:k).join(', ')+'. <button type="button" class="pd-reset" data-pulih="1">Pulihkan peta</button></div>'
    :'<div class="butuh" style="color:var(--ink2)">Belum ada negara yang tumbang. Negara yang kalah total akan menjadi abu-abu dan tidak bisa dipilih lagi.</div>';
  return s;
}
function kira(v){ /* tanpa intelijen, kekuatan lawan hanya perkiraan kasar */
  if(P.intel>0)return bil(v);
  if(v<10)return v<1?'0':'<10';
  const p=Math.pow(10,Math.floor(Math.log10(v))); return '±'+bil(Math.round(v/p)*p);
}
function render(){
  if(!hasDoc||!P)return;
  const siap=!!P.f;
  $('hdrNow').textContent=siap?tanggalPerang():'PENYIAPAN';
  $('dunia').innerHTML=petaDunia();
  /* layar sempit: peta lebih lebar dari layar & bisa digeser; mulai dari negara pemain */
  { const g=$('dunia').querySelector('.pd-geser'); if(g&&g.scrollWidth>g.clientWidth+4){ const q=PETA.titik[P.neg||'idn']; g.scrollLeft=Math.max(0,(q[0]-PD_VB[0])/PD_VB[2]*g.scrollWidth-g.clientWidth/2); } }
  $('iNama').textContent='Jenderal '+P.nama;
  $('iNeg').textContent=P.neg?NEG[P.neg].n:'—';
  $('iLawan').textContent=P.lawan?NEG[P.lawan].n:'—';
  $('iTujuan').textContent=P.tujuan?TUJUAN[P.tujuan].n:'—';
  const u=$('iDana'); u.textContent=siap?usd(P.dana):'—'; u.classList.toggle('neg',P.dana<0);
  $('iArus').textContent=siap?('+'+usd(pendapatanMinggu()).replace('US$ ','')+' / −'+usd(biayaMinggu()).replace('US$ ','')):'—';
  if(siap){
    const B=N.e, cB=NEG[B.k];
    $('stats').innerHTML=bar('Moral pasukan',P.st.moral)+bar('Logistik',P.st.logistik)+bar('Amunisi',P.st.amunisi)+
      bar('Dukungan rakyat',P.st.publik)+bar('Dukungan dunia',P.st.dunia)+(N.eskalasi>0||cB.nuklir||NEG[P.neg].nuklir?bar('Eskalasi nuklir',N.eskalasi,true):'');
    /* peta perang */
    $('peta').innerHTML=dwiBar('Garis depan',N.front,'ibu kota kita','ibu kota lawan')+
      '<div class="butuh" style="color:var(--ink2)">Garis depan '+teksFront()+'. '+(N.seberang?'Terpisah laut.':'Berbatasan darat.')+' Medan lawan: '+MEDAN_N[cB.geo]+'.'+(N.cuaca==='lumpur'?' <b>Musim lumpur.</b>':'')+'</div>'+
      dwiBar('Udara',N.udara,'dikuasai lawan','dikuasai kita')+dwiBar('Laut',N.laut,'dikuasai lawan','dikuasai kita')+
      '<div class="idrow"><span class="lab">Postur Anda</span><b>'+DARAT[P.post.d].n+' · '+UDARA[P.post.u].n+' · '+LAUT[P.post.l].n+'</b></div>'+
      '<div class="idrow"><span class="lab">Postur lawan</span><b>'+(P.intel>0?DARAT[B.post.d].n+' · '+UDARA[B.post.u].n+' · '+LAUT[B.post.l].n:'tidak diketahui (butuh intelijen)')+'</b></div>'+
      (P.intel>0?'<div class="idrow"><span class="lab">Lawan: moral / logistik / amunisi / tekad</span><b>'+Math.round(B.st.moral)+' / '+Math.round(B.st.logistik)+' / '+Math.round(B.st.amunisi)+' / '+Math.round(B.st.tekad)+'</b></div>':'')+
      (P.fort?'<div class="idrow"><span class="lab">Garis pertahanan</span><b>kubu '+P.fort+'/5</b></div>':'');
    /* kekuatan */
    const baris=[['Pasukan','pasukan',1],['Cadangan','cad',1],['Tank','tank'],['Pesawat tempur','jet'],['Heli serang','heli'],['Kapal perang','kapal'],['Kapal selam','selam'],['Kapal induk','induk'],['Drone','drone'],['Rudal jelajah','rudal']];
    $('kuat').innerHTML='<table class="kt2"><tr><th></th><th>'+NEG[P.neg].n+'</th><th>'+cB.n+'</th></tr>'+
      baris.filter(b=>P.f[b[1]]>=0.5||B.f[b[1]]>=0.5).map(b=>'<tr><td>'+b[0]+'</td><td>'+(b[2]?org(P.f[b[1]]):bil(P.f[b[1]]))+'</td><td>'+(b[2]?(P.intel>0?org(B.f[b[1]]):kira(B.f[b[1]]*1000)):kira(B.f[b[1]]))+'</td></tr>').join('')+'</table>'+
      (P.pesanan.length?'<div class="butuh" style="color:var(--ink2)">Dalam pengiriman: '+P.pesanan.map(x=>x.n+' (mg '+x.tiba+')').join('; ')+'</div>':'');
    $('korban').innerHTML='<div class="idrow"><span class="lab">Prajurit gugur</span><b>'+org(P.tewas)+'</b></div>'+
      '<div class="idrow"><span class="lab">Prajurit lawan gugur (taksiran)</span><b>±'+org(P.tewasLawan)+'</b></div>'+
      '<div class="idrow"><span class="lab">Warga sipil lawan tewas</span><b>'+org(P.sipilLawan)+'</b></div>'+
      '<div class="idrow"><span class="lab">Warga sipil kita tewas</span><b>'+org(P.sipilKita)+'</b></div>'+
      (P.kejahatan?'<div class="idrow"><span class="lab">Kejahatan perang</span><b style="color:var(--red)">'+P.kejahatan+'</b></div>':'');
  } else {
    $('stats').innerHTML=''; $('peta').innerHTML='<span class="muted">Pilih negara, lawan, dan tujuan perang.</span>'; $('kuat').innerHTML='<span class="muted">—</span>'; $('korban').innerHTML='<span class="muted">—</span>';
  }
  const rw=P.riwayat.slice(-6).reverse(); let f='';
  for(const x of rw)f+='<div class="fr"><span>'+x.th+'</span><span>'+x.t+'</span></div>';
  $('riwayat').innerHTML=f||'<span class="muted">Belum ada catatan.</span>';
  const ak=Object.keys(P.ach);
  $('ach').innerHTML=ak.length?ak.map(k=>'<span class="chip au">'+ACH_DEF[k]+'</span>').join(''):'<span class="muted">Belum ada.</span>';
  /* tabs & meja komando */
  $('tabs').innerHTML=TABS.map(t=>'<button data-tab="'+t[0]+'" class="'+(G.tab===t[0]?'on':'')+'" role="tab">'+t[1]+'</button>').join('');
  const busy=!!G.current||G.over||!siap;
  let html='';
  if(siap)for(const a of ACTS.filter(a=>a.tab===G.tab)){
    const av=actAvail(a);
    if(!av.ok&&a.cond&&!a.cond()&&!av.used)continue;
    const dis=busy||!av.ok;
    html+='<button data-act="'+a.k+'" '+(dis?'disabled':'')+' class="'+(av.used?'used':'')+(a.postur?' postur':'')+'" title="'+(av.ok?'':av.why||'')+'">'+
      '<b>'+a.lbl+(a.postur?'':' ◆')+'</b><span>'+(a.sub||'')+'</span></button>';
  }
  if(!html)html='<div class="empty">'+(siap?'Tidak ada perintah tersedia di laci ini.':'Meja komando terbuka setelah perang dimulai.')+'</div>';
  $('acts').innerHTML=html;
  $('actInfo').textContent=G.over||!siap?'':'Perintah khusus (◆) minggu ini: '+G.acted+'/'+MAKS_PERINTAH+'. Postur bisa diubah kapan saja.';
  $('nextBtn').disabled=!!G.current||G.over||!siap;
  if(window.ArsipArt)ArsipArt.update('perang',P);
  renderKartu();
  saveGame();
}
