-- Add clinical intelligence fields to visits table
ALTER TABLE visits ADD COLUMN IF NOT EXISTS differentials JSONB DEFAULT NULL;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS drug_interactions JSONB DEFAULT NULL;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS follow_up_plan JSONB DEFAULT NULL;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS guideline_adherence JSONB DEFAULT NULL;

-- Add image_analyses table (if not yet created via app)
CREATE TABLE IF NOT EXISTS image_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  frontal_image_url TEXT NOT NULL,
  lateral_image_url TEXT NOT NULL,
  model_used VARCHAR(50) DEFAULT 'both',
  findings JSONB DEFAULT '[]',
  metadata JSONB,
  confidence INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS image_analyses_user_id_idx ON image_analyses(user_id);
CREATE INDEX IF NOT EXISTS image_analyses_patient_id_idx ON image_analyses(patient_id);
