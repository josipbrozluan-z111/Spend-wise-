import React, { useState } from 'react';
import type { Settings, Currency } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface SettingsModalProps {
  onClose: () => void;
  currentSettings: Settings;
  onSave: (settings: Settings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, currentSettings, onSave }) => {
  const [currency, setCurrency] = useState<Currency>(currentSettings.currency);
  const [weeklyLimit, setWeeklyLimit] = useState(currentSettings.weeklyLimit.toString());
  const [monthlyLimit, setMonthlyLimit] = useState(currentSettings.monthlyLimit.toString());
  const [weeklyLimitNote, setWeeklyLimitNote] = useState(currentSettings.weeklyLimitNote || '');
  const [monthlyLimitNote, setMonthlyLimitNote] = useState(currentSettings.monthlyLimitNote || '');
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const weekly = parseFloat(weeklyLimit);
    const monthly = parseFloat(monthlyLimit);

    if (isNaN(weekly) || isNaN(monthly) || weekly < 0 || monthly < 0) {
      setError('Please enter valid, non-negative limits.');
      return;
    }

    onSave({
      currency,
      weeklyLimit: weekly,
      monthlyLimit: monthly,
      weeklyLimitNote,
      monthlyLimitNote,
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="p-6 relative">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h2>
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" aria-label="Close">
            <CloseIcon className="h-6 w-6" />
          </button>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Display Currency</label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
              >
                <option value="EUR">Euro (€)</option>
                <option value="VND">Vietnamese Dong (₫)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="weeklyLimit" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Weekly Spending Limit ({currency})
              </label>
              <input
                type="number"
                id="weeklyLimit"
                value={weeklyLimit}
                onChange={(e) => setWeeklyLimit(e.target.value)}
                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., 500"
                step="1"
              />
               <textarea
                id="weeklyLimitNote"
                value={weeklyLimitNote}
                onChange={(e) => setWeeklyLimitNote(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Add a note (e.g., Groceries & gas)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="monthlyLimit" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Monthly Spending Limit ({currency})
              </label>
              <input
                type="number"
                id="monthlyLimit"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., 2000"
                step="1"
              />
               <textarea
                id="monthlyLimitNote"
                value={monthlyLimitNote}
                onChange={(e) => setMonthlyLimitNote(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Add a note (e.g., All monthly expenses)"
                rows={2}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <div className="pt-2">
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-all">
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;