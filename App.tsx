
import React, { useState, useEffect, useRef } from 'react';
import { AppState, Shift, ProjectType, ReportData } from './types';
import { GROUPS, OPERATORS, PROJECTS } from './constants';
import { initializeDB, logAudit, saveReport, saveDraft, loadDraft } from './services/db';
import Layout from './components/Layout';
import ReportForm from './components/ReportForm';
import LivePreview from './components/LivePreview';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    operatorId: 'G1-1',
    operatorNames: ['KUY Sotheara'],
    groupId: 1,
    groupName: 'GROUP 1',
    role: 'operator',
    activeProjectId: PROJECTS[0].id,
    activeProjectName: PROJECTS[0].name,
    reportDate: new Date().toISOString().split('T')[0],
    hourInterval: '00:00',
    shift: Shift.A,
    systemReady: true,
  });

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const isInitialMount = useRef(true);

  // Initialize and load saved data
  useEffect(() => {
    initializeDB();
    const draft = loadDraft();
    
    if (draft) {
      setState(draft.state);
      setReportData(draft.reportData);
    } else {
      handleProjectSelect(PROJECTS[0].id);
    }
    isInitialMount.current = false;
  }, []);

  // Autosave whenever state or reportData changes
  useEffect(() => {
    if (!isInitialMount.current && reportData) {
      saveDraft(state, reportData);
    }
  }, [state, reportData]);

  const handleProjectSelect = (projectId: string) => {
    const project = PROJECTS.find(p => p.id === projectId);
    if (!project) return;

    setState(prev => ({
      ...prev,
      activeProjectId: project.id,
      activeProjectName: project.name
    }));

    const initialData: ReportData = {
      capacity: project.capacity,
      bessFunction: {
        peakShifting: true,
        pfc: true,
        qu: true,
        tieLine: project.type === ProjectType.FORMAT_A,
        pvSmoothing: project.type === ProjectType.FORMAT_B,
        manualCharge: { enabled: false, mw: '0', time: '' },
        manualDischarge: { enabled: false, mw: '0', time: '' }
      },
      telemetry: project.type === ProjectType.FORMAT_A ? {
        formatA: {
          sppc1: { soc: 0, cycleToday: '0', cycleMonth: '0', cycleTotal: '0' },
          sppc2: { soc: 0, cycleToday: '0', cycleMonth: '0', cycleTotal: '0' },
          sppc3: { soc: 0, cycleToday: '0', cycleMonth: '0', cycleTotal: '0' },
        }
      } : {
        formatB: {
          soc: 0,
          totalCycle: '0',
          thisMonthCycle: '0',
          todayCycle: '0'
        }
      },
      availability: { 
        ...project.defaults,
        overallJudgment: 'Normal',
        emsNote: ''
      },
      incidents: {
        issue: 'N/A',
        action: 'N/A',
        solvedExpectation: 'N/A'
      }
    };
    setReportData(initialData);
  };

  const resetForm = () => {
    // Clear the specific report data but keep contextual data (Operators, Group, Date)
    if (state.activeProjectId) {
      handleProjectSelect(state.activeProjectId);
    }
    // Remove the draft from storage
    localStorage.removeItem('ems_working_draft');
  };

  const handleLogout = () => {
    window.location.reload();
  };

  const activeProject = PROJECTS.find(p => p.id === state.activeProjectId);

  return (
    <Layout 
      state={state} 
      onLogout={handleLogout}
      onUpdateState={(update) => setState(prev => ({ ...prev, ...update }))}
    >
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-[68%] overflow-y-auto pr-1">
          <ReportForm 
            state={state}
            data={reportData}
            onProjectSelect={handleProjectSelect}
            onUpdateData={(update) => setReportData(prev => prev ? ({ ...prev, ...update }) : null)}
            onUpdateState={(update) => setState(prev => ({ ...prev, ...update }))}
          />
        </div>
        <div className="w-full lg:w-[32%] flex flex-col h-full bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden shadow-2xl">
          <LivePreview 
            state={state} 
            data={reportData} 
            project={activeProject} 
            onSave={() => {
              saveReport({ state, reportData });
              logAudit(`Report submitted: ${state.activeProjectName}`, state.operatorNames.join(', '));
              alert("Report Submitted and Locked in History.");
              resetForm();
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default App;
