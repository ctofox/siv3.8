'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import { Plus } from 'lucide-react';

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('journal_entries').select('*').order('entry_date', { ascending: false }).limit(50).then(({ data }) => { setEntries(data || []); setLoading(false); });
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Journal Entries</h1><p className="text-muted-foreground text-sm mt-0.5">Double-entry accounting ledger</p></div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"><Plus className="w-4 h-4" />New Entry</button>
      </div>
      <div className="table-wrapper">
        <table className="w-full">
          <thead><tr className="bg-muted/40 border-b border-border">
            {['Entry #','Date','Description','Debit','Credit','Status'].map(h => <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {loading ? Array.from({length: 5}).map((_, i) => <tr key={i}>{Array.from({length: 6}).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>) :
              entries.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">No journal entries yet</td></tr> :
              entries.map(e => (
                <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">{e.entry_number}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{e.entry_date}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{e.description}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatCurrency(e.total_debit)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600">{formatCurrency(e.total_credit)}</td>
                  <td className="px-4 py-3"><span className={`badge-status ${e.is_posted ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{e.is_posted ? 'Posted' : 'Draft'}</span></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
