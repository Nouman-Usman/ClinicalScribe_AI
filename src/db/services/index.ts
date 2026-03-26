// Barrel re-exports - preserves all existing imports from '@/db/services'
export { createUser, getUserByEmail, getUserById, updateUser, getUserSettings, createOrUpdateUserSettings } from './userService';
export { createNote, getNoteById, getNotesByUserId, updateNote, deleteNote, archiveNote, searchNotes, getNotesByDateRange } from './noteService';
export { createPatient, getPatientById, getPatientsByUserId, updatePatient, deletePatient, searchPatients } from './patientService';
export { createVisit, getVisitById, getVisitsByPatientId, getVisitsWithNotesByPatientId, getVisitsByUserId, updateVisit, deleteVisit, getVisitsWithNotes, getPatientVisits } from './visitService';
export { createChatMessage, getChatMessagesBySessionId, deleteChatMessage, deleteChatHistoryByUserId, createChatSession, getChatSessionsByUserId, getChatSessionById, updateChatSessionTitle, deleteChatSession } from './chatService';
export { createPatientChatSession, getPatientChatSessionsByPatientId, getPatientChatSessionById, updatePatientChatSessionTitle, deletePatientChatSession, createPatientChatMessage, getPatientChatMessagesBySessionId, deletePatientChatMessagesBySessionId } from './patientChatService';
export { updatePatientRiskLevel, updateVisitRiskAssessment, createPatientRiskHistoryEntry, getPatientRiskHistory, getHighRiskPatients, getPatientStatistics } from './riskService';
export type { RiskAssessment } from './riskService';
export { getDashboardStats, getVisitTrends, getRecentActivity, getUpcomingFollowUps } from './dashboardService';
export type { DashboardStats, VisitTrendData, RecentActivity } from './dashboardService';
export { createPatientEmail, updatePatientEmail, getPatientEmails, getPatientEmailById, deletePatientEmail, getEmailsByUserId, markEmailAsSent } from './emailService';
export { dbNoteToAppNote, dbUserToAppUser, dbPatientToAppPatient, dbVisitToAppVisit } from './mappers';
