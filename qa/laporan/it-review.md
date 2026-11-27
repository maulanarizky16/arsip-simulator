# Review QA/QC — Simulator Karier IT

Gabungan **data** (`node qa/analis.js it 200`, lihat `it.md`) dan **review logika & realisme** kode `it/js/`.
Status: semua temuan di bawah sudah dicek di kode. Belum diperbaiki kecuali disebut.

## Sudah diperbaiki (sebelum review ini)
- Monitoring & backup dibayar dari uang pribadi → kini lewat anggaran kantor / open-source (`ASET_KANTOR`).
- Monitoring/backup kantor lama terbawa saat pindah kerja → `kondisiKantorBaru()`.

## P1 — Merusak alur / ekonomi
1. **Promosi hampir mustahil** (`03-insiden.js` `cekPromosi`): syarat memakai rata-rata 4 skill (coding, server, jaringan, keamanan), padahal spesialis unggul di satu bidang.
   Data, pemain *wajar* (opsi baik, kuis benar): 64% tetap Junior seumur karier, 0% mencapai Lead/Principal/CTO. Pemain acak: 100% tetap Junior.
   Akibatnya "Mengajar di bootcamp" dan "Rintis startup sendiri" tidak pernah terbuka, dan 22 dari 40 tanda jasa tak pernah didapat.
2. **Karyawan membayar tagihan perusahaan**: tebusan ransomware 200–800 jt (`03-insiden.js:139`), denda regulator 200–600 jt (`:150`), tagihan vendor eskalasi 8–160 jt (`:192`), semuanya dari uang pribadi.
3. **Tidak ada status menganggur**: gaji tetap cair setelah layoff, gagal melamar, "rehat dulu", atau dipecat lewat PIP (`02-state.js:184`). Penilaian kinerja juga tetap jalan.
4. **`P.dipecat` permanen dan salah guna**: eks-napi tetap digaji, on-call, dan bisa dipromosikan. Razia dimatikan untuk selamanya (`04-events.js:122`), sehingga topi hitam bebas risiko.

## P2 — Tidak realistis, terasa oleh pemain IT
5. `P.saham` mencampur reksadana pribadi dengan ekuitas startup. Layoff menghanguskan reksadana, exit startup melipatgandakan reksadana, dan junior yang di-headhunt langsung dapat saham 200–800 jt.
6. Kenaikan gaji (headhunt, counter-offer, 1-on-1) hanya cair sekali. Tempat baru hasil headhunt diacak, jadi bisa menurunkan gaji permanen.
7. Freelance digaji ×1,9 stabil seperti remote berbayar dolar, tetap kena PIP/1-on-1/layoff, dan aksi lamar remote LN terkunci.
8. Founder diperlakukan seperti karyawan: kena PIP, layoff "divisi Anda", headhunt.
9. Pindah kerja membawa `P.infra`, `budaya`, `pip`, dan `bluTeam` kantor lama. Contoh: baru dipecat lewat PIP, di kantor baru langsung PIP lagi.
10. **Anakronisme**: tren "Hype AI/LLM", "AI Agents", Kubernetes/CKA, bootcamp + ISA, dan Zoom bisa muncul sejak 2008.
11. Gaji nominal tetap 2008–2060 (Junior 8 jt/bln di 2008, padahal kisaran wajar 3–5 jt). Tidak ada biaya hidup, pajak, maupun inflasi, sehingga FIRE/Sultan terlalu mudah bagi pemain wajar (median uang akhir 7,5 M).
12. Biaya pendidikan: bootcamp dibayar di muka dan juga lewat ISA (dobel). Kuliah karyawan "20 jt/tahun" hanya dibayar sekali dan bisa lulus dalam 1 tahun.

## P3 — Keseimbangan & teks
13. Pivot spesialisasi tidak menurunkan jenjang, bisa diulang tiap tahun, dan bisa dipakai menimbun skill.
14. Aksi ↻ berpenghasilan bisa diulang tanpa batas (misalnya 10× pentest setahun ≈ 1,3 M).
15. Hukum siber: membayar tebusan atau menutupi kebocoran dihukum pidana. Sebaliknya, uang yang sudah dicuci kebal sita (bertentangan dengan UU TPPU 8/2010).
16. Menolak promosi Junior→Medior disebut "menolak jalur manajemen".
17. Kecil: pesangon flat tanpa masa kerja, rawat inap tanpa BPJS, "hack IG" masuk uang bersih, pensiun tanpa JHT.

## Data lain
- Kematian karena overwork: 55% pada pemain acak, ~3% pada pemain wajar. Wajar (risiko dari pilihan sendiri).
- Tidak ada error, tidak ada teks rusak (undefined/NaN) dalam 400 karier.
