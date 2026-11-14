import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { AppSidebar } from '../../components/navigation/AppSidebar';
import { ProfileModalTab, TopNavbar } from '../../components/navigation/TopNavbar';
import { ToastNotifications } from '../../components/common/ToastNotifications';
import { ProfileModal } from '../../features/profile/ProfileModal';

export const AppShell: React.FC = () => {
  const { sidebarCollapsed } = usePlatformStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<ProfileModalTab>(null);

  return (
    <div className="min-h-screen bg-[#F7F7FC] text-[#0F172A]">
      <AppSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div
        className={`flex flex-col min-h-screen transition-all duration-200 ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[240px]'
        }`}
      >
        <TopNavbar
          onOpenMobileNav={() => setMobileOpen(true)}
          onOpenProfileTab={(tab) => setProfileTab(tab)}
        />

        <main className="flex-1 p-4 sm:p-5 lg:p-6 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ProfileModal
        activeTab={profileTab}
        onChangeTab={(tab) => setProfileTab(tab)}
        onClose={() => setProfileTab(null)}
      />
      <ToastNotifications />
    </div>
  );
};
