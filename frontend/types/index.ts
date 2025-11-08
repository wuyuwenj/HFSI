export interface TimelineEvent {
  date: string;
  event: string;
  confidence: number;
}

export interface Inconsistency {
  statement1: string;
  source1: string;
  statement2: string;
  source2: string;
  analysis: string;
}

export type EvidenceReliability = 'High' | 'Medium' | 'Low' | 'Unverified';

export interface EvidenceItem {
  evidence: string;
  type: string;
  reliability: EvidenceReliability;
  notes: string;
}

export interface PrecedentCase {
  caseName: string;
  summary: string;
  outcome: string;
}

export type AlertSeverity = 'High' | 'Medium' | 'Low';

export interface CriticalAlert {
  title: string;
  description: string;
  severity: AlertSeverity;
}

export interface CaseAnalysis {
  summary: string;
  timelineEvents: TimelineEvent[];
  inconsistencies: Inconsistency[];
  evidenceMatrix: EvidenceItem[];
  riskScore: number;
  precedentCases: PrecedentCase[];
  criticalAlerts: CriticalAlert[];
}
