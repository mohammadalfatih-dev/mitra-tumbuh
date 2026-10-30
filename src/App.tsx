/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { OnboardingModal } from './components/OnboardingModal';
import { QuickLogModal } from './components/QuickLogModal';
import { storage } from './services/storage';

// Views
import { DashboardView } from './views/DashboardView';
import { BatchesView } from './views/BatchesView';
import { UnitsView } from './views/UnitsView';
import { FeedingView } from './views/FeedingView';
import { MortalityView } from './views/MortalityView';
import { FinanceView } from './views/FinanceView';
import { WaterQualityView } from './views/WaterQualityView';
import { JournalView } from './views/JournalView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [, setTick] = useState(0);

  // Subscribe to storage changes for reactive re-renders
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  // Check onboarding on mount
  useEffect(() => {
    const settings = storage.getSettings();
    if (!settings.hasCompletedOnboarding) {
      setIsOnboardingOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Sticky Top Bar Contract */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenQuickLog={() => setIsQuickLogOpen(true)}
        selectedBatchId={selectedBatchId}
        onSelectBatchId={setSelectedBatchId}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar (10 Nav Modules) */}
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentView}
              onOpenQuickLog={() => setIsQuickLogOpen(true)}
              selectedBatchId={selectedBatchId}
            />
          )}

          {currentView === 'batches' && (
            <BatchesView onNavigate={setCurrentView} />
          )}

          {currentView === 'units' && (
            <UnitsView onNavigate={setCurrentView} />
          )}

          {currentView === 'feeding' && (
            <FeedingView onNavigate={setCurrentView} />
          )}

          {currentView === 'mortality' && (
            <MortalityView onNavigate={setCurrentView} />
          )}

          {currentView === 'finance' && (
            <FinanceView onNavigate={setCurrentView} />
          )}

          {currentView === 'water' && (
            <WaterQualityView onNavigate={setCurrentView} />
          )}

          {currentView === 'journal' && (
            <JournalView onNavigate={setCurrentView} />
          )}

          {currentView === 'reports' && (
            <ReportsView onNavigate={setCurrentView} />
          )}

          {currentView === 'settings' && (
            <SettingsView
              onNavigate={setCurrentView}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentView={currentView} onNavigate={setCurrentView} />

      {/* Quick Action Modal */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        defaultBatchId={selectedBatchId}
      />

      {/* Onboarding Setup Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
