CREATE TABLE "image_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"frontal_image_url" text NOT NULL,
	"lateral_image_url" text NOT NULL,
	"model_used" varchar(50) DEFAULT 'both',
	"findings" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb,
	"confidence" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "visits" ADD COLUMN "differentials" jsonb;--> statement-breakpoint
ALTER TABLE "visits" ADD COLUMN "drug_interactions" jsonb;--> statement-breakpoint
ALTER TABLE "visits" ADD COLUMN "follow_up_plan" jsonb;--> statement-breakpoint
ALTER TABLE "visits" ADD COLUMN "guideline_adherence" jsonb;--> statement-breakpoint
ALTER TABLE "image_analyses" ADD CONSTRAINT "image_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_analyses" ADD CONSTRAINT "image_analyses_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "image_analyses_user_id_idx" ON "image_analyses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "image_analyses_patient_id_idx" ON "image_analyses" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "notes_user_id_idx" ON "notes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notes_patient_id_idx" ON "notes" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "patients_user_id_idx" ON "patients" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "visits_user_id_idx" ON "visits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "visits_patient_id_idx" ON "visits" USING btree ("patient_id");