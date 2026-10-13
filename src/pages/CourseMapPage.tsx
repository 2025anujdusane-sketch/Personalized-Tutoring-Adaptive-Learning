import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import {
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, Badge } from '../components/ui/Card';
import { PREREQUISITE_EDGES } from '../data/mockData';
import { getMasteryColor } from '../components/charts/Charts';

interface NodePos {
  id: string;
  x: number;
  y: number;
  label: string;
}

const GRAPH_NODES: NodePos[] = [
  { id: 'Arrays', x: 120, y: 120, label: 'Arrays' },
  { id: 'Linked Lists', x: 120, y: 260, label: 'Linked Lists' },
  { id: 'Recursion', x: 120, y: 400, label: 'Recursion' },
  { id: 'Binary Search', x: 340, y: 70, label: 'Binary Search' },
  { id: 'Sorting', x: 340, y: 170, label: 'Sorting' },
  { id: 'Hashing', x: 340, y: 270, label: 'Hashing' },
  { id: 'Trees', x: 340, y: 400, label: 'Trees' },
  { id: 'Graphs', x: 560, y: 350, label: 'Graphs' },
  { id: 'Dynamic Programming', x: 560, y: 470, label: 'Dynamic Programming' },
];

export const CourseMapPage: React.FC = () => {
  const navigate = useNavigate();
  const { masteries } = useApp();

  const [selectedTopic, setSelectedTopic] = useState<string>('Trees');
  const [showOnlyWeak, setShowOnlyWeak] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const selectedMastery = masteries[selectedTopic] || {
    topic: selectedTopic,
    mastery: 0.5,
    lastPracticed: 'Recently',
    attemptsCount: 10,
    prerequisites: [],
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-main">
            Course Concept Flow Map
          </h1>
          <p className="text-xs text-muted mt-1">
            Topological prerequisite dependency graph showing Bayesian mastery states.
          </p>
        </div>

        {/* Graph Controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted cursor-pointer hover:text-main">
            <input
              type="checkbox"
              checked={showOnlyWeak}
              onChange={(e) => setShowOnlyWeak(e.target.checked)}
              className="rounded text-attention focus:ring-attention"
            />
            <span className="font-medium">Filter weak topics only (&lt; 50%)</span>
          </label>

          <div className="flex items-center border border-border rounded-lg bg-card">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-1.5 text-muted hover:text-main cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[10px] font-mono text-muted">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 text-muted hover:text-main cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Stage + Topic Details Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: SVG Concept Stage */}
        <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col justify-between min-h-[560px]">
          {/* Top Stage Header / Legend */}
          <div className="flex items-center justify-between text-xs text-muted pb-3 border-b border-border/60 font-mono">
            <span>Data Structures & Algorithms Concept Network</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-attention" />
                <span>Weak (&lt;45%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-surface border border-border" />
                <span>Mid</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                <span>Mastered (&gt;70%)</span>
              </span>
            </div>
          </div>

          {/* SVG Graph Canvas */}
          <div className="flex-1 flex items-center justify-center overflow-auto py-4">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 150ms ease-out',
              }}
            >
              <svg width="720" height="540" viewBox="0 0 720 540" className="select-none">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="7"
                    markerHeight="7"
                    refX="26"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 7 3.5, 0 7" fill="var(--border)" />
                  </marker>
                  <marker
                    id="arrowhead-active"
                    markerWidth="7"
                    markerHeight="7"
                    refX="26"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 7 3.5, 0 7" fill="var(--attention)" />
                  </marker>
                </defs>

                {/* Prerequisite Edges */}
                {PREREQUISITE_EDGES.map((edge) => {
                  const fromNode = GRAPH_NODES.find((n) => n.id === edge.from);
                  const toNode = GRAPH_NODES.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const isEdgeActive =
                    (fromNode.id === selectedTopic || toNode.id === selectedTopic);
                  const isPrereqRisk =
                    (masteries[fromNode.id]?.mastery || 0) < 0.5 &&
                    (masteries[toNode.id]?.mastery || 0) < 0.5;

                  return (
                    <g key={`${edge.from}-${edge.to}`}>
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke={isPrereqRisk ? 'var(--attention)' : isEdgeActive ? 'var(--accent)' : 'var(--border)'}
                        strokeWidth={isEdgeActive ? 2.5 : 1.5}
                        strokeDasharray={isPrereqRisk ? '4 4' : 'none'}
                        markerEnd={isPrereqRisk ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                      />
                    </g>
                  );
                })}

                {/* Nodes */}
                {GRAPH_NODES.map((node) => {
                  const m = masteries[node.id]?.mastery || 0.5;
                  const isSelected = selectedTopic === node.id;
                  const isWeak = m < 0.45;

                  if (showOnlyWeak && !isWeak) return null;

                  const color = getMasteryColor(m);

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => setSelectedTopic(node.id)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse ring for weak node */}
                      {isWeak && (
                        <circle
                          r="36"
                          fill="var(--attention)"
                          fillOpacity="0.12"
                          className="animate-pulse"
                        />
                      )}

                      {/* Main node circle */}
                      <circle
                        r="30"
                        fill="var(--card)"
                        stroke={isSelected ? 'var(--text)' : color}
                        strokeWidth={isSelected ? 3 : 2}
                        className="transition-all duration-150 group-hover:scale-105"
                      />

                      {/* Inner fill tint */}
                      <circle
                        r="24"
                        fill={color}
                        fillOpacity="0.15"
                      />

                      {/* Node Text Label */}
                      <text
                        textAnchor="middle"
                        dy="-2"
                        fill="var(--text)"
                        fontSize="11"
                        fontWeight="600"
                        className="pointer-events-none"
                      >
                        {node.label}
                      </text>

                      {/* Percentage badge */}
                      <text
                        textAnchor="middle"
                        dy="14"
                        fill={color}
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                        className="pointer-events-none"
                      >
                        {Math.round(m * 100)}%
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="text-[11px] text-muted text-center pt-2 border-t border-border/60">
            Click any concept node to inspect prerequisites, citations, and adaptive practice drills.
          </div>
        </div>

        {/* Right: Selected Node Detail Deck */}
        <div className="lg:col-span-4 space-y-4">
          <Card variant="default" className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted font-mono">
                  Concept Node Details
                </span>
                <h2 className="text-lg font-serif font-bold text-main mt-0.5">
                  {selectedTopic}
                </h2>
              </div>
              <Badge
                variant={selectedMastery.mastery < 0.45 ? 'attention' : 'accent'}
                size="sm"
              >
                {selectedMastery.mastery < 0.45 ? 'Needs Revision' : 'Solid Standing'}
              </Badge>
            </div>

            {/* Metrics Mini-strip */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-surface rounded-xl border border-border">
                <span className="text-muted block text-[10px] uppercase font-mono">
                  Mastery
                </span>
                <span className="text-xl font-bold font-mono text-main">
                  {Math.round(selectedMastery.mastery * 100)}%
                </span>
              </div>
              <div className="p-3 bg-surface rounded-xl border border-border">
                <span className="text-muted block text-[10px] uppercase font-mono">
                  Last Practiced
                </span>
                <span className="text-sm font-semibold text-main">
                  {selectedMastery.lastPracticed}
                </span>
              </div>
            </div>

            {/* Prerequisite Edges Section */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Prerequisite Invariants
              </span>
              {selectedMastery.prerequisites.length === 0 ? (
                <p className="text-xs text-muted">
                  Foundational topic with zero prerequisite dependencies in this syllabus.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedMastery.prerequisites.map((p) => {
                    const pMastery = masteries[p]?.mastery || 0.5;
                    const isPRisk = pMastery < 0.5;

                    return (
                      <div
                        key={p}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          isPRisk ? 'bg-attention/10 border-attention/30' : 'bg-surface border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-main">{p}</span>
                          <span className="font-mono text-muted">
                            Mastery: {Math.round(pMastery * 100)}%
                          </span>
                        </div>
                        {isPRisk && (
                          <p className="text-[11px] text-attention flex items-start gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>
                              Root cause: Low prerequisite mastery throttles your progress on {selectedTopic}.
                            </span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => navigate(`/app/quiz?topics=${selectedTopic}`)}
              >
                Practise {selectedTopic} Assessment
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => navigate(`/app/tutor?q=explain%20${encodeURIComponent(selectedTopic)}`)}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ask Tutor About It
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
