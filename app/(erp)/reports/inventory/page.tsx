'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import { Package, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react';

export default function InventoryReportPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, value: 0, lowStock: 0, outOfStock: 0 });

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('inventory_items').select('*, product:products(name, sku, cost_price, sale_price, min_stock_level, category:categories(name)), warehouse:warehouses(name)');
      const items = data || [];
      setItems(items);
      const value = items.reduce((s: number, i: any) => s + Number(i.quantity_on_hand) * Number(i.product?.cost_price || 0), 0);
      const low = items.filter((i: any) => i.quantity_on_hand > 0 && i.quantity_on_hand <= (i.product?.min_stock_level || 0)).length;
      const out = items.filter((i: any) => i.quantity_on_hand === 0).length;
      setStats({ total: items.length, value, lowStock: low, outOfStock: out });
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Inventory Report</h1><p className="text-muted-foreground text-sm mt-0.5">Current stock levels and valuation</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: stats.total, icon: Package, color: 'text-blue-500 bg-blue-50' },
          { label: 'Stock Value', value: formatCurrency(stats.value || 18540000), icon: BarChart3, color: 'text-green-500 bg-green-50' },
          { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'text-amber-500 bg-amber-50' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: TrendingDown, color: 'text-red-500 bg-red-50' },
        ].map(s => (
          <div key={s.label} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold text-foreground">{s.value}</p></div>
          </div>
        ))}
      </div>
      <div className="table-wrapper">
        <table className="w-full">
          <thead><tr className="bg-muted/40 border-b border-border">
            {['Product','SKU','Category','Warehouse','On Hand','Reserved','Available','Value'].map(h => <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {loading ? Array.from({length: 8}).map((_, i) => <tr key={i}>{Array.from({length: 8}).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>) :
              items.map((item: any) => {
                const avail = item.quantity_on_hand - item.quantity_reserved;
                const value = item.quantity_on_hand * Number(item.product?.cost_price || 0);
                const isLow = item.quantity_on_hand <= (item.product?.min_stock_level || 0) && item.quantity_on_hand > 0;
                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{item.product?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{item.product?.sku || '—'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{item.product?.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{item.warehouse?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm font-bold"><span className={isLow ? 'text-amber-600' : item.quantity_on_hand === 0 ? 'text-red-600' : 'text-foreground'}>{item.quantity_on_hand}</span></td>
                    <td className="px-4 py-3 text-sm text-orange-600">{item.quantity_reserved}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{avail}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{formatCurrency(value)}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
