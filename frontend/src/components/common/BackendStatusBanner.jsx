import React, { useState } from 'react';
import { Server, Wifi, WifiOff, RefreshCw, Terminal, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Modal from './Modal';
import Button from './Button';

export default function BackendStatusBanner() {
  const { isGatewayOnline, isCheckingBackend, checkHealth } = useAuth();
  const [showDockerModal, setShowDockerModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed && !isGatewayOnline) return null;

  return (
    <>
      <div className={`w-full text-xs border-b backdrop-blur-md px-4 py-2 transition-colors duration-300 ${
        isGatewayOnline 
          ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-300' 
          : 'bg-indigo-950/40 border-indigo-500/20 text-indigo-300'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isGatewayOnline ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isGatewayOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
            <span className="font-medium">
              {isGatewayOnline ? (
                <>Backend Gateway <span className="font-mono text-emerald-200">http://localhost:9000</span> Connected & Ready</>
              ) : (
                <>Demo Simulation Active &bull; Spring Cloud Gateway (:9000) offline &bull; Full interactive UI active</>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isGatewayOnline && (
              <button
                onClick={() => setShowDockerModal(true)}
                className="underline hover:text-white flex items-center gap-1 font-medium transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                Backend Launch Guide
              </button>
            )}
            <button
              onClick={checkHealth}
              disabled={isCheckingBackend}
              title="Ping Backend API Gateway"
              className="p-1 hover:bg-white/10 rounded transition-colors flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBackend ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Check Gateway</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backend Launch Instructions Modal */}
      <Modal
        isOpen={showDockerModal}
        onClose={() => setShowDockerModal(false)}
        title="Spring Boot Microservices Fleet"
        subtitle="How to run the full Docker Compose stack"
      >
        <div className="space-y-4 text-sm text-slate-300">
          <p>
            The backend consists of 6 Java/Spring Boot microservices, Keycloak, PostgreSQL, Kafka, and Spring Cloud Gateway.
          </p>

          <div className="bg-surface-elevated/90 border border-white/10 rounded-xl p-4 font-mono text-xs text-emerald-300 space-y-2">
            <div className="text-slate-400"># In the project root:</div>
            <div className="flex items-center justify-between">
              <span>docker compose up --build</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-slate-400">API Gateway</div>
              <div className="font-mono text-sm text-white font-medium">http://localhost:9000</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-slate-400">Keycloak Admin</div>
              <div className="font-mono text-sm text-white font-medium">http://localhost:8080</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            <strong>Note:</strong> While Docker is building or offline, this frontend provides seamless, zero-crash simulated persistence and interactive walkthroughs for all 6 demo accounts!
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={() => setShowDockerModal(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
