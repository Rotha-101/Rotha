
/**
 * SECTION 2 — DATABASE CORE & CONNECTION LAYER
 * SECTION 3 — DATABASE SCHEMA & MIGRATION
 * SECTION 4 — MASTER DATA SEEDING
 * 
 * Simulated persistence using LocalStorage.
 */

const DB_KEY = 'ems_report_db';
const DRAFT_KEY = 'ems_working_draft';

export const initializeDB = (): boolean => {
  const existing = localStorage.getItem(DB_KEY);
  if (!existing) {
    const initialState = {
      reports: [],
      auditLog: [],
      lastInit: new Date().toISOString()
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialState));
    console.log("Database initialized and seeded.");
  }
  return true;
};

export const saveReport = (report: any) => {
  const data = JSON.parse(localStorage.getItem(DB_KEY) || '{}');
  data.reports.push({
    ...report,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  // Clear draft after successful submission
  localStorage.removeItem(DRAFT_KEY);
};

export const logAudit = (event: string, operator: string) => {
  const data = JSON.parse(localStorage.getItem(DB_KEY) || '{}');
  data.auditLog.push({
    event,
    operator,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// Persistence for the working draft
export const saveDraft = (state: any, reportData: any) => {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ state, reportData }));
};

export const loadDraft = (): { state: any; reportData: any } | null => {
  const draft = localStorage.getItem(DRAFT_KEY);
  return draft ? JSON.parse(draft) : null;
};
