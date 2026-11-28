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
/* peta dunia skematis (SVG): biru-hijau = negara Anda · merah = lawan · abu-abu = sudah kalah perang */
function petaDunia(){
  const d=dunia().kalah;
  let s='<svg class="peta-dunia" viewBox="56 16 290 124" role="img" aria-label="Peta dunia: negara yang sudah kalah berwarna abu-abu">';
  for(const y of [40,75,110])s+='<line class="pd-grid" x1="50" y1="'+y+'" x2="350" y2="'+y+'"/>';
  for(const x of [100,150,200,250,300])s+='<line class="pd-grid" x1="'+x+'" y1="14" x2="'+x+'" y2="140"/>';
  /* garis perbatasan darat */
  for(const p of BATAS_DARAT){ const [a,b]=p.split('-'); if(!POS[a]||!POS[b])continue;
    const perang=P&&P.neg&&P.lawan&&((a===P.neg&&b===P.lawan)||(b===P.neg&&a===P.lawan));
    s+='<line class="pd-batas'+(perang?' perang':'')+'" x1="'+POS[a][0]+'" y1="'+POS[a][1]+'" x2="'+POS[b][0]+'" y2="'+POS[b][1]+'"/>'; }
  /* garis perang untuk lawan yang terpisah laut */
  if(P&&P.neg&&P.lawan&&!berbatasan(P.neg,P.lawan)&&POS[P.neg]&&POS[P.lawan])
    s+='<line class="pd-batas perang laut" x1="'+POS[P.neg][0]+'" y1="'+POS[P.neg][1]+'" x2="'+POS[P.lawan][0]+'" y2="'+POS[P.lawan][1]+'"/>';
  for(const c of NEGARA){ const q=POS[c.k]; if(!q)continue;
    const cls=d[c.k]?'mati':(P&&c.k===P.neg)?'kita':(P&&c.k===P.lawan)?'lawan':'';
    const ket=c.n+(d[c.k]?' — sudah kalah ('+d[c.k].sebab+')':cls==='kita'?' — negara Anda':cls==='lawan'?' — lawan':'');
    s+='<g class="pd-neg '+cls+'"><title>'+ket+'</title><rect x="'+(q[0]-9)+'" y="'+(q[1]-4.6)+'" width="18" height="9.2" rx="2"/>'+
      '<text x="'+q[0]+'" y="'+(q[1]+2.2)+'">'+KODE[c.k]+'</text>'+(cls==='kita'||cls==='lawan'?'<text class="pd-nama" x="'+q[0]+'" y="'+(q[1]+9.6)+'">'+c.n+'</text>':'')+(d[c.k]?'<line class="pd-coret" x1="'+(q[0]-8)+'" y1="'+(q[1]+3.6)+'" x2="'+(q[0]+8)+'" y2="'+(q[1]-3.6)+'"/>':'')+'</g>'; }
  s+='</svg>';
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
