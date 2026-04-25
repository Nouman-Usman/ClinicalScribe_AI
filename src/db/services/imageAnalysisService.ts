import supabase, { isSupabaseConfigured } from '../client';
import type { ImageAnalysis, NewImageAnalysis } from '../schema';

export async function createImageAnalysis(analysisData: Omit<NewImageAnalysis, 'id' | 'createdAt' | 'updatedAt'>): Promise<ImageAnalysis | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('image_analyses')
    .insert({
      user_id: analysisData.userId,
      patient_id: analysisData.patientId,
      frontal_image_url: analysisData.frontalImageUrl,
      lateral_image_url: analysisData.lateralImageUrl,
      model_used: analysisData.modelUsed || 'both',
      findings: analysisData.findings || [],
      metadata: analysisData.metadata || {},
      confidence: analysisData.confidence || 0,
      notes: analysisData.notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating image analysis:', error);
    throw error;
  }

  return data;
}

export async function getImageAnalysisById(id: string): Promise<ImageAnalysis | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('image_analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching image analysis:', error);
    throw error;
  }

  return data;
}

export async function getImageAnalysesByPatientId(patientId: string): Promise<ImageAnalysis[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('image_analyses')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching image analyses:', error);
    throw error;
  }

  return data || [];
}

export async function getImageAnalysesByUserId(userId: string): Promise<ImageAnalysis[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('image_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching image analyses:', error);
    throw error;
  }

  return data || [];
}

export async function updateImageAnalysisNotes(id: string, notes: string): Promise<ImageAnalysis | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('image_analyses')
    .update({
      notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating image analysis:', error);
    throw error;
  }

  return data;
}
