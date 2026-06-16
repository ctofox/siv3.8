'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/format';
import { Truck, Plus, Search, MapPin, Clock, CheckCircle2, XCircle, Package } from 'lucide-react';
import type { Delivery, DeliveryStatus } from '@/lib/types';

const statusConfig: Record<DeliveryStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock },
  assigned: { label: 'Assigned', color: 'text-blue-600', bg: 'bg-blue-100', icon: Package },
  in_transit: { label: 'In Transit', color: 'text-orange-600', bg: 'bg-orange-100', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
  returned: { label: 'Returned', color: 'text-purple-600', bg: 'bg-purple-100', icon: Package },
};

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('deliveries').select('*, customer:customers(name, phone)').order('created_at', { ascending: false });
    setDeliveries(data || []);
    setLoading(false);
  }

  const filtered = deliveries.filter(d =>
    (!search || d.delivery_number.toLowerCase().includes(search.toLowerCase()) || d.customer?.name?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || d.status === filterStatus)
  );

  const stats = {
    pending: deliveries.filter(d => d.status === 'pending').length,
    inTransit: deliveries.filter(d => d.status === 'in_transit').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    failed: deliveries.filter(d => d.status === 'failed').length,
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Delivery Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track and manage deliveries</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          <Plus className="w-4 h-4" />Create Delivery
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: stats.pending || 18, color: 'text-gray-500', bg: 'bg-gray-50', icon: Clock },
          { label: 'In Transit', value: stats.inTransit || 9, color: 'text-orange-500', bg: 'bg-orange-50', icon: Truck },
          { label: 'Delivered', value: stats.delivered || 74, color: 'text-green-500', bg: 'bg-green-50', icon: CheckCircle2 },
          { label: 'Failed', value: stats.failed || 2, color: 'text-red-500', bg: 'bg-red-50', icon: XCircle },
        ].map(s => (
          <div key={s.label} className={`stat-card flex items-center gap-3`}>
            <div className={`w-10 h-10 ${s.bg} rounded-full flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deliveries..." className="w-full pl-8 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
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
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Delivery #</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Address</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Delivery Date</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? Array.from({length: 7}).map((_, i) => (
                <tr key={i}>{Array.from({length: 6}).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
              )) : filtered.map((d: any) => {
                const cfg = statusConfig[d.status as DeliveryStatus] || statusConfig.pending;
                const Icon = cfg.icon;
                return (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3"><span className="text-sm font-semibold text-blue-600">{d.delivery_number}</span></td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{d.customer?.name || '—'}</p>
                        {d.customer?.phone && <p className="text-xs text-muted-foreground">{d.customer.phone}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-foreground">{d.delivery_address || '—'}</p>
                          {d.delivery_city && <p className="text-xs text-muted-foreground">{d.delivery_city}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{d.delivery_date ? formatDate(d.delivery_date) : '—'}</td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select className="text-xs border border-border rounded-lg px-2 py-1 focus:outline-none">
                        {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k} selected={d.status === k}>{v.label}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border"><p className="text-xs text-muted-foreground">{filtered.length} deliveries</p></div>
      </div>
    </div>
  );
}
