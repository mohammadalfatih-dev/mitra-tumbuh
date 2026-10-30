export type UnitType = 
  | 'ember_80l' 
  | 'kolam_terpal' 
  | 'kolam_beton' 
  | 'bioflok' 
  | 'keramba' 
  | 'akuarium' 
  | 'lainnya';

export interface CultivationUnit {
  id: string;
  name: string;
  type: UnitType;
  volumeLiters: number;
  location: string;
  status: 'active' | 'maintenance' | 'inactive';
  description?: string;
  createdAt: string;
}

export type BatchStatus = 'active' | 'harvested' | 'closed';

export interface FishBatch {
  id: string;
  unitId: string;
  species: string; // e.g. "Ikan Lele Dumbo", "Ikan Nila Merah", "Ikan Patin", etc.
  batchName: string;
  initialCount: number;
  initialSizeCm: number;
  seedPriceTotal: number;
  stockingDate: string; // YYYY-MM-DD
  status: BatchStatus;
  targetHarvestDate?: string;
  targetWeightGrams?: number;
  currentAvgWeightGrams?: number; // Sampled average weight per fish
  notes?: string;
  createdAt: string;
}

export type StockMovementType = 'INITIAL' | 'ADDITION' | 'MORTALITY' | 'HARVEST';

export interface FishStockMovement {
  id: string;
  batchId: string;
  unitId: string;
  movementType: StockMovementType;
  quantity: number;
  referenceId?: string; // Links to mortalityRecordId or harvestRecordId
  notes?: string;
  createdAt: string;
}

export interface FeedingSchedule {
  id: string;
  unitId: string;
  batchId: string;
  timeOfDay: string; // e.g. "08:00"
  feedType: string;  // e.g. "Pelet LP-1", "Pelet -2", "Maggot BSF"
  amountGrams: number;
  isActive: boolean;
  notes?: string;
}

export type FeedingStatus = 'completed' | 'missed' | 'skipped';

export interface FeedingLog {
  id: string;
  scheduleId?: string;
  batchId: string;
  unitId: string;
  feedDate: string; // YYYY-MM-DD
  feedTime: string; // HH:mm
  feedBrand: string;
  amountGrams: number;
  status: FeedingStatus;
  notes?: string;
  createdAt: string;
}

export type MortalityCause = 
  | 'kualitas_air' 
  | 'kanibalisme' 
  | 'loncat' 
  | 'jamur_parasit' 
  | 'stres_cuaca' 
  | 'penyakit_bakteri' 
  | 'kembung' 
  | 'tidak_diketahui';

export interface MortalityRecord {
  id: string;
  batchId: string;
  unitId: string;
  date: string; // YYYY-MM-DD
  quantity: number;
  suspectedCause: MortalityCause;
  notes?: string;
  createdAt: string;
}

export interface HarvestRecord {
  id: string;
  batchId: string;
  unitId: string;
  harvestDate: string; // YYYY-MM-DD
  quantityCount: number;
  totalWeightKg: number;
  averageSizeCm?: number;
  sellingPricePerKg?: number;
  revenueTotal?: number;
  buyerName?: string;
  notes?: string;
  createdAt: string;
}

export type TransactionType = 'expense' | 'income';

export type TransactionCategory = 
  | 'bibit' 
  | 'pakan' 
  | 'obat_vitamin' 
  | 'peralatan' 
  | 'operasional' 
  | 'penjualan_ikan' 
  | 'penjualan_hasil_panen' 
  | 'lainnya';

export interface FinancialTransaction {
  id: string;
  batchId?: string;
  unitId?: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  createdAt: string;
}

export type WaterColor = 'hijau_muda' | 'hijau_pekat' | 'cokelat' | 'bening' | 'keruh' | 'merah_kehitaman';
export type WaterClarity = 'jernih' | 'sedang' | 'keruh_pekat';
export type WaterOdor = 'normal' | 'amis_ringan' | 'bau_busuk' | 'bau_amonia';

export interface WaterQualityRecord {
  id: string;
  unitId: string;
  batchId?: string;
  recordedAt: string; // YYYY-MM-DDTHH:mm
  temperatureC: number;
  phLevel: number;
  waterColor: WaterColor;
  waterClarity: WaterClarity;
  waterOdor: WaterOdor;
  waterChangePercent: number; // e.g. 0 to 100%
  notes?: string;
  createdAt: string;
}

export type JournalActivityType = 
  | 'rutin' 
  | 'kuras_air' 
  | 'probiotik' 
  | 'garam_krosok' 
  | 'sortir_ukuran' 
  | 'vitamin' 
  | 'pengobatan' 
  | 'inspeksi'
  | 'pergantian_pakan';

export interface CultivationJournal {
  id: string;
  batchId: string;
  unitId: string;
  entryDate: string; // YYYY-MM-DD
  activityType: JournalActivityType;
  fishBehavior?: string; // e.g. "Lincah, nafsu makan tinggi"
  weatherCondition?: string; // e.g. "Hujan lebat sore hari"
  notes: string;
  createdAt: string;
}

// App Settings & State
export interface AppSettings {
  farmName: string;
  ownerName: string;
  currency: string;
  hasCompletedOnboarding: boolean;
  selectedFishPresets: string[];
}
