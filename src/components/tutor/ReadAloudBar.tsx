import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

interface ReadAloudBarProps {
  text: string;
  className?: string;
}

export const ReadAloudBar: React.FC<ReadAloudBarProps> = ({ text, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanText = (raw: string) => {
    return raw.replace(/\[\d+\]/g, '').replace(/[#*`_~]/g, '').trim();
  };

  const handlePlay = async () => {
    if (isPaused && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    try {
      // Try Web Speech API first
      if ('speechSynthesis' in window && !audioRef.current) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText(text));
        utterance.rate = rate;
        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
        utterance.onerror = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        setIsPaused(false);
        return;
      }

      // Backend fallback via api.speakText
      const blob = await api.speakText(cleanText(text));
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.playbackRate = rate;
      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      audio.play();
      setIsPlaying(true);
      setIsPaused(false);
    } catch (e) {
      console.warn('Speech playback failed:', e);
      setIsPlaying(false);
    }
  };

  const handlePause = () => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    } else if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      handleStop();
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 p-1 rounded-lg bg-surface/70 border border-border/60 text-xs ${className}`}>
      <span className="p-1 text-muted">
        <Volume2 className="w-3.5 h-3.5 text-accent" />
      </span>

      {!isPlaying ? (
        <Button variant="ghost" size="sm" onClick={handlePlay} className="h-6 px-2 text-[11px] gap-1">
          <Play className="w-3 h-3" />
          <span>Read Aloud</span>
        </Button>
      ) : (
        <>
          <Button variant="ghost" size="sm" onClick={handlePause} className="h-6 px-1.5 text-[11px]">
            <Pause className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleStop} className="h-6 px-1.5 text-[11px]">
            <Square className="w-3 h-3" />
          </Button>
        </>
      )}

      {/* Rate Toggle */}
      <div className="flex items-center gap-0.5 ml-1 border-l border-border/50 pl-1">
        {[0.8, 1.0, 1.2].map((r) => (
          <button
            key={r}
            onClick={() => handleRateChange(r)}
            className={`px-1 py-0.5 text-[9px] font-mono rounded ${
              rate === r ? 'bg-accent text-white font-bold' : 'text-muted hover:text-main'
            }`}
          >
            {r}x
          </button>
        ))}
      </div>
    </div>
  );
};
