import React from 'react';
import { BreadcrumbItem, Breadcrumbs } from './Breadcrumbs';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  badge,
}) => {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-1.5">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-[24px] sm:text-[26px] font-bold text-[#0F172A] tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">{actions}</div>
      )}
    </div>
  );
};
