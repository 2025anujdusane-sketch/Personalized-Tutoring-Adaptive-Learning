import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Radio,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, Badge } from '../ui/Card';
import { CitationChip } from './CitationChip';
import { Citation } from '../../types';
import { api, API_BASE_URL } from '../../services/api';
import { useApp } from '../../store/AppContext';

interface VoiceTutorProps {
  isOpen: boolean;
  onClose: () => void;
  topicScope?: string;
  language?: 'en' | 'hi';
}

export const VoiceTutor: React.FC<VoiceTutorProps> = ({
  isOpen,
  onClose,
  topicScope,
  language = 'en',
}) => {
  const { openSourceDrawer, showToast } = useApp();

  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'error'>('idle');
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [groundingStatus, setGroundingStatus] = useState<string>('backed');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [voices, setVoices] = useState<{ id: string; name: string; language: string }[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('en-US-JennyNeural');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load voices
    api.getVoices().then((v) => {
      if (v && v.length > 0) {
        setVoices(v);
        setSelectedVoice(v[0].id);
      }
    }).catch(() => {});
  }, []);

  const startRecording = async () => {
    setPermissionError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await processVoiceInput(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus('listening');
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setPermissionError('Microphone access was denied. Please allow microphone permissions in your browser.');
      setStatus('error');
      showToast('Microphone access denied', 'attention');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('thinking');
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      setStatus('thinking');
      const result = await api.sendVoiceTurn(audioBlob, undefined, language);

      setTranscript(result.transcript);
      setAnswer(result.answer);
      setCitations(result.citations || []);
      setGroundingStatus(result.grounding_status);

      if (result.audio_url) {
        const fullAudioUrl = result.audio_url.startsWith('http')
          ? result.audio_url
          : `${API_BASE_URL}${result.audio_url}`;
        setAudioUrl(fullAudioUrl);

        // Auto play speech
        const audio = new Audio(fullAudioUrl);
        audioElementRef.current = audio;
        audio.playbackRate = playbackSpeed;

        audio.onplay = () => {
          setIsPlayingAudio(true);
          setStatus('speaking');
        };
        audio.onended = () => {
          setIsPlayingAudio(false);
          setStatus('idle');
        };
        audio.onerror = () => {
          setIsPlayingAudio(false);
          setStatus('idle');
        };

        try {
          await audio.play();
        } catch (e) {
          console.warn('Auto-play blocked by browser, user can click play button:', e);
          setStatus('idle');
        }
      } else {
        setStatus('idle');
      }
    } catch (error) {
      console.error('Error during voice turn:', error);
      setStatus('error');
      showToast('Voice processing error. Please try again.', 'attention');
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioElementRef.current && audioUrl) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.playbackRate = playbackSpeed;
      audioElementRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (audioElementRef.current) {
      if (isPlayingAudio) {
        audioElementRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioElementRef.current.playbackRate = playbackSpeed;
        audioElementRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = speed;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card
        variant="default"
        className="w-full max-w-lg shadow-2xl border-border bg-card relative overflow-hidden space-y-6 p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-accent-subtle text-accent">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-main">StudySphere Voice Assistant</h2>
              <p className="text-[11px] text-muted">Source-grounded spoken explanations</p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-7 w-7">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Permission Error State */}
        {permissionError && (
          <div className="p-3 rounded-lg bg-attention/10 border border-attention/30 text-xs text-attention flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Microphone Permission Required</p>
              <p className="mt-0.5">{permissionError}</p>
            </div>
          </div>
        )}

        {/* Central Audio Visualizer & Push-to-Talk Mic */}
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="relative">
            {isRecording && (
              <span className="absolute -inset-4 rounded-full bg-accent/20 animate-ping" />
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                isRecording
                  ? 'bg-attention text-white ring-4 ring-attention/30 animate-pulse'
                  : 'bg-accent text-white hover:opacity-90'
              }`}
              title={isRecording ? 'Click to stop recording' : 'Click to speak'}
            >
              {isRecording ? <Mic className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
          </div>

          <div className="text-center space-y-1">
            <Badge
              variant={
                status === 'listening'
                  ? 'backed'
                  : status === 'thinking'
                  ? 'neutral'
                  : status === 'speaking'
                  ? 'backed'
                  : 'neutral'
              }
              size="sm"
            >
              {status === 'listening' && 'Listening... Click mic to finish'}
              {status === 'thinking' && 'Retrieving evidence & synthesizing...'}
              {status === 'speaking' && 'Speaking grounded answer'}
              {status === 'idle' && 'Push mic to speak a question'}
              {status === 'error' && 'Error'}
            </Badge>
          </div>
        </div>

        {/* Transcript & Answer Bubble */}
        {(transcript || answer) && (
          <div className="space-y-3 max-h-60 overflow-y-auto p-3 rounded-xl bg-surface/50 border border-border/70 text-xs">
            {transcript && (
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted font-mono">
                  You Said:
                </span>
                <p className="text-main font-medium mt-0.5">{transcript}</p>
              </div>
            )}

            {answer && (
              <div className="pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent font-mono">
                    Grounded Answer:
                  </span>
                  <Badge variant={groundingStatus === 'backed' ? 'backed' : 'outside'} size="sm">
                    {groundingStatus === 'backed' ? 'Source Backed' : 'Outside Material'}
                  </Badge>
                </div>
                <p className="text-main mt-1 leading-relaxed">{answer}</p>

                {/* Citations */}
                {citations && citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-border/40">
                    {citations.map((c, idx) => (
                      <CitationChip
                        key={idx}
                        citation={c}
                        onClick={() => openSourceDrawer(c)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Audio Controls Footer */}
        {audioUrl && (
          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudioPlayback}
                className="gap-1.5"
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? 'Pause' : 'Replay'}</span>
              </Button>
            </div>

            {/* Playback Speed Controls */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted font-mono mr-1">Speed:</span>
              {[0.75, 1.0, 1.25, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => changeSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    playbackSpeed === s
                      ? 'bg-accent text-white font-bold'
                      : 'bg-surface text-muted hover:text-main'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
