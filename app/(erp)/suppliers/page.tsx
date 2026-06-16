'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import { Truck, Plus, Search, Edit, Phone, Mail, Star } from 'lucide-react';
import type { Supplier } from '@/lib/types';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('suppliers').select('*').eq('is_active', true).order('name');
    setSuppliers(data || []);
    setLoading(false);
  }

  const filtered = suppliers.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = suppliers.reduce((s, sup) => s + sup.outstanding_balance, 0);
  const totalPurchases = suppliers.reduce((s, sup) => s + sup.total_purchases, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Suppliers</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage supplier accounts and relationships</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          <Plus className="w-4 h-4" />Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Suppliers', value: suppliers.length },
          { label: 'Active', value: suppliers.filter(s => s.is_active).length },
          { label: 'Total Purchases', value: formatCurrency(totalPurchases) },
          { label: 'Outstanding Payables', value: formatCurrency(totalOutstanding) },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..." className="w-full pl-8 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
      </div>

      <div className="table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Supplier</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Contact</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">City</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Credit Limit</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Total Purchases</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Outstanding</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Rating</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? Array.from({length: 5}).map((_, i) => (
                <tr key={i}>{Array.from({length: 8}).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
              )) : filtered.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 text-sm font-bold">{s.name[0]}</div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {s.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</div>}
                      {s.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{s.city || '—'}</td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">{formatCurrency(s.credit_limit)}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">{formatCurrency(s.total_purchases)}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{s.outstanding_balance > 0 ? formatCurrency(s.outstanding_balance) : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-0.5">
                      {Array.from({length: 5}).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < (s.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition ml-auto"><Edit className="w-3.5 h-3.5" /></button>
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
