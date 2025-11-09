import type { CaseAnalysis } from '@/types';

export interface AnalysisRecord {
  id: string;
  caseName: string;
  createdAt: string;
  riskScore: number;
  analysis: CaseAnalysis;
}

const STORAGE_KEY = 'verijudex_analyses';

export const saveAnalysis = (caseName: string, analysis: CaseAnalysis): string => {
  const id = `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const record: AnalysisRecord = {
    id,
    caseName,
    createdAt: new Date().toISOString(),
    riskScore: analysis.riskScore,
    analysis,
  };

  const existing = getAllAnalyses();
  existing.unshift(record); // Add to beginning
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

  return id;
};

export const getAllAnalyses = (): AnalysisRecord[] => {
  if (typeof window === 'undefined') return [];

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const getAnalysisById = (id: string): AnalysisRecord | null => {
  const all = getAllAnalyses();
  return all.find(record => record.id === id) || null;
};

export const deleteAnalysis = (id: string): void => {
  const existing = getAllAnalyses();
  const filtered = existing.filter(record => record.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
