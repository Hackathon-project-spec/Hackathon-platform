import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Sparkles, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, demoMode } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const DEMO_CREDENTIALS = [
    { username: 'participant1', role: 'Participant', color: 'text-emerald-400' },
    { username: 'organizer1', role: 'Organizer', color: 'text-amber-400' },
    { username: 'judge1', role: 'Judge', color: 'text-purple-400' },
    { username: 'admin1', role: 'Admin', color: 'text-red-400' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/events');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Check username and password.');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (uname) => {
    setUsername(uname);
    setPassword('Passw0rd!');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6 font-medium group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Logo + Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-display font-black text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-400 mt-1.5">
              Sign in to your HackPort account
            </p>
          </div>

          {/* Demo Quick Fill (only when built with VITE_DEMO_MODE=true) */}
          {demoMode && (
          <div className="mb-6">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-2 text-center">
              Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.username}
                  onClick={() => quickFill(cred.username)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group"
                >
                  <div className={`text-xs font-semibold ${cred.color}`}>{cred.role}</div>
                  <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5 group-hover:text-slate-400 transition-colors">
                    {cred.username}
                  </div>
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider font-mono">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className="w-full glass-input rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider font-mono">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full glass-input rounded-xl px-4 py-3 pr-11 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-900/30 border border-red-500/30 text-xs text-red-300"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              variant="glow"
              size="lg"
              fullWidth
              loading={loading}
              icon={LogIn}
            >
              Sign In
            </Button>
          </form>

          {demoMode && (
            <p className="text-center text-[11px] text-slate-500 mt-5">
              Demo password for all accounts:{' '}
              <span className="font-mono text-slate-300">Passw0rd!</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}