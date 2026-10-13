import React from 'react';
import { TopicMastery } from '../../types';

// Interpolates smoothly between --attention and --accent
export const getMasteryColor = (mastery: number): string => {
  if (mastery < 0.45) return 'var(--attention)';
  if (mastery < 0.70) return 'var(--text-muted)';
  return 'var(--accent)';
};

export const MasteryRing: React.FC<{
  value: number; // 0.0 to 1.0
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}> = ({ value, size = 120, strokeWidth = 10, label, sublabel }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, value));
  const strokeDashoffset = circumference - clamped * circumference;

  const color = getMasteryColor(clamped);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--surface)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated value stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold font-mono tracking-tight text-main">
          {Math.round(clamped * 100)}%
        </span>
        {label && <span className="text-[10px] uppercase font-semibold text-muted tracking-wider">{label}</span>}
        {sublabel && <span className="text-[9px] text-muted">{sublabel}</span>}
      </div>
    </div>
  );
};

export const ScoreLineChart: React.FC<{
  scores: { quizTitle: string; score: number; date: string }[];
  height?: number;
}> = ({ scores, height = 180 }) => {
  if (scores.length === 0) return null;

  const max = 100;
  const paddingX = 40;
  const paddingY = 25;
  const width = 480;

  const points = scores.map((item, idx) => {
    const x = paddingX + (idx / Math.max(1, scores.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - (item.score / max) * (height - 2 * paddingY);
    return { ...item, x, y };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto text-muted font-mono text-[10px]"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = height - paddingY - (val / 100) * (height - 2 * paddingY);
          return (
            <g key={val}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="2 3"
                strokeWidth={1}
              />
              <text x={paddingX - 8} y={y + 3} textAnchor="end" fill="var(--text-muted)">
                {val}%
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        {points.length > 1 && (
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`}
            fill="var(--accent-subtle)"
            opacity={0.6}
          />
        )}

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points & Labels */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={4}
              fill="var(--card)"
              stroke="var(--accent)"
              strokeWidth={2}
            />
            <text
              x={pt.x}
              y={pt.y - 8}
              textAnchor="middle"
              fill="var(--text)"
              fontWeight="600"
            >
              {pt.score}%
            </text>
            <text
              x={pt.x}
              y={height - 6}
              textAnchor="middle"
              fill="var(--text-muted)"
            >
              {pt.date}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export const TopicMasteryRow: React.FC<{
  mastery: TopicMastery;
  onPractice?: (topic: string) => void;
}> = ({ mastery, onPractice }) => {
  const percentage = Math.round(mastery.mastery * 100);
  const color = getMasteryColor(mastery.mastery);

  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border/60 last:border-none">
      <div className="min-w-32 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-main">{mastery.topic}</span>
          {mastery.decayStatus === 'critical' && (
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase bg-attention/15 text-attention">
              Decay: Critical
            </span>
          )}
          {mastery.decayStatus === 'due' && (
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase bg-surface text-muted border border-border">
              Review Due
            </span>
          )}
        </div>
        <div className="text-xs text-muted mt-0.5">
          Practiced {mastery.lastPracticed} · {mastery.attemptsCount} attempts
        </div>
      </div>

      <div className="w-36 flex items-center gap-3">
        <div className="flex-1 bg-surface h-2 rounded-full overflow-hidden border border-border/40">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs font-mono font-semibold text-main w-9 text-right">
          {percentage}%
        </span>
      </div>

      {onPractice && (
        <button
          onClick={() => onPractice(mastery.topic)}
          className="text-xs text-accent hover:underline font-medium cursor-pointer"
        >
          Practice
        </button>
      )}
    </div>
  );
};
