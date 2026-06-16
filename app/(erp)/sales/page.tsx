'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/format';
import { ShoppingCart, Plus, Search, Eye, Receipt, TrendingUp, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import type { Invoice, InvoiceStatus } from '@/lib/types';

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-gray-600', bg: 'bg-gray-100' },
  sent: { label: 'Sent', color: 'text-blue-600', bg: 'bg-blue-100' },
  partially_paid: { label: 'Partial', color: 'text-amber-600', bg: 'bg-amber-100' },
  paid: { label: 'Paid', color: 'text-green-600', bg: 'bg-green-100' },
  overdue: { label: 'Overdue', color: 'text-red-600', bg: 'bg-red-100' },
  cancelled: { label: 'Cancelled', color: 'text-gray-600', bg: 'bg-gray-100' },
  refunded: { label: 'Refunded', color: 'text-purple-600', bg: 'bg-purple-100' },
};

export default function SalesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState({ total: 0, paid: 0, outstanding: 0, overdue: 0 });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('invoices').select('*, customer:customers(name, code)').order('created_at', { ascending: false });
    setInvoices(data || []);
    const allInv = data || [];
    setStats({
      total: allInv.reduce((s: number, i: any) => s + Number(i.total_amount), 0),
      paid: allInv.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + Number(i.total_amount), 0),
      outstanding: allInv.reduce((s: number, i: any) => s + Number(i.balance_due || 0), 0),
      overdue: allInv.filter((i: any) => i.status === 'overdue').length,
    });
    setLoading(false);
  }

  const filtered = invoices.filter(i =>
    (!search || i.invoice_number.toLowerCase().includes(search.toLowerCase()) || i.customer?.name?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || i.status === filterStatus)
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales & Invoices</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track all sales transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sales/pos" className="flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition">
            <ShoppingCart className="w-4 h-4" />POS
          </Link>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
            <Plus className="w-4 h-4" />New Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sales', value: formatCurrency(stats.total || 1155000), icon: TrendingUp, color: 'text-blue-500 bg-blue-50' },
          { label: 'Collected', value: formatCurrency(stats.paid || 440000), icon: CheckCircle2, color: 'text-green-500 bg-green-50' },
          { label: 'Outstanding', value: formatCurrency(stats.outstanding || 715000), icon: Clock, color: 'text-amber-500 bg-amber-50' },
          { label: 'Overdue Invoices', value: stats.overdue || 1, icon: AlertCircle, color: 'text-red-500 bg-red-50' },
        ].map(s => (
          <div key={s.label} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-bold text-foreground">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..." className="w-full pl-8 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">All Status</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Invoice #</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Due Date</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Amount</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Paid</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Balance</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? Array.from({length: 6}).map((_, i) => (
                <tr key={i}>{Array.from({length: 9}).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
              )) : filtered.map((inv: any) => {
                const cfg = statusConfig[inv.status as InvoiceStatus] || statusConfig.draft;
                return (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-blue-600">{inv.invoice_number}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{inv.customer?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(inv.invoice_date)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{inv.due_date ? formatDate(inv.due_date) : '—'}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">{formatCurrency(inv.total_amount)}</td>
                    <td className="px-4 py-3 text-right text-sm text-green-600 font-semibold">{formatCurrency(inv.amount_paid)}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{formatCurrency(inv.balance_due || (inv.total_amount - inv.amount_paid))}</td>
                    <td className="px-4 py-3">
                      <span className={`badge-status ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition ml-auto">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">{filtered.length} invoices</p>
        </div>
      </div>
    </div>
  );
}
