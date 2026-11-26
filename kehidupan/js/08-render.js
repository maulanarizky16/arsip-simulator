'use strict';
/* ================= RENDER ================= */
function renderKartu(){
  if(!hasDoc)return;
  const k=$('kartu');
  if(!G.current){k.innerHTML='';return;}
  const d=G.current;
  k.innerHTML='<div class="kartu"><div class="kh">FORMULIR KEPUTUSAN — '+d.title+'</div>'+
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
function render(){
  if(!hasDoc||!P)return;
  $('hdrNow').textContent='UMUR '+P.age+' • '+(P.lahir+P.age);
  $('iNama').textContent=P.nama+(P.gen>1?' (Gen. '+P.gen+')':'');
  $('iTtl').textContent=P.kota+', '+P.lahir;
  $('iUmur').textContent=P.age+' tahun';
  $('iEdu').textContent=P.edu;
  $('iStatus').textContent=P.love?(P.love.married?'Menikah dgn '+P.love.nama.split(' ')[0]:'Pacaran dgn '+P.love.nama.split(' ')[0]):'Lajang';
  const u=$('iUang'); u.textContent=rp(P.money); u.classList.toggle('neg',P.money<0);
  const nw=netWorth();
  const n2=$('iNet'); n2.textContent=rp(nw); n2.classList.toggle('neg',nw<0);
  $('stats').innerHTML=bar('Kesehatan',P.st.health)+bar('Kebahagiaan',P.st.happy)+
    bar('Kecerdasan',P.st.smart)+bar('Karisma',P.st.charm)+bar('Relasi',P.st.relasi)+
    bar('Daya tahan mental',P.mental)+bar('Stres',P.st.stress,true);
  /* pekerjaan & usaha */
  let kj='';
  if(P.retired)kj+='<div class="fr"><span>Status</span><span>Pensiunan ('+rp(Math.round(P.pensiun/12))+'/bln)</span></div>';
  else if(P.job){ const pk=pangkatNama(); const lbl=pk?pk+' · '+P.job.title.split(' (')[0]:LV[P.job.level]+P.job.title; kj+='<div class="fr"><span>'+lbl+'</span><span>'+rp(Math.round(P.job.g/12))+'/bln</span></div>';
    kj+='<div class="fr"><span class="muted" style="font-size:11px">· reputasi kerja</span><span style="font-size:11px">'+(P.reputasiKerja>=70?'bintang kantor':P.reputasiKerja>=50?'solid':P.reputasiKerja>=30?'biasa':'di ujung tanduk')+'</span></div>'; }
  else if(P.kuliah)kj+='<div class="fr"><span>Mahasiswa</span><span>'+P.kuliah.n+'</span></div>';
  else if(P.age>=18)kj+='<div class="fr"><span>Status</span><span>Belum bekerja</span></div>';
  else kj+='<div class="fr"><span>Status</span><span>Pelajar / anak</span></div>';
  if(P.sert)kj+='<div class="fr"><span>Sertifikasi</span><span>'+P.sert+' sertifikat</span></div>';
  if(P.politik)kj+='<div class="fr"><span>Jabatan publik</span><span>'+PJAB[P.politik.idx].n+' · pamor '+Math.round(P.pamor)+'</span></div>';
  for(const b of P.biz)
    kj+='<div class="fr"><span>'+b.nama+'</span><span>Lv.'+b.level+' · '+b.kary+' kary.'+(b.kary>0?' @'+rp(gajiKary(b))+'/th':'')+(b.hype>0?' · promo':'')+'</span></div>';
  $('kerja').innerHTML=kj;
  /* keluarga */
  let f='';
  f+='<div class="fr'+(P.ortu.ayah?'':' dead')+'"><span>Ayah</span><span>'+(P.ortu.ayah?'hidup, '+(P.age+P.ortu.ayahOff)+' th':'almarhum')+'</span></div>';
  f+='<div class="fr'+(P.ortu.ibu?'':' dead')+'"><span>Ibu</span><span>'+(P.ortu.ibu?'hidup, '+(P.age+P.ortu.ibuOff)+' th':'almarhumah')+'</span></div>';
  if(P.love)f+='<div class="fr"><span>'+(P.love.married?'Pasangan':'Pacar')+'</span><span>'+P.love.nama.split(' ')[0]+' ('+P.love.sifat.n+')</span></div>';
  for(const k of P.kids){
    const ua=P.age-k.lahirAt;
    const bekal=(ua<20)?' · bekal '+(k.didik>=70?'tinggi':k.didik>=45?'cukup':'minim'):'';
    f+='<div class="fr"><span>Anak'+(k.jk==='L'?' (L)':' (P)')+'</span><span>'+k.nama+', '+ua+' th'+bekal+'</span></div>';
  }
  if(P.cucu)f+='<div class="fr"><span>Cucu</span><span>'+P.cucu+' orang</span></div>';
  if(P.pet)f+='<div class="fr"><span>Kucing</span><span>'+P.pet.nama+', '+(P.age-P.pet.lahirAt)+' th</span></div>';
  if(P.teman.length){
    const sahabat=P.teman.filter(t=>t.dekat>=80).length;
    f+='<div class="fr"><span>Teman</span><span>'+P.teman.length+' orang'+(sahabat?' · '+sahabat+' sahabat':'')+'</span></div>';
    for(const t of P.teman)f+='<div class="fr"><span class="muted" style="font-size:11px">· '+t.nama+'</span><span style="font-size:11px">'+(t.dekat>=80?'sahabat':t.dekat>=55?'dekat':'kenal')+' ('+t.sifat.n+')</span></div>';
  }
  $('fam').innerHTML=f;
  $('relbar').innerHTML=(P.love?bar('Hubungan dgn '+P.love.nama.split(' ')[0],P.love.rel):'')+
    (P.kids.length?bar('Kedekatan dgn anak',P.dekatAnak):'');
  /* hobi */
  $('hobi').innerHTML=P.hobi.length?P.hobi.map(h=>'<span class="chip">'+HOBI.find(x=>x.k===h.k).n+' · Lv.'+h.level+'</span>').join(''):'<span class="muted">Belum punya hobi.</span>';
  /* portofolio */
  let po='';
  for(const v of INV)if(P.inv[v.k]>0)po+='<div class="fr"><span>'+v.n+'</span><span>'+rp(P.inv[v.k])+'</span></div>';
  const totSewa=P.aset.reduce((s,a)=>s+(a.sewa||0),0);
  const totKpr=P.aset.reduce((s,a)=>s+(a.kpr?a.kpr.sisa:0),0);
  if(totSewa>0)po+='<div class="fr"><span>Pendapatan sewa</span><span>'+rp(totSewa)+'/th</span></div>';
  if(totKpr>0)po+='<div class="fr"><span>Sisa KPR aset</span><span>−'+rp(totKpr)+'</span></div>';
  if(P.pinjol>0)po+='<div class="fr"><span>Utang pinjol</span><span>'+P.pinjol+' th lagi</span></div>';
  if(P.nafkah)po+='<div class="fr"><span>Nafkah anak</span><span>−'+rp(P.nafkah.per)+'/th · '+P.nafkah.sisa+' th</span></div>';
  if(P.politik&&P.korup>=30)po+='<div class="fr"><span>Risiko korupsi</span><span><b>'+(P.korup>=60?'tinggi':'sedang')+'</b></span></div>';
  if(P.judi>=20)po+='<div class="fr"><span>Kecanduan judi</span><span><b>'+(P.judi>=55?'parah':P.judi>=40?'kuat':'mulai')+'</b></span></div>';
  if(P.rokok||P.nikotin>=15)po+='<div class="fr"><span>Ketergantungan nikotin</span><span><b>'+(P.nikotin>=60?'berat':P.nikotin>=35?'sedang':'ringan')+'</b>'+(!P.rokok&&P.nikotin>0?' · sedang berhenti':'')+'</span></div>';
  if(P.inv.saham+P.inv.kripto+P.inv.emas+P.inv.depo>0)po+='<div class="fr"><span>Literasi finansial</span><span>'+(P.finansialIQ>=70?'mahir':P.finansialIQ>=40?'berkembang':'pemula')+'</span></div>';
  if(P.politik||P.integritas<45)po+='<div class="fr"><span>Integritas</span><span>'+(P.integritas>=70?'lurus':P.integritas>=45?'biasa':P.integritas>=25?'goyah':'tercoreng')+'</span></div>';
  if(P.kta)po+='<div class="fr"><span>Sisa KTA bank</span><span>−'+rp(P.kta.sisa)+' ('+P.kta.thn+' th)</span></div>';
  if(P.gaya!=='normal')po+='<div class="fr"><span>Gaya hidup</span><span>'+P.gaya+'</span></div>';
  if(P.kronis)po+='<div class="fr"><span>Penyakit kronis</span><span>'+P.kronis.n+(P.kronis.kontrol?' · terkontrol':' · <b>terabaikan</b>')+'</span></div>';
  if(P.asuransi)po+='<div class="fr"><span>Asuransi kesehatan</span><span>aktif · '+rp(6e6)+'/thn</span></div>';
  if(P.haji)po+='<div class="fr"><span>Antrian haji</span><span>±'+P.haji.sisa+' th lagi</span></div>';
  if(P.hajiDone)po+='<div class="fr"><span>Ibadah haji</span><span>sudah ✓</span></div>';
  $('porto').innerHTML=po||'<span class="muted">Belum ada investasi.</span>';
  const grpAset={}; for(const a of P.aset)grpAset[a.n]=(grpAset[a.n]||0)+1;
  $('aset').innerHTML=P.aset.length?Object.keys(grpAset).map(n=>'<span class="chip">'+n+(grpAset[n]>1?' ×'+grpAset[n]:'')+'</span>').join(''):'<span class="muted">Belum punya aset.</span>';
  /* pencapaian */
  const ak=Object.keys(P.ach);
  $('ach').innerHTML=ak.length?ak.map(k=>'<span class="chip au">'+ACH_DEF[k]+'</span>').join(''):'<span class="muted">Belum ada.</span>';
  /* tabs */
  $('tabs').innerHTML=TABS.map(t=>'<button data-tab="'+t[0]+'" class="'+(G.tab===t[0]?'on':'')+'" role="tab">'+t[1]+'</button>').join('');
  /* meja aksi */
  const busy=!!G.current||G.over;
  let html='';
  const list=ACTS.filter(a=>a.tab===G.tab);
  for(const a of list){
    const av=actAvail(a);
    const dis=busy||!av.ok;
    if(P.age<a.min)continue;
    html+='<button data-act="'+a.k+'" '+(dis?'disabled':'')+' class="'+(av.used?'used':'')+'" title="'+(av.ok?'':av.why||'')+'">'+
      '<b>'+a.lbl+(a.multi?' ↻':'')+'</b><span>'+(a.sub||'')+'</span></button>';
  }
  if(G.tab==='hobi'){
    for(const h of P.hobi){
      const def=HOBI.find(x=>x.k===h.k);
      const key='tekuni:'+h.k;
      const used=!!P.used[key];
      const cant=def.b>0&&P.age>=18&&P.money<def.b;
      html+='<button data-act="'+key+'" '+((busy||used||cant)?'disabled':'')+' class="'+(used?'used':'')+'">'+
        '<b>Tekuni: '+def.n+'</b><span>Lv.'+h.level+(def.b>0?' · '+rp(def.b)+'/thn':'')+'</span></button>';
    }
  }
  if(!html)html='<div class="empty">'+(P.age<6?'Masih terlalu kecil — jalani saja masa bayi yang damai.':'Belum ada aksi yang tersedia di laci ini.')+'</div>';
  $('acts').innerHTML=html;
  $('actInfo').textContent=G.over?'':P.age<6?'Tekan "Jalani Umur +1" untuk tumbuh besar.':
    (G.acted>5?'Tahun yang sangat padat — badan mulai protes (stres naik).':'Aksi bertanda ↻ bisa diulang dalam setahun; lainnya sekali per tahun.');
  $('nextBtn').disabled=!!G.current||G.over;
  if(window.ArsipArt)ArsipArt.update('kehidupan',P);
  renderKartu();
  saveGame();
}

