// Tes bertarget mekanik baru hakim (headless, hasDoc=false): doktor, mediator, dissenting, teladan, jenis perkara baru.
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const dir=path.join(__dirname,'..','hakim','js');
const code=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort()
  .map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n');

const store={};
const ctx={ Math, JSON, Object, Array, console,
  localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=''+v;},removeItem:k=>{delete store[k];}},
  window:{} };
ctx.window.Platform=undefined;
vm.createContext(ctx);
vm.runInContext(code,ctx,{filename:'hakim.bundle.js'});

const out=[]; let fail=0;
function ok(name,cond){ out.push((cond?'  ok  ':'  FAIL')+' · '+name); if(!cond)fail++; }

vm.runInContext(`
  newGame();
  G.current=null; G.queue=[];   // buang kartu cara-main

  // 1) DOKTOR: studi 2 tahun → selesai, gelar dapat "Dr.", ach.doktor
  var gelarAwal=P.gelar; P.study=2; P.penjara=0; P.retired=false;
  drift(); var saatStudi=P.study;     // 1
  drift();                            // 0 → lulus
  globalThis.__doktor = { study:P.study, naikGelar:P.gelar.indexOf('Dr.')===0, ach:!!P.ach.doktor, saatStudi:saatStudi, gelarAwal:gelarAwal };

  // 2) MEDIATOR: mediasi perkara eligible berkali-kali → P.mediasi naik, ach.mediator saat >=6
  P.st.kompetensi=90; P.st.integritas=90; var adilSebelum=P.adil;
  for(var i=0;i<120 && !P.ach.mediator;i++){
    G.current=null; G.queue=[];
    var c={td:{n:'rakyat kecil',k:'rakyat'}, jenis:{k:'perdata'}, found:[], diperiksa:{}, adil:'bebas', unjust:'bersalah', suap:0, tekanan:0.1, kaidah:null, bukti:'berimbang'};
    ok_med = bisaMediasi(c);
    mediasi(c);
  }
  globalThis.__mediator = { eligible:ok_med, mediasi:P.mediasi, ach:!!P.ach.mediator, adilNaik:P.adil>adilSebelum };

  // 3) DISSENTING: di level Hakim Tinggi (lv2), putus adil melawan tekanan → P.dissent naik + ach
  setJab('pt');
  var disSebelum=P.dissent;
  var c2={jenis:{k:'pidana'}, td:{k:'pengusaha',n:'pengusaha kakap'}, tuduh:'x', bukti:'kuat', kaidah:null, adil:'bersalah', unjust:'bebas', tekanan:0.85, suap:0, found:[]};
  putus(c2,'bersalah');
  globalThis.__dissent = { lv:lvNow(), dissent:P.dissent>disSebelum, ach:!!P.ach.dissenting };

  // 4) TELADAN: stats bersih & tinggi → checkAch award
  P.st.integritas=85; P.st.reputasi=75; P.adil=10; P.suapTerima=0; delete P.ach.teladan;
  checkAch();
  globalThis.__teladan = !!P.ach.teladan;

  // 5) JENIS PERKARA BARU benar-benar bisa muncul + mediasi tak salah sasaran
  var jset={}, n=0;
  for(var k=0;k<4000;k++){ var c3=buatKasus(); jset[c3.jenis.k]=(jset[c3.jenis.k]||0)+1; }
  globalThis.__jenis = { pemilu:!!jset.pemilu, asusila:!!jset.asusila, siber:!!jset.siber, total:Object.keys(jset).length };

  // 6) MEDIASI tak boleh untuk korupsi/narkoba
  globalThis.__medGate = {
    korupsi:bisaMediasi({jenis:{k:'korupsi'},td:{k:'rakyat'}}),
    narkoba:bisaMediasi({jenis:{k:'narkoba'},td:{k:'rakyat'}}),
    tanah:bisaMediasi({jenis:{k:'tanah'},td:{k:'pengusaha'}})
  };
`,ctx);

const d=ctx.__doktor, m=ctx.__mediator, ds=ctx.__dissent, t=ctx.__teladan, j=ctx.__jenis, g=ctx.__medGate;
ok('doktor: studi turun bertahap (2→1)', d.saatStudi===1);
ok('doktor: studi selesai (=0)', d.study===0);
ok('doktor: gelar dapat prefiks "Dr."', d.naikGelar);
ok('doktor: achievement diraih', d.ach);
ok('mediator: perkara perdata+rakyat eligible', m.eligible);
ok('mediator: hitungan mediasi bertambah', m.mediasi>=6);
ok('mediator: mediasi sukses dihitung adil', m.adilNaik);
ok('mediator: achievement diraih', m.ach);
ok('dissenting: berada di level Hakim Tinggi (lv2)', ds.lv===2);
ok('dissenting: dissent bertambah saat lawan kuat', ds.dissent);
ok('dissenting: achievement diraih', ds.ach);
ok('teladan: achievement diraih saat bersih & tinggi', t);
ok('jenis baru pemilu muncul', j.pemilu);
ok('jenis baru asusila muncul', j.asusila);
ok('jenis baru siber muncul', j.siber);
ok('total jenis perkara = 11', j.total===11);
ok('mediasi DITOLAK untuk korupsi', g.korupsi===false);
ok('mediasi DITOLAK untuk narkoba', g.narkoba===false);
ok('mediasi diizinkan untuk sengketa tanah', g.tanah===true);

console.log('=== TES MEKANIK BARU HAKIM ===');
console.log(out.join('\n'));
console.log(fail? ('\n❌ '+fail+' tes GAGAL') : '\n✅ SEMUA '+out.length+' TES LOLOS');
process.exit(fail?1:0);
