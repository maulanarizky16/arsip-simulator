// Tes mendalam sistem insiden/diagnostic IT (headless). Validasi struktur + paksa tiap insiden lewat semua jalur.
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const dir=path.join(__dirname,'..','it','js');
const code=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort()
  .map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n');
const store={};
const ctx={ Math, JSON, Object, Array, console,
  localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=''+v;},removeItem:k=>{delete store[k];}},
  window:{} };
vm.createContext(ctx);
vm.runInContext(code,ctx,{filename:'it.bundle.js'});

const out=[]; let fail=0;
function ok(name,cond,extra){ out.push((cond?'  ok  ':'  FAIL')+' · '+name+(cond?'':(extra?(' — '+extra):''))); if(!cond)fail++; }

// siapkan permainan + state aman untuk memanggil terapkan() langsung
vm.runInContext(`
  newGame();
  // pilih spesialisasi (drain kartu pertama: pilih opsi 0)
  while(G.current){ choose(0); }
  globalThis.__d={};
  const D=globalThis.__d;
  const ST_DOM=['ngoding','sistem','jaringan','keamanan'];
  const INFRA_KEYS=Object.keys(INFRA_DEF);
  const SPES_KEYS=SPES.map(s=>s.k);

  // ---- struktur ----
  D.struct=[];
  const seen={};
  for(const j of INSIDEN){
    const e={k:j.k,issues:[]};
    if(seen[j.k])e.issues.push('k duplikat');
    seen[j.k]=true;
    if(!(j.k in SKILL_INSIDEN))e.issues.push('tak ada di SKILL_INSIDEN');
    else if(ST_DOM.indexOf(SKILL_INSIDEN[j.k])<0)e.issues.push('domain skill invalid: '+SKILL_INSIDEN[j.k]);
    if(INFRA_KEYS.indexOf(j.infra)<0)e.issues.push('infra invalid: '+j.infra);
    if(!j.petunjuk)e.issues.push('tanpa petunjuk');
    const okc=(j.opsi||[]).filter(o=>o.ok).length;
    if(okc!==1)e.issues.push('jumlah ok:true = '+okc+' (harus 1)');
    if(!j.opsi||j.opsi.length<2)e.issues.push('opsi < 2');
    if(!j.probes||!j.probes.length)e.issues.push('tanpa probes');
    else{
      const pk={};
      for(const p of j.probes){
        if(!p.k||!p.n)e.issues.push('probe tanpa k/n');
        if(!p.tepat)e.issues.push('probe '+p.k+' tanpa teks tepat');
        if(pk[p.k])e.issues.push('probe k duplikat: '+p.k);
        pk[p.k]=true;
      }
    }
    if(j.spesAff)for(const s of j.spesAff)if(SPES_KEYS.indexOf(s)<0)e.issues.push('spesAff invalid: '+s);
    D.struct.push(e);
  }
  // SKILL_INSIDEN tak boleh punya key yatim (tanpa insiden)
  D.orphan=Object.keys(SKILL_INSIDEN).filter(k=>!INSIDEN.find(j=>j.k===k));
  D.countInsiden=INSIDEN.length;
  D.countSkill=Object.keys(SKILL_INSIDEN).length;

  // ---- probesFor + ambilPetunjuk: tiap probe bisa menghasilkan teks 'tepat' khasnya ----
  D.probe=[];
  P.st.ngoding=P.st.sistem=P.st.jaringan=P.st.keamanan=70;  // pTepat tinggi
  for(const j of INSIDEN){
    const c={jenis:j,target:{k:j.infra,n:'Aset '+j.infra,sehat:70,debt:10},parah:'sedang',clues:[],diagnosed:{},done:false};
    if(probesFor(c)!==j.probes){ D.probe.push({k:j.k,err:'probesFor tak mengembalikan probes insiden'}); continue; }
    let allTepatSeen=true, anyThrow=null, emptyText=false;
    for(const p of j.probes){
      let sawTepat=false;
      for(let i=0;i<300;i++){
        let r2; try{ r2=ambilPetunjuk(c,p.k); }catch(e){ anyThrow=p.k+': '+e.message; break; }
        if(!r2||!r2.text){ emptyText=true; break; }
        if(r2.lean==='tepat'&&r2.text===p.tepat)sawTepat=true;
      }
      if(!sawTepat)allTepatSeen=false;
    }
    D.probe.push({k:j.k,allTepatSeen,anyThrow,emptyText});
  }

  // ---- terapkan(): tiap insiden lewat SEMUA jalur tanpa throw ----
  D.apply=[];
  function freshC(j){ return {jenis:j,target:{k:j.infra,n:'Aset '+j.infra,sehat:60,debt:12},parah:'sedang',clues:[{lean:'tepat'},{lean:'tepat'}],diagnosed:{},done:false}; }
  P.backupKuat=true;  // izinkan jalur pulih ransom yang baik
  for(const j of INSIDEN){
    const paths=[];
    const okOpt=j.opsi.find(o=>o.ok);
    const wrongOpt=j.opsi.find(o=>!o.ok)||okOpt;
    const trials=[['ok',okOpt],['salah',wrongOpt],['quick',{quick:true}]];
    if(j.sec&&j.k!=='ransom')trials.push(['tutup',{dark:'tutup'}]);
    if(j.k==='ransom')trials.push(['tebus',{dark:'ransom'}]);
    let bad=null;
    for(const [nm,opt] of trials){
      const c=freshC(j);
      try{ terapkan(c,opt); if(!c.done)bad=nm+':done=false'; }
      catch(e){ bad=nm+': '+e.message; break; }
    }
    D.apply.push({k:j.k,bad});
  }

  // ---- buatInsiden tak pernah hasilkan insiden tanpa SKILL_INSIDEN (sampling besar) ----
  D.gen={miss:0,total:0};
  for(let i=0;i<3000;i++){ const c=buatInsiden(); D.gen.total++; if(!(c.jenis.k in SKILL_INSIDEN))D.gen.miss++; }
`,ctx);

const D=ctx.__d;
// struktur
const structBad=D.struct.filter(e=>e.issues.length);
ok('jumlah insiden = jumlah entri SKILL_INSIDEN', D.countInsiden===D.countSkill, D.countInsiden+' vs '+D.countSkill);
ok('total insiden bertambah banyak (>=22)', D.countInsiden>=22, 'ada '+D.countInsiden);
ok('tak ada SKILL_INSIDEN yatim (tanpa insiden)', D.orphan.length===0, D.orphan.join(','));
ok('semua insiden lolos validasi struktur', structBad.length===0, structBad.map(e=>e.k+'['+e.issues.join('; ')+']').join(' | '));
// probe
const probeThrow=D.probe.filter(p=>p.err||p.anyThrow||p.emptyText);
const probeNoTepat=D.probe.filter(p=>!p.err&&!p.anyThrow&&!p.allTepatSeen);
ok('probesFor & ambilPetunjuk tak pernah error', probeThrow.length===0, probeThrow.map(p=>p.k+':'+(p.err||p.anyThrow||'teks kosong')).join(' | '));
ok('tiap probe memunculkan teks "tepat" khasnya', probeNoTepat.length===0, probeNoTepat.map(p=>p.k).join(','));
// terapkan
const applyBad=D.apply.filter(a=>a.bad);
ok('terapkan() semua jalur (ok/salah/quick/dark) tanpa error', applyBad.length===0, applyBad.map(a=>a.k+':'+a.bad).join(' | '));
// generator
ok('buatInsiden tak pernah hasilkan insiden tanpa SKILL_INSIDEN', D.gen.miss===0, D.gen.miss+'/'+D.gen.total);

console.log('=== TES SISTEM INSIDEN/DIAGNOSTIC IT ===');
console.log('Total insiden: '+D.countInsiden+' | probe diuji: '+D.probe.length+' insiden');
console.log(out.join('\n'));
console.log(fail? ('\n❌ '+fail+' TES GAGAL') : '\n✅ SEMUA '+out.length+' TES LOLOS');
process.exit(fail?1:0);
