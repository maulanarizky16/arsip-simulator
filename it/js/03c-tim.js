'use strict';
/* ================= TIM, REKRUTMEN & WAWANCARA (Simulator IT) =================
   Mulai jenjang Lead (lv 4) — atau sebagai founder startup sendiri — pemain memimpin tim yang terlihat:
   - Rekrut: buka lowongan → 3 CV (skill, pendidikan, pengalaman, HOBI, ekspektasi gaji) → wawancara (maks. 3
     pertanyaan, mengungkap skill asli, sifat, motivasi, gaji minimal) → negosiasi gaji → diterima/ditolak.
   - Kelola: arahan tahunan, 1-on-1, atur gaji, promosikan, berhentikan, ajukan tambah headcount.
   - Semua berpengaruh: skill × moral → skor tim → peluang fix insiden, stres pemain, penilaian kinerja,
     promosi ke Principal/CTO; sifat & hobi → moral, pertumbuhan, burnout, resign; gaji vs pasar → moral & iri.
   Gaji tim dibayar PERUSAHAAN (ada anggaran tim); hanya founder yang membayar dari kas sendiri. */

const KAPASITAS_TIM={lead:4,principal:6,cto:9};
const PERAN_SPES={support:['IT Support','Network Admin','Sysadmin'],sysadmin:['Sysadmin','DevOps Engineer','IT Support'],
  devops:['DevOps Engineer','SRE','Backend Dev'],network:['Network Engineer','Network Admin','NOC Engineer'],
  iot:['IoT Engineer','Firmware Engineer','Backend Dev'],security:['Security Analyst','Pentester','SOC Analyst'],
  backend:['Backend Dev','Frontend Dev','QA Engineer'],data:['Data Engineer','Data Analyst','Backend Dev']};
const LVL_TIM={junior:{n:'Junior',skill:[35,60],exp:[0,2]},medior:{n:'Medior',skill:[50,75],exp:[2,5]},senior:{n:'Senior',skill:[65,90],exp:[5,12]}};
const LVL_NEXT_TIM={junior:'medior',medior:'senior'};
const PENDIDIKAN_TIM=['S1 Informatika','S1 Sistem Informasi','D3 Teknik Komputer','SMK TKJ','Kursus coding intensif','Otodidak'];
/* sifat: tersembunyi di CV, terungkap lewat wawancara / 1-on-1 */
const SIFAT_TIM={
  kolaboratif:{n:'Kolaboratif',w:26,moralTim:+2,jawab:'Bercerita konflik di tim lama yang ia selesaikan lewat diskusi terbuka dan kompromi.'},
  pendiam:{n:'Pendiam tapi teliti',w:18,jawab:'Jawabannya singkat, tapi contoh kasusnya rinci dan masuk akal.'},
  ambisius:{n:'Ambisius',w:14,tumbuh:+1.5,resign:0.06,jawab:'Terang-terangan menargetkan jadi Lead dalam 2 tahun.'},
  workaholic:{n:'Workaholic',w:12,kerja:+6,burnout:0.12,jawab:'Bangga sering lembur sampai pagi dan jarang ambil cuti.'},
  kutuLoncat:{n:'Kutu loncat',w:10,resign:0.15,jawab:'Sudah pindah 4 kantor dalam 3 tahun: "Kalau ada tawaran lebih tinggi, ya pindah."'},
  toxic:{n:'Suka menyalahkan',w:8,moralTim:-4,kerja:+3,jawab:'Menghabiskan sepuluh menit menjelekkan rekan dan atasan di kantor lama.'},
  overclaim:{n:'Melebih-lebihkan CV',w:12,jawab:'Banyak istilah keren, tapi gelagapan saat ditanya detail proyek di CV-nya.'}
};
/* hobi: tampil di CV, efeknya kecil tapi nyata */
const HOBI_TIM={
  futsal:{n:'Futsal & olahraga tim',ef:'mempererat tim',moralTim:+1,burnout:-0.04},
  gaming:{n:'Main game kompetitif',ef:'cepat belajar tools baru',tumbuh:+0.5},
  oss:{n:'Kontributor open source',ef:'skill tumbuh cepat',tumbuh:+1.5},
  konten:{n:'Bikin konten tech',ef:'nama tim harum, tapi bisa pindah jadi kreator',rep:+1,resign:0.05},
  mancing:{n:'Mancing & alam',ef:'tenang saat insiden',burnout:-0.05},
  musik:{n:'Main musik / band',ef:'suasana tim cair',moralTim:+1},
  lari:{n:'Lari & maraton',ef:'tahan tekanan',burnout:-0.06},
  ngoprek:{n:'Ngoprek homelab',ef:'paham infra, skill tumbuh',tumbuh:+1},
  baca:{n:'Baca buku & menulis',ef:'komunikasi rapi',soft:+8},
  kopi:{n:'Barista rumahan',ef:'sering membawakan kopi untuk tim',moralTim:+1}
};
const MOTIF_TIM=[
  {t:'Ingin tantangan teknis yang lebih besar.',resign:0},
  {t:'Kantor lama sering lembur tanpa dibayar.',resign:0.02},
  {t:'Ingin lebih dekat dengan keluarga.',resign:-0.03},
  {t:'Gaji di kantor lama di bawah pasar.',resign:0.03}
];
const ARAHAN_TIM={
  delivery:{n:'Kejar fitur & delivery',d:'Reputasi naik bila tim kuat · moral tergerus'},
  utang:{n:'Bayar utang teknis',d:'Utang teknis aset turun'},
  stabil:{n:'Stabilitas & on-call',d:'Insiden lebih mudah ditangani'},
  belajar:{n:'Belajar & mentoring',d:'Skill anggota naik · delivery melambat'},
  keamanan:{n:'Perkuat keamanan',d:'Postur blue-team naik'}
};

/* ---------- status ---------- */
function adaTim(){ return !!P&&!!P.tim&&!P.retired&&!P.dipecat&&!P.menganggur&&P.penjara<=0&&(P.founder||lvNow()>=4); }
function kapasitasTim(){ if(!P.tim)return 0; return (P.founder?5:(KAPASITAS_TIM[P.jab]||4))+(P.tim.ekstra||0); }
function gajiPasarTim(lvl){
  const tm=TEMPAT.find(t=>t.k===P.tempat); const x=tm?tm.gajiX:1;
  return Math.round(JAB[lvl].gaji/12*x*(typeof faktorGaji==='function'?faktorGaji():1)/1e5)*1e5;
}
function gajiTimBulan(){ return P.tim?P.tim.anggota.reduce((a,m)=>a+m.gaji,0):0; }
function anggaranTimBulan(){ return Math.round(kapasitasTim()*gajiPasarTim('medior')*1.1); }
function sifatOf(m){ return SIFAT_TIM[m.sifat]||{}; }
function hobiOf(m){ return HOBI_TIM[m.hobi]||{}; }
/* skor tim 0..100: rata-rata (skill × semangat) anggota, dikoreksi ukuran tim terhadap kapasitas */
function timSkor(){
  if(!P.tim||!P.tim.anggota.length)return 25;
  const ag=P.tim.anggota;
  const rata=ag.reduce((a,m)=>a+m.skill*(0.55+m.moral/220)+(sifatOf(m).kerja||0),0)/ag.length;
  const isi=Math.min(1,ag.length/Math.max(2,kapasitasTim()*0.6));
  return Math.round(clamp(rata*(0.7+0.3*isi),0,100));
}
function timBonusInsiden(){ if(!adaTim())return 0; return (timSkor()-50)/300+(P.tim.arah==='stabil'?0.04:0); }

/* ---------- membuat orang (anggota warisan atau kandidat) ---------- */
function pilihBobot(obj){ const e=Object.entries(obj); const t=e.reduce((a,[,v])=>a+(v.w||1),0); let x=r()*t; for(const [k,v] of e){ x-=(v.w||1); if(x<=0)return k; } return e[0][0]; }
function buatOrangTim(lvl){
  const L=LVL_TIM[lvl], g=r()<0.6?'L':'P';
  const skill=ri(L.skill[0],L.skill[1]), exp=ri(L.exp[0],L.exp[1]);
  const sifat=pilihBobot(SIFAT_TIM), hobi=pick(Object.keys(HOBI_TIM));
  const m={id:'t'+ri(1e5,9e5),g,nama:namaOrang(g),skin:pick(['light','medium-light','medium','medium','medium-dark','dark']),
    umur:21+exp+ri(0,3),lvl,peran:pick(PERAN_SPES[P.spes]||['Backend Dev']),pendidikan:pick(PENDIDIKAN_TIM),exp,
    skill,soft:clamp(ri(30,80)+(HOBI_TIM[hobi].soft||0),0,100),potensi:ri(1,3),sifat,hobi,motif:ri(0,MOTIF_TIM.length-1),
    moral:ri(55,70),tahun:0,kenal:false};
  m.gaji=Math.round(gajiPasarTim(lvl)*(0.9+r()*0.2)/1e5)*1e5;
  return m;
}
function buatKandidat(lvl){
  const k=buatOrangTim(lvl);
  k.skillCV=clamp(k.sifat==='overclaim'?k.skill+ri(14,24):k.skill+ri(-3,5),0,100);
  if(k.sifat==='overclaim')k.skill=Math.max(25,k.skill-ri(5,12));
  const naik=(k.sifat==='kutuLoncat'||k.sifat==='ambisius')?0.12:0;
  k.ask=Math.round(gajiPasarTim(lvl)*(0.95+r()*0.25+naik)/1e5)*1e5;
  k.min=Math.round(k.ask*(0.84+r()*0.12)/1e5)*1e5;
  k.tahu={}; k.ditanya=0;
  return k;
}
/* tim warisan saat pertama kali naik jadi Lead / pindah kantor sebagai Lead+ */
function buatTimAwal(){
  P.tim={anggota:[],arah:'stabil',ekstra:0,tahun:0};
  if(P.founder)return;
  const n=Math.min(kapasitasTim()-1,ri(2,3));
  for(let i=0;i<n;i++){ const m=buatOrangTim(pick(['junior','junior','medior','senior'])); P.tim.anggota.push(m); }
  addLog('Kamu kini memimpin tim berisi <b>'+n+' orang</b> yang diwariskan atasan sebelumnya. Kenali mereka lewat 1-on-1 di laci <b>TIM</b>.','sys');
}

/* ---------- tampilan CV / kartu anggota ---------- */
function avatarTim(m){ return (typeof hasDoc!=='undefined'&&hasDoc&&window.ArsipArt)?ArsipArt.img((m.g==='L'?'man':'woman')+'-technologist','tm-av','',m.skin):''; }
function barTim(v,cls){ return '<i class="tm-bar '+(cls||'')+'"><i style="width:'+Math.round(clamp(v,0,100))+'%"></i></i>'; }
function cvHtml(k){
  const h=hobiOf(k), sf=sifatOf(k), mt=MOTIF_TIM[k.motif];
  return '<div class="tm-cv"><div class="tm-head">'+avatarTim(k)+'<div><b>'+k.nama+'</b><small>'+k.umur+' th · '+k.pendidikan+' · pengalaman '+k.exp+' th</small></div></div>'+
    '<div class="tm-row"><span>Melamar</span><b>'+k.peran+' · '+LVL_TIM[k.lvl].n+'</b></div>'+
    '<div class="tm-row"><span>Skill (klaim CV)</span><b>'+k.skillCV+'</b></div>'+barTim(k.skillCV)+
    (k.tahu.skill?'<div class="tm-row tm-reveal"><span>Skill hasil tes</span><b>'+k.skill+'</b></div>'+barTim(k.skill,'real'):'')+
    '<div class="tm-row"><span>Hobi</span><b>'+h.n+'</b></div><div class="tm-ef">↳ '+h.ef+'</div>'+
    '<div class="tm-row"><span>Ekspektasi gaji</span><b>'+rp(k.ask)+'/bln</b></div>'+
    (k.tahu.min?'<div class="tm-row tm-reveal"><span>Gaji minimal yang mau diterima</span><b>±'+rp(k.min)+'</b></div>':'')+
    (k.tahu.sifat?'<div class="tm-reveal tm-q">Sifat kerja: <b>'+sf.n+'</b>. '+sf.jawab+'</div>':'')+
    (k.tahu.motif?'<div class="tm-reveal tm-q">Alasan pindah: '+(k.sifat==='kutuLoncat'?SIFAT_TIM.kutuLoncat.jawab:mt.t)+'</div>':'')+
  '</div>';
}

/* ---------- REKRUT: lowongan → CV → wawancara → tawaran ---------- */
function bukaLowongan(){
  if(P.tim.anggota.length>=kapasitasTim()){
    addLog('Tim sudah penuh ('+P.tim.anggota.length+'/'+kapasitasTim()+'). Berhentikan seseorang atau ajukan tambahan headcount dulu.','bad'); return;
  }
  ask({title:'BUKA LOWONGAN',text:'Posisi apa yang mau dibuka? Gaji pasar di '+(P.tempatN||'kantor')+': Junior ±'+rp(gajiPasarTim('junior'))+', Medior ±'+rp(gajiPasarTim('medior'))+', Senior ±'+rp(gajiPasarTim('senior'))+' per bulan. '+
    (P.founder?'Gaji tim dibayar dari kas startup-mu.':'Gaji dibayar perusahaan dari anggaran tim (±'+rp(anggaranTimBulan())+'/bln, terpakai '+rp(gajiTimBulan())+').'),
    opts:['junior','medior','senior'].map(l=>({t:LVL_TIM[l].n,sub:'Gaji pasar ±'+rp(gajiPasarTim(l))+'/bln',e:()=>daftarKandidat([buatKandidat(l),buatKandidat(l),buatKandidat(l)])}))
      .concat([{t:'Batal',e:()=>{}}])});
}
function daftarKandidat(ks){
  ask({title:'CV MASUK',text:'Tiga kandidat lolos screening HR. Klaim di CV belum tentu benar: wawancara untuk mengujinya.<div class="tm-list">'+ks.map(cvHtml).join('')+'</div>',
    opts:ks.map(k=>({t:'Wawancarai '+k.nama.split(' ')[0],sub:k.peran+' · minta '+rp(k.ask)+'/bln',e:()=>wawancaraKandidat(k,ks)}))
      .concat([{t:'Tutup lowongan',e:()=>addLog('Lowongan ditutup tanpa merekrut siapa pun.','sys')}])});
}
const TANYA_TIM=[
  {k:'skill',t:'Tes teknis singkat',sub:'Ungkap skill aslinya'},
  {k:'sifat',t:'"Ceritakan konflik di tim sebelumnya"',sub:'Ungkap sifat kerjanya'},
  {k:'motif',t:'"Kenapa ingin pindah kerja?"',sub:'Ungkap loyalitas & motivasi'},
  {k:'min',t:'"Berapa gaji minimal yang bisa kamu terima?"',sub:'Ungkap ruang negosiasi'}
];
function wawancaraKandidat(k,ks){
  const sisa=3-k.ditanya;
  const opts=sisa>0?TANYA_TIM.filter(q=>!k.tahu[q.k]).map(q=>({t:q.t,sub:q.sub+' · sisa '+sisa+' pertanyaan',e:()=>{ k.tahu[q.k]=true; k.ditanya++; wawancaraKandidat(k,ks); }})):[];
  opts.push({t:'Beri penawaran gaji',sub:'Masuk ke negosiasi',e:()=>tawarGaji(k,ks)});
  opts.push({t:'Kembali ke daftar CV',e:()=>daftarKandidat(ks)});
  ask({title:'WAWANCARA: '+k.nama.toUpperCase(),text:(k.ditanya?'':'Kandidat duduk di depanmu (atau di layar video call). Kamu punya waktu untuk <b>3 pertanyaan</b>.')+cvHtml(k),opts});
}
function tawarGaji(k,ks){
  const band=gajiPasarTim(k.lvl), bulat=x=>Math.round(x/1e5)*1e5;
  const pilihan=[[bulat(k.ask*0.85),'Tawar rendah'],[band,'Sesuai standar kantor'],[k.ask,'Sesuai permintaan'],[bulat(k.ask*1.1),'Lebih tinggi dari permintaan']]
    .filter((v,i,a)=>a.findIndex(x=>x[0]===v[0])===i).sort((a,b)=>a[0]-b[0]);
  ask({title:'NEGOSIASI GAJI',text:cvHtml(k)+'<div class="tm-q">Standar gaji '+LVL_TIM[k.lvl].n+' di kantormu ±'+rp(band)+'/bln. Gaji lebih tinggi dari rekan setim yang setara bisa memicu rasa iri.</div>',
    opts:pilihan.map(([v,lbl])=>({t:lbl+': '+rp(v)+'/bln',sub:Math.round(v/k.ask*100)+'% dari permintaan',e:()=>putuskanTawaran(k,v,ks)}))
      .concat([{t:'Batal, kembali ke CV',e:()=>daftarKandidat(ks)}])});
}
function putuskanTawaran(k,v,ks){
  const p=v>=k.min?0.95:v>=k.min*0.95?0.4:0.08;
  if(r()>=p){ addLog(k.nama+' menolak tawaran '+rp(v)+'/bln: "Maaf, saya menerima tawaran dari perusahaan lain."'+fx({stres:+1}),'bad');
    const sisa=ks.filter(x=>x!==k); if(sisa.length)daftarKandidat(sisa); return; }
  const m=Object.assign({},k,{gaji:v,moral:clamp(Math.round(62+(v/k.ask-1)*120+(r()*10-5)),25,95),kenal:!!k.tahu.sifat});
  delete m.tahu; delete m.ditanya; delete m.ask; delete m.min;
  /* rasa iri: rekan setara/lebih senior yang digaji lebih rendah */
  const urutan={junior:1,medior:2,senior:3}; let iri=0;
  for(const o of P.tim.anggota)if(urutan[o.lvl]>=urutan[m.lvl]&&o.gaji<v){ o.moral=clamp(o.moral-8,0,100); iri++; }
  P.tim.anggota.push(m);
  addLog('<b>'+m.nama+'</b> bergabung sebagai '+m.peran+' '+LVL_TIM[m.lvl].n+' dengan gaji '+rp(v)+'/bln.'+(iri?' '+iri+' rekan setim mendengar gajinya lebih tinggi dan mulai menggerutu.':''),'good');
  milestone('Merekrut '+m.nama);
  if(m.skill>=85&&m.lvl!=='senior')ach('pemburuBakat');
  if(!P.founder&&gajiTimBulan()>anggaranTimBulan())addLog('Catatan: total gaji tim ('+rp(gajiTimBulan())+'/bln) melewati anggaran ('+rp(anggaranTimBulan())+'/bln). Finance akan menanyakannya.','bad');
}

/* ---------- KELOLA TIM ---------- */
function pilihAnggota(judul,teks,syarat,aksi){
  const ag=P.tim.anggota.filter(syarat||(()=>true));
  if(!ag.length){ addLog('Tidak ada anggota yang memenuhi syarat untuk itu.','sys'); return false; }
  ask({title:judul,text:teks,opts:ag.map(m=>({t:m.nama,sub:m.peran+' '+LVL_TIM[m.lvl].n+' · skill '+m.skill+' · moral '+m.moral+' · '+rp(m.gaji)+'/bln',e:()=>aksi(m)})).concat([{t:'Batal',e:()=>{}}])});
  return true;
}
function satuSatuAnggota(){
  pilihAnggota('1-ON-1 DENGAN ANGGOTA','Siapa yang mau kamu ajak bicara empat mata?',null,m=>{
    m.moral=clamp(m.moral+ri(5,10),0,100); const baru=!m.kenal; m.kenal=true; const sf=sifatOf(m);
    let t=m.nama+' merasa didengar.'+(baru?' Kamu jadi mengenal sifatnya: <b>'+sf.n+'</b>.':'');
    if(m.moral<45)t+=' Ia jujur mengaku sedang mempertimbangkan pindah kerja.';
    else if(m.sifat==='ambisius'&&m.tahun>=2&&LVL_NEXT_TIM[m.lvl])t+=' Ia bertanya kapan bisa naik jenjang.';
    else if(m.sifat==='workaholic'&&P.tim.arah==='delivery')t+=' Kantung matanya tebal: tanda-tanda burnout.';
    addLog(t+fx({soft:+1}),'good');
  });
}
function aturGajiAnggota(){
  pilihAnggota('ATUR GAJI ANGGOTA','Pilih anggota yang gajinya mau ditinjau. Gaji pasar: Junior ±'+rp(gajiPasarTim('junior'))+', Medior ±'+rp(gajiPasarTim('medior'))+', Senior ±'+rp(gajiPasarTim('senior'))+'.',null,m=>{
    const pasar=gajiPasarTim(m.lvl);
    ask({title:'GAJI '+m.nama.toUpperCase(),text:'Gaji sekarang '+rp(m.gaji)+'/bln ('+Math.round(m.gaji/pasar*100)+'% dari pasar '+LVL_TIM[m.lvl].n+').',
      opts:[0,5,10,20].map(pc=>({t:pc?'Naikkan '+pc+'%':'Tidak ada kenaikan tahun ini',sub:pc?'Jadi '+rp(Math.round(m.gaji*(1+pc/100)/1e5)*1e5)+'/bln':'Moral bisa turun bila gajinya di bawah pasar',e:()=>{
        const lama=m.gaji; m.gaji=Math.round(m.gaji*(1+pc/100)/1e5)*1e5;
        const dm=pc===0?(lama<pasar*0.95?-8:-2):pc===5?+3:pc===10?+8:+14;
        m.moral=clamp(m.moral+dm,0,100);
        addLog(pc?'Gaji '+m.nama+' naik '+pc+'% menjadi '+rp(m.gaji)+'/bln.':m.nama+' tidak mendapat kenaikan gaji tahun ini.'+(dm<-5?' Ia tahu gajinya di bawah pasar.':''),pc?'good':'sys');
      }}))});
  });
}
function promosiAnggota(){
  pilihAnggota('PROMOSIKAN ANGGOTA','Anggota dengan masa kerja ≥ 2 tahun dan skill memadai bisa naik jenjang. Gajinya ikut disesuaikan ke standar jenjang baru.',
    m=>LVL_NEXT_TIM[m.lvl]&&m.tahun>=2&&m.skill>=LVL_TIM[LVL_NEXT_TIM[m.lvl]].skill[0],m=>{
      const lama=m.lvl; m.lvl=LVL_NEXT_TIM[lama]; m.gaji=Math.max(m.gaji,gajiPasarTim(m.lvl)); m.moral=clamp(m.moral+15,0,100); m.tahun=0;
      addLog(m.nama+' naik dari '+LVL_TIM[lama].n+' ke <b>'+LVL_TIM[m.lvl].n+'</b>. Gajinya kini '+rp(m.gaji)+'/bln.'+fx({reputasi:+1}),'good');
      for(const o of P.tim.anggota)if(o!==m&&o.sifat==='ambisius'&&o.lvl===lama)o.moral=clamp(o.moral-6,0,100);
    });
}
function berhentikanAnggota(){
  pilihAnggota('BERHENTIKAN ANGGOTA','Memberhentikan orang selalu berat. Pesangon '+(P.founder?'dibayar dari kas startup-mu':'dibayar perusahaan')+'; anggota lain akan memperhatikan caramu melakukannya.',null,m=>{
    P.tim.anggota=P.tim.anggota.filter(o=>o!==m);
    const pesangon=Math.round(m.gaji*Math.min(9,1+m.tahun)/1e5)*1e5;
    if(P.founder)P.money-=pesangon;
    const lega=m.sifat==='toxic';
    for(const o of P.tim.anggota)o.moral=clamp(o.moral+(lega?5:-5),0,100);
    addLog(m.nama+' diberhentikan dengan pesangon '+rp(pesangon)+(P.founder?' dari kas startup':'')+'. '+(lega?'Diam-diam tim merasa lega: suasana kerja membaik.':'Tim jadi lebih waspada dan sedikit cemas.')+fx({stres:+3}),lega?'good':'sys');
  });
}
function beriArahanTim(){
  ask({title:'ARAHAN TIM TAHUN INI',text:'Fokus tim saat ini: <b>'+ARAHAN_TIM[P.tim.arah].n+'</b>. Arahan menentukan apa yang dikerjakan tim sepanjang tahun.',
    opts:Object.entries(ARAHAN_TIM).map(([k,a])=>({t:a.n+(k===P.tim.arah?' (sekarang)':''),sub:a.d,e:()=>{ P.tim.arah=k; addLog('Arahan tim tahun ini: <b>'+a.n+'</b>.','sys'); }}))});
}
function ajukanHeadcount(){
  const p=clamp(0.25+(P.reputasi-50)/200+(timSkor()-50)/200+(N.pasar==='boom'?0.15:N.pasar==='krisis'?-0.2:0),0.05,0.8);
  if(r()<p){ P.tim.ekstra=(P.tim.ekstra||0)+1; addLog('Manajemen menyetujui tambahan 1 headcount. Kapasitas tim kini '+kapasitasTim()+' orang.'+fx({soft:+1}),'good'); }
  else addLog('Tambahan headcount ditolak: "Maksimalkan dulu tim yang ada."'+fx({stres:+2}),'bad');
}

/* ---------- PROSES TAHUNAN ---------- */
function timTahunan(){
  if(!adaTim())return;
  const T=P.tim, ag=T.anggota; T.tahun++;
  const moralTim=ag.reduce((a,m)=>a+(sifatOf(m).moralTim||0)+(hobiOf(m).moralTim||0),0);
  const keluar=[];
  for(const m of ag){
    m.tahun++; m.umur++;
    const tumbuh=m.potensi+(sifatOf(m).tumbuh||0)+(hobiOf(m).tumbuh||0)+(T.arah==='belajar'?3:0);
    m.skill=clamp(Math.round(m.skill+tumbuh*(m.skill<85?1:0.3)),0,100);
    const pasar=gajiPasarTim(m.lvl);
    let dm=moralTim-(sifatOf(m).moralTim||0)+(P.st.soft-50)/12+((P.budaya||50)-50)/12+(m.gaji<pasar*0.9?-6:m.gaji>pasar*1.1?2:0);
    if(T.arah==='delivery')dm-=5; if(T.arah==='belajar')dm+=3;
    m.moral=clamp(Math.round(m.moral+dm+ri(-4,4)),0,100);
    /* burnout */
    const pb=Math.max(0,(sifatOf(m).burnout||0)+(hobiOf(m).burnout||0)+(T.arah==='delivery'?0.08:0));
    if(r()<pb){ m.moral=clamp(m.moral-15,0,100); m.skill=clamp(m.skill-3,0,100); addLog(m.nama+' burnout setelah berbulan-bulan lembur. Ia butuh cuti panjang.','bad'); }
    /* resign */
    let pr=(m.moral<35?0.35:m.moral<50?0.12:0.03)+(sifatOf(m).resign||0)+(hobiOf(m).resign||0)+(MOTIF_TIM[m.motif].resign||0)+(N.pasar==='boom'?0.05:0);
    if(m.sifat==='ambisius'&&m.tahun>=3&&LVL_NEXT_TIM[m.lvl])pr+=0.1;
    if(m.skill>=85)pr+=0.05;   /* bintang diburu headhunter */
    if(r()<clamp(pr,0,0.8))keluar.push(m);
  }
  for(const m of keluar){
    T.anggota=T.anggota.filter(o=>o!==m);
    const alasan=m.hobi==='konten'&&r()<0.5?'memilih fokus jadi kreator konten tech':m.skill>=85?'dibajak perusahaan lain dengan gaji jauh lebih tinggi':m.moral<40?'merasa tidak dihargai di tim':'mendapat tawaran di tempat lain';
    addLog('<b>'+m.nama+'</b> resign: '+alasan+'.','bad');
  }
  const skor=timSkor();
  /* efek arahan */
  if(T.arah==='delivery'&&skor>=55){ const n=Math.round((skor-50)/8); addLog('Tim merilis fitur-fitur besar tepat waktu. Nama timmu terdengar sampai direksi.'+fx({reputasi:+n}),'good'); }
  if(T.arah==='utang'){ for(const a of P.infra)a.debt=clamp((a.debt||0)-Math.round(skor/12),0,100); }
  if(T.arah==='keamanan'){ P.bluTeam=clamp((P.bluTeam||0)+Math.round(skor/10),0,100); }
  const repHobi=T.anggota.reduce((a,m)=>a+(hobiOf(m).rep||0),0); if(repHobi)P.reputasi=clamp(P.reputasi+repHobi,0,100);
  /* tim kuat = beban pemimpin lebih ringan */
  if(T.anggota.length)P.st.stres=clamp(P.st.stres+(skor>=65?-3:skor<40?4:0),0,100);
  /* gaji: founder bayar dari kas, karyawan dicek terhadap anggaran perusahaan */
  if(P.founder&&T.anggota.length){ const biaya=gajiTimBulan()*12; P.money-=biaya; addLog('Gaji tim setahun ('+rp(biaya)+') dibayar dari kas startup-mu.','sys'); }
  else if(gajiTimBulan()>anggaranTimBulan()){ P.reputasi=clamp(P.reputasi-2,0,100); addLog('Finance menegur: gaji tim '+rp(gajiTimBulan())+'/bln melewati anggaran '+rp(anggaranTimBulan())+'/bln.','bad'); }
  if(T.anggota.length>=4&&T.anggota.every(m=>m.moral>=70))ach('pemimpinTim');
  /* satu kejadian tim per tahun */
  if(T.anggota.length>=2&&r()<0.55)kejadianTim();
}
function kejadianTim(){
  const ag=P.tim.anggota, a=pick(ag), b=pick(ag.filter(x=>x!==a));
  const toxic=ag.find(m=>m.sifat==='toxic');
  if(toxic&&r()<0.5){
    const lain=pick(ag.filter(x=>x!==toxic));
    ask({title:'KONFLIK DI TIM',text:'<b>'+toxic.nama+'</b> menyalahkan <b>'+lain.nama+'</b> di depan semua orang saat rapat retro. Suasana membeku.',opts:[
      {t:'Tegur '+toxic.nama.split(' ')[0]+' secara pribadi',e:()=>{ toxic.moral=clamp(toxic.moral-8,0,100); lain.moral=clamp(lain.moral+8,0,100); addLog('Kamu menegur '+toxic.nama+' empat mata. Tim melihat bahwa kamu melindungi mereka.'+fx({soft:+2}),'good'); }},
      {t:'Biarkan, nanti juga reda',e:()=>{ for(const m of ag)if(m!==toxic)m.moral=clamp(m.moral-6,0,100); P.budaya=clamp((P.budaya||50)-4,0,100); addLog('Kamu diam. Sejak itu, rapat retro jadi sepi usulan.','bad'); }}
    ]});
    return;
  }
  if(!b)return;
  const pilihan=[
    ()=>{ const acara=a.hobi==='futsal'?'futsal tiap Jumat sore':a.hobi==='musik'?'jamming di ruang rapat sepulang kerja':a.hobi==='kopi'?'mencicipi kopi racikannya':'makan siang bareng';
      for(const m of ag)m.moral=clamp(m.moral+4,0,100);
      addLog(a.nama+' mengajak tim '+acara+'. Tim jadi lebih akrab.','good'); },
    ()=>ask({title:'ANGGOTA MINTA NAIK GAJI',text:'<b>'+a.nama+'</b> menunjukkan tawaran dari perusahaan lain: gaji '+rp(Math.round(a.gaji*1.3/1e5)*1e5)+'/bln. "Saya betah di sini, tapi..."',opts:[
      {t:'Tandingi tawaran (+20%)',e:()=>{ a.gaji=Math.round(a.gaji*1.2/1e5)*1e5; a.moral=clamp(a.moral+12,0,100); addLog(a.nama+' bertahan dengan gaji baru '+rp(a.gaji)+'/bln.','good'); }},
      {t:'Tidak bisa, silakan putuskan',e:()=>{ if(r()<0.6){ P.tim.anggota=P.tim.anggota.filter(o=>o!==a); addLog(a.nama+' menerima tawaran itu dan pamit.','bad'); } else { a.moral=clamp(a.moral-10,0,100); addLog(a.nama+' memilih bertahan, tapi semangatnya jelas menurun.','sys'); } }}
    ]}),
    ()=>{ const m=ag.slice().sort((x,y)=>y.skill-x.skill)[0]; addLog(m.nama+' menemukan akar masalah bug lama yang menghantui tim berbulan-bulan. Satu tim bertepuk tangan.'+fx({reputasi:+1}),'good'); m.moral=clamp(m.moral+6,0,100); },
    ()=>{ if(b.hobi==='konten'){ addLog('Video '+b.nama+' tentang cara kerja timmu viral di LinkedIn. Lamaran kerja ke timmu membanjir.'+fx({reputasi:+2}),'good'); } else addLog(a.nama+' dan '+b.nama+' berdebat panjang soal tab vs spasi. Akhirnya diputuskan oleh linter.','sys'); }
  ];
  pick(pilihan)();
}

/* ---------- aksi di laci TIM ---------- */
const ACTS_TIM=[
  {k:'timRekrut',tab:'tim',lbl:'Buka lowongan & wawancara',sub:()=>P.tim?P.tim.anggota.length+'/'+kapasitasTim()+' orang · lihat CV & negosiasi gaji':'',multi:true,cond:()=>adaTim(),e:()=>bukaLowongan()},
  {k:'timArahan',tab:'tim',lbl:'Beri arahan tim',sub:()=>P.tim?'Sekarang: '+ARAHAN_TIM[P.tim.arah].n:'',multi:true,cond:()=>adaTim(),e:()=>beriArahanTim()},
  {k:'tim1on1',tab:'tim',lbl:'1-on-1 dengan anggota',sub:'Moral naik · kenali sifatnya',multi:true,cond:()=>adaTim()&&P.tim.anggota.length>0,e:()=>satuSatuAnggota()},
  {k:'timGaji',tab:'tim',lbl:'Atur gaji anggota',sub:()=>P.founder?'Dibayar dari kas startup':'Anggaran '+rp(gajiTimBulan())+' / '+rp(anggaranTimBulan())+' per bln',cond:()=>adaTim()&&P.tim.anggota.length>0,e:()=>aturGajiAnggota()},
  {k:'timPromosi',tab:'tim',lbl:'Promosikan anggota',sub:'Naik jenjang & gaji',cond:()=>adaTim()&&P.tim.anggota.some(m=>LVL_NEXT_TIM[m.lvl]&&m.tahun>=2&&m.skill>=LVL_TIM[LVL_NEXT_TIM[m.lvl]].skill[0]),e:()=>promosiAnggota()},
  {k:'timPecat',tab:'tim',lbl:'Berhentikan anggota',sub:'Buka slot · tim memperhatikan',cond:()=>adaTim()&&P.tim.anggota.length>0,e:()=>berhentikanAnggota()},
  {k:'timHeadcount',tab:'tim',lbl:'Ajukan tambah headcount',sub:'Perbesar kapasitas tim',cond:()=>adaTim()&&!P.founder&&P.tim.anggota.length>=kapasitasTim(),e:()=>ajukanHeadcount()}
];

/* ---------- panel TIM di sisi kanan ---------- */
function renderTim(){
  if(typeof hasDoc==='undefined'||!hasDoc)return;
  const card=$('timCard'); if(!card)return;
  if(!adaTim()){ card.hidden=true; return; }
  card.hidden=false;
  const T=P.tim, skor=timSkor();
  let h='<div class="tm-sum"><span>Skor tim <b>'+skor+'</b></span><span>'+T.anggota.length+'/'+kapasitasTim()+' orang</span><span>'+ARAHAN_TIM[T.arah].n+'</span></div>';
  if(!T.anggota.length)h+='<div class="muted">Belum ada anggota. Buka lowongan di laci TIM.</div>';
  for(const m of T.anggota){
    const sf=m.kenal?sifatOf(m).n:'sifat belum dikenal';
    h+='<div class="tm-mem">'+avatarTim(m)+'<div class="tm-info"><b>'+m.nama+'</b><small>'+m.peran+' '+LVL_TIM[m.lvl].n+' · '+rp(m.gaji)+'/bln · '+sf+'</small>'+
      '<div class="tm-mini"><span>Skill</span>'+barTim(m.skill)+'<span>Moral</span>'+barTim(m.moral,m.moral<40?'low':'')+'</div></div></div>';
  }
  $('timList').innerHTML=h;
}
