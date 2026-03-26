import supabase, { isSupabaseConfigured } from '../client';
import type { PatientChatSession, PatientChatMessage } from '../schema';

export async function createPatientChatSession(
  patientId: string,
  userId: string,
  title?: string
): Promise<PatientChatSession | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('patient_chat_sessions')
    .insert({
      patient_id: patientId,
      user_id: userId,
      title: title || 'Patient Chat',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating patient chat session:', error);
    throw error;
  }

  return data;
}

export async function getPatientChatSessionsByPatientId(patientId: string): Promise<PatientChatSession[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('patient_chat_sessions')
    .select('*')
    .eq('patient_id', patientId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching patient chat sessions:', error);
    throw error;
  }

  return data || [];
}

export async function getPatientChatSessionById(sessionId: string): Promise<PatientChatSession | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('patient_chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching patient chat session:', error);
    throw error;
  }

  return data;
}

export async function updatePatientChatSessionTitle(sessionId: string, title: string): Promise<PatientChatSession | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('patient_chat_sessions')
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating patient chat session title:', error);
    throw error;
  }

  return data;
}

export async function deletePatientChatSession(sessionId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('patient_chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting patient chat session:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error deleting patient chat session:', err);
    throw err;
  }
}

export async function createPatientChatMessage(
  sessionId: string,
  patientId: string,
  userId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<PatientChatMessage | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('patient_chat_messages')
    .insert({
      session_id: sessionId,
      patient_id: patientId,
      user_id: userId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating patient chat message:', error);
    throw error;
  }

  return data;
}

export async function getPatientChatMessagesBySessionId(sessionId: string): Promise<PatientChatMessage[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('patient_chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching patient chat messages:', error);
    throw error;
  }

  return data || [];
}

export async function deletePatientChatMessagesBySessionId(sessionId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('patient_chat_messages')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error deleting patient chat messages:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error deleting patient chat messages:', err);
    throw err;
  }
}
