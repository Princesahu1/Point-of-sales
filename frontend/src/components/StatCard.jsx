import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Dashboard stat card.
 *
 * Props:
 *   title    — string
 *   value    — string | number
 *   icon     — React element (Lucide icon)
 *   color    — 'blue' | 'green' | 'red' | 'purple' | 'amber'
 *   trend    — { value: number, direction: 'up' | 'down' } (optional)
 *   subtitle — string (optional)
 */

const colorMap = {
  blue:   { bg: 'bg-primary-600/20', icon: 'text-primary-400', border: 'border-primary-600/30' },
  green:  { bg: 'bg-emerald-600/20', icon: 'text-emerald-400', border: 'border-emerald-600/30' },
  red:    { bg: 'bg-red-600/20',     icon: 'text-red-400',     border: 'border-red-600/30' },
  purple: { bg: 'bg-purple-600/20',  icon: 'text-purple-400',  border: 'border-purple-600/30' },
  amber:  { bg: 'bg-amber-600/20',   icon: 'text-amber-400',   border: 'border-amber-600/30' },
};

export default function StatCard({ title, value, icon, color = 'blue', trend, subtitle }) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`stat-card border ${c.border} animate-fade-in`}>
      {/* Icon */}
      <div className={`stat-icon ${c.bg} ${c.icon} shrink-0`}>
        {icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-white truncate">{value}</p>

        {(trend || subtitle) && (
          <div className="flex items-center gap-2 mt-1.5">
            {trend && (
              <span className={`flex items-center gap-0.5 text-xs font-medium ${
                trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {trend.direction === 'up'
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />
                }
                {trend.value}%
              </span>
            )}
            {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
