export function dbNoteToAppNote(dbNote: any): {
  id: string;
  patientId?: string;
  patientName: string;
  patientAge?: string;
  chiefComplaint?: string;
  noteType: 'SOAP' | 'Progress' | 'Consultation' | 'H&P' | 'Flexible';
  date: string;
  duration: number;
  content: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    icd10?: string;
    cpt?: string;
  };
} {
  const duration = typeof dbNote.duration === 'number' ? dbNote.duration : parseInt(String(dbNote.duration || 0), 10);

  return {
    id: dbNote.id,
    patientId: dbNote.patient_id,
    patientName: dbNote.patient_name,
    patientAge: dbNote.patient_age,
    chiefComplaint: dbNote.chief_complaint,
    noteType: dbNote.note_type,
    date: dbNote.created_at,
    duration: duration,
    content: dbNote.content || {},
  };
}

export function dbUserToAppUser(dbUser: any): {
  id?: string;
  email: string;
  name: string;
  specialty: string;
  practiceName: string;
} {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    specialty: dbUser.specialty || '',
    practiceName: dbUser.practice_name || '',
  };
}

export function dbPatientToAppPatient(dbPatient: any): {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  diagnoses: string[];
  medications: string[];
  allergies: string[];
  lastVisit?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  insuranceProvider?: string;
  insuranceId?: string;
  medicalRecordNumber?: string;
  notes?: string;
  riskLevel?: string;
  riskScore?: number;
  riskFactors?: string[];
  riskNotes?: string;
  riskAssessedAt?: string;
} {
  return {
    id: dbPatient.id,
    name: dbPatient.name,
    age: dbPatient.age || 0,
    gender: dbPatient.gender || 'O',
    diagnoses: dbPatient.diagnoses || [],
    medications: dbPatient.medications || [],
    allergies: dbPatient.allergies || [],
    lastVisit: dbPatient.updated_at,
    phone: dbPatient.phone,
    email: dbPatient.email,
    dateOfBirth: dbPatient.date_of_birth,
    address: dbPatient.address,
    emergencyContact: dbPatient.emergency_contact,
    emergencyPhone: dbPatient.emergency_phone,
    insuranceProvider: dbPatient.insurance_provider,
    insuranceId: dbPatient.insurance_id,
    medicalRecordNumber: dbPatient.medical_record_number,
    notes: dbPatient.notes,
    riskLevel: dbPatient.risk_level,
    riskScore: dbPatient.risk_score,
    riskFactors: dbPatient.risk_factors || [],
    riskNotes: dbPatient.risk_notes,
    riskAssessedAt: dbPatient.risk_assessed_at,
  };
}

export function dbVisitToAppVisit(dbVisit: any): {
  id: string;
  patientId: string;
  noteId?: string;
  date: string;
  visitType: string;
  complaint: string;
  vitals: any;
  summary: string;
  diagnosis?: string;
  treatmentPlan?: string;
  followUpDate?: string;
  duration: number;
  status: string;
} {
  return {
    id: dbVisit.id,
    patientId: dbVisit.patient_id,
    noteId: dbVisit.note_id,
    date: dbVisit.visit_date,
    visitType: dbVisit.visit_type || 'routine',
    complaint: dbVisit.chief_complaint || '',
    vitals: dbVisit.vitals || {},
    summary: dbVisit.summary || '',
    diagnosis: dbVisit.diagnosis,
    treatmentPlan: dbVisit.treatment_plan,
    followUpDate: dbVisit.follow_up_date,
    duration: dbVisit.duration || 0,
    status: dbVisit.status || 'completed',
  };
}
