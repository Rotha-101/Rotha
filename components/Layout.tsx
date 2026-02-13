
import React from 'react';
import { AppState } from '../types';

interface LayoutProps {
  state: AppState;
  children: React.ReactNode;
  onLogout: () => void;
  onUpdateState: (update: Partial<AppState>) => void;
}

const Layout: React.FC<LayoutProps> = ({ state, children, onLogout, onUpdateState }) => {
  return (
    <div className="flex flex-col h-screen bg-[#0a0f1d] text-slate-200">
      <header className="h-[70px] bg-[#111827] border-b border-[#1f2937] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#38bdf8] flex items-center justify-center rounded shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <i className="fas fa-bolt text-[#0f172a] text-xl"></i>
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight leading-none uppercase">EMS Hourly Operation Report</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Utility-Scale BESS Integrated Control System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Industrial Status Bar Replacing Power Button */}
          <div className="flex items-center gap-5 px-5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-lg shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase text-slate-600 leading-none mb-0.5">System</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase leading-none">Healthy</span>
              </div>
            </div>

            <div className="w-px h-6 bg-slate-800"></div>

            <div className="flex items-center gap-2.5">
              <i className="fas fa-shield-halved text-[12px] text-sky-500/80"></i>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase text-slate-600 leading-none mb-0.5">Link</span>
                <span className="text-[10px] font-black text-sky-400 uppercase leading-none">Secure</span>
              </div>
            </div>

            <div className="w-px h-6 bg-slate-800"></div>

            <div className="flex items-center gap-2.5">
              <i className="fas fa-server text-[12px] text-indigo-500/80"></i>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase text-slate-600 leading-none mb-0.5">Node</span>
                <span className="text-[10px] font-black text-indigo-400 uppercase leading-none">Active</span>
              </div>
            </div>

            <div className="w-px h-6 bg-slate-800"></div>

            <div className="flex items-center gap-2.5">
              <i className="fas fa-database text-[12px] text-slate-500/80"></i>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase text-slate-600 leading-none mb-0.5">Sync</span>
                <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6 bg-[#0a0f1d]">
        {children}
      </main>
    </div>
  );
};

export default Layout;
