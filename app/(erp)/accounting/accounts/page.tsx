'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import { Plus } from 'lucide-react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('accounts').select('*').eq('is_active', true).order('code').then(({ data }) => { setAccounts(data || []); setLoading(false); });
  }, []);

  const typeColors: Record<string, string> = {
    asset: 'text-blue-600 bg-blue-50',
    liability: 'text-red-600 bg-red-50',
    equity: 'text-purple-600 bg-purple-50',
    revenue: 'text-green-600 bg-green-50',
    expense: 'text-orange-600 bg-orange-50',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Chart of Accounts</h1><p className="text-muted-foreground text-sm mt-0.5">Manage all accounting ledger accounts</p></div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"><Plus className="w-4 h-4" />Add Account</button>
      </div>
      <div className="table-wrapper">
        <table className="w-full">
          <thead><tr className="bg-muted/40 border-b border-border">
            {['Code','Account Name','Type','Balance','Cash/Bank'].map(h => <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {loading ? Array.from({length: 8}).map((_, i) => <tr key={i}>{Array.from({length: 5}).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>) :
              accounts.map(a => (
                <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{a.code}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground">{a.name}</td>
                  <td className="px-4 py-3"><span className={`badge-status ${typeColors[a.account_type] || 'bg-gray-100 text-gray-600'} capitalize`}>{a.account_type}</span></td>
                  <td className={`px-4 py-3 text-sm font-bold ${a.account_type === 'expense' || a.account_type === 'liability' ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(a.balance)}</td>
                  <td className="px-4 py-3 text-sm">{a.is_cash ? '💵 Cash' : a.is_bank ? '🏦 Bank' : '—'}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
