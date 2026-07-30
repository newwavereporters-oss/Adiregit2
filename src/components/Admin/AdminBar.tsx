import React, { useEffect, useState } from 'react';
import { Lock, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { AdminUser } from '../../types/admin';

interface AdminBarProps {
  currentAdmin: AdminUser | null;
  onNavigateDashboard: () => void;
  onLogout: () => void;
}

export const AdminBar: React.FC<AdminBarProps> = ({
  currentAdmin,
  onNavigateDashboard,
  onLogout,
}) => {
  const [adminSession, setAdminSession] = useState<AdminUser | null>(currentAdmin);

  useEffect(() => {
    setAdminSession(currentAdmin);
  }, [currentAdmin]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Supabase Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const admin: AdminUser = {
          id: session.user.id,
          fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Admin',
          email: session.user.email || '',
          role: 'Master Admin',
          registeredAt: session.user.created_at || new Date().toISOString(),
        };
        setAdminSession(admin);
      } else if (session === null) {
        // Fallback to local storage if present
        const savedSession = localStorage.getItem('dsp_admin_session');
        if (savedSession) {
          try {
            setAdminSession(JSON.parse(savedSession));
          } catch {
            setAdminSession(null);
          }
        } else {
          setAdminSession(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!adminSession) return null;

  const initial = adminSession.fullName.charAt(0).toUpperCase() || 'A';

  return (
    <div className="fixed top-3 right-3 sm:right-6 z-50 animate-fade-in">
      <div className="flex items-center gap-2 sm:gap-3 bg-[#1B2A4A]/95 text-white backdrop-blur-md px-3.5 py-2 rounded-full border border-[#D1B464]/30 shadow-xl">
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-[#D1B464] text-[#1B2A4A] flex items-center justify-center font-bold text-xs shadow-xs">
          {initial}
        </div>

        {/* Info Badge */}
        <div className="hidden md:flex flex-col text-left pr-1">
          <div className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D1B464]" />
            <span>Admin Mode</span>
          </div>
          <span className="text-[10px] text-gray-300 truncate max-w-[120px]">
            {adminSession.fullName}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 pl-1 border-l border-white/10">
          <button
            onClick={onNavigateDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D1B464] text-[#1B2A4A] hover:bg-[#c4a453] transition-all font-bold text-[11px] uppercase tracking-wider cursor-pointer"
            title="Go to Admin Dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <button
            onClick={onLogout}
            className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Log Out Admin"
          >
            <LogOut className="w-3.5 h-3.5 text-red-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
