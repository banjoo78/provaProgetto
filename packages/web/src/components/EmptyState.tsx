import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="text-5xl mb-4" aria-hidden="true">
        {icon ?? '📍'}
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      {description && <p className="text-gray-600 max-w-md mb-6">{description}</p>}
      {action}
    </div>
  );
}
