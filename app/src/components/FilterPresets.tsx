'use client';

import { Droplets, Cake } from 'lucide-react';

export type FilterType = 'all' | 'needsWater' | 'upcomingBirthdays';

interface FilterPresetsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    needsWater: number;
    upcomingBirthdays: number;
  };
}

export default function FilterPresets({
  activeFilter,
  onFilterChange,
  counts,
}: FilterPresetsProps) {
  const filters: {
    type: FilterType;
    label: string;
    icon?: typeof Droplets;
    count?: number;
  }[] = [
    { type: 'all', label: 'All' },
    {
      type: 'needsWater',
      label: 'Needs Water',
      icon: Droplets,
      count: counts.needsWater,
    },
    {
      type: 'upcomingBirthdays',
      label: 'Birthdays',
      icon: Cake,
      count: counts.upcomingBirthdays,
    },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map(({ type, label, icon: Icon, count }) => {
        const isActive = activeFilter === type;
        const hasItems = count === undefined || count > 0;

        return (
          <button
            key={type}
            onClick={() => onFilterChange(type)}
            disabled={!hasItems && type !== 'all'}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              transition-all
              ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : hasItems
                  ? 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-300 hover:text-emerald-700'
                  : 'bg-stone-50 text-stone-400 border border-stone-100 cursor-not-allowed'
              }
            `}
          >
            {Icon && (
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? 'text-white'
                    : type === 'needsWater'
                    ? 'text-blue-500'
                    : 'text-amber-500'
                }`}
              />
            )}
            {label}
            {count !== undefined && (
              <span
                className={`
                  px-2 py-0.5 text-xs rounded-full
                  ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : hasItems
                      ? 'bg-stone-100 text-stone-500'
                      : 'bg-stone-100 text-stone-400'
                  }
                `}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
