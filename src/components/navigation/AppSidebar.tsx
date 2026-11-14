import React, { useState } from 'react';
import {
  Activity,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileText,
  Headphones,
  Home,
  Layers,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Plug,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';

interface AppSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { sidebarCollapsed, setSidebarCollapsed, dashboardMetrics } = usePlatformStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Platform: true,
    Operations: true,
    Support: true,
  });
  const [companiesSubOpen, setCompaniesSubOpen] = useState(false);

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const navItemClass = (isActive: boolean) =>
    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 ${
      isActive
        ? 'sidebar-active-gradient text-white'
        : 'text-[#CBD5E1] hover:text-white hover:bg-white/[0.06]'
    } ${sidebarCollapsed ? 'justify-center px-2' : ''}`;

  const renderTooltip = (label: string) =>
    sidebarCollapsed ? (
      <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 shadow-lg border border-white/10 z-50 transition-opacity">
        {label}
      </span>
    ) : null;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B1230] text-white select-none">
      {/* Brand Lockup */}
      <div className={`h-[60px] px-4 flex items-center justify-between border-b border-white/[0.08] shrink-0 ${sidebarCollapsed ? 'justify-center px-2' : ''}`}>
        <button
          type="button"
          onClick={() => {
            navigate('/');
            onCloseMobile();
          }}
          className="flex items-center gap-2.5 text-left focus-visible:outline-none"
        >
          {/* Custom PayFuse 3D Cube Mark matching reference */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
            aria-hidden="true"
          >
            <path d="M18 3L31 10.5V25.5L18 33L5 25.5V10.5L18 3Z" fill="#5D3DF0" />
            <path d="M18 3L31 10.5L18 18L5 10.5L18 3Z" fill="#9A84FF" />
            <path d="M18 18L31 10.5V25.5L18 33V18Z" fill="#4C2EE0" />
            <path d="M18 18L5 10.5V25.5L18 33V18Z" fill="#7050F5" />
            <path d="M13 15L18 12L23 15V21L18 24L13 21V15Z" fill="#FFFFFF" fillOpacity="0.92" />
          </svg>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <div className="text-[16px] font-bold tracking-tight text-white leading-tight">
                PayFuse
              </div>
              <div className="text-[11px] text-[#94A3B8] leading-tight truncate">
                Payroll & Workforce SaaS
              </div>
            </div>
          )}
        </button>

        {/* Close on mobile */}
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Super Admin Navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* 1. Dashboard */}
        <div>
          <NavLink
            to="/"
            end
            onClick={onCloseMobile}
            className={({ isActive }) => navItemClass(isActive)}
          >
            <Home className="w-[18px] h-[18px] shrink-0" />
            {!sidebarCollapsed && <span className="truncate">Dashboard</span>}
            {renderTooltip('Platform Overview')}
          </NavLink>
        </div>

        {/* 2. Platform */}
        <div>
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={() => toggleGroup('Platform')}
              className="w-full px-3 mb-1.5 flex items-center justify-between text-[11px] font-semibold text-[#64748B] hover:text-slate-300 tracking-wide transition-colors"
            >
              <span>Platform</span>
              {openGroups.Platform ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          {(openGroups.Platform || sidebarCollapsed) && (
            <div className="space-y-0.5">
              {/* Companies with submenu indicator */}
              <div>
                <div className="flex items-center">
                  <NavLink
                    to="/companies"
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `${navItemClass(isActive || location.pathname.startsWith('/companies'))} flex-1`
                    }
                  >
                    <Building2 className="w-[18px] h-[18px] shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 truncate">Companies</span>
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label="Toggle companies submenu"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCompaniesSubOpen((s) => !s);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              setCompaniesSubOpen((s) => !s);
                            }
                          }}
                          className="p-0.5 rounded hover:bg-white/10"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${
                              companiesSubOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </span>
                      </>
                    )}
                    {renderTooltip('Companies')}
                  </NavLink>
                </div>
                {!sidebarCollapsed && companiesSubOpen && (
                  <div className="ml-8 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/companies');
                        onCloseMobile();
                      }}
                      className="w-full text-left py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      All Registered Companies
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/companies?status=Pending+Verification');
                        onCloseMobile();
                      }}
                      className="w-full text-left py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      Verification Queue
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/companies/new');
                        onCloseMobile();
                      }}
                      className="w-full text-left py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      Add New Company
                    </button>
                  </div>
                )}
              </div>

              <NavLink
                to="/subscriptions"
                onClick={onCloseMobile}
                className={({ isActive }) => navItemClass(isActive)}
              >
                <Layers className="w-[18px] h-[18px] shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Subscriptions</span>}
                {renderTooltip('Subscriptions')}
              </NavLink>

              <NavLink
                to="/billing"
                onClick={onCloseMobile}
                className={({ isActive }) => navItemClass(isActive)}
              >
                <CreditCard className="w-[18px] h-[18px] shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Plans & Billing</span>}
                {renderTooltip('Plans & Billing')}
              </NavLink>

              <NavLink
                to="/platform-users"
                onClick={onCloseMobile}
                className={({ isActive }) => navItemClass(isActive)}
              >
                <Users className="w-[18px] h-[18px] shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Platform Users</span>}
                {renderTooltip('Platform Users')}
              </NavLink>

              <NavLink
                to="/access-roles"
                onClick={onCloseMobile}
                className={({ isActive }) => navItemClass(isActive)}
              >
                <ShieldCheck className="w-[18px] h-[18px] shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Access & Roles</span>}
                {renderTooltip('Access & Roles')}
              </NavLink>
            </div>
          )}
        </div>

        {/* 3. Operations */}
        <div>
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={() => toggleGroup('Operations')}
              className="w-full px-3 mb-1.5 flex items-center justify-between text-[11px] font-semibold text-[#64748B] hover:text-slate-300 tracking-wide transition-colors"
            >
              <span>Operations</span>
              {openGroups.Operations ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          {(openGroups.Operations || sidebarCollapsed) && (
            <div className="space-y-0.5">
              <NavLink
                to="/usage-health"
                onClick={onCloseMobile}
                className={({ isActive }) => navItemClass(isActive)}
              >
                <Activity className="w-[18px] h-[18px] shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Usage & Health</span>}
                {renderTooltip('Usage & Health')}
              </NavLink>

              <NavLink
                to="/service-logs"
                onClick={onCloseMobile}
                className={({ isActive }) => navItemClass(isActive)}
              >
                <FileText className="w-[18px] h-[18px] shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Service Logs</span>}
                {renderTooltip('Service Logs')}
              </NavLink>

              <NavLink
                to="/integrations"
                onClick={onCloseMobile}
                className={({ isActive }) => navItemClass(isActive)}
              >
                <Plug className="w-[18px] h-[18px] shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Integrations</span>}
                {renderTooltip('Integrations')}
              </NavLink>

              <NavLink
                to="/data-settings"
                onClick={onCloseMobile}
                className={({ isActive }) => navItemClass(isActive)}
              >
                <Settings className="w-[18px] h-[18px] shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Data & Settings</span>}
                {renderTooltip('Data & Settings')}
              </NavLink>

              <NavLink
                to="/audit-security"
                onClick={onCloseMobile}
                className={({ isActive }) => navItemClass(isActive)}
              >
                <ShieldAlert className="w-[18px] h-[18px] shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Audit & Security</span>}
                {renderTooltip('Audit & Security')}
              </NavLink>
            </div>
          )}
        </div>

        {/* 4. Support */}
        <div>
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={() => toggleGroup('Support')}
              className="w-full px-3 mb-1.5 flex items-center justify-between text-[11px] font-semibold text-[#64748B] hover:text-slate-300 tracking-wide transition-colors"
            >
              <span>Support</span>
              {openGroups.Support ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          {(openGroups.Support || sidebarCollapsed) && (
            <div className="space-y-0.5">
              <NavLink
                to="/support-tickets"
                onClick={onCloseMobile}
                className={({ isActive }) => navItemClass(isActive)}
              >
                <Headphones className="w-[18px] h-[18px] shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 truncate">Support & Tickets</span>
                    {dashboardMetrics.openTickets > 0 && (
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-[#5F41E5] text-white tabular-nums">
                        {dashboardMetrics.openTickets}
                      </span>
                    )}
                  </>
                )}
                {renderTooltip(`Support & Tickets (${dashboardMetrics.openTickets})`)}
              </NavLink>

              <NavLink
                to="/announcements"
                onClick={onCloseMobile}
                className={({ isActive }) => navItemClass(isActive)}
              >
                <Megaphone className="w-[18px] h-[18px] shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Announcements</span>}
                {renderTooltip('Announcements')}
              </NavLink>

              <NavLink
                to="/help-docs"
                onClick={onCloseMobile}
                className={({ isActive }) => navItemClass(isActive)}
              >
                <BookOpen className="w-[18px] h-[18px] shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Help & Docs</span>}
                {renderTooltip('Help & Docs')}
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* Collapse Toggle Footer (Desktop) */}
      <div className="hidden lg:flex items-center justify-between px-3 py-3 border-t border-white/[0.08]">
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors ${
            sidebarCollapsed ? 'justify-center px-0' : ''
          }`}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" />
              <span>Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-200 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile & Tablet drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/50" onClick={onCloseMobile} />
          <aside className="relative w-[260px] max-w-[85vw] h-full z-10 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
