import supabase, { isSupabaseConfigured } from '../client';
import type { Patient, Visit, PatientRiskHistory } from '../schema';

export interface RiskAssessment {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number;
  riskFactors: string[];
  summary?: string;
  concerns?: string[];
  recommendations?: string[];
  followUpUrgency?: string;
}

export async function updatePatientRiskLevel(
  patientId: string,
  riskLevel: string,
  riskScore: number,
  riskFactors: string[],
  riskNotes?: string
): Promise<Patient | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('patients')
    .update({
      risk_level: riskLevel,
      risk_score: riskScore,
      risk_factors: riskFactors,
      risk_notes: riskNotes,
      risk_assessed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', patientId)
    .select()
    .single();

  if (error) {
    console.error('Error updating patient risk level:', error);
    throw error;
  }

  return data;
}

export async function updateVisitRiskAssessment(
  visitId: string,
  assessment: RiskAssessment
): Promise<Visit | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('visits')
    .update({
      risk_level: assessment.riskLevel,
      risk_score: assessment.riskScore,
      risk_factors: assessment.riskFactors,
      ai_risk_assessment: {
        summary: assessment.summary || '',
        concerns: assessment.concerns || [],
        recommendations: assessment.recommendations || [],
        followUpUrgency: assessment.followUpUrgency || 'routine',
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', visitId)
    .select()
    .single();

  if (error) {
    console.error('Error updating visit risk assessment:', error);
    throw error;
  }

  return data;
}

export async function createPatientRiskHistoryEntry(
  patientId: string,
  visitId: string | null,
  riskLevel: string,
  riskScore: number,
  riskFactors: string[],
  assessedBy: 'ai' | 'manual' = 'ai',
  notes?: string
): Promise<PatientRiskHistory | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('patient_risk_history')
    .insert({
      patient_id: patientId,
      visit_id: visitId,
      risk_level: riskLevel,
      risk_score: riskScore,
      risk_factors: riskFactors,
      assessed_by: assessedBy,
      notes: notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating risk history entry:', error);
    throw error;
  }

  return data;
}

export async function getPatientRiskHistory(patientId: string): Promise<PatientRiskHistory[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('patient_risk_history')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patient risk history:', error);
    throw error;
  }

  return data || [];
}

export async function getHighRiskPatients(userId: string): Promise<Patient[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .in('risk_level', ['high', 'critical'])
    .order('risk_score', { ascending: false });

  if (error) {
    console.error('Error fetching high risk patients:', error);
    throw error;
  }

  return data || [];
}

export async function getPatientStatistics(patientId: string): Promise<{
  totalVisits: number;
  lastVisit: string | null;
  avgVisitDuration: number;
  vitalsHistory: any[];
  riskHistory: any[];
}> {
  if (!isSupabaseConfigured()) {
    return { totalVisits: 0, lastVisit: null, avgVisitDuration: 0, vitalsHistory: [], riskHistory: [] };
  }

  const { data: visits, error: visitsError } = await supabase
    .from('visits')
    .select('*')
    .eq('patient_id', patientId)
    .order('visit_date', { ascending: false });

  if (visitsError) {
    console.error('Error fetching visits for statistics:', visitsError);
    throw visitsError;
  }

  const { data: riskHistory, error: riskError } = await supabase
    .from('patient_risk_history')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true });

  if (riskError) {
    console.error('Error fetching risk history:', riskError);
  }

  const totalVisits = visits?.length || 0;
  const lastVisit = visits?.[0]?.visit_date || null;
  const avgVisitDuration = totalVisits > 0
    ? Math.round((visits?.reduce((sum, v) => sum + (v.duration || 0), 0) || 0) / totalVisits)
    : 0;

  const vitalsHistory = (visits || []).map(v => ({
    date: v.visit_date,
    vitals: v.vitals,
    visitType: v.visit_type,
  })).reverse();

  return {
    totalVisits,
    lastVisit,
    avgVisitDuration,
    vitalsHistory,
    riskHistory: riskHistory || [],
  };
}
