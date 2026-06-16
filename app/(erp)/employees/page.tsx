'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/format';
import { UserRound, Plus, Search, Edit, Users, DollarSign, Briefcase } from 'lucide-react';
import type { Employee } from '@/lib/types';

const deptColors: Record<string, string> = {
  Sales: 'bg-blue-100 text-blue-700',
  Warehouse: 'bg-orange-100 text-orange-700',
  Finance: 'bg-green-100 text-green-700',
  Logistics: 'bg-purple-100 text-purple-700',
  HR: 'bg-pink-100 text-pink-700',
  Management: 'bg-indigo-100 text-indigo-700',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('employees').select('*').order('full_name');
    setEmployees(data || []);
    setLoading(false);
  }

  const filtered = employees.filter(e =>
    (!search || e.full_name.toLowerCase().includes(search.toLowerCase()) || e.employee_id.toLowerCase().includes(search.toLowerCase())) &&
    (!filterDept || e.department === filterDept)
  );

  const departments = Array.from(new Set(employees.map(e => e.department)));
  const totalSalary = employees.reduce((s, e) => s + e.salary, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage HR, attendance and payroll</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          <Plus className="w-4 h-4" />Add Employee
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: employees.length || 8, icon: Users },
          { label: 'Active', value: employees.filter(e => e.status === 'active').length || 8, icon: UserRound },
          { label: 'Departments', value: departments.length || 5, icon: Briefcase },
          { label: 'Monthly Payroll', value: formatCurrency(totalSalary || 234000), icon: DollarSign },
        ].map(s => (
          <div key={s.label} className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center"><s.icon className="w-5 h-5 text-blue-500" /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold text-foreground">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..." className="w-full pl-8 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? Array.from({length: 8}).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-5 shadow-sm animate-pulse">
            <div className="w-14 h-14 bg-muted rounded-full mx-auto mb-3" />
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-3 bg-muted rounded w-2/3 mx-auto" />
          </div>
        )) : filtered.map(emp => (
          <div key={emp.id} className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                  {emp.full_name.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <h3 className="text-sm font-semibold text-foreground">{emp.full_name}</h3>
                <p className="text-xs text-muted-foreground">{emp.designation}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Department</span>
                <span className={`badge-status ${deptColors[emp.department] || 'bg-gray-100 text-gray-700'}`}>{emp.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Salary</span>
                <span className="text-xs font-semibold text-foreground">{formatCurrency(emp.salary)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Joined</span>
                <span className="text-xs text-foreground">{emp.join_date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className={`badge-status ${emp.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{emp.status}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex gap-2">
              <button className="flex-1 text-xs border border-border rounded-lg py-1.5 hover:bg-muted transition text-center">Edit</button>
              <button className="flex-1 text-xs border border-border rounded-lg py-1.5 hover:bg-muted transition text-center">Attendance</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
