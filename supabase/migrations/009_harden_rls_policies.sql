-- Harden RLS policies by scoping access to authenticated owner rows.
-- This migration replaces permissive "USING (true)" policies.

-- users
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- notes
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- user_settings
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- patients
DROP POLICY IF EXISTS "Users can view own patients" ON patients;
DROP POLICY IF EXISTS "Users can insert own patients" ON patients;
DROP POLICY IF EXISTS "Users can update own patients" ON patients;
DROP POLICY IF EXISTS "Users can delete own patients" ON patients;

CREATE POLICY "Users can view own patients" ON patients
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own patients" ON patients
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own patients" ON patients
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own patients" ON patients
  FOR DELETE USING (auth.uid() = user_id);

-- visits
DROP POLICY IF EXISTS "Users can view own visits" ON visits;
DROP POLICY IF EXISTS "Users can insert own visits" ON visits;
DROP POLICY IF EXISTS "Users can update own visits" ON visits;
DROP POLICY IF EXISTS "Users can delete own visits" ON visits;

CREATE POLICY "Users can view own visits" ON visits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own visits" ON visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own visits" ON visits
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own visits" ON visits
  FOR DELETE USING (auth.uid() = user_id);

-- chat_messages
DROP POLICY IF EXISTS "Users can view own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete own chat messages" ON chat_messages;

CREATE POLICY "Users can view own chat messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat messages" ON chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- chat_sessions
DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete own chat sessions" ON chat_sessions;

CREATE POLICY "Users can view own chat sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- patient_chat_sessions
DROP POLICY IF EXISTS "Users can view own patient chat sessions" ON patient_chat_sessions;
DROP POLICY IF EXISTS "Users can insert own patient chat sessions" ON patient_chat_sessions;
DROP POLICY IF EXISTS "Users can update own patient chat sessions" ON patient_chat_sessions;
DROP POLICY IF EXISTS "Users can delete own patient chat sessions" ON patient_chat_sessions;

CREATE POLICY "Users can view own patient chat sessions" ON patient_chat_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own patient chat sessions" ON patient_chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own patient chat sessions" ON patient_chat_sessions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own patient chat sessions" ON patient_chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- patient_chat_messages
DROP POLICY IF EXISTS "Users can view own patient chat messages" ON patient_chat_messages;
DROP POLICY IF EXISTS "Users can insert own patient chat messages" ON patient_chat_messages;
DROP POLICY IF EXISTS "Users can delete own patient chat messages" ON patient_chat_messages;

CREATE POLICY "Users can view own patient chat messages" ON patient_chat_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own patient chat messages" ON patient_chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own patient chat messages" ON patient_chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- patient_risk_history: user ownership is inferred via linked patient row.
DROP POLICY IF EXISTS "Users can view patient risk history" ON patient_risk_history;
DROP POLICY IF EXISTS "Users can insert patient risk history" ON patient_risk_history;
DROP POLICY IF EXISTS "Users can update patient risk history" ON patient_risk_history;
DROP POLICY IF EXISTS "Users can delete patient risk history" ON patient_risk_history;

CREATE POLICY "Users can view patient risk history" ON patient_risk_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_risk_history.patient_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert patient risk history" ON patient_risk_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_risk_history.patient_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update patient risk history" ON patient_risk_history
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_risk_history.patient_id
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_risk_history.patient_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete patient risk history" ON patient_risk_history
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_risk_history.patient_id
        AND p.user_id = auth.uid()
    )
  );

-- image_analyses (created in migration 008)
ALTER TABLE image_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own image analyses" ON image_analyses;
DROP POLICY IF EXISTS "Users can insert own image analyses" ON image_analyses;
DROP POLICY IF EXISTS "Users can update own image analyses" ON image_analyses;
DROP POLICY IF EXISTS "Users can delete own image analyses" ON image_analyses;

CREATE POLICY "Users can view own image analyses" ON image_analyses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own image analyses" ON image_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own image analyses" ON image_analyses
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own image analyses" ON image_analyses
  FOR DELETE USING (auth.uid() = user_id);
