import { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { clearUser } from "../features/userSlice";
import { signOut } from "firebase/auth";
import { auth } from "../features/firebase";
import { useNavigate } from "react-router-dom";
import {
  FileText, Sparkles, BookOpen, Brain, Copy, Check,
  Download, Search, ChevronRight, Clock,
  Layers, Zap, Upload, RefreshCw,
  MessageSquare, X, 
  Star, ScanText, 
  AlignLeft, Tag, ArrowRight, Loader2
} from "lucide-react";
import LiquidEther from "../components/LiquidEther";
import Sidebar from "../components/Sidebar";
import gsap from 'gsap';

// ─── Types ────────────────────────────────────────────────────────────────────

type SummaryLength = 'brief' | 'standard' | 'detailed';
type ViewMode = 'grid' | 'list';

interface KeyPoint {
  text: string;
  importance: 'high' | 'medium' | 'low';
}

interface SummaryDoc {
  id: string;
  title: string;
  fileName: string;
  pages: number;
  uploadedAt: string;
  generatedAt: string;
  readTime: string;
  wordCount: number;
  brief: string;
  standard: string;
  detailed: string;
  keyPoints: KeyPoint[];
  topics: string[];
  color: string;
  starred: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockSummaries: SummaryDoc[] = [
  {
    id: '1',
    title: 'Quantum Physics — Chapter 5',
    fileName: 'Quantum_Physics_Ch5.pdf',
    pages: 34,
    uploadedAt: '2 hours ago',
    generatedAt: '2 hours ago',
    readTime: '4 min read',
    wordCount: 820,
    brief: 'Chapter 5 explores wave-particle duality, the uncertainty principle, and quantum superposition. Key experiments including the double-slit experiment demonstrate how particles exhibit both wave and particle behaviour depending on observation.',
    standard: `Chapter 5 of Quantum Physics provides a comprehensive treatment of wave-particle duality and its foundational implications for modern physics.\n\n**Wave-Particle Duality**\nAt the quantum scale, matter and energy exhibit properties of both waves and particles. This dual nature was first demonstrated through the photoelectric effect (Einstein, 1905) and later confirmed via electron diffraction experiments.\n\n**The Uncertainty Principle**\nHeisenberg's Uncertainty Principle establishes that the position and momentum of a particle cannot both be precisely measured simultaneously. This is not a limitation of measurement technology but a fundamental property of quantum systems.\n\n**Quantum Superposition**\nParticles exist in multiple states simultaneously until measured. The act of observation collapses the wave function to a single definite state — a concept central to the Copenhagen interpretation.\n\n**Key Experimental Evidence**\nThe double-slit experiment remains the definitive demonstration of wave-particle duality, showing interference patterns even when particles are fired one at a time.`,
    detailed: `Chapter 5 provides an in-depth exploration of the foundational principles underpinning quantum mechanics, building upon the classical limitations encountered in Chapter 4.\n\n**1. Wave-Particle Duality — Historical Context**\nThe debate over the nature of light dates to Newton (corpuscular theory) versus Huygens (wave theory). The photoelectric effect resolved this by demonstrating light's quantised, particle-like energy transfer, while diffraction confirmed its wave nature. de Broglie extended this duality to matter in 1924, proposing that all particles have an associated wavelength λ = h/p.\n\n**2. The Uncertainty Principle — Mathematical Framework**\nΔx · Δp ≥ ħ/2 expresses the fundamental trade-off between positional and momentum certainty. The chapter derives this from the mathematical properties of wave packets, demonstrating it is an intrinsic feature of Fourier analysis applied to quantum states.\n\n**3. Superposition and the Wave Function**\nThe wave function Ψ(x,t) encodes all probabilistic information about a particle. Born's probabilistic interpretation holds that |Ψ|² gives the probability density of finding the particle at position x. Superposition states are linear combinations of eigenstates, and measurement forces projection onto a single eigenstate.\n\n**4. Measurement and Decoherence**\nThe measurement problem — why macroscopic observations yield definite outcomes — is addressed through decoherence theory. Interaction with the environment causes rapid loss of quantum coherence, explaining the classical appearance of the macroscopic world.\n\n**5. Experimental Confirmations**\nThe chapter details three landmark experiments: Young's double-slit (interference), Davisson-Germer (electron diffraction), and Aspect's Bell inequality tests (entanglement confirmation).`,
    keyPoints: [
      { text: 'Wave-particle duality is experimentally confirmed by the double-slit experiment', importance: 'high' },
      { text: "Heisenberg's Uncertainty Principle: Δx · Δp ≥ ħ/2 — a fundamental limit, not a measurement flaw", importance: 'high' },
      { text: 'Superposition collapses to a definite state upon measurement (Copenhagen interpretation)', importance: 'high' },
      { text: "de Broglie wavelength λ = h/p applies to all matter", importance: 'medium' },
      { text: 'Born interpretation: |Ψ|² gives probability density', importance: 'medium' },
      { text: 'Decoherence explains the emergence of classical behaviour at macro scales', importance: 'low' },
    ],
    topics: ['Wave-Particle Duality', 'Uncertainty Principle', 'Superposition', 'Quantum Measurement', 'Wave Function'],
    color: '#a855f7',
    starred: true,
  },
  {
    id: '2',
    title: 'Biology — Cellular Respiration',
    fileName: 'Biology_CellularRespiration.pdf',
    pages: 22,
    uploadedAt: '5 hours ago',
    generatedAt: '5 hours ago',
    readTime: '3 min read',
    wordCount: 610,
    brief: 'Cellular respiration is the process by which cells break down glucose to produce ATP energy. The three main stages — glycolysis, the Krebs cycle, and the electron transport chain — occur in the cytoplasm and mitochondria.',
    standard: `Cellular respiration converts biochemical energy from nutrients into ATP, the cell's primary energy currency. The process occurs in three sequential stages.\n\n**Glycolysis**\nOccurs in the cytoplasm. One glucose molecule is split into two pyruvate molecules, yielding a net gain of 2 ATP and 2 NADH. No oxygen is required.\n\n**The Krebs Cycle (Citric Acid Cycle)**\nOccurs in the mitochondrial matrix. Each pyruvate is converted to acetyl-CoA and enters the cycle, producing 2 ATP, 6 NADH, and 2 FADH₂ per glucose molecule overall.\n\n**Electron Transport Chain**\nOccurs along the inner mitochondrial membrane. NADH and FADH₂ donate electrons, driving proton pumping and ATP synthesis via chemiosmosis. This stage produces approximately 32–34 ATP per glucose.\n\n**Overall Equation**\nC₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~36-38 ATP`,
    detailed: `Full detailed summary available for this document...`,
    keyPoints: [
      { text: 'Glycolysis produces 2 net ATP in the cytoplasm — no oxygen needed', importance: 'high' },
      { text: 'The Krebs cycle occurs in the mitochondrial matrix and produces NADH, FADH₂', importance: 'high' },
      { text: 'Electron transport chain generates ~32–34 ATP via chemiosmosis', importance: 'high' },
      { text: 'Overall: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~36-38 ATP', importance: 'medium' },
      { text: 'Anaerobic respiration (fermentation) yields only 2 ATP', importance: 'medium' },
    ],
    topics: ['Glycolysis', 'Krebs Cycle', 'ATP Synthesis', 'Mitochondria', 'Chemiosmosis'],
    color: '#10b981',
    starred: false,
  },
  {
    id: '3',
    title: 'Modern History — Causes of WW1',
    fileName: 'ModernHistory_WW1_Causes.pdf',
    pages: 18,
    uploadedAt: 'Yesterday',
    generatedAt: 'Yesterday',
    readTime: '3 min read',
    wordCount: 590,
    brief: 'The causes of World War 1 are commonly analysed through the MAIN framework: Militarism, Alliance systems, Imperialism, and Nationalism. The assassination of Archduke Franz Ferdinand in June 1914 served as the immediate trigger.',
    standard: `The origins of World War 1 are multi-causal and deeply rooted in late 19th-century European geopolitics.\n\n**Militarism**\nMajor European powers engaged in a substantial arms race by 1914. Germany's naval expansion directly threatened British supremacy at sea, heightening tensions.\n\n**Alliance Systems**\nEurope was divided into two armed camps: the Triple Entente (Britain, France, Russia) and the Triple Alliance (Germany, Austria-Hungary, Italy). These rigid alliances meant a localised conflict could rapidly escalate.\n\n**Imperialism**\nCompetition for colonies in Africa and Asia created repeated crises (e.g., the Moroccan Crises of 1905 and 1911), straining diplomatic relations.\n\n**Nationalism**\nPan-Slavic nationalism in the Balkans, particularly in Serbia, threatened Austro-Hungarian imperial stability. The assassination of Franz Ferdinand crystallised these tensions into open conflict.`,
    detailed: `Full detailed summary available for this document...`,
    keyPoints: [
      { text: 'MAIN framework: Militarism, Alliances, Imperialism, Nationalism', importance: 'high' },
      { text: 'Assassination of Archduke Franz Ferdinand (28 June 1914) — immediate trigger', importance: 'high' },
      { text: 'Alliance systems transformed a local conflict into a world war', importance: 'high' },
      { text: 'Schlieffen Plan — Germany\'s two-front war strategy', importance: 'medium' },
      { text: 'Balkans described as the "powder keg of Europe"', importance: 'medium' },
    ],
    topics: ['Militarism', 'Alliance Systems', 'Nationalism', 'Imperialism', 'Franz Ferdinand'],
    color: '#f59e0b',
    starred: false,
  },
  {
    id: '4',
    title: 'Economics — Supply & Demand',
    fileName: 'Economics_SupplyDemand_Ch2.pdf',
    pages: 28,
    uploadedAt: '2 days ago',
    generatedAt: '2 days ago',
    readTime: '3 min read',
    wordCount: 540,
    brief: 'Supply and demand is the fundamental model of price determination in a market economy. Equilibrium price is where quantity supplied equals quantity demanded. Shifts in either curve are caused by factors beyond price itself.',
    standard: `Supply and demand analysis forms the foundation of microeconomic theory.\n\n**The Demand Curve**\nThe law of demand states that, ceteris paribus, as price rises, quantity demanded falls. The demand curve slopes downward. Shifters include income, prices of related goods, consumer expectations, and tastes.\n\n**The Supply Curve**\nThe law of supply states that, ceteris paribus, producers supply more at higher prices. The supply curve slopes upward. Shifters include input costs, technology, number of sellers, and government policies.\n\n**Market Equilibrium**\nEquilibrium occurs where the supply and demand curves intersect. At this price, the market clears — no surplus or shortage exists. Disequilibrium triggers price adjustments that restore equilibrium.`,
    detailed: `Full detailed summary available for this document...`,
    keyPoints: [
      { text: 'Law of demand: price ↑ → quantity demanded ↓ (inverse relationship)', importance: 'high' },
      { text: 'Law of supply: price ↑ → quantity supplied ↑ (direct relationship)', importance: 'high' },
      { text: 'Equilibrium: Qs = Qd — market-clearing price', importance: 'high' },
      { text: 'Price elasticity measures responsiveness of quantity to price changes', importance: 'medium' },
      { text: 'Government interventions (price ceilings/floors) cause deadweight loss', importance: 'medium' },
    ],
    topics: ['Supply Curve', 'Demand Curve', 'Market Equilibrium', 'Price Elasticity', 'Deadweight Loss'],
    color: '#06b6d4',
    starred: true,
  },
];

// ─── Importance Badge ─────────────────────────────────────────────────────────

const importanceConfig = {
  high:   { label: 'Key',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    text: 'text-rose-400'    },
  medium: { label: 'Note',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400'   },
  low:    { label: 'Extra',  bg: 'bg-gray-500/10',    border: 'border-gray-500/20',    text: 'text-gray-500'    },
};

// ─── Summary Card (Grid) ──────────────────────────────────────────────────────

interface SummaryCardProps {
  doc: SummaryDoc;
  delay: number;
  onOpen: (doc: SummaryDoc) => void;
  onStar: (id: string) => void;
}

const SummaryCard = ({ doc, delay, onOpen, onStar }: SummaryCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay }
      );
    }
  }, []);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(doc.standard);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      ref={ref}
      className="group relative flex flex-col p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.05] transition-all duration-400 cursor-pointer overflow-hidden"
      onClick={() => onOpen(doc)}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${doc.color}0a 0%, transparent 65%)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
            style={{ background: `${doc.color}15`, border: `1px solid ${doc.color}25` }}
          >
            <FileText className="w-4 h-4" style={{ color: doc.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white leading-snug truncate">{doc.title}</h3>
            <p className="text-[11px] text-gray-600 mt-0.5 truncate">{doc.fileName}</p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onStar(doc.id); }}
          className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${doc.starred ? 'text-amber-400' : 'text-gray-700 hover:text-gray-400'}`}
        >
          <Star className={`w-3.5 h-3.5 ${doc.starred ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* Summary preview */}
      <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 flex-1 mb-4">{doc.brief}</p>

      {/* Topics */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {doc.topics.slice(0, 3).map((t, i) => (
          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-gray-500">{t}</span>
        ))}
        {doc.topics.length > 3 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-gray-600">+{doc.topics.length - 3}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.05]">
        <div className="flex items-center gap-3 text-[11px] text-gray-600">
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{doc.pages}p</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{doc.readTime}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-white/[0.08] text-gray-600 hover:text-gray-300 transition-all"
            title="Copy summary"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
          <button className="p-1.5 rounded-lg hover:bg-white/[0.08] text-gray-600 hover:text-gray-300 transition-all" title="Read full">
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Summary List Row ─────────────────────────────────────────────────────────

interface SummaryRowProps {
  doc: SummaryDoc;
  delay: number;
  onOpen: (doc: SummaryDoc) => void;
  onStar: (id: string) => void;
}

const SummaryRow = ({ doc, delay, onOpen, onStar }: SummaryRowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', delay }
      );
    }
  }, []);

  return (
    <div
      ref={ref}
      className="group flex items-center gap-4 px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
      onClick={() => onOpen(doc)}
    >
      <div
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${doc.color}15`, border: `1px solid ${doc.color}25` }}
      >
        <FileText className="w-4 h-4" style={{ color: doc.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white truncate">{doc.title}</h3>
          {doc.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{doc.brief.slice(0, 90)}…</p>
      </div>

      <div className="hidden md:flex items-center gap-4 text-[11px] text-gray-600 flex-shrink-0">
        <span>{doc.pages}p</span>
        <span>{doc.readTime}</span>
        <span>{doc.uploadedAt}</span>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onStar(doc.id); }}
          className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${doc.starred ? 'text-amber-400 opacity-100' : 'text-gray-600 hover:text-gray-300'}`}
        >
          <Star className={`w-3.5 h-3.5 ${doc.starred ? 'fill-amber-400' : ''}`} />
        </button>
        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
      </div>
    </div>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

interface DetailModalProps {
  doc: SummaryDoc;
  onClose: () => void;
  onNavigateToChat: () => void;
}

const DetailModal = ({ doc, onClose, onNavigateToChat }: DetailModalProps) => {
  const [activeLength, setActiveLength] = useState<SummaryLength>('standard');
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (overlayRef.current && panelRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.fromTo(panelRef.current,
        { opacity: 0, y: 32, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, []);

  const handleClose = () => {
    if (overlayRef.current && panelRef.current) {
      gsap.to(panelRef.current, { opacity: 0, y: 24, scale: 0.97, duration: 0.25, ease: 'power2.in' });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, onComplete: onClose });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(doc[activeLength]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const summaryContent = doc[activeLength];

  const renderContent = (text: string) =>
    text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**'))
        return <h4 key={i} className="text-sm font-bold text-white mt-5 mb-2 first:mt-0">{line.slice(2, -2)}</h4>;
      if (line.trim() === '') return <div key={i} className="h-1" />;
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="text-sm text-gray-300 leading-relaxed">
          {parts.map((p, j) =>
            p.startsWith('**') && p.endsWith('**')
              ? <strong key={j} className="font-semibold text-white">{p.slice(2, -2)}</strong>
              : p
          )}
        </p>
      );
    });

  const lengthOptions: { key: SummaryLength; label: string; desc: string }[] = [
    { key: 'brief',    label: 'Brief',    desc: '2–3 sentences' },
    { key: 'standard', label: 'Standard', desc: '~1 page'        },
    { key: 'detailed', label: 'Detailed', desc: 'In-depth'       },
  ];

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div
        ref={panelRef}
        className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-2xl bg-[#0c0c14] border border-white/[0.1] shadow-2xl shadow-black/60 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex-shrink-0 flex items-start justify-between gap-4 px-6 py-5 border-b border-white/[0.07]">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: `${doc.color}18`, border: `1px solid ${doc.color}28` }}
            >
              <FileText className="w-5 h-5" style={{ color: doc.color }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">{doc.title}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{doc.fileName} · {doc.pages} pages · {doc.readTime}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-all flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Length selector */}
        <div className="flex-shrink-0 flex items-center gap-2 px-6 py-3 border-b border-white/[0.05]">
          <span className="text-xs text-gray-600 mr-1">Length:</span>
          {lengthOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setActiveLength(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeLength === opt.key
                  ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                  : 'bg-white/[0.03] border border-white/[0.07] text-gray-500 hover:text-gray-300 hover:bg-white/[0.06]'
              }`}
            >
              {opt.label}
              <span className="ml-1.5 text-[10px] opacity-60">{opt.desc}</span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs text-gray-400 hover:text-gray-200 transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs text-gray-400 hover:text-gray-200 transition-all">
              <Download className="w-3 h-3" />
              Export
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.2) transparent' }}>
          {renderContent(summaryContent)}

          {/* Key Points */}
          <div className="mt-7 pt-6 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Key Points</h3>
            </div>
            <div className="space-y-2.5">
              {doc.keyPoints.map((kp, i) => {
                const cfg = importanceConfig[kp.importance];
                return (
                  <div key={i} className="flex items-start gap-3">
                    <span className={`flex-shrink-0 mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    <p className="text-sm text-gray-300 leading-relaxed">{kp.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topics */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Topics Covered</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {doc.topics.map((t, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.09] text-gray-400">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.07] bg-black/20">
          <p className="text-xs text-gray-600">Generated {doc.generatedAt}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToChat}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.09] hover:bg-white/[0.09] text-sm text-gray-300 hover:text-white font-medium transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Ask AI about this
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm text-white font-semibold transition-all shadow-lg shadow-purple-600/20">
              <Brain className="w-3.5 h-3.5" />
              Make Flashcards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Summaries Page ───────────────────────────────────────────────────────────

export default function SummariesPage() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const [summaries, setSummaries] = useState<SummaryDoc[]>(mockSummaries);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilter, setActiveFilter] = useState<'all' | 'starred'>('all');
  const [selectedDoc, setSelectedDoc] = useState<SummaryDoc | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.05 }
      );
    }
    if (statsRef.current) {
      gsap.fromTo(statsRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.2 }
      );
    }
  }, []);

  const handleStar = (id: string) => {
    setSummaries(prev => prev.map(s => s.id === id ? { ...s, starred: !s.starred } : s));
  };

  const filtered = summaries.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.fileName.toLowerCase().includes(search.toLowerCase()) ||
      s.topics.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = activeFilter === 'all' || s.starred;
    return matchSearch && matchFilter;
  });

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());
    navigate("/login");
  };

  const totalPages = summaries.reduce((a, s) => a + s.pages, 0);
  const totalWords = summaries.reduce((a, s) => a + s.wordCount, 0);
  const starredCount = summaries.filter(s => s.starred).length;

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <LiquidEther
          colors={['#ec4899', '#a855f7', '#3b82f6']}
          mouseForce={10} cursorSize={80} isViscous={false} viscous={30}
          iterationsViscous={32} iterationsPoisson={32} resolution={0.35}
          isBounce={false} autoDemo={true} autoSpeed={0.15} autoIntensity={1.2}
          takeoverDuration={0.4} autoResumeDelay={2500} autoRampDuration={1.0}
        />
      </div>
      <div className="fixed inset-0 z-[1] pointer-events-none bg-black/80" />
      <div className="fixed inset-0 z-[2] pointer-events-none bg-gradient-to-b from-black/50 via-black/10 to-black/50" />

      {/* Sidebar */}
      <Sidebar
        activePage="Summaries"
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
        <div className="max-w-[1200px] mx-auto px-10 py-10 space-y-8">

          {/* ── Header ── */}
          <div ref={headerRef} className="pt-4">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-xs font-medium tracking-widest uppercase text-purple-400/70">Summaries</span>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-gray-600">AI-Generated Overviews</span>
            </div>
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Your{' '}
                  <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Summaries
                  </span>
                </h1>
                <p className="text-gray-500 mt-2 text-sm font-light leading-relaxed">
                  AI-distilled overviews of all your uploaded study materials.
                </p>
              </div>
              <button
                onClick={() => navigate('/upload')}
                className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:scale-[1.02] flex-shrink-0"
              >
                <Upload className="w-4 h-4" />
                Upload New PDF
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* ── Stats Strip ── */}
          <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: FileText,   label: 'Documents',    value: String(summaries.length),               color: '#a855f7' },
              { icon: BookOpen,   label: 'Pages Analysed', value: totalPages.toLocaleString(),           color: '#3b82f6' },
              { icon: AlignLeft,  label: 'Words Distilled', value: `~${(totalWords / 1000).toFixed(1)}k`, color: '#ec4899' },
              { icon: Star,       label: 'Starred',       value: String(starredCount),                   color: '#f59e0b' },
            ].map(({ icon: Icon, label, value, color }, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-none">{value}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Toolbar ── */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by title, file, or topic…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-purple-500/35 text-sm text-gray-200 placeholder-gray-600 outline-none transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.07]">
              {(['all', 'starred'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize ${
                    activeFilter === f
                      ? 'bg-purple-500/20 border border-purple-500/25 text-purple-300'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {f === 'starred' ? '★ Starred' : 'All'}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/[0.08] text-white' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/[0.08] text-white' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          {filtered.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                <ScanText className="w-7 h-7 text-gray-600" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-gray-400">
                  {search ? 'No results found' : 'No summaries yet'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {search ? `Try a different search term` : 'Upload a PDF to generate your first AI summary'}
                </p>
              </div>
              {!search && (
                <button
                  onClick={() => navigate('/upload')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-purple-600/20"
                >
                  <Upload className="w-4 h-4" />
                  Upload a PDF
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((doc, i) => (
                <SummaryCard
                  key={doc.id}
                  doc={doc}
                  delay={i * 0.07}
                  onOpen={setSelectedDoc}
                  onStar={handleStar}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((doc, i) => (
                <SummaryRow
                  key={doc.id}
                  doc={doc}
                  delay={i * 0.06}
                  onOpen={setSelectedDoc}
                  onStar={handleStar}
                />
              ))}
            </div>
          )}

          {/* Generate all CTA */}
          {summaries.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl p-6 flex items-center justify-between gap-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/8 to-blue-600/10" />
              <div className="absolute inset-0 border border-purple-500/15 rounded-2xl" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className={`w-5 h-5 text-purple-300 ${isGenerating ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Regenerate all summaries</p>
                  <p className="text-xs text-gray-500 mt-0.5">Re-analyse your PDFs with the latest AI model for improved accuracy.</p>
                </div>
              </div>
              <button
                onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 2800); }}
                disabled={isGenerating}
                className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] text-sm text-gray-200 font-medium transition-all flex-shrink-0 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                {isGenerating ? 'Regenerating…' : 'Regenerate'}
              </button>
            </div>
          )}

          <div className="h-6" />
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedDoc && (
        <DetailModal
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onNavigateToChat={() => { setSelectedDoc(null); navigate('/chat'); }}
        />
      )}
    </div>
  );
}