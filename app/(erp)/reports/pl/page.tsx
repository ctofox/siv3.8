'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Download, Printer, RefreshCw } from 'lucide-react';

interface PnLData {
  salesRevenue: number;
  salesReturns: number;
  netSalesRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  totalExpenses: number;
  netProfit: number;
}

export default function PLPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PnLData>({
    salesRevenue: 0,
    salesReturns: 0,
    netSalesRevenue: 0,
    otherRevenue: 0,
    totalRevenue: 0,
    costOfGoodsSold: 0,
    grossProfit: 0,
    operatingExpenses: 0,
    totalExpenses: 0,
    netProfit: 0,
  });
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [revenueBreakdown, setRevenueBreakdown] = useState<{ name: string; amount: number }[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<{ name: string; amount: number }[]>([]);
  const [salesReturns, setSalesReturns] = useState(0);

  useEffect(() => { loadData(); }, [period]);

  async function loadData() {
    setLoading(true);

    const now = new Date();
    let startDate: string;

    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    } else if (period === 'quarter') {
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStart, 1).toISOString().split('T')[0];
    } else {
      startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    }

    const endDate = now.toISOString().split('T')[0];

    const [invoicesRes, returnsRes, stockMovementsRes, accountsRes] = await Promise.all([
      supabase.from('invoices').select('total_amount').gte('invoice_date', startDate).lte('invoice_date', endDate).neq('status', 'cancelled'),
      supabase.from('sales_returns').select('total_refund_amount').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('stock_movements').select('quantity, unit_cost').eq('movement_type', 'sale').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('accounts').select('id, code, name, account_type, balance'),
    ]);

    const salesRevenue = (invoicesRes.data || []).reduce((sum, inv) => sum + Number(inv.total_amount), 0);
    const salesReturnsTotal = (returnsRes.data || []).reduce((sum, r) => sum + Number(r.total_refund_amount || 0), 0);
    const netSalesRevenue = salesRevenue - salesReturnsTotal;
    const costOfGoodsSold = (stockMovementsRes.data || []).reduce((sum, m) => sum + (Math.abs(Number(m.quantity)) * Number(m.unit_cost || 0)), 0);

    setSalesReturns(salesReturnsTotal);

    const expenseAccounts = (accountsRes.data || []).filter(a => a.account_type === 'expense' || a.account_type === 'cost_of_sales');

    let operatingExpenses = 0;
    const expBreakdown: { name: string; amount: number }[] = [];

    for (const acc of expenseAccounts) {
      const { data: lines } = await supabase
        .from('journal_lines')
        .select('debit, credit')
        .eq('account_id', acc.id);

      const debitSum = (lines || []).reduce((s, l) => s + Number(l.debit || 0), 0);
      const creditSum = (lines || []).reduce((s, l) => s + Number(l.credit || 0), 0);
      const net = debitSum - creditSum;

      if (net > 0) {
        operatingExpenses += net;
        expBreakdown.push({ name: acc.name, amount: net });
      }
    }
    setExpenseBreakdown(expBreakdown);

    const revenueAccounts = (accountsRes.data || []).filter(a => a.account_type === 'revenue');
    let otherRevenue = 0;
    const revBreakdown: { name: string; amount: number }[] = [];

    for (const acc of revenueAccounts) {
      if (acc.code === '4000') continue;

      const { data: lines } = await supabase
        .from('journal_lines')
        .select('debit, credit')
        .eq('account_id', acc.id);

      const creditSum = (lines || []).reduce((s, l) => s + Number(l.credit || 0), 0);
      const debitSum = (lines || []).reduce((s, l) => s + Number(l.debit || 0), 0);
      const net = creditSum - debitSum;

      if (net > 0) {
        otherRevenue += net;
        revBreakdown.push({ name: acc.name, amount: net });
      }
    }

    if (netSalesRevenue > 0) {
      revBreakdown.unshift({ name: 'Net Sales Revenue', amount: netSalesRevenue });
    }
    setRevenueBreakdown(revBreakdown);

    const totalRevenue = netSalesRevenue + otherRevenue;
    const grossProfit = totalRevenue - costOfGoodsSold;
    const netProfit = grossProfit - operatingExpenses;

    setData({
      salesRevenue,
      salesReturns: salesReturnsTotal,
      netSalesRevenue,
      otherRevenue,
      totalRevenue,
      costOfGoodsSold,
      grossProfit,
      operatingExpenses,
      totalExpenses: operatingExpenses,
      netProfit,
    });

    setLoading(false);
  }

  const grossMargin = data.totalRevenue > 0 ? ((data.grossProfit / data.totalRevenue) * 100).toFixed(1) : '0.0';
  const netMargin = data.totalRevenue > 0 ? ((data.netProfit / data.totalRevenue) * 100).toFixed(1) : '0.0';

  function exportToCSV() {
    const csv = `Item,Amount
Sales Revenue,${data.salesRevenue}
Less: Sales Returns,(${data.salesReturns})
Net Sales Revenue,${data.netSalesRevenue}
Other Revenue,${data.otherRevenue}
Total Revenue,${data.totalRevenue}
Cost of Goods Sold,(${data.costOfGoodsSold})
Gross Profit,${data.grossProfit}
Operating Expenses,(${data.operatingExpenses})
Net Profit,${data.netProfit}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'profit_loss_statement.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profit & Loss Statement</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Financial performance summary</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <select value={period} onChange={e => setPeriod(e.target.value as 'month' | 'quarter' | 'year')} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button onClick={loadData} className="flex items-center gap-1.5 border border-border px-3 py-2 rounded-lg text-sm hover:bg-muted transition">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 border border-border px-3 py-2 rounded-lg text-sm hover:bg-muted transition">
            <Printer className="w-3.5 h-3.5" />
          </button>
          <button onClick={exportToCSV} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <Download className="w-4 h-4" />Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Net Revenue</p>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(data.totalRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total income</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Gross Profit</p>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(data.grossProfit)}</p>
          <p className={`text-xs font-medium mt-1 ${parseFloat(grossMargin) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{grossMargin}% margin</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Operating Expenses</p>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(data.operatingExpenses)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total expenses</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Net Profit</p>
            {data.netProfit >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
          </div>
          <p className={`text-2xl font-bold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(data.netProfit)}</p>
          <p className={`text-xs font-medium mt-1 ${parseFloat(netMargin) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{netMargin}% margin</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden max-w-3xl mx-auto">
        <div className="px-6 py-4 bg-gradient-to-r from-slate-700 to-slate-800">
          <h3 className="text-lg font-bold text-white">Profit & Loss Statement</h3>
          <p className="text-slate-300 text-sm">For the period: {period === 'month' ? 'This Month' : period === 'quarter' ? 'This Quarter' : 'This Year'}</p>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-muted-foreground text-sm">Loading financial data...</div>
        ) : (
          <>
            {/* Revenue Section */}
            <div className="px-6 py-3 bg-green-50 border-b border-border">
              <h4 className="text-sm font-bold text-green-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Revenue
              </h4>
            </div>

            <div className="divide-y divide-border">
              <div className="flex items-center justify-between px-6 py-3 hover:bg-muted/20">
                <span className="text-sm text-foreground">Gross Sales Revenue</span>
                <span className="text-sm font-semibold text-green-600">{formatCurrency(data.salesRevenue)}</span>
              </div>
              <div className="flex items-center justify-between px-6 py-3 hover:bg-muted/20">
                <span className="text-sm text-foreground pl-4">Less: Sales Returns & Allowances</span>
                <span className="text-sm font-semibold text-red-600">({formatCurrency(data.salesReturns)})</span>
              </div>
              <div className="flex items-center justify-between px-6 py-3 bg-green-50/50 font-medium">
                <span className="text-sm text-foreground">Net Sales Revenue</span>
                <span className="text-sm font-bold text-green-700">{formatCurrency(data.netSalesRevenue)}</span>
              </div>

              {data.otherRevenue > 0 && (
                <div className="flex items-center justify-between px-6 py-3 hover:bg-muted/20">
                  <span className="text-sm text-foreground">Other Revenue</span>
                  <span className="text-sm font-semibold text-green-600">{formatCurrency(data.otherRevenue)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-3 bg-green-100 border-y border-border font-bold">
              <span className="text-sm text-green-800">Total Revenue</span>
              <span className="text-sm text-green-800">{formatCurrency(data.totalRevenue)}</span>
            </div>

            {/* COGS Section */}
            <div className="px-6 py-3 bg-orange-50 border-b border-border">
              <h4 className="text-sm font-bold text-orange-700">Cost of Goods Sold</h4>
            </div>

            <div className="flex items-center justify-between px-6 py-3 hover:bg-muted/20 border-b border-border">
              <span className="text-sm text-foreground">Cost of Goods Sold</span>
              <span className="text-sm font-semibold text-red-600">({formatCurrency(data.costOfGoodsSold)})</span>
            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-blue-50 font-bold">
              <span className="text-sm text-blue-800">Gross Profit ({grossMargin}%)</span>
              <span className="text-sm text-blue-800">{formatCurrency(data.grossProfit)}</span>
            </div>

            {/* Expenses Section */}
            <div className="px-6 py-3 bg-red-50 border-b border-border">
              <h4 className="text-sm font-bold text-red-700 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" /> Operating Expenses
              </h4>
            </div>

            {expenseBreakdown.length > 0 ? (
              <div className="divide-y divide-border">
                {expenseBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between px-6 py-3 hover:bg-muted/20">
                    <span className="text-sm text-foreground">{item.name}</span>
                    <span className="text-sm font-semibold text-red-600">({formatCurrency(item.amount)})</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-4 text-center text-muted-foreground text-sm border-b border-border">
                No operating expenses recorded
              </div>
            )}

            <div className="flex items-center justify-between px-6 py-3 bg-red-50/50 font-medium border-b border-border">
              <span className="text-sm text-red-800">Total Operating Expenses</span>
              <span className="text-sm font-semibold text-red-700">({formatCurrency(data.operatingExpenses)})</span>
            </div>

            {/* Net Profit */}
            <div className={`px-6 py-5 ${data.netProfit >= 0 ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Net Profit</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(data.netProfit)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{netMargin}%</p>
                  <p className="text-sm text-white/80">net margin</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
