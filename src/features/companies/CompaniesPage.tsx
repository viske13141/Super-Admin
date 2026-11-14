import React, { useMemo, useState } from 'react';
import {
  Ban,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { Company } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { KPIStatCard } from '../../components/common/KPIStatCard';
import { ColumnDef, DataTable } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { FilterPopover } from '../../components/common/FilterPopover';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ActionMenu } from '../../components/common/ActionMenu';
import { ExportMenu } from '../../components/common/ExportMenu';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { FormModal } from '../../components/common/FormModal';
import { exportToCSV, formatDate, formatDateTime, formatNumberIN } from '../../utils/format';

export const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    companies,
    industries,
    pricingPlans,
    setCompanyStatus,
    softDeleteCompany,
    pushToast,
  } = usePlatformStore();

  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState(searchParams.get('industry') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [planFilter, setPlanFilter] = useState(searchParams.get('plan') || '');
  const [regionFilter, setRegionFilter] = useState(searchParams.get('region') || '');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [stageFilter, setStageFilter] = useState(searchParams.get('stage') || '');
  const [empRangeFilter, setEmpRangeFilter] = useState('');
  const [regFromFilter, setRegFromFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState('');
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    type: 'activate' | 'suspend' | 'delete';
    company: Company | null;
  }>({ open: false, type: 'suspend', company: null });

  const visibleCompanies = useMemo(
    () => companies.filter((c) => c.accountStatus !== 'Deactivated'),
    [companies]
  );

  const kpis = useMemo(() => {
    return {
      total: visibleCompanies.length,
      active: visibleCompanies.filter((c) => c.accountStatus === 'Active').length,
      pending: visibleCompanies.filter((c) => c.accountStatus === 'Pending Verification').length,
      suspended: visibleCompanies.filter((c) => c.accountStatus === 'Suspended').length,
      trial: visibleCompanies.filter((c) => c.accountStatus === 'Trial').length,
    };
  }, [visibleCompanies]);

  const activeFilterCount = [
    industryFilter,
    statusFilter,
    planFilter,
    regionFilter,
    verificationFilter,
    stageFilter,
    empRangeFilter,
    regFromFilter,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setIndustryFilter('');
    setStatusFilter('');
    setPlanFilter('');
    setRegionFilter('');
    setVerificationFilter('');
    setStageFilter('');
    setEmpRangeFilter('');
    setRegFromFilter('');
    setSearchParams({});
  };

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visibleCompanies.filter((c) => {
      if (
        q &&
        !c.displayName.toLowerCase().includes(q) &&
        !c.legalName.toLowerCase().includes(q) &&
        !c.id.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (industryFilter && c.industry !== industryFilter) return false;
      if (statusFilter && c.accountStatus !== statusFilter) return false;
      if (planFilter && c.subscriptionPlan !== planFilter) return false;
      if (regionFilter && c.region !== regionFilter) return false;
      if (verificationFilter && c.verificationStatus !== verificationFilter) return false;
      if (stageFilter && c.onboardingStage !== stageFilter) return false;
      if (regFromFilter && c.registrationDate < regFromFilter) return false;
      if (empRangeFilter === 'lt500' && c.employeeCount >= 500) return false;
      if (empRangeFilter === '500to2000' && (c.employeeCount < 500 || c.employeeCount > 2000)) return false;
      if (empRangeFilter === 'gt2000' && c.employeeCount <= 2000) return false;
      return true;
    });
  }, [
    visibleCompanies,
    search,
    industryFilter,
    statusFilter,
    planFilter,
    regionFilter,
    verificationFilter,
    stageFilter,
    empRangeFilter,
    regFromFilter,
  ]);

  const columns: ColumnDef<Company>[] = [
    {
      key: 'logo',
      header: 'Logo',
      render: (c) => (
        <div
          className="w-9 h-9 rounded-xl text-white text-xs font-bold flex items-center justify-center shrink-0"
          style={{ backgroundColor: c.logoColor }}
        >
          {c.logoInitials}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Company Name',
      sortable: true,
      sortValue: (c) => c.displayName,
      render: (c) => (
        <div className="min-w-[160px]">
          <p className="font-semibold text-[#0F172A] truncate">{c.displayName}</p>
          <p className="text-xs text-[#64748B] truncate max-w-[220px]">{c.city}, {c.country}</p>
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Company ID',
      sortable: true,
      sortValue: (c) => c.id,
      render: (c) => <span className="font-mono-code text-xs text-[#475569]">{c.id}</span>,
    },
    {
      key: 'industry',
      header: 'Industry',
      sortable: true,
      sortValue: (c) => c.industry,
      render: (c) => <span className="text-[#0F172A] whitespace-nowrap">{c.industry}</span>,
    },
    {
      key: 'employees',
      header: 'Employees',
      align: 'right',
      sortable: true,
      sortValue: (c) => c.employeeCount,
      render: (c) => (
        <span className="font-semibold text-[#0F172A] tabular-nums">
          {formatNumberIN(c.employeeCount)}
        </span>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      sortable: true,
      sortValue: (c) => c.subscriptionPlan,
      render: (c) => (
        <span className="font-medium text-[#5B3CE6] whitespace-nowrap">{c.subscriptionPlan}</span>
      ),
    },
    {
      key: 'regDate',
      header: 'Registered',
      sortable: true,
      sortValue: (c) => c.registrationDate,
      render: (c) => <span className="text-[#64748B] tabular-nums whitespace-nowrap">{formatDate(c.registrationDate)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (c) => c.accountStatus,
      render: (c) => <StatusBadge status={c.accountStatus} />,
    },
    {
      key: 'lastActive',
      header: 'Last Active',
      sortable: true,
      sortValue: (c) => c.lastActive,
      render: (c) => <span className="text-xs text-[#64748B] tabular-nums whitespace-nowrap">{formatDateTime(c.lastActive)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <ActionMenu
          items={[
            {
              label: 'View Details',
              icon: <Eye className="w-4 h-4" />,
              onClick: () => navigate(`/companies/${c.id}`),
            },
            {
              label: 'Edit Company',
              icon: <Pencil className="w-4 h-4" />,
              onClick: () => navigate(`/companies/${c.id}/edit`),
            },
            ...(c.accountStatus !== 'Active'
              ? [
                  {
                    label: 'Activate Company',
                    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
                    onClick: () => setConfirmState({ open: true, type: 'activate', company: c }),
                  },
                ]
              : [
                  {
                    label: 'Suspend Company',
                    icon: <Ban className="w-4 h-4 text-amber-600" />,
                    onClick: () => setConfirmState({ open: true, type: 'suspend', company: c }),
                  },
                ]),
            {
              label: 'Deactivate (Soft Delete)',
              icon: <Trash2 className="w-4 h-4" />,
              danger: true,
              onClick: () => setConfirmState({ open: true, type: 'delete', company: c }),
            },
          ]}
        />
      ),
    },
  ];

  const handleExport = () => {
    exportToCSV(
      'payfuse-companies.csv',
      filteredCompanies.map((c) => ({
        CompanyID: c.id,
        LegalName: c.legalName,
        DisplayName: c.displayName,
        Industry: c.industry,
        Region: c.region,
        Employees: c.employeeCount,
        Plan: c.subscriptionPlan,
        Status: c.accountStatus,
        Verification: c.verificationStatus,
        Registered: c.registrationDate,
      }))
    );
    pushToast({ type: 'success', title: 'Exported companies', message: `${filteredCompanies.length} records exported to CSV.` });
  };

  const handleBulkStatus = (status: 'Active' | 'Suspended') => {
    selectedIds.forEach((id) => setCompanyStatus(id, status, 'Bulk action from Companies console'));
    setSelectedIds([]);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Companies"
        subtitle="Manage all companies registered on PayFuse."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Companies' }]}
        actions={
          <>
            <ExportMenu onExportCSV={handleExport} label="Export" />
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="h-9 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#0F172A] hover:bg-slate-50 inline-flex items-center gap-2 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Import</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/companies/new')}
              className="h-9 px-4 bg-[#7050F5] hover:bg-[#5E3DE6] text-white rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Company</span>
            </button>
          </>
        }
      />

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPIStatCard
          label="Total Companies"
          value={kpis.total}
          icon={<Building2 className="w-5 h-5 text-[#7050F5]" />}
          iconBgClass="bg-[#EFEAFF]"
          onClick={clearAllFilters}
        />
        <KPIStatCard
          label="Active Companies"
          value={kpis.active}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          iconBgClass="bg-emerald-50"
          onClick={() => setStatusFilter('Active')}
        />
        <KPIStatCard
          label="Pending Verification"
          value={kpis.pending}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          iconBgClass="bg-amber-50"
          onClick={() => setStatusFilter('Pending Verification')}
        />
        <KPIStatCard
          label="Suspended Companies"
          value={kpis.suspended}
          icon={<ShieldAlert className="w-5 h-5 text-rose-600" />}
          iconBgClass="bg-rose-50"
          onClick={() => setStatusFilter('Suspended')}
        />
        <KPIStatCard
          label="Trial Companies"
          value={kpis.trial}
          icon={<Building2 className="w-5 h-5 text-[#478BFA]" />}
          iconBgClass="bg-[#EAF2FF]"
          onClick={() => setStatusFilter('Trial')}
        />
      </div>

      {/* Table */}
      <DataTable
        data={filteredCompanies}
        columns={columns}
        rowKey={(c) => c.id}
        selectable
        selectedKeys={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(c) => navigate(`/companies/${c.id}`)}
        bulkActions={
          <>
            <button
              type="button"
              onClick={() => handleBulkStatus('Active')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
            >
              Activate Selected
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus('Suspended')}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
            >
              Suspend Selected
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] font-medium hover:bg-slate-50"
            >
              Export Selected
            </button>
          </>
        }
        toolbar={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by company name or ID (e.g. TechNova, CMP-1001)..."
              className="w-full sm:max-w-sm"
            />
            <div className="flex items-center gap-2 flex-wrap">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-medium text-[#7050F5] hover:underline px-2"
                >
                  Clear filters ({activeFilterCount})
                </button>
              )}
              <FilterPopover activeCount={activeFilterCount} onClear={clearAllFilters}>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1">Industry</label>
                  <select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="">All Industries</option>
                    {industries.map((i) => (
                      <option key={i.id} value={i.name}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">Account Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full h-9 px-2 text-sm border border-[#E2E8F0] rounded-lg bg-white"
                    >
                      <option value="">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Pending Verification">Pending Verification</option>
                      <option value="Trial">Trial</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">Plan</label>
                    <select
                      value={planFilter}
                      onChange={(e) => setPlanFilter(e.target.value)}
                      className="w-full h-9 px-2 text-sm border border-[#E2E8F0] rounded-lg bg-white"
                    >
                      <option value="">All Plans</option>
                      {pricingPlans.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">Region</label>
                    <select
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value)}
                      className="w-full h-9 px-2 text-sm border border-[#E2E8F0] rounded-lg bg-white"
                    >
                      <option value="">All Regions</option>
                      <option value="India">India</option>
                      <option value="Middle East">Middle East</option>
                      <option value="APAC">APAC</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">Verification</label>
                    <select
                      value={verificationFilter}
                      onChange={(e) => setVerificationFilter(e.target.value)}
                      className="w-full h-9 px-2 text-sm border border-[#E2E8F0] rounded-lg bg-white"
                    >
                      <option value="">All</option>
                      <option value="Verified">Verified</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Incomplete">Incomplete</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">Employee Count</label>
                    <select
                      value={empRangeFilter}
                      onChange={(e) => setEmpRangeFilter(e.target.value)}
                      className="w-full h-9 px-2 text-sm border border-[#E2E8F0] rounded-lg bg-white"
                    >
                      <option value="">Any Size</option>
                      <option value="lt500">&lt; 500</option>
                      <option value="500to2000">500 – 2,000</option>
                      <option value="gt2000">&gt; 2,000</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">Registered After</label>
                    <input
                      type="date"
                      value={regFromFilter}
                      onChange={(e) => setRegFromFilter(e.target.value)}
                      className="w-full h-9 px-2 text-xs border border-[#E2E8F0] rounded-lg"
                    />
                  </div>
                </div>
              </FilterPopover>
            </div>
          </div>
        }
      />

      {/* Import Companies Modal */}
      <FormModal
        open={importOpen}
        title="Bulk Import Companies (CSV)"
        subtitle="Validate and stage tenant onboarding records from CSV."
        onClose={() => setImportOpen(false)}
        maxWidthClass="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              className="px-4 py-2 text-sm font-medium border border-[#E2E8F0] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setImportOpen(false);
                pushToast({
                  type: 'info',
                  title: 'CSV validation simulated',
                  message: importFile
                    ? `Validated schema for ${importFile}. Ready for onboarding queue.`
                    : 'Sample import template check completed.',
                });
              }}
              className="px-4 py-2 text-sm font-medium bg-[#7050F5] text-white rounded-lg hover:bg-[#5E3DE6]"
            >
              Validate & Stage
            </button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-xs text-[#64748B]">
            Upload a UTF-8 CSV containing Legal Name, Registration Number, Industry, Country, Primary Contact Email, and Plan Code.
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setImportFile(e.target.files?.[0]?.name || '')}
            className="w-full text-xs border border-[#E2E8F0] rounded-lg p-2"
          />
        </div>
      </FormModal>

      {/* Activate / Suspend / Controlled Deactivate Confirmation */}
      <ConfirmationDialog
        open={confirmState.open}
        title={
          confirmState.type === 'activate'
            ? `Activate ${confirmState.company?.displayName}?`
            : confirmState.type === 'suspend'
            ? `Suspend ${confirmState.company?.displayName}?`
            : `Deactivate ${confirmState.company?.displayName}?`
        }
        description={
          confirmState.type === 'activate'
            ? 'This marks KYC verification as verified and restores tenant workspace access across all enabled modules.'
            : confirmState.type === 'suspend'
            ? 'Suspending blocks employee and company admin logins immediately while preserving all payroll and compliance records.'
            : 'PayFuse uses controlled soft-deactivation. Payroll ledgers, Form 16, PF/ESIC records, and audit trails are retained under statutory retention rules.'
        }
        variant={confirmState.type === 'activate' ? 'primary' : confirmState.type === 'suspend' ? 'warning' : 'danger'}
        confirmLabel={
          confirmState.type === 'activate'
            ? 'Activate Company'
            : confirmState.type === 'suspend'
            ? 'Suspend Company'
            : 'Confirm Soft-Deactivation'
        }
        requireReason={confirmState.type !== 'activate'}
        onCancel={() => setConfirmState({ open: false, type: 'suspend', company: null })}
        onConfirm={(reason) => {
          if (!confirmState.company) return;
          if (confirmState.type === 'activate') {
            setCompanyStatus(confirmState.company.id, 'Active', reason || 'Activated by Super Admin');
          } else if (confirmState.type === 'suspend') {
            setCompanyStatus(confirmState.company.id, 'Suspended', reason);
          } else {
            const res = softDeleteCompany(confirmState.company.id, reason || 'Controlled deactivation');
            if (!res.ok && res.error) {
              pushToast({ type: 'error', title: 'Deactivation blocked', message: res.error });
            }
          }
          setConfirmState({ open: false, type: 'suspend', company: null });
        }}
      />
    </div>
  );
};
