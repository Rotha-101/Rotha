
export enum ProjectType {
  FORMAT_A = 'FORMAT_A',
  FORMAT_B = 'FORMAT_B'
}

export enum Shift {
  A = 'A (06:00-14:00)',
  B = 'B (14:00-22:00)',
  C = 'C (22:00-06:00)'
}

export interface Operator {
  id: string;
  name: string;
  groupId: number;
}

export interface Project {
  id: string;
  name: string;
  siteName: string;
  groupId: number;
  type: ProjectType;
  capacity: string;
  defaults: {
    bessOnline: string;
    pcsOnline: string;
    transformerOnline: string;
    emsStatus: 'Normal' | 'Abnormal';
    overallJudgment: 'Normal' | 'Abnormal';
  };
}

export interface ManualOperation {
  enabled: boolean;
  mw: string;
  time: string;
}

export interface ReportData {
  capacity: string;
  bessFunction: {
    peakShifting: boolean;
    pfc: boolean;
    qu: boolean;
    tieLine?: boolean;
    pvSmoothing?: boolean;
    manualCharge: ManualOperation;
    manualDischarge: ManualOperation;
  };
  telemetry: {
    formatA?: {
      sppc1: { soc: number; cycleToday: string; cycleMonth: string; cycleTotal: string };
      sppc2: { soc: number; cycleToday: string; cycleMonth: string; cycleTotal: string };
      sppc3: { soc: number; cycleToday: string; cycleMonth: string; cycleTotal: string };
    };
    formatB?: {
      soc: number;
      totalCycle: string;
      thisMonthCycle: string;
      todayCycle: string;
    };
  };
  availability: {
    bessOnline: string;
    pcsOnline: string;
    transformerOnline: string;
    emsStatus: string;
    overallJudgment: string;
    emsNote?: string;
  };
  incidents: {
    issue: string;
    action: string;
    solvedExpectation: string;
  };
}

export interface AppState {
  operatorId: string | null;
  operatorNames: string[];
  groupId: number | null;
  groupName: string | null;
  role: 'operator' | 'supervisor';
  activeProjectId: string | null;
  activeProjectName: string | null;
  reportDate: string;
  hourInterval: string;
  shift: Shift;
  systemReady: boolean;
}
