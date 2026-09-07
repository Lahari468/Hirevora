import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumb, actions }: PageHeaderProps): JSX.Element {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumb && <p className="text-xs font-medium text-navy-400">{breadcrumb}</p>}
        <h1 className="mt-0.5 text-2xl font-semibold text-navy-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-navy-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
