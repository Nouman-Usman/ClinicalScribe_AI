import supabase, { isSupabaseConfigured } from '../client';
import type { Visit, NewVisit, Note } from '../schema';

export async function createVisit(visitData: Omit<NewVisit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Visit | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('visits')
    .insert({
      patient_id: visitData.patientId,
      user_id: visitData.userId,
      note_id: visitData.noteId,
      visit_date: visitData.visitDate || new Date().toISOString(),
      visit_type: visitData.visitType || 'routine',
      chief_complaint: visitData.chiefComplaint,
      vitals: visitData.vitals || {},
      summary: visitData.summary,
      diagnosis: visitData.diagnosis,
      treatment_plan: visitData.treatmentPlan,
      follow_up_date: visitData.followUpDate,
      duration: visitData.duration || 0,
      status: visitData.status || 'completed',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating visit:', error);
    throw error;
  }

  return data;
}

export async function getVisitById(id: string): Promise<Visit | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching visit:', error);
    throw error;
  }

  return data;
}

export async function getVisitsByPatientId(patientId: string): Promise<Visit[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('patient_id', patientId)
    .order('visit_date', { ascending: false });

  if (error) {
    console.error('Error fetching visits:', error);
    throw error;
  }

  return data || [];
}

export async function getVisitsWithNotesByPatientId(patientId: string): Promise<any[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data: visits, error: visitsError } = await supabase
    .from('visits')
    .select('*')
    .eq('patient_id', patientId)
    .order('visit_date', { ascending: false });

  if (visitsError) {
    console.error('Error fetching visits:', visitsError);
    throw visitsError;
  }

  if (!visits || visits.length === 0) {
    return [];
  }

  const noteIds = visits
    .filter(v => v.note_id)
    .map(v => v.note_id);

  let notesMap: Record<string, any> = {};
  if (noteIds.length > 0) {
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, content, transcription, note_type, chief_complaint')
      .in('id', noteIds);

    if (!notesError && notes) {
      notesMap = notes.reduce((acc, note) => {
        acc[note.id] = note;
        return acc;
      }, {} as Record<string, any>);
    }
  }

  return visits.map(visit => ({
    ...visit,
    note: visit.note_id ? notesMap[visit.note_id] || null : null,
  }));
}

export async function getVisitsByUserId(userId: string): Promise<Visit[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('user_id', userId)
    .order('visit_date', { ascending: false });

  if (error) {
    console.error('Error fetching visits:', error);
    throw error;
  }

  return data || [];
}

export async function updateVisit(id: string, updates: Partial<Visit>): Promise<Visit | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.noteId !== undefined) dbUpdates.note_id = updates.noteId;
  if (updates.visitDate !== undefined) dbUpdates.visit_date = updates.visitDate;
  if (updates.visitType !== undefined) dbUpdates.visit_type = updates.visitType;
  if (updates.chiefComplaint !== undefined) dbUpdates.chief_complaint = updates.chiefComplaint;
  if (updates.vitals !== undefined) dbUpdates.vitals = updates.vitals;
  if (updates.summary !== undefined) dbUpdates.summary = updates.summary;
  if (updates.diagnosis !== undefined) dbUpdates.diagnosis = updates.diagnosis;
  if (updates.treatmentPlan !== undefined) dbUpdates.treatment_plan = updates.treatmentPlan;
  if (updates.followUpDate !== undefined) dbUpdates.follow_up_date = updates.followUpDate;
  if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
  if (updates.status !== undefined) dbUpdates.status = updates.status;

  const { data, error } = await supabase
    .from('visits')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating visit:', error);
    throw error;
  }

  return data;
}

export async function deleteVisit(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting visit:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error deleting visit:', err);
    throw err;
  }
}

export async function getVisitsWithNotes(patientId: string): Promise<(Visit & { note?: Note })[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('visits')
    .select(`
      *,
      notes (*)
    `)
    .eq('patient_id', patientId)
    .order('visit_date', { ascending: false });

  if (error) {
    console.error('Error fetching visits with notes:', error);
    throw error;
  }

  return data || [];
}

export async function getPatientVisits(patientId: string): Promise<Visit[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('patient_id', patientId)
    .order('visit_date', { ascending: false });

  if (error) {
    console.error('Error fetching patient visits:', error);
    throw error;
  }

  return data || [];
}

export async function saveClinicalFeaturesToVisit(
  visitId: string,
  features: {
    differentials?: any;
    drugInteractions?: any;
    followUpPlan?: any;
    guidelineAdherence?: any;
    followUpDate?: string;
  }
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (features.differentials !== undefined) updates.differentials = features.differentials;
  if (features.drugInteractions !== undefined) updates.drug_interactions = features.drugInteractions;
  if (features.followUpPlan !== undefined) updates.follow_up_plan = features.followUpPlan;
  if (features.guidelineAdherence !== undefined) updates.guideline_adherence = features.guidelineAdherence;
  if (features.followUpDate !== undefined) updates.follow_up_date = features.followUpDate;

  const { error } = await supabase.from('visits').update(updates).eq('id', visitId);
  if (error) console.error('Error saving clinical features:', error);
}
