'use client';

import { formatCurrency } from '@/lib/format';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function PLPage() {
  const revenue = { sales: 6850000, service: 350000, other: 50000 };
  const cogs = { purchases: 4100000, freight: 120000 };
  const expenses = { salaries: 280000, rent: 60000, utilities: 25000, marketing: 45000, transport: 38000 };

  const totalRevenue = Object.values(revenue).reduce((a, b) => a + b, 0);
  const totalCOGS = Object.values(cogs).reduce((a, b) => a + b, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const netProfit = grossProfit - totalExpenses;
  const grossMargin = ((grossProfit / totalRevenue) * 100).toFixed(1);
  const netMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div><h1 className="text-2xl font-bold">Profit & Loss Statement</h1><p className="text-muted-foreground text-sm mt-0.5">Current month financial summary</p></div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-blue-600 bg-blue-50' },
          { label: 'Gross Profit', value: formatCurrency(grossProfit), sub: `${grossMargin}% margin`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Net Profit', value: formatCurrency(netProfit), sub: `${netMargin}% margin`, icon: TrendingDown, color: netProfit > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50' },
        ].map(s => (
          <div key={s.label} className="stat-card text-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${s.color}`}><s.icon className="w-5 h-5" /></div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            {'sub' in s && s.sub && <p className="text-xs text-green-600 font-medium mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Revenue Section */}
        <div className="px-6 py-3 bg-green-50 border-b border-border">
          <h3 className="text-sm font-bold text-green-700">Revenue</h3>
        </div>
        {Object.entries(revenue).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between px-6 py-3 border-b border-border hover:bg-muted/20">
            <span className="text-sm text-foreground capitalize">{key.replace('_', ' ')}</span>
            <span className="text-sm font-semibold text-green-600">{formatCurrency(val)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-6 py-3 bg-green-50 border-b border-border font-bold">
          <span className="text-sm">Total Revenue</span>
          <span className="text-sm text-green-700">{formatCurrency(totalRevenue)}</span>
        </div>

        {/* COGS */}
        <div className="px-6 py-3 bg-orange-50 border-b border-border">
          <h3 className="text-sm font-bold text-orange-700">Cost of Goods Sold</h3>
        </div>
        {Object.entries(cogs).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between px-6 py-3 border-b border-border hover:bg-muted/20">
            <span className="text-sm text-foreground capitalize">{key.replace('_', ' ')}</span>
            <span className="text-sm font-semibold text-red-600">({formatCurrency(val)})</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-6 py-3 bg-blue-50 border-b border-border font-bold">
          <span className="text-sm">Gross Profit ({grossMargin}%)</span>
          <span className="text-sm text-blue-700">{formatCurrency(grossProfit)}</span>
        </div>

        {/* Expenses */}
        <div className="px-6 py-3 bg-red-50 border-b border-border">
          <h3 className="text-sm font-bold text-red-700">Operating Expenses</h3>
        </div>
        {Object.entries(expenses).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between px-6 py-3 border-b border-border hover:bg-muted/20">
            <span className="text-sm text-foreground capitalize">{key.replace('_', ' ')}</span>
            <span className="text-sm font-semibold text-red-600">({formatCurrency(val)})</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 font-bold">
          <span className="text-white">Net Profit ({netMargin}%)</span>
          <span className={`text-lg ${netProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(netProfit)}</span>
        </div>
      </div>
    </div>
  );
}
