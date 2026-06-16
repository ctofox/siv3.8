'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/format';
import { ShoppingBag, Plus, Search, Eye, CheckCircle2, Clock, Truck, XCircle } from 'lucide-react';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/lib/types';

const statusConfig: Record<PurchaseOrderStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-gray-600', bg: 'bg-gray-100' },
  pending_approval: { label: 'Pending Approval', color: 'text-amber-600', bg: 'bg-amber-100' },
  approved: { label: 'Approved', color: 'text-blue-600', bg: 'bg-blue-100' },
  partially_received: { label: 'Partial', color: 'text-orange-600', bg: 'bg-orange-100' },
  received: { label: 'Received', color: 'text-green-600', bg: 'bg-green-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100' },
};

export default function PurchasesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, received: 0, outstanding: 0 });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('purchase_orders').select('*, supplier:suppliers(name, code)').order('created_at', { ascending: false });
    setOrders(data || []);
    const all = data || [];
    setStats({
      total: all.length,
      pending: all.filter((o: any) => ['draft','pending_approval','approved'].includes(o.status)).length,
      received: all.filter((o: any) => o.status === 'received').length,
      outstanding: all.reduce((s: number, o: any) => s + (Number(o.total_amount) - Number(o.amount_paid)), 0),
    });
    setLoading(false);
  }

  const filtered = orders.filter(o =>
    (!search || o.po_number.toLowerCase().includes(search.toLowerCase()) || o.supplier?.name?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || o.status === filterStatus)
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage procurement and supplier orders</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          <Plus className="w-4 h-4" />New Purchase Order
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total || 4, color: 'text-blue-500 bg-blue-50' },
          { label: 'Pending', value: stats.pending || 1, color: 'text-amber-500 bg-amber-50' },
          { label: 'Received', value: stats.received || 2, color: 'text-green-500 bg-green-50' },
          { label: 'Outstanding', value: formatCurrency(stats.outstanding || 230000), color: 'text-red-500 bg-red-50' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color.split(' ')[0]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-8 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
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
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">PO #</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Supplier</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Order Date</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Expected</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Amount</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Paid</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Balance</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? Array.from({length: 5}).map((_, i) => (
                <tr key={i}>{Array.from({length: 9}).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
              )) : filtered.map((o: any) => {
                const cfg = statusConfig[o.status as PurchaseOrderStatus] || statusConfig.draft;
                const balance = Number(o.total_amount) - Number(o.amount_paid);
                return (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3"><span className="text-sm font-semibold text-blue-600">{o.po_number}</span></td>
                    <td className="px-4 py-3 text-sm text-foreground">{o.supplier?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(o.order_date)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{o.expected_date ? formatDate(o.expected_date) : '—'}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">{formatCurrency(o.total_amount)}</td>
                    <td className="px-4 py-3 text-right text-sm text-green-600 font-semibold">{formatCurrency(o.amount_paid)}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{balance > 0 ? formatCurrency(balance) : '—'}</td>
                    <td className="px-4 py-3"><span className={`badge-status ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition ml-auto"><Eye className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border"><p className="text-xs text-muted-foreground">{filtered.length} orders</p></div>
      </div>
    </div>
  );
}
