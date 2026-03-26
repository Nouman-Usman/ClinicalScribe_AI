import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useApp } from './AppContext';

import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import RecordingPage from '@/pages/RecordingPage';
import NotePage from '@/pages/NotePage';
import PastNotesPage from '@/pages/PastNotesPage';
import SettingsPage from '@/pages/SettingsPage';
import ChatPage from '@/pages/ChatPage';
import PatientsPage from '@/pages/PatientsPage';
import PatientDetailPage from '@/pages/PatientDetailPage';
import ImageAnalysisPage from '@/pages/ImageAnalysisPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function AppRouter() {
  const location = useLocation();
  const {
    user,
    currentNote,
    currentPatient,
    recordingForPatient,
    login,
    logout,
    navigateTo,
    setCurrentNote,
    setCurrentPatient,
    handleNoteCreated,
    handlePatientSelect,
    handleStartRecordingForPatient,
    handlePatientAdded,
  } = useApp();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <LandingPage onNavigate={(page) => navigateTo((page || 'auth') as any)} />
        } />

        <Route path="/auth" element={
          <AuthPage onLogin={login} onBack={() => navigateTo('landing')} />
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard
              user={user!}
              onNavigate={navigateTo}
              onLogout={logout}
              onNoteSelect={(note) => {
                setCurrentNote(note);
                navigateTo('note');
              }}
            />
          </ProtectedRoute>
        } />

        <Route path="/recording" element={
          <ProtectedRoute>
            <RecordingPage
              user={user!}
              onNavigate={navigateTo}
              onLogout={logout}
              onNoteCreated={handleNoteCreated}
            />
          </ProtectedRoute>
        } />

        <Route path="/note" element={
          <ProtectedRoute>
            {currentNote ? (
              <NotePage
                user={user!}
                note={currentNote}
                onNavigate={navigateTo}
                onLogout={logout}
                onNoteDeleted={() => setCurrentNote(null)}
              />
            ) : (
              <Navigate to="/dashboard" replace />
            )}
          </ProtectedRoute>
        } />

        <Route path="/past-notes" element={
          <ProtectedRoute>
            <PastNotesPage
              user={user!}
              onNavigate={navigateTo}
              onLogout={logout}
              onNoteSelect={(note) => {
                setCurrentNote(note);
                navigateTo('note');
              }}
            />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage user={user!} onNavigate={navigateTo} onLogout={logout} />
          </ProtectedRoute>
        } />

        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatPage user={user!} onNavigate={navigateTo} onLogout={logout} />
          </ProtectedRoute>
        } />

        <Route path="/patients" element={
          <ProtectedRoute>
            <PatientsPage
              user={user!}
              onNavigate={navigateTo}
              onViewPatient={handlePatientSelect}
              onStartRecording={handleStartRecordingForPatient}
              onPatientAdded={handlePatientAdded}
              onLogout={logout}
            />
          </ProtectedRoute>
        } />

        <Route path="/patient" element={
          <ProtectedRoute>
            {currentPatient ? (
              <PatientDetailPage
                user={user!}
                patient={currentPatient}
                onNavigate={navigateTo}
                onStartRecording={handleStartRecordingForPatient}
                onViewNote={(note) => {
                  setCurrentNote(note);
                  navigateTo('note');
                }}
                onPatientUpdated={(p) => setCurrentPatient(p)}
                onLogout={logout}
              />
            ) : (
              <Navigate to="/patients" replace />
            )}
          </ProtectedRoute>
        } />

        <Route path="/patient-recording" element={
          <ProtectedRoute>
            {recordingForPatient ? (
              <RecordingPage
                user={user!}
                patient={recordingForPatient}
                onNavigate={navigateTo}
                onLogout={logout}
                onNoteCreated={handleNoteCreated}
              />
            ) : (
              <Navigate to="/patients" replace />
            )}
          </ProtectedRoute>
        } />

        <Route path="/image-analysis" element={
          <ProtectedRoute>
            <ImageAnalysisPage user={user!} onNavigate={navigateTo} onLogout={logout} />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
