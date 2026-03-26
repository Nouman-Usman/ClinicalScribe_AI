import supabase, { isSupabaseConfigured } from '../client';
import type { Patient, NewPatient } from '../schema';

export async function createPatient(patientData: Omit<NewPatient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('patients')
    .insert({
      user_id: patientData.userId,
      name: patientData.name,
      age: patientData.age,
      gender: patientData.gender,
      date_of_birth: patientData.dateOfBirth,
      phone: patientData.phone,
      email: patientData.email,
      address: patientData.address,
      diagnoses: patientData.diagnoses || [],
      medications: patientData.medications || [],
      allergies: patientData.allergies || [],
      emergency_contact: patientData.emergencyContact,
      emergency_phone: patientData.emergencyPhone,
      insurance_provider: patientData.insuranceProvider,
      insurance_id: patientData.insuranceId,
      medical_record_number: patientData.medicalRecordNumber,
      notes: patientData.notes,
      is_active: patientData.isActive ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating patient:', error);
    throw error;
  }

  return data;
}

export async function getPatientById(id: string): Promise<Patient | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching patient:', error);
    throw error;
  }

  return data;
}

export async function getPatientsByUserId(userId: string): Promise<Patient[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }

  return data || [];
}

export async function updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.age !== undefined) dbUpdates.age = updates.age;
  if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
  if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.address !== undefined) dbUpdates.address = updates.address;
  if (updates.diagnoses !== undefined) dbUpdates.diagnoses = updates.diagnoses;
  if (updates.medications !== undefined) dbUpdates.medications = updates.medications;
  if (updates.allergies !== undefined) dbUpdates.allergies = updates.allergies;
  if (updates.emergencyContact !== undefined) dbUpdates.emergency_contact = updates.emergencyContact;
  if (updates.emergencyPhone !== undefined) dbUpdates.emergency_phone = updates.emergencyPhone;
  if (updates.insuranceProvider !== undefined) dbUpdates.insurance_provider = updates.insuranceProvider;
  if (updates.insuranceId !== undefined) dbUpdates.insurance_id = updates.insuranceId;
  if (updates.medicalRecordNumber !== undefined) dbUpdates.medical_record_number = updates.medicalRecordNumber;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('patients')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating patient:', error);
    throw error;
  }

  return data;
}

export async function deletePatient(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('patients')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error deleting patient:', err);
    throw err;
  }
}

export async function searchPatients(userId: string, query: string): Promise<Patient[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error searching patients:', error);
    throw error;
  }

  return data || [];
}
