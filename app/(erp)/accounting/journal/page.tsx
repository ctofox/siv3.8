'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/format';
import { toast } from '@/hooks/use-toast';
import { Plus, ChevronDown, ChevronRight, FileText, Receipt, CreditCard, Package, ArrowRightLeft, ShoppingBag, X, Trash2 } from 'lucide-react';
import type { Account } from '@/lib/types';

interface JournalLine {
  id: string;
  account_id: string;
  account: { code: string; name: string; account_type: string } | { code: string; name: string; account_type: string }[];
  description: string;
  debit: number;
  credit: number;
}

interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  reference_type: string | null;
  reference_id: string | null;
  total_debit: number;
  total_credit: number;
  is_posted: boolean;
  created_at: string;
  lines?: JournalLine[];
}

const refIcons: Record<string, React.ElementType> = {
  invoice: Receipt,
  payment: CreditCard,
  grn: Package,
  sales_return: ArrowRightLeft,
  purchase_return: ShoppingBag,
  manual: FileText,
};

const refLabels: Record<string, string> = {
  invoice: 'Invoice',
  payment: 'Payment',
  grn: 'Goods Receipt',
  sales_return: 'Sales Return',
  purchase_return: 'Purchase Return',
  manual: 'Manual Entry',
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [entriesRes, accountsRes] = await Promise.all([
      supabase.from('journal_entries').select('*').order('entry_date', { ascending: false }).order('created_at', { ascending: false }).limit(100),
      supabase.from('accounts').select('*').eq('is_active', true).order('code'),
    ]);
    setEntries(entriesRes.data || []);
    setAccounts(accountsRes.data || []);
    setLoading(false);
  }

  async function toggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    const entry = entries.find(e => e.id === id);
    if (!entry?.lines) {
      const { data: lines } = await supabase
        .from('journal_lines')
        .select('id, account_id, description, debit, credit, account:accounts(code, name, account_type)')
        .eq('journal_entry_id', id)
        .order('sort_order');

      setEntries(prev => prev.map(e =>
        e.id === id ? { ...e, lines: lines || [] } : e
      ));
    }
    setExpandedId(id);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Journal Entries</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Double-entry accounting ledger with automatic posting</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" />Manual Entry
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">Total Entries</p>
          <p className="text-xl font-bold text-foreground">{entries.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">Posted</p>
          <p className="text-xl font-bold text-green-600">{entries.filter(e => e.is_posted).length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">Total Debits</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(entries.reduce((s, e) => s + Number(e.total_debit), 0))}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">Total Credits</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(entries.reduce((s, e) => s + Number(e.total_credit), 0))}</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="w-8"></th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Entry #</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Description</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Reference</th>
              <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Debit</th>
              <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Credit</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                  No journal entries yet. Click &quot;Manual Entry&quot; to create one, or confirm invoices/process payments for automatic entries.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <JournalEntryRow
                  key={entry.id}
                  entry={entry}
                  isExpanded={expandedId === entry.id}
                  onToggle={() => toggleExpand(entry.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <JournalEntryModal
          accounts={accounts}
          onClose={() => setShowModal(false)}
          onSaved={() => { loadData(); setShowModal(false); }}
        />
      )}
    </div>
  );
}

function JournalEntryRow({ entry, isExpanded, onToggle }: { entry: JournalEntry; isExpanded: boolean; onToggle: () => void }) {
  const [lines, setLines] = useState<JournalLine[] | null>(null);

  useEffect(() => {
    if (isExpanded && !lines && entry.lines) {
      setLines(entry.lines);
    } else if (isExpanded && !lines) {
      supabase
        .from('journal_lines')
        .select('id, account_id, description, debit, credit, account:accounts(code, name, account_type)')
        .eq('journal_entry_id', entry.id)
        .order('sort_order')
        .then(({ data }) => setLines(data || []));
    }
  }, [isExpanded, entry.id, entry.lines, lines]);

  return (
    <>
      <tr className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={onToggle}>
        <td className="px-2 py-3">
          {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-blue-600">{entry.entry_number}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(entry.entry_date)}</td>
        <td className="px-4 py-3 text-sm text-foreground max-w-xs truncate">{entry.description}</td>
        <td className="px-4 py-3">
          {entry.reference_type && (
            <span className="inline-flex items-center gap-1.5 text-xs">
              {refIcons[entry.reference_type] && (
                <span className="w-5 h-5 rounded bg-muted flex items-center justify-center">
                  {(() => { const Icon = refIcons[entry.reference_type]; return <Icon className="w-3 h-3 text-muted-foreground" /> })()}
                </span>
              )}
              <span className="text-muted-foreground">{refLabels[entry.reference_type] || entry.reference_type}</span>
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">{formatCurrency(entry.total_debit)}</td>
        <td className="px-4 py-3 text-sm font-semibold text-red-600 text-right">{formatCurrency(entry.total_credit)}</td>
        <td className="px-4 py-3">
          <span className={`badge-status ${entry.is_posted ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
            {entry.is_posted ? 'Posted' : 'Draft'}
          </span>
        </td>
      </tr>
      {isExpanded && lines && (
        <tr className="bg-muted/20">
          <td colSpan={8} className="px-4 py-3">
            <div className="ml-8 space-y-1">
              <div className="text-xs font-medium text-muted-foreground mb-2">Line Items</div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left py-1 font-medium">Account</th>
                    <th className="text-left py-1 font-medium">Description</th>
                    <th className="text-right py-1 font-medium">Debit</th>
                    <th className="text-right py-1 font-medium">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => {
                    const acc = Array.isArray(line.account) ? line.account[0] : line.account;
                    return (
                      <tr key={line.id} className="text-foreground">
                        <td className="py-1.5">
                          <span className="font-mono text-muted-foreground mr-2">{acc?.code}</span>
                          <span className="font-medium">{acc?.name}</span>
                        </td>
                        <td className="py-1.5 text-muted-foreground">{line.description || '-'}</td>
                        <td className="py-1.5 text-right font-medium text-green-600">{Number(line.debit) > 0 ? formatCurrency(line.debit) : '-'}</td>
                        <td className="py-1.5 text-right font-medium text-red-600">{Number(line.credit) > 0 ? formatCurrency(line.credit) : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function JournalEntryModal({ accounts, onClose, onSaved }: { accounts: Account[]; onClose: () => void; onSaved: () => void }) {
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<{ accountId: string; debit: string; credit: string; description: string }[]>([
    { accountId: '', debit: '', credit: '', description: '' },
    { accountId: '', debit: '', credit: '', description: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  function addLine() {
    setLines([...lines, { accountId: '', debit: '', credit: '', description: '' }]);
  }

  function removeLine(index: number) {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  }

  function updateLine(index: number, field: string, value: string) {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (!isBalanced) {
      setError('Debits and credits must balance');
      return;
    }

    if (totalDebit === 0) {
      setError('Entry must have a non-zero amount');
      return;
    }

    const validLines = lines.filter(l => l.accountId && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0));
    if (validLines.length < 2) {
      setError('At least two line items are required');
      return;
    }

    setSaving(true);

    try {
      // Get next entry number
      const { data: seqData } = await supabase.rpc('get_next_journal_number');
      const entryNumber = seqData || `JE-${Date.now().toString().slice(-6)}`;

      // Create entry
      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .insert({
          entry_number: entryNumber,
          entry_date: entryDate,
          description,
          reference_type: 'manual',
          total_debit: totalDebit,
          total_credit: totalCredit,
          is_posted: true,
        })
        .select()
        .single();

      if (entryError) throw entryError;

      // Create lines and update account balances
      for (let i = 0; i < validLines.length; i++) {
        const line = validLines[i];
        const debit = parseFloat(line.debit) || 0;
        const credit = parseFloat(line.credit) || 0;

        await supabase.from('journal_lines').insert({
          journal_entry_id: entry.id,
          account_id: line.accountId,
          description: line.description,
          debit,
          credit,
          sort_order: i,
        });

        // Update account balance
        const account = accounts.find(a => a.id === line.accountId);
        if (account) {
          const balanceChange = account.account_type === 'asset' || account.account_type === 'expense'
            ? debit - credit
            : credit - debit;

          await supabase
            .from('accounts')
            .update({ balance: (account.balance || 0) + balanceChange })
            .eq('id', line.accountId);
        }
      }

      toast({ title: 'Success', description: `Journal entry ${entryNumber} created` });
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to create entry');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white">
          <h2 className="text-base font-bold">Manual Journal Entry</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Entry Date</label>
              <input
                type="date"
                value={entryDate}
                onChange={e => setEntryDate(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Description</label>
              <input
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Monthly rent payment"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium">Line Items</label>
              <button type="button" onClick={addLine} className="text-xs text-blue-600 hover:underline">+ Add Line</button>
            </div>
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={line.accountId}
                    onChange={e => updateLine(i, 'accountId', e.target.value)}
                    className="flex-1 border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="">Select account</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Debit"
                    value={line.debit}
                    onChange={e => updateLine(i, 'debit', e.target.value)}
                    className="w-24 border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Credit"
                    value={line.credit}
                    onChange={e => updateLine(i, 'credit', e.target.value)}
                    className="w-24 border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                  />
                  <input
                    placeholder="Note"
                    value={line.description}
                    onChange={e => updateLine(i, 'description', e.target.value)}
                    className="w-32 border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                  />
                  {lines.length > 2 && (
                    <button type="button" onClick={() => removeLine(i)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="text-xs">
              <span className="text-muted-foreground">Total Debit: </span>
              <span className="font-semibold text-green-600">{formatCurrency(totalDebit)}</span>
              <span className="mx-3">|</span>
              <span className="text-muted-foreground">Total Credit: </span>
              <span className="font-semibold text-red-600">{formatCurrency(totalCredit)}</span>
            </div>
            <span className={`text-xs font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
              {isBalanced ? 'Balanced' : 'Not Balanced'}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition">Cancel</button>
            <button type="submit" disabled={saving || !isBalanced} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60">
              {saving ? 'Saving...' : 'Post Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
