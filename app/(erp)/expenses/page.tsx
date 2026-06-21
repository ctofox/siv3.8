'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/format';
import { toast } from '@/hooks/use-toast';
import { Plus, X, Receipt, TrendingDown, Calendar, Filter } from 'lucide-react';
import type { Account } from '@/lib/types';

interface ExpenseEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  total_debit: number;
  created_at: string;
  lines?: { account_id: string; account: { code: string; name: string }; debit: number; credit: number }[];
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [expensesRes, accountsRes] = await Promise.all([
      supabase
        .from('journal_entries')
        .select('id, entry_number, entry_date, description, total_debit, created_at')
        .eq('reference_type', 'manual')
        .order('entry_date', { ascending: false })
        .limit(100),
      supabase.from('accounts').select('*').eq('is_active', true).order('code'),
    ]);
    setExpenses(expensesRes.data || []);
    setAccounts(accountsRes.data || []);
    setLoading(false);
  }

  const expenseAccounts = accounts.filter(a => a.account_type === 'expense');
  const cashBankAccounts = accounts.filter(a => a.is_cash || a.is_bank || a.code === '1000' || a.code === '1010');

  const filteredExpenses = filterMonth
    ? expenses.filter(e => e.entry_date.startsWith(filterMonth))
    : expenses;

  const totalExpenses = filteredExpenses.reduce((s, e) => s + Number(e.total_debit), 0);

  // Group by expense account
  const expensesByCategory = new Map<string, number>();
  filteredExpenses.forEach(e => {
    if (e.lines) {
      e.lines.forEach(line => {
        if (Number(line.debit) > 0) {
          const name = line.account?.name || 'Other';
          expensesByCategory.set(name, (expensesByCategory.get(name) || 0) + Number(line.debit));
        }
      });
    }
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track and manage business expenses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" />Add Expense
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Expenses</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-lg font-bold text-foreground">{filteredExpenses.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card col-span-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="month"
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="text-sm border border-border rounded-lg px-2 py-1"
            />
            {filterMonth && (
              <button onClick={() => setFilterMonth('')} className="text-xs text-blue-600 hover:underline">Clear</button>
            )}
          </div>
        </div>
      </div>

      {/* Expenses by Category */}
      {expensesByCategory.size > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from(expensesByCategory.entries()).map(([name, total]) => (
            <div key={name} className="bg-white rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground truncate">{name}</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(total)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Expenses List */}
      <div className="table-wrapper">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Entry #</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Description</th>
              <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground text-sm">
                  <Receipt className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                  No expenses recorded yet. Click &quot;Add Expense&quot; to record your first expense.
                </td>
              </tr>
            ) : (
              filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(exp.entry_date)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">{exp.entry_number}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{exp.description}</td>
                  <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">{formatCurrency(exp.total_debit)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ExpenseModal
          expenseAccounts={expenseAccounts}
          cashBankAccounts={cashBankAccounts}
          onClose={() => setShowModal(false)}
          onSaved={() => { loadData(); setShowModal(false); }}
        />
      )}
    </div>
  );
}

function ExpenseModal({ expenseAccounts, cashBankAccounts, onClose, onSaved }: {
  expenseAccounts: Account[];
  cashBankAccounts: Account[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    expense_account: '',
    paid_from: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.expense_account || !form.paid_from || !form.amount || parseFloat(form.amount) <= 0) {
      setError('Please fill all required fields');
      return;
    }

    setSaving(true);

    try {
      const amount = parseFloat(form.amount);
      let expenseAccountId = form.expense_account;

      // If creating new account
      if (form.expense_account === 'create_new' && newAccountName) {
        const newCode = `6${String(Date.now()).slice(-3)}`;
        const { data: newAccount } = await supabase
          .from('accounts')
          .insert({ code: newCode, name: newAccountName, account_type: 'expense' })
          .select()
          .single();
        if (newAccount) {
          expenseAccountId = newAccount.id;
        }
      }

      const entryNumber = await supabase.rpc('get_next_journal_number');

      const { data: entry } = await supabase
        .from('journal_entries')
        .insert({
          entry_number: entryNumber.data || `JE-${Date.now().toString().slice(-6)}`,
          entry_date: form.date,
          description: form.description || 'Expense payment',
          reference_type: 'manual',
          total_debit: amount,
          total_credit: amount,
          is_posted: true,
        })
        .select()
        .single();

      if (!entry) throw new Error('Failed to create entry');

      await supabase.from('journal_lines').insert([
        { journal_entry_id: entry.id, account_id: expenseAccountId, description: form.description, debit: amount, credit: 0, sort_order: 0 },
        { journal_entry_id: entry.id, account_id: form.paid_from, description: form.description, debit: 0, credit: amount, sort_order: 1 },
      ]);

      // Update balances
      const expenseAccount = expenseAccounts.find(a => a.id === expenseAccountId);
      const cashAccount = cashBankAccounts.find(a => a.id === form.paid_from);

      if (expenseAccount) {
        await supabase.from('accounts').update({ balance: (expenseAccount.balance || 0) + amount }).eq('id', expenseAccountId);
      }
      if (cashAccount) {
        await supabase.from('accounts').update({ balance: (cashAccount.balance || 0) - amount }).eq('id', form.paid_from);
      }

      toast({ title: 'Success', description: 'Expense recorded successfully' });
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to record expense');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold">Add Expense</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Amount *</label>
              <input type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Expense Category *</label>
            <select
              required
              value={form.expense_account}
              onChange={e => {
                setForm({ ...form, expense_account: e.target.value });
                setShowNewAccount(e.target.value === 'create_new');
              }}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
              {expenseAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
              ))}
              <option value="create_new">+ Add New Category</option>
            </select>
            {showNewAccount && (
              <input
                value={newAccountName}
                onChange={e => setNewAccountName(e.target.value)}
                placeholder="Enter new expense category name"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Paid From *</label>
            <select required value={form.paid_from} onChange={e => setForm({ ...form, paid_from: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm">
              <option value="">Select payment source</option>
              {cashBankAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Description</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Office supplies, Electricity bill" className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
