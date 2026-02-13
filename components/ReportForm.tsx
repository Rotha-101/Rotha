
import React from 'react';
import { AppState, ReportData, ProjectType, Shift } from '../types';
import { PROJECTS, OPERATORS, GROUPS } from '../constants';

interface ReportFormProps {
  state: AppState;
  data: ReportData | null;
  onProjectSelect: (id: string) => void;
  onUpdateData: (update: Partial<ReportData>) => void;
  onUpdateState: (update: Partial<AppState>) => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ state, data, onProjectSelect, onUpdateData, onUpdateState }) => {
  const groupProjects = PROJECTS.filter(p => p.groupId === state.groupId);
  const groupOperators = OPERATORS.filter(o => o.groupId === state.groupId);

  const toggleFunction = (key: string) => {
    if (!data) return;
    onUpdateData({
      bessFunction: {
        ...data.bessFunction,
        [key]: !(data.bessFunction as any)[key]
      }
    });
  };

  const handleJudgmentChange = (val: string) => {
    if (!data) return;
    onUpdateData({
      availability: { ...data.availability, overallJudgment: val },
      incidents: val === 'Normal' 
        ? { issue: 'N/A', action: 'N/A', solvedExpectation: 'N/A' }
        : { issue: 'Pending...', action: 'Pending...', solvedExpectation: 'Pending... (DD/MM/YYYY HH:MM)' }
    });
  };

  const toggleOperator = (name: string) => {
    const current = [...state.operatorNames];
    const index = current.indexOf(name);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(name);
    }
    onUpdateState({ operatorNames: current });
  };

  const handleGroupChange = (groupId: number) => {
    const newGroup = GROUPS.find(g => g.id === groupId);
    const firstProject = PROJECTS.find(p => p.groupId === groupId);
    onUpdateState({ 
      groupId, 
      groupName: newGroup?.name || '',
      operatorNames: [], // Reset selected operators when group changes
      activeProjectId: firstProject?.id || null,
      activeProjectName: firstProject?.name || null
    });
    if (firstProject) {
      onProjectSelect(firstProject.id);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  const isFormatA = PROJECTS.find(p => p.id === state.activeProjectId)?.type === ProjectType.FORMAT_A;

  return (
    <div className="space-y-6 pb-20">
      {/* 1. REPORT CONTEXT & OPERATORS */}
      <section className="dashboard-card p-6 border-l-4 border-l-sky-500/30">
        <div className="flex items-center gap-2 mb-6 text-slate-300">
          <i className="fas fa-file-invoice text-sky-400"></i>
          <h2 className="text-[12px] font-black uppercase tracking-widest">1. Report Context & Operators</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-6">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Group Selection</label>
            <select 
              className="w-full input-dark rounded p-2.5 text-xs font-bold appearance-none cursor-pointer" 
              value={state.groupId || ''} 
              onChange={(e) => handleGroupChange(Number(e.target.value))}
            >
              {GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Project / Feed ID</label>
            <select 
              className="w-full input-dark rounded p-2.5 text-xs font-bold appearance-none cursor-pointer" 
              value={state.activeProjectId || ''}
              onChange={(e) => onProjectSelect(e.target.value)}
            >
              <option value="" disabled>SELECT PROJECT...</option>
              {groupProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Reporting Date</label>
            <div className="relative">
              <input 
                type="date" 
                className="w-full input-dark rounded p-2.5 text-xs font-bold" 
                value={state.reportDate}
                onChange={e => onUpdateState({ reportDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Hour (Interval End)</label>
            <select 
              className="w-full input-dark rounded p-2.5 text-xs font-bold mono appearance-none cursor-pointer" 
              value={state.hourInterval}
              onChange={e => onUpdateState({ hourInterval: e.target.value })}
            >
              {hours.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Shift Assignment</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(Shift).map(s => (
              <button
                key={s}
                onClick={() => onUpdateState({ shift: s })}
                className={`py-2 rounded text-[10px] font-bold border transition-all uppercase ${state.shift === s ? 'bg-sky-500/80 text-slate-900 border-sky-400' : 'bg-slate-800/40 text-slate-400 border-slate-700'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">On-Duty Operators (Select Multiple)</label>
          <div className="flex flex-wrap gap-2">
            {groupOperators.map(o => (
              <button
                key={o.id}
                onClick={() => toggleOperator(o.name)}
                className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${state.operatorNames.includes(o.name) ? 'bg-[#38bdf8] text-slate-900 border-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.3)]' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500'}`}
              >
                {o.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. BESS FUNCTION CONTROLS */}
      {data && (
        <section className="dashboard-card p-6 border-l-4 border-l-sky-500/30">
          <div className="flex items-center gap-2 mb-6 text-slate-300">
            <i className="fas fa-microchip text-sky-400"></i>
            <h2 className="text-[12px] font-black uppercase tracking-widest">2. BESS Function Controls</h2>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Peak Shift', key: 'peakShifting' },
              { label: 'PFC', key: 'pfc' },
              { label: 'QU Control', key: 'qu' },
              isFormatA 
                ? { label: 'Tie Line', key: 'tieLine' }
                : { label: 'PV Smoothing', key: 'pvSmoothing' }
            ].map(f => {
              const isActive = (data.bessFunction as any)[f.key];

              return (
                <button
                  key={f.key}
                  onClick={() => toggleFunction(f.key)}
                  className={`flex flex-col items-center justify-center p-4 rounded border transition-all h-20 ${ isActive ? 'bg-sky-500/10 border-sky-500 shadow-[inset_0_0_20px_rgba(56,189,248,0.1)]' : 'bg-slate-800/40 border-slate-700'}`}
                >
                  <span className="text-[10px] uppercase font-black text-slate-300 mb-1">{f.label}</span>
                  <span className={`text-[11px] font-black uppercase ${ isActive ? 'text-sky-400' : 'text-slate-500'}`}>
                    {isActive ? 'Enable' : 'Disable'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 min-w-[160px]">
                   <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-sky-500 rounded cursor-pointer" 
                    checked={data.bessFunction.manualCharge.enabled}
                    onChange={e => onUpdateData({ bessFunction: { ...data.bessFunction, manualCharge: { ...data.bessFunction.manualCharge, enabled: e.target.checked } } })}
                   />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Manual Charging</span>
                </div>
                <div className={`flex items-center gap-3 flex-1 transition-opacity ${!data.bessFunction.manualCharge.enabled ? 'opacity-30' : 'opacity-100'}`}>
                  <input 
                    type="text" 
                    placeholder="MW" 
                    disabled={!data.bessFunction.manualCharge.enabled}
                    value={data.bessFunction.manualCharge.mw}
                    onChange={e => onUpdateData({ bessFunction: { ...data.bessFunction, manualCharge: { ...data.bessFunction.manualCharge, mw: e.target.value } } })}
                    className="input-dark flex-1 p-2.5 text-xs rounded mono text-center" 
                  />
                  <input 
                    type="text" 
                    placeholder="Datetime (HH:MM)" 
                    disabled={!data.bessFunction.manualCharge.enabled}
                    value={data.bessFunction.manualCharge.time}
                    onChange={e => onUpdateData({ bessFunction: { ...data.bessFunction, manualCharge: { ...data.bessFunction.manualCharge, time: e.target.value } } })}
                    className="input-dark flex-1 p-2.5 text-xs rounded mono text-center" 
                  />
                </div>
             </div>
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 min-w-[160px]">
                   <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-sky-500 rounded cursor-pointer" 
                    checked={data.bessFunction.manualDischarge.enabled}
                    onChange={e => onUpdateData({ bessFunction: { ...data.bessFunction, manualDischarge: { ...data.bessFunction.manualDischarge, enabled: e.target.checked } } })}
                   />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Manual Discharging</span>
                </div>
                <div className={`flex items-center gap-3 flex-1 transition-opacity ${!data.bessFunction.manualDischarge.enabled ? 'opacity-30' : 'opacity-100'}`}>
                  <input 
                    type="text" 
                    placeholder="MW" 
                    disabled={!data.bessFunction.manualDischarge.enabled}
                    value={data.bessFunction.manualDischarge.mw}
                    onChange={e => onUpdateData({ bessFunction: { ...data.bessFunction, manualDischarge: { ...data.bessFunction.manualDischarge, mw: e.target.value } } })}
                    className="input-dark flex-1 p-2.5 text-xs rounded mono text-center" 
                  />
                  <input 
                    type="text" 
                    placeholder="Datetime (HH:MM)" 
                    disabled={!data.bessFunction.manualDischarge.enabled}
                    value={data.bessFunction.manualDischarge.time}
                    onChange={e => onUpdateData({ bessFunction: { ...data.bessFunction, manualDischarge: { ...data.bessFunction.manualDischarge, time: e.target.value } } })}
                    className="input-dark flex-1 p-2.5 text-xs rounded mono text-center" 
                  />
                </div>
             </div>
          </div>
        </section>
      )}

      {/* 3. STORAGE TELEMETRY */}
      {data && (
        <section className="dashboard-card p-6 border-l-4 border-l-sky-500/30">
          <div className="flex items-center gap-2 mb-6 text-slate-300">
            <i className="fas fa-chart-line text-sky-400"></i>
            <h2 className="text-[12px] font-black uppercase tracking-widest">3. Storage Telemetry (SOC & Cycles)</h2>
          </div>
          
          <div className="space-y-8">
            {data.telemetry.formatA ? (
              ['sppc1', 'sppc2', 'sppc3'].map((key) => {
                const sppc = (data.telemetry.formatA as any)[key];
                return (
                  <div key={key} className="space-y-3">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{key.toUpperCase()} SOC (%)</label>
                    <div className="grid grid-cols-4 gap-6 items-end">
                       <input 
                        type="number" 
                        value={sppc.soc} 
                        onChange={e => onUpdateData({ telemetry: { ...data.telemetry, formatA: { ...data.telemetry.formatA, [key]: { ...sppc, soc: Number(e.target.value) } } } })}
                        className="input-dark p-3 text-2xl font-black text-sky-400 rounded-lg text-left" 
                       />
                       <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-black text-slate-600 mb-1.5">Cycle (Today)</span>
                          <input type="text" value={sppc.cycleToday} onChange={e => onUpdateData({ telemetry: { ...data.telemetry, formatA: { ...data.telemetry.formatA, [key]: { ...sppc, cycleToday: e.target.value } } } })} className="input-dark p-2.5 text-xs mono text-center rounded-lg" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-black text-slate-600 mb-1.5">Cycle (Month)</span>
                          <input type="text" value={sppc.cycleMonth} onChange={e => onUpdateData({ telemetry: { ...data.telemetry, formatA: { ...data.telemetry.formatA, [key]: { ...sppc, cycleMonth: e.target.value } } } })} className="input-dark p-2.5 text-xs mono text-center rounded-lg" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-black text-slate-600 mb-1.5">Cycle (Total)</span>
                          <input type="text" value={sppc.cycleTotal} onChange={e => onUpdateData({ telemetry: { ...data.telemetry, formatA: { ...data.telemetry.formatA, [key]: { ...sppc, cycleTotal: e.target.value } } } })} className="input-dark p-2.5 text-xs mono text-center rounded-lg" />
                       </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="grid grid-cols-4 gap-6 items-end">
                <div className="space-y-3">
                   <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">SOC (%)</label>
                   <input 
                    type="number" 
                    value={data.telemetry.formatB?.soc} 
                    onChange={e => onUpdateData({ telemetry: { ...data.telemetry, formatB: { ...data.telemetry.formatB!, soc: Number(e.target.value) } } })}
                    className="input-dark p-3 text-2xl font-black text-sky-400 rounded-lg text-left w-full" 
                   />
                </div>
                <div className="space-y-2 flex flex-col">
                   <label className="text-[9px] font-black text-slate-600 uppercase mb-1.5">Today Cycle</label>
                   <input type="text" value={data.telemetry.formatB?.todayCycle} onChange={e => onUpdateData({ telemetry: { ...data.telemetry, formatB: { ...data.telemetry.formatB!, todayCycle: e.target.value } } })} className="input-dark p-2.5 text-xs mono text-center rounded-lg w-full" />
                </div>
                <div className="space-y-2 flex flex-col">
                   <label className="text-[9px] font-black text-slate-600 uppercase mb-1.5">Month Cycle</label>
                   <input type="text" value={data.telemetry.formatB?.thisMonthCycle} onChange={e => onUpdateData({ telemetry: { ...data.telemetry, formatB: { ...data.telemetry.formatB!, thisMonthCycle: e.target.value } } })} className="input-dark p-2.5 text-xs mono text-center rounded-lg w-full" />
                </div>
                <div className="space-y-2 flex flex-col">
                   <label className="text-[9px] font-black text-slate-600 uppercase mb-1.5">Total Cycle</label>
                   <input type="text" value={data.telemetry.formatB?.totalCycle} onChange={e => onUpdateData({ telemetry: { ...data.telemetry, formatB: { ...data.telemetry.formatB!, totalCycle: e.target.value } } })} className="input-dark p-2.5 text-xs mono text-center rounded-lg w-full" />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. AVAILABILITY & JUDGMENT */}
      {data && (
        <section className="dashboard-card p-6 border-l-4 border-l-sky-500/30">
          <div className="flex items-center gap-2 mb-6 text-slate-300">
            <i className="fas fa-heartbeat text-sky-400"></i>
            <h2 className="text-[12px] font-black uppercase tracking-widest">4. System Availability & Judgment</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">BESS Online</label>
              <input value={data.availability.bessOnline} onChange={e => onUpdateData({ availability: { ...data.availability, bessOnline: e.target.value } })} className="input-dark p-2.5 text-xs rounded-lg w-full mono" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">PCS Online</label>
              <input value={data.availability.pcsOnline} onChange={e => onUpdateData({ availability: { ...data.availability, pcsOnline: e.target.value } })} className="input-dark p-2.5 text-xs rounded-lg w-full mono" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Transformer</label>
              <input value={data.availability.transformerOnline} onChange={e => onUpdateData({ availability: { ...data.availability, transformerOnline: e.target.value } })} className="input-dark p-2.5 text-xs rounded-lg w-full mono" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">EMS Status</label>
              <select 
                value={data.availability.emsStatus} 
                onChange={e => onUpdateData({ availability: { ...data.availability, emsStatus: e.target.value as any } })} 
                className={`input-dark p-2.5 text-xs rounded-lg w-full font-bold ${data.availability.emsStatus === 'Abnormal' ? 'border-red-500 text-red-400' : ''}`}
              >
                <option value="Normal">NORMAL</option>
                <option value="Abnormal">ABNORMAL</option>
              </select>
            </div>
          </div>

          {data.availability.emsStatus === 'Abnormal' && (
            <div className="mb-6 space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] uppercase font-bold text-red-500 block">EMS Abnormal Status Note (Required)</label>
              <textarea 
                placeholder="Enter details about EMS abnormal status..."
                value={data.availability.emsNote || ''} 
                onChange={e => onUpdateData({ availability: { ...data.availability, emsNote: e.target.value } })} 
                className="input-dark w-full h-16 p-3 text-xs rounded-lg resize-none border-red-500/50" 
              />
            </div>
          )}

          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Overall Operational Judgment</label>
                <select 
                  value={data.availability.overallJudgment} 
                  onChange={e => handleJudgmentChange(e.target.value)} 
                  className={`input-dark p-3 text-sm rounded-lg w-full font-black tracking-widest ${data.availability.overallJudgment === 'Abnormal' ? 'border-red-500 text-red-400' : 'border-emerald-500 text-emerald-400'}`}
                >
                  <option value="Normal">NORMAL OPERATION</option>
                  <option value="Abnormal">ABNORMAL OPERATION</option>
                </select>
             </div>
             
             <div className={`grid grid-cols-1 gap-4 p-4 rounded-lg transition-all ${data.availability.overallJudgment === 'Abnormal' ? 'bg-red-500/5 border border-red-500/20' : ''}`}>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={`text-[10px] uppercase font-bold block ${data.availability.overallJudgment === 'Abnormal' ? 'text-red-500' : 'text-slate-500'}`}>
                      +Issue Details {data.availability.overallJudgment === 'Abnormal' && '(Required)'}
                    </label>
                    <textarea 
                      value={data.incidents.issue} 
                      onChange={e => onUpdateData({ incidents: { ...data.incidents, issue: e.target.value } })} 
                      className={`input-dark w-full h-16 p-3 text-xs rounded-lg resize-none ${data.availability.overallJudgment === 'Abnormal' ? 'border-red-500/40' : ''}`} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`text-[10px] uppercase font-bold block ${data.availability.overallJudgment === 'Abnormal' ? 'text-red-500' : 'text-slate-500'}`}>
                      +Action Taken {data.availability.overallJudgment === 'Abnormal' && '(Required)'}
                    </label>
                    <textarea 
                      value={data.incidents.action} 
                      onChange={e => onUpdateData({ incidents: { ...data.incidents, action: e.target.value } })} 
                      className={`input-dark w-full h-16 p-3 text-xs rounded-lg resize-none ${data.availability.overallJudgment === 'Abnormal' ? 'border-red-500/40' : ''}`} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`text-[10px] uppercase font-bold block ${data.availability.overallJudgment === 'Abnormal' ? 'text-red-500' : 'text-slate-500'}`}>
                      +Solved Expectation (Datetime) {data.availability.overallJudgment === 'Abnormal' && '(Required)'}
                    </label>
                    <textarea 
                      placeholder="DD/MM/YYYY HH:MM"
                      value={data.incidents.solvedExpectation} 
                      onChange={e => onUpdateData({ incidents: { ...data.incidents, solvedExpectation: e.target.value } })} 
                      className={`input-dark w-full h-16 p-3 text-xs rounded-lg resize-none ${data.availability.overallJudgment === 'Abnormal' ? 'border-red-500/40' : ''}`} 
                    />
                  </div>
                </div>
             </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ReportForm;
