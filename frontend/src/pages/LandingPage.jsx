import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Award,
  Users,
  Cpu,
  Database,
  GitBranch,
  CheckCircle2,
  Clock,
  Terminal,
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import { useEvent } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTimeRemaining } from '../utils/formatters';

export default function LandingPage() {
  const { currentEvent } = useEvent();
  const { demoAccounts, switchDemoAccount, demoMode } = useAuth();
  const navigate = useNavigate();
  const playAs = (i) => (demoMode ? switchDemoAccount(demoAccounts[i]) : navigate('/login'));

  const features = [
    {
      icon: Cpu,
      title: 'Algorithmic Judging & Z-Scores',
      desc: 'Greedy load-balanced assignment paired with mathematical per-judge z-score standardization to neutralize evaluator leniency or harshness.',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      icon: Users,
      title: 'Frictionless Team Formation',
      desc: 'Create teams, enforce maximum team capacity, and generate revocable, expiring cryptographic invite links for instant onboarding.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: GitBranch,
      title: 'Decentralized Kafka Projections',
      desc: 'Strict microservice domain boundaries. Services maintain local read-model projections via Kafka events without fragile synchronous coupling.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      icon: Shield,
      title: 'Zero-Trust Keycloak OIDC',
      desc: 'Role-based access control (Participant, Judge, Organizer, Admin) verified independently by every microservice with JWT claim validation.',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      icon: Award,
      title: 'Anti-Abuse Community Voting',
      desc: 'Identity-gated community voting with PostgreSQL uniqueness constraints, rate limiting, and hidden results during the voting window.',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: Database,
      title: 'Isolated Postgres Multi-DB',
      desc: 'Each service exclusively owns its schema (userdb, eventdb, teamdb, submissiondb, judgingdb, notificationdb) behind a reactive gateway.',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Live Event Banner Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated/80 border border-white/10 backdrop-blur-md shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-slate-300">
              Demo Event Active: <strong className="text-white">{currentEvent?.name}</strong>
            </span>
            <Badge variant="LIVE" size="sm">LIVE</Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-white leading-[1.08]">
            The Self-Hostable, <br />
            <span className="bg-gradient-to-r from-primary-400 via-indigo-300 to-accent-cyan bg-clip-text text-transparent">
              API-First Hackathon
            </span> Platform.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Form teams with cryptographic invite tokens, submit projects before strict deadlines, and run mathematically sound evaluations with algorithmic judge assignment and z-score normalization.
          </p>

          {/* Primary Call to Action */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/gallery">
              <Button variant="glow" size="lg" icon={ArrowRight}>
                Explore Project Gallery
              </Button>
            </Link>
            <Link to="/submit">
              <Button variant="secondary" size="lg">
                Submit Your Project
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="outline" size="lg">
                View Live Rankings
              </Button>
            </Link>
          </div>

          {/* Event Timeline Quick Strip */}
          {currentEvent && (
            <div className="pt-8">
              <div className="glass-card rounded-2xl p-4 sm:p-5 max-w-2xl mx-auto flex flex-wrap items-center justify-around gap-4 border border-white/10 text-xs">
                <div className="text-center">
                  <span className="text-slate-400 block mb-0.5">Submission Deadline</span>
                  <span className="text-white font-mono font-semibold">
                    {formatDate(currentEvent.submissionDeadline)}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/10 hidden sm:block" />
                <div className="text-center">
                  <span className="text-slate-400 block mb-0.5">Time Remaining</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {formatTimeRemaining(currentEvent.submissionDeadline)}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/10 hidden sm:block" />
                <div className="text-center">
                  <span className="text-slate-400 block mb-0.5">Max Team Size</span>
                  <span className="text-white font-mono font-semibold">
                    {currentEvent.maxTeamSize} Members
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Demo Flow Walkthrough Cards */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="cyan" size="md">DEMO FLOW</Badge>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mt-3">
            One Event Lifecycle in 4 Fast Steps
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Click any demo role below to experience the platform from that persona's perspective.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card hover className="space-y-3 border-emerald-500/20 bg-emerald-950/10">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-display font-bold text-base text-white">1. Form Team & Submit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Login as Pat (Participant), create a team, generate an invite token, invite Robin, and submit your project draft before deadline.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => playAs(0)}
            >
              {demoMode ? 'Play as' : 'Sign in as'} Pat (Participant)
            </Button>
          </Card>

          <Card hover className="space-y-3 border-indigo-500/20 bg-indigo-950/10">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-display font-bold text-base text-white">2. Rubric & Assignment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Login as Ola (Organizer), construct weighted rubric criteria, and run the greedy load-balancing algorithm across judges.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => playAs(2)}
            >
              {demoMode ? 'Play as' : 'Sign in as'} Ola (Organizer)
            </Button>
          </Card>

          <Card hover className="space-y-3 border-amber-500/20 bg-amber-950/10">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-display font-bold text-base text-white">3. Evaluate & Score</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Login as Jan (Judge 1) or Jamie (Judge 2), inspect assigned submissions, evaluate criteria sliders, and submit review scores.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => playAs(3)}
            >
              {demoMode ? 'Play as' : 'Sign in as'} Jan (Judge)
            </Button>
          </Card>

          <Card hover className="space-y-3 border-purple-500/20 bg-purple-950/10">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-display font-bold text-base text-white">4. Z-Score Rankings</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect mathematically standardized rankings with mean and standard deviation adjustments, and download complete CSV exports.
            </p>
            <Link to="/leaderboard" className="block">
              <Button variant="primary" size="sm" className="w-full text-xs">
                Inspect Leaderboard
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Core Technical Highlights Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="primary" size="md">ARCHITECTURE & INTEGRATION</Badge>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight mt-3">
            Built Directly on the Spring Boot Backend
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            No generic mock layers. Every button, form, and data table communicates directly with the Spring Cloud Gateway and microservices fleet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} hover className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${f.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}