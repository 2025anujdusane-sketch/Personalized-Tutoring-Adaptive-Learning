import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import {
  Layers,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, Badge, ProgressBar } from '../components/ui/Card';
import { CitationChip } from '../components/tutor/CitationChip';

export const RevisionPage: React.FC = () => {
  const navigate = useNavigate();
  const { flashcards, updateFlashcardState, showToast } = useApp();

  const [activeDeckFilter, setActiveDeckFilter] = useState<'all' | 'weak'>('weak');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const displayedCards = activeDeckFilter === 'weak'
    ? flashcards.filter((fc) => fc.topic === 'Recursion' || fc.topic === 'Trees' || fc.topic === 'Dynamic Programming')
    : flashcards;

  const currentCard = displayedCards[currentCardIndex] || displayedCards[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((idx) => (idx + 1) % displayedCards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((idx) => (idx - 1 + displayedCards.length) % displayedCards.length);
  };

  const handleMarkMastered = () => {
    if (!currentCard) return;
    updateFlashcardState(currentCard.id, 'mastered');
    showToast('Card marked as Mastered!', 'success');
    handleNextCard();
  };

  const handleMarkReviewAgain = () => {
    if (!currentCard) return;
    updateFlashcardState(currentCard.id, 'reviewing');
    showToast('Scheduled for spaced retrieval', 'attention');
    handleNextCard();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-main">
            Targeted Revision Pack
          </h1>
          <p className="text-xs text-muted mt-1">
            Auto-generated flashcards with source citations focused on weak prerequisite topics.
          </p>
        </div>

        {/* Deck filter tabs */}
        <div className="p-1 bg-surface border border-border rounded-xl inline-flex text-xs">
          <button
            onClick={() => {
              setActiveDeckFilter('weak');
              setCurrentCardIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              activeDeckFilter === 'weak'
                ? 'bg-card text-attention font-semibold shadow-xs'
                : 'text-muted hover:text-main'
            }`}
          >
            Weak Topics (Trees, DP, Recursion)
          </button>
          <button
            onClick={() => {
              setActiveDeckFilter('all');
              setCurrentCardIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              activeDeckFilter === 'all'
                ? 'bg-card text-main font-semibold shadow-xs'
                : 'text-muted hover:text-main'
            }`}
          >
            All Decks ({flashcards.length})
          </button>
        </div>
      </div>

      {/* Flashcard Active Stage */}
      {currentCard && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              Card {currentCardIndex + 1} of {displayedCards.length}
            </span>
            <span className="font-mono">
              Status: <strong className="text-main capitalize">{currentCard.state}</strong>
            </span>
          </div>

          <ProgressBar
            value={currentCardIndex + 1}
            max={displayedCards.length}
            size="sm"
            color="accent"
          />

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[320px] sm:min-h-[360px] bg-card border-2 border-border hover:border-accent/40 rounded-2xl p-8 sm:p-12 shadow-sm cursor-pointer select-none transition-all flex flex-col justify-between group relative"
          >
            {/* Top Bar of Card */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Badge variant="accent" size="sm">
                  {currentCard.topic}
                </Badge>
                <span className="text-[11px] font-mono text-muted uppercase">
                  {currentCard.difficulty}
                </span>
              </div>

              <span className="text-xs text-muted flex items-center gap-1 font-mono">
                <RotateCw className="w-3.5 h-3.5 text-accent group-hover:rotate-180 transition-transform duration-300" />
                <span>Click anywhere to flip</span>
              </span>
            </div>

            {/* Front Prompt vs Back Answer */}
            <div className="my-auto py-6">
              {!isFlipped ? (
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted font-mono block">
                    Concept Prompt
                  </span>
                  <p className="text-lg sm:text-xl font-medium text-main leading-relaxed font-serif">
                    {currentCard.question}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent font-mono block">
                    Verified Syllabus Key
                  </span>
                  <div className="text-sm sm:text-base text-main leading-relaxed whitespace-pre-line font-sans">
                    {currentCard.answer}
                  </div>

                  {/* Back Citation Chip */}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted font-mono">Verified in:</span>
                    <CitationChip citation={currentCard.citation} />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Card Footer */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted">
              <span>{isFlipped ? 'Showing Back (Solution)' : 'Showing Front (Prompt)'}</span>
              <span className="font-mono text-[10px]">StudySphere AI Spaced Review</span>
            </div>
          </div>

          {/* Action Buttons for Flashcard */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevCard}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Card
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={handleMarkReviewAgain}
              >
                <AlertTriangle className="w-4 h-4 text-attention" />
                Review Again
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleMarkMastered}
              >
                <CheckCircle2 className="w-4 h-4" />
                Got It (Mastered)
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextCard}
            >
              Next Card
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Spaced Revision Queue List */}
      <Card variant="default" className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Active Deck Catalog
            </span>
            <h3 className="text-sm font-semibold text-main">Spaced Retrieval Queue</h3>
          </div>
          <span className="text-xs font-mono text-muted">{displayedCards.length} cards scheduled</span>
        </div>

        <div className="space-y-2">
          {displayedCards.map((card, idx) => (
            <div
              key={card.id}
              onClick={() => {
                setCurrentCardIndex(idx);
                setIsFlipped(false);
              }}
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                currentCardIndex === idx
                  ? 'bg-accent-subtle border-accent/40 text-main font-medium shadow-xs'
                  : 'bg-surface border-border text-muted hover:text-main'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 h-5 rounded-full bg-card border border-border text-[10px] font-mono flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span className="font-semibold text-main shrink-0">{card.topic}</span>
                <span className="truncate text-muted">{card.question}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant={card.state === 'mastered' ? 'accent' : 'attention'}
                  size="sm"
                  className="capitalize font-mono"
                >
                  {card.state}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
