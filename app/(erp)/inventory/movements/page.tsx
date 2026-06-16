'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/format';
import { ArrowUpDown, TrendingUp, TrendingDown, Package } from 'lucide-react';

const typeConfig: Record<string, { label: string; color: string; bg: string; sign: string }> = {
  purchase: { label: 'Purchase', color: 'text-green-600', bg: 'bg-green-50', sign: '+' },
  sale: { label: 'Sale', color: 'text-red-600', bg: 'bg-red-50', sign: '-' },
  adjustment: { label: 'Adjustment', color: 'text-blue-600', bg: 'bg-blue-50', sign: '±' },
  transfer_in: { label: 'Transfer In', color: 'text-teal-600', bg: 'bg-teal-50', sign: '+' },
  transfer_out: { label: 'Transfer Out', color: 'text-orange-600', bg: 'bg-orange-50', sign: '-' },
  damage: { label: 'Damage', color: 'text-red-600', bg: 'bg-red-50', sign: '-' },
  opening: { label: 'Opening', color: 'text-purple-600', bg: 'bg-purple-50', sign: '+' },
};

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('stock_movements').select('*, product:products(name, sku), warehouse:warehouses(name)').order('created_at', { ascending: false }).limit(50);
      setMovements(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Stock Movements</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Complete audit trail of all inventory changes</p>
      </div>
      <div className="table-wrapper">
        <table className="w-full">
          <thead><tr className="bg-muted/40 border-b border-border">
            {['Product','SKU','Warehouse','Type','Qty','Reference','Date'].map(h => <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {loading ? Array.from({length: 8}).map((_, i) => (
              <tr key={i}>{Array.from({length: 7}).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
            )) : movements.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">No stock movements recorded yet</td></tr>
            ) : movements.map((m: any) => {
              const cfg = typeConfig[m.movement_type] || typeConfig.adjustment;
              return (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{m.product?.name || '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{m.product?.sku || '—'}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{m.warehouse?.name || '—'}</td>
                  <td className="px-4 py-3"><span className={`badge-status ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></td>
                  <td className="px-4 py-3 text-sm font-bold"><span className={m.quantity > 0 ? 'text-green-600' : 'text-red-600'}>{cfg.sign}{Math.abs(m.quantity)}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{m.reference_number || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatRelativeTime(m.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
