'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/format';
import { BarChart3, TrendingUp, Package, Users, Download, Filter, Calendar } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';

const monthlySales = [
  { month: 'Jan', sales: 1200000, purchases: 820000, profit: 380000, orders: 45 },
  { month: 'Feb', sales: 1850000, purchases: 1100000, profit: 750000, orders: 68 },
  { month: 'Mar', sales: 2100000, purchases: 1350000, profit: 750000, orders: 72 },
  { month: 'Apr', sales: 2450000, purchases: 1580000, profit: 870000, orders: 89 },
  { month: 'May', sales: 3250000, purchases: 2100000, profit: 1150000, orders: 112 },
  { month: 'Jun', sales: 2680000, purchases: 1750000, profit: 930000, orders: 95 },
];

const categoryRevenue = [
  { name: 'Tiles & Ceramics', revenue: 2400000, color: '#3b82f6' },
  { name: 'Sanitary Ware', revenue: 1715000, color: '#10b981' },
  { name: 'Electrical', revenue: 1030000, color: '#f59e0b' },
  { name: 'Paints', revenue: 685000, color: '#8b5cf6' },
  { name: 'Hardware', revenue: 548000, color: '#ef4444' },
  { name: 'Others', revenue: 480000, color: '#6b7280' },
];

const topProducts = [
  { name: 'RAK Floor Tiles 60x60', sales: 120, revenue: 420000 },
  { name: 'LED Panel Light 18W', sales: 98, revenue: 53900 },
  { name: 'Berger Plastic Emulsion', sales: 75, revenue: 180000 },
  { name: 'TOTO WC Suite', sales: 34, revenue: 408000 },
  { name: 'Crown Cement 50kg', sales: 280, revenue: 162400 },
];

type ReportTab = 'overview' | 'sales' | 'inventory' | 'customers' | 'pl';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [period, setPeriod] = useState('this_month');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'pl', label: 'P&L', icon: BarChart3 },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Business intelligence and performance reports</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none">
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
          </select>
          <button className="flex items-center gap-2 border border-border px-4 py-2 rounded-lg text-sm hover:bg-muted transition">
            <Download className="w-4 h-4" />Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ReportTab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(6850000), change: '+18.3%', positive: true },
          { label: 'Total Purchases', value: formatCurrency(4100000), change: '+12.1%', positive: false },
          { label: 'Gross Profit', value: formatCurrency(2750000), change: '+24.5%', positive: true },
          { label: 'Net Profit', value: formatCurrency(1890000), change: '+31.2%', positive: true },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
            <p className={`text-xs font-medium mt-0.5 ${s.positive ? 'text-green-600' : 'text-red-500'}`}>{s.change} vs last month</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales vs Purchases vs Profit */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Sales vs Purchases vs Profit</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySales} barSize={14} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/100000).toFixed(0)}L`} />
              <Tooltip formatter={(v: number) => [`৳${v.toLocaleString('en-IN')}`, '']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="sales" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Sales" />
              <Bar dataKey="purchases" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Purchases" />
              <Bar dataKey="profit" fill="#10b981" radius={[3, 3, 0, 0]} name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Category */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue by Category</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={categoryRevenue} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="revenue">
                  {categoryRevenue.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [formatCurrency(v), '']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryRevenue.map(cat => (
                <div key={cat.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} /><span className="text-[11px] text-muted-foreground truncate">{cat.name}</span></div>
                  <span className="text-[11px] font-semibold text-foreground shrink-0">{formatCurrency(cat.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="table-wrapper">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Top Selling Products</h3>
          <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"><Download className="w-3 h-3" />Export CSV</button>
        </div>
        <table className="w-full">
          <thead><tr className="bg-muted/40 border-b border-border">
            {['#','Product','Units Sold','Revenue','Margin'].map(h => <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {topProducts.map((p, i) => (
              <tr key={p.name} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3 text-sm font-semibold text-foreground">{p.name}</td>
                <td className="px-4 py-3 text-sm text-foreground">{p.sales}</td>
                <td className="px-4 py-3 text-sm font-semibold text-foreground">{formatCurrency(p.revenue)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full max-w-[80px]"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.random() * 60 + 20}%` }} /></div>
                    <span className="text-xs text-muted-foreground">{(Math.random() * 30 + 15).toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
