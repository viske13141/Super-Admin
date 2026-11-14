import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Building2,
  CheckCheck,
  ChevronDown,
  CreditCard,
  FileText,
  Headphones,
  HelpCircle,
  History,
  KeyRound,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { formatINR } from '../../utils/format';

export type ProfileModalTab =
  | 'profile'
  | 'account'
  | 'security'
  | 'password'
  | 'sessions'
  | null;

interface TopNavbarProps {
  onOpenMobileNav: () => void;
  onOpenProfileTab: (tab: ProfileModalTab) => void;
}

const ROUTE_TITLES: { prefix: string; title: string }[] = [
  { prefix: '/companies', title: 'Companies' },
  { prefix: '/subscriptions', title: 'Subscriptions' },
  { prefix: '/billing', title: 'Plans & Billing' },
  { prefix: '/platform-users', title: 'Platform Users' },
  { prefix: '/access-roles', title: 'Access & Roles' },
  { prefix: '/usage-health', title: 'Usage & Health' },
  { prefix: '/service-logs', title: 'Service Logs' },
  { prefix: '/integrations', title: 'Integrations' },
  { prefix: '/data-settings', title: 'Data & Settings' },
  { prefix: '/audit-security', title: 'Audit & Security' },
  { prefix: '/support-tickets', title: 'Support & Tickets' },
  { prefix: '/announcements', title: 'Announcements' },
  { prefix: '/help-docs', title: 'Help & Docs' },
];

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenMobileNav,
  onOpenProfileTab,
}) => {
  const {
    companies,
    platformUsers,
    subscriptions,
    invoices,
    supportTickets,
    servicesHealth,
    auditEvents,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    pushToast,
  } = usePlatformStore();

  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const [signOutConfirm, setSignOutConfirm] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
      if (gridRef.current && !gridRef.current.contains(target)) setGridOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const currentConsoleTitle = useMemo(() => {
    if (location.pathname === '/') return 'Super Admin Console';
    const match = ROUTE_TITLES.find((r) => location.pathname.startsWith(r.prefix));
    return match ? match.title : 'Super Admin Console';
  }, [location.pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const items: { id: string; group: string; label: string; sub: string; route: string }[] = [];

    companies
      .filter((c) => c.displayName.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((c) =>
        items.push({ id: c.id, group: 'Companies', label: c.displayName, sub: `${c.id} · ${c.industry}`, route: `/companies/${c.id}` })
      );

    platformUsers
      .filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.roleName.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((u) =>
        items.push({ id: u.id, group: 'Platform Users', label: u.fullName, sub: `${u.roleName} · ${u.email}`, route: `/platform-users/${u.id}` })
      );

    subscriptions
      .filter((s) => s.id.toLowerCase().includes(q) || s.companyName.toLowerCase().includes(q) || s.planName.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((s) =>
        items.push({ id: s.id, group: 'Subscriptions', label: `${s.id} · ${s.companyName}`, sub: `${s.planName} (${s.status})`, route: `/subscriptions/${s.id}` })
      );

    invoices
      .filter((i) => i.invoiceNumber.toLowerCase().includes(q) || i.companyName.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((i) =>
        items.push({ id: i.id, group: 'Invoices', label: i.invoiceNumber, sub: `${i.companyName} · ${formatINR(i.total)}`, route: `/billing?tab=invoices` })
      );

    supportTickets
      .filter((t) => t.ticketId.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.companyName.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((t) =>
        items.push({ id: t.id, group: 'Support Tickets', label: `${t.ticketId}: ${t.subject}`, sub: `${t.companyName} · ${t.priority}`, route: `/support-tickets/${t.id}` })
      );

    servicesHealth
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((s) =>
        items.push({ id: s.id, group: 'Services', label: s.name, sub: `${s.status} · ${s.responseTimeMs}ms`, route: `/usage-health/${s.id}` })
      );

    auditEvents
      .filter((a) => a.eventId.toLowerCase().includes(q) || a.action.toLowerCase().includes(q) || a.resource.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((a) =>
        items.push({ id: a.id, group: 'Audit Events', label: `${a.eventId} · ${a.action}`, sub: a.resource, route: `/audit-security` })
      );

    return items;
  }, [query, companies, platformUsers, subscriptions, invoices, supportTickets, servicesHealth, auditEvents]);

  return (
    <header className="sticky top-0 z-20 h-[60px] bg-white border-b border-[#E8EBF4] px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu + App Grid + Console Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div ref={gridRef} className="relative">
          <button
            type="button"
            onClick={() => setGridOpen((g) => !g)}
            aria-label="Quick module launcher"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {gridOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-3 z-40">
              <p className="text-xs font-semibold text-[#64748B] px-1 mb-2">Quick Module Switcher</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Companies', route: '/companies', icon: <Building2 className="w-4 h-4 text-[#7050F5]" /> },
                  { label: 'Subscriptions', route: '/subscriptions', icon: <CreditCard className="w-4 h-4 text-[#478BFA]" /> },
                  { label: 'Plans & Billing', route: '/billing', icon: <FileText className="w-4 h-4 text-emerald-600" /> },
                  { label: 'Platform Users', route: '/platform-users', icon: <Users className="w-4 h-4 text-indigo-600" /> },
                  { label: 'Usage & Health', route: '/usage-health', icon: <Server className="w-4 h-4 text-amber-600" /> },
                  { label: 'Audit & Security', route: '/audit-security', icon: <ShieldAlert className="w-4 h-4 text-rose-600" /> },
                ].map((m) => (
                  <button
                    key={m.route}
                    type="button"
                    onClick={() => {
                      setGridOpen(false);
                      navigate(m.route);
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 text-xs font-medium text-[#0F172A] text-left"
                  >
                    {m.icon}
                    <span className="truncate">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <span className="text-[15px] font-semibold text-[#0F172A] truncate">
          {currentConsoleTitle}
        </span>
      </div>

      {/* Center: Global Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setSearchOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchOpen(true);
          }}
          placeholder="Search companies, users, tickets, services..."
          aria-label="Global platform search"
          className="w-full h-9 pl-10 pr-8 bg-[#F4F6FA] border border-[#E8EBF4] rounded-xl text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7050F5]/30 focus:border-[#7050F5] transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear global search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {searchOpen && query.trim() !== '' && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden z-40 max-h-[65vh] overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#64748B]">
                No matches found for &ldquo;{query}&rdquo;.
              </div>
            ) : (
              <div className="divide-y divide-[#F1F3F9]">
                {searchResults.map((item) => (
                  <button
                    key={`${item.group}-${item.id}`}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery('');
                      navigate(item.route);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-[#F9FAFD] flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{item.label}</p>
                      <p className="text-xs text-[#64748B] truncate">{item.sub}</p>
                    </div>
                    <span className="text-[11px] font-medium text-[#7050F5] whitespace-nowrap shrink-0">
                      {item.group}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Notifications, Help, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            aria-label={`Notifications (${unreadCount} unread)`}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden z-40">
              <div className="px-4 py-3 border-b border-[#E8EBF4] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">Notification Centre</h3>
                  <p className="text-xs text-[#64748B] tabular-nums">{unreadCount} unread alerts</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#7050F5] hover:underline"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F3F9]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#64748B]">All caught up!</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 flex items-start gap-3 transition-colors ${
                        n.read ? 'bg-white' : 'bg-[#F8F6FF]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          markNotificationRead(n.id);
                          setNotifOpen(false);
                          navigate(n.targetRoute);
                        }}
                        className="flex-1 text-left min-w-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-[#7050F5]">{n.type}</span>
                          <span className="text-[11px] text-[#94A3B8]">{n.timestamp}</span>
                        </div>
                        <p className="text-xs font-semibold text-[#0F172A] mt-0.5 truncate">{n.title}</p>
                        <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2">{n.message}</p>
                      </button>
                      <button
                        type="button"
                        aria-label="Delete notification"
                        onClick={() => deleteNotification(n.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#E8EBF4] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(false);
                    navigate('/audit-security');
                  }}
                  className="font-medium text-[#7050F5] hover:underline"
                >
                  View Security & Audit Events
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(false);
                    navigate('/announcements');
                  }}
                  className="font-medium text-[#64748B] hover:text-[#0F172A]"
                >
                  Announcements
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Button */}
        <button
          type="button"
          onClick={() => navigate('/help-docs')}
          aria-label="Open Help and Documentation"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
        >
          <HelpCircle className="w-[18px] h-[18px]" />
        </button>

        {/* Super Admin Profile Dropdown */}
        <div ref={profileRef} className="relative pl-1">
          <button
            type="button"
            onClick={() => setProfileOpen((p) => !p)}
            aria-expanded={profileOpen}
            className="flex items-center gap-2.5 p-1 pr-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-[#7050F5] text-white text-xs font-bold flex items-center justify-center shrink-0">
              SA
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-[13px] font-semibold text-[#0F172A]">Super Admin</div>
              <div className="text-[11px] text-[#64748B]">Platform Owner</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl py-1.5 z-40">
              <div className="px-4 py-2.5 border-b border-[#E8EBF4]">
                <p className="text-xs font-semibold text-[#0F172A]">Vikramaditya Menon</p>
                <p className="text-[11px] text-[#64748B]">superadmin@payfuse.io</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onOpenProfileTab('profile');
                }}
                className="w-full px-4 py-2 text-left text-[13px] text-[#0F172A] hover:bg-slate-50 flex items-center gap-2.5"
              >
                <User className="w-4 h-4 text-[#64748B]" />
                <span>My Profile</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onOpenProfileTab('account');
                }}
                className="w-full px-4 py-2 text-left text-[13px] text-[#0F172A] hover:bg-slate-50 flex items-center gap-2.5"
              >
                <Settings className="w-4 h-4 text-[#64748B]" />
                <span>Account Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onOpenProfileTab('security');
                }}
                className="w-full px-4 py-2 text-left text-[13px] text-[#0F172A] hover:bg-slate-50 flex items-center gap-2.5"
              >
                <Shield className="w-4 h-4 text-[#64748B]" />
                <span>Security Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onOpenProfileTab('password');
                }}
                className="w-full px-4 py-2 text-left text-[13px] text-[#0F172A] hover:bg-slate-50 flex items-center gap-2.5"
              >
                <KeyRound className="w-4 h-4 text-[#64748B]" />
                <span>Change Password</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onOpenProfileTab('sessions');
                }}
                className="w-full px-4 py-2 text-left text-[13px] text-[#0F172A] hover:bg-slate-50 flex items-center gap-2.5"
              >
                <History className="w-4 h-4 text-[#64748B]" />
                <span>Session History</span>
              </button>
              <div className="my-1 border-t border-[#E8EBF4]" />
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  setSignOutConfirm(true);
                }}
                className="w-full px-4 py-2 text-left text-[13px] text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sign out dialog */}
      {signOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-sm w-full p-5">
            <h3 className="text-base font-semibold text-[#0F172A]">Sign Out of Super Admin Console?</h3>
            <p className="text-xs text-[#64748B] mt-1.5">
              This will end your current Super Admin console session and log an audit logout event.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSignOutConfirm(false)}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[#E2E8F0] text-[#0F172A]"
              >
                Stay Signed In
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignOutConfirm(false);
                  pushToast({
                    type: 'info',
                    title: 'Session lock simulated',
                    message: 'Demo console remains active; logout event recorded in Audit & Security.',
                  });
                }}
                className="px-3.5 py-2 text-xs font-medium rounded-lg bg-rose-600 text-white hover:bg-rose-700"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
