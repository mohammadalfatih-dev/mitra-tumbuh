-- ========================================================
-- MITRA TUMBUH: Aquaculture Management System
-- Cloudflare D1 (SQLite) Initial Schema Migration
-- Migration: 0001_initial_schema.sql
-- ========================================================

PRAGMA foreign_keys = ON;

-- 1. Cultivation Units Table
CREATE TABLE IF NOT EXISTS cultivation_units (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- ember_80l, kolam_terpal, kolam_beton, bioflok, keramba, lainnya
  volume_liters REAL NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  description TEXT,
  created_at TEXT NOT NULL
);

-- 2. Fish Batches Table
CREATE TABLE IF NOT EXISTS fish_batches (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL REFERENCES cultivation_units(id) ON DELETE CASCADE,
  species TEXT NOT NULL,
  batch_name TEXT NOT NULL,
  initial_count INTEGER NOT NULL,
  initial_size_cm REAL NOT NULL,
  seed_price_total REAL NOT NULL DEFAULT 0,
  stocking_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, harvested, closed
  target_harvest_date TEXT,
  target_weight_grams REAL,
  current_avg_weight_grams REAL,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- 3. Fish Stock Movements Table (Immutable Ledger)
CREATE TABLE IF NOT EXISTS fish_stock_movements (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES fish_batches(id) ON DELETE CASCADE,
  unit_id TEXT NOT NULL REFERENCES cultivation_units(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL, -- INITIAL, ADDITION, MORTALITY, HARVEST
  quantity INTEGER NOT NULL,
  reference_id TEXT,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- 4. Feeding Schedules Table
CREATE TABLE IF NOT EXISTS feeding_schedules (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL REFERENCES cultivation_units(id) ON DELETE CASCADE,
  batch_id TEXT NOT NULL REFERENCES fish_batches(id) ON DELETE CASCADE,
  time_of_day TEXT NOT NULL,
  feed_type TEXT NOT NULL,
  amount_grams REAL NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  notes TEXT
);

-- 5. Feeding Logs Table
CREATE TABLE IF NOT EXISTS feeding_logs (
  id TEXT PRIMARY KEY,
  schedule_id TEXT REFERENCES feeding_schedules(id) ON DELETE SET NULL,
  batch_id TEXT NOT NULL REFERENCES fish_batches(id) ON DELETE CASCADE,
  unit_id TEXT NOT NULL REFERENCES cultivation_units(id) ON DELETE CASCADE,
  feed_date TEXT NOT NULL,
  feed_time TEXT NOT NULL,
  feed_brand TEXT NOT NULL,
  amount_grams REAL NOT NULL,
  status TEXT NOT NULL, -- completed, missed, skipped
  notes TEXT,
  created_at TEXT NOT NULL
);

-- 6. Mortality Records Table
CREATE TABLE IF NOT EXISTS mortality_records (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES fish_batches(id) ON DELETE CASCADE,
  unit_id TEXT NOT NULL REFERENCES cultivation_units(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  suspected_cause TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- 7. Harvest Records Table
CREATE TABLE IF NOT EXISTS harvest_records (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES fish_batches(id) ON DELETE CASCADE,
  unit_id TEXT NOT NULL REFERENCES cultivation_units(id) ON DELETE CASCADE,
  harvest_date TEXT NOT NULL,
  quantity_count INTEGER NOT NULL,
  total_weight_kg REAL NOT NULL,
  average_size_cm REAL,
  selling_price_per_kg REAL,
  revenue_total REAL,
  buyer_name TEXT,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- 8. Financial Transactions Table
CREATE TABLE IF NOT EXISTS financial_transactions (
  id TEXT PRIMARY KEY,
  batch_id TEXT REFERENCES fish_batches(id) ON DELETE SET NULL,
  unit_id TEXT REFERENCES cultivation_units(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- expense, income
  category TEXT NOT NULL, -- bibit, pakan, obat_vitamin, peralatan, operasional, penjualan_ikan, penjualan_hasil_panen, lainnya
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- 9. Water Quality Records Table
CREATE TABLE IF NOT EXISTS water_quality_records (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL REFERENCES cultivation_units(id) ON DELETE CASCADE,
  batch_id TEXT REFERENCES fish_batches(id) ON DELETE SET NULL,
  recorded_at TEXT NOT NULL,
  temperature_c REAL NOT NULL,
  ph_level REAL NOT NULL,
  water_color TEXT NOT NULL,
  water_clarity TEXT NOT NULL,
  water_odor TEXT NOT NULL,
  water_change_percent REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- 10. Cultivation Journals Table
CREATE TABLE IF NOT EXISTS cultivation_journals (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES fish_batches(id) ON DELETE CASCADE,
  unit_id TEXT NOT NULL REFERENCES cultivation_units(id) ON DELETE CASCADE,
  entry_date TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  fish_behavior TEXT,
  weather_condition TEXT,
  notes TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_batch ON fish_stock_movements(batch_id);
CREATE INDEX IF NOT EXISTS idx_feeding_logs_batch_date ON feeding_logs(batch_id, feed_date);
CREATE INDEX IF NOT EXISTS idx_mortality_records_batch ON mortality_records(batch_id);
CREATE INDEX IF NOT EXISTS idx_fin_tx_type_date ON financial_transactions(type, date);
CREATE INDEX IF NOT EXISTS idx_water_quality_unit ON water_quality_records(unit_id);
