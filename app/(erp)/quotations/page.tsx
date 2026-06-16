'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/format';
import { FileText, Plus, Search, Eye, Send, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { QuotationStatus } from '@/lib/types';

const statusConfig: Record<QuotationStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-gray-600', bg: 'bg-gray-100' },
  sent: { label: 'Sent', color: 'text-blue-600', bg: 'bg-blue-100' },
  viewed: { label: 'Viewed', color: 'text-purple-600', bg: 'bg-purple-100' },
  accepted: { label: 'Accepted', color: 'text-green-600', bg: 'bg-green-100' },
  rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-100' },
  expired: { label: 'Expired', color: 'text-orange-600', bg: 'bg-orange-100' },
  converted: { label: 'Converted', color: 'text-teal-600', bg: 'bg-teal-100' },
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('quotations').select('*, customer:customers(name)').order('created_at', { ascending: false });
    setQuotations(data || []);
    setLoading(false);
  }

  const filtered = quotations.filter(q =>
    (!search || q.quote_number.toLowerCase().includes(search.toLowerCase()) || q.customer?.name?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || q.status === filterStatus)
  );

  const stats = {
    total: quotations.length,
    sent: quotations.filter(q => q.status === 'sent' || q.status === 'viewed').length,
    accepted: quotations.filter(q => q.status === 'accepted').length,
    totalValue: quotations.filter(q => q.status !== 'expired' && q.status !== 'rejected').reduce((s, q) => s + Number(q.total_amount), 0),
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quotations</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Create and manage price quotations</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          <Plus className="w-4 h-4" />New Quotation
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Quotes', value: stats.total || 6 },
          { label: 'Awaiting Response', value: stats.sent || 3 },
          { label: 'Accepted', value: stats.accepted || 1 },
          { label: 'Pipeline Value', value: formatCurrency(stats.totalValue || 1595000) },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quotations..." className="w-full pl-8 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
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
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Quote #</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Issue Date</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Expiry</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? Array.from({length: 5}).map((_, i) => (
                <tr key={i}>{Array.from({length: 7}).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
              )) : filtered.map((q: any) => {
                const cfg = statusConfig[q.status as QuotationStatus] || statusConfig.draft;
                return (
                  <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3"><span className="text-sm font-semibold text-blue-600">{q.quote_number}</span></td>
                    <td className="px-4 py-3 text-sm text-foreground">{q.customer?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(q.issue_date)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{q.expiry_date ? formatDate(q.expiry_date) : '—'}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">{formatCurrency(q.total_amount)}</td>
                    <td className="px-4 py-3"><span className={`badge-status ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-muted-foreground hover:text-green-600 transition"><Send className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
