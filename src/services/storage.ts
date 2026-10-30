import {
  AppSettings,
  CultivationJournal,
  CultivationUnit,
  FeedingLog,
  FeedingSchedule,
  FinancialTransaction,
  FishBatch,
  FishStockMovement,
  HarvestRecord,
  MortalityRecord,
  WaterQualityRecord,
} from '../types';

export interface DatabaseSchema {
  settings: AppSettings;
  units: CultivationUnit[];
  batches: FishBatch[];
  stockMovements: FishStockMovement[];
  feedingSchedules: FeedingSchedule[];
  feedingLogs: FeedingLog[];
  mortalityRecords: MortalityRecord[];
  harvestRecords: HarvestRecord[];
  financialTransactions: FinancialTransaction[];
  waterQualityRecords: WaterQualityRecord[];
  journals: CultivationJournal[];
}

const STORAGE_KEY = 'mitra_tumbuh_aquaculture_db_v1';

// Seed Initial Sample Data for Budikdamber Lele & Kolam Terpal Nila
const getInitialSeedData = (): DatabaseSchema => {
  const now = new Date();
  const formatYMD = (d: Date) => d.toISOString().split('T')[0];
  
  const dMinus20 = new Date(now.getTime() - 20 * 86400000);
  const dMinus10 = new Date(now.getTime() - 10 * 86400000);
  const dMinus5 = new Date(now.getTime() - 5 * 86400000);
  const dMinus2 = new Date(now.getTime() - 2 * 86400000);
  const dMinus1 = new Date(now.getTime() - 1 * 86400000);
  const todayStr = formatYMD(now);

  const unit1Id = 'unit-ember-80l-01';
  const unit2Id = 'unit-terpal-01';

  const batch1Id = 'batch-lele-sang-01';
  const batch2Id = 'batch-nila-merah-01';

  const units: CultivationUnit[] = [
    {
      id: unit1Id,
      name: 'Ember 80L #1 (Pekarangan Depan)',
      type: 'ember_80l',
      volumeLiters: 80,
      location: 'Pekarangan Depan Rumah',
      status: 'active',
      description: 'Sistem Budikdamber dilengkapi kran penguras dasar dan pot kangkung',
      createdAt: dMinus20.toISOString(),
    },
    {
      id: unit2Id,
      name: 'Kolam Terpal D2 (Belakang)',
      type: 'kolam_terpal',
      volumeLiters: 2500,
      location: 'Halaman Belakang',
      status: 'active',
      description: 'Kolam bulat terpal diameter 2m tinggi 1m dengan aerasi resun',
      createdAt: dMinus10.toISOString(),
    },
  ];

  const batches: FishBatch[] = [
    {
      id: batch1Id,
      unitId: unit1Id,
      species: 'Ikan Lele Sangkuriang',
      batchName: 'Batch Lele Budikdamber 01',
      initialCount: 65,
      initialSizeCm: 7,
      seedPriceTotal: 26000, // Rp 400 per ekor
      stockingDate: formatYMD(dMinus20),
      status: 'active',
      targetHarvestDate: formatYMD(new Date(now.getTime() + 45 * 86400000)),
      currentAvgWeightGrams: 35, // gram per ekor saat ini
      notes: 'Benih sehat lincah dari BBI lokal, adaptasi 30 menit aklimatisasi',
      createdAt: dMinus20.toISOString(),
    },
    {
      id: batch2Id,
      unitId: unit2Id,
      species: 'Ikan Nila Merah',
      batchName: 'Batch Nila Kolam Terpal 01',
      initialCount: 200,
      initialSizeCm: 5,
      seedPriceTotal: 100000,
      stockingDate: formatYMD(dMinus10),
      status: 'active',
      targetHarvestDate: formatYMD(new Date(now.getTime() + 75 * 86400000)),
      currentAvgWeightGrams: 28,
      notes: 'Monosex jantan, adaptasi dengan probiotik EM4 perikanan',
      createdAt: dMinus10.toISOString(),
    },
  ];

  const stockMovements: FishStockMovement[] = [
    {
      id: 'sm-init-1',
      batchId: batch1Id,
      unitId: unit1Id,
      movementType: 'INITIAL',
      quantity: 65,
      notes: 'Penebaran awal benih lele ember 80L',
      createdAt: dMinus20.toISOString(),
    },
    {
      id: 'sm-mort-1',
      batchId: batch1Id,
      unitId: unit1Id,
      movementType: 'MORTALITY',
      quantity: 2,
      referenceId: 'mort-1',
      notes: 'Kematian hari ke-2 pasca tebar',
      createdAt: formatYMD(new Date(dMinus20.getTime() + 2 * 86400000)),
    },
    {
      id: 'sm-mort-2',
      batchId: batch1Id,
      unitId: unit1Id,
      movementType: 'MORTALITY',
      quantity: 1,
      referenceId: 'mort-2',
      notes: 'Loncat keluar ember',
      createdAt: formatYMD(dMinus5),
    },
    {
      id: 'sm-init-2',
      batchId: batch2Id,
      unitId: unit2Id,
      movementType: 'INITIAL',
      quantity: 200,
      notes: 'Penebaran awal benih nila',
      createdAt: dMinus10.toISOString(),
    },
    {
      id: 'sm-mort-3',
      batchId: batch2Id,
      unitId: unit2Id,
      movementType: 'MORTALITY',
      quantity: 3,
      referenceId: 'mort-3',
      notes: 'Stres adaptasi benih',
      createdAt: formatYMD(dMinus5),
    },
  ];

  const feedingSchedules: FeedingSchedule[] = [
    {
      id: 'sched-1',
      unitId: unit1Id,
      batchId: batch1Id,
      timeOfDay: '08:00',
      feedType: 'Pelet Apung LP-1 (Protein 32%)',
      amountGrams: 50,
      isActive: true,
      notes: 'Pemberian sedikit demi sedikit hingga respons melambat',
    },
    {
      id: 'sched-2',
      unitId: unit1Id,
      batchId: batch1Id,
      timeOfDay: '17:00',
      feedType: 'Pelet Apung LP-1 (Protein 32%)',
      amountGrams: 60,
      isActive: true,
      notes: 'Pemberian pakan sore menjelang maghrib',
    },
    {
      id: 'sched-3',
      unitId: unit2Id,
      batchId: batch2Id,
      timeOfDay: '09:00',
      feedType: 'Pelet Terapung -1',
      amountGrams: 150,
      isActive: true,
      notes: 'Pakan pagi kolam nila',
    },
    {
      id: 'sched-4',
      unitId: unit2Id,
      batchId: batch2Id,
      timeOfDay: '16:00',
      feedType: 'Pelet Terapung -1',
      amountGrams: 160,
      isActive: true,
      notes: 'Pakan sore kolam nila',
    },
  ];

  const feedingLogs: FeedingLog[] = [
    {
      id: 'flog-1',
      scheduleId: 'sched-1',
      batchId: batch1Id,
      unitId: unit1Id,
      feedDate: todayStr,
      feedTime: '08:05',
      feedBrand: 'Hi-Pro-Vite LP-1',
      amountGrams: 50,
      status: 'completed',
      notes: 'Respon makan sangat rakus dan aktif di permukaan',
      createdAt: `${todayStr}T08:06:00Z`,
    },
    {
      id: 'flog-2',
      scheduleId: 'sched-2',
      batchId: batch1Id,
      unitId: unit1Id,
      feedDate: formatYMD(dMinus1),
      feedTime: '17:15',
      feedBrand: 'Hi-Pro-Vite LP-1',
      amountGrams: 60,
      status: 'completed',
      notes: 'Habis bersih dalam waktu 5 menit',
      createdAt: `${formatYMD(dMinus1)}T17:16:00Z`,
    },
    {
      id: 'flog-3',
      scheduleId: 'sched-3',
      batchId: batch2Id,
      unitId: unit2Id,
      feedDate: todayStr,
      feedTime: '09:10',
      feedBrand: 'Prima Feed PF-1000',
      amountGrams: 150,
      status: 'completed',
      notes: 'Nafsu makan bagus',
      createdAt: `${todayStr}T09:15:00Z`,
    },
  ];

  const mortalityRecords: MortalityRecord[] = [
    {
      id: 'mort-1',
      batchId: batch1Id,
      unitId: unit1Id,
      date: formatYMD(new Date(dMinus20.getTime() + 2 * 86400000)),
      quantity: 2,
      suspectedCause: 'kualitas_air',
      notes: 'Ikan kembung dan perut bengkak pasca adaptasi pertama',
      createdAt: `${formatYMD(new Date(dMinus20.getTime() + 2 * 86400000))}T10:00:00Z`,
    },
    {
      id: 'mort-2',
      batchId: batch1Id,
      unitId: unit1Id,
      date: formatYMD(dMinus5),
      quantity: 1,
      suspectedCause: 'loncat',
      notes: 'Ditemukan kering di lantai samping ember akibat air terlalu penuh',
      createdAt: `${formatYMD(dMinus5)}T06:30:00Z`,
    },
    {
      id: 'mort-3',
      batchId: batch2Id,
      unitId: unit2Id,
      date: formatYMD(dMinus5),
      quantity: 3,
      suspectedCause: 'stres_cuaca',
      notes: 'Mati pasca hujan deras mendadak di malam hari',
      createdAt: `${formatYMD(dMinus5)}T08:00:00Z`,
    },
  ];

  const harvestRecords: HarvestRecord[] = [];

  const financialTransactions: FinancialTransaction[] = [
    {
      id: 'tx-1',
      batchId: batch1Id,
      unitId: unit1Id,
      type: 'expense',
      category: 'bibit',
      amount: 26000,
      date: formatYMD(dMinus20),
      description: 'Pembelian 65 ekor benih lele ukuran 7cm @Rp 400',
      createdAt: dMinus20.toISOString(),
    },
    {
      id: 'tx-2',
      batchId: batch1Id,
      unitId: unit1Id,
      type: 'expense',
      category: 'pakan',
      amount: 35000,
      date: formatYMD(dMinus20),
      description: 'Pelet LP-1 repack 2 kg',
      createdAt: dMinus20.toISOString(),
    },
    {
      id: 'tx-3',
      batchId: batch1Id,
      unitId: unit1Id,
      type: 'expense',
      category: 'peralatan',
      amount: 85000,
      date: formatYMD(dMinus20),
      description: 'Ember 80 liter tebal + kran penguras dan net penutup',
      createdAt: dMinus20.toISOString(),
    },
    {
      id: 'tx-4',
      batchId: batch2Id,
      unitId: unit2Id,
      type: 'expense',
      category: 'bibit',
      amount: 100000,
      date: formatYMD(dMinus10),
      description: 'Pembelian 200 ekor benih nila merah @Rp 500',
      createdAt: dMinus10.toISOString(),
    },
    {
      id: 'tx-5',
      batchId: batch2Id,
      unitId: unit2Id,
      type: 'expense',
      category: 'obat_vitamin',
      amount: 28000,
      date: formatYMD(dMinus10),
      description: 'Probiotik EM4 perikanan 1 liter & garam krosok 2kg',
      createdAt: dMinus10.toISOString(),
    },
    {
      id: 'tx-6',
      type: 'income',
      category: 'penjualan_ikan',
      amount: 140000,
      date: formatYMD(dMinus2),
      description: 'Penjualan sampling panen parsial siklus sebelumnya 5 kg @Rp 28.000',
      createdAt: dMinus2.toISOString(),
    },
  ];

  const waterQualityRecords: WaterQualityRecord[] = [
    {
      id: 'wq-1',
      unitId: unit1Id,
      batchId: batch1Id,
      recordedAt: `${todayStr}T07:30`,
      temperatureC: 28.5,
      phLevel: 7.2,
      waterColor: 'hijau_muda',
      waterClarity: 'sedang',
      waterOdor: 'normal',
      waterChangePercent: 20,
      notes: 'Kuras endapan dasar 20% lewat kran, ditambahkan air sumur segar dan sejumput garam ikan',
      createdAt: `${todayStr}T07:35:00Z`,
    },
    {
      id: 'wq-2',
      unitId: unit2Id,
      batchId: batch2Id,
      recordedAt: `${formatYMD(dMinus2)}T08:00`,
      temperatureC: 27.8,
      phLevel: 7.5,
      waterColor: 'cokelat',
      waterClarity: 'sedang',
      waterOdor: 'normal',
      waterChangePercent: 0,
      notes: 'Bakteri probiotik aktif, air tidak berbusa',
      createdAt: `${formatYMD(dMinus2)}T08:10:00Z`,
    },
  ];

  const journals: CultivationJournal[] = [
    {
      id: 'jrn-1',
      batchId: batch1Id,
      unitId: unit1Id,
      entryDate: todayStr,
      activityType: 'kuras_air',
      fishBehavior: 'Lincah, berenang serentak merespons pakan',
      weatherCondition: 'Pagi cerah berawan 28°C',
      notes: 'Kuras dasar ember 20 liter untuk membuang kotoran feses. Kangkung di pot atas tumbuh subur berdaun hijau pekat.',
      createdAt: `${todayStr}T08:20:00Z`,
    },
    {
      id: 'jrn-2',
      batchId: batch1Id,
      unitId: unit1Id,
      entryDate: formatYMD(dMinus5),
      activityType: 'probiotik',
      fishBehavior: 'Agak tenang',
      weatherCondition: 'Mendung sejuk',
      notes: 'Pemberian 5 tutup botol probiotik hasil fermentasi molase untuk menjaga kestabilan plankton air ember.',
      createdAt: `${formatYMD(dMinus5)}T16:00:00Z`,
    },
    {
      id: 'jrn-3',
      batchId: batch2Id,
      unitId: unit2Id,
      entryDate: formatYMD(dMinus2),
      activityType: 'sortir_ukuran',
      fishBehavior: 'Aktif menyebar rata',
      weatherCondition: 'Cerah',
      notes: 'Sampling berat ikan nila rata-rata mencapai 28 gram per ekor. Tidak ada tanda jamur atau sirip geripis.',
      createdAt: `${formatYMD(dMinus2)}T10:00:00Z`,
    },
  ];

  return {
    settings: {
      farmName: 'Mitra Tumbuh Mina Lestari',
      ownerName: 'Budi Santoso',
      currency: 'IDR',
      hasCompletedOnboarding: true,
      selectedFishPresets: ['Ikan Lele', 'Ikan Nila', 'Ikan Patin'],
    },
    units,
    batches,
    stockMovements,
    feedingSchedules,
    feedingLogs,
    mortalityRecords,
    harvestRecords,
    financialTransactions,
    waterQualityRecords,
    journals,
  };
};

class StorageService {
  private db: DatabaseSchema;
  private listeners: (() => void)[] = [];

  constructor() {
    this.db = this.loadFromStorage();
  }

  private loadFromStorage(): DatabaseSchema {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load Mitra Tumbuh DB from LocalStorage', e);
    }
    const seed = getInitialSeedData();
    this.saveToStorage(seed);
    return seed;
  }

  private saveToStorage(data: DatabaseSchema) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to persist Mitra Tumbuh DB', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('Listener callback error', err);
      }
    }
  }

  // --- GETTERS ---
  public getDatabase(): DatabaseSchema {
    return this.db;
  }

  public getSettings(): AppSettings {
    return this.db.settings;
  }

  public getUnits(): CultivationUnit[] {
    return this.db.units;
  }

  public getUnitById(id: string): CultivationUnit | undefined {
    return this.db.units.find((u) => u.id === id);
  }

  public getBatches(): FishBatch[] {
    return this.db.batches;
  }

  public getBatchById(id: string): FishBatch | undefined {
    return this.db.batches.find((b) => b.id === id);
  }

  public getActiveBatches(): FishBatch[] {
    return this.db.batches.filter((b) => b.status === 'active');
  }

  public getStockMovements(batchId?: string): FishStockMovement[] {
    if (batchId) {
      return this.db.stockMovements.filter((m) => m.batchId === batchId);
    }
    return this.db.stockMovements;
  }

  /**
   * Calculates live fish count based on immutable ledger:
   * Current Stock = Initial + Additions - Mortalities - Harvests
   */
  public getLiveStockCount(batchId: string): number {
    const batch = this.getBatchById(batchId);
    if (!batch) return 0;

    const movements = this.getStockMovements(batchId);
    let count = 0;

    for (const m of movements) {
      if (m.movementType === 'INITIAL' || m.movementType === 'ADDITION') {
        count += m.quantity;
      } else if (m.movementType === 'MORTALITY' || m.movementType === 'HARVEST') {
        count -= m.quantity;
      }
    }

    return Math.max(0, count);
  }

  public getTotalCurrentLiveStock(): number {
    const activeBatches = this.getActiveBatches();
    return activeBatches.reduce((acc, b) => acc + this.getLiveStockCount(b.id), 0);
  }

  public getTotalInitialFish(): number {
    return this.db.batches.reduce((acc, b) => acc + b.initialCount, 0);
  }

  public getTotalMortalities(): number {
    return this.db.mortalityRecords.reduce((acc, m) => acc + m.quantity, 0);
  }

  public getTotalHarvestedFish(): number {
    return this.db.harvestRecords.reduce((acc, h) => acc + h.quantityCount, 0);
  }

  public getTotalHarvestedWeightKg(): number {
    return this.db.harvestRecords.reduce((acc, h) => acc + h.totalWeightKg, 0);
  }

  public getSurvivalRate(batchId?: string): number {
    if (batchId) {
      const batch = this.getBatchById(batchId);
      if (!batch || batch.initialCount === 0) return 100;
      const live = this.getLiveStockCount(batchId);
      const harvested = this.db.harvestRecords
        .filter((h) => h.batchId === batchId)
        .reduce((sum, h) => sum + h.quantityCount, 0);
      return Math.min(100, Math.max(0, ((live + harvested) / batch.initialCount) * 100));
    }

    const totalInitial = this.getTotalInitialFish();
    if (totalInitial === 0) return 100;
    const totalLive = this.getTotalCurrentLiveStock();
    const totalHarvested = this.getTotalHarvestedFish();
    return Math.min(100, Math.max(0, ((totalLive + totalHarvested) / totalInitial) * 100));
  }

  public getBatchTotalFeedKg(batchId: string): number {
    const logs = this.db.feedingLogs.filter(
      (l) => l.batchId === batchId && l.status === 'completed'
    );
    const totalGrams = logs.reduce((sum, l) => sum + l.amountGrams, 0);
    return totalGrams / 1000;
  }

  /**
   * Calculates Feed Conversion Ratio (FCR)
   * FCR = Total Feed Given (kg) / Biomass Gain (kg)
   */
  public getBatchFCR(batchId: string): { fcr: number | null; totalFeedKg: number; biomassGainKg: number } {
    const batch = this.getBatchById(batchId);
    if (!batch) return { fcr: null, totalFeedKg: 0, biomassGainKg: 0 };

    const totalFeedKg = this.getBatchTotalFeedKg(batchId);
    const liveStock = this.getLiveStockCount(batchId);

    // Initial average weight estimate if not recorded: ~4g for 5-7cm fingerlings
    const initialWeightKg = (batch.initialCount * 0.005);
    
    // Harvested weight
    const harvests = this.db.harvestRecords.filter((h) => h.batchId === batchId);
    const harvestedWeightKg = harvests.reduce((sum, h) => sum + h.totalWeightKg, 0);

    // Current live biomass
    const currentWeightGrams = batch.currentAvgWeightGrams || (batch.initialSizeCm * 5);
    const liveBiomassKg = (liveStock * currentWeightGrams) / 1000;

    const totalEndingBiomassKg = liveBiomassKg + harvestedWeightKg;
    const biomassGainKg = Math.max(0.1, totalEndingBiomassKg - initialWeightKg);

    if (totalFeedKg <= 0 || biomassGainKg <= 0) {
      return { fcr: null, totalFeedKg, biomassGainKg };
    }

    const fcr = Number((totalFeedKg / biomassGainKg).toFixed(2));
    return { fcr, totalFeedKg, biomassGainKg };
  }

  public getFinancialSummary() {
    let totalExpense = 0;
    let totalIncome = 0;

    for (const tx of this.db.financialTransactions) {
      if (tx.type === 'expense') {
        totalExpense += tx.amount;
      } else if (tx.type === 'income') {
        totalIncome += tx.amount;
      }
    }

    return {
      totalExpense,
      totalIncome,
      balance: totalIncome - totalExpense,
    };
  }

  public getFeedingSchedules(batchId?: string): FeedingSchedule[] {
    if (batchId) {
      return this.db.feedingSchedules.filter((s) => s.batchId === batchId);
    }
    return this.db.feedingSchedules;
  }

  public getFeedingLogs(batchId?: string): FeedingLog[] {
    if (batchId) {
      return this.db.feedingLogs.filter((l) => l.batchId === batchId);
    }
    return this.db.feedingLogs;
  }

  public getMortalityRecords(batchId?: string): MortalityRecord[] {
    if (batchId) {
      return this.db.mortalityRecords.filter((m) => m.batchId === batchId);
    }
    return this.db.mortalityRecords;
  }

  public getHarvestRecords(batchId?: string): HarvestRecord[] {
    if (batchId) {
      return this.db.harvestRecords.filter((h) => h.batchId === batchId);
    }
    return this.db.harvestRecords;
  }

  public getWaterQualityRecords(unitId?: string): WaterQualityRecord[] {
    if (unitId) {
      return this.db.waterQualityRecords.filter((w) => w.unitId === unitId);
    }
    return this.db.waterQualityRecords;
  }

  public getJournals(batchId?: string): CultivationJournal[] {
    if (batchId) {
      return this.db.journals.filter((j) => j.batchId === batchId);
    }
    return this.db.journals;
  }

  public getTransactions(batchId?: string): FinancialTransaction[] {
    if (batchId) {
      return this.db.financialTransactions.filter((t) => t.batchId === batchId);
    }
    return this.db.financialTransactions;
  }

  // --- MUTATIONS ---
  public updateSettings(settings: Partial<AppSettings>) {
    this.db.settings = { ...this.db.settings, ...settings };
    this.saveToStorage(this.db);
  }

  public addUnit(unit: Omit<CultivationUnit, 'id' | 'createdAt'>): CultivationUnit {
    const newUnit: CultivationUnit = {
      ...unit,
      id: `unit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.units.unshift(newUnit);
    this.saveToStorage(this.db);
    return newUnit;
  }

  public updateUnit(id: string, updates: Partial<CultivationUnit>) {
    this.db.units = this.db.units.map((u) => (u.id === id ? { ...u, ...updates } : u));
    this.saveToStorage(this.db);
  }

  public deleteUnit(id: string) {
    this.db.units = this.db.units.filter((u) => u.id !== id);
    this.saveToStorage(this.db);
  }

  public addBatch(batch: Omit<FishBatch, 'id' | 'createdAt'>): FishBatch {
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newBatch: FishBatch = {
      ...batch,
      id: batchId,
      createdAt: new Date().toISOString(),
    };

    // 1. Insert Batch
    this.db.batches.unshift(newBatch);

    // 2. Insert initial stock movement automatically
    const initialMovement: FishStockMovement = {
      id: `sm-init-${Date.now()}`,
      batchId: batchId,
      unitId: batch.unitId,
      movementType: 'INITIAL',
      quantity: batch.initialCount,
      notes: `Penebaran awal ${batch.species} (${batch.initialSizeCm} cm)`,
      createdAt: batch.stockingDate ? `${batch.stockingDate}T08:00:00Z` : new Date().toISOString(),
    };
    this.db.stockMovements.unshift(initialMovement);

    // 3. Insert initial financial transaction for seed cost if provided
    if (batch.seedPriceTotal > 0) {
      const seedTx: FinancialTransaction = {
        id: `tx-seed-${Date.now()}`,
        batchId: batchId,
        unitId: batch.unitId,
        type: 'expense',
        category: 'bibit',
        amount: batch.seedPriceTotal,
        date: batch.stockingDate || new Date().toISOString().split('T')[0],
        description: `Pembelian bibit awal ${batch.species} (${batch.initialCount} ekor)`,
        createdAt: new Date().toISOString(),
      };
      this.db.financialTransactions.unshift(seedTx);
    }

    this.saveToStorage(this.db);
    return newBatch;
  }

  public updateBatch(id: string, updates: Partial<FishBatch>) {
    this.db.batches = this.db.batches.map((b) => (b.id === id ? { ...b, ...updates } : b));
    this.saveToStorage(this.db);
  }

  public addStockMovement(movement: Omit<FishStockMovement, 'id' | 'createdAt'>) {
    const newMovement: FishStockMovement = {
      ...movement,
      id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.stockMovements.unshift(newMovement);
    this.saveToStorage(this.db);
    return newMovement;
  }

  public addFeedingSchedule(schedule: Omit<FeedingSchedule, 'id'>) {
    const newSched: FeedingSchedule = {
      ...schedule,
      id: `sched-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    this.db.feedingSchedules.push(newSched);
    this.saveToStorage(this.db);
    return newSched;
  }

  public updateFeedingSchedule(id: string, updates: Partial<FeedingSchedule>) {
    this.db.feedingSchedules = this.db.feedingSchedules.map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.saveToStorage(this.db);
  }

  public deleteFeedingSchedule(id: string) {
    this.db.feedingSchedules = this.db.feedingSchedules.filter((s) => s.id !== id);
    this.saveToStorage(this.db);
  }

  public addFeedingLog(log: Omit<FeedingLog, 'id' | 'createdAt'>) {
    const newLog: FeedingLog = {
      ...log,
      id: `flog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.feedingLogs.unshift(newLog);
    this.saveToStorage(this.db);
    return newLog;
  }

  public addMortalityRecord(record: Omit<MortalityRecord, 'id' | 'createdAt'>): MortalityRecord {
    const recId = `mort-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newRecord: MortalityRecord = {
      ...record,
      id: recId,
      createdAt: new Date().toISOString(),
    };

    // 1. Add mortality record
    this.db.mortalityRecords.unshift(newRecord);

    // 2. Add atomic stock movement (decrements live stock count)
    const stockMovement: FishStockMovement = {
      id: `sm-mort-${Date.now()}`,
      batchId: record.batchId,
      unitId: record.unitId,
      movementType: 'MORTALITY',
      quantity: record.quantity,
      referenceId: recId,
      notes: `Kematian (${record.suspectedCause}): ${record.notes || '-'}`,
      createdAt: `${record.date}T12:00:00Z`,
    };
    this.db.stockMovements.unshift(stockMovement);

    this.saveToStorage(this.db);
    return newRecord;
  }

  public deleteMortalityRecord(id: string) {
    this.db.mortalityRecords = this.db.mortalityRecords.filter((m) => m.id !== id);
    this.db.stockMovements = this.db.stockMovements.filter((sm) => sm.referenceId !== id);
    this.saveToStorage(this.db);
  }

  public addHarvestRecord(harvest: Omit<HarvestRecord, 'id' | 'createdAt'>): HarvestRecord {
    const harvestId = `hrv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newHarvest: HarvestRecord = {
      ...harvest,
      id: harvestId,
      createdAt: new Date().toISOString(),
    };

    // 1. Add harvest record
    this.db.harvestRecords.unshift(newHarvest);

    // 2. Add atomic stock movement (decrements live stock count for harvest)
    const stockMovement: FishStockMovement = {
      id: `sm-hrv-${Date.now()}`,
      batchId: harvest.batchId,
      unitId: harvest.unitId,
      movementType: 'HARVEST',
      quantity: harvest.quantityCount,
      referenceId: harvestId,
      notes: `Panen: ${harvest.totalWeightKg} kg, ${harvest.quantityCount} ekor`,
      createdAt: `${harvest.harvestDate}T12:00:00Z`,
    };
    this.db.stockMovements.unshift(stockMovement);

    // 3. If revenue was recorded, add income transaction automatically
    if (harvest.revenueTotal && harvest.revenueTotal > 0) {
      const incomeTx: FinancialTransaction = {
        id: `tx-hrv-${Date.now()}`,
        batchId: harvest.batchId,
        unitId: harvest.unitId,
        type: 'income',
        category: 'penjualan_hasil_panen',
        amount: harvest.revenueTotal,
        date: harvest.harvestDate,
        description: `Penjualan panen ${harvest.totalWeightKg} kg (${harvest.quantityCount} ekor) - ${harvest.buyerName || 'Pembeli umum'}`,
        createdAt: new Date().toISOString(),
      };
      this.db.financialTransactions.unshift(incomeTx);
    }

    // Check if batch is completely harvested
    const remaining = this.getLiveStockCount(harvest.batchId);
    if (remaining <= 0) {
      this.updateBatch(harvest.batchId, { status: 'harvested' });
    }

    this.saveToStorage(this.db);
    return newHarvest;
  }

  public addTransaction(tx: Omit<FinancialTransaction, 'id' | 'createdAt'>) {
    const newTx: FinancialTransaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.financialTransactions.unshift(newTx);
    this.saveToStorage(this.db);
    return newTx;
  }

  public deleteTransaction(id: string) {
    this.db.financialTransactions = this.db.financialTransactions.filter((t) => t.id !== id);
    this.saveToStorage(this.db);
  }

  public addWaterQualityRecord(rec: Omit<WaterQualityRecord, 'id' | 'createdAt'>) {
    const newRec: WaterQualityRecord = {
      ...rec,
      id: `wq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.waterQualityRecords.unshift(newRec);
    this.saveToStorage(this.db);
    return newRec;
  }

  public addJournal(journal: Omit<CultivationJournal, 'id' | 'createdAt'>) {
    const newJournal: CultivationJournal = {
      ...journal,
      id: `jrn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.journals.unshift(newJournal);
    this.saveToStorage(this.db);
    return newJournal;
  }

  public deleteJournal(id: string) {
    this.db.journals = this.db.journals.filter((j) => j.id !== id);
    this.saveToStorage(this.db);
  }

  // --- BACKUP & CLOUDFLARE D1 SQL GENERATION ---
  public exportJSON(): string {
    return JSON.stringify(this.db, null, 2);
  }

  public importJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.units || !parsed.batches) {
        throw new Error('Invalid Mitra Tumbuh schema format');
      }
      this.db = parsed;
      this.saveToStorage(this.db);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  public resetToSampleData() {
    this.db = getInitialSeedData();
    this.saveToStorage(this.db);
  }

  public clearAllData() {
    this.db = {
      settings: {
        farmName: 'Usaha Budidaya Saya',
        ownerName: 'Pembudidaya',
        currency: 'IDR',
        hasCompletedOnboarding: false,
        selectedFishPresets: [],
      },
      units: [],
      batches: [],
      stockMovements: [],
      feedingSchedules: [],
      feedingLogs: [],
      mortalityRecords: [],
      harvestRecords: [],
      financialTransactions: [],
      waterQualityRecords: [],
      journals: [],
    };
    this.saveToStorage(this.db);
  }

  /**
   * Generates a complete Cloudflare D1 SQL Script containing both
   * DDL table definitions and INSERT INTO statements from the current database state.
   */
  public generateCloudflareD1SQL(): string {
    const escapeSQL = (val: any) => {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val.toString();
      if (typeof val === 'boolean') return val ? '1' : '0';
      return `'${String(val).replace(/'/g, "''")}'`;
    };

    let sql = `-- ========================================================
-- MITRA TUMBUH: Aquaculture Management System
-- Cloudflare D1 (SQLite) Schema & Data Seed Migration
-- Generated at: ${new Date().toISOString()}
-- ========================================================

-- Enable Foreign Key constraints
PRAGMA foreign_keys = ON;

-- 1. Cultivation Units Table
CREATE TABLE IF NOT EXISTS cultivation_units (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
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
  status TEXT NOT NULL DEFAULT 'active',
  target_harvest_date TEXT,
  target_weight_grams REAL,
  current_avg_weight_grams REAL,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- 3. Fish Stock Movements Table (Event Ledger)
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
  status TEXT NOT NULL,
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
  type TEXT NOT NULL, -- expense / income
  category TEXT NOT NULL,
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

-- ========================================================
-- DATA SEED (INSERT STATEMENTS)
-- ========================================================
`;

    // 1. Units
    if (this.db.units.length > 0) {
      sql += '\n-- Units Insert\n';
      for (const u of this.db.units) {
        sql += `INSERT OR REPLACE INTO cultivation_units (id, name, type, volume_liters, location, status, description, created_at) VALUES (${escapeSQL(u.id)}, ${escapeSQL(u.name)}, ${escapeSQL(u.type)}, ${u.volumeLiters}, ${escapeSQL(u.location)}, ${escapeSQL(u.status)}, ${escapeSQL(u.description)}, ${escapeSQL(u.createdAt)});\n`;
      }
    }

    // 2. Batches
    if (this.db.batches.length > 0) {
      sql += '\n-- Batches Insert\n';
      for (const b of this.db.batches) {
        sql += `INSERT OR REPLACE INTO fish_batches (id, unit_id, species, batch_name, initial_count, initial_size_cm, seed_price_total, stocking_date, status, target_harvest_date, target_weight_grams, current_avg_weight_grams, notes, created_at) VALUES (${escapeSQL(b.id)}, ${escapeSQL(b.unitId)}, ${escapeSQL(b.species)}, ${escapeSQL(b.batchName)}, ${b.initialCount}, ${b.initialSizeCm}, ${b.seedPriceTotal}, ${escapeSQL(b.stockingDate)}, ${escapeSQL(b.status)}, ${escapeSQL(b.targetHarvestDate)}, ${b.targetWeightGrams || 'NULL'}, ${b.currentAvgWeightGrams || 'NULL'}, ${escapeSQL(b.notes)}, ${escapeSQL(b.createdAt)});\n`;
      }
    }

    // 3. Stock Movements
    if (this.db.stockMovements.length > 0) {
      sql += '\n-- Stock Movements Insert\n';
      for (const sm of this.db.stockMovements) {
        sql += `INSERT OR REPLACE INTO fish_stock_movements (id, batch_id, unit_id, movement_type, quantity, reference_id, notes, created_at) VALUES (${escapeSQL(sm.id)}, ${escapeSQL(sm.batchId)}, ${escapeSQL(sm.unitId)}, ${escapeSQL(sm.movementType)}, ${sm.quantity}, ${escapeSQL(sm.referenceId)}, ${escapeSQL(sm.notes)}, ${escapeSQL(sm.createdAt)});\n`;
      }
    }

    // 4. Feeding Schedules
    if (this.db.feedingSchedules.length > 0) {
      sql += '\n-- Feeding Schedules Insert\n';
      for (const s of this.db.feedingSchedules) {
        sql += `INSERT OR REPLACE INTO feeding_schedules (id, unit_id, batch_id, time_of_day, feed_type, amount_grams, is_active, notes) VALUES (${escapeSQL(s.id)}, ${escapeSQL(s.unitId)}, ${escapeSQL(s.batchId)}, ${escapeSQL(s.timeOfDay)}, ${escapeSQL(s.feedType)}, ${s.amountGrams}, ${s.isActive ? 1 : 0}, ${escapeSQL(s.notes)});\n`;
      }
    }

    // 5. Feeding Logs
    if (this.db.feedingLogs.length > 0) {
      sql += '\n-- Feeding Logs Insert\n';
      for (const fl of this.db.feedingLogs) {
        sql += `INSERT OR REPLACE INTO feeding_logs (id, schedule_id, batch_id, unit_id, feed_date, feed_time, feed_brand, amount_grams, status, notes, created_at) VALUES (${escapeSQL(fl.id)}, ${escapeSQL(fl.scheduleId)}, ${escapeSQL(fl.batchId)}, ${escapeSQL(fl.unitId)}, ${escapeSQL(fl.feedDate)}, ${escapeSQL(fl.feedTime)}, ${escapeSQL(fl.feedBrand)}, ${fl.amountGrams}, ${escapeSQL(fl.status)}, ${escapeSQL(fl.notes)}, ${escapeSQL(fl.createdAt)});\n`;
      }
    }

    // 6. Mortality Records
    if (this.db.mortalityRecords.length > 0) {
      sql += '\n-- Mortality Records Insert\n';
      for (const m of this.db.mortalityRecords) {
        sql += `INSERT OR REPLACE INTO mortality_records (id, batch_id, unit_id, date, quantity, suspected_cause, notes, created_at) VALUES (${escapeSQL(m.id)}, ${escapeSQL(m.batchId)}, ${escapeSQL(m.unitId)}, ${escapeSQL(m.date)}, ${m.quantity}, ${escapeSQL(m.suspectedCause)}, ${escapeSQL(m.notes)}, ${escapeSQL(m.createdAt)});\n`;
      }
    }

    // 7. Harvest Records
    if (this.db.harvestRecords.length > 0) {
      sql += '\n-- Harvest Records Insert\n';
      for (const h of this.db.harvestRecords) {
        sql += `INSERT OR REPLACE INTO harvest_records (id, batch_id, unit_id, harvest_date, quantity_count, total_weight_kg, average_size_cm, selling_price_per_kg, revenue_total, buyer_name, notes, created_at) VALUES (${escapeSQL(h.id)}, ${escapeSQL(h.batchId)}, ${escapeSQL(h.unitId)}, ${escapeSQL(h.harvestDate)}, ${h.quantityCount}, ${h.totalWeightKg}, ${h.averageSizeCm || 'NULL'}, ${h.sellingPricePerKg || 'NULL'}, ${h.revenueTotal || 'NULL'}, ${escapeSQL(h.buyerName)}, ${escapeSQL(h.notes)}, ${escapeSQL(h.createdAt)});\n`;
      }
    }

    // 8. Financial Transactions
    if (this.db.financialTransactions.length > 0) {
      sql += '\n-- Financial Transactions Insert\n';
      for (const tx of this.db.financialTransactions) {
        sql += `INSERT OR REPLACE INTO financial_transactions (id, batch_id, unit_id, type, category, amount, date, description, created_at) VALUES (${escapeSQL(tx.id)}, ${escapeSQL(tx.batchId)}, ${escapeSQL(tx.unitId)}, ${escapeSQL(tx.type)}, ${escapeSQL(tx.category)}, ${tx.amount}, ${escapeSQL(tx.date)}, ${escapeSQL(tx.description)}, ${escapeSQL(tx.createdAt)});\n`;
      }
    }

    // 9. Water Quality Records
    if (this.db.waterQualityRecords.length > 0) {
      sql += '\n-- Water Quality Insert\n';
      for (const w of this.db.waterQualityRecords) {
        sql += `INSERT OR REPLACE INTO water_quality_records (id, unit_id, batch_id, recorded_at, temperature_c, ph_level, water_color, water_clarity, water_odor, water_change_percent, notes, created_at) VALUES (${escapeSQL(w.id)}, ${escapeSQL(w.unitId)}, ${escapeSQL(w.batchId)}, ${escapeSQL(w.recordedAt)}, ${w.temperatureC}, ${w.phLevel}, ${escapeSQL(w.waterColor)}, ${escapeSQL(w.waterClarity)}, ${escapeSQL(w.waterOdor)}, ${w.waterChangePercent}, ${escapeSQL(w.notes)}, ${escapeSQL(w.createdAt)});\n`;
      }
    }

    // 10. Cultivation Journals
    if (this.db.journals.length > 0) {
      sql += '\n-- Cultivation Journals Insert\n';
      for (const j of this.db.journals) {
        sql += `INSERT OR REPLACE INTO cultivation_journals (id, batch_id, unit_id, entry_date, activity_type, fish_behavior, weather_condition, notes, created_at) VALUES (${escapeSQL(j.id)}, ${escapeSQL(j.batchId)}, ${escapeSQL(j.unitId)}, ${escapeSQL(j.entryDate)}, ${escapeSQL(j.activityType)}, ${escapeSQL(j.fishBehavior)}, ${escapeSQL(j.weatherCondition)}, ${escapeSQL(j.notes)}, ${escapeSQL(j.createdAt)});\n`;
      }
    }

    return sql;
  }
}

export const storage = new StorageService();
