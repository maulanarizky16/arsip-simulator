// Jalankan semua tes di folder ini satu per satu; gagal (exit 1) kalau ada satu saja yang gagal.
'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs'), path = require('path');
const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.js') && f !== 'run-all.js').sort();
let failed = [];
for (const f of files) {
  console.log('\n######## ' + f);
  const r = spawnSync(process.execPath, [path.join(__dirname, f)], { stdio: 'inherit' });
  if (r.status !== 0) failed.push(f);
}
console.log('\n======== ' + (failed.length ? 'GAGAL: ' + failed.join(', ') : 'SEMUA ' + files.length + ' FILE TES LOLOS'));
process.exit(failed.length ? 1 : 0);
