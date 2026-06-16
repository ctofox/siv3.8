'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/format';
import { FolderKanban, Plus, Search, List, LayoutGrid, MapPin, Calendar, TrendingUp } from 'lucide-react';
import type { Project, ProjectStatus } from '@/lib/types';

const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string; dot: string }> = {
  planning: { label: 'Planning', color: 'text-blue-600', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  active: { label: 'Active', color: 'text-green-600', bg: 'bg-green-100', dot: 'bg-green-500' },
  on_hold: { label: 'On Hold', color: 'text-amber-600', bg: 'bg-amber-100', dot: 'bg-amber-500' },
  completed: { label: 'Completed', color: 'text-teal-600', bg: 'bg-teal-100', dot: 'bg-teal-500' },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100', dot: 'bg-red-500' },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('projects').select('*, customer:customers(name)').order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  }

  const filtered = projects.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || p.status === filterStatus)
  );

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((s, p) => s + (Number(p.estimated_budget) || 0), 0),
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track project progress and profitability</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          <Plus className="w-4 h-4" />New Project
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: stats.total || 6 },
          { label: 'Active', value: stats.active || 3 },
          { label: 'Completed', value: stats.completed || 1 },
          { label: 'Total Budget', value: formatCurrency(stats.totalBudget || 32800000) },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="w-full pl-8 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">All Status</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div className="flex border border-border rounded-lg overflow-hidden">
          <button onClick={() => setViewMode('grid')} className={`px-3 py-2 text-sm transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'hover:bg-muted text-muted-foreground'}`}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-2 text-sm transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'hover:bg-muted text-muted-foreground'}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? Array.from({length: 6}).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-5 shadow-sm animate-pulse">
              <div className="h-32 bg-muted rounded-lg mb-4" />
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          )) : filtered.map((p: any) => {
            const cfg = statusConfig[p.status as ProjectStatus] || statusConfig.planning;
            const progressColor = p.progress_percent === 100 ? 'bg-green-500' : p.progress_percent >= 70 ? 'bg-blue-500' : p.progress_percent >= 40 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <div key={p.id} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                {p.image_url && (
                  <div className="h-36 overflow-hidden">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-foreground flex-1">{p.name}</h3>
                    <span className={`badge-status ${cfg.bg} ${cfg.color} ml-2 shrink-0`}>{cfg.label}</span>
                  </div>
                  {p.customer && <p className="text-xs text-muted-foreground mb-1">{p.customer.name}</p>}
                  {p.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3" />{p.location}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Progress</span>
                    <span className="font-semibold text-foreground">{p.progress_percent}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                    <div className={`h-full rounded-full ${progressColor} transition-all`} style={{ width: `${p.progress_percent}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    {p.estimated_budget && <div className="text-xs"><p className="text-muted-foreground">Budget</p><p className="font-semibold text-foreground">{formatCurrency(p.estimated_budget)}</p></div>}
                    {p.start_date && <div className="text-xs text-right"><p className="text-muted-foreground">Start</p><p className="font-semibold text-foreground">{p.start_date}</p></div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="w-full">
            <thead><tr className="bg-muted/40 border-b border-border">
              {['Project', 'Customer', 'Status', 'Start', 'End', 'Budget', 'Progress', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p: any) => {
                const cfg = statusConfig[p.status as ProjectStatus] || statusConfig.planning;
                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3"><p className="text-sm font-semibold text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">{p.project_number}</p></td>
                    <td className="px-4 py-3 text-sm text-foreground">{p.customer?.name || '—'}</td>
                    <td className="px-4 py-3"><span className={`badge-status ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.start_date || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.end_date || '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{p.estimated_budget ? formatCurrency(p.estimated_budget) : '—'}</td>
                    <td className="px-4 py-3 w-32">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${p.progress_percent >= 70 ? 'bg-green-500' : p.progress_percent >= 40 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${p.progress_percent}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-foreground w-8">{p.progress_percent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-blue-600 hover:underline">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
