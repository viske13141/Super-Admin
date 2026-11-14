import React, { useState } from 'react';
import { Copy, Eye, Lock, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { usePlatformStore } from '../../services/platformStore';
import { ALL_PERMISSION_MODULES } from '../../mock-data/seedData';
import { PermissionMap, RoleDefinition } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { ColumnDef, DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FormModal } from '../../components/common/FormModal';
import { PermissionMatrix } from '../../components/common/PermissionMatrix';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';

type SectionTab = 'roles' | 'permissions' | 'policies';

export const AccessRolesPage: React.FC = () => {
  const {
    roles,
    platformUsers,
    accessPolicies,
    saveRole,
    deleteCustomRole,
    toggleAccessPolicy,
    pushToast,
  } = usePlatformStore();

  const [section, setSection] = useState<SectionTab>('roles');
  const [roleModal, setRoleModal] = useState<{ role: RoleDefinition; readOnly: boolean } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleDefinition | null>(null);
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState<string>(roles[0]?.id || 'ROL-1');

  const countPermissions = (p: PermissionMap) =>
    Object.values(p).reduce((sum, arr) => sum + arr.length, 0);

  const countAssignedUsers = (roleId: string) =>
    platformUsers.filter((u) => u.roleId === roleId).length;

  const openCreateRole = () => {
    const emptyPerms = ALL_PERMISSION_MODULES.reduce((acc, mod) => {
      acc[mod] = ['View'];
      return acc;
    }, {} as PermissionMap);
    setRoleModal({
      readOnly: false,
      role: {
        id: `ROL-${Date.now()}`,
        name: '',
        code: '',
        description: '',
        category: 'Operations & Support',
        isSystemRole: false,
        status: 'Active',
        permissions: emptyPerms,
      },
    });
  };

  const duplicateRole = (r: RoleDefinition) => {
    setRoleModal({
      readOnly: false,
      role: {
        ...r,
        id: `ROL-${Date.now()}`,
        name: `${r.name} (Custom Copy)`,
        code: `${r.code}_CUSTOM`,
        isSystemRole: false,
      },
    });
  };

  const columns: ColumnDef<RoleDefinition>[] = [
    {
      key: 'name',
      header: 'Role Name',
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#7050F5] shrink-0" />
          <span className="font-semibold text-[#0F172A]">{r.name}</span>
        </div>
      ),
    },
    { key: 'code', header: 'Role Code', render: (r) => <span className="font-mono-code text-xs text-[#64748B]">{r.code}</span> },
    { key: 'desc', header: 'Description', render: (r) => <span className="text-xs text-[#64748B] line-clamp-1 max-w-xs">{r.description}</span> },
    { key: 'users', header: 'Assigned Users', align: 'right', render: (r) => <span className="font-semibold tabular-nums">{countAssignedUsers(r.id)}</span> },
    { key: 'perms', header: 'Permissions', align: 'right', render: (r) => <span className="tabular-nums font-medium">{countPermissions(r.permissions)}</span> },
    {
      key: 'type',
      header: 'Type',
      render: (r) => (
        <span className="text-xs font-medium text-[#0F172A] inline-flex items-center gap-1">
          {r.isSystemRole && <Lock className="w-3 h-3 text-[#64748B]" />}
          {r.isSystemRole ? 'System Role' : 'Custom Role'}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div className="inline-flex items-center gap-1">
          <button type="button" onClick={() => setRoleModal({ role: r, readOnly: true })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" aria-label={`View ${r.name}`}>
            <Eye className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setRoleModal({ role: r, readOnly: false })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" aria-label={`Edit ${r.name}`}>
            <Pencil className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => duplicateRole(r)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" aria-label={`Duplicate ${r.name}`}>
            <Copy className="w-4 h-4" />
          </button>
          {!r.isSystemRole && (
            <button type="button" onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600" aria-label={`Delete ${r.name}`}>
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const matrixRole = roles.find((r) => r.id === selectedRoleForMatrix) || roles[0];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Access & Roles"
        subtitle="Role-based access control (RBAC), grouped permission matrices, and platform security policies."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Access & Roles' }]}
        actions={
          <button
            type="button"
            onClick={openCreateRole}
            className="h-9 px-4 bg-[#7050F5] hover:bg-[#5E3DE6] text-white rounded-lg text-sm font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Role</span>
          </button>
        }
      />

      {/* Section Switcher */}
      <div className="bg-white rounded-2xl border border-[#E8EBF4] p-1.5 inline-flex gap-1">
        {(
          [
            { key: 'roles', label: '1. Roles' },
            { key: 'permissions', label: '2. Permissions Matrix' },
            { key: 'policies', label: '3. Access Policies' },
          ] as const
        ).map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSection(s.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              section === s.key ? 'bg-[#7050F5] text-white' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === 'roles' && <DataTable data={roles} columns={columns} rowKey={(r) => r.id} />}

      {section === 'permissions' && matrixRole && (
        <div className="bg-white rounded-2xl border border-[#E8EBF4] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[#0F172A]">Permission Matrix Inspector</h3>
              <p className="text-xs text-[#64748B]">Select a role to view or customize granular module permissions.</p>
            </div>
            <select
              value={selectedRoleForMatrix}
              onChange={(e) => setSelectedRoleForMatrix(e.target.value)}
              className="h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-white"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <PermissionMatrix
            permissions={matrixRole.permissions}
            readOnly={matrixRole.code === 'PLATFORM_SUPER_ADMIN'}
            onChange={(next) => saveRole({ ...matrixRole, permissions: next })}
          />
        </div>
      )}

      {section === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accessPolicies.map((pol) => (
            <div key={pol.id} className="bg-white rounded-2xl border border-[#E8EBF4] p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#0F172A]">{pol.name}</h3>
                  <StatusBadge status={pol.enforcement === 'Enforced' ? 'Enforced' : pol.enforcement === 'Audit Only' ? 'Pending' : 'Inactive'} />
                </div>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">{pol.description}</p>
                <p className="text-xs text-[#0F172A] mt-2"><strong>Scope:</strong> {pol.scope}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#F1F3F9]">
                <span className="text-[11px] text-[#64748B] tabular-nums">Updated {pol.updatedAt}</span>
                <select
                  value={pol.enforcement}
                  onChange={(e) => toggleAccessPolicy(pol.id, e.target.value as typeof pol.enforcement)}
                  className="h-8 px-2.5 text-xs border border-[#E2E8F0] rounded-lg bg-white"
                >
                  <option value="Enforced">Enforced</option>
                  <option value="Audit Only">Audit Only</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Role Modal */}
      {roleModal && (
        <FormModal
          open
          title={roleModal.readOnly ? `Role Details: ${roleModal.role.name}` : roleModal.role.name ? `Edit Role: ${roleModal.role.name}` : 'Create Custom Role'}
          maxWidthClass="max-w-4xl"
          onClose={() => setRoleModal(null)}
          footer={
            !roleModal.readOnly && (
              <>
                <button type="button" onClick={() => setRoleModal(null)} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg">Cancel</button>
                <button
                  type="button"
                  onClick={() => {
                    if (!roleModal.role.name.trim() || !roleModal.role.code.trim()) {
                      pushToast({ type: 'error', title: 'Required fields', message: 'Role Name and Code are required.' });
                      return;
                    }
                    saveRole(roleModal.role);
                    setRoleModal(null);
                  }}
                  className="px-4 py-2 text-sm font-medium bg-[#7050F5] text-white rounded-lg"
                >
                  Save Role
                </button>
              </>
            )
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">Role Name *</label>
                <input
                  disabled={roleModal.readOnly}
                  value={roleModal.role.name}
                  onChange={(e) => setRoleModal({ ...roleModal, role: { ...roleModal.role, name: e.target.value } })}
                  className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Role Code *</label>
                <input
                  disabled={roleModal.readOnly || roleModal.role.isSystemRole}
                  value={roleModal.role.code}
                  onChange={(e) => setRoleModal({ ...roleModal, role: { ...roleModal.role, code: e.target.value.toUpperCase() } })}
                  className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg font-mono-code text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Category</label>
                <select
                  disabled={roleModal.readOnly}
                  value={roleModal.role.category}
                  onChange={(e) => setRoleModal({ ...roleModal, role: { ...roleModal.role, category: e.target.value as RoleDefinition['category'] } })}
                  className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg bg-white"
                >
                  <option>Core Administration</option>
                  <option>Operations & Support</option>
                  <option>Finance & Billing</option>
                  <option>Governance & Audit</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold mb-1">Description</label>
                <input
                  disabled={roleModal.readOnly}
                  value={roleModal.role.description}
                  onChange={(e) => setRoleModal({ ...roleModal, role: { ...roleModal.role, description: e.target.value } })}
                  className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg"
                />
              </div>
            </div>

            <PermissionMatrix
              permissions={roleModal.role.permissions}
              readOnly={roleModal.readOnly || roleModal.role.code === 'PLATFORM_SUPER_ADMIN'}
              onChange={(next) => setRoleModal({ ...roleModal, role: { ...roleModal.role, permissions: next } })}
            />
          </div>
        </FormModal>
      )}

      <ConfirmationDialog
        open={deleteTarget !== null}
        title={`Delete Custom Role "${deleteTarget?.name}"?`}
        description="Only custom roles with zero assigned users can be deleted. System-critical roles are protected."
        variant="danger"
        requireReauth
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            const res = deleteCustomRole(deleteTarget.id);
            if (!res.ok && res.error) pushToast({ type: 'error', title: 'Blocked', message: res.error });
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};
