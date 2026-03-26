import type { StructuredData } from '@/types/structuredData';

export type Page = 'landing' | 'auth' | 'dashboard' | 'recording' | 'note' | 'past-notes' | 'settings' | 'chat' | 'patients' | 'patient' | 'patient-recording' | 'image-analysis';

export interface User {
  id?: string;
  email: string;
  name: string;
  specialty: string;
  practiceName: string;
}

export interface Note {
  id: string;
  patientId?: string;
  patientName: string;
  patientAge?: string;
  chiefComplaint?: string;
  noteType: 'SOAP' | 'Progress' | 'Consultation' | 'H&P' | 'Flexible';
  date: string;
  duration: number;
  content: Record<string, string>;
  transcription?: string;
  structuredData?: StructuredData;
  previousVisitData?: StructuredData;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  address?: string;
  diagnoses: string[];
  medications: string[];
  allergies?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  insuranceProvider?: string;
  insuranceId?: string;
  medicalRecordNumber?: string;
  notes?: string;
  lastVisit?: string;
  visits?: Visit[];
  riskLevel?: 'low' | 'moderate' | 'medium' | 'high' | 'critical';
  riskScore?: number;
  riskFactors?: string[];
  riskAssessedAt?: string;
  riskNotes?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  noteId?: string;
  date: string;
  visitType: string;
  complaint: string;
  vitals: {
    bp?: string;
    weight?: number;
    height?: number;
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  summary: string;
  diagnosis?: string;
  treatmentPlan?: string;
  followUpDate?: string;
  duration: number;
  status: string;
  riskLevel?: 'low' | 'medium' | 'high';
  riskScore?: number;
  riskFactors?: string[];
  aiRiskAssessment?: {
    riskLevel: string;
    riskScore: number;
    riskFactors: string[];
    summary: string;
    concerns: string[];
    recommendations: string[];
    followUpUrgency: string;
  };
}
