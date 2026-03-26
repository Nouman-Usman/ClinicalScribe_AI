import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { User, Note, Patient, Page } from './types';

interface AppState {
  user: User | null;
  currentNote: Note | null;
  currentPatient: Patient | null;
  recordingForPatient: Patient | null;
}

interface AppContextValue extends AppState {
  login: (userData: User) => void;
  logout: () => void;
  navigateTo: (page: Page) => void;
  setCurrentNote: (note: Note | null) => void;
  setCurrentPatient: (patient: Patient | null) => void;
  setRecordingForPatient: (patient: Patient | null) => void;
  handleNoteCreated: (note: Note) => void;
  handlePatientSelect: (patient: Patient) => void;
  handleStartRecordingForPatient: (patient: Patient) => void;
  handlePatientAdded: (patient: Patient) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const pageToRoute: Record<Page, string> = {
  landing: '/',
  auth: '/auth',
  dashboard: '/dashboard',
  recording: '/recording',
  note: '/note',
  'past-notes': '/past-notes',
  settings: '/settings',
  chat: '/chat',
  patients: '/patients',
  patient: '/patient',
  'patient-recording': '/patient-recording',
  'image-analysis': '/image-analysis',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [recordingForPatient, setRecordingForPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('clinicalscribe_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      navigate('/dashboard', { replace: true });
    }
  }, []);

  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('clinicalscribe_user', JSON.stringify(userData));
    navigate('/dashboard');
  }, [navigate]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('clinicalscribe_user');
    navigate('/');
  }, [navigate]);

  const navigateTo = useCallback((page: Page) => {
    navigate(pageToRoute[page] || '/');
  }, [navigate]);

  const handleNoteCreated = useCallback((note: Note) => {
    setCurrentNote(note);
    if (recordingForPatient) {
      setCurrentPatient(recordingForPatient);
      setRecordingForPatient(null);
      navigate('/patient');
    } else {
      navigate('/note');
    }
  }, [recordingForPatient, navigate]);

  const handlePatientSelect = useCallback((patient: Patient) => {
    setCurrentPatient(patient);
    navigate('/patient');
  }, [navigate]);

  const handleStartRecordingForPatient = useCallback((patient: Patient) => {
    setRecordingForPatient(patient);
    navigate('/patient-recording');
  }, [navigate]);

  const handlePatientAdded = useCallback((patient: Patient) => {
    setCurrentPatient(patient);
    navigate('/patient');
  }, [navigate]);

  return (
    <AppContext.Provider value={{
      user,
      currentNote,
      currentPatient,
      recordingForPatient,
      login,
      logout,
      navigateTo,
      setCurrentNote,
      setCurrentPatient,
      setRecordingForPatient,
      handleNoteCreated,
      handlePatientSelect,
      handleStartRecordingForPatient,
      handlePatientAdded,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
