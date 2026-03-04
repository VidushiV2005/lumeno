import { useRef, useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { clearUser } from "../features/userSlice";
import { signOut } from "firebase/auth";
import { auth } from "../features/firebase";
import { useNavigate } from "react-router-dom";
import {
  Upload, FileText, Brain, Sparkles, CheckCircle2, X,
  AlertCircle, Clock, BookOpen, Zap, ArrowRight, FilePlus2,
  ScanText, ListChecks, FlaskConical, ChevronRight, Loader2
} from "lucide-react";
import LiquidEther from "../components/LiquidEther";
import Sidebar from "../components/Sidebar";
import gsap from 'gsap';

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadStage = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  stage: UploadStage;
  pages?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Feature Chip ─────────────────────────────────────────────────────────────

interface FeatureChipProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  delay: number;
}

const FeatureChip = ({ icon: Icon, label, color, delay }: FeatureChipProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay }
      );
    }
  }, []);

  return (
    <div ref={ref} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08]">
      <div style={{ color }}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-xs text-gray-400 font-medium">{label}</span>
    </div>
  );
};

// ─── File Row ─────────────────────────────────────────────────────────────────

interface FileRowProps {
  file: UploadedFile;
  onRemove: (id: string) => void;
}

const stageConfig = {
  uploading:   { label: 'Uploading…',   color: '#a855f7', icon: Loader2    },
  processing:  { label: 'Analysing…',   color: '#ec4899', icon: Brain      },
  done:        { label: 'Ready',         color: '#10b981', icon: CheckCircle2 },
  error:       { label: 'Failed',        color: '#f43f5e', icon: AlertCircle },
  idle:        { label: 'Queued',        color: '#6b7280', icon: Clock      },
};

const FileRow = ({ file, onRemove }: FileRowProps) => {
  const cfg = stageConfig[file.stage];
  const IconComp = cfg.icon;
  const isSpinning = file.stage === 'uploading' || file.stage === 'processing';

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300">
      {/* File icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
        <FileText className="w-5 h-5 text-purple-300" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <IconComp
                className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`}
                style={{ color: cfg.color }}
              />
              <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
            </div>
            <button
              onClick={() => onRemove(file.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/10 transition-all duration-200"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${file.progress}%`,
              background: file.stage === 'done'
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : file.stage === 'error'
                  ? '#f43f5e'
                  : 'linear-gradient(90deg, #a855f7, #ec4899)',
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">{formatBytes(file.size)}</span>
          {file.pages && (
            <span className="text-xs text-gray-600">{file.pages} pages detected</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── What Happens Next card ───────────────────────────────────────────────────

interface StepCardProps {
  num: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color: string;
  delay: number;
}

const StepCard = ({ num, icon: Icon, title, desc, color, delay }: StepCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay }
      );
    }
  }, []);

  return (
    <div ref={ref} className="group flex items-start gap-4">
      <div className="relative flex-shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${color}18` }}
        >
          <div style={{ color }}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-black flex items-center justify-center text-[9px] font-bold"
          style={{ background: color, color: '#000' }}
        >
          {num}
        </div>
      </div>
      <div className="pt-1">
        <p className="text-sm font-semibold text-gray-200">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

// ─── Upload Page ──────────────────────────────────────────────────────────────

export default function UploadPage() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const dropRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // ── Entrance animation ──
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 }
      );
    }
    if (dropRef.current) {
      gsap.fromTo(dropRef.current,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out', delay: 0.25 }
      );
    }
  }, []);

  // ── Drag handlers ──
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!dropRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    processFiles(droppedFiles);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []).filter(f => f.type === 'application/pdf');
    processFiles(selected);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  // ── Fake upload + processing simulation ──
  const processFiles = (newFiles: File[]) => {
    const entries: UploadedFile[] = newFiles.map(f => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      progress: 0,
      stage: 'uploading' as UploadStage,
    }));

    setFiles(prev => [...entries, ...prev]);

    entries.forEach(entry => {
      // Simulate upload progress
      let progress = 0;
      const uploadInterval = setInterval(() => {
        progress += Math.random() * 18 + 8;
        if (progress >= 100) {
          progress = 100;
          clearInterval(uploadInterval);
          setFiles(prev => prev.map(f =>
            f.id === entry.id ? { ...f, progress: 100, stage: 'processing' } : f
          ));
          // Simulate AI processing
          setTimeout(() => {
            setFiles(prev => prev.map(f =>
              f.id === entry.id
                ? { ...f, stage: 'done', pages: Math.floor(Math.random() * 80 + 10) }
                : f
            ));
          }, 2200 + Math.random() * 1400);
        } else {
          setFiles(prev => prev.map(f =>
            f.id === entry.id ? { ...f, progress } : f
          ));
        }
      }, 180);
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());
    navigate("/login");
  };

  const doneFiles = files.filter(f => f.stage === 'done');

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <LiquidEther
          colors={['#ec4899', '#a855f7', '#3b82f6']}
          mouseForce={10}
          cursorSize={80}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.35}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.15}
          autoIntensity={1.2}
          takeoverDuration={0.4}
          autoResumeDelay={2500}
          autoRampDuration={1.0}
        />
      </div>
      <div className="fixed inset-0 z-[1] pointer-events-none bg-black/80" />
      <div className="fixed inset-0 z-[2] pointer-events-none bg-gradient-to-b from-black/50 via-black/10 to-black/50" />

      {/* Sidebar */}
      <Sidebar
        activePage="PDF Upload"
        user={{
          name: user.name ?? user.email ?? 'Student',
          email: user.email ?? '',
          photo: user.photo ?? null,
        }}
        onLogout={handleLogout}
        onNavigate={(route, _label) => navigate(route)}
      />

      {/* Main */}
      <div className="relative z-10 flex-1 ml-72 overflow-y-auto isolate">
        <div className="max-w-[1100px] mx-auto px-10 py-10 space-y-8">

          {/* ── Header ── */}
          <div ref={headerRef} className="pt-4 pb-2">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-xs font-medium tracking-widest uppercase text-purple-400/70">Upload</span>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-gray-600">PDF Analyser</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Upload your{' '}
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Study Materials
              </span>
            </h1>
            <p className="text-gray-500 mt-2 text-sm font-light leading-relaxed max-w-lg">
              Drop in any PDF — lecture notes, textbooks, research papers — and let our AI break it down into summaries, flashcards, and quizzes instantly.
            </p>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2.5 mt-5">
              <FeatureChip icon={ScanText}   label="Smart Summaries"    color="#a855f7" delay={0.35} />
              <FeatureChip icon={Brain}       label="Auto Flashcards"    color="#3b82f6" delay={0.42} />
              <FeatureChip icon={ListChecks}  label="AI Quiz Builder"    color="#10b981" delay={0.49} />
              <FeatureChip icon={FlaskConical} label="Deep Analysis"     color="#ec4899" delay={0.56} />
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* Drop Zone — 2 cols */}
            <div className="lg:col-span-2 space-y-4">

              {/* Drop area */}
              <div
                ref={dropRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-5 p-14 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-400 overflow-hidden select-none
                  ${isDragging
                    ? 'border-purple-500/60 bg-purple-500/[0.06]'
                    : 'border-white/[0.1] bg-white/[0.02] hover:border-purple-500/30 hover:bg-white/[0.04]'
                  }`}
              >
                {/* Animated glow when dragging */}
                {isDragging && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent animate-pulse rounded-2xl" />
                )}

                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-purple-500/30 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-purple-500/30 rounded-br-lg" />

                <div className="relative z-10 flex flex-col items-center gap-5 text-center">
                  {/* Upload icon */}
                  <div className={`relative transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-500/20 flex items-center justify-center">
                      <FilePlus2 className="w-9 h-9 text-purple-300" />
                    </div>
                    {isDragging && (
                      <div className="absolute inset-0 rounded-2xl bg-purple-500/20 animate-ping" />
                    )}
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-200">
                      {isDragging ? 'Release to upload' : 'Drag & drop your PDFs here'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">or click anywhere to browse files</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-px w-12 bg-white/10" />
                    <span className="text-xs text-gray-600">PDF files only · max 50 MB each</span>
                    <div className="h-px w-12 bg-white/10" />
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                    className="group/btn inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:scale-[1.02]"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Files
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                  </button>
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-semibold text-white">
                        Uploads
                        <span className="ml-2 text-xs font-normal text-gray-500">({files.length} file{files.length !== 1 ? 's' : ''})</span>
                      </h3>
                    </div>
                    {doneFiles.length > 0 && (
                      <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-medium">
                        View all results <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    {files.map(f => (
                      <FileRow key={f.id} file={f} onRemove={removeFile} />
                    ))}
                  </div>
                </div>
              )}

              {/* Done CTA */}
              {doneFiles.length > 0 && (
                <div className="relative overflow-hidden rounded-2xl p-6 flex items-center justify-between gap-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/15 to-teal-600/15" />
                  <div className="absolute inset-0 border border-emerald-500/20 rounded-2xl" />
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {doneFiles.length} file{doneFiles.length !== 1 ? 's' : ''} ready
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Your materials have been analysed. Explore the results below.</p>
                    </div>
                  </div>
                  <div className="relative z-10 flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate('/chat')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] text-sm text-gray-200 font-medium transition-all duration-300"
                    >
                      <Zap className="w-3.5 h-3.5 text-purple-400" />
                      Chat with AI
                    </button>
                    <button
                      onClick={() => navigate('/flashcards')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm text-white font-semibold transition-all duration-300 shadow-lg shadow-purple-600/20"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      Flashcards
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right panel — 1 col */}
            <div className="space-y-5">

              {/* What happens next */}
              <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-6">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h2 className="text-sm font-semibold text-white">What happens next?</h2>
                </div>
                <div className="space-y-5">
                  <StepCard num={1} icon={Upload}      title="Upload your PDF"    desc="Securely transfer your file to our servers."          color="#a855f7" delay={0.3} />
                  <StepCard num={2} icon={ScanText}    title="AI reads the file"  desc="Our model extracts and understands your content."     color="#ec4899" delay={0.4} />
                  <StepCard num={3} icon={Brain}       title="Content is analysed" desc="Summaries, key concepts, and flashcards are created."  color="#3b82f6" delay={0.5} />
                  <StepCard num={4} icon={ListChecks}  title="Results are ready"  desc="Chat, quiz, or review flashcards from your material."  color="#10b981" delay={0.6} />
                </div>
              </div>

              {/* Tips */}
              <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-4">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-semibold text-white">Tips for best results</h2>
                </div>
                <ul className="space-y-3">
                  {[
                    'Use text-based PDFs rather than scanned images',
                    'Structured documents like textbooks work best',
                    'Shorter chapters give more focused summaries',
                    'Upload multiple files to compare topics in chat',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-400 leading-relaxed">
                      <span className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-[9px] text-amber-400 font-bold">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: '2.4k+', label: 'PDFs processed', color: '#a855f7' },
                  { value: '98%',   label: 'Accuracy rate',  color: '#ec4899' },
                  { value: '<30s',  label: 'Avg. analysis',  color: '#3b82f6' },
                  { value: '50MB',  label: 'Max file size',  color: '#10b981' },
                ].map(({ value, label, color }) => (
                  <div key={label} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <p className="text-lg font-bold" style={{ color }}>{value}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}