import React from 'react';
import { Zap, Layers, Cpu, ShieldCheck, Database, GitBranch } from 'lucide-react';

export default function Footer() {
  const stackPills = [
    { label: 'Spring Cloud Gateway (:9000)', icon: Layers },
    { label: 'Keycloak 25 OIDC (:8080)', icon: ShieldCheck },
    { label: 'Kafka Event Projections (:9092)', icon: GitBranch },
    { label: 'Postgres Multi-DB (:5432)', icon: Database },
    { label: 'Per-Judge Z-Score Normalization', icon: Cpu },
  ];

  return (
    <footer className="w-full border-t border-white/10 bg-background py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">
              HACKATHON RAPTORS
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            API-first, domain-driven hackathon platform with decentralized event sourcing, automated judge load-balancing, and mathematical scoring normalization.
          </p>
        </div>

        {/* Architecture Badges */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 max-w-xl">
          {stackPills.map((pill, i) => {
            const Icon = pill.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-elevated border border-white/10 text-xs text-slate-300 font-mono"
              >
                <Icon className="w-3.5 h-3.5 text-primary-400" />
                <span>{pill.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          &copy; {new Date().getFullYear()} Raptors Platform. Built for high-stakes hackathon production and judging demos.
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="text-emerald-400">Spring Boot 3.3.3</span>
          <span>&bull;</span>
          <span className="text-indigo-400">Keycloak OIDC</span>
          <span>&bull;</span>
          <span className="text-cyan-400">React + Vite + Tailwind</span>
        </div>
      </div>
    </footer>
  );
}
