import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Pencil,
  Plus,
  ShieldAlert,
  Unlock,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { PlatformUser } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { KPIStatCard } from '../../components/common/KPIStatCard';
import { ColumnDef, DataTable } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ActionMenu } from '../../components/common/ActionMenu';
import { FormModal } from '../../components/common/FormModal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { formatDate, formatDateTime } from '../../utils/format';

export const PlatformUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    platformUsers,
    roles,
    savePlatformUser,
    toggleUserLock,
    toggleUserActive,
    revokeUserSessions,
    recordAudit,
    pushToast,
  } = usePlatformStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userModal, setUserModal] = useState<PlatformUser | null>(null);
  const [privConfirm, setPrivConfirm] = useState<{
    user: PlatformUser;
    action: 'lock' | 'unlock' | 'activate' | 'deactivate' | 'revoke' | 'reset_pwd';
  } | null>(null);

  const kpis = useMemo(
    () => ({
      total: platformUsers.length,
      active: platformUsers.filter((u) => u.status === 'Active').length,
      inactive: platformUsers.filter((u) => u.status === 'Inactive').length,
      pending: platformUsers.filter((u) => u.status === 'Pending Invitation').length,
      locked: platformUsers.filter((u) => u.status === 'Locked').length,
    }),
    [platformUsers]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return platformUsers.filter((u) => {
      if (
        q &&
        !u.fullName.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q) &&
        !u.department.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (statusFilter && u.status !== statusFilter) return false;
      if (roleFilter && u.roleName !== roleFilter) return false;
      return true;
    });
  }, [platformUsers, search, statusFilter, roleFilter]);

  const columns: ColumnDef<PlatformUser>[] = [
    {
      key: 'avatar',
      header: 'Profile',
      render: (u) => (
        <div
          className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center"
          style={{ backgroundColor: u.avatarColor }}
        >
          {u.avatarInitials}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      sortValue: (u) => u.fullName,
      render: (u) => (
        <div>
          <p className="font-semibold text-[#0F172A]">{u.fullName}</p>
          <p className="text-xs text-[#64748B]">{u.designation}</p>
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: (u) => <span className="text-xs text-[#0F172A]">{u.email}</span> },
    { key: 'phone', header: 'Phone', render: (u) => <span className="text-xs tabular-nums text-[#64748B]">{u.phone}</span> },
    { key: 'role', header: 'Role', sortable: true, sortValue: (u) => u.roleName, render: (u) => <span className="font-medium text-[#5B3CE6] text-xs">{u.roleName}</span> },
    { key: 'dept', header: 'Department', render: (u) => <span className="text-xs text-[#64748B]">{u.department}</span> },
    { key: 'lastLogin', header: 'Last Login', render: (u) => <span className="text-xs tabular-nums text-[#64748B]">{u.lastLogin === 'Never' ? 'Never' : formatDateTime(u.lastLogin)}</span> },
    { key: 'status', header: 'Account Status', render: (u) => <StatusBadge status={u.status} /> },
    { key: 'created', header: 'Created', render: (u) => <span className="text-xs tabular-nums text-[#64748B]">{formatDate(u.createdDate)}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <ActionMenu
          items={[
            { label: 'View Profile', icon: <Eye className="w-4 h-4" />, onClick: () => navigate(`/platform-users/${u.id}`) },
            { label: 'Edit User', icon: <Pencil className="w-4 h-4" />, onClick: () => setUserModal(u) },
            ...(u.status === 'Pending Invitation'
              ? [
                  {
                    label: 'Resend Invitation',
                    icon: <Mail className="w-4 h-4 text-[#7050F5]" />,
                    onClick: () => pushToast({ type: 'info', title: 'Invitation resent', message: `Email invite queued for ${u.email}.` }),
                  },
                ]
              : []),
            u.status === 'Locked'
              ? { label: 'Unlock Account', icon: <Unlock className="w-4 h-4 text-emerald-600" />, onClick: () => setPrivConfirm({ user: u, action: 'unlock' }) }
              : { label: 'Lock Account', icon: <Lock className="w-4 h-4 text-amber-600" />, onClick: () => setPrivConfirm({ user: u, action: 'lock' }) },
            u.status === 'Inactive'
              ? { label: 'Activate User', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, onClick: () => setPrivConfirm({ user: u, action: 'activate' }) }
              : { label: 'Deactivate User', icon: <UserX className="w-4 h-4 text-rose-600" />, danger: true, onClick: () => setPrivConfirm({ user: u, action: 'deactivate' }) },
            { label: 'Reset Password', icon: <KeyRound className="w-4 h-4" />, onClick: () => setPrivConfirm({ user: u, action: 'reset_pwd' }) },
            { label: 'Revoke Sessions', icon: <LogOut className="w-4 h-4" />, onClick: () => setPrivConfirm({ user: u, action: 'revoke' }) },
          ]}
        />
      ),
    },
  ];

  const openNewUser = () => {
    setUserModal({
      id: `USR-${101 + platformUsers.length}`,
      fullName: '',
      email: '',
      phone: '',
      avatarInitials: 'PU',
      avatarColor: '#7050F5',
      department: 'Platform Ops',
      designation: '',
      roleId: 'ROL-2',
      roleName: 'Platform Administrator',
      status: 'Pending Invitation',
      mfaEnabled: true,
      lastLogin: 'Never',
      createdDate: new Date().toISOString().slice(0, 10),
      sessions: [],
      loginHistory: [],
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Platform Users"
        subtitle="Manage PayFuse internal administrators, support agents, billing controllers, and security auditors."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Platform Users' }]}
        actions={
          <button
            type="button"
            onClick={openNewUser}
            className="h-9 px-4 bg-[#7050F5] hover:bg-[#5E3DE6] text-white rounded-lg text-sm font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPIStatCard label="Total Platform Users" value={kpis.total} icon={<Users className="w-5 h-5 text-[#7050F5]" />} iconBgClass="bg-[#EFEAFF]" onClick={() => setStatusFilter('')} />
        <KPIStatCard label="Active Users" value={kpis.active} icon={<UserCheck className="w-5 h-5 text-emerald-600" />} iconBgClass="bg-emerald-50" onClick={() => setStatusFilter('Active')} />
        <KPIStatCard label="Inactive Users" value={kpis.inactive} icon={<UserX className="w-5 h-5 text-slate-600" />} iconBgClass="bg-slate-100" onClick={() => setStatusFilter('Inactive')} />
        <KPIStatCard label="Pending Invitations" value={kpis.pending} icon={<Mail className="w-5 h-5 text-amber-600" />} iconBgClass="bg-amber-50" onClick={() => setStatusFilter('Pending Invitation')} />
        <KPIStatCard label="Locked Accounts" value={kpis.locked} icon={<ShieldAlert className="w-5 h-5 text-rose-600" />} iconBgClass="bg-rose-50" onClick={() => setStatusFilter('Locked')} />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(u) => u.id}
        onRowClick={(u) => navigate(`/platform-users/${u.id}`)}
        toolbar={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search internal staff by name, email, department..." className="w-full sm:max-w-sm" />
            <div className="flex items-center gap-2">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-9 px-2.5 text-xs border border-[#E2E8F0] rounded-lg bg-white">
                <option value="">All Roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-2.5 text-xs border border-[#E2E8F0] rounded-lg bg-white">
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending Invitation">Pending Invitation</option>
                <option value="Locked">Locked</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Create / Edit Platform User Modal */}
      {userModal && (
        <FormModal
          open
          title={platformUsers.some((u) => u.id === userModal.id) ? `Edit ${userModal.fullName}` : 'Create Platform User'}
          subtitle="PayFuse internal staff only — tenant employees are not managed here."
          onClose={() => setUserModal(null)}
          footer={
            <>
              <button type="button" onClick={() => setUserModal(null)} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  if (!userModal.fullName.trim() || !userModal.email.includes('@')) {
                    pushToast({ type: 'error', title: 'Invalid fields', message: 'Full name and valid email are required.' });
                    return;
                  }
                  const initials = userModal.fullName
                    .split(' ')
                    .map((p) => p[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  savePlatformUser({ ...userModal, avatarInitials: initials || 'PU' });
                  setUserModal(null);
                }}
                className="px-4 py-2 text-sm font-medium bg-[#7050F5] text-white rounded-lg"
              >
                Save User
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs font-semibold mb-1">Full Name *</label>
              <input value={userModal.fullName} onChange={(e) => setUserModal({ ...userModal, fullName: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Email *</label>
              <input type="email" value={userModal.email} onChange={(e) => setUserModal({ ...userModal, email: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Phone</label>
              <input value={userModal.phone} onChange={(e) => setUserModal({ ...userModal, phone: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Designation</label>
              <input value={userModal.designation} onChange={(e) => setUserModal({ ...userModal, designation: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Department</label>
              <select value={userModal.department} onChange={(e) => setUserModal({ ...userModal, department: e.target.value as PlatformUser['department'] })} className="w-full h-9 px-2.5 border border-[#E2E8F0] rounded-lg bg-white">
                <option>Executive</option>
                <option>Platform Ops</option>
                <option>Customer Support</option>
                <option>Revenue & Billing</option>
                <option>Security & Compliance</option>
                <option>Analytics</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Assigned Role</label>
              <select
                value={userModal.roleId}
                onChange={(e) => {
                  const r = roles.find((x) => x.id === e.target.value);
                  setUserModal({ ...userModal, roleId: e.target.value, roleName: r?.name || userModal.roleName });
                }}
                className="w-full h-9 px-2.5 border border-[#E2E8F0] rounded-lg bg-white"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Status</label>
              <select value={userModal.status} onChange={(e) => setUserModal({ ...userModal, status: e.target.value as PlatformUser['status'] })} className="w-full h-9 px-2.5 border border-[#E2E8F0] rounded-lg bg-white">
                <option value="Pending Invitation">Pending Invitation</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Locked">Locked</option>
              </select>
            </div>
          </div>
        </FormModal>
      )}

      {/* Privileged Re-Auth Confirmation */}
      <ConfirmationDialog
        open={privConfirm !== null}
        title={`Privileged Action: ${privConfirm?.action.replace('_', ' ').toUpperCase()} (${privConfirm?.user.fullName})`}
        description="Privileged account lifecycle changes require Super Admin re-authentication and are logged in the immutable security audit trail."
        variant={privConfirm?.action === 'deactivate' || privConfirm?.action === 'lock' ? 'danger' : 'primary'}
        requireReauth
        onCancel={() => setPrivConfirm(null)}
        onConfirm={() => {
          if (!privConfirm) return;
          const { user, action } = privConfirm;
          if (action === 'lock') toggleUserLock(user.id, true);
          else if (action === 'unlock') toggleUserLock(user.id, false);
          else if (action === 'activate') toggleUserActive(user.id, true);
          else if (action === 'deactivate') toggleUserActive(user.id, false);
          else if (action === 'revoke') revokeUserSessions(user.id);
          else if (action === 'reset_pwd') {
            recordAudit({
              action: 'Sent Privileged Password Reset',
              eventType: 'Security Event',
              module: 'Platform Users',
              resource: `${user.id} (${user.email})`,
              details: 'Password reset token issued with MFA enforcement.',
            });
            pushToast({ type: 'success', title: 'Password reset sent', message: `Reset link dispatched to ${user.email}.` });
          }
          setPrivConfirm(null);
        }}
      />
    </div>
  );
};
