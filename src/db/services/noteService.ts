import supabase, { isSupabaseConfigured } from '../client';
import type { Note, NewNote } from '../schema';

export async function createNote(noteData: Omit<NewNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const duration = typeof noteData.duration === 'number' ? noteData.duration : parseInt(String(noteData.duration || 0), 10);

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: noteData.userId,
      patient_id: noteData.patientId || null,
      patient_name: noteData.patientName,
      patient_age: noteData.patientAge,
      chief_complaint: noteData.chiefComplaint,
      note_type: noteData.noteType,
      duration: duration,
      content: noteData.content,
      transcription: noteData.transcription,
      audio_url: noteData.audioUrl,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating note:', error);
    throw error;
  }

  return data;
}

export async function getNoteById(id: string): Promise<Note | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching note:', error);
    throw error;
  }

  return data;
}

export async function getNotesByUserId(userId: string): Promise<Note[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }

  return data || [];
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.patientName !== undefined) dbUpdates.patient_name = updates.patientName;
  if (updates.patientAge !== undefined) dbUpdates.patient_age = updates.patientAge;
  if (updates.chiefComplaint !== undefined) dbUpdates.chief_complaint = updates.chiefComplaint;
  if (updates.noteType !== undefined) dbUpdates.note_type = updates.noteType;
  if (updates.duration !== undefined) {
    dbUpdates.duration = typeof updates.duration === 'number' ? updates.duration : parseInt(String(updates.duration || 0), 10);
  }
  if (updates.content !== undefined) dbUpdates.content = updates.content;
  if (updates.transcription !== undefined) dbUpdates.transcription = updates.transcription;
  if (updates.audioUrl !== undefined) dbUpdates.audio_url = updates.audioUrl;
  if (updates.isArchived !== undefined) dbUpdates.is_archived = updates.isArchived;

  const { data, error } = await supabase
    .from('notes')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating note:', error);
    throw error;
  }

  return data;
}

export async function deleteNote(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    console.log('Deleting note from database with ID:', id);
    const { data, error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    console.log('Note deleted successfully:', data);
    return true;
  } catch (err) {
    console.error('Error deleting note:', err);
    throw err;
  }
}

export async function archiveNote(id: string): Promise<Note | null> {
  return updateNote(id, { isArchived: true });
}

export async function searchNotes(userId: string, query: string): Promise<Note[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .or(`patient_name.ilike.%${query}%,chief_complaint.ilike.%${query}%,transcription.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching notes:', error);
    throw error;
  }

  return data || [];
}

export async function getNotesByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Note[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes by date range:', error);
    throw error;
  }

  return data || [];
}
