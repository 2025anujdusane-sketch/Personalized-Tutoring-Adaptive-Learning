import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import {
  FileText,
  Presentation,
  Video,
  UploadCloud,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, Badge, Modal, Input } from '../components/ui/Card';
import { SourceDocument } from '../types';

export const LibraryPage: React.FC = () => {
  const { sources, addSource, deleteSource, showToast } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  // Upload Simulation Modal State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<string>('');

  const stages = [
    'Uploading raw file...',
    'Extracting multimodal text & OCR...',
    'Describing visual diagrams & charts...',
    'Building concept graph embeddings...',
    'Indexing coordinate locations...',
    'Ready for grounded citation!',
  ];

  const handleStartUpload = (file: { name: string; size: number }) => {
    setUploadFileName(file.name);
    setIsUploading(true);
    setUploadProgress(10);
    setProcessingStage(stages[0]);

    // Progressive stage simulation
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 1;
      if (currentStep < stages.length) {
        setProcessingStage(stages[currentStep]);
        setUploadProgress(Math.min(95, currentStep * 20));
      } else {
        clearInterval(interval);
        setUploadProgress(100);

        const ext = file.name.split('.').pop()?.toLowerCase();
        const docType = ext === 'pptx' ? 'pptx' : ext === 'mp4' ? 'video' : 'pdf';

        const newDoc: SourceDocument = {
          id: `src-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          type: docType,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          unitCount: docType === 'video' ? 38 : docType === 'pptx' ? 32 : 64,
          unitType: docType === 'video' ? 'minutes' : docType === 'pptx' ? 'slides' : 'pages',
          topics: ['Trees', 'Recursion', 'Sorting'],
          uploadDate: 'Just now',
          status: 'ready',
          description: 'Uploaded course material parsed into granular coordinate units with verified vector indexing.',
          content: {
            units: [
              {
                number: 1,
                label: docType === 'video' ? '00:00' : 'Unit 1',
                title: 'Section 1: Core Definitions',
                text: 'Extracted content from student uploaded material. Fully indexed for vector citations and grounded QA verification.',
                topics: ['Trees', 'Recursion'],
              },
            ],
          },
        };

        addSource(newDoc);
        showToast(`Successfully indexed ${file.name}`, 'success');
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 600);
      }
    }, 600);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      handleStartUpload({ name: f.name, size: f.size });
    }
  };

  // Filter sources
  const filteredSources = sources.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesTopic = selectedTopic === 'all' || doc.topics.includes(selectedTopic);

    return matchesSearch && matchesType && matchesTopic;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-main">
            Source Knowledge Base
          </h1>
          <p className="text-xs text-muted mt-1">
            Ingest university textbooks, lecture slide decks, and class recordings.
          </p>
        </div>

        <div className="text-xs font-mono text-muted flex items-center gap-2">
          <span>{sources.length} active documents</span>
          <span>·</span>
          <span className="text-accent font-semibold">100% Vector Indexed</span>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-border hover:border-accent/60 rounded-2xl p-8 bg-card/60 transition-colors text-center flex flex-col items-center justify-center space-y-3 cursor-pointer group"
        onClick={() => {
          // Trigger file input or simulate demo upload
          handleStartUpload({ name: 'CS201_Exam_Reference_Guide.pdf', size: 10485760 });
        }}
      >
        <div className="w-12 h-12 rounded-xl bg-accent-subtle text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm font-semibold text-main">
            Click to upload or drag and drop files here
          </div>
          <p className="text-xs text-muted mt-1">
            Accepts <strong className="text-main">PDF textbooks</strong>, <strong className="text-main">PPTX slide decks</strong>, and <strong className="text-main">MP4 lectures</strong> with SRT captions.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-[11px] text-muted font-mono">
          <Sparkles className="w-3 h-3 text-accent" />
          <span>Click to simulate processing sample PDF</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents or topics..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-card border border-border rounded-lg text-main placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Format selector */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs bg-card border border-border rounded-lg text-main focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="all">All Formats</option>
            <option value="pdf">PDF Textbooks</option>
            <option value="pptx">PowerPoint Slides</option>
            <option value="video">Lecture Videos</option>
          </select>

          {/* Topic selector */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-2 text-xs bg-card border border-border rounded-lg text-main focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="all">All Topics</option>
            <option value="Trees">Trees</option>
            <option value="Recursion">Recursion</option>
            <option value="Binary Search">Binary Search</option>
            <option value="Graphs">Graphs</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
          </select>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSources.map((doc) => {
          const isPdf = doc.type === 'pdf';
          const isPptx = doc.type === 'pptx';
          const isVideo = doc.type === 'video';

          return (
            <Card key={doc.id} variant="default" className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Header tag */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-accent-subtle text-accent">
                      {isPdf && <FileText className="w-4 h-4" />}
                      {isPptx && <Presentation className="w-4 h-4" />}
                      {isVideo && <Video className="w-4 h-4" />}
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-muted">
                        {doc.type.toUpperCase()} · {doc.fileSize}
                      </span>
                      <div className="text-xs text-muted">
                        {doc.unitCount} {doc.unitType}
                      </div>
                    </div>
                  </div>

                  <Badge variant="accent" size="sm">
                    {doc.status === 'indexed' ? 'Indexed' : 'Ready'}
                  </Badge>
                </div>

                {/* Title & Description */}
                <div>
                  <h2 className="text-sm font-semibold text-main line-clamp-1">{doc.title}</h2>
                  <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                {/* Detected topics */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {doc.topics.map((topic) => (
                    <span
                      key={topic}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-muted border border-border"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted font-mono">{doc.uploadDate}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      deleteSource(doc.id);
                      showToast(`Removed ${doc.title}`, 'info');
                    }}
                    className="p-1.5 rounded text-muted hover:text-attention hover:bg-attention/10 cursor-pointer"
                    aria-label="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/app/library/${doc.id}`)}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open Viewer
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredSources.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-2">
          <p className="text-sm text-main font-semibold">No matching source documents found</p>
          <p className="text-xs text-muted">Try clearing your search query or format filter.</p>
        </div>
      )}

      {/* Upload Processing Modal */}
      <Modal
        isOpen={isUploading}
        onClose={() => {}}
        title="Multimodal Ingestion Pipeline"
        description={`Processing ${uploadFileName}`}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-main">{processingStage}</span>
              <span className="font-mono text-accent">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-surface h-2.5 rounded-full overflow-hidden border border-border/40">
              <div
                className="bg-accent h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2 text-xs text-muted">
            <div className="font-semibold text-main text-[11px] uppercase tracking-wider">
              Pipeline Operations:
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-accent">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Text OCR & Mathematical Notation Parser</span>
              </div>
              <div className="flex items-center gap-2 text-accent">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Diagram & Architectural Figure Extractor</span>
              </div>
              <div className="flex items-center gap-2 text-accent">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Coordinate Invariant Anchor Generation</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
