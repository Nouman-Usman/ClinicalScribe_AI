import supabase, { isSupabaseConfigured } from '../client';
import type { PatientEmail } from '../schema';

export async function createPatientEmail(emailData: {
  userId: string;
  patientId: string;
  visitId?: string;
  subject: string;
  body: string;
  recipientEmail: string;
  recipientName?: string;
  emailType?: string;
  status?: string;
  aiGenerated?: boolean;
  aiPrompt?: string;
  generationContext?: Record<string, any>;
}): Promise<PatientEmail | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('patient_emails')
    .insert({
      user_id: emailData.userId,
      patient_id: emailData.patientId,
      visit_id: emailData.visitId,
      subject: emailData.subject,
      body: emailData.body,
      recipient_email: emailData.recipientEmail,
      recipient_name: emailData.recipientName,
      email_type: emailData.emailType || 'visit_summary',
      status: emailData.status || 'draft',
      ai_generated: emailData.aiGenerated ?? true,
      ai_prompt: emailData.aiPrompt,
      generation_context: emailData.generationContext,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating patient email:', error);
    throw error;
  }

  return data;
}

export async function updatePatientEmail(
  emailId: string,
  updates: {
    subject?: string;
    body?: string;
    status?: string;
    sentAt?: string;
    aiPrompt?: string;
  }
): Promise<PatientEmail | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.subject !== undefined) updateData.subject = updates.subject;
  if (updates.body !== undefined) updateData.body = updates.body;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.sentAt !== undefined) updateData.sent_at = updates.sentAt;
  if (updates.aiPrompt !== undefined) updateData.ai_prompt = updates.aiPrompt;

  const { data, error } = await supabase
    .from('patient_emails')
    .update(updateData)
    .eq('id', emailId)
    .select()
    .single();

  if (error) {
    console.error('Error updating patient email:', error);
    throw error;
  }

  return data;
}

export async function getPatientEmails(patientId: string): Promise<PatientEmail[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('patient_emails')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patient emails:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    patientId: row.patient_id,
    visitId: row.visit_id,
    subject: row.subject,
    body: row.body,
    recipientEmail: row.recipient_email,
    recipientName: row.recipient_name,
    emailType: row.email_type,
    status: row.status,
    sentAt: row.sent_at ? new Date(row.sent_at) : null,
    aiGenerated: row.ai_generated,
    aiPrompt: row.ai_prompt,
    generationContext: row.generation_context,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
}

export async function getPatientEmailById(emailId: string): Promise<PatientEmail | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('patient_emails')
    .select('*')
    .eq('id', emailId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching patient email:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    patientId: data.patient_id,
    visitId: data.visit_id,
    subject: data.subject,
    body: data.body,
    recipientEmail: data.recipient_email,
    recipientName: data.recipient_name,
    emailType: data.email_type,
    status: data.status,
    sentAt: data.sent_at ? new Date(data.sent_at) : null,
    aiGenerated: data.ai_generated,
    aiPrompt: data.ai_prompt,
    generationContext: data.generation_context,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function deletePatientEmail(emailId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { error } = await supabase
    .from('patient_emails')
    .delete()
    .eq('id', emailId);

  if (error) {
    console.error('Error deleting patient email:', error);
    throw error;
  }

  return true;
}

export async function getEmailsByUserId(userId: string, limit = 50): Promise<PatientEmail[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('patient_emails')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user emails:', error);
    throw error;
  }

  return data || [];
}

export async function markEmailAsSent(emailId: string): Promise<PatientEmail | null> {
  return updatePatientEmail(emailId, {
    status: 'sent',
    sentAt: new Date().toISOString(),
  });
}
