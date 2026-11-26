'use strict';
/* ================= KARIER ================= */
/* gaji disesuaikan sertifikasi, S2, dan kualitas kuliah (IPK) — lulusan cemerlang dibayar lebih */
function salaryAdj(g){ return Math.round(g*(1+0.06*P.sert)*(P.s2?1.2:1)*(P.ipk>0?(1+(P.ipk-2.7)*0.07):1)); }
function setJob(t,g){
  P.job={title:t,g,level:0,bidang:'sipil'}; P.perf=0;
  addLog('Anda mulai bekerja sebagai <b>'+t+'</b>, gaji '+rp(Math.round(g/12))+'/bulan.','good');
  milestone('Mulai kerja: '+t);
}
function pangkatNama(){
  if(P.job&&P.job.bidang&&PANGKAT[P.job.bidang])return PANGKAT[P.job.bidang][Math.min(P.job.level,4)];
  return null;
}
function daftarProfesi(){
  ask({title:'DAFTAR PROFESI NEGARA',text:'Pilih jalur seleksi. Tiap profesi punya syarat & tes sendiri. (Kesehatan '+Math.round(P.st.health)+', Kecerdasan '+Math.round(P.st.smart)+')',
    opts:PROFESI.map(p=>({t:p.n,sub:'Min. sehat '+p.minH+' & cerdas '+p.minS+(p.biaya?' · biaya '+rp(p.biaya):'')+' · '+p.desc,
      cond:()=>(!p.biaya||P.money>=p.biaya),
      e:()=>{
        if(P.st.health<p.minH||P.st.smart<p.minS){ addLog('Anda ikut seleksi '+p.n+', tapi gagal di tahap syarat dasar. Kurang siap.'+fx({stress:+4,happy:-3}),'bad'); return; }
        if(p.biaya)P.money-=p.biaya;
        if(p.k==='pns'&&typeof Kuis!=='undefined'){   /* PNS: lewat SKD sungguhan (TWK, TIU, TKP) */
          Kuis.skd(h=>{
            if(h.lolos&&r()<0.5+P.st.smart/300){ P.job={title:p.n,g:salaryAdj(p.g),level:0,bidang:p.k}; P.perf=0;
              addLog('SELAMAT! Lolos SKD & SKB. Anda resmi menjadi <b>'+p.n+'</b>.'+fx({happy:+12,stress:+5}),'good'); stamp('LOLOS CPNS','green'); milestone('Diterima sebagai '+p.n); }
            else addLog(h.lolos?'Lolos SKD, tapi kalah peringkat di SKB. Coba lagi tahun depan.'+fx({stress:+5,happy:-3}):'Tidak lolos ambang batas SKD. Coba lagi tahun depan.'+fx({stress:+6,happy:-4}),'bad');
          });
          return;
        }
        const peluang=0.35+(P.st.health-p.minH)/200+(P.st.smart-p.minS)/200+P.st.relasi/400;
        if(r()<clamp(peluang,0.15,0.9)){
          P.job={title:p.n,g:salaryAdj(p.g),level:0,bidang:p.k}; P.perf=0;
          addLog('SELAMAT! Anda lolos seleksi dan resmi menjadi <b>'+p.n+'</b>.'+fx({happy:+12,stress:+5}),'good');
          stamp(p.n.toUpperCase(),'green'); milestone('Diterima sebagai '+p.n);
        } else addLog('Pengumuman seleksi '+p.n+' keluar: nama Anda tidak ada. Coba lagi tahun depan.'+fx({stress:+6,happy:-4}),'bad');
      }})).concat([{t:'Batal',e:()=>{}}])});
}
/* ================= POLITIK / JABATAN PUBLIK ================= */
function jabNama(){ return P.politik?PJAB[P.politik.idx].n:null; }
function majuPolitik(){
  const idx=P.politik?P.politik.idx+1:0;
  if(idx>=PJAB.length){ addLog('Anda sudah berada di puncak jabatan publik.'); return; }
  const t=PJAB[idx];
  if(P.st.relasi<t.minRelasi||P.st.charm<t.minCharm){
    addLog('Anda ingin maju sebagai '+t.n+', tapi modal sosial belum cukup (perlu relasi '+t.minRelasi+' & karisma '+t.minCharm+'). Warga belum cukup mengenal Anda.'+fx({stress:+3,happy:-2}),'bad'); return;
  }
  if(t.biaya===0){ pilihMenang(idx,0,0); return; }
  const tiers=[t.biaya,Math.round(t.biaya*2),Math.round(t.biaya*4)].filter(x=>x<=P.money);
  if(!tiers.length){ addLog('Dana kampanye untuk maju sebagai '+t.n+' belum cukup (minimal '+rp(t.biaya)+').','bad'); return; }
  ask({title:'MAJU PEMILIHAN: '+t.n.toUpperCase(),text:'Untuk maju sebagai '+t.n+', Anda butuh modal kampanye. Makin besar dana, makin besar peluang. (Pamor warga: '+Math.round(P.pamor)+'/100)',
    opts:tiers.map((x,i)=>({t:'Kampanye '+rp(x),sub:['standar','gencar','jor-joran'][i],e:()=>{P.money-=x;pilihMenang(idx,x,t.biaya);}}))
      .concat([{t:'Batal',e:()=>{}}])});
}
function pilihMenang(idx,spent,base){
  const t=PJAB[idx];
  let pel=0.25+(P.pamor-50)/120+(P.st.charm-t.minCharm)/200+(P.st.relasi-t.minRelasi)/200;
  if(base)pel+=(spent/base-1)*0.12;
  pel=clamp(pel,0.08,0.92);
  if(r()<pel){
    P.politik={idx,thn:0};
    addLog('MENANG! Anda resmi dilantik sebagai <b>'+t.n+'</b>. Tunjangan '+rp(Math.round(t.tunj/12))+'/bulan, dan amanah besar di pundak.'+fx({happy:+10,charm:+3,stress:+5}),'good');
    stamp(t.n.toUpperCase(),'gold'); milestone('Terpilih jadi '+t.n);
    P.pamor=clamp(P.pamor+5,0,100);
  } else {
    addLog('Hasil pemilihan keluar: Anda kalah tipis. Dana kampanye '+(spent?rp(spent)+' ':'')+'tak kembali, tapi nama Anda kini lebih dikenal.'+fx({stress:+8,happy:-6,charm:+2}),'bad');
    P.pamor=clamp(P.pamor+3,0,100);
  }
}
function adopsiAnak(){
  P.money-=20e6;
  const jk=r()<0.5?'L':'P', umur=ri(1,8);
  const anak={nama:(jk==='L'?pick(NAMA_L):pick(NAMA_P)),lahirAt:P.age-umur,jk,nikah:false,anak:false,didik:42,adopsi:true};
  P.kids.push(anak);
  addLog('Anda mengadopsi anak '+(jk==='L'?'laki-laki':'perempuan')+' berusia '+umur+' th dan menamainya <b>'+anak.nama+'</b>. Rumah Anda kini punya tawa baru.'+fx({happy:+12,stress:+4}),'good');
  stamp('ADOPSI ANAK','green'); milestone('Mengadopsi '+anak.nama); ach('pengasuh');
}
function buildPool(){
  let pool=P.eduLevel>=4?KARIER[P.jur||'ekonomi'].concat([['Staf admin kantor',48e6]]):(P.track==='smk'?POOL_SMK:POOL_UMUM);
  return pool;
}
function jobOffers(pool,n,mult){
  mult=mult||1;
  const list=pool.slice().sort(()=>r()-0.5).slice(0,n);
  ask({title:'PANGGILAN KERJA',text:'Beberapa lamaran Anda berbuah. Pilih satu:',
    opts:list.map(j=>{const g=Math.round(salaryAdj(j[1])*mult);
      return {t:j[0],sub:'Gaji '+rp(Math.round(g/12))+'/bulan · lanjut wawancara',e:()=>wawancaraKerja(j[0],g)};})
      .concat([{t:'Tolak semua, cari yang lebih baik',e:()=>addLog('Anda menolak semua tawaran. Semoga keputusan tepat.'+fx({stress:+4}))}])});
}

/* ================= USAHA ================= */
function bukaUsahaCard(){
  const bantu=(P.biz.length===0&&P.age<=27)?(P.kelas==='kaya'?60e6:P.kelas==='menengah'?20e6:8e6):0;
  ask({title:'BUKA USAHA',text:bantu>0?'Untuk usaha pertama, orang tua siap bantu modal '+rp(bantu)+'. Mau buka apa?':'Pilih bidang usaha (modal sendiri):',
    opts:USAHA.map(u=>({t:u[0],sub:'Modal '+rp(u[1])+(u[2]>=1.5?' · risiko tinggi':u[2]<=0.9?' · stabil':''),
      cond:()=>P.money+bantu>=u[1],
      e:()=>{
        P.money+=Math.min(bantu,u[1]); P.money-=u[1];
        P.biz.push({nama:u[0],modal:u[1],risk:u[2],level:1,kary:0,hype:0,goodwill:0});
        addLog('Anda membuka <b>'+u[0]+'</b> dengan modal '+rp(u[1])+'. Selamat berjuang, juragan.','good');
        milestone('Buka usaha: '+u[0]);
      }})).concat([{t:'Batal',e:()=>{}}])});
}
function pickBiz(judul,cb){
  if(P.biz.length===1)return cb(P.biz[0]);
  ask({title:judul,text:'Pilih usaha yang dimaksud:',
    opts:P.biz.map(b=>({t:b.nama,sub:'Level '+b.level+' · '+b.kary+' karyawan',e:()=>cb(b)}))
      .concat([{t:'Batal',e:()=>{}}])});
}

/* ================= ASMARA ================= */
function newCandidate(){
  const g=P.gender==='L'?'P':'L';
  const umur=clamp(P.age+ri(-4,5),19,55);
  const kj=pick(KERJA_CALON);
  const gajiBln=kj[1][1]===0?0:ri(Math.round(kj[1][0]*10),Math.round(kj[1][1]*10))*1e5;
  const pendidikan=pick(gajiBln>=8e6?['S1','S1','S2']:gajiBln>=5e6?['D3','S1','S1']:['SMA','SMK','D3','S1']);
  const status=(umur>=33&&r()<0.3)?(g==='L'?'duda':'janda'):'lajang';
  return {nama:namaOrang(g), gender:g, sifat:pick(SIFAT), rel:ri(50,68), thn:0, married:false,
    umur, kerja:kj[0], tempat:pick(TEMPAT_CALON), gajiBln, income:gajiBln*12, pendidikan, status};
}
function profilCalon(c){
  const kerja=c.kerja==='belum bekerja'?'belum bekerja':c.kerja+' di '+c.tempat;
  return '<span class="d">'+c.umur+' th · '+kerja+(c.gajiBln?' · gaji '+rp(c.gajiBln)+'/bln':'')+' · lulusan '+c.pendidikan+' · status '+c.status+' · orangnya '+c.sifat.n+'</span>';
}
function jadian(c,via){
  P.love=c;
  addLog('Gayung bersambut — Anda dan <b>'+c.nama.split(' ')[0]+'</b> resmi berpacaran'+(via?' setelah kenalan '+via:'')+'. Orangnya '+c.sifat.n+'.'+fx({happy:+10}),'good');
  milestone('Pacaran dengan '+c.nama.split(' ')[0]);
}
/* jalur cari pasangan: kalau cocok, tampilkan profil calon dulu sebelum jadian */
function caloni(prob,via,gagalMsg,gagalFx,gagalCls){
  if(r()<prob){
    const c=newCandidate();
    ask({title:'KENALAN BARU',text:'Anda berkenalan dengan <b>'+c.nama+'</b> '+via+'.<br>'+profilCalon(c)+'<br>Lanjut?',opts:[
      {t:'Lanjut PDKT — jadian',e:()=>jadian(c,via)},
      {t:'Belum cocok, sudahi',e:()=>addLog('Anda merasa belum sreg dengan '+c.nama.split(' ')[0]+'. Tidak apa-apa, jodoh nggak ke mana.'+fx({happy:-1}))}
    ]});
  } else addLog(gagalMsg+fx(gagalFx||{happy:-2}),gagalCls||'');
}
function nikah(biaya,happyPlus,charmPlus){
  P.money-=biaya; P.love.married=true; P.love.rel=clamp(P.love.rel+15,0,100);
  let inc=P.love.income||(r()<0.7?ri(30,80)*1e6:0);
  if(P.love.sifat.k==='mapan')inc=Math.round(Math.max(inc,40e6)*1.6);
  P.love.income=inc;
  addLog('Anda menikah dengan <b>'+P.love.nama+'</b>! Seluruh kampung datang.'+fx({happy:happyPlus,stress:-5,charm:charmPlus||0}),'good');
  stamp('MENIKAH'); milestone('Menikah dengan '+P.love.nama);
  if(inc)addLog('Pasangan Anda juga bekerja — penghasilan keluarga bertambah '+rp(Math.round(inc/12))+'/bulan.','good');
}
function cerai(){
  const nm=P.love.nama;
  const adaAnakKecil=kidsU18()>0;
  /* gono-gini hanya membagi harta positif; utang tetap ditanggung sendiri (jangan sampai cerai malah menghapus utang) */
  if(P.money>0)P.money=Math.round(P.money/2);
  /* harta gono-gini: pasangan membawa separuh aset, mulai dari yang paling bernilai */
  let asetHilang=0;
  if(P.aset.length){
    P.aset.sort((a,b)=>b.nilai-a.nilai);
    const ambil=Math.floor(P.aset.length/2);
    for(let i=0;i<ambil;i++){ asetHilang++; P.aset.shift(); }
  }
  addLog('Anda dan '+nm+' resmi bercerai. Harta gono-gini dibagi'+(asetHilang?', '+asetHilang+' aset ikut terbawa pasangan':'')+'.'+fx({happy:-20,stress:+15}),'bad');
  milestone('Bercerai dengan '+nm.split(' ')[0]);
  if(adaAnakKecil){
    ask({title:'HAK ASUH ANAK',text:'Masih ada anak yang kecil. Bagaimana hak asuhnya?',opts:[
      {t:'Perjuangkan hak asuh',e:()=>{P.dekatAnak=clamp(P.dekatAnak+3,0,100);addLog('Anak-anak ikut Anda. Jadi orang tua tunggal itu berat, tapi mereka tetap dekat.'+fx({stress:+6}));}},
      {t:'Relakan ke mantan, kirim nafkah',e:()=>{P.nafkah={per:Math.round(12e6*Math.max(kidsU18(),1)),sisa:ri(8,15)};P.dekatAnak=clamp(P.dekatAnak-20,0,100);addLog('Anak diasuh mantan pasangan. Anda berkomitmen mengirim nafkah tiap tahun.'+fx({happy:-6,stress:+4}),'bad');}}
    ]});
  }
  P.love=null;
}
function beliAsetCard(d){
  if(d.kpr){
    const dp=Math.round(d.harga*0.2), sisa=Math.round(d.harga*1.2), cic=Math.round(d.harga*1.2/15);
    ask({title:'BELI '+d.n.toUpperCase(),text:d.n+' seharga '+rp(d.harga)+'. Bayar bagaimana?',opts:[
      {t:'Bayar cash',sub:rp(d.harga),cond:()=>P.money>=d.harga,e:()=>{P.money-=d.harga;P.aset.push(asetBaru(d));logBeli(d,false);}},
      {t:'KPR 15 tahun',sub:'DP '+rp(dp)+' · cicilan '+rp(cic)+'/th',cond:()=>P.money>=dp,e:()=>{P.money-=dp;const a=asetBaru(d);a.kpr={sisa,cicilan:cic,thn:15};P.aset.push(a);logBeli(d,true);}},
      {t:'Batal',e:()=>{}}
    ]});
  } else {
    if(P.money<d.harga)return addLog('Uang tunai tidak cukup untuk '+d.n+' ('+rp(d.harga)+').','bad');
    P.money-=d.harga;P.aset.push(asetBaru(d));logBeli(d,false);
  }
}
function logBeli(d,kpr){
  const ke=P.aset.filter(a=>a.k===d.k).length;
  addLog('Anda '+(kpr?'mengakad KPR untuk':'membeli')+' <b>'+d.n+'</b>'+(ke>1?' (unit ke-'+ke+')':'')+'.'+fx({happy:+5}),'good');
  milestone((kpr?'KPR ':'Beli ')+d.n+(ke>1?' #'+ke:''));
}
function buatTeman(){
  const g=r()<0.5?'L':'P';
  return {nama:namaOrang(g).split(' ')[0], sifat:pick(SIFAT_TEMAN), dekat:ri(40,58), thn:0};
}
/* kartu lamaran masuk (pemain perempuan menerima pinangan) */
function lamaranMasuk(nm){
  ask({title:nm.toUpperCase()+' MELAMAR ANDA',text:nm+' datang membawa cincin dan keluarganya. Ia ingin meminang Anda. Bagaimana?',opts:[
    {t:'Terima — nikah sederhana',sub:'Biaya '+rp(30e6),cond:()=>P.money>=30e6,e:()=>nikah(30e6,8)},
    {t:'Terima — pesta sedang',sub:'Biaya '+rp(80e6),cond:()=>P.money>=80e6,e:()=>nikah(80e6,11,2)},
    {t:'Terima — pesta besar',sub:'Biaya '+rp(200e6),cond:()=>P.money>=200e6,e:()=>nikah(200e6,15,5)},
    {t:'Belum siap — tolak halus',e:()=>{P.love.rel=clamp(P.love.rel-10,0,100);
      addLog('Anda menolak lamaran '+nm+' dengan halus. Ia mencoba mengerti, tapi suasana jadi canggung.'+fx({stress:+4,happy:-3}),'bad');}}
  ]});
}
function lahirAnak(){
  const jk=r()<0.5?'L':'P';
  const anak={nama:(jk==='L'?pick(NAMA_L):pick(NAMA_P)),lahirAt:P.age,jk,nikah:false,anak:false,didik:40};
  P.kids.push(anak);
  addLog('Anak '+(jk==='L'?'laki-laki':'perempuan')+' lahir! Anda menamainya <b>'+anak.nama+'</b>.'+fx({happy:+12,stress:+5,money:-8e6}),'good');
  stamp('ANAK LAHIR','green'); milestone('Anak lahir: '+anak.nama);
}

/* ================= HOBI ================= */
function hobiPerk(h){
  const lv=h.level;
  if(lv<3||r()>0.4)return;
  const F={
    musik:()=>addLog('Band Anda manggung di kafe — dapat honor.'+fx({money:ri(2,8)*1e6,happy:+4}),'good'),
    mancing:()=>addLog('Anda juara lomba mancing antarkampung!'+fx({money:ri(1,5)*1e6,happy:+4}),'good'),
    foto:()=>addLog('Anda dapat job foto wedding. Hasilnya lumayan.'+fx({money:ri(4,15)*1e6,happy:+3}),'good'),
    gaming:()=>{ if(r()<0.5)addLog('Anda menang turnamen e-sports lokal!'+fx({money:ri(2,20)*1e6,happy:+5}),'good'); },
    kebun:()=>addLog('Panen melimpah — hasil kebun laku dijual.'+fx({money:ri(1,4)*1e6,health:+2}),'good'),
    masak:()=>addLog('Open PO masakan Anda ramai pesanan.'+fx({money:ri(2,8)*1e6,happy:+3}),'good'),
    nulis:()=>{ if(lv>=4&&!P.bukuTerbit&&r()<0.5){ P.bukuTerbit=true;
        addLog('Naskah Anda diterima penerbit — BUKU PERTAMA TERBIT! Royalti mengalir.'+fx({money:ri(5,30)*1e6,happy:+10}),'good');
        milestone('Menerbitkan buku'); } else addLog('Tulisan Anda dimuat media — dapat honor kecil.'+fx({money:ri(1,3)*1e6}),'good'); },
    otomotif:()=>addLog('Motor modifikasi Anda menang kontes!'+fx({money:ri(3,12)*1e6,charm:+3}),'good'),
    badminton:()=>addLog('Anda juara turnamen badminton kompleks.'+fx({money:ri(1,6)*1e6,health:+2,happy:+3}),'good'),
    konten:()=>{ if(r()<0.12){ P.viral=true;
        addLog('Konten Anda VIRAL nasional! Endorse berdatangan.'+fx({money:ri(30,150)*1e6,charm:+8,happy:+8}),'good');
        stamp('VIRAL','gold'); milestone('Viral di media sosial'); }
      else addLog('Penghasilan adsense dan endorse kecil masuk rekening.'+fx({money:ri(3,25)*1e6}),'good'); },
    travel:()=>addLog('Cerita perjalanan Anda jadi bahan obrolan ke mana-mana.'+fx({charm:+2})),
    ikan:()=>addLog('Burayak ikan hias Anda laku keras di komunitas.'+fx({money:ri(1,5)*1e6}),'good'),
    futsal:()=>addLog('Tim futsal Anda juara turnamen tarkam — bawa pulang hadiah.'+fx({money:ri(1,5)*1e6,health:+2,happy:+3}),'good'),
    gym:()=>addLog('Badan makin terbentuk — Anda sempat dapat klien personal trainer.'+fx({money:ri(1,6)*1e6,charm:+3}),'good'),
    baking:()=>addLog('Open PO kue Anda kebanjiran order musim lebaran.'+fx({money:ri(2,10)*1e6,happy:+3}),'good'),
    craft:()=>addLog('Produk kerajinan tangan Anda laku di marketplace dan bazar.'+fx({money:ri(1,6)*1e6,happy:+2}),'good'),
    dance:()=>{ if(r()<0.5)addLog('Anda tampil di sebuah acara dan jadi sorotan.'+fx({charm:+4,happy:+4}),'good'); }
  };
  if(F[h.k])F[h.k]();
}
function tekuni(k){
  const h=P.hobi.find(x=>x.k===k); if(!h)return;
  const def=HOBI.find(x=>x.k===k);
  if(def.b>0){ if(P.money<def.b)return addLog('Tabungan tidak cukup untuk menekuni '+def.n+' tahun ini.','bad'); P.money-=def.b; }
  h.xp+=ri(30,55);
  const nl=1+Math.floor(h.xp/100);
  addLog('Anda menekuni hobi '+def.n+'.'+fx(def.fx));
  if(nl>h.level){ h.level=nl; addLog('Kemampuan '+def.n+' Anda naik ke <b>level '+nl+'</b>.','good'); }
  hobiPerk(h);
}


/* ================= MINI-GAME (assets/kuis.js) ================= */
function wawancaraKerja(t,g){
  if(typeof Kuis==='undefined'){ setJob(t,g); return; }
  Kuis.wawancara(t,rs=>{
    if(rs<0.4&&r()<0.6){ addLog('Seminggu kemudian email masuk: "Terima kasih atas minat Anda, namun kami belum dapat melanjutkan..."'+fx({stress:+4,happy:-3}),'bad'); return; }
    if(rs>=0.85)addLog('Pewawancara terkesan: "Jawaban Anda paling meyakinkan hari ini." Tawaran gaji dinaikkan.','good');
    setJob(t,Math.round(g*(0.9+rs*0.25)));
  });
}
function bikinSimKeh(){
  if(typeof Kuis==='undefined')return;
  Kuis.simLengkap(P.st.health,h=>{
    if(h==='resmi'){ P.sim=true; ach('simResmi'); milestone('Punya SIM'); addLog('SIM resmi di dompet, siap berkendara.'+fx({happy:+3}),'good'); }
    else if(h==='nembak'){ P.sim=true; P.integritas=clamp((P.integritas||60)-5,0,100); milestone('Punya SIM (jalur nembak)'); addLog('Biaya "jasa" '+rp(1e6)+'. SIM jadi, hati agak mengganjal.'+fx({money:-1e6}),'bad'); }
    else addLog('Belum dapat SIM tahun ini.'+fx({stress:+3}));
  });
}
