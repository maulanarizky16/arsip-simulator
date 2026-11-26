// Harness uji percabangan baru — kehidupan & negara (tanpa jsdom).
// Pakai: node _test_percabangan.js  → target: 0 error + semua cabang baru terpicu.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT=path.join(__dirname,'..');

function loadGame(game) {
  const dir = path.join(ROOT, game, 'js');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
  return files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n;\n');
}
function makeCtx() {
  const store = {};
  const sandbox = {
    window: {},
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    console, setTimeout, clearTimeout,
    __SEEN: [], __ERRS: []
  };
  sandbox.globalThis = sandbox;
  return vm.createContext(sandbox);
}
function run(c, code) { return vm.runInContext(code, c); }

const WRAP_ASK = `
  const __realAsk = ask;
  ask = function(d){ __SEEN.push(d.title || ''); return __realAsk(d); };
`;
const DRAIN = `function __drain(){ let g=0; while(G.current && g++<200) choose(Math.floor(Math.random()*4)); }`;

/* ================= KEHIDUPAN ================= */
function testKehidupan() {
  const c = makeCtx();
  run(c, loadGame('kehidupan'));
  run(c, WRAP_ASK + DRAIN);

  // 1) simulasi hidup acak penuh
  run(c, `
    function __sim(){
      newGame(); __drain();
      let guard=0;
      while(P && P.alive && !G.over && guard++<300){
        __drain();
        const av=ACTS.filter(a=>{try{return actAvail(a).ok}catch(e){__ERRS.push('avail:'+a.k+': '+e.message);return false}});
        const n=Math.floor(Math.random()*3);
        for(let i=0;i<n && av.length;i++){
          const a=av[Math.floor(Math.random()*av.length)];
          try{doAct(a.k)}catch(e){__ERRS.push('act:'+a.k+': '+e.message)}
          __drain();
        }
        try{advance()}catch(e){__ERRS.push('advance: '+e.message);break}
        __drain();
      }
    }
    for(let i=0;i<150;i++){ try{__sim()}catch(e){__ERRS.push('sim: '+e.message)} }
  `);

  // 2) tes bertarget: paksa state agar semua cabang baru bisa terpicu
  run(c, `
    newGame(); __drain();
    function __force(){
      P.alive=true; G.over=false; G.current=null; G.queue=[];
      P.age=40; P.money=600e6; P.st.relasi=60; P.st.stress=20; P.st.health=80;
      P.ortu.ayah=true; P.ortu.ibu=true;
      P.pinjol=0; P.judi=0; P.midlife=true; P.kronis=null; P.haji=null;
      if(!P.aset.some(x=>x.k==='rumah'))P.aset.push({k:'rumah',n:'Rumah tapak',nilai:500e6,kpr:null,sewa:0,tumbuh:0.03,kelas:1});
      if(!P.aset.some(x=>x.k==='tanah'))P.aset.push({k:'tanah',n:'Tanah kavling',nilai:300e6,kpr:null,sewa:0,tumbuh:0.05,kelas:1});
      if(!P.job)P.job={title:'Staf kantor',g:80e6,level:1,bidang:null};
      if(!P.kids.length)P.kids.push({nama:'Bintang',lahirAt:15,didik:60});
      P.kids[0].lahirAt=15; delete P.kids[0].modalUsaha;
      if(!P.biz.length)P.biz.push({nama:'Kopi Lembah',modal:60e6,level:2,kary:1,hype:0,risk:0.2});
      P.mafiaTanah=false; P.whistleKantor=false; P.umrohOrtu=false; P.ketuaRT=false;
    }
    for(let i=0;i<4000;i++){
      __force();
      try{events()}catch(e){__ERRS.push('events: '+e.message)}
      __drain();
    }
  `);

  const errs = run(c, '__ERRS.slice(0,15)');
  const seen = run(c, 'JSON.stringify(__SEEN)');
  const titles = JSON.parse(seen);
  const expect = ['BANJIR BESAR','MAFIA TANAH','KECURANGAN DI KANTOR','UMROH ORANG TUA','REUNI AKBAR','REKENING DIBOBOL','DICALONKAN JADI KETUA RT'];
  const missing = expect.filter(t => !titles.includes(t));
  if (!titles.some(t => t.endsWith(' MINTA MODAL'))) missing.push('<anak> MINTA MODAL');
  if (!titles.some(t => t.startsWith('KEBAKARAN DI '))) missing.push('KEBAKARAN DI <usaha>');
  return { errs, missing, nErr: run(c, '__ERRS.length') };
}

/* ================= NEGARA ================= */
function testNegara() {
  const c = makeCtx();
  run(c, loadGame('negara'));
  run(c, WRAP_ASK + DRAIN);

  // 1) simulasi karier acak penuh
  run(c, `
    function __sim(){
      newGame(); __drain();
      let guard=0;
      while(P && P.alive && !G.over && guard++<200){
        __drain();
        const av=ACTS.filter(a=>{try{return actAvail(a).ok}catch(e){__ERRS.push('avail:'+a.k+': '+e.message);return false}});
        const n=Math.floor(Math.random()*3);
        for(let i=0;i<n && av.length;i++){
          const a=av[Math.floor(Math.random()*av.length)];
          try{doAct(a.k)}catch(e){__ERRS.push('act:'+a.k+': '+e.message)}
          __drain();
        }
        try{advance()}catch(e){__ERRS.push('advance: '+e.message);break}
        __drain();
      }
    }
    for(let i=0;i<100;i++){ try{__sim()}catch(e){__ERRS.push('sim: '+e.message)} }
  `);

  // 2) bertarget: presiden
  run(c, `
    newGame(); __drain();
    function __stabil(){
      P.alive=true; G.over=false; G.current=null; G.queue=[];
      P.age=50; P.anak=1; P.heat=0; P.penjara=0; P.retired=false; P.cukong=false;
      P.st.popularitas=60; P.st.kompetensi=50; P.st.pengaruh=40;
      P.evDataBocor=false; P.evDinasti=false; P.rival=null; P.wapres=null; P.buzzed=0; P.cWhistle=0;
      N.mood=50; N.kas=500; N.lingkungan=40; N.inflasi=5; N.pengangguran=8;
      N.perang=null; N.sanksi=false; N.separatis=null; P.pandemi=true;
      N.militer=20; N.kebebasan=60; N.demokrasi=60; N.diplomasi=50; N.koalisi=60; N.mbg=false; N.iknFase=0;
    }
    for(let i=0;i<4000;i++){
      __stabil();
      if(!P.jab||P.jab.k!=='presiden'){try{setJab('presiden')}catch(e){__ERRS.push('setJab pres: '+e.message)}}
      __drain();
      try{events()}catch(e){__ERRS.push('events-pres: '+e.message)}
      __drain();
    }
  `);

  // 3) bertarget: kepala daerah
  run(c, `
    for(let i=0;i<1500;i++){
      __stabil();
      if(!P.jab||P.jab.k!=='walikota'){try{setJab('walikota')}catch(e){__ERRS.push('setJab wk: '+e.message)}}
      __drain();
      try{events()}catch(e){__ERRS.push('events-kepda: '+e.message)}
      __drain();
    }
  `);

  // 4) bertarget: karier awal (timses)
  run(c, `
    for(let i=0;i<1500;i++){
      __stabil();
      P.jab=null; P.jabData=null; P.maxLv=0; P.age=25;
      try{events()}catch(e){__ERRS.push('events-awal: '+e.message)}
      __drain();
    }
  `);

  const errs = run(c, '__ERRS.slice(0,15)');
  const titles = JSON.parse(run(c, 'JSON.stringify(__SEEN)'));
  const expect = ['DILEMA SUBSIDI BBM','KABUT ASAP LINTAS NEGARA','KEBOCORAN DATA NASIONAL','MENTERI KENA OTT','WNI TERANCAM HUKUMAN MATI','RUU KONTROVERSIAL','KEADILAN JADI TRENDING','GODAAN DINASTI','TAWARAN DARI TIMSES','KONFLIK AGRARIA','KOTA LANGGANAN BANJIR'];
  const missing = expect.filter(t => !titles.includes(t));
  return { errs, missing, nErr: run(c, '__ERRS.length') };
}

const k = testKehidupan();
console.log('KEHIDUPAN  errors:', k.nErr, k.nErr ? k.errs : '', '| cabang belum terpicu:', k.missing.length ? k.missing : 'tidak ada');
const n = testNegara();
console.log('NEGARA     errors:', n.nErr, n.nErr ? n.errs : '', '| cabang belum terpicu:', n.missing.length ? n.missing : 'tidak ada');
process.exit((k.nErr || n.nErr || k.missing.length || n.missing.length) ? 1 : 0);
