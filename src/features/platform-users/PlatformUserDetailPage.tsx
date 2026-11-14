import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PermissionMatrix } from '../../components/common/PermissionMatrix';
import { ActivityTimeline } from '../../components/common/ActivityTimeline';
import { formatDate, formatDateTime } from '../../utils/format';

type UserTab = 'profile' | 'permissions' | 'logins' | 'sessions' | 'activity';

export const PlatformUserDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { platformUsers, roles, auditEvents, revokeUserSessions } = usePlatformStore();
  const user = platformUsers.find((u) => u.id === id);
  const [tab, setTab] = useState<UserTab>('profile');

  if (!user) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8EBF4] p-8 text-center">
        <h2 className="text-lg font-semibold">Platform user not found</h2>
        <button type="button" onClick={() => navigate('/platform-users')} className="mt-4 px-4 py-2 bg-[#7050F5] text-white text-sm rounded-lg">
          Back to Platform Users
        </button>
      </div>
    );
  }

  const role = roles.find((r) => r.id === user.roleId);
  const userAudits = auditEvents
    .filter((a) => a.user === user.fullName || a.resource.includes(user.id) || a.resource.includes(user.email))
    .map((a) => ({ id: a.id, title: a.action, description: a.details, timestamp: a.timestamp, actor: a.user }));

  return (
    <div className="space-y-5">
      <PageHeader
        title={user.fullName}
        subtitle={`${user.email} · ${user.roleName} · ${user.department}`}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Platform Users', to: '/platform-users' },
          { label: user.fullName },
        ]}
        badge={<StatusBadge status={user.status} size="md" />}
      />

      <div className="bg-white rounded-2xl border border-[#E8EBF4] overflow-hidden">
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-[#E8EBF4] overflow-x-auto">
          {(
            [
              { key: 'profile', label: 'Profile' },
              { key: 'permissions', label: 'Role & Permissions' },
              { key: 'logins', label: 'Login History' },
              { key: 'sessions', label: 'Active Sessions' },
              { key: 'activity', label: 'Activity History' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap ${
                tab === t.key ? 'border-[#7050F5] text-[#7050F5]' : 'border-transparent text-[#64748B]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'profile' && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div><dt className="text-xs text-[#64748B]">User ID</dt><dd className="font-mono-code font-medium">{user.id}</dd></div>
              <div><dt className="text-xs text-[#64748B]">Full Name</dt><dd className="font-medium">{user.fullName}</dd></div>
              <div><dt className="text-xs text-[#64748B]">Email</dt><dd className="font-medium">{user.email}</dd></div>
              <div><dt className="text-xs text-[#64748B]">Phone</dt><dd className="font-medium tabular-nums">{user.phone}</dd></div>
              <div><dt className="text-xs text-[#64748B]">Department & Designation</dt><dd className="font-medium">{user.department} · {user.designation}</dd></div>
              <div><dt className="text-xs text-[#64748B]">MFA Status</dt><dd className="font-medium">{user.mfaEnabled ? 'Enforced (Active)' : 'Not Configured'}</dd></div>
              <div><dt className="text-xs text-[#64748B]">Created Date</dt><dd className="tabular-nums">{formatDate(user.createdDate)}</dd></div>
              <div><dt className="text-xs text-[#64748B]">Last Login</dt><dd className="tabular-nums">{user.lastLogin === 'Never' ? 'Never' : formatDateTime(user.lastLogin)}</dd></div>
            </dl>
          )}

          {tab === 'permissions' && role && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#0F172A]">Inherited from Role: {role.name} ({role.code})</p>
              <PermissionMatrix permissions={role.permissions} readOnly />
            </div>
          )}

          {tab === 'logins' && (
            <div className="space-y-2.5">
              {user.loginHistory.length === 0 ? (
                <p className="text-sm text-[#64748B]">No recent login events recorded.</p>
              ) : (
                user.loginHistory.map((lh) => (
                  <div key={lh.id} className="p-3 rounded-xl border border-[#E8EBF4] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#0F172A]">{lh.device} · {lh.location}</p>
                      <p className="text-[#64748B] tabular-nums">IP {lh.ipAddress} · {formatDateTime(lh.timestamp)}</p>
                    </div>
                    <StatusBadge status={lh.result} />
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'sessions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Active Console Sessions ({user.sessions.length})</p>
                {user.sessions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => revokeUserSessions(user.id)}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 text-xs font-medium hover:bg-rose-50"
                  >
                    Revoke All Sessions
                  </button>
                )}
              </div>
              {user.sessions.length === 0 ? (
                <p className="text-sm text-[#64748B]">No active sessions.</p>
              ) : (
                user.sessions.map((s) => (
                  <div key={s.id} className="p-3 rounded-xl border border-[#E8EBF4] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#0F172A]">{s.device}</p>
                      <p className="text-[#64748B] tabular-nums">{s.location} · IP {s.ipAddress}</p>
                    </div>
                    <span className="font-medium text-emerald-700">{s.lastActive}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'activity' && <ActivityTimeline items={userAudits} />}
        </div>
      </div>
    </div>
  );
};
