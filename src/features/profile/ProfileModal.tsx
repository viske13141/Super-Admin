import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { usePlatformStore } from '../../services/platformStore';
import { FormModal } from '../../components/common/FormModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProfileModalTab } from '../../components/navigation/TopNavbar';
import { formatDateTime } from '../../utils/format';

interface ProfileModalProps {
  activeTab: ProfileModalTab;
  onChangeTab: (tab: ProfileModalTab) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  activeTab,
  onChangeTab,
  onClose,
}) => {
  const { platformUsers, pushToast, recordAudit } = usePlatformStore();
  const superAdmin = platformUsers[0];

  const [displayName, setDisplayName] = useState(superAdmin?.fullName ?? 'Vikramaditya Menon');
  const [phone, setPhone] = useState(superAdmin?.phone ?? '+91 98450 10001');
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });

  if (!activeTab) return null;

  const tabs: { id: Exclude<ProfileModalTab, null>; label: string }[] = [
    { id: 'profile', label: 'My Profile' },
    { id: 'account', label: 'Account Settings' },
    { id: 'security', label: 'Security Settings' },
    { id: 'password', label: 'Change Password' },
    { id: 'sessions', label: 'Session History' },
  ];

  const saveAccount = () => {
    recordAudit({
      action: 'Updated Super Admin Account Settings',
      eventType: 'Edit',
      module: 'Platform Users',
      resource: superAdmin?.email ?? 'superadmin@payfuse.io',
      details: `Updated profile details for ${displayName}.`,
    });
    pushToast({ type: 'success', title: 'Profile updated', message: 'Super Admin preferences saved.' });
    onClose();
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.next.length < 8 || pwdForm.next !== pwdForm.confirm) {
      pushToast({ type: 'error', title: 'Validation failed', message: 'New passwords must match and be at least 8 characters.' });
      return;
    }
    recordAudit({
      action: 'Changed Super Admin Password',
      eventType: 'Security Event',
      module: 'Audit & Security',
      resource: superAdmin?.email ?? 'superadmin@payfuse.io',
      details: 'Password rotated via Account Security dialog.',
    });
    pushToast({ type: 'success', title: 'Password updated', message: 'Credentials rotated in demo store.' });
    setPwdForm({ current: '', next: '', confirm: '' });
    onClose();
  };

  return (
    <FormModal
      open={Boolean(activeTab)}
      title="Super Admin Account & Security"
      subtitle="Vikramaditya Menon · Platform Owner"
      onClose={onClose}
      maxWidthClass="max-w-2xl"
    >
      <div className="flex flex-wrap gap-1.5 border-b border-[#E8EBF4] pb-3 mb-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChangeTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === t.id
                ? 'bg-[#EFEAFF] text-[#5B3CE6]'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#7050F5] text-white text-lg font-bold flex items-center justify-center">
              SA
            </div>
            <div>
              <h4 className="text-base font-semibold text-[#0F172A]">{superAdmin?.fullName}</h4>
              <p className="text-xs text-[#64748B]">{superAdmin?.email} · {superAdmin?.designation}</p>
              <div className="mt-1.5"><StatusBadge status={superAdmin?.status || 'Active'} /></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
            <div>
              <span className="text-xs text-[#64748B]">Department</span>
              <p className="font-medium text-[#0F172A]">{superAdmin?.department}</p>
            </div>
            <div>
              <span className="text-xs text-[#64748B]">Assigned Role</span>
              <p className="font-medium text-[#0F172A]">{superAdmin?.roleName}</p>
            </div>
            <div>
              <span className="text-xs text-[#64748B]">Phone</span>
              <p className="font-medium text-[#0F172A] tabular-nums">{superAdmin?.phone}</p>
            </div>
            <div>
              <span className="text-xs text-[#64748B]">Last Login</span>
              <p className="font-medium text-[#0F172A] tabular-nums">{formatDateTime(superAdmin?.lastLogin || '')}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={saveAccount}
              className="px-4 py-2 rounded-lg bg-[#7050F5] hover:bg-[#5E3DE6] text-white text-sm font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E8EBF4] flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Hardware / TOTP Multi-Factor Authentication</p>
                <p className="text-xs text-[#64748B] mt-0.5">Enforced on every privileged action and console sign-in.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={mfaEnforced}
              onChange={(e) => setMfaEnforced(e.target.checked)}
              className="w-4 h-4 rounded text-[#7050F5]"
            />
          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Current Password</label>
            <input
              type="password"
              required
              value={pwdForm.current}
              onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
              className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">New Password (min 8 chars)</label>
            <input
              type="password"
              required
              value={pwdForm.next}
              onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })}
              className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={pwdForm.confirm}
              onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
              className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#7050F5] hover:bg-[#5E3DE6] text-white text-sm font-medium"
            >
              Update Password
            </button>
          </div>
        </form>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-2.5">
          {(superAdmin?.sessions || []).map((s) => (
            <div key={s.id} className="p-3 rounded-xl border border-[#E8EBF4] flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-[#0F172A]">{s.device}</p>
                <p className="text-[#64748B] mt-0.5 tabular-nums">{s.location} · IP {s.ipAddress}</p>
              </div>
              <span className="font-medium text-emerald-700">{s.current ? 'Current Session' : s.lastActive}</span>
            </div>
          ))}
        </div>
      )}
    </FormModal>
  );
};
