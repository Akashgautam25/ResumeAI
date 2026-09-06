import React from 'react';

export interface ScoreGaugeProps {
  score: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showStatus?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  label = 'ATS Score',
  sublabel = 'out of 100',
  showStatus = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  let colorClass = 'stroke-zinc-900';
  let badgeColor = 'bg-zinc-100 text-zinc-800 border-zinc-200';
  let statusText = 'Excellent';

  if (score >= 85) {
    colorClass = 'stroke-emerald-600';
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    statusText = 'Strong ATS Ready';
  } else if (score >= 70) {
    colorClass = 'stroke-zinc-900';
    badgeColor = 'bg-zinc-100 text-zinc-800 border-zinc-200';
    statusText = 'Competitive';
  } else if (score >= 50) {
    colorClass = 'stroke-amber-500';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    statusText = 'Needs Optimization';
  } else {
    colorClass = 'stroke-rose-500';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    statusText = 'Critical Shortcomings';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-zinc-100"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center score display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold tracking-tight text-zinc-950">
            {score}
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-600">
            {label}
          </span>
        </div>
      </div>

      {showStatus && (
        <div className="mt-3 flex flex-col items-center gap-1">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
            {statusText}
          </span>
          {sublabel && <span className="text-[11px] text-zinc-600">{sublabel}</span>}
        </div>
      )}
    </div>
  );
};
