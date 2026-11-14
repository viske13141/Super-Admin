import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { PageHeader } from '../../components/common/PageHeader';
import { MultiSelect } from '../../components/common/MultiSelect';
import { FileUpload } from '../../components/common/FileUpload';
import { ALL_MODULES } from '../../mock-data/seedData';
import { Company, IndustryCategory, ModuleKey, PlanName, RegionCategory } from '../../types';

const STEPS = [
  'Basic Info',
  'Address',
  'Primary Contact',
  'Business Config',
  'Subscription',
  'Verification',
];

export const CompanyFormWizard: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { companies, industries, pricingPlans, createCompany, updateCompany, pushToast } =
    usePlatformStore();

  const existing = id ? companies.find((c) => c.id === id) : undefined;
  const isEdit = Boolean(existing);

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    legalName: existing?.legalName || '',
    displayName: existing?.displayName || '',
    registrationNumber: existing?.registrationNumber || '',
    businessType: existing?.businessType || ('Private Limited' as Company['businessType']),
    industry: existing?.industry || ('IT & Software' as IndustryCategory),
    subIndustry: existing?.subIndustry || '',
    website: existing?.website || '',
    email: existing?.email || '',
    phone: existing?.phone || '',
    logoInitials: existing?.logoInitials || '',
    logoColor: existing?.logoColor || '#7050F5',
    description: existing?.description || '',

    country: existing?.country || 'India',
    state: existing?.state || '',
    city: existing?.city || '',
    district: existing?.district || '',
    postalCode: existing?.postalCode || '',
    registeredAddress: existing?.registeredAddress || '',
    billingAddress: existing?.billingAddress || '',
    region: existing?.region || ('India' as RegionCategory),

    contactName: existing?.contacts[0]?.name || '',
    contactDesignation: existing?.contacts[0]?.designation || '',
    contactEmail: existing?.contacts[0]?.email || '',
    contactPhone: existing?.contacts[0]?.phone || '',
    alternateContact: existing?.contacts[0]?.alternateContact || '',

    companySize: existing?.companySize || ('51-200' as Company['companySize']),
    expectedEmployeeCount: existing?.expectedEmployeeCount || 150,
    branchCount: existing?.branchCount || 1,
    locationCount: existing?.locationCount || 1,
    financialYear: existing?.financialYear || 'Apr - Mar',
    currency: existing?.currency || ('INR' as Company['currency']),
    timeZone: existing?.timeZone || 'Asia/Kolkata',
    primaryLanguage: existing?.primaryLanguage || 'English',

    subscriptionPlan: existing?.subscriptionPlan || ('Growth' as PlanName),
    trialDays: 14,
    billingCycle: 'Monthly' as 'Monthly' | 'Annual',
    employeeLimit: 1000,
    enabledModules: existing?.enabledModules || (['Employee Management', 'Attendance', 'Leave', 'Payroll', 'Compliance'] as ModuleKey[]),

    docNames: existing?.documents.map((d) => d.name) || ([] as string[]),
    verificationStatus: existing?.verificationStatus || ('Pending Review' as Company['verificationStatus']),
    internalNotes: existing?.internalNotes || '',
  });

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!form.legalName.trim()) errs.legalName = 'Legal name is required.';
      if (!form.displayName.trim()) errs.displayName = 'Display name is required.';
      if (!form.registrationNumber.trim()) errs.registrationNumber = 'Registration number is required.';
      if (!form.email.includes('@')) errs.email = 'Valid company email is required.';
    } else if (s === 1) {
      if (!form.country.trim()) errs.country = 'Country is required.';
      if (!form.city.trim()) errs.city = 'City is required.';
      if (!form.registeredAddress.trim()) errs.registeredAddress = 'Registered office address is required.';
    } else if (s === 2) {
      if (!form.contactName.trim()) errs.contactName = 'Primary contact name is required.';
      if (!form.contactEmail.includes('@')) errs.contactEmail = 'Valid contact email is required.';
      if (!form.contactPhone.trim()) errs.contactPhone = 'Contact phone is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(STEPS.length - 1, s + 1));
    }
  };

  const handleSubmit = (asDraft = false) => {
    if (!asDraft && !validateStep(step)) return;
    const initials =
      form.logoInitials.trim().toUpperCase().slice(0, 2) ||
      form.displayName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ||
      'PF';

    if (isEdit && existing) {
      updateCompany(
        existing.id,
        {
          legalName: form.legalName,
          displayName: form.displayName,
          registrationNumber: form.registrationNumber,
          businessType: form.businessType,
          industry: form.industry,
          subIndustry: form.subIndustry,
          website: form.website,
          email: form.email,
          phone: form.phone,
          logoInitials: initials,
          logoColor: form.logoColor,
          description: form.description,
          country: form.country,
          state: form.state,
          city: form.city,
          district: form.district,
          postalCode: form.postalCode,
          registeredAddress: form.registeredAddress,
          billingAddress: form.billingAddress || form.registeredAddress,
          region: form.region,
          companySize: form.companySize,
          expectedEmployeeCount: Number(form.expectedEmployeeCount),
          branchCount: Number(form.branchCount),
          locationCount: Number(form.locationCount),
          financialYear: form.financialYear,
          currency: form.currency,
          timeZone: form.timeZone,
          primaryLanguage: form.primaryLanguage,
          subscriptionPlan: form.subscriptionPlan,
          enabledModules: form.enabledModules,
          verificationStatus: form.verificationStatus,
          internalNotes: form.internalNotes,
        },
        'Edited Company Details'
      );
      navigate(`/companies/${existing.id}`);
      return;
    }

    const created = createCompany({
      legalName: form.legalName || 'Draft Organization Pvt Ltd',
      displayName: form.displayName || 'Draft Organization',
      registrationNumber: form.registrationNumber || 'PENDING-REG',
      businessType: form.businessType,
      industry: form.industry,
      subIndustry: form.subIndustry || 'General',
      website: form.website,
      email: form.email || 'admin@draftcompany.in',
      phone: form.phone || '+91 98000 00000',
      logoInitials: initials,
      logoColor: form.logoColor,
      description: form.description,
      country: form.country,
      state: form.state || 'Karnataka',
      city: form.city || 'Bengaluru',
      district: form.district || 'Urban',
      postalCode: form.postalCode || '560001',
      registeredAddress: form.registeredAddress || 'Pending address',
      billingAddress: form.billingAddress || form.registeredAddress || 'Pending address',
      region: form.region,
      companySize: form.companySize,
      employeeCount: Number(form.expectedEmployeeCount) || 100,
      activeEmployeeCount: Number(form.expectedEmployeeCount) || 100,
      expectedEmployeeCount: Number(form.expectedEmployeeCount) || 100,
      branchCount: Number(form.branchCount) || 1,
      locationCount: Number(form.locationCount) || 1,
      financialYear: form.financialYear,
      currency: form.currency,
      timeZone: form.timeZone,
      primaryLanguage: form.primaryLanguage,
      monthlyPayrollINR: (Number(form.expectedEmployeeCount) || 100) * 55000,
      growthMoM: 8.5,
      subscriptionPlan: form.subscriptionPlan,
      registrationDate: new Date().toISOString().slice(0, 10),
      accountStatus: asDraft
        ? 'Pending Verification'
        : form.verificationStatus === 'Verified'
        ? 'Active'
        : 'Pending Verification',
      verificationStatus: asDraft ? 'Incomplete' : form.verificationStatus,
      onboardingStage: asDraft
        ? 'Sign Up'
        : form.verificationStatus === 'Verified'
        ? 'Go Live'
        : 'Verification',
      onboardingDays: 1,
      enabledModules: form.enabledModules,
      branches: [
        {
          id: `BR-${Date.now()}`,
          name: `${form.city || 'Primary'} HQ`,
          city: form.city || 'Bengaluru',
          state: form.state || 'Karnataka',
          country: form.country,
          employeeCount: Number(form.expectedEmployeeCount) || 100,
          isHeadquarters: true,
        },
      ],
      contacts: [
        {
          id: `CT-${Date.now()}`,
          name: form.contactName || 'Primary Contact',
          designation: form.contactDesignation || 'HR Admin',
          email: form.contactEmail || form.email || 'contact@company.in',
          phone: form.contactPhone || '+91 98000 00000',
          alternateContact: form.alternateContact,
          isPrimary: true,
        },
      ],
      documents: form.docNames.map((n, i) => ({
        id: `DOC-${Date.now()}-${i}`,
        name: n,
        type: 'Verification Doc',
        uploadedAt: new Date().toISOString().slice(0, 10),
        status: form.verificationStatus === 'Verified' ? 'Verified' : 'Pending',
      })),
      internalNotes: form.internalNotes,
    });
    if (asDraft) {
      pushToast({ type: 'info', title: 'Draft saved', message: `${created.displayName} saved in Pending Verification.` });
    }
    navigate(`/companies/${created.id}`);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        title={isEdit ? `Edit ${existing?.displayName}` : 'Add New Company'}
        subtitle="Complete the 6-step tenant onboarding configuration."
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Companies', to: '/companies' },
          { label: isEdit ? 'Edit Company' : 'Add Company' },
        ]}
      />

      {/* Stepper */}
      <div className="bg-white rounded-2xl border border-[#E8EBF4] p-4">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {STEPS.map((label, idx) => {
            const isCurrent = step === idx;
            const isDone = idx < step;
            return (
              <button
                key={label}
                type="button"
                onClick={() => idx <= step && setStep(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isCurrent
                    ? 'bg-[#7050F5] text-white'
                    : isDone
                    ? 'bg-[#EFEAFF] text-[#5B3CE6]'
                    : 'bg-[#F8FAFC] text-[#64748B]'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold shrink-0">
                  {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                </span>
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Panel */}
      <div className="bg-white rounded-2xl border border-[#E8EBF4] p-6 space-y-5">
        {step === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Legal Name *" error={errors.legalName}>
              <input
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                placeholder="e.g. Acme Fintech India Pvt Ltd"
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Display Name *" error={errors.displayName}>
              <input
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="e.g. Acme Fintech"
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Registration Number (CIN / LLPIN / CR) *" error={errors.registrationNumber}>
              <input
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                placeholder="U72900KA2024PTC..."
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Business Type">
              <select
                value={form.businessType}
                onChange={(e) => setForm({ ...form, businessType: e.target.value as Company['businessType'] })}
                className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white"
              >
                <option>Private Limited</option>
                <option>Public Limited</option>
                <option>LLP</option>
                <option>Partnership</option>
                <option>Proprietorship</option>
              </select>
            </Field>
            <Field label="Industry">
              <select
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value as IndustryCategory })}
                className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white"
              >
                {industries.filter((i) => i.enabled).map((i) => (
                  <option key={i.id} value={i.name}>
                    {i.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sub-Industry">
              <input
                value={form.subIndustry}
                onChange={(e) => setForm({ ...form, subIndustry: e.target.value })}
                placeholder="e.g. Enterprise Cloud"
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Company Email *" error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="payroll@company.in"
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Company Phone">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 80 4000 1000"
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Website">
              <input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://company.in"
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Brand Badge Initials & Color">
              <div className="flex gap-2">
                <input
                  maxLength={2}
                  value={form.logoInitials}
                  onChange={(e) => setForm({ ...form, logoInitials: e.target.value.toUpperCase() })}
                  placeholder="AF"
                  className="w-20 h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg uppercase"
                />
                <input
                  type="color"
                  value={form.logoColor}
                  onChange={(e) => setForm({ ...form, logoColor: e.target.value })}
                  className="h-9 w-12 rounded-lg border border-[#E2E8F0] p-0.5"
                />
              </div>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Company Description">
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Region">
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value as RegionCategory })}
                className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white"
              >
                <option value="India">India</option>
                <option value="Middle East">Middle East</option>
                <option value="APAC">APAC</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Country *" error={errors.country}>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="State / Province">
              <input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="City *" error={errors.city}>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="District">
              <input
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Postal Code">
              <input
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Registered Office Address *" error={errors.registeredAddress}>
                <textarea
                  rows={2}
                  value={form.registeredAddress}
                  onChange={(e) => setForm({ ...form, registeredAddress: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Billing Address (leave blank if same as registered)">
                <textarea
                  rows={2}
                  value={form.billingAddress}
                  onChange={(e) => setForm({ ...form, billingAddress: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Primary Contact Name *" error={errors.contactName}>
              <input
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Designation">
              <input
                value={form.contactDesignation}
                onChange={(e) => setForm({ ...form, contactDesignation: e.target.value })}
                placeholder="VP HR / Finance Controller"
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Email *" error={errors.contactEmail}>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Phone *" error={errors.contactPhone}>
              <input
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Alternate Contact">
              <input
                value={form.alternateContact}
                onChange={(e) => setForm({ ...form, alternateContact: e.target.value })}
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Size">
              <select
                value={form.companySize}
                onChange={(e) => setForm({ ...form, companySize: e.target.value as Company['companySize'] })}
                className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white"
              >
                <option value="1-50">1-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="501-2000">501-2000</option>
                <option value="2000+">2000+</option>
              </select>
            </Field>
            <Field label="Expected Employee Count">
              <input
                type="number"
                value={form.expectedEmployeeCount}
                onChange={(e) => setForm({ ...form, expectedEmployeeCount: Number(e.target.value) })}
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Number of Branches">
              <input
                type="number"
                value={form.branchCount}
                onChange={(e) => setForm({ ...form, branchCount: Number(e.target.value) })}
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Number of Locations">
              <input
                type="number"
                value={form.locationCount}
                onChange={(e) => setForm({ ...form, locationCount: Number(e.target.value) })}
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Financial Year">
              <select
                value={form.financialYear}
                onChange={(e) => setForm({ ...form, financialYear: e.target.value })}
                className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white"
              >
                <option value="Apr - Mar">Apr - Mar</option>
                <option value="Jan - Dec">Jan - Dec</option>
                <option value="Jul - Jun">Jul - Jun</option>
              </select>
            </Field>
            <Field label="Currency">
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value as Company['currency'] })}
                className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="AED">AED</option>
                <option value="SGD">SGD</option>
              </select>
            </Field>
            <Field label="Time Zone">
              <input
                value={form.timeZone}
                onChange={(e) => setForm({ ...form, timeZone: e.target.value })}
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
            <Field label="Primary Language">
              <input
                value={form.primaryLanguage}
                onChange={(e) => setForm({ ...form, primaryLanguage: e.target.value })}
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Select Subscription Plan">
                <select
                  value={form.subscriptionPlan}
                  onChange={(e) => {
                    const pName = e.target.value as PlanName;
                    const planObj = pricingPlans.find((p) => p.name === pName);
                    setForm({
                      ...form,
                      subscriptionPlan: pName,
                      employeeLimit: planObj?.employeeLimit || 1000,
                      enabledModules: planObj?.enabledModules || form.enabledModules,
                    });
                  }}
                  className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white"
                >
                  {pricingPlans.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Billing Cycle">
                <select
                  value={form.billingCycle}
                  onChange={(e) => setForm({ ...form, billingCycle: e.target.value as 'Monthly' | 'Annual' })}
                  className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual</option>
                </select>
              </Field>
              <Field label="Employee Seat Limit">
                <input
                  type="number"
                  value={form.employeeLimit}
                  onChange={(e) => setForm({ ...form, employeeLimit: Number(e.target.value) })}
                  className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </Field>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-2">
                Module Entitlements (Unified Payroll Engine Policies)
              </label>
              <MultiSelect
                options={ALL_MODULES}
                selected={form.enabledModules}
                onChange={(next) => setForm({ ...form, enabledModules: next })}
                columns={3}
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <FileUpload
              label="Required KYC & Registration Documents"
              files={form.docNames}
              onChange={(files) => setForm({ ...form, docNames: files })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Verification Status">
                <select
                  value={form.verificationStatus}
                  onChange={(e) =>
                    setForm({ ...form, verificationStatus: e.target.value as Company['verificationStatus'] })
                  }
                  className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white"
                >
                  <option value="Verified">Verified</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Incomplete">Incomplete</option>
                </select>
              </Field>
            </div>
            <Field label="Internal Compliance Notes">
              <textarea
                rows={3}
                value={form.internalNotes}
                onChange={(e) => setForm({ ...form, internalNotes: e.target.value })}
                placeholder="Notes visible only to PayFuse platform administrators..."
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
              />
            </Field>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="pt-4 border-t border-[#E8EBF4] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="h-9 px-3.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#0F172A] hover:bg-slate-50 inline-flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
            {!isEdit && (
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="h-9 px-3.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
              >
                Save as Draft
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="h-9 px-4 bg-[#7050F5] hover:bg-[#5E3DE6] text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                className="h-9 px-5 bg-[#7050F5] hover:bg-[#5E3DE6] text-white rounded-lg text-sm font-medium"
              >
                {isEdit ? 'Save Company Changes' : 'Create Company'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({
  label,
  error,
  children,
}) => (
  <div>
    <label className="block text-xs font-semibold text-[#0F172A] mb-1">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
  </div>
);
