# Review QA/QC — Arsip Kehidupan

Gabungan **data** (`node qa/analis.js kehidupan 200`, lihat `kehidupan.md`) dan **review logika & realisme** kode `kehidupan/js/`.
Status: semua temuan bernomor di bawah **sudah diperbaiki** dan dijaga tes (`tests/test-kehidupan.js`, bagian 2k–2q), kecuali bagian "Sengaja tidak diubah".

## Angka sebelum → sesudah (200–300 hidup per profil)
| Ukuran | Sebelum | Sesudah |
|---|---|---|
| Uang akhir terendah (acak / wajar) | −Rp 1,7 M / −Rp 766 jt | −Rp 147 jt / −Rp 149 jt |
| Uang akhir median, pemain wajar | Rp 4,3 M | Rp 1,8 M |
| Pemain wajar jadi Sultan (≥ Rp 5 M) | 53% | 31% |
| Stres median umur 35 (acak / wajar) | 94 / 78 | 75 / 72 |
| Lama hidup median (acak / wajar) | 52 / 65 | 53 / 62 (tidak berubah berarti; antar-run bergeser ±3 tahun) |
| Mati karena "sakit yang lama digerogoti" (acak / wajar) | 87% / 38% | 75% / 32% |
| Pria yang pernah menikah (acak / wajar) | 5% / 20% | 7% / 56% |
| Aksi yang tak pernah bisa dipakai | 1 | 0 |
| Kartu yang tak pernah muncul | 9 | 4 |

Tidak ada error dan tidak ada teks rusak (undefined/NaN), sebelum maupun sesudah. Pilihan pemain di alat QA tidak ber-seed, jadi angka bergeser sedikit tiap dijalankan.

## P1 — Merusak ekonomi / alur
1. **Gaji berlipat tanpa batas.** "Tawaran kerja luar negeri" (×2,2) dan "Dibajak perusahaan lain" (×1,25) bisa muncul berulang pada pekerjaan yang sama; "Minta naik gaji" (×1,12) tanpa batas. Pemain wajar menerima gaji rata-rata ±460 jt/tahun.
   → Kerja LN sekali per pekerjaan (×1,9), dibajak maksimal 2× (×1,15), naik gaji maksimal 2× per jenjang.
2. **Utang tanpa batas dan tanpa akibat.** Uang tunai bisa minus sampai −1,7 M sementara deposito dan rumah tetap utuh. Tidak ada bunga, sita, atau pailit.
   → `tagihUtang()`: kas minus dibayar dari investasi, lalu aset disita/dilelang (85% nilai), lalu pailit (utang direstrukturisasi, daftar hitam bank 7 tahun). Utang kena bunga 10%/tahun. Penganggur tanpa tabungan hidup prihatin (biaya hidup separuh, bahagia turun).
3. **Bank memberi kredit tanpa melihat penghasilan.** Kurir bergaji 34 jt/tahun bisa KTA 500 jt; KPR vila cukup dengan DP.
   → Plafon KTA ±2,5× penghasilan rutin; KPR ditolak bila total cicilan > 40% penghasilan rutin.
4. **Properti adalah mesin uang.** Kos-kosan: sewa 95 jt/tahun (imbal 12%) melawan cicilan KPR 64 jt, selalu terisi, tanpa perawatan. Kendaraan tidak pernah menyusut. Kripto rata-rata +32%/tahun.
   → Imbal sewa 4,5–7,5%, tingkat hunian 70–100% (45–75% saat krisis), PBB & perawatan 0,5% nilai/tahun. Kendaraan menyusut 8–10%/tahun sampai 25% harga baru. Kripto −70…+110%, saham −22…+38%. Laba usaha diturunkan dan kena pajak 10%.
5. **Tidak ada pajak; biaya hidup tetap berapa pun penghasilannya.** Bergaji 500 jt tetap hidup dengan 24 jt/tahun.
   → PPh progresif sederhana (PTKP 54 jt; 5/15/25/30%) dan biaya hidup ikut naik 8–35% dari penghasilan rutin di atas 60 jt (sesuai gaya hidup).
6. **Stres menumpuk seumur hidup.** Stres hanya turun 1 poin/tahun, sehingga median 80–94 dan kesehatan terkikis 3 poin/tahun. Ini penyebab utama 87% kematian "sakit yang lama digerogoti".
   → Stres mereda makin cepat saat makin tinggi (−5/tahun di angka 90).
7. **Korupsi nyaris tanpa risiko.** "Sunat anggaran" bisa dipakai berkali-kali setahun; kalau terbukti hanya dicopot dan didenda dari uang tunai (investasi aman), tanpa penjara. Suap polisi, fee proyek PNS, dan "jatah tutup mulut" tidak pernah berakibat.
   → Sunat anggaran sekali setahun. Terbukti korupsi: uang pengganti dikejar sampai investasi & aset, lalu **penjara 2–12 tahun** (aksi terkunci, tanpa penghasilan). Suap di tempat kerja tercatat dan bisa memicu pemeriksaan: dikembalikan, dipecat tidak hormat, atau penjara.

## P2 — Tidak realistis
8. **Profesi negara tanpa batas umur.** Umur 50 masih bisa mendaftar TNI/Polri.
   → Batas umur: polisi/tentara 25 (28 bila sarjana), intel & damkar 30, pilot 32, PNS & pelaut 35.
9. **Aparat negara diperlakukan seperti karyawan swasta.** Polisi/TNI/PNS bisa kena PHK "efisiensi perusahaan", dibajak "kompetitor", ditawari kerja di luar negeri, dan jabatannya tertulis "Senior Polisi (Polri)".
   → Semua itu hanya untuk pekerja non-aparat. Nama jabatan memakai pangkat (Brigadir, Kasi, Kapten …); kenaikan pangkat lewat tugas dinas.
10. **Pensiun sama rata.** Driver ojek pun dapat pensiun 30% gaji + pesangon 1,5× gaji tahunan; pesangon PHK flat.
    → Aparat: pensiun bulanan 40% + tabungan hari tua. Swasta: JHT sesuai masa kerja + jaminan pensiun 10%. Pesangon PHK ±1 bulan gaji per tahun masa kerja (maks. 9). Diberhentikan tidak hormat = hak pensiun hangus.
11. **Politik.** Bupati masih bekerja penuh waktu sebagai kurir; aparat aktif boleh mencalonkan diri; pensiunan dilarang maju; masa jabatan 5 tahun dihitung hanya saat ada event (nyatanya ±9 tahun); kartu "Dicalonkan jadi Ketua RT" tidak terhubung ke jenjang politik.
    → Lurah ke atas adalah jabatan penuh waktu (pekerjaan dilepas, tawaran kerja ditolak). Aparat wajib mundur dulu. Pensiunan boleh maju. Masa jabatan dihitung tiap tahun. Kartu Ketua RT kini mengisi jenjang pertama.
12. **Anakronisme** (pemain lahir 1980–2004, dewasa mulai 1998): ojek online, pinjol, judi online, kripto, aplikasi kencan, hobi bikin konten, m-banking, giveaway medsos, startup, olshop.
    → Mengikuti tahun: ojek pangkalan (<2015), rentenir (<2016), togel & bola (<2012), kripto baru ada 2014, chatting/SMS (<2013), skimming ATM (<2012), software house / warnet / distro, dan seterusnya.
13. **Tonggak anak hampir tak pernah muncul.** "Masuk SD" dan "Anak mau kuliah" hanya terpicu bila anak itu kebetulan terpilih acak tepat di umurnya, padahal status kuliah menentukan pendidikan generasi berikutnya.
    → Pasti muncul di umur 6 dan 18; anak yang dididik baik bisa lolos beasiswa.
14. **Cerai hanya membagi uang tunai.** Investasi tidak ikut, jadi cukup pindahkan uang ke deposito sebelum cerai.
    → Investasi ikut dibagi dua.
15. **Asmara.** Pemain perempuan menanggung seluruh biaya pesta saat dilamar (tanpa 30 jt tidak bisa menerima); pemain laki-laki tidak pernah diberi tanda untuk melamar.
    → Saat dilamar, bagian pemain 8/30/80 jt. Untuk pemain laki-laki ada kartu "Kode dari pasangan" setelah 2 tahun berhubungan.
16. **Asuransi kesehatan tidak berlaku** di kartu "Jatuh sakit" dan sakit anak. → Kini menanggung 80%.

## P3 — Keseimbangan & teks
17. Sengketa warisan 80–400 jt untuk semua kelas (keluarga miskin pun); opsi "rebut" memberi 120% dari nilai sengketa. → Mengikuti kelas keluarga; rebut = 90%.
18. Skor epilog menghitung pensiunan Direktur sebagai jenjang 2. → Memakai jenjang tertinggi yang pernah dicapai (`P.maxLv`, juga tampil di laporan QA).
19. Kecerdasan macet di 100 (79% waktu pada pemain wajar). → "Belajar ekstra" makin kecil hasilnya di atas 75 dan 90.
20. Rekrut karyawan menurunkan stres 3 poin tiap kali dan bisa dilakukan saat kas minus. → Hanya rekrutan pertama; butuh kas 3 bulan gaji.
21. Usaha yang gulung tikar hilang tanpa sisa. → Peralatan & stok laku 30% nilai usaha.

## Alat QA (`qa/analis.js`)
- Kini ikut mencoba **menekuni hobi** (`tekuni:<hobi>`) dan **lanjut generasi** (sepertiga hidup diteruskan sebagai anak). Sebelumnya "Buka arsip silsilah", Dinasti, dan seluruh jalur hobi tidak pernah teruji.
- Judul kartu yang berupa awalan (mis. `DRAMA `, `MINTA BANTUAN `) tidak lagi dilaporkan "tak pernah muncul".

## Sengaja tidak diubah
- **Nominal tetap 1998–2090** (tidak ada inflasi harga). Gaji naik 3%/tahun, harga tidak. Mengubahnya berarti menyetel ulang seluruh angka.
- **Hobi per gender** (gym/futsal hanya laki-laki, baking/kerajinan hanya perempuan): pilihan desain, bukan bug. Secara realisme sebaiknya dibuka untuk semua.
- **Kerja di luar negeri** hanya menaikkan gaji; pemain tetap tinggal, berbisnis, dan berpolitik di kota asal.
- Pekerjaan, 3 usaha, dan jabatan RT/RW bisa dirangkap tanpa biaya waktu.

## Konten yang masih sangat jarang muncul (bukan bug, syaratnya memang sempit)
- Kartu: Cuaca Buruk (hanya pilot), Rumah Tangga Retak & Rumah yang Tak Aman (menikah dengan hubungan < 15 / < 40 + pasangan posesif), Wajib Mundur dari Dinas (aparat yang maju Lurah ke atas).
- Tanda jasa: Raja Properti, Hobiis Sejati, Pernah Viral, Orang Tua Teladan, Sahabat Sejati, Bangkit dari Jurang, Orang Nomor Satu, Kuliah di Luar Negeri, Mahasiswa Abadi. Semuanya bisa dicapai pemain yang sengaja mengejarnya, tetapi tidak oleh pemain acak dalam 400 hidup.
