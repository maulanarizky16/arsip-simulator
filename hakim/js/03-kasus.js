'use strict';
/* ================= KARIER ================= */
function lvNow(){ return JAB[P.jab].lv; }
function setJab(k){
  P.jab=k; if(JAB[k].lv>P.maxLv)P.maxLv=JAB[k].lv; P.tahunJab=0;
  if(k==='pt')P.posisi='PT '+P.kota; else if(k==='agung')P.posisi='Mahkamah Agung'; else if(k==='ketua')P.posisi='Mahkamah Agung (Ketua)';
  P.tipikor=false;
  stamp(JAB[k].n.toUpperCase(),'green'); milestone('Diangkat: '+JAB[k].n); ach(k);
}
function cekPromosi(){
  if(P.retired||P.penjara>0||lvNow()>=4)return;
  const next={pn:'pt',pt:'agung',agung:'ketua'}[P.jab];
  if(!next)return;
  const s=P.st;
  const layakBersih = P.tahunJab>=ri(3,5) && s.reputasi>=(38+lvNow()*9) && s.kompetensi>=(45+lvNow()*7) && P.heat<55;
  const layakKoneksi = P.koneksi>=60 && P.tahunJab>=2 && P.heat<60;
  if((layakBersih||layakKoneksi) && r()<0.55){
    const via=!layakBersih&&layakKoneksi?' (lewat lobi & koneksi)':'';
    ask({title:'TAWARAN PROMOSI',text:'Tim seleksi mempertimbangkan Anda untuk naik menjadi <b>'+JAB[next].n+'</b>'+via+'.',opts:[
      {t:'Terima jabatan',e:()=>{setJab(next);addLog('Anda dilantik sebagai <b>'+JAB[next].n+'</b>. Wibawa (dan godaan) makin besar.'+fx({reputasi:+5,stres:+6}),'good');leg(1,6);}},
      {t:'Tolak, tetap di posisi sekarang',e:()=>addLog('Anda memilih bertahan. Sebagian menyebut kurang ambisi, sebagian menyebut tahu diri.'+fx({stres:-3}))}
    ]});
  }
}

/* ================= PERKARA & GELAR PERKARA ================= */
function buatKasus(){
  let pool=JENIS.slice();
  if(P.tipikor){ const kor=JENIS.find(j=>j.k==='korupsi'); pool=pool.concat([kor,kor,kor]); }
  const jenis=pick(pool);
  const tk=pick(jenis.td);
  const td=TERDAKWA.find(t=>t.k===tk)||pick(TERDAKWA);
  const tuduh=pick(TUDUHAN[jenis.k]);
  const bukti=pick(['kuat','kuat','lemah','berimbang']);     /* internal, TIDAK ditampilkan */
  const partial={jenis,td,bukti};
  const ks=KAIDAH.filter(x=>x.applies(partial));
  const kaidah=ks.length?pick(ks):null;
  const adil=(kaidah&&kaidah.adil)?kaidah.adil:(bukti==='kuat'?'bersalah':bukti==='lemah'?'bebas':(r()<0.5?'bersalah':'bebas'));
  const unjust=adil==='bersalah'?'bebas':'bersalah';
  let adaKuat;
  if(adil==='bersalah') adaKuat=td.kuasa>=0.5;                       /* terdakwa kuat ingin bebas */
  else adaKuat=(jenis.k==='ite'||jenis.k==='ham'||td.k==='aktivis'); /* penguasa ingin terdakwa dihukum */
  const tekanan=adaKuat?(adil==='bersalah'?td.kuasa:0.8):td.kuasa*0.2;
  const duitPenyuap=adil==='bersalah'?td.duit:0.7;
  const suap=(adaKuat&&r()<0.3+duitPenyuap*0.5)?Math.round(ri(1,5)*1e9*(1+lvNow()*0.6)*(0.5+duitPenyuap)):0;
  return {jenis,td,tuduh,bukti,kaidah,adil,unjust,tekanan,suap,found:[],diperiksa:{}};
}
function sidang(){
  if(P.penjara>0||P.retired||!P.alive||G.over)return;
  const n = lvNow()>=3?1:ri(1,2);
  for(let i=0;i<n;i++) gelarPerkara(buatKasus());
}
function gelarPerkara(c){
  P.perkara++;
  const tek=c.tekanan>=0.7?'<br><b>Tekanan tinggi:</b> ada pihak kuat yang menghendaki putusan <b>'+(c.unjust==='bersalah'?'BERSALAH':'BEBAS')+'</b>.'
           :c.tekanan>=0.4?'<br>Ada bisik-bisik agar perkara ini "diatur".':'';
  const txt='Sidang dibuka. Perkara <b>'+c.jenis.n+'</b>: seorang <b>'+c.td.n+'</b> didakwa '+c.tuduh+'.'+tek+
    '<br><span class="d">Periksa bukti & saksi lebih dulu. Kuat-lemahnya pembuktian, Anda sendiri yang menilai.</span>';
  const opts=[{t:'Buka pemeriksaan',e:()=>periksa(c)}];
  if(bisaMediasi(c))opts.push({t:'Upayakan mediasi & perdamaian',sub:'Selesaikan tanpa palu vonis',e:()=>mediasi(c)});
  opts.push({t:'Mundur dari perkara',sub:'Limpahkan ke majelis lain, main aman',e:()=>mundurPerkara(c)});
  ask({title:'GELAR PERKARA',text:txt,opts});
}
/* mediasi cocok untuk perkara perdata/tanah & pelaku rakyat kecil (bukan korupsi/narkoba) */
function bisaMediasi(c){ return c.jenis.k==='perdata'||c.jenis.k==='tanah'||(c.td.k==='rakyat'&&c.jenis.k!=='korupsi'&&c.jenis.k!=='narkoba'); }
function mediasi(c){
  const sukses=r()<clamp(0.4+P.st.kompetensi/250+P.st.integritas/300,0.3,0.85);
  if(sukses){
    P.mediasi++; P.adil++;
    addLog('Anda memanggil kedua pihak ke ruang mediasi. Setelah tarik-ulur yang melelahkan, tercapai perdamaian — perkara <b>'+c.td.n+'</b> ditutup tanpa palu vonis. Tak ada yang kalah total.'+fx({reputasi:+3,integritas:+2,trust:+2,stres:+2}),'good');
    leg(4,1);
    if(P.mediasi>=6)ach('mediator');
  } else {
    addLog('Mediasi buntu — kedua pihak bersikeras pada tuntutannya. Perkara tetap harus diperiksa dan diputus.'+fx({stres:+3}),'sys');
    periksa(c);
  }
}
function ambilKlu(c,kat){
  const jelas=(c.bukti==='berimbang')?0.4:0.7;
  const pBenar=clamp(jelas+(P.st.kompetensi-50)/200,0.35,0.9);   /* hakim kompeten membaca bukti lebih jernih */
  let leaning;
  if(r()<pBenar) leaning=c.adil==='bersalah'?'memberatkan':'meringankan';
  else leaning=r()<0.55?'ambigu':(c.adil==='bersalah'?'meringankan':'memberatkan');
  return {leaning,kat,text:pick(KLU[leaning][kat])};
}
function periksa(c){
  let ring;
  if(c.found.length) ring='<br><b>Temuan sejauh ini:</b><br>'+c.found.map(f=>'• '+f.text+' <span class="d">['+f.leaning+']</span>').join('<br>');
  else ring='<br><span class="d">Belum ada pemeriksaan. Pilih apa yang mau Anda dalami.</span>';
  const opts=PERIKSA.filter(p=>!c.diperiksa[p.k]).map(p=>({t:p.n,e:()=>{
    c.diperiksa[p.k]=true;
    c.found.push(ambilKlu(c,p.k));
    P.st.stres=clamp(P.st.stres+1,0,100);
    periksa(c);
  }}));
  opts.push({t:'Cukup, saatnya memutus »',sub:'Timbang sendiri bobot buktinya',e:()=>putusanCard(c)});
  ask({title:'PEMERIKSAAN PERSIDANGAN',text:'Memeriksa perkara <b>'+c.td.n+'</b> ('+c.jenis.n+').'+ring,opts});
}
function putusanCard(c){
  const m=c.found.filter(f=>f.leaning==='memberatkan').length;
  const k=c.found.filter(f=>f.leaning==='meringankan').length;
  const a=c.found.filter(f=>f.leaning==='ambigu').length;
  const ringkas=c.found.length?('Memberatkan <b>'+m+'</b> · Meringankan <b>'+k+'</b> · Ambigu <b>'+a+'</b>'):'<b>Anda tidak memeriksa bukti apa pun</b> — memutus buta.';
  const kd=c.kaidah?'<br><span class="d">Kaidah relevan, <b>'+c.kaidah.n+'</b>: '+c.kaidah.d+'</span>':'';
  const txt='Saatnya mengetuk palu untuk <b>'+c.td.n+'</b>.<br>Bobot bukti dari pemeriksaan Anda: '+ringkas+'.'+kd;
  const opts=[
    {t:'Vonis BERSALAH, hukuman setimpal',e:()=>putus(c,'bersalah')},
    {t:'Vonis BEBAS / lepas',e:()=>putus(c,'bebas')}
  ];
  if(c.suap>0)opts.push({t:'Terima "uang ketok" '+rp(c.suap),sub:'Putuskan '+(c.unjust==='bersalah'?'BERSALAH':'BEBAS')+' sesuai pesanan',e:()=>putus(c,'suap')});
  if(PERIKSA.some(p=>!c.diperiksa[p.k]))opts.push({t:'Belum yakin, periksa lagi',e:()=>periksa(c)});
  ask({title:'PALU KEADILAN',text:txt,opts});
}
function putus(c,pilihan){
  const suap=pilihan==='suap';
  const verdict=suap?c.unjust:pilihan;
  const just=(verdict===c.adil);
  const teliti=c.found.length>=3;
  if(suap){
    P.suapTerima++; P.takadil++;
    addLog('Palu diketuk sesuai pesanan (<b>'+verdict+'</b>). Amplop "uang ketok" '+rp(c.suap)+' berpindah diam-diam lewat panitera.'+fx({gelap:+c.suap,integritas:-12,heat:+10,trust:-3}),'bad');
    leg(-7,3); milestone('Terima suap perkara '+c.jenis.n);
    ach(P.suapTerima>=8?'mafia':'makelar');
  } else if(just){
    P.adil++;
    if(c.kaidah){ P.taatKaidah++; if(P.taatKaidah>=12)ach('taatAsas'); }
    const lawanKuat=c.tekanan>=0.6;
    const eff={integritas:+4,reputasi:+3,trust:+2}; if(teliti)eff.reputasi+=1;
    if(lawanKuat){
      eff.heat=+6; eff.nyali=+2;
      if(lvNow()>=2){
        P.dissent++; eff.reputasi+=1;
        addLog('Di meja majelis, sebagian rekan condong tunduk pada tekanan. Anda menolak — memutus <b>'+verdict+'</b> sesuai kaidah hukum dan menuliskan <b>dissenting opinion</b> yang kelak dikutip di ruang-ruang kuliah.'+fx(eff),'good');
        ach('dissenting');
      } else {
        addLog('Setelah menimbang bukti, Anda memutus <b>'+verdict+'</b> sesuai kaidah hukum, melawan tekanan pihak kuat. Sebuah keberanian.'+fx(eff),'good');
      }
      leg(8,-2); if(P.st.nyali>=70)ach('berani');
    } else {
      addLog('Setelah menimbang bukti'+(teliti?' secara menyeluruh':'')+', Anda memutus <b>'+verdict+'</b> sesuai bukti dan kaidah hukum. Ruang sidang menaruh hormat.'+fx(eff),'good');
      leg(5,1);
    }
    if(c.jenis.k==='pidana'&&verdict==='bersalah'&&c.bukti==='kuat'&&r()<0.15){ P.vonisMati++; ach('vonisMati'); addLog('Untuk kejahatan keji ini, Anda menjatuhkan hukuman mati. Tegas dan kontroversial.','sys'); }
    if((c.td.k==='rakyat'||c.td.k==='aktivis')&&verdict==='bebas'){ ach('pembela'); leg(2,0); }
  } else {
    P.takadil++;
    const salahVonis=verdict==='bersalah'?' Seorang yang semestinya bebas kini dipenjara.':' Yang bersalah justru Anda lepaskan.';
    addLog('Putusan Anda (<b>'+verdict+'</b>) menyimpang dari bukti & kaidah hukum.'+salahVonis+' Publik kecewa, media menyorot.'+fx({integritas:-6,reputasi:-3,trust:-3}),'bad');
    leg(-5,1);
    if(c.tekanan>=0.6){ P.koneksi=clamp(P.koneksi+6,0,100); addLog('Namun pihak kuat yang Anda menangkan kini berutang budi pada Anda.'+fx({heat:-4,reputasi:+1})+' <span class="d">(Koneksi +6)</span>','sys'); leg(0,3); }
  }
  if(P.perkara>=200)ach('produktif');
}
function mundurPerkara(c){
  P.mundur++;
  if(c.tekanan>=0.6){ addLog('Anda mengundurkan diri dari perkara panas ini, melimpahkannya ke majelis lain. Aman dari musuh, tapi keadilan menggantung di tangan orang lain.'+fx({stres:-3,reputasi:-1}),'sys'); leg(-1,0); }
  else addLog('Anda melimpahkan perkara ini ke hakim lain.'+fx({stres:-1,reputasi:-2}),'sys');
}
