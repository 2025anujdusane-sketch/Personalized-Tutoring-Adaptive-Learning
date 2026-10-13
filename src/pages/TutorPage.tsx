import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { api } from '../services/api';
import {
  Send,
  Sparkles,
  Languages,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  RotateCcw,
  AlertTriangle,
  FileText,
  Presentation,
  Video,
  CheckCircle2,
  Mic,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge, Card } from '../components/ui/Card';
import { CitationChip } from '../components/tutor/CitationChip';
import { VoiceTutor } from '../components/tutor/VoiceTutor';
import { ReadAloudBar } from '../components/tutor/ReadAloudBar';
import { ChatMessage, Citation } from '../types';
import { TOPICS } from '../data/mockData';

export const TutorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { chatMessages, addChatMessage, clearChatHistory, showToast, openSourceDrawer } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [topicScope, setTopicScope] = useState<string>('All Topics');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  // Support query param pre-population
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setInputQuery(q);
    }
  }, [searchParams]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    setInputQuery('');

    // Add user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    addChatMessage(userMsg);

    // Call API layer with delay
    setIsTyping(true);
    try {
      const response = await api.sendChatMessage({
        query,
        topicScope: topicScope === 'All Topics' ? undefined : topicScope,
        language,
      });

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
        grounding_status: response.grounding_status,
        outside_knowledge: response.outside_knowledge,
        topic: response.topic,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      addChatMessage(assistantMsg);
    } catch (err) {
      showToast('Error communicating with tutor service', 'attention');
    } finally {
      setIsTyping(false);
    }
  };

  const suggestionChips = [
    'Explain binary search',
    'Why does local BST validation fail',
    'Compare stack and queue',
    'What is the capital of France?',
  ];

  // Aggregate citations from current conversation
  const conversationCitations: Citation[] = [];
  chatMessages.forEach((msg) => {
    if (msg.citations) {
      msg.citations.forEach((c) => {
        if (!conversationCitations.some((existing) => existing.excerpt === c.excerpt)) {
          conversationCitations.push(c);
        }
      });
    }
  });

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-150">
      {/* Center Chat Area */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-border bg-surface/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-main flex items-center gap-2">
                <span>Grounded Course Tutor</span>
                <Badge variant="accent" size="sm">
                  Citations Active
                </Badge>
              </div>
              <p className="text-[10px] text-muted font-mono">
                Ingested: Textbook (p.1-142) · Slides (1-46) · Lectures (48m)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Scope to topic */}
            <select
              value={topicScope}
              onChange={(e) => setTopicScope(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-card border border-border text-main focus:ring-1 focus:ring-accent"
            >
              <option value="All Topics">Scope: All Topics</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  Scope: {t}
                </option>
              ))}
            </select>

            {/* Language toggle: English / Hindi */}
            <button
              onClick={() => {
                const next = language === 'en' ? 'hi' : 'en';
                setLanguage(next);
                showToast(next === 'hi' ? 'Switched to Hindi explanations' : 'Switched to English', 'info');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${
                language === 'hi'
                  ? 'bg-accent text-accent-fg border-accent'
                  : 'bg-card border-border text-muted hover:text-main'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'हिंदी (Hindi)' : 'English'}</span>
            </button>

            {/* Voice Assistant Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVoiceOpen(true)}
              className="gap-1.5 border-accent/40 text-accent hover:bg-accent-subtle"
              title="Open Voice Assistant"
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium text-xs">Voice Assistant</span>
            </Button>

            <button
              onClick={clearChatHistory}
              title="Clear chat history"
              className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-surface border border-border/60 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {chatMessages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-accent text-accent-fg flex items-center justify-center text-xs font-serif font-bold shrink-0 mt-0.5 shadow-xs">
                    S
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 space-y-3 ${
                    isUser
                      ? 'bg-accent text-accent-fg'
                      : msg.grounding_status === 'outside'
                      ? 'bg-surface border border-dashed border-border text-main'
                      : msg.grounding_status === 'partial'
                      ? 'bg-card border border-attention/30 text-main'
                      : 'bg-card border border-border text-main shadow-xs'
                  }`}
                >
                  {/* Status Badge for Assistant */}
                  {!isUser && (
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <div className="flex items-center gap-2">
                        {msg.grounding_status === 'backed' && (
                          <Badge variant="accent" size="sm">
                            ● Source-backed
                          </Badge>
                        )}
                        {msg.grounding_status === 'partial' && (
                          <Badge variant="attention" size="sm">
                            ▲ Partially supported
                          </Badge>
                        )}
                        {msg.grounding_status === 'outside' && (
                          <Badge variant="outside" size="sm">
                            ○ Outside your material (Refusal)
                          </Badge>
                        )}
                        {msg.topic && (
                          <span className="text-[10px] font-mono text-muted uppercase">
                            {msg.topic}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted font-mono">{msg.timestamp}</span>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="text-xs leading-relaxed space-y-2 whitespace-pre-line">
                    {msg.content}
                  </div>

                  {/* Outside Knowledge Separation */}
                  {msg.outside_knowledge && (
                    <div className="p-2.5 rounded-lg bg-surface border border-dashed border-border text-[11px] text-muted space-y-0.5">
                      <span className="font-semibold text-attention flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Not from your uploaded course material:
                      </span>
                      <p>{msg.outside_knowledge}</p>
                    </div>
                  )}

                  {/* Clickable Citations Row */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-border/50 space-y-1.5">
                      <span className="text-[10px] uppercase font-semibold text-muted font-mono block">
                        Verified Sources Cited:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((c, i) => (
                          <CitationChip key={i} citation={c} index={i} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Affordances for Assistant Message */}
                  {!isUser && (
                    <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
                      <div className="flex items-center gap-2">
                        <ReadAloudBar text={msg.content} />
                        <button
                          onClick={() => showToast('Feedback recorded: Helpful', 'success')}
                          className="hover:text-accent p-1 rounded hover:bg-surface cursor-pointer"
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => showToast('Feedback recorded: Needs improvement', 'info')}
                          className="hover:text-attention p-1 rounded hover:bg-surface cursor-pointer"
                          title="Not helpful"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (msg.topic) navigate(`/app/quiz?topics=${msg.topic}`);
                            else navigate('/app/quiz');
                          }}
                          className="hover:text-accent font-medium cursor-pointer"
                        >
                          Quiz me on this topic →
                        </button>
                        <span>·</span>
                        <button
                          onClick={() => handleSendMessage(`Can you explain ${msg.topic || 'this'} with a simpler real-world analogy?`)}
                          className="hover:text-accent font-medium cursor-pointer"
                        >
                          Explain simpler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-7 h-7 rounded-lg bg-accent text-accent-fg flex items-center justify-center text-xs font-serif font-bold shrink-0">
                S
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-card border border-border text-xs text-muted flex items-center gap-2">
                <span className="animate-spin w-3 h-3 border-2 border-accent border-t-transparent rounded-full" />
                <span>Checking course materials and verifying citations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips & Query Input */}
        <div className="p-4 border-t border-border bg-card space-y-3">
          {/* Quick chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-muted font-mono shrink-0">Try asking:</span>
            {suggestionChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleSendMessage(chip)}
                className="px-2.5 py-1 rounded-full bg-surface hover:bg-accent-subtle hover:text-accent border border-border text-muted whitespace-nowrap transition-colors cursor-pointer text-xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask any concept in your syllabus (e.g. 'How does postorder traversal work?')..."
              className="flex-1 px-4 py-2.5 text-xs bg-surface border border-border rounded-xl text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              disabled={isTyping}
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsVoiceOpen(true)}
              title="Voice Assistant"
              className="px-3 border-accent/40 text-accent hover:bg-accent-subtle"
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputQuery.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Tutor</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Right "Sources Used" Side Panel */}
      <div className="w-full lg:w-72 bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shrink-0 space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <BookOpen className="w-3.5 h-3.5 text-accent" />
              <span>Grounding Sources</span>
            </div>
            <span className="text-xs font-mono text-accent font-semibold">
              {conversationCitations.length} Cited
            </span>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Every citation below was verified by semantic similarity against your uploaded library files.
          </p>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {conversationCitations.length === 0 ? (
              <div className="p-4 rounded-xl bg-surface border border-dashed border-border text-center text-xs text-muted">
                No citations referenced in this conversation yet. Ask a question to see source links appear.
              </div>
            ) : (
              conversationCitations.map((c, i) => (
                <div
                  key={i}
                  onClick={() => openSourceDrawer(c)}
                  className="p-3 rounded-xl bg-surface border border-border hover:border-accent/40 text-left transition-all cursor-pointer space-y-1 group"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                    <span className="flex items-center gap-1 text-accent font-semibold">
                      {c.source_type === 'pdf' && <FileText className="w-3 h-3" />}
                      {c.source_type === 'pptx' && <Presentation className="w-3 h-3" />}
                      {c.source_type === 'video' && <Video className="w-3 h-3" />}
                      {c.source_type === 'pdf' && `Page ${c.page_number}`}
                      {c.source_type === 'pptx' && `Slide ${c.slide_number}`}
                      {c.source_type === 'video' && `${c.timestamp_label}`}
                    </span>
                    <span className="text-[10px]">[{i + 1}]</span>
                  </div>
                  <div className="text-xs font-semibold text-main line-clamp-1 group-hover:text-accent transition-colors">
                    {c.source_title}
                  </div>
                  <p className="text-[11px] text-muted italic line-clamp-2">
                    "{c.excerpt}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-border text-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => navigate('/app/library')}
          >
            Manage Knowledge Base →
          </Button>
        </div>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceTutor
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        topicScope={topicScope}
        language={language}
      />
    </div>
  );
};
