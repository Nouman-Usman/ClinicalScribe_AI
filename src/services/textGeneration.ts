import Groq from 'groq-sdk';
import ENV from '@/config/env';
import { getNoteTemplate } from '@/config/noteTemplates';

let client: Groq | null = null;

function getClient(): Groq {
  if (!client) {
    const apiKey = ENV.GROQ_API_KEY;
    console.log('Environment check:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      isDev: ENV.IS_DEV,
      allEnvKeys: Object.keys(import.meta.env)
    });
    
    if (!apiKey) {
      console.error('Available environment variables:', import.meta.env);
      throw new Error('VITE_GROQ_API_KEY environment variable is not set. Please restart your dev server after adding the .env file.');
    }
    client = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  }
  return client;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Generate a text completion using Groq's Chat Completions API
 * @param messages - Array of messages in chronological order
 * @param systemPrompt - Optional system message to set the behavior of the assistant
 * @param temperature - Controls randomness (0-1, default 0.5)
 * @param maxTokens - Maximum tokens to generate (default 1024)
 * @returns The generated text response
 */
export async function generateText(
  messages: Message[],
  systemPrompt?: string,
  temperature: number = 0.5,
  maxTokens: number = 1024
): Promise<string> {
  const fullMessages: Message[] = [];

  if (systemPrompt) {
    fullMessages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  fullMessages.push(...messages);

  try {
    const completion = await getClient().chat.completions.create({
      messages: fullMessages,
      model: 'llama-3.3-70b-versatile',
      temperature,
      max_completion_tokens: maxTokens,
      top_p: 1,
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
}

/**
 * Stream a text completion for real-time responses
 * @param messages - Array of messages in chronological order
 * @param systemPrompt - Optional system message
 * @param temperature - Controls randomness (0-1, default 0.5)
 * @param maxTokens - Maximum tokens to generate (default 1024)
 * @param onChunk - Callback function called for each chunk of text
 */
export async function streamText(
  messages: Message[],
  systemPrompt: string | undefined,
  temperature: number = 0.5,
  maxTokens: number = 1024,
  onChunk: (chunk: string) => void
): Promise<void> {
  const fullMessages: Message[] = [];

  if (systemPrompt) {
    fullMessages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  fullMessages.push(...messages);

  try {
    const stream = await getClient().chat.completions.create({
      messages: fullMessages,
      model: 'llama-3.3-70b-versatile',
      temperature,
      max_completion_tokens: maxTokens,
      top_p: 1,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error('Error streaming text:', error);
    throw error;
  }
}

/**
 * Generate clinical notes summary from transcribed text
 * @param transcribedText - The transcribed clinical note text
 * @returns Structured clinical note summary
 */
export async function generateClinicalNoteSummary(
  transcribedText: string
): Promise<string> {
  const systemPrompt = `You are a clinical documentation specialist. Your task is to analyze transcribed clinical notes and provide a structured, professional summary. 
Focus on:
- Chief Complaint
- History of Present Illness
- Physical Examination Findings
- Assessment and Plan
- Return instructions and follow-up care

Format the response clearly with section headers.`;

  const messages: Message[] = [
    {
      role: 'user',
      content: `Please create a structured clinical note summary from the following transcribed text:\n\n${transcribedText}`,
    },
  ];

  return generateText(messages, systemPrompt, 0.3, 1024);
}

/**
 * Extract key information from clinical notes
 * @param notes - Clinical notes text
 * @returns Extracted key information
 */
export async function extractClinicalInformation(notes: string): Promise<{
  diagnosis: string[];
  medications: string[];
  labOrders: string[];
  followUpInstructions: string;
}> {
  const systemPrompt = `You are a clinical information extraction specialist. Extract the following information from clinical notes and return a JSON object with:
- diagnosis: array of diagnoses mentioned
- medications: array of medications prescribed or mentioned
- labOrders: array of laboratory tests ordered
- followUpInstructions: string containing follow-up care instructions

Return ONLY valid JSON, no additional text.`;

  const messages: Message[] = [
    {
      role: 'user',
      content: `Extract clinical information from these notes:\n\n${notes}`,
    },
  ];

  try {
    const response = await generateText(messages, systemPrompt, 0.1, 1024);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      diagnosis: [],
      medications: [],
      labOrders: [],
      followUpInstructions: '',
    };
  } catch (error) {
    console.error('Error extracting clinical information:', error);
    return {
      diagnosis: [],
      medications: [],
      labOrders: [],
      followUpInstructions: '',
    };
  }
}

/**
 * Extract patient information from transcribed text
 * @param transcribedText - The transcribed clinical conversation
 * @returns Extracted patient information (name, age, chief complaint)
 */
export async function extractPatientInfo(
  transcribedText: string
): Promise<{ name?: string; age?: string; chiefComplaint?: string }> {
  const systemPrompt = `You are a clinical documentation specialist. Extract patient information from the transcribed clinical conversation.

Analyze the conversation and extract:
- Patient name: The patient's full name or identifier
- Patient age: The patient's age (numeric value only, e.g., "45" not "45 years old")
- Chief complaint: The primary reason for the visit or main concern

Return a JSON object with these keys (use null for any missing information):
{
  "name": "patient name or null",
  "age": "numeric age or null",
  "chief_complaint": "chief complaint or null"
}

Rules:
- Only extract information explicitly mentioned in the conversation
- For age, return only the numeric value (e.g., "35" not "35 years")
- For chief complaint, extract the main concern in 1-2 sentences
- Use null for any field not mentioned in the audio
- Return ONLY valid JSON, no markdown or code blocks`;

  const messages: Message[] = [
    {
      role: 'user',
      content: `Extract patient information from this clinical conversation:\n\n${transcribedText}`,
    },
  ];

  try {
    const response = await generateText(messages, systemPrompt, 0.2, 512);
    console.log('📋 Patient Info Extraction Response:', response);

    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully extracted patient info:', {
        name: parsed.name,
        age: parsed.age,
        chief_complaint: parsed.chief_complaint
      });

      return {
        name: parsed.name || undefined,
        age: parsed.age || undefined,
        chiefComplaint: parsed.chief_complaint || undefined,
      };
    }

    console.warn('⚠️ Could not extract JSON for patient info');
    return {};
  } catch (error) {
    console.error('❌ Error extracting patient info:', error);
    return {};
  }
}


export async function generateStructuredNote(
  transcribedText: string
): Promise<Record<string, string>> {
  const systemPrompt = `You are a clinical documentation specialist. Analyze the transcribed clinical conversation and extract relevant clinical information.

IMPORTANT: Generate sections dynamically based on what's actually discussed in the conversation. Do NOT force any predefined structure.

Analyze the content and create appropriate sections. For example:
- If patient history is discussed: create "Patient History" section
- If physical exam is mentioned: create "Physical Examination" section  
- If treatment is discussed: create "Treatment Plan" section
- If diagnoses are mentioned: create "Assessment/Diagnosis" section
- If specific concerns are raised: create sections for those concerns
- If follow-up is discussed: create "Follow-up" section
- If billing codes are relevant: create "ICD-10/CPT Codes" section

Return a JSON object where:
- Each key is a section title (in snake_case, e.g., "patient_history", "physical_exam", "assessment")
- Each value is the detailed content for that section

Example format:
{
  "chief_complaint": "Patient's main concern in brief",
  "patient_history": "Relevant medical and social history",
  "physical_examination": "Physical exam findings",
  "assessment_and_plan": "Clinical impression and treatment approach",
  "follow_up": "Follow-up instructions"
}

Rules:
- Only include sections that are actually relevant to the conversation
- Use descriptive snake_case keys that indicate the section content
- If information is minimal or not discussed, omit that section entirely
- Return ONLY valid JSON, no markdown, no code blocks
- Ensure all string values are properly escaped for JSON`;

  const messages: Message[] = [
    {
      role: 'user',
      content: `Analyze this clinical conversation and extract relevant sections dynamically:\n\n${transcribedText}`,
    },
  ];

  try {
    const response = await generateText(messages, systemPrompt, 0.3, 2048);
    console.log('📝 Raw AI Response:', response.substring(0, 300) + '...');

    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed dynamic sections with keys:', Object.keys(parsed));
      
      // Use the dynamically generated sections as-is
      const result: Record<string, string> = parsed;
      
      console.log('🎯 Final flexible note structure with sections:', {
        generatedSections: Object.keys(result),
        sectionCount: Object.keys(result).length
      });
      
      return result;
    }

    console.warn('⚠️ Could not extract JSON from response');

    // If JSON parsing fails, return the raw text as a single section
    const fallback: Record<string, string> = {
      'clinical_notes': response
    };
    
    console.log('🔄 Using fallback with single section');
    return fallback;
  } catch (error) {
    console.error('❌ Error generating flexible note:', error);

    // Return error state
    const errorResult: Record<string, string> = {
      'error': 'Error generating note content. Please try again or enter manually.'
    };
    
    console.error('⛔ Error generating note');
    return errorResult;
  }
}

/**
 * Extract structured clinical data from note content
 * @param noteContent - The note content object with all sections
 * @returns Extracted structured data including vitals, clinical info, symptoms
 */
export async function extractStructuredData(
  noteContent: Record<string, string>
): Promise<any> {
  const contentText = Object.entries(noteContent)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n\n');

  const systemPrompt = `You are a clinical data extraction specialist. Analyze clinical notes and extract structured data.

Extract the following information from the clinical notes and return a JSON object:

{
  "vitals": {
    "bloodPressure": {"systolic": number, "diastolic": number, "status": "normal|elevated|high|critical"},
    "heartRate": {"value": number, "status": "normal|low|high"},
    "temperature": {"value": number, "unit": "C|F", "status": "normal|low|fever|high-fever"},
    "weight": {"value": number, "unit": "lbs|kg", "previousValue": number or null, "change": number or null, "status": "stable|gained|lost"},
    "o2Saturation": {"value": number, "status": "normal|low|critical"},
    "respiratoryRate": {"value": number, "status": "normal|low|high"}
  },
  "clinicalInfo": {
    "chiefComplaint": "string",
    "diagnoses": ["array", "of", "diagnoses"],
    "medicationsMentioned": [
      {"name": "medication name", "dosage": "dosage", "frequency": "frequency", "route": "route"}
    ],
    "labValues": [
      {"testName": "test name", "value": "value", "unit": "unit", "referenceRange": "range", "status": "normal|high|low|critical"}
    ],
    "allergies": ["array", "of", "allergies"]
  },
  "symptoms": [
    {"name": "symptom", "severity": "mild|moderate|severe", "duration": "duration"}
  ]
}

Rules:
- Extract ONLY values explicitly mentioned in the notes
- For any missing information, use null
- BP status: normal <120/80, elevated 120-129/<80, high ≥130/80, critical ≥180/120
- HR status: normal 60-100, low <60, high >100
- Temperature status: normal 98.6°F (37°C), fever 100.4-103.9°F, high-fever ≥104°F
- O2 status: normal ≥95%, low 90-94%, critical <90%
- RR status: normal 12-20, low <12, high >20
- For weight: if previous value mentioned, calculate change and status
- Only include diagnoses, medications, and lab values that are actually mentioned
- Return ONLY valid JSON, no markdown`;

  const messages: Message[] = [
    {
      role: 'user',
      content: `Extract structured clinical data from these notes:\n\n${contentText}`,
    },
  ];

  try {
    const response = await generateText(messages, systemPrompt, 0.1, 2048);
    console.log('📊 Structured Data Response:', response.substring(0, 300) + '...');

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully extracted structured data');
      return parsed;
    }

    console.warn('⚠️ Could not extract structured data JSON');
    return { vitals: {}, clinicalInfo: {}, symptoms: [] };
  } catch (error) {
    console.error('❌ Error extracting structured data:', error);
    return { vitals: {}, clinicalInfo: {}, symptoms: [] };
  }
}

// ─── Clinical Intelligence Functions ───────────────────────────────────────

export interface Differential {
  rank: number;
  condition: string;
  icd10: string;
  reasoning: string;
  redFlags: string[];
  suggestedWorkup: string[];
}

export async function generateDifferentialDiagnosis(params: {
  transcription: string;
  patientAge?: number;
  patientGender?: string;
  existingDiagnoses?: string[];
  medications?: string[];
}): Promise<Differential[]> {
  const { transcription, patientAge, patientGender, existingDiagnoses = [], medications = [] } = params;

  const systemPrompt = `You are an expert clinical reasoning specialist. Given a consultation transcription and patient context, generate a ranked differential diagnosis list.

Return ONLY valid JSON in this exact format:
{
  "differentials": [
    {
      "rank": 1,
      "condition": "Condition Name",
      "icd10": "ICD-10 code",
      "reasoning": "Why this fits the presentation",
      "redFlags": ["red flag 1", "red flag 2"],
      "suggestedWorkup": ["test 1", "test 2"]
    }
  ]
}

Rules:
- Rank 3-5 most likely differentials
- Base reasoning on specific findings from the transcription
- Red flags are findings that would confirm or urgently suggest this diagnosis
- Suggested workup should be practical and evidence-based
- Return ONLY JSON, no markdown`;

  const userContent = `Patient: ${patientAge ? patientAge + ' yr' : 'age unknown'} ${patientGender || ''}
Existing diagnoses: ${existingDiagnoses.join(', ') || 'none'}
Current medications: ${medications.join(', ') || 'none'}

Consultation transcription:
${transcription}`;

  const messages: Message[] = [{ role: 'user', content: userContent }];

  try {
    const response = await generateText(messages, systemPrompt, 0.2, 2048);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.differentials || [];
    }
    return [];
  } catch (error) {
    console.error('❌ Error generating differentials:', error);
    return [];
  }
}

export interface DrugInteraction {
  drugs: string[];
  severity: 'contraindicated' | 'major' | 'moderate' | 'minor';
  interaction: string;
  recommendation: string;
}

export async function checkDrugInteractions(params: {
  newMedications: string[];
  existingMedications: string[];
  patientAge?: number;
  patientWeight?: number;
}): Promise<DrugInteraction[]> {
  const { newMedications, existingMedications, patientAge, patientWeight } = params;

  if (newMedications.length === 0 && existingMedications.length === 0) return [];

  const allMeds = [...new Set([...newMedications, ...existingMedications])];
  if (allMeds.length < 2) return [];

  const systemPrompt = `You are a clinical pharmacist and drug safety specialist. Analyze medication lists for interactions.

Return ONLY valid JSON in this format:
{
  "interactions": [
    {
      "drugs": ["drug1", "drug2"],
      "severity": "contraindicated|major|moderate|minor",
      "interaction": "Description of the interaction mechanism and effects",
      "recommendation": "What the clinician should do"
    }
  ]
}

Severity definitions:
- contraindicated: Should never be used together
- major: May be life-threatening, avoid combination
- moderate: Monitor closely, may require dose adjustment
- minor: Clinically insignificant, minimal action needed

Return ONLY JSON. If no interactions, return {"interactions": []}`;

  const userContent = `Patient: ${patientAge ? patientAge + ' yr' : ''} ${patientWeight ? patientWeight + 'kg' : ''}
New medications being prescribed: ${newMedications.join(', ') || 'none'}
Existing patient medications: ${existingMedications.join(', ') || 'none'}

Check all pairwise interactions between ALL medications listed above.`;

  const messages: Message[] = [{ role: 'user', content: userContent }];

  try {
    const response = await generateText(messages, systemPrompt, 0.1, 2048);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.interactions || [];
    }
    return [];
  } catch (error) {
    console.error('❌ Error checking drug interactions:', error);
    return [];
  }
}

export interface PreVisitBriefing {
  patientStory: string;
  pendingActions: string[];
  riskChanges: string;
  suggestionItems: string[];
  medicationsToReview: string[];
}

export async function generatePreVisitBriefing(params: {
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  diagnoses?: string[];
  medications?: string[];
  recentVisits: Array<{
    visitDate: string;
    chiefComplaint?: string;
    summary?: string;
    diagnosis?: string;
    treatmentPlan?: string;
    followUpDate?: string;
  }>;
  riskLevel?: string;
  riskScore?: number;
}): Promise<PreVisitBriefing> {
  const { patientName, patientAge, patientGender, diagnoses = [], medications = [], recentVisits, riskLevel, riskScore } = params;

  const visitsText = recentVisits.slice(0, 3).map((v, i) =>
    `Visit ${i + 1} (${new Date(v.visitDate).toLocaleDateString()}):
  Chief complaint: ${v.chiefComplaint || 'not recorded'}
  Diagnosis: ${v.diagnosis || 'not recorded'}
  Plan: ${v.treatmentPlan || 'not recorded'}
  Follow-up due: ${v.followUpDate ? new Date(v.followUpDate).toLocaleDateString() : 'not scheduled'}`
  ).join('\n\n');

  const systemPrompt = `You are an intelligent medical assistant preparing a pre-visit briefing for a physician.

Return ONLY valid JSON:
{
  "patientStory": "2-3 sentence narrative summary of this patient's clinical trajectory",
  "pendingActions": ["action item 1", "action item 2"],
  "riskChanges": "One sentence about risk changes or trends",
  "suggestionItems": ["suggested talking point 1", "suggested talking point 2"],
  "medicationsToReview": ["medication 1 - reason to review"]
}

Be specific, concise, and clinically relevant. Return ONLY JSON.`;

  const userContent = `Patient: ${patientName}, ${patientAge ? patientAge + ' yr' : ''} ${patientGender || ''}
Active diagnoses: ${diagnoses.join(', ') || 'none documented'}
Current medications: ${medications.join(', ') || 'none'}
Risk level: ${riskLevel || 'unknown'} (score: ${riskScore ?? 'N/A'}/100)

Recent visit history:
${visitsText || 'No previous visits'}`;

  const messages: Message[] = [{ role: 'user', content: userContent }];

  try {
    const response = await generateText(messages, systemPrompt, 0.3, 1024);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as PreVisitBriefing;
    }
    return { patientStory: '', pendingActions: [], riskChanges: '', suggestionItems: [], medicationsToReview: [] };
  } catch (error) {
    console.error('❌ Error generating pre-visit briefing:', error);
    return { patientStory: '', pendingActions: [], riskChanges: '', suggestionItems: [], medicationsToReview: [] };
  }
}

export type ClinicalLetterType = 'referral' | 'priorAuth' | 'fitnessCert' | 'sickLeave' | 'dischargeSummary';

export async function generateClinicalLetter(params: {
  letterType: ClinicalLetterType;
  doctorName: string;
  doctorSpecialty?: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  diagnoses?: string[];
  medications?: string[];
  visitSummary?: string;
  additionalContext?: string;
}): Promise<string> {
  const { letterType, doctorName, doctorSpecialty, patientName, patientAge, patientGender, diagnoses = [], medications = [], visitSummary, additionalContext } = params;

  const letterTypeDescriptions: Record<ClinicalLetterType, string> = {
    referral: 'specialist referral letter requesting consultation. Include reason for referral, relevant history, current medications, urgency level, and specific questions for the specialist.',
    priorAuth: 'insurance prior authorization letter for a medication or procedure. Include diagnosis, clinical justification, evidence base, ICD-10 codes, and why alternatives are insufficient.',
    fitnessCert: 'fitness/medical clearance certificate. State patient is fit for the specified activity, note any restrictions.',
    sickLeave: 'sick leave / medical certificate. State patient was seen and is medically unfit for work for the specified period.',
    dischargeSummary: 'discharge summary. Include admission reason, hospital course, procedures performed, discharge diagnosis, discharge medications, and follow-up instructions.',
  };

  const systemPrompt = `You are a medical professional writing formal clinical correspondence. Write a professional, properly formatted ${letterTypeDescriptions[letterType]}

Format: Professional letter with date, recipient (if referral), patient details, body paragraphs, and signature block.
Tone: Professional, clinical, concise.
Do NOT include placeholder text like [NAME] — use actual provided data or omit gracefully.`;

  const userContent = `Doctor: Dr. ${doctorName}${doctorSpecialty ? ', ' + doctorSpecialty : ''}
Patient: ${patientName}, ${patientAge ? patientAge + ' years' : 'age unknown'}, ${patientGender || ''}
Diagnoses: ${diagnoses.join(', ') || 'see clinical context'}
Current medications: ${medications.join(', ') || 'none'}
${visitSummary ? 'Recent visit summary: ' + visitSummary : ''}
${additionalContext ? 'Additional context: ' + additionalContext : ''}

Write the complete ${letterType} letter.`;

  const messages: Message[] = [{ role: 'user', content: userContent }];

  try {
    const response = await generateText(messages, systemPrompt, 0.4, 2048);
    return response.trim();
  } catch (error) {
    console.error('❌ Error generating clinical letter:', error);
    return '';
  }
}

export interface FollowUpPlan {
  intervalDays: number;
  rationale: string;
  checkItems: string[];
  patientInstructions: string[];
  urgentReturnSigns: string[];
}

export async function generateFollowUpRecommendation(params: {
  diagnosis: string;
  treatmentPlan: string;
  patientAge?: number;
  riskScore?: number;
  riskLevel?: string;
  existingDiagnoses?: string[];
}): Promise<FollowUpPlan> {
  const { diagnosis, treatmentPlan, patientAge, riskScore, riskLevel, existingDiagnoses = [] } = params;

  const systemPrompt = `You are an evidence-based medicine specialist. Generate a follow-up plan based on clinical context.

Return ONLY valid JSON:
{
  "intervalDays": number (days until follow-up),
  "rationale": "Why this interval was chosen",
  "checkItems": ["what to assess at next visit"],
  "patientInstructions": ["home monitoring instructions for patient"],
  "urgentReturnSigns": ["symptoms/signs that warrant immediate return"]
}

Base interval on clinical guidelines. Typical ranges: acute 3-7d, chronic stable 30-90d, high-risk 7-14d.
Return ONLY JSON.`;

  const userContent = `Diagnosis: ${diagnosis}
Treatment plan: ${treatmentPlan}
Patient age: ${patientAge || 'unknown'}
Risk level: ${riskLevel || 'unknown'} (score: ${riskScore ?? 'N/A'}/100)
Comorbidities: ${existingDiagnoses.join(', ') || 'none'}`;

  const messages: Message[] = [{ role: 'user', content: userContent }];

  try {
    const response = await generateText(messages, systemPrompt, 0.2, 1024);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as FollowUpPlan;
    }
    return { intervalDays: 30, rationale: '', checkItems: [], patientInstructions: [], urgentReturnSigns: [] };
  } catch (error) {
    console.error('❌ Error generating follow-up plan:', error);
    return { intervalDays: 30, rationale: '', checkItems: [], patientInstructions: [], urgentReturnSigns: [] };
  }
}

export interface GuidelineCheck {
  condition: string;
  guidelineRef: string;
  status: 'aligned' | 'review' | 'deviation';
  deviation?: string;
  recommendation?: string;
}

export interface GuidelineAdherence {
  overallStatus: 'aligned' | 'review' | 'deviation';
  checks: GuidelineCheck[];
}

export async function checkGuidelineAdherence(params: {
  diagnosis: string;
  treatmentPlan: string;
  medications?: string[];
  vitals?: Record<string, any>;
  patientAge?: number;
  existingDiagnoses?: string[];
}): Promise<GuidelineAdherence> {
  const { diagnosis, treatmentPlan, medications = [], vitals = {}, patientAge, existingDiagnoses = [] } = params;

  const systemPrompt = `You are a clinical quality specialist who checks treatment plans against established clinical guidelines.

Known guidelines you apply:
- Hypertension: JNC 8 (BP targets <140/90 general, <150/90 for >60yr; first-line: thiazide, CCB, ACE/ARB)
- Diabetes: ADA Standards (A1C target <7% general; metformin first-line; annual foot exam, nephropathy screening)
- Heart failure: ACC/AHA (ACE/ARB, beta-blocker, diuretic; EF monitoring)
- COPD: GOLD guidelines (bronchodilator, inhaled corticosteroid based on severity)
- Asthma: GINA (step therapy, ICS; controller vs reliever)
- Depression: APA (SSRI first-line; 6-week trial; safety assessment)
- Atrial fibrillation: CHA2DS2-VASc for anticoagulation

Return ONLY valid JSON:
{
  "overallStatus": "aligned|review|deviation",
  "checks": [
    {
      "condition": "Condition name",
      "guidelineRef": "Guideline name and year",
      "status": "aligned|review|deviation",
      "deviation": "What deviates (if applicable)",
      "recommendation": "What to consider doing differently (if applicable)"
    }
  ]
}

Only check conditions that are present in the diagnosis/plan. If no recognized chronic conditions, return {"overallStatus": "aligned", "checks": []}.
Return ONLY JSON.`;

  const vitalsText = Object.entries(vitals)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(', ');

  const userContent = `Diagnosis: ${diagnosis}
Treatment plan: ${treatmentPlan}
Medications: ${medications.join(', ') || 'none'}
Vitals: ${vitalsText || 'not recorded'}
Patient age: ${patientAge || 'unknown'}
Comorbidities: ${existingDiagnoses.join(', ') || 'none'}`;

  const messages: Message[] = [{ role: 'user', content: userContent }];

  try {
    const response = await generateText(messages, systemPrompt, 0.1, 2048);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as GuidelineAdherence;
    }
    return { overallStatus: 'aligned', checks: [] };
  } catch (error) {
    console.error('❌ Error checking guideline adherence:', error);
    return { overallStatus: 'aligned', checks: [] };
  }
}
