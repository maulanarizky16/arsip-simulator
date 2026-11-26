// Kode yang dijalankan di dalam konteks game sebelum skrip game: mengganti Math.random dengan PRNG ber-seed (mulberry32),
// supaya hasil tes sama di setiap mesin/CI. Ganti seed: ARSIP_SEED=123 npm test
'use strict';
const seed = (parseInt(process.env.ARSIP_SEED, 10) || 20240611) >>> 0;
const kuis = require('fs').readFileSync(require('path').join(__dirname, '..', 'assets', 'kuis.js'), 'utf8');
module.exports = `;(function(){ var a=${seed}; Math.random=function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; })();\n` + kuis + '\n;\n';
