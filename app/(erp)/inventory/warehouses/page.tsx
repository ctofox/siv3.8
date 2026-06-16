'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Warehouse, Plus, MapPin } from 'lucide-react';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('warehouses').select('*').then(({ data }) => { setWarehouses(data || []); setLoading(false); });
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Warehouses</h1><p className="text-muted-foreground text-sm mt-0.5">Manage storage locations</p></div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"><Plus className="w-4 h-4" />Add Warehouse</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? Array.from({length: 3}).map((_, i) => <div key={i} className="stat-card animate-pulse h-40" />) :
          warehouses.map(w => (
            <div key={w.id} className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Warehouse className="w-5 h-5 text-blue-600" /></div>
                {w.is_default && <span className="badge-status bg-green-50 text-green-600">Default</span>}
              </div>
              <h3 className="font-bold text-foreground">{w.name}</h3>
              <p className="text-xs text-muted-foreground font-mono">{w.code}</p>
              {w.address && <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{w.address}</div>}
              <div className="mt-3 pt-3 border-t border-border"><p className="text-xs text-muted-foreground">City: {w.city || '—'}</p></div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
