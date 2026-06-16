'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/lib/format';
import {
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Moon,
  Sun,
} from 'lucide-react';
import type { Profile } from '@/lib/types';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) setProfile(data);
      else {
        setProfile({
          id: user.id,
          tenant_id: '00000000-0000-0000-0000-000000000001',
          full_name: user.email?.split('@')[0] || 'Admin',
          email: user.email || '',
          role: 'super_admin',
          is_active: true,
          created_at: '',
          updated_at: '',
        });
      }
    }
    loadProfile();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  const roleLabel: Record<string, string> = {
    super_admin: 'Super Admin',
    manager: 'Manager',
    sales_executive: 'Sales Executive',
    inventory_manager: 'Inventory Manager',
    accountant: 'Accountant',
    delivery_staff: 'Delivery Staff',
  };

  return (
    <header className="h-14 bg-white border-b border-border flex items-center px-4 gap-4 sticky top-0 z-30">
      {/* Date range badge */}
      <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 border border-border px-2.5 py-1.5 rounded-lg ml-auto">
        <span className="text-muted-foreground">
          {new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
        <span>–</span>
        <span>
          {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
        <ChevronDown className="w-3 h-3" />
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything..."
            className="w-full pl-8 pr-16 py-1.5 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-white border border-border px-1.5 py-0.5 rounded font-mono">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            8
          </span>
        </button>

        {/* Messages */}
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* User menu */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {profile ? getInitials(profile.full_name || profile.email) : 'A'}
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <div className="text-xs font-semibold text-foreground truncate max-w-[100px]">
                {profile?.full_name || 'Admin User'}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {roleLabel[profile?.role || ''] || 'Super Admin'}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-border rounded-xl shadow-lg z-50 py-1 animate-fade-in">
                <div className="px-3 py-2 border-b border-border">
                  <div className="text-sm font-semibold">{profile?.full_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
                </div>
                <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={() => setShowUserMenu(false)}>
                  <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                  Settings
                </Link>
                <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={() => setShowUserMenu(false)}>
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  My Profile
                </Link>
                <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={() => setShowUserMenu(false)}>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  Help & Support
                </Link>
                <div className="border-t border-border mt-1">
                  <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-red-50 text-red-600 transition-colors w-full">
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
