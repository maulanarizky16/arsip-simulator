# Review QA/QC — Arsip Negara

Gabungan **data** (`node qa/analis.js negara 200`, lihat `negara.md`), **bot politisi tekun** (`node qa/bot-negara.js 300 [kotor]`), dan **review logika & realisme** kode `negara/js/`.
Status: semua temuan bernomor **sudah diperbaiki**, kecuali bagian "Sengaja tidak diubah".

Catatan metode: pemain acak hampir tak pernah menang pemilu (91% tidak pernah menjabat), sehingga 27 aksi dan 32 kartu (seluruh isi kepresidenan) tidak pernah teruji. Bot baru bermain wajar: gabung partai, membangun popularitas dan pengaruh, lalu maju ke kursi tertinggi yang memenuhi syarat. Dengan bot, kartu yang tak pernah muncul turun dari 32 menjadi 7, tanpa error.

## Angka bot politisi tekun, sebelum → sesudah (200–300 karier)
| Ukuran | Sebelum | Sesudah |
|---|---|---|
| Menjadi presiden (bot bersih) | 98% | 67% |
| Umur termuda / median saat pertama jadi presiden | 28 / 33 | 43 / 48 |
| Divonis korupsi padahal tak pernah menerima uang gelap | 1–2% | 0% |
| Harta akhir median (bot bersih) | Rp 11,6 M | Rp 3,5 M |
| Harta akhir median (bot kotor, 100% divonis) | Rp 25 M | Rp 0 |

Tidak ada error dan tidak ada teks rusak, sebelum maupun sesudah.

## P1 — Merusak alur
1. **Popularitas bisa dimaksimalkan dengan satu tombol.** "Rawat media sosial" (+2), "Tulis opini" (+3), "Kunjungan kerja" (+3), dan "Pidato kenegaraan" (+2) bisa diulang tanpa batas dalam setahun. Hasilnya hampir semua pemain tekun jadi presiden.
   → Semuanya sekali setahun.
2. **Presiden umur 27.** Tidak ada batas umur calon; pemain mulai umur 22 di tahun pemilu 2004.
   → Batas umur sesuai undang-undang: DPRD/DPR 21, Wali Kota 25, Gubernur 30, Presiden 40. Kartu syarat presiden ikut menampilkannya.
3. **Peniup peluit yang bersih dipenjara karena korupsi.** "Investigasi korupsi" dan "Bongkar skandal besar" menaikkan sorotan hukum, lalu penyidik "menemukan jejak aliran dana" pada orang yang tak pernah menerima uang gelap.
   → OTT hanya untuk yang pernah menerima uang gelap. Orang bersih dengan sorotan tinggi mendapat kartu **Dilaporkan Balik** (pencemaran nama / pasal karet): dihentikan, atau ditahan sebentar sebagai tahanan politik.
4. **Pemilihan presiden hampir sama mudahnya dengan DPRD.** Penalti peluang hanya 2,5% per jenjang.
   → Penalti naik tajam per jenjang dan peluang maksimal pemilihan presiden 55%.

## P2 — Tidak realistis
5. **Tidak ada penghasilan di luar jabatan dan tidak ada biaya hidup.** Guru honorer tetap memegang Rp 2 jt selama puluhan tahun; pejabat menabung 100% gajinya.
   → Di luar jabatan ada nafkah sesuai latar (guru 24 jt, aktivis 36 jt, jurnalis 72 jt, anak pejabat 240 jt, pengusaha 600 jt per tahun; yang tersisa ±30%). Pejabat menabung ±40% gaji.
6. **Uang yang sudah dicuci kebal sita.** Vonis hanya menyita uang gelap yang belum dicuci. → 70% dari uang gelap yang pernah diterima ikut disita dari kas dan deposito.
7. **"Titipan proyek", "Mark-up anggaran", dan "Cuci uang" bisa diulang tanpa batas dalam setahun.** → Sekali setahun.
8. **Anakronisme (mulai 2004):** media sosial dan pasukan buzzer di 2004, cuci uang lewat kripto. → Sebelum 2010 "Rawat citra di media lokal"; buzzer baru ada 2012; kripto baru disebut mulai 2016.

## Sengaja tidak diubah
- Semua pemilu (DPRD sampai presiden) serentak tiap 5 tahun dan hanya boleh memilih satu kursi.
- Bot tekun masih menjadi presiden di 67% karier. Ia mencoba di setiap pemilu sampai tua (±7 kali) dengan strategi optimal; pemain sungguhan akan lebih rendah. Kalau mau lebih sulit lagi, angka penalti jenjang ada di `peluang()` (`negara/js/03-politik.js`).
- Stres hampir selalu 0 bagi pemain yang tidak menjabat. Tidak merusak apa pun.
- Kartu yang masih jarang muncul di bot: Cukong Menagih, Galang Koalisi, Godaan Dinasti (syaratnya sempit).
