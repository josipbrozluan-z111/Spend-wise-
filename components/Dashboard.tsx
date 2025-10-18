import React, { useMemo } from 'react';
import type { Transaction, Settings, Currency } from '../types';
import { getStartOfWeek, getStartOfMonth, formatCurrency } from '../utils/helpers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  settings: Settings;
}

const SpendingProgress: React.FC<{ title: string; spent: number; limit: number; currency: Currency; note?: string }> = ({ title, spent, limit, currency, note }) => {
    const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
    const isOverLimit = spent > limit;
  
    const progressBarColor = isOverLimit ? 'bg-red-500' : 'bg-emerald-500';
  
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col">
        <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-2">{title}</h3>
        <div className="flex justify-between items-baseline mb-3">
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(spent, currency)}
          </p>
          <p className="text-md text-slate-500 dark:text-slate-400">
            / {formatCurrency(limit, currency)}
          </p>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${progressBarColor}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        {isOverLimit ? (
            <p className="text-red-500 text-sm mt-2 font-medium">You are over your limit!</p>
        ) : note ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 italic">Note: {note}</p>
        ) : null}
      </div>
    );
};
  
const Dashboard: React.FC<DashboardProps> = ({ transactions, settings }) => {
  const { weeklySpending, monthlySpending } = useMemo(() => {
    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    const startOfMonth = getStartOfMonth(now);

    const weekly = transactions
      .filter(t => new Date(t.date) >= startOfWeek)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthly = transactions
      .filter(t => new Date(t.date) >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    return { weeklySpending: weekly, monthlySpending: monthly };
  }, [transactions]);
  
  const chartData = [
    { name: 'Week', Spent: weeklySpending, Limit: settings.weeklyLimit },
    { name: 'Month', Spent: monthlySpending, Limit: settings.monthlyLimit },
  ];

  const yAxisFormatter = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  };
  
  const tooltipFormatter = (value: number) => {
    return formatCurrency(value, settings.currency);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <SpendingProgress
          title="This Week's Spending"
          spent={weeklySpending}
          limit={settings.weeklyLimit}
          currency={settings.currency}
          note={settings.weeklyLimitNote}
        />
        <SpendingProgress
          title="This Month's Spending"
          spent={monthlySpending}
          limit={settings.monthlyLimit}
          currency={settings.currency}
          note={settings.monthlyLimitNote}
        />
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-4">
          Spending vs. Limits Overview
        </h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
              <XAxis dataKey="name" stroke="rgba(100, 116, 139, 0.8)" />
              <YAxis stroke="rgba(100, 116, 139, 0.8)" tickFormatter={yAxisFormatter} />
              <Tooltip
                formatter={tooltipFormatter}
                cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  borderColor: 'rgba(100, 116, 139, 0.5)',
                  borderRadius: '0.75rem',
                }}
              />
              <Legend />
              <Bar dataKey="Spent" fill="#10b981" />
              <Bar dataKey="Limit" fill="#475569" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;