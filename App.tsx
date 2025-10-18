import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Transaction, Settings, Currency, Period } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getExchangeRate } from './services/currencyService';
import Dashboard from './components/Dashboard';
import AddTransactionModal from './components/AddTransactionModal';
import SettingsModal from './components/SettingsModal';
import { PlusIcon } from './components/icons/PlusIcon';
import { SettingsIcon } from './components/icons/SettingsIcon';
import TransactionList from './components/TransactionList';
import NoteBoard from './components/NoteBoard';

const App: React.FC = () => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [settings, setSettings] = useLocalStorage<Settings>('settings', {
    currency: 'EUR',
    weeklyLimit: 500,
    monthlyLimit: 2000,
    weeklyLimitNote: '',
    monthlyLimitNote: '',
  });
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isNoteBoardVisible, setNoteBoardVisible] = useLocalStorage('isNoteBoardVisible', true);

  const fetchRate = useCallback(async () => {
    const rate = await getExchangeRate('EUR', 'VND');
    setExchangeRate(rate);
  }, []);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = { ...transaction, id: Date.now().toString() };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };
  
  // FIX: Add explicit type `Transaction[]` to `convertedTransactions` to help TypeScript
  // correctly infer the type of the array returned by `useMemo`, preventing the `currency`
  // property from being widened to `string`.
  const convertedTransactions: Transaction[] = useMemo(() => {
    if (settings.currency === 'EUR') {
      return transactions.map(t =>
        t.currency === 'VND'
          ? { ...t, amount: t.amount / exchangeRate, currency: 'EUR' }
          : t
      );
    } else {
      return transactions.map(t =>
        t.currency === 'EUR'
          ? { ...t, amount: t.amount * exchangeRate, currency: 'VND' }
          : t
      );
    }
  }, [transactions, settings.currency, exchangeRate]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <header className="bg-white dark:bg-slate-800 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            SpendWise
          </h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-3 sm:px-4 rounded-lg shadow-sm transition-transform transform hover:scale-105"
              aria-label="Add Transaction"
            >
              <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="hidden sm:inline ml-2">Add</span>
            </button>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="flex items-center justify-center bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-3 sm:px-4 rounded-lg shadow-sm transition-transform transform hover:scale-105"
              aria-label="Settings"
            >
              <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {isNoteBoardVisible && <NoteBoard onDismiss={() => setNoteBoardVisible(false)} />}
        <Dashboard
          transactions={convertedTransactions}
          settings={settings}
        />
        <TransactionList transactions={convertedTransactions} deleteTransaction={deleteTransaction} currency={settings.currency} />
      </main>
      
      {isAddModalOpen && (
        <AddTransactionModal
          onClose={() => setAddModalOpen(false)}
          onAddTransaction={addTransaction}
          baseCurrency={settings.currency}
          exchangeRate={exchangeRate}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setSettingsModalOpen(false)}
          currentSettings={settings}
          onSave={updateSettings}
        />
      )}
    </div>
  );
};

export default App;