'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import { Calculator, TrendingUp, TrendingDown, DollarSign, CreditCard, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Account } from '@/lib/types';

const incomeExpenseData = [
  { month: 'Jan', income: 1200000, expense: 820000 },
  { month: 'Feb', income: 1850000, expense: 1100000 },
  { month: 'Mar', income: 2100000, expense: 1350000 },
  { month: 'Apr', income: 2450000, expense: 1580000 },
  { month: 'May', income: 3250000, expense: 2100000 },
  { month: 'Jun', income: 2680000, expense: 1750000 },
];

export default function AccountingPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('accounts').select('*').eq('is_active', true).order('code');
    setAccounts(data || []);
    setLoading(false);
  }

  const assets = accounts.filter(a => a.account_type === 'asset');
  const liabilities = accounts.filter(a => a.account_type === 'liability');
  const revenue = accounts.filter(a => a.account_type === 'revenue');
  const expenses = accounts.filter(a => a.account_type === 'expense');

  const totalAssets = assets.reduce((s, a) => s + a.balance, 0) || 24725000;
  const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0) || 780000;
  const totalRevenue = 6850000;
  const totalExpenses = 4120000;
  const netProfit = totalRevenue - totalExpenses;

  const typeColors: Record<string, string> = {
    asset: 'text-blue-600 bg-blue-50',
    liability: 'text-red-600 bg-red-50',
    equity: 'text-purple-600 bg-purple-50',
    revenue: 'text-green-600 bg-green-50',
    expense: 'text-orange-600 bg-orange-50',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accounting</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Financial overview and double-entry accounting</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="border border-border px-4 py-2 rounded-lg text-sm hover:bg-muted transition">Journal Entry</button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">New Transaction</button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: formatCurrency(totalAssets), icon: DollarSign, color: 'text-blue-500 bg-blue-50', trend: '+12.4%' },
          { label: 'Total Liabilities', value: formatCurrency(totalLiabilities), icon: CreditCard, color: 'text-red-500 bg-red-50', trend: '-5.2%' },
          { label: 'Monthly Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-green-500 bg-green-50', trend: '+18.3%' },
          { label: 'Net Profit', value: formatCurrency(netProfit), icon: BarChart3, color: 'text-purple-500 bg-purple-50', trend: '+24.1%' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${s.color}`}><s.icon className="w-4.5 h-4.5" /></div>
              <span className="text-xs font-medium text-green-600">{s.trend}</span>
            </div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Income vs Expense Chart */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Income vs Expenses</h3>
          <select className="text-xs border border-border rounded-lg px-2.5 py-1.5 focus:outline-none">
            <option>Last 6 Months</option>
            <option>This Year</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={incomeExpenseData} barSize={20} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/100000).toFixed(0)}L`} />
            <Tooltip formatter={(v: number) => [`৳${v.toLocaleString('en-IN')}`, '']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart of Accounts */}
      <div className="table-wrapper">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Chart of Accounts</h3>
          <button className="text-xs text-blue-600 hover:underline">Add Account</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Code</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Account Name</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Type</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? Array.from({length: 8}).map((_, i) => (
                <tr key={i}>{Array.from({length: 4}).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
              )) : accounts.map(a => (
                <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{a.code}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{a.name}</span>
                      {a.is_cash && <span className="badge-status bg-green-50 text-green-600">Cash</span>}
                      {a.is_bank && <span className="badge-status bg-blue-50 text-blue-600">Bank</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge-status ${typeColors[a.account_type] || 'bg-gray-100 text-gray-600'} capitalize`}>{a.account_type}</span>
                  </td>
                  <td className={`px-4 py-3 text-right text-sm font-bold ${a.account_type === 'expense' || a.account_type === 'liability' ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(a.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
