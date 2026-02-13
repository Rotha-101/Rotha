import React, { useRef, useState, useEffect } from 'react';
import { AppState, ReportData, ProjectType, Project, ManualOperation } from '../types';
import * as htmlToImage from 'html-to-image';

interface LivePreviewProps {
  state: AppState;
  data: ReportData | null;
  project?: Project;
  onSave: () => void;
}

const LivePreview: React.FC<LivePreviewProps> = ({ state, data, project, onSave }) => {
  const [manualText, setManualText] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset manual edits when the context (Project or Hour) changes
  useEffect(() => {
    setManualText(null);
  }, [state.activeProjectId, state.hourInterval]);

  const generateReportText = () => {
    if (!data || !project) return "";

    const formatManualOp = (op: ManualOperation) => {
      if (!op.enabled) return 'N/A';
      return `${op.mw}MW (${op.time})`;
    };

    const formattedDate = new Date(state.reportDate).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });

    const emsStatusLine = data.availability.emsStatus === 'Abnormal' 
      ? `EMS Status: ${data.availability.emsStatus}\n +Note: ${data.availability.emsNote || 'N/A'}` 
      : `EMS Status: ${data.availability.emsStatus}`;

    if (project.type === ProjectType.FORMAT_A) {
      const d = data.telemetry.formatA!;
      return `Name: ${project.name}
Hourly Report
Date: ${formattedDate}
Shift: ${state.shift}
OP: ${state.operatorNames.join(', ') || '---'}
----------------------------

BESS Function:
-Peak Shifting: ${data.bessFunction.peakShifting ? 'Enable' : 'Disable'}
-PFC: ${data.bessFunction.pfc ? 'Enable' : 'Disable'}
-QU: ${data.bessFunction.qu ? 'Enable' : 'Disable'}
-Tie Line: ${data.bessFunction.tieLine ? 'Enable' : 'Disable'}

BESS Data:
-SPPC 1: SOC = ${d.sppc1.soc}% (5%-95%), Cycle = Today: ${d.sppc1.cycleToday}/This Month: ${d.sppc1.cycleMonth}/Total: ${d.sppc1.cycleTotal}
-SPPC 2: SOC = ${d.sppc2.soc}% (5%-95%), Cycle = Today: ${d.sppc2.cycleToday}/This Month: ${d.sppc2.cycleMonth}/Total: ${d.sppc2.cycleTotal}
-SPPC 3: SOC = ${d.sppc3.soc}% (5%-95%), Cycle = Today: ${d.sppc3.cycleToday}/This Month: ${d.sppc3.cycleMonth}/Total: ${d.sppc3.cycleTotal}

System Availability:
-BESS Online: ${data.availability.bessOnline}
-PCS Online: ${data.availability.pcsOnline}
-Transformer Online: ${data.availability.transformerOnline}
-${emsStatusLine}

Overall Judgment: ${data.availability.overallJudgment}
 +Issue: ${data.incidents.issue || 'N/A'}
 +Action: ${data.incidents.action || 'N/A'}
 +Solved Expectation: ${data.incidents.solvedExpectation || 'N/A'}`;
    } else {
      const d = data.telemetry.formatB!;
      return `Name: ${project.siteName}
Hourly Report
Date: ${formattedDate}
Shift: ${state.shift}
OP: ${state.operatorNames.join(', ') || '---'}
----------------------------

BESS Function:
-PV Smoothing: ${data.bessFunction.pvSmoothing ? 'Enable' : 'Disable'}
-PFC: ${data.bessFunction.pfc ? 'Enable' : 'Disable'}
-QU: ${data.bessFunction.qu ? 'Enable' : 'Disable'}
-Peak Shifting:
Manual Charge: ${formatManualOp(data.bessFunction.manualCharge)}
Manual Discharge: ${formatManualOp(data.bessFunction.manualDischarge)}

BESS Data:
-SOC = ${d.soc}% (5%-95%)
-Total Cycle = ${d.totalCycle}
-This Month Cycle = ${d.thisMonthCycle}
-Today Cycle = ${d.todayCycle}

System Availability:
-BESS Online: ${data.availability.bessOnline}
-PCS Online: ${data.availability.pcsOnline}
-Transformer Online: ${data.availability.transformerOnline}
-${emsStatusLine}

Overall Judgment: ${data.availability.overallJudgment}
 +Issue: ${data.incidents.issue || 'N/A'}
 +Action: ${data.incidents.action || 'N/A'}
 +Solved Expectation: ${data.incidents.solvedExpectation || 'N/A'}`;
    }
  };

  const copyAsImage = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 150));

    try {
      const blob = await htmlToImage.toBlob(reportRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
      });

      if (blob) {
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        onSave();
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const copyAsText = () => {
    const textToCopy = manualText !== null ? manualText : generateReportText();
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
    }
  };

  const downloadPNG = async () => {
    if (!reportRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(reportRef.current, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `EMS_Report_${state.activeProjectName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  if (!data || !project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center opacity-20">
        <i className="fas fa-file-waveform text-6xl mb-4"></i>
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Telemetry...</p>
      </div>
    );
  }

  const currentContent = manualText !== null ? manualText : generateReportText();
  const boldHeaders = ["Name:", "BESS Function:", "BESS Data:", "System Availability:", "Overall Judgment:"];

  return (
    <div className={`flex flex-col h-full ${isExporting ? 'exporting' : ''}`}>
      <div className="bg-[#1f2937] p-3 flex items-center justify-between border-b border-[#374151]">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Report Live Output</span>
          <span className="text-[8px] text-sky-400/50 uppercase font-bold mt-1 tracking-wider">Dynamic Formatting Active</span>
        </div>
        <div className="flex gap-2">
          {manualText !== null && (
            <button 
              onClick={() => setManualText(null)} 
              className="bg-sky-900/40 p-1.5 rounded hover:bg-sky-800 text-[10px] font-bold text-sky-400 px-2 transition-colors"
            >
              <i className="fas fa-rotate-left mr-1"></i> RESET
            </button>
          )}
          <button onClick={copyAsText} className="bg-slate-900 p-1.5 rounded hover:bg-slate-700 text-xs text-white transition-colors" title="Copy Text"><i className="fas fa-copy"></i></button>
          <button onClick={downloadPNG} className="bg-slate-900 p-1.5 rounded hover:bg-slate-700 text-[10px] font-bold text-white px-2 transition-colors">PNG</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-[#0a0f1d] industrial-scroll">
        <div 
          ref={reportRef}
          className="paper-report min-h-[850px] w-full p-10 relative flex flex-col rounded-sm"
        >
          <div 
            ref={contentRef}
            contentEditable
            onInput={(e) => setManualText(e.currentTarget.innerText)}
            suppressContentEditableWarning={true}
            spellCheck={false}
            className="flex-1 outline-none mono text-[13px] leading-[1.6] font-medium text-[#1e293b] whitespace-pre-wrap select-text selection:bg-sky-200"
          >
            {currentContent.split('\n').map((line, idx) => {
              const shouldBold = boldHeaders.some(header => line.trim().startsWith(header));
              return (
                <div 
                  key={idx} 
                  className={shouldBold ? "font-extrabold text-slate-900" : ""}
                >
                  {line || '\u00A0'}
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col items-end border-t border-slate-100 pt-6">
            <div className="w-[220px] text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Authenticated via Control Bus</p>
              <div className="h-px w-full bg-slate-200 mb-2"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Digital OP Signature Block</p>
              <p className="text-[9px] text-slate-400 uppercase mt-1 font-bold">Node: {state.groupName} - EMS-X1</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#111827] border-t border-[#1f2937]">
        <button 
          onClick={copyAsImage}
          disabled={isExporting}
          className={`w-full ${isExporting ? 'bg-slate-700 cursor-not-allowed' : 'bg-[#38bdf8] hover:bg-[#7dd3fc] active:scale-[0.98]'} text-[#0f172a] font-black py-4 rounded-lg uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(56,189,248,0.15)] transition-all flex items-center justify-center gap-3`}
        >
          {isExporting ? (
            <>
              <i className="fas fa-circle-notch animate-spin"></i>
              Capturing Report...
            </>
          ) : (
            <>
              <i className="fas fa-image text-lg"></i>
              Copy Report as Image & Submit
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LivePreview;