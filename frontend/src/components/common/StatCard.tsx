import React from 'react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color?: 'amber' | 'emerald' | 'blue' | 'purple' | 'rose' | 'slate';
  badge?: string;
}

const colorMap = {
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconBg: 'bg-amber-500 text-white',
    text: 'text-amber-700',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-600 text-white',
    text: 'text-emerald-700',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-600 text-white',
    text: 'text-blue-700',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    iconBg: 'bg-purple-600 text-white',
    text: 'text-purple-700',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    iconBg: 'bg-rose-600 text-white',
    text: 'text-rose-700',
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    iconBg: 'bg-slate-700 text-white',
    text: 'text-slate-700',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'amber',
  badge,
}) => {
  const styles = colorMap[color];

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md bg-white',
        styles.border
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{value}</span>
            {badge && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          {trend && (
            <p className={clsx('mt-2 text-xs font-medium', styles.text)}>
              {trend}
            </p>
          )}
        </div>
        <div className={clsx('flex h-12 w-12 items-center justify-center rounded-xl shadow-inner', styles.iconBg)}>
          {icon}
        </div>
      </div>
    </div>
  );
};
