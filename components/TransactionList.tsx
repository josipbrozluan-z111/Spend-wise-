
import React from 'react';
import type { Transaction, Currency } from '../types';
import { formatCurrency } from '../utils/helpers';

interface TransactionListProps {
  transactions: Transaction[];
  deleteTransaction: (id: string) => void;
  currency: Currency;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, deleteTransaction, currency }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg text-center">
        <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">No Transactions Yet</h2>
        <p className="text-slate-500 dark:text-slate-400">Click the "Add" button to record your first expense.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Recent Transactions</h2>
      <div className="space-y-3">
        {transactions.map(t => (
          <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">{t.description}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {new Date(t.date).toLocaleDateString()} - <span className="font-mono bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded text-xs">{t.category}</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <p className="font-semibold text-lg text-slate-900 dark:text-white">{formatCurrency(t.amount, currency)}</p>
              <button
                onClick={() => deleteTransaction(t.id)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded-full transition"
                aria-label={`Delete transaction ${t.description}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
