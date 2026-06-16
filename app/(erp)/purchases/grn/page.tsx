'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/format';
import { Plus } from 'lucide-react';

export default function GRNPage() {
  const [grns, setGrns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('goods_receipt_notes').select('*, supplier:suppliers(name)').order('created_at', { ascending: false }).then(({ data }) => { setGrns(data || []); setLoading(false); });
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Goods Receipt Notes</h1><p className="text-muted-foreground text-sm mt-0.5">Record and verify incoming stock</p></div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"><Plus className="w-4 h-4" />New GRN</button>
      </div>
      <div className="table-wrapper">
        <table className="w-full">
          <thead><tr className="bg-muted/40 border-b border-border">{['GRN #','Supplier','PO #','Date','Status'].map(h => <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {loading ? Array.from({length: 5}).map((_, i) => <tr key={i}>{Array.from({length: 5}).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>) :
              grns.length === 0 ? <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground text-sm">No GRNs recorded yet</td></tr> :
              grns.map(g => (
                <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">{g.grn_number}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{g.supplier?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{g.purchase_order_id ? '—' : '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(g.received_date)}</td>
                  <td className="px-4 py-3"><span className={`badge-status ${g.status === 'posted' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{g.status}</span></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
