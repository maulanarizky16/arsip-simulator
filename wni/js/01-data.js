'use strict';
/* ================= DATA ================= */
/* kota: idx = pengali biaya hidup (kos, makan, transport); macet = peluang event macet */
const KOTA=[
  {n:'Jakarta',idx:1.35,macet:0.6,banjir:0.5},{n:'Bekasi',idx:1.15,macet:0.55,banjir:0.45},{n:'Tangerang',idx:1.15,macet:0.45,banjir:0.35},
  {n:'Depok',idx:1.1,macet:0.45,banjir:0.25},{n:'Bandung',idx:1.0,macet:0.45,banjir:0.25},{n:'Surabaya',idx:1.05,macet:0.35,banjir:0.25},
  {n:'Semarang',idx:0.9,macet:0.25,banjir:0.45},{n:'Medan',idx:0.95,macet:0.35,banjir:0.35},{n:'Makassar',idx:0.95,macet:0.3,banjir:0.25},
  {n:'Balikpapan',idx:1.05,macet:0.15,banjir:0.25},{n:'Yogyakarta',idx:0.85,macet:0.25,banjir:0.1},{n:'Solo',idx:0.8,macet:0.15,banjir:0.15}
];
/* profesi awal. gaji = pokok/bulan; vari = rentang naik-turun (0 = tetap); thr = dapat THR; phk = peluang PHK/bulan */
const PROFESI=[
  {k:'karyawan',n:'Karyawan Swasta (UMR)',d:'Gaji tetap, jam kerja "fleksibel" (artinya boleh lembur kapan saja).',gaji:5.2e6,vari:0,thr:true,phk:0.010,st:{waras:0,gengsi:+5},skill:45,motor:true},
  {k:'ojol',n:'Driver Ojol',d:'Bos untuk diri sendiri. Kata aplikasi, kamu "mitra". Pendapatan tergantung orderan & algoritma.',gaji:4.6e6,vari:0.35,thr:false,phk:0,st:{sehat:-5,nrimo:+10},skill:35,motor:true},
  {k:'guru',n:'Guru Honorer',d:'Mencerdaskan kehidupan bangsa dengan gaji yang belum cerdas.',gaji:1.9e6,vari:0,thr:true,phk:0.004,st:{nrimo:+20,relasi:+10},skill:50,motor:true},
  {k:'outsourcing',n:'Pegawai Outsourcing',d:'Kontrak per tahun. Tiap Desember, hidupmu ditentukan HRD vendor.',gaji:4.6e6,vari:0,thr:true,phk:0.006,st:{nrimo:+5},skill:38,motor:true},
  {k:'freelancer',n:'Freelancer Kreatif',d:'Desain, video, tulisan. Bebas kerja dari mana saja, termasuk dari warkop jam 2 pagi.',gaji:5.5e6,vari:0.6,thr:false,phk:0,st:{gengsi:+8,waras:-5},skill:55,motor:false},
  {k:'olshop',n:'Seller Olshop',d:'Jualan online, hidup-mati di tangan algoritma marketplace & ongkir.',gaji:4.2e6,vari:0.5,thr:false,phk:0,st:{gengsi:+3},skill:40,motor:false}
];
/* profesi khusus: tidak muncul untuk semua orang. khusus = kunci latar yang membukanya ('event' = hanya lewat kejadian) */
PROFESI.push(
  {k:'staf',n:'Staf Ahli (Titipan)',d:'Posisi yang tidak pernah dibuka untuk umum. Tugasnya belum jelas, gajinya sangat jelas.',gaji:12e6,vari:0,thr:true,phk:0.002,st:{gengsi:+10,nrimo:-5},skill:35,motor:false,khusus:'pejabat'},
  {k:'penerus',n:'Penerus Usaha Keluarga',d:'Kamu "belajar dari bawah" di usaha papa: mulai dari ruangan ber-AC paling bawah.',gaji:9e6,vari:0.35,thr:false,phk:0,st:{gengsi:+6,waras:-3},skill:45,motor:false,khusus:'pengusaha'},
  {k:'kreator',n:'Content Creator Lifestyle',d:'Konten "a day in my life" di apartemen. Penonton mengira itu hasil kerja keras.',gaji:3e6,vari:0.9,thr:false,phk:0,st:{gengsi:+15},skill:40,motor:false,khusus:'sultan'},
  {k:'pns',n:'PNS / ASN',d:'Akhirnya pekerjaan yang diakui keluarga sebagai "kerja beneran". Gaji tidak besar, tapi pasti.',gaji:4.8e6,vari:0,thr:true,phk:0,st:{gengsi:+8,nrimo:+5},skill:45,motor:true,khusus:'event'}
);
const PROF=Object.fromEntries(PROFESI.map(p=>[p.k,p]));
/* ===== NASIB LAHIR (diacak di awal hidup) =====
   w = bobot peluang · saldo = rentang modal awal (juta) · kiriman = transfer bulanan dari (+) / ke (−) keluarga
   orangDalam = lamar kerja & naik gaji jauh lebih mudah · makanDiskon = dibekali beras dari kampung */
const LATAR=[
  {k:'sandwich',n:'Generasi Sandwich',judul:'KAMU TERLAHIR SEBAGAI GENERASI SANDWICH',w:28,saldo:[1,3],kiriman:-800e3,st:{nrimo:+12,relasi:+5,waras:-4},
    d:'Bapak buruh pabrik yang sudah pensiun, ibu jualan gorengan, dua adik masih sekolah. Sejak lulus, kamu jadi tulang punggung keluarga. Tiap gajian, sebagian langsung terbang ke kampung.'},
  {k:'petani',n:'Anak Petani',judul:'KAMU TERLAHIR SEBAGAI ANAK PETANI',w:16,saldo:[1,2.5],kiriman:-300e3,makanDiskon:0.12,st:{nrimo:+8,sehat:+5,relasi:+6},
    d:'Orang tuamu petani padi di kampung. Tiap pulang kamu dibekali beras sekarung dan doa yang tak pernah putus. Saat panen gagal, giliran kamu yang mengirim.'},
  {k:'menengah',n:'Keluarga Menengah',judul:'KAMU TERLAHIR DI KELUARGA MENENGAH',w:18,saldo:[4,7],kiriman:0,st:{},
    d:'Bapak karyawan swasta, ibu guru SD. Tidak kaya, tidak miskin. Cukup, selama tidak ada yang sakit dan tidak ada yang menikah.'},
  {k:'pns',n:'Anak PNS',judul:'KAMU TERLAHIR SEBAGAI ANAK PNS',w:14,saldo:[5,8],kiriman:0,st:{gengsi:+5},
    d:'Bapakmu PNS golongan III/c. Di rumahmu, satu-satunya pekerjaan yang dianggap "kerja beneran" adalah PNS. Sisanya "kerja sementara".'},
  {k:'pengusaha',n:'Anak Pengusaha',judul:'KAMU TERLAHIR SEBAGAI ANAK PENGUSAHA',w:10,saldo:[15,30],kiriman:2e6,st:{gengsi:+10,nrimo:-5},
    d:'Keluargamu punya usaha distributor sembako dengan tiga gudang. Kamu dibesarkan dengan kalimat "nanti kamu yang terusin ya".'},
  {k:'pejabat',n:'Anak Pejabat',judul:'KAMU TERLAHIR SEBAGAI ANAK PEJABAT',w:6,saldo:[30,60],kiriman:5e6,orangDalam:true,gaya:'gengsi',st:{gengsi:+18,nrimo:-10},
    d:'Bapakmu pejabat eselon di dinas yang "basah". Rumah besar, mobil dinas dipakai ke mal, dan banyak "om" yang siap membantu kapan saja.'},
  {k:'sultan',n:'Anak Sultan',judul:'KAMU TERLAHIR SEBAGAI ANAK SULTAN',w:2,saldo:[150,250],kiriman:15e6,orangDalam:true,gaya:'gengsi',st:{gengsi:+25,nrimo:-15,waras:+5},
    d:'Keluargamu konglomerat. Kamu hafal harga tas branded, tapi tidak tahu harga gas melon. Simulator ini mungkin terasa seperti wisata budaya buatmu.'},
  {k:'yatim',n:'Merantau Sendirian',judul:'KAMU MERANTAU SENDIRIAN',w:6,saldo:[0.5,1.5],kiriman:0,st:{nrimo:+15,relasi:-15,waras:-3},
    d:'Kamu yatim piatu sejak SMA dan merantau sendiri. Tidak ada yang mengirim uang. Tapi juga tidak ada tante yang menanyakan "kapan nikah".'}
];
const LATAR_MAP=Object.fromEntries(LATAR.map(l=>[l.k,l]));
function acakLatar(){ const tot=LATAR.reduce((a,l)=>a+l.w,0); let x=r()*tot; for(const l of LATAR){ x-=l.w; if(x<=0)return l; } return LATAR[0]; }
/* kalender hari raya (bulan, 1-12) untuk rentang permainan */
const RAMADAN={2026:2,2027:2,2028:1};
const LEBARAN={2026:3,2027:3,2028:2};
const TOTAL_BULAN=36;
const ACH_DEF={
  thr:'THR Pertama', mudik:'Pemudik Tangguh', kondangan:'Raja Kondangan', pinjol:'Kenal Pinjol', lunas:'Bebas Utang',
  darurat:'Punya Dana Darurat', emas:'Investor Emas', viral:'Viral Sehari', bpjs:'Lulus Antrean BPJS', tolakAmplop:'Tolak Serangan Fajar',
  nrimo:'Nrimo Paripurna', healing:'Healing Garis Keras', naikKelas:'Naik Kelas', diaspora:'#KaburAjaDulu', tahan:'Bertahan 3 Tahun',
  rumah:'Akhirnya Punya Rumah', sadarJudol:'Sadar Judol', cuan:'Cuan Sampingan', nikah:'Sah!', damai:'Damai di Tempat',
  hemat:'Ratu/Raja Hemat', sultan:'Sultan Kecil-kecilan',
  pemburuHoax:'Pemburu Hoax', jagoTawar:'Jago Tawar', simResmi:'SIM Jalur Resmi', simNembak:'SIM Nembak', anggaranRapi:'Anggaran Rapi',
  tolakOrangDalam:'Tolak Orang Dalam', tamatPrivilege:'Tamat Privilege', asn:'Akhirnya ASN', tulangPunggung:'Tulang Punggung Keluarga', mandiri:'Mandiri Sejati'
};
const PENYAKIT=['tifus karena makan sembarangan','DBD musim hujan','asam lambung kambuhan','tipes kelelahan','radang tenggorokan'];
