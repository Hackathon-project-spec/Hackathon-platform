import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Zap,
  LayoutGrid,
  Users,
  Send,
  Scale,
  Settings,
  Trophy,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { useNotifications } from '../../context/NotificationContext';
import Badge from './Badge';

export default function Navbar() {
  const location = useLocation();
  const { user, role, isOrganizer, isJudge, isParticipant, logout } = useAuth();
  const { currentEvent } = useEvent();
  const { notifications, unreadCount, markRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Gallery', path: '/gallery', icon: LayoutGrid },
    { label: 'Teams', path: '/teams', icon: Users },
    { label: 'Submit', path: '/submit', icon: Send, highlight: true },
    { label: 'Judging', path: '/judging', icon: Scale, badge: isJudge ? 'Your Queue' : null },
    { label: 'Organizer', path: '/organizer', icon: Settings, badge: isOrganizer ? 'Admin' : null },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-accent-cyan flex items-center justify-center text-white shadow-glow-primary group-hover:scale-105 transition-transform duration-200">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="font-display font-extrabold text-xl text-white tracking-tight flex items-center gap-1.5">
                  RAPTORS
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-primary-500/20 text-primary-400 border border-primary-500/30">
                    PLATFORM
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 block -mt-1 font-medium">
                  {currentEvent?.name || 'Hackathon Demo'}
                </span>
              </div>
            </Link>

            {/* Event status pill */}
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-white/10">
              <Badge variant={currentEvent?.status || 'LIVE'} dot size="sm">
                {currentEvent?.status || 'LIVE'}
              </Badge>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-primary-600/15 text-primary-400 border border-primary-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'}
                    ${link.highlight && !active ? 'text-primary-300 hover:text-primary-200' : ''}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] bg-primary-500/20 text-primary-300 px-1.5 py-0.2 rounded font-mono">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action: Notifications & Current User */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors focus:outline-none"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-cyan ring-2 ring-background animate-pulse" />
                )}
              </button>

              {/* Notification Dropdown */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl border border-white/15 p-4 shadow-2xl z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    <span className="text-xs text-slate-400">{unreadCount} unread</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No notifications yet</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                            n.read ? 'bg-white/5 text-slate-400' : 'bg-primary-500/10 text-slate-200 border border-primary-500/20'
                          }`}
                        >
                          <p>{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <div className="flex items-center gap-2.5 bg-surface-elevated/80 border border-white/10 rounded-2xl px-3 py-1.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                    {role}
                  </div>
                </div>
                <Badge variant={role} size="sm" className="ml-1">
                  {role}
                </Badge>
              </div>

              <button
                onClick={logout}
                title="Log out session"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/5 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-b border-white/10 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium
                  ${active
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                    : 'text-slate-300 hover:bg-white/5'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded font-mono">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-xs text-white uppercase">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-slate-400 uppercase font-mono">{role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-xs text-rose-400 hover:underline flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
