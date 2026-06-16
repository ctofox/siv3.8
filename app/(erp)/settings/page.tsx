'use client';

import { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Building2, Globe, Database } from 'lucide-react';

type SettingsTab = 'general' | 'profile' | 'notifications' | 'security' | 'appearance';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [darkMode, setDarkMode] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Configure your ERP system preferences</p>
      </div>

      <div className="flex gap-5">
        {/* Sidebar nav */}
        <div className="w-48 shrink-0">
          <nav className="space-y-0.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-border shadow-sm">
          {activeTab === 'general' && (
            <div>
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-bold">General Settings</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Configure your business information</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">SI Building Solutions</h3>
                    <p className="text-xs text-muted-foreground">Construction Materials & Home Improvement</p>
                    <button className="text-xs text-blue-600 hover:underline mt-1">Change Logo</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium mb-1">Company Name</label><input defaultValue="SI Building Solutions" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                  <div><label className="block text-xs font-medium mb-1">Trade License #</label><input defaultValue="TRAD-2024-001234" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                  <div><label className="block text-xs font-medium mb-1">Phone</label><input defaultValue="+880 1711-000000" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                  <div><label className="block text-xs font-medium mb-1">Email</label><input defaultValue="info@sibuilding.com" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                  <div className="col-span-2"><label className="block text-xs font-medium mb-1">Address</label><input defaultValue="123 Industrial Area, Dhaka, Bangladesh" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium mb-1">Currency</label>
                    <select className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none">
                      <option value="BDT">BDT — Bangladeshi Taka (৳)</option>
                      <option value="USD">USD — US Dollar ($)</option>
                    </select>
                  </div>
                  <div><label className="block text-xs font-medium mb-1">Date Format</label>
                    <select className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none">
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-bold">Appearance</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Customize the look and feel</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Switch to dark interface theme</p>
                  </div>
                  <button onClick={() => setDarkMode(!darkMode)} className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-muted'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium mb-3">Interface Mode</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['Desktop ERP', 'Mobile ERP'].map(mode => (
                      <button key={mode} className={`p-4 rounded-xl border-2 text-center text-sm font-medium transition ${mode === 'Desktop ERP' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-border text-muted-foreground hover:border-blue-300'}`}>
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-3">Color Theme</p>
                  <div className="flex gap-2">
                    {['#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626'].map(color => (
                      <button key={color} className={`w-8 h-8 rounded-full border-2 ${color === '#2563eb' ? 'border-slate-900 scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-bold">Security</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Manage account security settings</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-700">Your account is secure</p>
                    <p className="text-xs text-green-600">2FA and RBAC are active for all users</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Change Password</h3>
                  <div className="space-y-3">
                    <div><label className="block text-xs font-medium mb-1">Current Password</label><input type="password" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                    <div><label className="block text-xs font-medium mb-1">New Password</label><input type="password" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                    <div><label className="block text-xs font-medium mb-1">Confirm Password</label><input type="password" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">Update Password</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-bold">Notifications</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Configure alert preferences</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Low stock alerts', desc: 'Get notified when products reach minimum stock level', enabled: true },
                  { label: 'New orders', desc: 'Alert for new online store orders', enabled: true },
                  { label: 'Payment received', desc: 'Notify when customer payment is recorded', enabled: true },
                  { label: 'Overdue invoices', desc: 'Daily digest of overdue invoices', enabled: false },
                  { label: 'Delivery updates', desc: 'Status changes for deliveries', enabled: true },
                  { label: 'Purchase order approvals', desc: 'Notify managers for PO approval', enabled: true },
                ].map(n => (
                  <div key={n.label} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <button className={`relative w-10 h-5 rounded-full transition-colors ${n.enabled ? 'bg-blue-600' : 'bg-muted'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${n.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-bold">My Profile</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">A</div>
                  <div>
                    <button className="text-xs text-blue-600 hover:underline">Upload Photo</button>
                    <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG. Max 2MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium mb-1">Full Name</label><input defaultValue="Admin User" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                  <div><label className="block text-xs font-medium mb-1">Phone</label><input defaultValue="+880 1711-000000" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                  <div><label className="block text-xs font-medium mb-1">Email</label><input defaultValue="admin@sibuilding.com" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                  <div><label className="block text-xs font-medium mb-1">Role</label><input defaultValue="Super Admin" readOnly className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 text-muted-foreground" /></div>
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
            <button className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
