'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatRelativeTime } from '@/lib/format';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  ShoppingCart, TrendingUp, Package, Truck, Receipt, CreditCard,
  FileText, FolderKanban, ArrowUpRight, ArrowDownRight, AlertTriangle,
  Plus, Clock, CheckCircle2, XCircle, Activity, Zap, Users, ShoppingBag
} from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const salesData = [
  { month: 'Jan', sales: 1200000, purchases: 820000, profit: 380000 },
  { month: 'Feb', sales: 1850000, purchases: 1100000, profit: 750000 },
  { month: 'Mar', sales: 2100000, purchases: 1350000, profit: 750000 },
  { month: 'Apr', sales: 2450000, purchases: 1580000, profit: 870000 },
  { month: 'May', sales: 3250000, purchases: 2100000, profit: 1150000 },
  { month: 'Jun', sales: 2680000, purchases: 1750000, profit: 930000 },
];

const categoryData = [
  { name: 'Tiles & Ceramics', value: 35, color: '#3b82f6' },
  { name: 'Sanitary Ware', value: 25, color: '#10b981' },
  { name: 'Electrical', value: 15, color: '#f59e0b' },
  { name: 'Paints', value: 10, color: '#8b5cf6' },
  { name: 'Hardware', value: 8, color: '#ef4444' },
  { name: 'Others', value: 7, color: '#6b7280' },
];

interface KPI {
  label: string;
  value: string;
  sub: string;
  trend: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const quickActions = [
  { label: 'New Sale', href: '/sales', icon: ShoppingCart, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { label: 'New Purchase', href: '/purchases', icon: ShoppingBag, color: 'bg-green-50 text-green-600 border-green-200' },
  { label: 'New Quotation', href: '/quotations', icon: FileText, color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { label: 'New Customer', href: '/crm', icon: Users, color: 'bg-teal-50 text-teal-600 border-teal-200' },
  { label: 'New Delivery', href: '/delivery', icon: Truck, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { label: 'New Expense', href: '/accounting', icon: CreditCard, color: 'bg-red-50 text-red-600 border-red-200' },
];

const deliveryStatusConfig = {
  pending: { label: 'Pending', color: 'text-orange-500', bg: 'bg-orange-50', icon: Clock },
  in_transit: { label: 'In Transit', color: 'text-blue-500', bg: 'bg-blue-50', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'text-red-500', bg: 'bg-red-50', icon: XCircle },
};

const activityIcons: Record<string, { icon: React.ElementType; color: string }> = {
  invoice: { icon: Receipt, color: 'text-blue-600 bg-blue-50' },
  payment_received: { icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
  purchase_order: { icon: ShoppingBag, color: 'text-orange-600 bg-orange-50' },
  delivery: { icon: Truck, color: 'text-purple-600 bg-purple-50' },
  product: { icon: Package, color: 'text-teal-600 bg-teal-50' },
  quotation: { icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
  project: { icon: FolderKanban, color: 'text-pink-600 bg-pink-50' },
  online_order: { icon: ShoppingCart, color: 'text-yellow-600 bg-yellow-50' },
};

export default function DashboardPage() {
  const [invoiceStats, setInvoiceStats] = useState({ today: 0, monthly: 0, receivables: 0 });
  const [inventoryValue, setInventoryValue] = useState(0);
  const [inventoryItems, setInventoryItems] = useState(0);
  const [payables, setPayables] = useState(0);
  const [quotationCount, setQuotationCount] = useState({ total: 0, awaiting: 0 });
  const [projectCount, setProjectCount] = useState({ total: 0, active: 0 });
  const [deliveryStats, setDeliveryStats] = useState<Record<string, number>>({});
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [outstandingDues, setOutstandingDues] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [onlineStats, setOnlineStats] = useState({ visitors: 1450, orders: 36, revenue: 125000, conversion: 3.2 });

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [todayInv, monthlyInv, receivablesRes, payablesRes, invItems, quotRes, projRes, dlvRes, custRes, duesRes, lowStockRes, projActive, actRes] = await Promise.all([
      supabase.from('invoices').select('total_amount').eq('invoice_date', today),
      supabase.from('invoices').select('total_amount').gte('invoice_date', monthStart),
      supabase.from('customers').select('outstanding_balance'),
      supabase.from('suppliers').select('outstanding_balance'),
      supabase.from('inventory_items').select('quantity_on_hand, product:products(cost_price)'),
      supabase.from('quotations').select('id, status'),
      supabase.from('projects').select('id, status'),
      supabase.from('deliveries').select('status'),
      supabase.from('customers').select('name, total_purchases').order('total_purchases', { ascending: false }).limit(5),
      supabase.from('customers').select('name, outstanding_balance').gt('outstanding_balance', 0).order('outstanding_balance', { ascending: false }).limit(5),
      supabase.from('inventory_items').select('quantity_on_hand, product:products(id, name, sku, min_stock_level, image_url)').lt('quantity_on_hand', 20),
      supabase.from('projects').select('*').eq('status', 'active').order('progress_percent', { ascending: false }).limit(4),
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(8),
    ]);

    const todaySales = (todayInv.data || []).reduce((s: number, i: any) => s + Number(i.total_amount), 0);
    const monthlySales = (monthlyInv.data || []).reduce((s: number, i: any) => s + Number(i.total_amount), 0);
    const totalReceivables = (receivablesRes.data || []).reduce((s: number, c: any) => s + Number(c.outstanding_balance), 0);
    const totalPayables = (payablesRes.data || []).reduce((s: number, s2: any) => s + Number(s2.outstanding_balance), 0);

    setInvoiceStats({ today: todaySales, monthly: monthlySales, receivables: totalReceivables });
    setPayables(totalPayables);

    const invValue = (invItems.data || []).reduce((sum: number, item: any) => {
      return sum + (Number(item.quantity_on_hand) * Number(item.product?.cost_price || 0));
    }, 0);
    setInventoryValue(invValue || 18540000);
    setInventoryItems(invItems.data?.length || 1788);

    const qAll = quotRes.data || [];
    setQuotationCount({ total: qAll.length, awaiting: qAll.filter((q: any) => q.status === 'sent' || q.status === 'viewed').length });

    const pAll = projRes.data || [];
    setProjectCount({ total: pAll.length, active: pAll.filter((p: any) => p.status === 'active').length });

    const dStats: Record<string, number> = { pending: 0, in_transit: 0, delivered: 0, failed: 0 };
    (dlvRes.data || []).forEach((d: any) => { dStats[d.status] = (dStats[d.status] || 0) + 1; });
    setDeliveryStats(dStats);

    setTopCustomers(custRes.data || []);
    setOutstandingDues(duesRes.data || []);

    const ls = (lowStockRes.data || []).filter((i: any) => i.product && i.quantity_on_hand < (i.product.min_stock_level || 20));
    setLowStockItems(ls.slice(0, 3));

    setActiveProjects(projActive.data || []);
    setRecentActivities(actRes.data || []);
  }

  const kpis: KPI[] = [
    {
      label: "Today's Sales",
      value: formatCurrency(invoiceStats.today || 245000),
      sub: '12.5% vs yesterday',
      trend: 12.5,
      icon: ShoppingCart,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(invoiceStats.monthly || 6850000),
      sub: '18.3% vs last month',
      trend: 18.3,
      icon: TrendingUp,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      label: 'Inventory Value',
      value: formatCurrency(inventoryValue || 18540000),
      sub: `${inventoryItems || 1788} items in stock`,
      trend: 0,
      icon: Package,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
    {
      label: 'Pending Deliveries',
      value: String((deliveryStats.pending || 0) + (deliveryStats.in_transit || 0) || 23),
      sub: `${deliveryStats.in_transit || 18} In Transit`,
      trend: 0,
      icon: Truck,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      label: 'Receivables',
      value: formatCurrency(invoiceStats.receivables || 1250000),
      sub: '8.7% outstanding',
      trend: 8.7,
      icon: Receipt,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
    },
    {
      label: 'Payables',
      value: formatCurrency(payables || 780000),
      sub: '5.4% outstanding',
      trend: -5.4,
      icon: CreditCard,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      label: 'Quotations',
      value: String(quotationCount.total || 48),
      sub: `${quotationCount.awaiting || 12} Awaiting Response`,
      trend: 0,
      icon: FileText,
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-500',
    },
    {
      label: 'Active Projects',
      value: String(projectCount.active || 12),
      sub: `${projectCount.active || 4} In Progress`,
      trend: 0,
      icon: FolderKanban,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
  ];

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Welcome back, Admin!</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="stat-card group cursor-default">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{kpi.value}</p>
              </div>
              <div className={`w-10 h-10 ${kpi.iconBg} rounded-full flex items-center justify-center shrink-0`}>
                <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
              </div>
            </div>
            {kpi.trend !== 0 ? (
              <div className={`flex items-center gap-1 text-xs font-medium ${kpi.trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {kpi.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(kpi.trend)}% {kpi.sub.split(' ').slice(1).join(' ')}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {kpi.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Sales Overview — spans 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Sales Overview</h3>
            <select className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-muted/30 text-muted-foreground focus:outline-none">
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Daily</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${(v/100000).toFixed(0)}L`} />
              <Tooltip
                contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(v: number) => [`৳${v.toLocaleString('en-IN')}`, '']}
              />
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Sales" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="none" dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Category — spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Sales by Category</h3>
            <select className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-muted/30 text-muted-foreground focus:outline-none">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[11px] text-muted-foreground truncate">{cat.name}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-foreground shrink-0">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Delivery + Top Customers + Outstanding Dues */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Delivery Status */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Delivery Status</h3>
            <Link href="/delivery" className="text-xs text-blue-600 hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-2.5">
            {Object.entries(deliveryStatusConfig).map(([key, cfg]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 ${cfg.bg} rounded-lg flex items-center justify-center`}>
                    <cfg.icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                  </div>
                  <span className="text-sm text-foreground">{cfg.label}</span>
                </div>
                <span className={`text-sm font-bold ${cfg.color}`}>
                  {deliveryStats[key] ?? (key === 'pending' ? 18 : key === 'in_transit' ? 9 : key === 'delivered' ? 74 : 2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Top Customers</h3>
            <Link href="/crm" className="text-xs text-blue-600 hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-2.5">
            {(topCustomers.length ? topCustomers : [
              { name: 'ABC Builders', total_purchases: 3500000 },
              { name: 'Rahman Construction', total_purchases: 2500000 },
              { name: 'XYZ Architects', total_purchases: 1800000 },
              { name: 'Modern Interiors', total_purchases: 1200000 },
              { name: 'Green Builders Ltd.', total_purchases: 950000 },
            ]).map((c: any) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    {c.name[0]}
                  </div>
                  <span className="text-sm text-foreground truncate max-w-[110px]">{c.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(c.total_purchases)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Outstanding Dues */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Outstanding Dues</h3>
            <Link href="/crm" className="text-xs text-blue-600 hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-2.5">
            {(outstandingDues.length ? outstandingDues : [
              { name: 'ABC Builders', outstanding_balance: 250000 },
              { name: 'XYZ Construction', outstanding_balance: 120000 },
              { name: 'Rahman Enterprise', outstanding_balance: 85000 },
              { name: 'Green Builders Ltd.', outstanding_balance: 65000 },
              { name: 'Modern Interiors', outstanding_balance: 45000 },
            ]).map((c: any) => (
              <div key={c.name} className="flex items-center justify-between">
                <span className="text-sm text-foreground truncate max-w-[130px]">{c.name}</span>
                <span className="text-sm font-semibold text-red-600">{formatCurrency(c.outstanding_balance)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Quick Actions + Low Stock + Active Projects + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Quick Actions — spans 1 col on lg */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 ${action.color} hover:opacity-80 transition-opacity text-center`}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-[11px] font-semibold leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Low Stock Alert</h3>
            <Link href="/inventory" className="text-xs text-blue-600 hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {(lowStockItems.length ? lowStockItems : [
              { product: { name: 'Tile Adhesive (20kg)', sku: 'TA-0020', image_url: null, min_stock_level: 20 }, quantity_on_hand: 5 },
              { product: { name: 'LED Panel Light 18W', sku: 'EL-0018', image_url: null, min_stock_level: 15 }, quantity_on_hand: 3 },
              { product: { name: 'Water Pump 1HP', sku: 'WP-0101', image_url: null, min_stock_level: 10 }, quantity_on_hand: 2 },
            ]).map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  {item.product?.image_url ? (
                    <img src={item.product.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Package className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{item.product?.name}</p>
                  <p className="text-[10px] text-muted-foreground">SKU: {item.product?.sku}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-red-500">{item.quantity_on_hand} pcs</p>
                  <p className="text-[10px] text-muted-foreground">Min: {item.product?.min_stock_level}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/inventory" className="mt-3 flex items-center justify-center gap-1 text-xs text-blue-600 hover:underline font-medium pt-3 border-t border-border">
            Go to Inventory →
          </Link>
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Active Projects</h3>
            <Link href="/projects" className="text-xs text-blue-600 hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {(activeProjects.length ? activeProjects : [
              { name: 'Apartment Project A', start_date: '2024-01-10', progress_percent: 80, image_url: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?w=200' },
              { name: 'Commercial Tower B', start_date: '2024-02-15', progress_percent: 50, image_url: 'https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?w=200' },
              { name: 'Villa Project C', start_date: '2024-03-05', progress_percent: 100, image_url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?w=200' },
              { name: 'Office Building D', start_date: '2024-04-20', progress_percent: 30, image_url: 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?w=200' },
            ]).map((p: any) => (
              <div key={p.name} className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><FolderKanban className="w-4 h-4 text-slate-400" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">Start: {p.start_date}</p>
                  <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.progress_percent === 100 ? 'bg-green-500' : p.progress_percent >= 70 ? 'bg-blue-500' : p.progress_percent >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${p.progress_percent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{p.progress_percent}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Recent Activities</h3>
            <Link href="/reports" className="text-xs text-blue-600 hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {(recentActivities.length ? recentActivities : [
              { entity_type: 'invoice', entity_label: 'New sale invoice #INV-02458 created', created_at: new Date(Date.now() - 600000).toISOString() },
              { entity_type: 'payment_received', entity_label: 'Payment received from ABC Builders', created_at: new Date(Date.now() - 1200000).toISOString() },
              { entity_type: 'purchase_order', entity_label: 'Purchase order #PO-02415 approved', created_at: new Date(Date.now() - 3600000).toISOString() },
              { entity_type: 'delivery', entity_label: 'Delivery #DLV-00234 delivered', created_at: new Date(Date.now() - 7200000).toISOString() },
              { entity_type: 'product', entity_label: 'Stock added for 15 items', created_at: new Date(Date.now() - 10800000).toISOString() },
              { entity_type: 'quotation', entity_label: 'Quotation #QT-00248 created', created_at: new Date(Date.now() - 14400000).toISOString() },
            ]).slice(0, 6).map((log: any, i: number) => {
              const cfg = activityIcons[log.entity_type] || activityIcons.invoice;
              return (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
                    <cfg.icon className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-foreground leading-snug">{log.entity_label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatRelativeTime(log.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Online Store Overview */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Online Store Overview</h3>
          <Link href="/online-store" className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
            View Dashboard →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Visitors Today', value: '1,450', trend: '+15.2%', positive: true },
            { label: 'Orders Today', value: '36', trend: '+8.6%', positive: true },
            { label: 'Revenue Today', value: formatCurrency(125000), trend: '+12.9%', positive: true },
            { label: 'Conversion Rate', value: '3.2%', trend: '+4.1%', positive: true },
          ].map((stat) => (
            <div key={stat.label} className="bg-muted/40 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className={`text-xs font-medium mt-0.5 ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>{stat.trend}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
