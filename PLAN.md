Here's what the plan covers:

  1. Folder Restructure - Feature-based architecture splitting the monolithic db/services.ts (2075 lines)
  into 9 entity files, co-locating pages/components/hooks per domain, and creating a dedicated
  design-system/ directory.

  2. Modern 3D UI - Glassmorphism cards, layered depth shadows, neumorphic effects, gradient accents,
  Framer Motion animations (page transitions, stagger effects, micro-interactions), and a refined
  medical-premium color palette.

  3. Mobile-First - Bottom tab nav for mobile, collapsible sidebar for desktop, 44px touch targets, swipe
  gestures, progressive disclosure (accordions/wizards on mobile), and responsive grids.

  4. Screen-by-Screen Plans - All 11 screens redesigned with specific desktop/mobile layouts and
  animations.

  5. Google Stitch Integration - Step-by-step workflow: create project + design system, generate 22
  screens (11 desktop + 11 mobile), iterate, then map Stitch output to existing shadcn/ui components.

  6. 14 New Features Ranked by Impact - Top picks:
  - Multilingual Voice (Urdu/Punjabi/etc.) - translateAudio() already exists but is never called!
  - Drug Interaction Checker - prevents patient harm
  - Prescription Generation + WhatsApp Share - eliminates handwriting errors
  - Quick Mode (60s documentation) - critical for 200+/day OPDs
  - Plus OPD queue management, differential diagnosis, SMS reminders, chronic disease tracking, offline
  mode, FHIR export, and more.
  ⎿  Tool use rejected

⏺ I'm currently in plan mode which restricts me to only editing the plan file at
  /Users/noumanusman/.claude/plans/tingly-juggling-candle.md. I can't write to PLAN.md in the project root
   until plan mode is exited.                                                                             
   
  Let me exit plan mode first, then I'll write it to PLAN.md.                                             
                                                                                                        
──────────────────────────────────────────────────────────────────────────────────────────────────────────
 Ready to code?                                                                                         
                                                                                                          
 Here is Claude's plan:                                                                                 
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 ClinicalScribe AI - Modern 3D UI Overhaul & Feature Expansion Plan                                     
                                                                                                        
 Context                                                                                                

 ClinicalScribe AI is a healthcare platform (React 18 + TypeScript + Vite + Tailwind + shadcn/ui +
 Supabase + Groq AI) with 11 pages, 50+ components, and a flat folder structure. The current UI is
 functional but lacks visual depth, modern aesthetics, and proper mobile-first design. The monolithic
 db/services.ts (54KB, 2075 lines) needs splitting. The app uses useState for routing instead of React
 Router. This plan modernizes the UI with glassmorphism/3D effects, restructures the codebase, integrates
  Google Stitch for design generation, and adds high-impact healthcare features.

 ---
 Part 1: Folder Structure Restructure

 Target: Feature-based hybrid structure

 src/
 ├── app/
 │   ├── App.tsx                    # Slim: providers + router only
 │   ├── router.tsx                 # Centralized route definitions (React Router)
 │   ├── providers.tsx              # Compose all providers (Query, Theme, Animation)
 │   └── types.ts                   # Global types (User, Page, Note, Patient, Visit)
 │
 ├── features/
 │   ├── auth/
 │   │   ├── pages/AuthPage.tsx
 │   │   ├── components/LoginForm.tsx, SignupForm.tsx
 │   │   └── hooks/useAuth.ts
 │   ├── dashboard/
 │   │   ├── pages/Dashboard.tsx
 │   │   ├── components/StatCard.tsx, ActivityFeed.tsx, VisitTrendsChart.tsx,
 │   │   │   PracticeStatisticsCards.tsx, MorningBriefing.tsx, PriorityListPanel.tsx
 │   │   └── hooks/useDashboardData.ts
 │   ├── recording/
 │   │   ├── pages/RecordingPage.tsx
 │   │   ├── components/AudioWaveform.tsx, PatientSelector.tsx, RecordingControls.tsx
 │   │   └── hooks/useRecording.ts
 │   ├── notes/
 │   │   ├── pages/NotePage.tsx, PastNotesPage.tsx
 │   │   ├── components/NoteCard.tsx, NoteEditor.tsx, StructuredDataPanel.tsx, AlertsPanel.tsx
 │   │   └── hooks/useNotes.ts
 │   ├── patients/
 │   │   ├── pages/PatientsPage.tsx, PatientDetailPage.tsx
 │   │   ├── components/PatientCard.tsx, PatientTimeline.tsx, RiskScoreCircle.tsx,
 │   │   │   RiskDetailModal.tsx, RiskLevelEditor.tsx, PatientEmailComposer.tsx, etc.
 │   │   └── hooks/usePatients.ts
 │   ├── chat/
 │   │   ├── pages/ChatPage.tsx
 │   │   ├── components/ChatBot.tsx
 │   │   └── hooks/useChat.ts
 │   ├── image-analysis/
 │   │   ├── pages/ImageAnalysisPage.tsx
 │   │   └── components/ (all 8 analysis components)
 │   ├── settings/
 │   │   └── pages/SettingsPage.tsx
 │   └── landing/
 │       └── pages/LandingPage.tsx, PrivacyPolicy.tsx, TermsOfService.tsx
 │
 ├── components/
 │   ├── ui/                        # shadcn/ui - UNCHANGED (51 files)
 │   ├── layout/
 │   │   ├── DashboardLayout.tsx    # Refactored shell
 │   │   ├── Sidebar.tsx            # NEW: extracted desktop sidebar
 │   │   ├── MobileBottomNav.tsx    # NEW: mobile tab bar
 │   │   ├── TopBar.tsx             # NEW: extracted top bar
 │   │   └── PageTransition.tsx     # NEW: Framer Motion wrapper
 │   ├── shared/                    # Cross-feature reusable primitives
 │   │   ├── GlassCard.tsx          # Glassmorphism card
 │   │   ├── DepthCard.tsx          # Neumorphic/3D card
 │   │   ├── AnimatedButton.tsx     # Button with micro-interactions
 │   │   ├── StatDisplay.tsx        # Animated stat with trend arrow
 │   │   ├── LoadingSkeleton.tsx
 │   │   └── EmptyState.tsx
 │   └── stitch/                    # Landing zone for Stitch-generated components
 │
 ├── design-system/                 # Centralized design tokens
 │   ├── tokens.css                 # CSS custom properties (colors, shadows, blurs)
 │   ├── animations.ts              # Framer Motion variants & keyframes
 │   ├── gradients.ts               # Gradient definitions
 │   └── shadows.ts                 # Layered 3D shadow system
 │
 ├── services/
 │   ├── ai/textGeneration.ts, speechToText.ts, textToSpeech.ts, riskAssessment.ts, imageAnalysis.ts
 │   ├── email/emailService.ts
 │   └── index.ts
 │
 ├── db/
 │   ├── client.ts                  # Supabase client (unchanged)
 │   ├── schema.ts                  # Drizzle schema (unchanged)
 │   ├── services/                  # SPLIT from monolithic services.ts
 │   │   ├── index.ts               # Barrel re-exports (preserves existing imports)
 │   │   ├── userService.ts, noteService.ts, patientService.ts, visitService.ts
 │   │   ├── chatService.ts, patientChatService.ts, riskService.ts
 │   │   ├── emailService.ts, dashboardService.ts
 │   │   └── mappers.ts            # DB-to-app type converters
 │   └── hooks/useQueries.ts, useDatabase.ts
 │
 ├── hooks/                         # Global-only hooks
 │   ├── use-mobile.tsx, use-toast.ts, useAI.ts
 │
 ├── lib/utils.ts, validations.ts, alertDefinitions.ts
 │   └── data/ (sample data files)
 ├── config/env.ts, noteTemplates.ts
 ├── types/alerts.ts, riskAssessment.ts, structuredData.ts
 ├── index.css, main.tsx

 Key decisions:
 - Feature folders co-locate pages/components/hooks per domain
 - db/services.ts (2075 lines) split into ~9 entity files with barrel index.ts preserving all imports
 - components/stitch/ is the intake zone for Stitch-generated UI
 - design-system/ centralizes all visual tokens
 - shadcn/ui stays at components/ui/ (per components.json)

 ---
 Part 2: Modern 3D UI Design System

 New Dependency

 framer-motion  # Page transitions, micro-interactions, layout animations (~30KB gzipped)

 Design Tokens (design-system/tokens.css)

 :root {
   /* Glass Effect */
   --glass-bg: rgba(255, 255, 255, 0.6);
   --glass-border: rgba(255, 255, 255, 0.3);
   --glass-blur: 16px;

   /* 3D Depth Shadows (layered for realism) */
   --shadow-sm: 0 2px 4px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
   --shadow-md: 0 4px 8px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06);
   --shadow-lg: 0 8px 24px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.04);
   --shadow-xl: 0 16px 48px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04);
   --shadow-glow-primary: 0 0 20px hsla(207, 51%, 36%, 0.15);

   /* Neumorphic */
   --neu-raised: 6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.9);

   /* Gradients */
   --gradient-primary: linear-gradient(135deg, hsl(207, 60%, 45%), hsl(220, 70%, 55%));
   --gradient-mesh: radial-gradient(at 20% 80%, hsla(207,60%,50%,0.15), transparent 50%),
                    radial-gradient(at 80% 20%, hsla(260,60%,60%,0.1), transparent 50%);

   /* Transitions */
   --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
 }

 .dark {
   --glass-bg: rgba(15, 23, 42, 0.6);
   --glass-border: rgba(255, 255, 255, 0.08);
   --neu-raised: 6px 6px 12px rgba(0,0,0,0.3), -6px -6px 12px rgba(255,255,255,0.03);
 }

 Color Palette (Medical Premium)

 ┌───────────┬─────────────────────┬─────────────────────┬──────────────┐
 │   Role    │        Light        │        Dark         │     Use      │
 ├───────────┼─────────────────────┼─────────────────────┼──────────────┤
 │ Primary   │ #2563EB blue-600    │ #3B82F6 blue-500    │ Actions, nav │
 ├───────────┼─────────────────────┼─────────────────────┼──────────────┤
 │ Secondary │ #7C3AED violet-600  │ #8B5CF6 violet-500  │ AI features  │
 ├───────────┼─────────────────────┼─────────────────────┼──────────────┤
 │ Success   │ #059669 emerald-600 │ #10B981 emerald-500 │ Low risk     │
 ├───────────┼─────────────────────┼─────────────────────┼──────────────┤
 │ Warning   │ #D97706 amber-600   │ #F59E0B amber-500   │ Medium risk  │
 ├───────────┼─────────────────────┼─────────────────────┼──────────────┤
 │ Danger    │ #DC2626 red-600     │ #EF4444 red-500     │ High risk    │
 ├───────────┼─────────────────────┼─────────────────────┼──────────────┤
 │ Surface   │ #F8FAFC slate-50    │ #0F172A slate-900   │ Backgrounds  │
 └───────────┴─────────────────────┴─────────────────────┴──────────────┘

 Shared Primitives to Build

 - GlassCard: backdrop-blur + semi-transparent bg + border + layered shadow, hover: translateY(-2px) +
 shadow-lg
 - DepthCard: Neumorphic shadow + subtle perspective(1000px) rotateX(1deg), hover: scale(1.02)
 - AnimatedButton: Wraps shadcn Button + Framer Motion whileTap={{ scale: 0.97 }}, gradient backgrounds
 - StatDisplay: Animated counter + trend arrow + sparkline mini-chart
 - PageTransition: Framer Motion AnimatePresence wrapper for route changes

 Animation System (Framer Motion variants)

 - pageTransition: fade + slide-y on enter/exit
 - staggerContainer: children stagger by 60ms
 - fadeInUp: opacity 0→1 + y 16→0
 - cardHover: scale + shadow enhancement

 ---
 Part 3: Mobile-First Responsive Strategy

 Navigation Overhaul

 - Mobile (<768px): Fixed bottom tab bar (Dashboard, Record [center FAB], Patients, AI Chat, More)
 - Tablet (768-1023px): Collapsed sidebar (icons only, 72px) expanding on hover
 - Desktop (>=1024px): Current collapsible sidebar (260px/80px)

 Touch Optimization

 - All targets: min 44x44px
 - Swipe-to-reveal on cards (edit/delete) via Framer Motion drag
 - Bottom sheets (vaul Drawer) instead of modals on mobile
 - Pull-to-refresh on list views

 Responsive Grid

 Mobile:  1 col, 16px padding
 Tablet:  2 cols, 24px gap
 Desktop: 3-4 cols, 32px gap

 Progressive Disclosure (Mobile)

 - Patient Detail: accordion sections
 - Dashboard: top 3 items per section + "View All"
 - Recording: step wizard instead of side-by-side panels

 ---
 Part 4: Screen-by-Screen UI Plan

 ┌────────────┬─────────────────────────────┬──────────────────────────────┬────────────────────────┐
 │   Screen   │           Desktop           │            Mobile            │       Key Visual       │
 ├────────────┼─────────────────────────────┼──────────────────────────────┼────────────────────────┤
 │            │ Full-bleed hero + mesh      │                              │ 3D tilting cards on    │
 │ Landing    │ gradient bg + floating      │ Single column, fixed CTA     │ hover, staggered word  │
 │            │ glass feature cards +       │ bottom                       │ fade-in                │
 │            │ parallax                    │                              │                        │
 ├────────────┼─────────────────────────────┼──────────────────────────────┼────────────────────────┤
 │            │ Split: gradient             │ Full-screen form + gradient  │ Floating labels,       │
 │ Auth       │ illustration left, glass    │ header                       │ gradient submit button │
 │            │ form right                  │                              │                        │
 ├────────────┼─────────────────────────────┼──────────────────────────────┼────────────────────────┤
 │            │ Greeting banner + 4 stat    │ Horizontal scroll stats,     │ Animated counters,     │
 │ Dashboard  │ DepthCards + 2-col charts + │ stacked charts               │ glow on critical       │
 │            │  activity feed              │                              │ metrics                │
 ├────────────┼─────────────────────────────┼──────────────────────────────┼────────────────────────┤
 │            │ 2-panel: controls left,     │ Step wizard                  │ Pulsing mic with glow  │
 │ Recording  │ transcription right         │ (select→record→review)       │ ring, gradient         │
 │            │                             │                              │ waveform               │
 ├────────────┼─────────────────────────────┼──────────────────────────────┼────────────────────────┤
 │ Note       │ Resizable 2-panel +         │ Tabbed                       │ Section headers with   │
 │            │ floating action bar         │ (Content/Data/Actions)       │ gradient underline     │
 ├────────────┼─────────────────────────────┼──────────────────────────────┼────────────────────────┤
 │ Past Notes │ Glass search bar + 2-col    │ Single col list,             │ AnimatePresence for    │
 │            │ NoteCard grid               │ swipe-to-delete              │ filter transitions     │
 ├────────────┼─────────────────────────────┼──────────────────────────────┼────────────────────────┤
 │ Patients   │ Glass search + 3-col        │ 1-col list, swipe actions,   │ Risk badges with pulse │
 │            │ PatientCard grid + Add FAB  │ filter chips scroll          │  on high-risk          │
 ├────────────┼─────────────────────────────┼──────────────────────────────┼────────────────────────┤
 │ Patient    │ Hero (avatar + risk circle) │ Sticky header, accordion     │ Animated SVG risk      │
 │ Detail     │  + 3-col grid + tabs        │ sections                     │ circle, trend charts   │
 ├────────────┼─────────────────────────────┼──────────────────────────────┼────────────────────────┤
 │ Chat       │ Sidebar sessions + main     │ Full-screen chat, top drawer │ Glass AI bubbles,      │
 │            │ chat                        │  for sessions                │ 3-dot typing bounce    │
 ├────────────┼─────────────────────────────┼──────────────────────────────┼────────────────────────┤
 │ Image      │ 3 resizable panels          │ Step wizard                  │ Dark viewer bg + glass │
 │ Analysis   │                             │ (Upload→Analyze→Results)     │  overlay controls      │
 ├────────────┼─────────────────────────────┼──────────────────────────────┼────────────────────────┤
 │ Settings   │ Settings sidebar + content  │ Stacked expandable groups    │ Theme preview with     │
 │            │ area                        │                              │ live switch animation  │
 └────────────┴─────────────────────────────┴──────────────────────────────┴────────────────────────┘

 ---
 Part 5: Google Stitch Integration Strategy

 Workflow

 1. Create Project: mcp__stitch__create_project → "ClinicalScribe AI"
 2. Create Design System: mcp__stitch__create_design_system with:
   - customColor: "#2563EB" (primary blue)
   - headlineFont: PLUS_JAKARTA_SANS, bodyFont: INTER
   - roundness: ROUND_TWELVE, colorMode: LIGHT, colorVariant: TONAL_SPOT
   - designMd: markdown describing glassmorphism style, medical palette, spacing
 3. Generate Screens: For each of 11 screens, call generate_screen_from_text with detailed prompts for
 both DESKTOP and MOBILE variants (22 total screens)
 4. Iterate: Use edit_screens to refine, generate_variants for alternatives
 5. Apply: Use apply_design_system to ensure consistency

 Stitch → Code Mapping

 ┌───────────────┬─────────────────────────────────────┐
 │ Stitch Output │           Implementation            │
 ├───────────────┼─────────────────────────────────────┤
 │ Card designs  │ shadcn Card + GlassCard wrapper     │
 ├───────────────┼─────────────────────────────────────┤
 │ Navigation    │ DashboardLayout / MobileBottomNav   │
 ├───────────────┼─────────────────────────────────────┤
 │ Charts        │ Recharts (existing)                 │
 ├───────────────┼─────────────────────────────────────┤
 │ Modals        │ Dialog (desktop) / Drawer (mobile)  │
 ├───────────────┼─────────────────────────────────────┤
 │ Forms         │ react-hook-form + zod (existing)    │
 ├───────────────┼─────────────────────────────────────┤
 │ Tables        │ shadcn Table with responsive scroll │
 └───────────────┴─────────────────────────────────────┘

 Integration Process

 1. Generate Stitch screens as visual references
 2. Extract design decisions (spacing, ratios, component choices)
 3. Implement in components/stitch/ initially
 4. Move to features/*/components/ once validated
 5. Ensure all styles use design-system/tokens.css variables

 ---
 Part 6: New Feature Recommendations (Ranked by Impact)

 Tier 1 - Critical (Implement First)

 #: 1
 Feature: Multilingual Voice Documentation (Urdu, Punjabi, Sindhi, Pashto)
 Pain Point: 95% of Pakistani doctors speak to patients in Urdu/regional languages. Current code
 hardcodes
   language: 'en'. The translateAudio() function ALREADY EXISTS in speechToText.ts:134 but is never
   called.
 Technical Approach: Add language dropdown to RecordingPage → pass to processClinicalRecording → chain
   transcribe(source lang) + translate(to English) → generate SOAP in English → optionally render summary

   in Urdu via LLaMA. New DB column: notes.original_language. Difficulty: Low-Medium
 ────────────────────────────────────────
 #: 2
 Feature: Drug Interaction & Prescription Safety Checker
 Pain Point: Medication errors kill more than road accidents. Doctors in 200+/day OPDs miss interactions.

   App extracts medications but does nothing with them.
 Technical Approach: New prescriptionSafety.ts service → LLaMA checks new meds vs patient's existing
   medications/allergies/diagnoses → returns interactions, allergy conflicts, contraindications →
 blocking
    alert on NotePage before save. New table: prescription_checks. Difficulty: Medium
 ────────────────────────────────────────
 #: 3
 Feature: Prescription Generation + PDF/WhatsApp Share
 Pain Point: Handwritten prescriptions = illegibility + errors + no digital record. WhatsApp is how
   Pakistan works.
 Technical Approach: Extract meds from extractClinicalInformation → formatted prescription → PDF via
   existing jsPDF → whatsapp://send?phone=X&text=Y share link. New table: prescriptions. Difficulty:
   Medium
 ────────────────────────────────────────
 #: 4
 Feature: Quick Mode (60-Second Visit Documentation)
 Pain Point: 200+ OPD patients/day = 2-3 min per patient. Current flow has too many steps.
 Technical Approach: Single recording → parallel AI: extractPatientInfo + generateStructuredNote +
   extractPrescription + extractFollowUp → one-tap confirm → auto-create
   patient/visit/note/prescription/follow-up. Target: under 60 seconds total. Difficulty: Medium

 Tier 2 - High Impact

 #: 5
 Feature: AI Differential Diagnosis Assistant
 Pain Point: 12% diagnostic error rate globally. GP in rural BHU handles cases outside specialty.
 Technical Approach: Enhance PatientChatModal → feed full patient context → LLaMA returns ranked
   differentials with probability, supporting evidence, tests to confirm/exclude. New table:
   clinical_consultations. Difficulty: Medium
 ────────────────────────────────────────
 #: 6
 Feature: SMS Follow-Up Reminders
 Pain Point: Follow-up compliance extremely low. 80%+ patients don't use email. SMS costs 0.5 PKR/msg.
 Technical Approach: Twilio/local SMS gateway → check visits.follow_up_date daily → send Urdu reminder
   24hrs before. New table: patient_sms. New field: patients.sms_opt_in. Difficulty:  Medium
 ────────────────────────────────────────
 #: 7
 Feature: WhatsApp Integration
 Pain Point: WhatsApp is universal in Pakistan. Email reaches the wrong channel.
 Technical Approach: Phase 1 (easy): whatsapp://send?phone=X&text=Y links for visit summaries,
   prescriptions, reminders. Phase 2: WhatsApp Business API. Difficulty: Low→Medium
 ────────────────────────────────────────
 #: 8
 Feature: Chronic Disease Dashboard
 Pain Point: Diabetes/hypertension epidemic. No longitudinal vital tracking across visits.
 Technical Approach: Plot vitals/labs over time per patient. Auto-detect chronic conditions from
 diagnoses
   → show relevant panels. LLaMA trend analysis. New table: patient_metrics. Difficulty: Medium

 Tier 3 - Strategic

 ┌─────┬─────────────────────┬──────────────────────────────────┬───────────────────────────────────┐
 │  #  │       Feature       │            Pain Point            │             Approach              │
 ├─────┼─────────────────────┼──────────────────────────────────┼───────────────────────────────────┤
 │     │ OPD Queue           │                                  │ New opd_queue table, reuse risk   │
 │ 9   │ Management + AI     │ No patient prioritization in     │ assessment for triage scoring,    │
 │     │ Triage              │ 200+/day OPDs                    │ Supabase Realtime for live        │
 │     │                     │                                  │ updates                           │
 ├─────┼─────────────────────┼──────────────────────────────────┼───────────────────────────────────┤
 │     │                     │                                  │ Query overdue follow-ups,         │
 │ 10  │ Morning Briefing    │ Doctors start blind. Component   │ high-risk patients, worsening     │
 │     │ Enhancement         │ exists but needs expansion       │ trends → LLaMA summary →          │
 │     │                     │                                  │ actionable dashboard card         │
 ├─────┼─────────────────────┼──────────────────────────────────┼───────────────────────────────────┤
 │     │                     │ Pakistan: 186/100k maternal      │ New pages + tables for pregnancy  │
 │ 11  │ MCH Tracking Module │ mortality. No                    │ milestones, EPI schedule, growth  │
 │     │                     │ antenatal/vaccination tracking   │ charts, danger sign alerts        │
 ├─────┼─────────────────────┼──────────────────────────────────┼───────────────────────────────────┤
 │     │                     │ Rural Pakistan = unreliable      │ IndexedDB caching, queue AI       │
 │ 12  │ Offline-First Mode  │ internet. App is fully online.   │ requests, bidirectional sync,     │
 │     │                     │                                  │ Service Worker                    │
 ├─────┼─────────────────────┼──────────────────────────────────┼───────────────────────────────────┤
 │     │ FHIR Export /       │ Clinical data trapped in silos.  │ Map schema to FHIR R4 resources,  │
 │ 13  │ Interoperability    │ No portable patient records.     │ QR-code sharing, export as PDF    │
 │     │                     │                                  │ with embedded QR                  │
 ├─────┼─────────────────────┼──────────────────────────────────┼───────────────────────────────────┤
 │     │ Doctor Burnout      │ Physician burnout = more errors. │ Analyze timestamps, note length   │
 │ 14  │ Detection           │  App already tracks usage        │ trends, volume patterns →         │
 │     │                     │ patterns.                        │ wellness traffic light            │
 └─────┴─────────────────────┴──────────────────────────────────┴───────────────────────────────────┘

 ---
 Part 7: Implementation Sequence

 Phase 0: Foundation (Week 1)

 1. Install framer-motion
 2. Restructure folders (feature-based) → update all imports
 3. Split db/services.ts into entity files with barrel index.ts
 4. Create design-system/ token files
 5. Update tailwind.config.ts + index.css with new tokens
 6. Migrate from useState routing to React Router (enables AnimatePresence + code splitting)

 Phase 1: Layout & Shared Components (Week 2)

 1. Build MobileBottomNav.tsx, extract Sidebar.tsx, TopBar.tsx
 2. Build PageTransition.tsx wrapper
 3. Build GlassCard, DepthCard, AnimatedButton, StatDisplay
 4. Build LoadingSkeleton, EmptyState

 Phase 2: Stitch Design Generation (Week 3)

 1. Create Stitch project + design system
 2. Generate all 22 screens (11 desktop + 11 mobile)
 3. Review, iterate, extract design decisions

 Phase 3: Screen Rebuilds (Weeks 4-7)

 Priority order: Dashboard → Recording → Patient Detail → Patients → Chat → Notes → Image Analysis →
 Settings → Auth → Landing

 Phase 4: Feature Development (Weeks 8-12)

 Tier 1 features: Multilingual Voice → Drug Interaction Checker → Prescription Generation → Quick Mode

 Phase 5: Polish (Week 13)

 Dark mode refinement, animation tuning, performance audit, accessibility audit, cross-browser testing

 ---
 Part 8: Verification Plan

 UI Verification

 - Test all 11 screens at 375px (iPhone SE), 768px (iPad), 1024px (laptop), 1440px (desktop)
 - Verify glassmorphism renders correctly in Chrome, Safari, Firefox
 - Check dark mode on every screen
 - Test bottom nav on mobile, sidebar on desktop
 - Verify page transitions with Framer Motion AnimatePresence

 Feature Verification

 - Record in Urdu → verify transcription + English translation + SOAP note generation
 - Add conflicting medications → verify drug interaction alert fires
 - Generate prescription → verify PDF export + WhatsApp share link
 - Quick Mode: record 30s → verify auto-extraction of patient/meds/follow-up in under 60s

 End-to-End Flow

 1. Sign up → land on dashboard with animated stats
 2. Create patient → verify in patients list
 3. Record visit (Urdu) → transcription → structured note → prescription alert
 4. View note → export PDF → email/WhatsApp
 5. Check patient detail → risk score animated → visit timeline
 6. Chat with AI about patient → differential diagnosis
 7. Check dashboard → morning briefing shows the new patient

 Critical Files to Modify

 - src/App.tsx → refactor to slim router + providers
 - src/db/services.ts → split into 9 entity services
 - src/components/layout/DashboardLayout.tsx → decompose into Sidebar + MobileBottomNav + TopBar
 - src/index.css → extend with glassmorphism/shadow/gradient tokens
 - tailwind.config.ts → new shadow, blur, gradient, animation extensions
 - src/services/speechToText.ts → wire up language param + translateAudio
 - src/services/textGeneration.ts → new functions for drug interactions, differential diagnosis,
 prescription extraction
 - src/db/schema.ts → new tables for prescriptions, prescription_checks, patient_metrics, etc.