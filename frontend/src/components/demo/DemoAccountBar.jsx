import React from 'react';
import { UserCheck, Shield, Award, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getStoredToken } from '../../api/client';

export default function DemoAccountBar() {
  const { user, demoAccounts, switchDemoAccount, loading } = useAuth();
  const { showToast } = useNotifications();

  const handleSwitch = async (account) => {
    // Only skip re-authenticating if we already hold a REAL token for this
    // identity. On first load there is no stored token yet even though a
    // default persona is shown for display purposes — matching on id alone
    // would let that placeholder silently block the very first login.
    if (user?.id === account.id && getStoredToken()) return;
    try {
      await switchDemoAccount(account);
      showToast(`Switched identity to ${account.name} (${account.role})`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ORGANIZER': return <Shield className="w-3.5 h-3.5 text-indigo-400" />;
      case 'ADMIN': return <Shield className="w-3.5 h-3.5 text-rose-400" />;
      case 'JUDGE': return <Award className="w-3.5 h-3.5 text-amber-400" />;
      default: return <Users className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-surface/90 border-y border-white/10 backdrop-blur-md px-4 py-2.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Label */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <span className="p-1 rounded-md bg-primary-500/20 text-primary-400">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="font-semibold text-white">Hackathon Demo Switcher:</span>
          <span className="text-slate-400 hidden sm:inline">One-click switch between the 6 seeded identities</span>
        </div>

        {/* Buttons list */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {demoAccounts.map(account => {
            const isSelected = user?.id === account.id || user?.email === account.email;
            return (
              <button
                key={account.id}
                onClick={() => handleSwitch(account)}
                disabled={loading}
                title={`${account.name} — ${account.desc}`}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap
                  ${isSelected
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30 ring-1 ring-primary-400'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5'}
                `}
              >
                {getRoleIcon(account.role)}
                <span>{account.name.split(' ')[0]}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-mono uppercase ${
                  isSelected ? 'bg-primary-700/60 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  {account.role.substring(0, 4)}
                </span>
                {isSelected && <UserCheck className="w-3 h-3 text-emerald-300 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
