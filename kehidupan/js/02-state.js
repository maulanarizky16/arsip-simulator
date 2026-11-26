'use strict';
/* ================= STATE ================= */
let P=null;
const G={current:null, queue:[], over:false, feed:[], tab:'diri', acted:0, mkt:{biz:1,label:null}};

function newGame(){
  const g=r()<0.5?'L':'P';
  P={
    nama:namaOrang(g), gender:g, kota:pick(KOTA), lahir:ri(1980,2004),
    kelas:pick(['miskin','menengah','menengah','kaya']),
    age:0, alive:true, sebab:null,
    st:{health:ri(72,95),happy:ri(60,85),smart:ri(35,82),charm:ri(35,82),stress:ri(5,18),relasi:ri(20,50)},
    money:0, maxNet:0, sumHappy:0,
    edu:'Belum sekolah', eduLevel:0, track:null, kuliah:null, s2:false, sert:0,
    job:null, perf:0, retired:false, pensiun:0,
    biz:[], love:null, kids:[], cucu:0,
    aset:[], inv:{depo:0,emas:0,saham:0,kripto:0},
    hobi:[], pet:null,
    ortu:{ayahOff:ri(25,33),ibuOff:ri(22,30),ayah:true,ibu:true},
    rokok:false, pinjol:0, riwayat:[], ach:{}, used:{}, viral:false, bukuTerbit:false,
    haji:null, hajiDone:false, asuransi:false, gen:1, silsilah:[],
    gaya:'normal', kronis:null, kta:null, dekatAnak:50,
    teman:[], judi:0, judiTotal:0, terapi:false, pernahRantau:false, midlife:false,
    politik:null, pamor:50, korup:0, korupTotal:0,
    selingkuh:false, anakRahasia:false, nafkah:null, sengketaWaris:false, kdrt:false,
    mafiaTanah:false, whistleKantor:false, umrohOrtu:false, ketuaRT:false,
    ipk:0, reputasiKerja:50, mental:60, nikotin:0, integritas:60, finansialIQ:0
  };
  P.arsipNo='No. Arsip '+ri(100000,999999)+'/'+P.lahir;
  G.current=null; G.queue=[]; G.over=false; G.feed=[]; G.tab='diri'; G.acted=0; G.mkt={biz:1,label:null};
  if(hasDoc){
    $('feed').innerHTML=''; $('kartu').innerHTML='';
    $('overlay').classList.add('hidden');
    $('noArsip').textContent=P.arsipNo;
  }
  yearHeader();
  const kelasTxt={miskin:'sederhana — pas-pasan tapi penuh kasih',menengah:'menengah yang cukup',kaya:'berada'}[P.kelas];
  addLog('Seorang bayi '+(g==='L'?'laki-laki':'perempuan')+' lahir di RSUD '+P.kota+' tahun '+P.lahir+'. Ia diberi nama <b>'+P.nama+'</b>, dari keluarga '+kelasTxt+'.');
  stamp('LAHIR');
  milestone('Lahir di '+P.kota);
  if(!G._continuing)arahanKehidupan();
  render();
}
function arahanKehidupan(){
  try{ if(localStorage.getItem('arsip_arahan_keh_v1'))return; localStorage.setItem('arsip_arahan_keh_v1','1'); }catch(e){}
  caraMain();
}
function caraMain(){
  ask({title:'CARA MAIN',text:'Selamat datang. Kamu akan menjalani satu hidup dari bayi sampai tutup usia.<br><br>'+
    '<b>1.</b> Tiap tahun, pilih aksi di <b>Meja Aksi</b> (laci Diri, Asmara, Karier, Usaha, Uang, Hobi).<br>'+
    '<b>2.</b> Kalau sudah, tekan <b>"Jalani Umur +1"</b> untuk maju setahun.<br>'+
    '<b>3.</b> Tiap pilihan berdampak ke kesehatan, kebahagiaan, uang, dan relasi. Tidak ada jalan yang "benar", bikin saja ceritamu sendiri.<br><br>'+
    'Progres tersimpan otomatis dan bisa dilanjut kapan saja. Selamat menjalani hidup.',
    opts:[{t:'Mulai hidup »',e:()=>{}}]});
}

/* ================= LOG ================= */
function yearHeader(){
  const t='UMUR '+P.age+' — TAHUN '+(P.lahir+P.age);
  G.feed.push({yr:t});
  if(!hasDoc)return;
  const d=document.createElement('div'); d.className='yr'; d.textContent=t;
  $('feed').appendChild(d); $('feed').scrollTop=$('feed').scrollHeight;
}
function addLog(html,cls){
  G.feed.push({html,cls});
  if(!hasDoc)return;
  const d=document.createElement('div'); d.className='e '+(cls||''); d.innerHTML=html;
  $('feed').appendChild(d); $('feed').scrollTop=$('feed').scrollHeight;
}
function stamp(t,kind){
  G.feed.push({stamp:t});
  if(!hasDoc)return;
  const d=document.createElement('div'); d.className='stamp'+(kind?' '+kind:''); d.textContent=t;
  $('feed').appendChild(d); $('feed').scrollTop=$('feed').scrollHeight;
}
function milestone(t){ P.riwayat.push({age:P.age,t}); }
function ach(k){
  if(P.ach[k])return;
  P.ach[k]=true;
  addLog('Pencapaian terbuka: <b>'+ACH_DEF[k]+'</b>.','good');
  stamp('PENCAPAIAN: '+ACH_DEF[k].toUpperCase(),'gold');
}

/* efek statistik + teks delta */
const LBL={health:'Kesehatan',happy:'Kebahagiaan',smart:'Kecerdasan',charm:'Karisma',stress:'Stres',relasi:'Relasi'};
function fx(o){
  const parts=[];
  for(const k in o){
    if(k==='money'){ P.money+=o[k]; parts.push('Uang '+(o[k]>=0?'+':'')+rp(o[k]).replace('Rp ','').replace('−Rp ','−')); }
    else if(k==='rel'){ if(P.love){P.love.rel=clamp(P.love.rel+o[k],0,100); parts.push('Hubungan '+(o[k]>=0?'+':'')+o[k]);} }
    else { P.st[k]=clamp(P.st[k]+o[k],0,100); parts.push(LBL[k]+' '+(o[k]>=0?'+':'')+o[k]); }
  }
  return ' <span class="d">('+parts.join(', ')+')</span>';
}

/* ================= KEPUTUSAN ================= */
function ask(d){
  d.opts=d.opts.filter(o=>!o.cond||o.cond());
  if(!d.opts.length)d.opts=[{t:'Lewati',e:()=>{}}];
  if(G.current)G.queue.push(d); else {G.current=d; renderKartu();}
}
function choose(i){
  if(!G.current||G.over)return;
  const cur=G.current; G.current=null;
  if(hasDoc)$('kartu').innerHTML='';
  (cur.opts[i]||cur.opts[0]).e();
  if(!G.current && G.queue.length){G.current=G.queue.shift(); renderKartu();}
  render();
}

/* ================= EKONOMI ================= */
function bizValue(b){ return Math.round(b.modal*b.level*0.75*(1+b.hype*0.1)); }
/* gaji 1 karyawan per tahun, ikut modal & level usaha (usaha besar bayar lebih besar) */
function gajiKary(b){ return Math.round((14e6+b.modal*0.08)*(1+(b.level-1)*0.1)/1e5)*1e5; }
function punyaAset(k){ return P.aset.some(a=>a.k===k); }
function asetBaru(d){ return {k:d.k,n:d.n,nilai:d.harga,kpr:null,sewa:d.sewa||0,tumbuh:d.tumbuh||0,kelas:d.kelas}; }
function netWorth(){
  let n=P.money+P.inv.depo+P.inv.emas+P.inv.saham+P.inv.kripto;
  for(const a of P.aset)n+=a.nilai-(a.kpr?a.kpr.sisa:0);
  for(const b of P.biz)n+=bizValue(b);
  return Math.round(n);
}
function kidsU18(){ return P.kids.filter(k=>P.age-k.lahirAt<18).length; }

/* ================= TAHUN BERJALAN ================= */
function advance(){
  if(!P||G.current||G.over)return;
  P.age++;
  P.used={}; G.acted=0;
  yearHeader();
  rollMarket();
  drift();
  if(P.alive)events();
  if(P.alive)deathCheck();
  if(P.alive)checkAch();
  render();
}

function rollMarket(){
  const x=r();
  if(P.age>=16&&x<0.06){ G.mkt={biz:0.55,label:'krisis'};
    addLog('KRISIS EKONOMI melanda. Harga naik, pasar lesu, PHK di mana-mana.','bad'); }
  else if(x<0.16){ G.mkt={biz:1.35,label:'boom'};
    if(P.age>=18)addLog('Ekonomi sedang booming — daya beli naik, pasar bergairah.','good'); }
  else G.mkt={biz:1,label:null};
}

function drift(){
  const a=P.age, s=P.st;
  P.sumHappy+=s.happy;
  /* orang tua menua */
  for(const who of ['ayah','ibu']){
    if(!P.ortu[who])continue;
    const ua=a+P.ortu[who+'Off'];
    if(ua>62 && r()<0.05+(ua-62)*0.006){
      P.ortu[who]=false;
      addLog((who==='ayah'?'Ayah':'Ibu')+' Anda berpulang di usia '+ua+' tahun. Rumah terasa sepi.'+fx({happy:-15,stress:+8}),'bad');
      milestone((who==='ayah'?'Ayah':'Ibu')+' wafat');
      if(a>=17){
        const w=P.kelas==='kaya'?ri(100,400)*1e6:P.kelas==='menengah'?ri(20,80)*1e6:ri(0,10)*1e6;
        if(w>0)addLog('Anda menerima warisan.'+fx({money:w}));
      }
    }
  }
  /* drift alami */
  if(s.stress>70)s.health=clamp(s.health-3,0,100);
  if(a>45)s.health=clamp(s.health-1,0,100);
  if(a>65)s.health=clamp(s.health-1,0,100);
  /* nikotin: menumpuk saat merokok (dampak kesehatan proporsional), sisa keinginan saat berhenti & bisa kambuh */
  if(P.rokok){ P.nikotin=clamp(P.nikotin+ri(2,5),0,100); s.health=clamp(s.health-(1+Math.round(P.nikotin/40)),0,100); }
  else if(P.nikotin>0){ P.nikotin=clamp(P.nikotin-3,0,100);
    if(P.nikotin>=40&&s.stress>=65&&r()<0.35){ P.rokok=true; addLog('Stres memuncak — tangan Anda meraih rokok lagi. Kambuh setelah sekian lama berhenti.'+fx({stress:+2,happy:-2}),'bad'); } }
  s.happy=clamp(s.happy+(s.happy>50?-1:1),0,100);
  s.stress=clamp(s.stress-1,0,100);
  if(a>=18)s.relasi=clamp(s.relasi-1,0,100);
  /* kesehatan mental: pulih saat tenang, tergerus saat stres; menyangga atau menekan suasana hati & integritas pelan kembali ke tengah */
  if(s.stress<50)P.mental=clamp(P.mental+1,0,100);
  if(s.stress>75)P.mental=clamp(P.mental-1,0,100);
  if(P.mental>=70)s.happy=clamp(s.happy+1,0,100);
  else if(P.mental<=30){ s.happy=clamp(s.happy-1,0,100); s.stress=clamp(s.stress+1,0,100); }
  if(P.integritas<50&&r()<0.4)P.integritas=clamp(P.integritas+1,0,100);
  /* pamor publik memudar kalau tidak dirawat; korupsi mereda pelan kalau berhenti */
  if(P.politik)P.pamor=clamp(P.pamor-1,0,100);
  if(P.korup>0&&!P.politik)P.korup=clamp(P.korup-3,0,100);
  if(P.gaya==='mewah'){s.happy=clamp(s.happy+2,0,100);s.charm=clamp(s.charm+1,0,100);}
  else if(P.gaya==='hemat'&&s.happy>40)s.happy=clamp(s.happy-1,0,100);
  if(P.kids.length)P.dekatAnak=clamp(P.dekatAnak-(kidsU18()>0?2:1),0,100);
  /* sifat pasangan */
  if(P.love){
    P.love.thn++;
    const sf=P.love.sifat.k;
    let dr=(P.love.married?ri(-5,4):ri(-7,5))+(s.happy>65?1:0);
    if(sf==='penyayang')dr+=2; if(sf==='cuek')dr-=2;
    if(sf==='humoris')s.happy=clamp(s.happy+1,0,100);
    if(sf==='posesif')s.stress=clamp(s.stress+2,0,100);
    if(sf==='suportif')s.stress=clamp(s.stress-1,0,100);
    P.love.rel=clamp(P.love.rel+dr,0,100);
  }
  /* kecanduan judi: memudar pelan, tapi kalau parah tangan gatal main diam-diam */
  if(P.judi>0){
    P.judi=clamp(P.judi-2,0,100);
    if(P.judi>=45&&P.money>=5e6&&r()<0.4){
      const x=ri(3,12)*1e6; P.money-=x; P.judi=clamp(P.judi+6,0,100);
      addLog('Tangan Anda gatal — tengah malam, diam-diam pasang taruhan lagi. '+rp(x)+' menguap tanpa jejak.'+fx({stress:+5,happy:-3}),'bad');
    }
  }
  /* teman: kedekatan meluruh pelan; sahabat dekat bikin lebih bahagia */
  if(P.teman.length){
    for(const t of P.teman){ t.thn=(t.thn||0)+1; t.dekat=clamp(t.dekat-1,0,100); }
    if(P.teman.some(t=>t.dekat>=80))s.happy=clamp(s.happy+1,0,100);
    if(P.teman.some(t=>t.dekat>=92))ach('sahabat');
  }
  /* hewan peliharaan */
  if(P.pet){
    const up=a-P.pet.lahirAt;
    if(up>=13&&r()<0.3){
      addLog('Kucing kesayangan, si '+P.pet.nama+', mati karena usia tua. Rumah kehilangan suara meongnya.'+fx({happy:-8}),'bad');
      P.pet=null;
    } else s.happy=clamp(s.happy+2,0,100);
  }
  /* antrian haji */
  if(P.haji){
    P.haji.sisa--;
    if(P.haji.sisa<=0){
      ask({title:'PANGGILAN BERANGKAT HAJI',text:'Nomor porsi Anda akhirnya keluar! Biaya pelunasan '+rp(65e6)+'.',opts:[
        {t:'Lunasi & berangkat',sub:rp(65e6),cond:()=>P.money>=65e6,e:()=>{
          P.money-=65e6; P.haji=null; P.hajiDone=true; ach('mabrur');
          addLog('Anda menunaikan ibadah haji. Pulang dengan gelar '+(P.gender==='L'?'Pak Haji':'Bu Hajjah')+' dan hati yang penuh.'+fx({happy:+15,stress:-12}),'good');
          stamp('HAJI','green'); milestone('Naik haji');}},
        {t:'Tunda tahun depan',e:()=>{P.haji.sisa=1;addLog('Keberangkatan ditunda setahun — tabungan pelunasan belum siap.'+fx({stress:+3}));}}
      ]});
    }
  }
  /* sakit & asuransi */
  if(a>=18&&s.health<45&&r()<0.35){
    const biaya=ri(10,30)*1e6;
    const tang=P.asuransi?Math.round(biaya*0.8):0;
    addLog('Kondisi badan drop — Anda sempat dirawat. Tagihan '+rp(biaya)+(P.asuransi?', '+rp(tang)+' ditanggung asuransi.':' ditanggung sendiri.')+fx({money:-(biaya-tang),health:+6,stress:+4}),'bad');
  }
  /* penyakit kronis */
  if(!P.kronis&&a>=35&&r()<(0.01+(P.rokok?0.03:0)+(s.health<50?0.02:0)+(a>55?0.02:0))){
    P.kronis={n:pick(['hipertensi','diabetes','kolesterol tinggi','asam urat']),kontrol:false};
    addLog('Hasil lab tahunan tidak bagus: Anda divonis <b>'+P.kronis.n+'</b>. Dokter menyarankan kontrol rutin seumur hidup.'+fx({stress:+6,happy:-4}),'bad');
    milestone('Divonis '+P.kronis.n);
  }
  if(P.kronis){
    if(P.kronis.kontrol){
      const ob=P.asuransi?1.5e6:5e6;
      addLog('Kontrol rutin '+P.kronis.n+' berjalan tertib. Obat '+rp(ob)+'/thn'+(P.asuransi?' (ditekan asuransi).':'.')+fx({money:-ob,health:-1}));
    } else {
      s.health=clamp(s.health-4,0,100); s.stress=clamp(s.stress+2,0,100);
      if(r()<0.15){
        const u=ri(15,40)*1e6, byr=P.asuransi?Math.round(u*0.2):u;
        addLog(P.kronis.n.charAt(0).toUpperCase()+P.kronis.n.slice(1)+' yang diabaikan kambuh parah — Anda masuk IGD. Tagihan '+rp(byr)+'.'+fx({money:-byr,health:-6,stress:+6}),'bad');
      }
    }
  }
  /* keuangan (mulai 18) */
  if(a>=18){
    let masuk=0, keluar=0;
    if(P.job){ P.job.g=Math.round(P.job.g*1.03); masuk+=P.job.g;
      /* performa & reputasi kerja: lembur menjaganya; menganggur-pasif menggerusnya pelan */
      if(P._lemburTahunIni)P.reputasiKerja=clamp(P.reputasiKerja+1,0,100);
      else { if(r()<0.5)P.perf=clamp(P.perf-1,0,3); P.reputasiKerja=clamp(P.reputasiKerja-1,0,100); }
    }
    P._lemburTahunIni=false;
    if(P.retired&&P.pensiun)masuk+=P.pensiun;
    if(P.politik)masuk+=PJAB[P.politik.idx].tunj;
    if(P.nafkah){ keluar+=P.nafkah.per; P.nafkah.sisa--; if(P.nafkah.sisa<=0){P.nafkah=null;addLog('Kewajiban nafkah anak Anda telah selesai.','sys');} }
    if(P.love&&P.love.married&&P.love.income)masuk+=P.love.income;
    if(P.love&&P.love.married&&P.love.sifat.k==='boros')keluar+=3e6;
    /* usaha */
    for(const b of P.biz.slice()){
      const gw=b.goodwill||0;
      const base=b.modal*b.level*(0.5+(s.smart+s.charm)/400)*(1+0.10*b.kary/(1+0.02*b.kary))*(1+0.2*b.hype)*(1+s.relasi/500)*(1+gw/180)*G.mkt.biz;
      const rate=r()*(1.2+b.risk)-(0.35+b.risk*0.3)+gw/320;   /* basis pelanggan meredam rugi & menstabilkan usaha mapan */
      const profit=Math.round(base*rate);
      keluar+=gajiKary(b)*b.kary;
      if(profit>=0){ masuk+=profit; b.goodwill=clamp(gw+ri(3,7),0,100); addLog('Usaha '+b.nama+' untung '+rp(profit)+' tahun ini.','good'); }
      else { keluar+=-profit; b.goodwill=clamp(gw-ri(5,10),0,100); addLog('Usaha '+b.nama+' rugi '+rp(-profit)+'. Tahun yang berat.','bad'); }
      if(b.hype>0)b.hype--;
      if(b.kary>0)s.stress=clamp(s.stress-1,0,100);
    }
    /* investasi */
    let dInv=0;
    if(P.inv.depo>0){ const d=Math.round(P.inv.depo*0.04); P.inv.depo+=d; dInv+=d; }
    if(P.inv.emas>0){ const pct=ri(-4,14)+(G.mkt.label==='boom'?2:G.mkt.label==='krisis'?-5:0);
      const d=Math.round(P.inv.emas*pct/100); P.inv.emas+=d; dInv+=d; }
    if(P.inv.saham>0){ let pct=G.mkt.label==='krisis'?ri(-45,-10):G.mkt.label==='boom'?ri(5,55):ri(-25,35);
      pct+=Math.round(P.finansialIQ/22)+Math.round((s.smart-50)/16)+(P.jur==='ekonomi'?3:0);   /* literasi & kecerdasan = edge */
      const d=Math.round(P.inv.saham*pct/100); P.inv.saham+=d; dInv+=d; }
    if(P.inv.kripto>0){ let pct=G.mkt.label==='krisis'?ri(-75,-20):ri(-65,130);
      if(pct<0)pct=Math.round(pct*(1-P.finansialIQ/260));   /* literasi mengurangi besarnya kerugian */
      const d=Math.round(P.inv.kripto*pct/100); P.inv.kripto+=d; dInv+=d; }
    if(P.inv.depo+P.inv.emas+P.inv.saham+P.inv.kripto>0&&r()<0.6)P.finansialIQ=clamp(P.finansialIQ+1,0,100);   /* belajar dari pengalaman berinvestasi */
    if(Math.abs(dInv)>=5e6)
      addLog('Portofolio investasi Anda '+(dInv>=0?'tumbuh ':'menyusut ')+rp(Math.abs(dInv))+' tahun ini.',dInv>=0?'good':'bad');
    /* aset: apresiasi nilai, pendapatan sewa, cicilan KPR per-aset */
    let sewaTot=0;
    for(const a of P.aset){
      if(a.tumbuh)a.nilai=Math.round(a.nilai*(1+a.tumbuh));
      if(a.sewa){ masuk+=a.sewa; sewaTot+=a.sewa; }
      if(a.kpr){ keluar+=a.kpr.cicilan; a.kpr.sisa=Math.max(0,a.kpr.sisa-a.kpr.cicilan); a.kpr.thn--;
        if(a.kpr.thn<=0||a.kpr.sisa<=0){ a.kpr=null; addLog('Cicilan KPR '+a.n+' lunas. Aset itu kini 100% milik Anda.','good'); stamp('KPR LUNAS','green'); } }
    }
    if(sewaTot>=5e6)addLog('Pendapatan sewa dari properti Anda: '+rp(sewaTot)+' tahun ini.','good');
    /* biaya hidup */
    const punyaHunian=P.aset.some(a=>a.k==='rumah'||a.k==='vila'||a.k==='apartemen');
    const kuliahOrtu=P.kuliah&&!P.kuliah.beasiswa&&P.kelas!=='miskin';
    let hidup;
    if(P.kuliah)hidup=kuliahOrtu?4e6:10e6;
    else if(a>=23||(P.love&&P.love.married))hidup=punyaHunian?14e6:24e6;
    else hidup=8e6;
    hidup=Math.round(hidup*(P.gaya==='hemat'?0.7:P.gaya==='mewah'?1.8:1));
    if(KOTA_METRO.includes(P.kota))hidup=Math.round(hidup*1.3);
    if(G.mkt.label==='krisis')hidup=Math.round(hidup*1.25);
    if(P.love&&P.love.married)hidup=Math.round(hidup*1.25);   /* rumah tangga: biaya rumah & gaya hidup bersama lebih besar */
    keluar+=hidup+12e6*kidsU18();
    if(P.asuransi)keluar+=6e6;
    if(P.pet)keluar+=1.5e6;
    if(P.kuliah&&P.kuliah.beasiswa===false&&P.kelas==='miskin')keluar+=P.kuliah.biaya;
    if(P.kta){
      keluar+=P.kta.cicilan; P.kta.sisa=Math.max(0,P.kta.sisa-P.kta.cicilan); P.kta.thn--;
      if(P.kta.thn<=0||P.kta.sisa<=0){ P.kta=null; addLog('Cicilan terakhir terbayar — KTA bank lunas.','good'); }
    }
    if(P.pinjol>0){ keluar+=6e6; P.pinjol--; s.stress=clamp(s.stress+6,0,100);
      addLog('Tagihan pinjol menyedot '+rp(6e6)+'. DC meneror nomor Anda.','bad'); }
    P.money+=masuk-keluar;
    addLog('Arus kas: pemasukan '+rp(masuk)+', pengeluaran '+rp(keluar)+'.','sys');
    if(P.money<0){ s.stress=clamp(s.stress+6,0,100);
      if(r()<0.5)addLog('Keuangan minus. Anda makan mi instan lebih sering dari yang sehat.','bad'); }
  }
  const nw=netWorth(); if(nw>P.maxNet)P.maxNet=nw;
}

