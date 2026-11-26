'use strict';
/* ================= MAJU SEBULAN ================= */
function advance(){
  if(!P||G.current||G.over)return;
  if(N.ke>=TOTAL_BULAN){ akhir('tahan'); render(); return; }
  N.ke++; N.bulan++;
  if(N.bulan>12){ N.bulan=1; N.tahun++; P.age++; }
  P.used={}; G.acted=0;
  monthHeader();
  bulanan();
  kerjaCek();
  drift();
  kalender();
  events();
  utangCek();
  if(!G.over)saldoCek();
  endCheck();
  if(!G.over)checkAch();
  render();
}

/* ================= RENDER ================= */
function renderKartu(){
  if(!hasDoc)return;
  const k=$('kartu');
  if(!G.current){k.innerHTML='';return;}
  const d=G.current;
  k.innerHTML='<div class="kartu"><div class="kh">'+d.title+'</div>'+
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
function render(){
  if(!hasDoc||!P)return;
  $('hdrNow').textContent=BULAN[N.bulan-1].toUpperCase()+' '+N.tahun+' • BULAN '+N.ke+'/'+TOTAL_BULAN;
  $('iNama').textContent=P.nama;
  $('iLatar').textContent=P.latarN||'—';
  $('iUmur').textContent=P.age+' th · '+P.kota;
  $('iKerja').textContent=P.profesi?P.profesiN+(P.pppk?' (PPPK)':''):'Pencari kerja';
  $('iGaji').textContent=P.profesi?(PROF[P.profesi].vari?'±':'')+rp(P.gaji)+'/bln':'—';
  const s=$('iSaldo'); s.textContent=rp(P.saldo); s.classList.toggle('neg',P.saldo<0);
  const u=$('iUtang'); u.textContent=P.utang>0?rp(P.utang):'—'; u.classList.toggle('neg',P.utang>0);
  $('stats').innerHTML=bar('Kewarasan',P.st.waras)+bar('Kesehatan',P.st.sehat)+bar('Gengsi',P.st.gengsi)+
    bar('Nrimo',P.st.nrimo)+bar('Relasi',P.st.relasi)+bar('Skill',P.skill);
  /* dompet & cicilan */
  const biaya=biayaPokok();
  let dp='<div class="idrow"><span class="lab">Biaya hidup/bulan</span><b>±'+rp(biaya)+'</b></div>'+
    (P.kiriman?'<div class="idrow"><span class="lab">'+(P.kiriman>0?'Transfer ortu/bulan':'Kirim ke keluarga/bulan')+'</span><b>'+(P.kiriman>0?'+':'')+rp(P.kiriman)+'</b></div>':'')+
    '<div class="idrow"><span class="lab">Tabungan</span><b>'+rp(P.tabungan)+'</b></div>'+
    '<div class="idrow"><span class="lab">Emas</span><b>'+rp(P.emas)+'</b></div>'+
    '<div class="idrow"><span class="lab">Kekayaan bersih</span><b class="uang'+(netWorth()<0?' neg':'')+'">'+rp(netWorth())+'</b></div>';
  for(const c of P.cicilan)dp+='<div class="cic-row"><span>'+c.n+'</span><span>'+rp(c.per)+'/bln <small>· '+c.sisa+' bln lagi</small></span></div>';
  if(P.arisan)dp+='<div class="cic-row"><span>Arisan</span><span>'+rp(300e3)+'/bln <small>· '+(N.ke<P.arisanDapat?'giliran bulan ke-'+P.arisanDapat:'sudah dapat')+'</small></span></div>';
  $('dompet').innerHTML=dp;
  $('dompetWarn').textContent=P.utang>0?'Utang pinjol berbunga 5%/bulan. Lunasi secepatnya!':(P.saldo<biaya*0.5?'Saldo tidak cukup untuk biaya bulan depan.':'');
  /* kondisi */
  $('kondisi').innerHTML=
    '<div class="idrow"><span class="lab">Gaya hidup</span><b>'+P.gaya+'</b></div>'+
    (P.orangDalam?'<div class="idrow"><span class="lab">Orang dalam</span><b>Ada (privilege aktif)</b></div>':'')+
    '<div class="idrow"><span class="lab">Indeks harga</span><b>'+(N.harga>=1.005?'▲ ':'')+Math.round(N.harga*1000)/10+'%</b></div>'+
    '<div class="idrow"><span class="lab">Tempat tinggal</span><b>'+(P.rumah?'Rumah sendiri (KPR)':'Kos')+'</b></div>'+
    '<div class="idrow"><span class="lab">Kendaraan</span><b>'+(P.motor?'Motor':'Angkot & ojol')+'</b></div>'+
    '<div class="idrow"><span class="lab">Status</span><b>'+(P.menikah?'Menikah':P.pasangan?'Pacaran':'Jomblo')+'</b></div>';
  /* riwayat */
  const rw=P.riwayat.slice(-6).reverse();
  $('riwayat').innerHTML=rw.length?rw.map(x=>'<div class="fr"><span>'+x.th+'</span><span>'+x.t+'</span></div>').join(''):'<span class="muted">Belum ada catatan.</span>';
  const ak=Object.keys(P.ach);
  $('ach').innerHTML=ak.length?ak.map(k=>'<span class="chip au">'+ACH_DEF[k]+'</span>').join(''):'<span class="muted">Belum ada.</span>';
  /* tabs & meja aksi */
  $('tabs').innerHTML=TABS.map(t=>'<button data-tab="'+t[0]+'" class="'+(G.tab===t[0]?'on':'')+'" role="tab">'+t[1]+'</button>').join('');
  const busy=!!G.current||G.over;
  let html='';
  for(const a of ACTS.filter(a=>a.tab===G.tab)){
    const av=actAvail(a);
    if(!av.ok&&!av.used)continue;
    const dis=busy||!av.ok;
    html+='<button data-act="'+a.k+'" '+(dis?'disabled':'')+' class="'+(av.used?'used':'')+'" title="'+(av.ok?'':av.why||'')+'">'+
      '<b>'+a.lbl+(a.multi?' ↻':'')+'</b><span>'+(a.sub||'')+'</span></button>';
  }
  if(!html)html='<div class="empty">Tidak ada aksi tersedia di laci ini.</div>';
  $('acts').innerHTML=html;
  $('actInfo').textContent=G.over?'':(G.acted>3?'Bulan yang padat — kewarasan terkikis.':'Aksi bertanda ↻ bisa diulang; lainnya sekali per bulan.');
  $('nextBtn').disabled=!!G.current||G.over;
  $('nextBtn').textContent=N.ke>=TOTAL_BULAN?'Selesaikan 3 Tahun »':'Jalani Bulan +1 »';
  if(window.ArsipArt)ArsipArt.update('wni',P);
  renderKartu();
  saveGame();
}
