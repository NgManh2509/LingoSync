import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import OnboardingModal from '../common/OnboardingModal';

const AppLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const showOnboarding = !loading && isAuthenticated && user && !user.targetLanguage;

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#25231F] flex font-['Plus_Jakarta_Sans',sans-serif]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <main className="flex-1 p-6 sm:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <OnboardingModal isOpen={showOnboarding} />
    </div>
  );
};

export default AppLayout;
