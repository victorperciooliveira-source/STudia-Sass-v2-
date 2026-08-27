import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import SupabaseConfigModal from './components/SupabaseConfigModal';
import SaasLandingPage from './components/SaasLandingPage';
import PortalScreen from './components/PortalScreen';
import StudiaLogo from './components/StudiaLogo';
import AuthModal from './components/AuthModal';
import ScrollProgress from './components/ScrollProgress';

function AppContent() {
  const { user, profile, loading, isAdmin, isTeacher } = useAuth();
  
  // Navigation between SaaS landing page and the Portal Login screen
  const [currentView, setCurrentView] = useState<'saas' | 'portal'>('saas');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="relative flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <StudiaLogo width={180} height={50} />
          <p className="text-slate-400 font-bold uppercase tracking-wider text-xs animate-pulse">
            Carregando ambiente Studia...
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the respective dashboard
  if (user && profile) {
    return (
      <>
        <ScrollProgress />
        {isAdmin ? <AdminDashboard /> : <TeacherDashboard />}
      </>
    );
  }

  return (
    <>
      <ScrollProgress />
      {/* View 1: SaaS Presentation & Online Payments */}
      {currentView === 'saas' && (
        <SaasLandingPage 
          onGoToPortal={() => setCurrentView('portal')}
          onOpenAuth={openAuth}
          onOpenSupabaseConfig={() => setIsConfigOpen(true)}
        />
      )}

      {/* View 2: The Portal Screen */}
      {currentView === 'portal' && (
        <PortalScreen 
          onBackToSaas={() => setCurrentView('saas')}
          onOpenAuth={openAuth}
          onOpenSupabaseConfig={() => setIsConfigOpen(true)}
        />
      )}

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onOpenSupabaseConfig={() => setIsConfigOpen(true)}
      />

      {/* Supabase Config Modal */}
      <SupabaseConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
