import supabase, { isSupabaseConfigured } from '../client';
import type { ChatMessage, ChatSession } from '../schema';

export async function createChatMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string,
  sessionId: string
): Promise<ChatMessage | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      user_id: userId,
      session_id: sessionId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chat message:', error);
    throw error;
  }

  return data;
}

export async function getChatMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }

  return data || [];
}

export async function deleteChatMessage(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting chat message:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error deleting chat message:', err);
    throw err;
  }
}

export async function deleteChatHistoryByUserId(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting chat history:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error deleting chat history:', err);
    throw err;
  }
}

export async function createChatSession(userId: string, title?: string): Promise<ChatSession | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      title: title || 'New Chat',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }

  return data;
}

export async function getChatSessionsByUserId(userId: string): Promise<ChatSession[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat sessions:', error);
    throw error;
  }

  return data || [];
}

export async function getChatSessionById(sessionId: string): Promise<ChatSession | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching chat session:', error);
    throw error;
  }

  return data;
}

export async function updateChatSessionTitle(sessionId: string, title: string): Promise<ChatSession | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating chat session title:', error);
    throw error;
  }

  return data;
}

export async function deleteChatSession(sessionId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error deleting chat session:', err);
    throw err;
  }
}
