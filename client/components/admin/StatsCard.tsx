'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'yellow';
  change?: string;
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-900',
  green: 'bg-green-100 text-green-900',
  red: 'bg-red-100 text-red-900',
  yellow: 'bg-yellow-100 text-yellow-900',
};

export default function StatsCard({ title, value, icon: Icon, color = 'blue', change }: StatsCardProps) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-stone-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">{value}</p>
          {change && (
            <p className="mt-1 text-xs text-stone-500">{change}</p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
