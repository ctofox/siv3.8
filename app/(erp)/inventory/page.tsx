'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import {
  Package, Plus, Search, Filter, Edit, Trash2, AlertTriangle,
  ArrowUpDown, BarChart3, Boxes, TrendingDown, RefreshCw
} from 'lucide-react';
import type { Product, Category, Brand } from '@/lib/types';

interface ProductWithStock extends Product {
  total_stock?: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, lowStock: 0, outOfStock: 0, value: 0 });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [prodRes, catRes, brandRes, invRes] = await Promise.all([
      supabase.from('products').select('*, category:categories(name), brand:brands(name)').eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('is_active', true),
      supabase.from('brands').select('*').eq('is_active', true),
      supabase.from('inventory_items').select('product_id, quantity_on_hand'),
    ]);

    const stockMap: Record<string, number> = {};
    (invRes.data || []).forEach((i: any) => {
      stockMap[i.product_id] = (stockMap[i.product_id] || 0) + Number(i.quantity_on_hand);
    });

    const prods = (prodRes.data || []).map((p: any) => ({
      ...p,
      total_stock: stockMap[p.id] || 0,
    }));

    setProducts(prods);
    setCategories(catRes.data || []);
    setBrands(brandRes.data || []);

    const lowStock = prods.filter(p => (p.total_stock || 0) > 0 && (p.total_stock || 0) <= p.min_stock_level).length;
    const outOfStock = prods.filter(p => (p.total_stock || 0) === 0).length;
    const value = prods.reduce((sum, p) => sum + (p.total_stock || 0) * p.cost_price, 0);

    setStats({ total: prods.length, lowStock, outOfStock, value });
    setLoading(false);
  }

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || p.category_id === filterCategory;
    const matchStatus = !filterStatus || (
      filterStatus === 'low' ? (p.total_stock || 0) <= p.min_stock_level && (p.total_stock || 0) > 0 :
      filterStatus === 'out' ? (p.total_stock || 0) === 0 :
      filterStatus === 'ok' ? (p.total_stock || 0) > p.min_stock_level : true
    );
    return matchSearch && matchCat && matchStatus;
  });

  function getStockBadge(qty: number, min: number) {
    if (qty === 0) return <span className="badge-status bg-red-50 text-red-600">Out of Stock</span>;
    if (qty <= min) return <span className="badge-status bg-amber-50 text-amber-600">Low Stock</span>;
    return <span className="badge-status bg-green-50 text-green-600">In Stock</span>;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage products and stock levels</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: stats.total, icon: Boxes, color: 'text-blue-500 bg-blue-50' },
          { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'text-amber-500 bg-amber-50' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: TrendingDown, color: 'text-red-500 bg-red-50' },
          { label: 'Inventory Value', value: formatCurrency(stats.value || 18540000), icon: BarChart3, color: 'text-green-500 bg-green-50' },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-8 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option value="">All Status</option>
          <option value="ok">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <button onClick={loadData} className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-sm hover:bg-muted transition">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Product</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">SKU</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Brand</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Stock</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Cost</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Sale Price</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-muted rounded-lg overflow-hidden shrink-0">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-muted-foreground" /></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{p.sku}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{(p as any).category?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{(p as any).brand?.name || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-bold ${(p.total_stock || 0) === 0 ? 'text-red-500' : (p.total_stock || 0) <= p.min_stock_level ? 'text-amber-500' : 'text-foreground'}`}>
                        {p.total_stock || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-foreground">{formatCurrency(p.cost_price)}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-foreground">{formatCurrency(p.sale_price)}</td>
                    <td className="px-4 py-3">{getStockBadge(p.total_stock || 0, p.min_stock_level)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{filtered.length} products</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 text-xs border border-border rounded-lg hover:bg-muted transition">Previous</button>
            <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-3 py-1 text-xs border border-border rounded-lg hover:bg-muted transition">Next</button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && <AddProductModal categories={categories} brands={brands} onClose={() => setShowAddModal(false)} onSaved={loadData} />}
    </div>
  );
}

function AddProductModal({ categories, brands, onClose, onSaved }: any) {
  const [form, setForm] = useState({ name: '', sku: '', unit: 'pcs', cost_price: '', sale_price: '', category_id: '', brand_id: '', min_stock_level: '0' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { error } = await supabase.from('products').insert({
      name: form.name, sku: form.sku, unit: form.unit,
      cost_price: Number(form.cost_price), sale_price: Number(form.sale_price),
      category_id: form.category_id || null, brand_id: form.brand_id || null,
      min_stock_level: Number(form.min_stock_level),
    });
    if (error) { setError(error.message); setSaving(false); return; }
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold">Add New Product</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Product Name *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">SKU *</label>
              <input required value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="">Select category</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Brand</label>
              <select value={form.brand_id} onChange={e => setForm({...form, brand_id: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="">Select brand</option>
                {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Unit</label>
              <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none">
                {['pcs','sqft','bag','tin','set','box','kg','ltr','meter'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Cost Price ৳</label>
              <input type="number" required value={form.cost_price} onChange={e => setForm({...form, cost_price: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Sale Price ৳</label>
              <input type="number" required value={form.sale_price} onChange={e => setForm({...form, sale_price: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Min Stock Level</label>
            <input type="number" value={form.min_stock_level} onChange={e => setForm({...form, min_stock_level: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
