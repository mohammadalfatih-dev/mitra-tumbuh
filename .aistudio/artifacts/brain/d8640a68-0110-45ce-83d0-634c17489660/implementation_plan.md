# Mitra Tumbuh: Aquaculture Management System MVP

Aplikasi manajemen operasional budidaya perikanan modern yang dirancang untuk pembudidaya ikan skala rumahan (seperti sistem Budikdamber ember 80L) hingga peternak komersial multi-kolam, dilengkapi pelacakan stok ikan otomatis, jadwal pakan, estimasi FCR, pemantauan kualitas air, jurnal lapangan, dan pembukuan keuangan real-time.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan penting yang telah disepakati dari sesi klarifikasi untuk memandu implementasi:

- **Confirmed Decision 1 (Arsitektur Dual-Ready)**: Aplikasi dibangun menggunakan React SPA yang sepenuhnya interaktif dan persisten di lingkungan preview AI Studio (menggunakan IndexedDB / LocalStorage Repository Layer dengan integritas relasional), sekaligus menyediakan skrip migrasi SQL Cloudflare D1 (`migrations/0001_initial_schema.sql`), modul Cloudflare Pages Functions adapter, serta panduan deployment lengkap di `README.md`.
- **Confirmed Decision 2 (Onboarding & Jenis Ikan Kustom)**: Pengguna dapat memilih atau menambahkan jenis ikan kustom saat pertama kali membuka aplikasi (preset: Ikan Lele, Nila, Patin, Gurame, Mas, Bawal, Udang Vaname, atau kustom), serta membuat unit wadah budidaya fleksibel (Ember 80L, Kolam Terpal, Kolam Beton, Keramba, Bioflok).
- **Confirmed Decision 3 (Modul Pakan & FCR Lengkap)**: Pencatatan pakan harian mencakup jam, merk/tipe pakan, jumlah gram/kg, status terverifikasi (Belum, Selesai, Terlewat), serta kalkulasi estimasi FCR (*Feed Conversion Ratio*) dan akumulasi biaya pakan per batch budidaya.

---

### 1. Overview & Core Concept

- **What It Does**: Sistem operasional harian peternak ikan untuk mencatat pergerakan stok hidup secara akurat, mengatur jadwal dan porsi pakan harian, mencatat angka kematian serta panen, mencatat pengeluaran dan pemasukan (P&L), memantau parameter kualitas air (pH, suhu, warna, transparansi), serta menyimpan catatan jurnal perawatan harian.
- **Target Audience**:
  - Peternak budidaya ikan skala rumahan dan pekarangan (Budikdamber lele).
  - Kelompok pembudidaya ikan (Pokdakan) dengan kolam terpal, tanah, atau bioflok.
  - Pengelola usaha budidaya komersial yang membutuhkan pencatatan data terstruktur.
- **Key Value**:
  - **Zero Stock Discrepancy**: Rumus konsisten `Stok Hidup = Jumlah Awal + Penambahan - Kematian - Panen`. Penjualan hasil panen tidak mengurangi stok hidup dua kali.
  - **Efisiensi Pakan**: Pantau rasio pakan terhadap biomassa ikan (FCR) guna mencegah pemborosan pakan dan keracunan amonia.
  - **Mobile-First UX**: Dirancang khusus agar nyaman digunakan satu tangan oleh pembudidaya langsung di pinggir kolam.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Onboarding & Setup Awal**:
   - Jika pengguna baru pertama kali masuk, modal onboarding interaktif memandu pembuatan Unit Budidaya pertama (misal: "Ember 80L #1") dan Batch Ikan pertama (spesies, jumlah benih, ukuran cm, tanggal tebar, harga bibit).
2. **Dashboard Operasional**:
   - Kartu metrik ringkas: Total Ikan Hidup, Total Kematian (% mortalitas), Ikan Dipanen, Unit Aktif, Pengeluaran, Pemasukan, Saldo Kas.
   - Banner jadwal pakan berikutnya dengan tombol cepat *"Tandai Sudah Diberi Pakan"*.
   - Grafik tren mortalitas vs pemberian pakan 7 hari terakhir.
3. **Manajemen Unit & Batch Budidaya**:
   - Daftar wadah/kolam dengan kapasitas, jenis air, dan status batch aktif.
   - Detail batch: umur budidaya (hari ke-X), estimasi biomassa, pergerakan stok historis.
4. **Jadwal & Log Pakan**:
   - Jadwal terstruktur (pagi, siang, sore, malam) dengan pengingat waktu dan takaran.
   - Riwayat pakan harian dan kalkulator FCR batch.
5. **Pencatatan Mortalitas**:
   - Input tanggal, jumlah mati, dugaan penyebab (kualitas air, kanibalisme, loncat, jamur/parasit, stress cuaca), dan catatan.
   - Otomatis memicu pembaruan stok hidup secara atomik.
6. **Pencatatan Keuangan (Kas Budidaya)**:
   - Form input transaksi pengeluaran (pakan, bibit, vitamin/obat, listrik/air, peralatan) & pemasukan (penjualan ikan hidup, olahan).
   - Rekap arus kas dan estimasi laba kotor per batch budidaya.
7. **Pemantauan Kualitas Air & Jurnal**:
   - Parameter input: Suhu (°C), pH (indikator warna asam-basa), warna air (hijau pekat, cokelat, bening, keruh), bau, penggantian air (% dikuras/diisi).
   - Jurnal harian: Catatan cuaca, nafsu makan ikan, perlakuan probiotik/garam krosok.
8. **Laporan & Ekspor Data**:
   - Ringkasan siklus panen, tingkat kelangsungan hidup (*Survival Rate / SR%*), total pakan terpakai.
   - Tombol Ekspor: Backup JSON, Ekspor CSV, serta Ekspor SQL D1 Script untuk sinkronisasi ke Cloudflare D1.

#### Visual Identity & Design System
- **Aesthetic Direction**: Clean utilitarian agricultural dashboard. Profesional, segar, tenang, dan tidak melelahkan mata peternak di lapangan.
- **Color Palette**:
  - Dominan Kanvas: Slate bersih (`#F8FAFC` light / `#0B132B` dark).
  - Aksen Utama: Hijau Zamrud Tumbuh (`#059669` / `#10B981`) melambangkan kesuburan budidaya dan air sehat.
  - Aksen Air & Akuakultur: Biru Samudra (`#0284C7` / `#38BDF8`) untuk elemen kolam, air, dan filtrasi.
  - Status Semantik: Amber hangat (`#D97706`) untuk peringatan parameter air/jadwal pakan; Crimson tenang (`#DC2626`) untuk mortalitas.
- **Typography**:
  - Headings & Navigation: `Plus Jakarta Sans` (modern, legible, kokoh).
  - Body Prose & Formulir: `DM Sans` (sangat nyaman dibaca pada layar ponsel).
  - Data Numerik, Tanggal, Mata Uang, & Metrik: `JetBrains Mono` / `font-mono tabular-nums` agar angka tidak bergeser dan sejajar vertikal.
- **Mobile-First Navigation**:
  - Bottom Tab Bar pada tampilan smartphone (<768px): Dashboard, Batch/Unit, Pakan, Keuangan, Menu Lainnya.
  - Clean Sidebar pada desktop/tablet: Akses langsung ke seluruh 10 modul navigasi.
  - Zero-Pill Discipline: Metadata disajikan dengan pemisah tipografis (`·`), bebas dari kapsul warna-warni yang berlebihan.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Storage Architecture — Client-Side Relational Store + D1 SQL Export**
  - *Chosen Approach*: Menyediakan Repository pattern dengan IndexedDB / LocalStorage yang di-hash dengan foreign key referensial di sisi frontend, ditambah file SQL Migrations lengkap (`migrations/0001_initial_schema.sql`), generator ekspor SQL D1, dan fungsi adapter Cloudflare Pages Functions (`/functions/api/...`).
  - *Why*: Memastikan aplikasi langsung berjalan 100% fungsional di lingkungan dev/preview tanpa kehilangan data saat refresh, sekaligus siap dideploy langsung ke Cloudflare Pages + D1 tanpa perubahan skema.
  - *Alternatives Considered*: Pure in-memory state (hilang saat refresh — dilarang), atau remote D1 langsung dari browser (Cloudflare D1 tidak mengizinkan direct TCP/client connection tanpa Workers backend).
- **Decision 2: Konsistensi Pergerakan Stok (Stock Movement Ledger)**
  - *Chosen Approach*: Stok ikan dihitung berdasarkan event transaksi stok (`fish_stock_movements`) dengan jenis: `INITIAL`, `ADDITION`, `MORTALITY`, `HARVEST`.
  - *Why*: Mencegah duplikasi pengurangan stok ketika panen dicatat dalam penjualan, serta memudahkan audit riwayat siklus ikan.
- **Decision 3: FCR & Biomass Estimation Engine**
  - *Chosen Approach*: FCR dihitung dari formula baku akuakultur: $\text{FCR} = \frac{\text{Total Pakan Masuk (kg)}}{\text{Estimasi Penambahan Biomassa (kg)}}$. Peternak dapat memasukkan sampling bobot rata-rata (gram/ekor) secara berkala pada jurnal atau modul panen.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Mitra Tumbuh Client                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Presentation Layer (React)                   │  │
│  │  • Dashboard View    • Data Budidaya    • Unit Budidaya          │  │
│  │  • Jadwal Pakan      • Mortalitas Log   • Keuangan (Kas)         │  │
│  │  • Kualitas Air      • Jurnal Harian    • Laporan & FCR          │  │
│  │  • Export & D1 Sync  • Pengaturan       • Onboarding Modal       │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │                                   │
│  ┌─────────────────────────────────▼────────────────────────────────┐  │
│  │                     Business & Calculation Engine                │  │
│  │  • Stock Movement Ledger (Initial + In - Mortality - Harvest)    │  │
│  │  • FCR & Biomass Calculator      • Financial Cashflow Summarizer │  │
│  │  • Water Quality Health Checker  • Feeding Schedule Engine       │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │                                   │
│  ┌─────────────────────────────────▼────────────────────────────────┐  │
│  │                  Repository & Persistence Adapter                │  │
│  │  • IndexedDB / LocalStorage Engine with UUID & Foreign Keys      │  │
│  │  • D1 SQL Schema Generator & Sync Engine                         │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴────────────────────────┐
           ▼                                                  ▼
┌─────────────────────────────────────┐    ┌───────────────────────────────────┐
│     Interactive Preview Storage     │    │   Cloudflare Pages & D1 Artifacts │
│  • Browser IndexedDB (Persistent)   │    │  • migrations/0001_initial_schema │
│  • JSON Import/Export Backup        │    │  • functions/api/* worker routes  │
│  • D1 SQL dump generator            │    │  • README.md deployment manual    │
└─────────────────────────────────────┘    └───────────────────────────────────┘
```

#### Struktur Tabel Database (D1 SQLite & Repository Engine)
1. `cultivation_units`: `id`, `name`, `type` (ember, terpal, beton, bioflok), `volume_liters`, `location`, `status`, `created_at`
2. `fish_batches`: `id`, `unit_id`, `species`, `batch_name`, `initial_count`, `initial_size_cm`, `seed_price_total`, `stocking_date`, `status` (active, harvested, closed), `created_at`
3. `fish_stock_movements`: `id`, `batch_id`, `unit_id`, `movement_type` (INITIAL, ADDITION, MORTALITY, HARVEST), `quantity`, `reference_id`, `notes`, `created_at`
4. `feeding_schedules`: `id`, `unit_id`, `batch_id`, `time_of_day` (e.g. 08:00, 16:00), `feed_type`, `amount_grams`, `is_active`
5. `feeding_logs`: `id`, `schedule_id`, `batch_id`, `unit_id`, `feed_date`, `feed_time`, `feed_brand`, `amount_grams`, `status` (completed, missed, skipped), `notes`, `created_at`
6. `mortality_records`: `id`, `batch_id`, `unit_id`, `date`, `quantity`, `suspected_cause`, `notes`, `created_at`
7. `harvest_records`: `id`, `batch_id`, `unit_id`, `harvest_date`, `quantity_count`, `total_weight_kg`, `average_size_cm`, `notes`, `created_at`
8. `financial_transactions`: `id`, `batch_id`, `type` (expense, income), `category` (bibit, pakan, obat, peralatan, operasional, penjualan_ikan, lainnya), `amount`, `date`, `description`, `created_at`
9. `water_quality_records`: `id`, `unit_id`, `recorded_at`, `temperature_c`, `ph_level`, `water_color`, `water_clarity`, `water_odor`, `water_change_percent`, `notes`
10. `cultivation_journals`: `id`, `batch_id`, `unit_id`, `entry_date`, `activity_type`, `notes`, `created_at`

---

### 5. Implementation Phases

- **Phase 1**: Inisialisasi Database Schema SQL (`migrations/0001_initial_schema.sql`), Data Types TypeScript, dan Reactive Storage Engine (IndexedDB/LocalStorage Repository) dengan data bawaan fleksibel & demo mode.
- **Phase 2**: Navigation Shell & Top Bar Contract, Responsive Mobile Bottom Bar, Onboarding Wizard untuk setup pertama (wadah & jenis ikan kustom).
- **Phase 3**: Modul Unit Budidaya & Manajemen Batch Ikan dengan Stock Mutation Engine yang konsisten.
- **Phase 4**: Modul Jadwal Pakan, Feeding Log, dan kalkulator estimasi FCR.
- **Phase 5**: Modul Pencatatan Mortalitas & Panen (otomatis sinkron ke stok).
- **Phase 6**: Modul Pembukuan Keuangan (Pengeluaran bibit, pakan, peralatan vs Pemasukan panen/jual ikan).
- **Phase 7**: Modul Kualitas Air & Jurnal Budidaya harian.
- **Phase 8**: Modul Dashboard Utama & Laporan Budidaya (Grafik tren, Survival Rate, FCR).
- **Phase 9**: Modul Pengaturan, Backup/Restore JSON, Generator SQL D1 Dump, dan Dokumentasi `README.md` untuk Cloudflare Pages & D1.
- **Phase 10**: Verifikasi kompilasi, pengujian respon antarmuka, dan audit konsistensi data.
