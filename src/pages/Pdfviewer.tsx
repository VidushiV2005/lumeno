import { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { clearUser } from "../features/userSlice";
import { signOut } from "firebase/auth";
import { auth } from "../features/firebase";
import { useNavigate } from "react-router-dom";
import {
  Eye, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Search, Bookmark, BookmarkCheck, MessageSquare,
  Brain, Sparkles, X, Maximize2, Minimize2,
  Upload, AlignLeft, ChevronDown,
  ScanText, ListChecks, ArrowRight, 
  PanelLeftClose, PanelLeftOpen, StickyNote,
  ArrowLeft, Grid3X3, List
} from "lucide-react";
import LiquidEther from "../components/LiquidEther";
import Sidebar from "../components/Sidebar";
import gsap from 'gsap';

// ─── Types ────────────────────────────────────────────────────────────────────

type RightPanel = 'none' | 'ai' | 'outline' | 'bookmarks';
type ViewMode = 'grid' | 'list';

interface PDFDoc {
  id: string;
  title: string;
  fileName: string;
  pages: number;
  uploadedAt: string;
  size: string;
  color: string;
  lastPage: number;
  bookmarks: number[];
  hasSummary: boolean;
  hasFlashcards: boolean;
  outline: OutlineItem[];
  thumbnailLabel: string;
}

interface OutlineItem {
  id: string;
  title: string;
  page: number;
  level: number;
  children?: OutlineItem[];
}

interface Annotation {
  id: string;
  page: number;
  text: string;
  color: string;
  createdAt: string;
}

// ─── Mock outline & data ──────────────────────────────────────────────────────

const mockDocs: PDFDoc[] = [
  {
    id: '1',
    title: 'Quantum Physics — Chapter 5',
    fileName: 'Quantum_Physics_Ch5.pdf',
    pages: 34,
    uploadedAt: '2h ago',
    size: '4.2 MB',
    color: '#a855f7',
    lastPage: 12,
    bookmarks: [3, 8, 15, 22],
    hasSummary: true,
    hasFlashcards: true,
    thumbnailLabel: 'QP',
    outline: [
      { id: 'o1', title: '5.1 Introduction to Quantum Mechanics', page: 1, level: 1 },
      { id: 'o2', title: '5.2 Wave-Particle Duality', page: 4, level: 1, children: [
        { id: 'o2a', title: 'The Double-Slit Experiment', page: 5, level: 2 },
        { id: 'o2b', title: 'de Broglie Wavelength', page: 7, level: 2 },
      ]},
      { id: 'o3', title: "5.3 Heisenberg's Uncertainty Principle", page: 10, level: 1, children: [
        { id: 'o3a', title: 'Mathematical Derivation', page: 11, level: 2 },
        { id: 'o3b', title: 'Physical Interpretation', page: 13, level: 2 },
      ]},
      { id: 'o4', title: '5.4 The Wave Function', page: 16, level: 1 },
      { id: 'o5', title: '5.5 Quantum Superposition', page: 20, level: 1 },
      { id: 'o6', title: '5.6 Measurement & Decoherence', page: 25, level: 1 },
      { id: 'o7', title: '5.7 Summary & Key Equations', page: 31, level: 1 },
    ],
  },
  {
    id: '2',
    title: 'Biology — Cellular Respiration',
    fileName: 'Biology_CellularRespiration.pdf',
    pages: 22,
    uploadedAt: '5h ago',
    size: '2.8 MB',
    color: '#10b981',
    lastPage: 6,
    bookmarks: [2, 9],
    hasSummary: true,
    hasFlashcards: true,
    thumbnailLabel: 'BIO',
    outline: [
      { id: 'b1', title: 'Introduction to Cellular Respiration', page: 1, level: 1 },
      { id: 'b2', title: 'Stage 1: Glycolysis', page: 3, level: 1, children: [
        { id: 'b2a', title: 'ATP Investment Phase', page: 4, level: 2 },
        { id: 'b2b', title: 'ATP Payoff Phase', page: 5, level: 2 },
      ]},
      { id: 'b3', title: 'Stage 2: Krebs Cycle', page: 8, level: 1 },
      { id: 'b4', title: 'Stage 3: Electron Transport Chain', page: 13, level: 1 },
      { id: 'b5', title: 'Anaerobic Respiration', page: 18, level: 1 },
      { id: 'b6', title: 'Summary & Equations', page: 21, level: 1 },
    ],
  },
  {
    id: '3',
    title: 'Modern History — Causes of WW1',
    fileName: 'ModernHistory_WW1_Causes.pdf',
    pages: 18,
    uploadedAt: 'Yesterday',
    size: '1.9 MB',
    color: '#f59e0b',
    lastPage: 1,
    bookmarks: [],
    hasSummary: true,
    hasFlashcards: false,
    thumbnailLabel: 'HIS',
    outline: [
      { id: 'h1', title: 'Prewar Europe: An Overview', page: 1, level: 1 },
      { id: 'h2', title: 'Militarism', page: 3, level: 1 },
      { id: 'h3', title: 'Alliance Systems', page: 6, level: 1, children: [
        { id: 'h3a', title: 'Triple Entente', page: 7, level: 2 },
        { id: 'h3b', title: 'Triple Alliance', page: 8, level: 2 },
      ]},
      { id: 'h4', title: 'Imperialism & Colonial Rivalry', page: 10, level: 1 },
      { id: 'h5', title: 'Nationalism in the Balkans', page: 13, level: 1 },
      { id: 'h6', title: 'The Assassination of Franz Ferdinand', page: 16, level: 1 },
    ],
  },
  {
    id: '4',
    title: 'Economics — Supply & Demand',
    fileName: 'Economics_SupplyDemand_Ch2.pdf',
    pages: 28,
    uploadedAt: '2 days ago',
    size: '3.1 MB',
    color: '#06b6d4',
    lastPage: 14,
    bookmarks: [5, 12, 20],
    hasSummary: true,
    hasFlashcards: true,
    thumbnailLabel: 'ECO',
    outline: [
      { id: 'e1', title: 'Markets and Prices', page: 1, level: 1 },
      { id: 'e2', title: 'The Demand Curve', page: 4, level: 1, children: [
        { id: 'e2a', title: 'Law of Demand', page: 5, level: 2 },
        { id: 'e2b', title: 'Demand Shifters', page: 7, level: 2 },
      ]},
      { id: 'e3', title: 'The Supply Curve', page: 10, level: 1, children: [
        { id: 'e3a', title: 'Law of Supply', page: 11, level: 2 },
        { id: 'e3b', title: 'Supply Shifters', page: 13, level: 2 },
      ]},
      { id: 'e4', title: 'Market Equilibrium', page: 16, level: 1 },
      { id: 'e5', title: 'Price Elasticity', page: 20, level: 1 },
      { id: 'e6', title: 'Government Intervention', page: 24, level: 1 },
    ],
  },
];

// Mock page content text for the simulated viewer
const mockPageTexts: Record<number, string> = {
  1:  "Chapter 5 begins with a foundational overview of quantum mechanics — the branch of physics that governs the behaviour of matter and energy at the subatomic scale. Unlike classical mechanics, quantum mechanics introduces inherent probabilism into the description of physical systems.\n\nThe central departure from classical physics is the recognition that particles do not have definite properties until they are measured. This is not a reflection of our ignorance but a fundamental feature of nature.",
  2:  "Historical context is essential to appreciate the conceptual revolution quantum mechanics represented. By the late 19th century, classical physics faced several unexplained phenomena: blackbody radiation, the photoelectric effect, and atomic spectral lines.\n\nPlanck (1900) resolved the blackbody problem by proposing that energy is quantised — emitted or absorbed in discrete packets called quanta. Einstein extended this in 1905 by showing that light itself consists of quantised particles (photons).",
  3:  "The photoelectric effect provided compelling evidence for the particle nature of light. When light strikes a metal surface, electrons are ejected only if the frequency exceeds a threshold — regardless of intensity. Einstein explained this as individual photons transferring discrete energy E = hf to electrons.\n\nThis directly contradicted the classical wave theory of light, which predicted that sufficient intensity should always eject electrons. The quantum picture was inescapable.",
  4:  "Section 5.2 introduces wave-particle duality — the principle that quantum entities exhibit both wave-like and particle-like properties depending on the experimental context. This is one of the most counterintuitive features of quantum mechanics.\n\nde Broglie (1924) proposed that all matter has an associated wavelength: λ = h/p, where h is Planck's constant and p is momentum. This hypothesis was confirmed by Davisson and Germer (1927) through electron diffraction experiments.",
  5:  "The double-slit experiment is the paradigmatic demonstration of wave-particle duality. When electrons (or photons) are fired at a barrier with two slits, an interference pattern forms on the detector screen — a signature of wave behaviour.\n\nCrucially, this pattern emerges even when particles are sent one at a time, implying each particle interferes with itself. However, if a detector is placed to determine which slit each particle passes through, the interference pattern immediately disappears.",
  6:  "The disappearance of the interference pattern upon observation is deeply significant. It is not that the detector physically disturbs the particle — even a 'gentle' measurement destroys the quantum coherence required for interference.\n\nThis measurement problem sits at the heart of the interpretation debate in quantum mechanics. The Copenhagen interpretation holds that the act of measurement collapses the wave function; many-worlds theory posits no collapse but a branching of the universal wave function.",
  7:  "de Broglie's matter waves introduced the idea of a wave function Ψ(x,t) associated with every quantum particle. The wave function encodes all available information about the system.\n\nBorn's probabilistic interpretation (1926) established that |Ψ(x,t)|² gives the probability density of finding the particle at position x at time t. This probabilistic interpretation remains the standard working framework, though its philosophical implications are debated.",
  8:  "The Schrödinger equation governs the time evolution of the wave function:\n\niħ ∂Ψ/∂t = ĤΨ\n\nwhere Ĥ is the Hamiltonian operator corresponding to the total energy of the system. For a free particle, this reduces to a wave equation with solutions of the form Ψ = Ae^i(kx−ωt).\n\nStationary states (energy eigenstates) satisfy the time-independent Schrödinger equation: ĤΨ = EΨ.",
  9:  "The time-independent Schrödinger equation yields quantised energy levels for bound systems. For a particle in a box of width L:\n\nEₙ = n²π²ħ²/2mL²\n\nwhere n = 1, 2, 3,... is the quantum number. This discreteness of energy is directly observable in atomic spectral lines, where photons are emitted or absorbed at frequencies corresponding to transitions between energy levels.",
  10: "Section 5.3 introduces Heisenberg's Uncertainty Principle — arguably the most famous result in quantum mechanics:\n\nΔx · Δp ≥ ħ/2\n\nwhere Δx is the uncertainty in position and Δp is the uncertainty in momentum. This inequality sets a fundamental lower bound on the product of these uncertainties.\n\nIt is critical to understand that this is not a statement about measurement precision or instrument limitations. It reflects the intrinsic nature of quantum states.",
};

// ─── Simulated PDF Page ───────────────────────────────────────────────────────

interface SimulatedPageProps {
  pageNumber: number;
  doc: PDFDoc;
  zoom: number;
  isBookmarked: boolean;
}

const SimulatedPage = ({ pageNumber, doc, zoom, isBookmarked }: SimulatedPageProps) => {
  const text = mockPageTexts[pageNumber] || `Page ${pageNumber} content for ${doc.title}.\n\nThis section continues the discussion from the previous page, building on the foundational concepts introduced earlier. Key terms and definitions are presented systematically to aid comprehension and retention.\n\nThe material here connects directly to the topics covered in the summary and flashcard decks generated from this document.`;

  return (
    <div
      className="relative bg-[#1a1a2e] border border-white/[0.08] rounded-lg shadow-2xl mx-auto overflow-hidden"
      style={{
        width: `${Math.round(520 * zoom)}px`,
        minHeight: `${Math.round(700 * zoom)}px`,
        fontSize: `${zoom}rem`,
        transition: 'width 0.3s ease, min-height 0.3s ease',
      }}
    >
      {/* Page header */}
      <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: `${doc.color}20` }}>
            <span className="text-[8px] font-bold" style={{ color: doc.color }}>{doc.thumbnailLabel}</span>
          </div>
          <span className="text-[11px] text-gray-600 font-medium">{doc.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {isBookmarked && <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400" />}
          <span className="text-[11px] text-gray-700">{pageNumber}</span>
        </div>
      </div>

      {/* Page content */}
      <div className="px-8 py-6 space-y-4">
        {/* Chapter heading on page 1 */}
        {pageNumber === 1 && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3" style={{ background: `${doc.color}15`, border: `1px solid ${doc.color}25` }}>
              <span className="text-[10px] font-semibold" style={{ color: doc.color }}>Chapter 5</span>
            </div>
            <h1 className="text-xl font-bold text-white leading-tight">{doc.title}</h1>
            <div className="h-0.5 w-12 mt-3 rounded-full" style={{ background: `linear-gradient(90deg, ${doc.color}, transparent)` }} />
          </div>
        )}

        {text.split('\n\n').map((para, i) => {
          const isEquation = para.includes('=') && para.includes('ħ') || para.includes('Ψ') || para.includes('λ =') || para.includes('Eₙ =') || para.includes('iħ');
          return isEquation ? (
            <div key={i} className="my-5 px-5 py-4 rounded-xl border" style={{ background: `${doc.color}08`, borderColor: `${doc.color}20` }}>
              {para.split('\n').map((line, j) => (
                <p key={j} className={`font-mono leading-loose ${line.startsWith('where') || line.startsWith('and') ? 'text-[11px] text-gray-500 mt-1' : 'text-sm text-white font-semibold'}`}>{line}</p>
              ))}
            </div>
          ) : (
            <p key={i} className="text-[13px] text-gray-300 leading-7">{para}</p>
          );
        })}
      </div>

      {/* Page footer */}
      <div className="flex items-center justify-center py-4 border-t border-white/[0.05] mt-4">
        <span className="text-[10px] text-gray-700">— {pageNumber} —</span>
      </div>
    </div>
  );
};

// ─── Outline Item ─────────────────────────────────────────────────────────────

interface OutlineNodeProps {
  item: OutlineItem;
  currentPage: number;
  onNavigate: (page: number) => void;
  depth?: number;
}

const OutlineNode = ({ item, currentPage, onNavigate, depth = 0 }: OutlineNodeProps) => {
  const [expanded, setExpanded] = useState(true);
  const isActive = currentPage === item.page || (item.children?.some(c => c.page === currentPage));

  return (
    <div>
      <button
        onClick={() => { onNavigate(item.page); if (item.children) setExpanded(e => !e); }}
        className={`group w-full flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all duration-200 text-left ${
          isActive ? 'bg-purple-500/15 text-purple-300' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {item.children && (
          <span className="flex-shrink-0 text-gray-600">
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        )}
        {!item.children && <span className="flex-shrink-0 w-3 h-3 flex items-center justify-center"><span className="w-1 h-1 rounded-full bg-gray-700" /></span>}
        <span className={`flex-1 text-xs leading-relaxed ${depth > 0 ? 'font-normal' : 'font-medium'} truncate`}>{item.title}</span>
        <span className="flex-shrink-0 text-[10px] text-gray-700 group-hover:text-gray-500">{item.page}</span>
      </button>
      {item.children && expanded && (
        <div>
          {item.children.map(child => (
            <OutlineNode key={child.id} item={child} currentPage={currentPage} onNavigate={onNavigate} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── AI Quick Actions ─────────────────────────────────────────────────────────

interface AIAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  color: string;
  route?: string;
}

const aiActions: AIAction[] = [
  { icon: ScanText,    label: 'View Summary',     desc: 'AI-distilled overview',           color: '#a855f7', route: '/summaries'  },
  { icon: Brain,       label: 'Flashcards',        desc: 'Study with smart cards',          color: '#3b82f6', route: '/flashcards'  },
  { icon: ListChecks,  label: 'Take a Quiz',       desc: 'Test your understanding',         color: '#10b981', route: '/quizzes'     },
  { icon: MessageSquare, label: 'Ask AI',          desc: 'Chat about this document',        color: '#ec4899', route: '/chat'        },
];

// ─── Doc Library Card ─────────────────────────────────────────────────────────

interface DocCardProps {
  doc: PDFDoc;
  isActive: boolean;
  delay: number;
  onOpen: (doc: PDFDoc) => void;
}

const DocCard = ({ doc, isActive, delay, onOpen }: DocCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const progress = Math.round((doc.lastPage / doc.pages) * 100);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay }
      );
    }
  }, []);

  return (
    <div
      ref={ref}
      onClick={() => onOpen(doc)}
      className={`group relative flex flex-col p-5 rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden ${
        isActive
          ? 'bg-white/[0.07] border-purple-500/35'
          : 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.05]'
      }`}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${doc.color}0c 0%, transparent 65%)` }}
      />
      {isActive && <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: `radial-gradient(ellipse at top left, ${doc.color}0e 0%, transparent 60%)` }} />}

      {/* Thumbnail */}
      <div
        className="relative w-full rounded-xl mb-4 flex items-center justify-center"
        style={{ height: '100px', background: `${doc.color}12`, border: `1px solid ${doc.color}20` }}
      >
        <span className="text-3xl font-bold opacity-30" style={{ color: doc.color }}>{doc.thumbnailLabel}</span>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
          <span className="text-[10px] text-gray-400">{doc.pages}p</span>
        </div>
        {doc.bookmarks.length > 0 && (
          <div className="absolute top-2 right-2">
            <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400" />
          </div>
        )}
      </div>

      <h3 className="text-xs font-semibold text-white leading-snug mb-1 line-clamp-2">{doc.title}</h3>
      <p className="text-[11px] text-gray-600 mb-3">{doc.size} · {doc.uploadedAt}</p>

      {/* Reading progress */}
      <div className="space-y-1.5 mt-auto">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-700">Page {doc.lastPage}</span>
          <span style={{ color: doc.color }} className="font-medium">{progress}%</span>
        </div>
        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: doc.color }} />
        </div>
      </div>
    </div>
  );
};

// ─── PDF Viewer Page ──────────────────────────────────────────────────────────

export default function PDFViewerPage() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [docs, setDocs] = useState<PDFDoc[]>(mockDocs);
  const [activeDoc, setActiveDoc] = useState<PDFDoc | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rightPanel, setRightPanel] = useState<RightPanel>('none');
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [pageInput, setPageInput] = useState('');
  const [isPageEditing, setIsPageEditing] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([
    { id: 'a1', page: 3, text: 'Key experiment — comes up in exams', color: '#f59e0b', createdAt: '2h ago' },
    { id: 'a2', page: 8, text: 'Important equation — memorise for quiz', color: '#a855f7', createdAt: '5h ago' },
  ]);
  const [newNote, setNewNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryView, setLibraryView] = useState<ViewMode>('grid');

  const viewerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 });
    }
  }, [activeDoc]);

  const openDoc = (doc: PDFDoc) => {
    setActiveDoc(doc);
    setCurrentPage(doc.lastPage);
    setZoom(1);
    if (viewerRef.current) {
      gsap.fromTo(viewerRef.current, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
    }
  };

  const goToPage = (page: number) => {
    if (!activeDoc) return;
    const clamped = Math.max(1, Math.min(activeDoc.pages, page));
    setCurrentPage(clamped);
    setDocs(prev => prev.map(d => d.id === activeDoc.id ? { ...d, lastPage: clamped } : d));
    setActiveDoc(prev => prev ? { ...prev, lastPage: clamped } : prev);
  };

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const num = parseInt(pageInput);
      if (!isNaN(num)) goToPage(num);
      setIsPageEditing(false);
      setPageInput('');
    }
    if (e.key === 'Escape') { setIsPageEditing(false); setPageInput(''); }
  };

  const toggleBookmark = () => {
    if (!activeDoc) return;
    const updated = activeDoc.bookmarks.includes(currentPage)
      ? activeDoc.bookmarks.filter(p => p !== currentPage)
      : [...activeDoc.bookmarks, currentPage].sort((a, b) => a - b);
    const updatedDoc = { ...activeDoc, bookmarks: updated };
    setActiveDoc(updatedDoc);
    setDocs(prev => prev.map(d => d.id === activeDoc.id ? updatedDoc : d));
  };

  const addAnnotation = () => {
    if (!newNote.trim() || !activeDoc) return;
    const ann: Annotation = {
      id: crypto.randomUUID(),
      page: currentPage,
      text: newNote.trim(),
      color: '#a855f7',
      createdAt: 'Just now',
    };
    setAnnotations(prev => [...prev, ann]);
    setNewNote('');
  };

  const isBookmarked = activeDoc?.bookmarks.includes(currentPage) ?? false;

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());
    navigate("/login");
  };

  const filteredDocs = docs.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── No document open — library view ──────────────────────────────────────

  if (!activeDoc) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden flex">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <LiquidEther colors={['#ec4899', '#a855f7', '#3b82f6']} mouseForce={10} cursorSize={80} isViscous={false} viscous={30} iterationsViscous={32} iterationsPoisson={32} resolution={0.35} isBounce={false} autoDemo={true} autoSpeed={0.15} autoIntensity={1.2} takeoverDuration={0.4} autoResumeDelay={2500} autoRampDuration={1.0} />
        </div>
        <div className="fixed inset-0 z-[1] pointer-events-none bg-black/80" />
        <div className="fixed inset-0 z-[2] pointer-events-none bg-gradient-to-b from-black/50 via-black/10 to-black/50" />
        <Sidebar activePage="PDF Viewer" user={{ name: user.name ?? user.email ?? 'Student', email: user.email ?? '', photo: user.photo ?? null }} onLogout={handleLogout} onNavigate={(r, _) => navigate(r)} />

        <div className="relative z-10 flex-1 ml-72 overflow-y-auto isolate">
          <div className="max-w-[1200px] mx-auto px-10 py-10 space-y-8">

            {/* Header */}
            <div className="pt-4">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-xs font-medium tracking-widest uppercase text-purple-400/70">PDF Viewer</span>
                <span className="text-gray-700">·</span>
                <span className="text-xs text-gray-600">Document Library</span>
              </div>
              <div className="flex items-end justify-between gap-6 flex-wrap">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Your{' '}
                    <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Documents</span>
                  </h1>
                  <p className="text-gray-500 mt-2 text-sm font-light">Open any PDF to read, annotate, and study with AI tools.</p>
                </div>
                <button
                  onClick={() => navigate('/upload')}
                  className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold transition-all shadow-lg shadow-purple-600/20 hover:scale-[1.02] flex-shrink-0"
                >
                  <Upload className="w-4 h-4" />Upload PDF
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: FileText,  label: 'Documents',      value: String(docs.length),                                                color: '#a855f7' },
                { icon: AlignLeft, label: 'Total Pages',    value: String(docs.reduce((a, d) => a + d.pages, 0)),                      color: '#3b82f6' },
                { icon: Bookmark,  label: 'Bookmarks',      value: String(docs.reduce((a, d) => a + d.bookmarks.length, 0)),           color: '#f59e0b' },
                { icon: Eye,       label: 'Avg. Progress',  value: `${Math.round(docs.reduce((a,d) => a + (d.lastPage/d.pages)*100, 0) / docs.length)}%`, color: '#10b981' },
              ].map(({ icon: Icon, label, value, color }, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white leading-none">{value}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
                <input type="text" placeholder="Search documents…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-purple-500/35 text-sm text-gray-200 placeholder-gray-600 outline-none transition-all" />
              </div>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.07] ml-auto">
                <button onClick={() => setLibraryView('grid')} className={`p-1.5 rounded-lg transition-all ${libraryView === 'grid' ? 'bg-white/[0.08] text-white' : 'text-gray-600 hover:text-gray-400'}`}><Grid3X3 className="w-3.5 h-3.5" /></button>
                <button onClick={() => setLibraryView('list')} className={`p-1.5 rounded-lg transition-all ${libraryView === 'list' ? 'bg-white/[0.08] text-white' : 'text-gray-600 hover:text-gray-400'}`}><List className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Docs */}
            {libraryView === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredDocs.map((doc, i) => (
                  <DocCard key={doc.id} doc={doc} isActive={false} delay={i * 0.06} onOpen={openDoc} />
                ))}
                <div onClick={() => navigate('/upload')} className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-purple-500/30 hover:bg-white/[0.02] transition-all cursor-pointer min-h-[200px]">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] group-hover:border-purple-500/25 flex items-center justify-center transition-all">
                    <Upload className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-400 transition-colors">Add PDF</p>
                    <p className="text-[11px] text-gray-700 mt-0.5">Upload to library</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocs.map((doc) => {
                  const progress = Math.round((doc.lastPage / doc.pages) * 100);
                  return (
                    <div key={doc.id} onClick={() => openDoc(doc)} className="group flex items-center gap-4 px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.05] transition-all cursor-pointer">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${doc.color}18`, border: `1px solid ${doc.color}25` }}>
                        <span className="text-[10px] font-bold" style={{ color: doc.color }}>{doc.thumbnailLabel}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{doc.title}</p>
                        <p className="text-[11px] text-gray-600 mt-0.5">{doc.fileName} · {doc.size}</p>
                      </div>
                      <div className="hidden md:flex items-center gap-4 text-[11px] text-gray-600 flex-shrink-0">
                        <span>{doc.pages} pages</span>
                        <span>{progress}% read</span>
                        <span>{doc.uploadedAt}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
            <div className="h-6" />
          </div>
        </div>
      </div>
    );
  }

  // ── Document open — reader view ───────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <LiquidEther colors={['#ec4899', '#a855f7', '#3b82f6']} mouseForce={10} cursorSize={80} isViscous={false} viscous={30} iterationsViscous={32} iterationsPoisson={32} resolution={0.35} isBounce={false} autoDemo={true} autoSpeed={0.15} autoIntensity={1.2} takeoverDuration={0.4} autoResumeDelay={2500} autoRampDuration={1.0} />
      </div>
      <div className="fixed inset-0 z-[1] pointer-events-none bg-black/85" />

      {!fullscreen && (
        <Sidebar activePage="PDF Viewer" user={{ name: user.name ?? user.email ?? 'Student', email: user.email ?? '', photo: user.photo ?? null }} onLogout={handleLogout} onNavigate={(r, _) => navigate(r)} />
      )}

      <div className={`relative z-10 flex flex-col h-screen overflow-hidden ${fullscreen ? 'w-full' : 'flex-1 ml-72'}`}>

        {/* ── Top toolbar ── */}
        <div ref={headerRef} className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-black/20 backdrop-blur-sm">
          {/* Left: back + doc info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={() => setActiveDoc(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </button>
            <div className="h-4 w-px bg-white/10 flex-shrink-0" />
            <button onClick={() => setLeftCollapsed(c => !c)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-600 hover:text-gray-400 transition-all flex-shrink-0">
              {leftCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${activeDoc.color}20` }}>
                <span className="text-[9px] font-bold" style={{ color: activeDoc.color }}>{activeDoc.thumbnailLabel}</span>
              </div>
              <p className="text-sm font-semibold text-white truncate">{activeDoc.title}</p>
            </div>
          </div>

          {/* Centre: page navigation */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {isPageEditing ? (
              <input
                autoFocus
                value={pageInput}
                onChange={e => setPageInput(e.target.value)}
                onKeyDown={handlePageInput}
                onBlur={() => { setIsPageEditing(false); setPageInput(''); }}
                className="w-12 text-center text-sm text-white bg-white/[0.08] border border-purple-500/40 rounded-lg py-1 outline-none"
              />
            ) : (
              <button onClick={() => { setIsPageEditing(true); setPageInput(String(currentPage)); }} className="text-sm text-gray-200 hover:text-white transition-colors min-w-[64px] text-center">
                <span className="font-semibold">{currentPage}</span>
                <span className="text-gray-600"> / {activeDoc.pages}</span>
              </button>
            )}
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= activeDoc.pages} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: tools */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
            {/* Zoom */}
            <button onClick={() => setZoom(z => Math.max(0.6, z - 0.15))} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-gray-500 hover:text-gray-300 transition-all"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-xs text-gray-600 w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.15))} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-gray-500 hover:text-gray-300 transition-all"><ZoomIn className="w-4 h-4" /></button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* Bookmark */}
            <button onClick={toggleBookmark} className={`p-1.5 rounded-lg hover:bg-white/[0.07] transition-all ${isBookmarked ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}>
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {/* Right panel toggles */}
            {([
              { key: 'outline' as RightPanel,   Icon: AlignLeft,    title: 'Outline'   },
              { key: 'ai' as RightPanel,         Icon: Sparkles,     title: 'AI Tools'  },
              { key: 'bookmarks' as RightPanel,  Icon: Bookmark,     title: 'Bookmarks' },
            ]).map(({ key, Icon, title }) => (
              <button
                key={key}
                title={title}
                onClick={() => setRightPanel(p => p === key ? 'none' : key)}
                className={`p-1.5 rounded-lg transition-all ${rightPanel === key ? 'bg-purple-500/20 text-purple-300' : 'hover:bg-white/[0.07] text-gray-500 hover:text-gray-300'}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}

            <div className="w-px h-4 bg-white/10 mx-1" />

            <button onClick={() => setFullscreen(f => !f)} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-gray-500 hover:text-gray-300 transition-all">
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Content row ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left: Document outline panel */}
          {!leftCollapsed && (
            <div className="flex-shrink-0 w-56 flex flex-col border-r border-white/[0.06] bg-black/10 overflow-hidden">
              <div className="p-3 border-b border-white/[0.05]">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-600">Contents</p>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5" style={{ scrollbarWidth: 'none' }}>
                {activeDoc.outline.map(item => (
                  <OutlineNode key={item.id} item={item} currentPage={currentPage} onNavigate={goToPage} />
                ))}
              </div>
            </div>
          )}

          {/* Centre: Page viewer */}
          <div
            ref={viewerRef}
            className="flex-1 overflow-auto bg-[#0a0a14]"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.2) transparent' }}
          >
            <div className="flex flex-col items-center py-10 px-6 gap-6 min-h-full">
              <SimulatedPage
                pageNumber={currentPage}
                doc={activeDoc}
                zoom={zoom}
                isBookmarked={isBookmarked}
              />

              {/* Page navigation footer */}
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-sm text-gray-400 hover:text-white transition-all disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-xs text-gray-600">{currentPage} / {activeDoc.pages}</span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= activeDoc.pages}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-sm text-gray-400 hover:text-white transition-all disabled:opacity-30"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: AI / Outline / Bookmarks panel */}
          {rightPanel !== 'none' && (
            <div className="flex-shrink-0 w-72 flex flex-col border-l border-white/[0.06] bg-black/10 overflow-hidden">

              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
                <p className="text-xs font-semibold text-white">
                  {rightPanel === 'ai' && 'AI Tools'}
                  {rightPanel === 'outline' && 'Annotations'}
                  {rightPanel === 'bookmarks' && 'Bookmarks'}
                </p>
                <button onClick={() => setRightPanel('none')} className="p-1 rounded-lg hover:bg-white/[0.08] text-gray-600 hover:text-gray-400 transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* AI Tools */}
              {rightPanel === 'ai' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-5" style={{ scrollbarWidth: 'none' }}>
                  <div>
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-3">Quick Actions</p>
                    <div className="space-y-2">
                      {aiActions.map(({ icon: Icon, label, desc, color, route }) => (
                        <button
                          key={label}
                          onClick={() => route && navigate(route)}
                          className="group w-full flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.06] transition-all text-left"
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, color }}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-xs font-semibold text-gray-200">{label}</p>
                            <p className="text-[11px] text-gray-600 mt-0.5">{desc}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-500 mt-1 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-3">Current Page</p>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Page {currentPage} of {activeDoc.pages}</span>
                        {isBookmarked && <span className="text-[10px] text-amber-400 flex items-center gap-1"><Bookmark className="w-2.5 h-2.5 fill-amber-400" />Bookmarked</span>}
                      </div>
                      <button
                        onClick={toggleBookmark}
                        className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all border ${isBookmarked ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' : 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-gray-200'}`}
                      >
                        {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                        {isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
                      </button>
                    </div>
                  </div>

                  {/* Doc info */}
                  <div>
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-3">Document Info</p>
                    <div className="space-y-2 text-xs">
                      {[
                        { label: 'File', value: activeDoc.fileName },
                        { label: 'Pages', value: String(activeDoc.pages) },
                        { label: 'Size', value: activeDoc.size },
                        { label: 'Uploaded', value: activeDoc.uploadedAt },
                        { label: 'Bookmarks', value: String(activeDoc.bookmarks.length) },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-gray-600">{label}</span>
                          <span className="text-gray-300 font-medium truncate max-w-[140px] text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Annotations panel */}
              {rightPanel === 'outline' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'none' }}>
                    {annotations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <StickyNote className="w-8 h-8 text-gray-700" />
                        <p className="text-xs text-gray-600 text-center">No annotations yet.<br />Add a note below.</p>
                      </div>
                    ) : (
                      annotations.map(ann => (
                        <div key={ann.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${ann.color}18`, color: ann.color, border: `1px solid ${ann.color}28` }}>
                              Page {ann.page}
                            </span>
                            <button onClick={() => setAnnotations(prev => prev.filter(a => a.id !== ann.id))} className="p-1 rounded hover:bg-white/[0.08] text-gray-700 hover:text-gray-500 transition-all">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed">{ann.text}</p>
                          <p className="text-[10px] text-gray-600">{ann.createdAt}</p>
                        </div>
                      ))
                    )}
                  </div>
                  {/* Add note */}
                  <div className="flex-shrink-0 p-3 border-t border-white/[0.06] space-y-2">
                    <textarea
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder={`Note for page ${currentPage}…`}
                      rows={3}
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-purple-500/35 rounded-xl px-3 py-2 text-xs text-gray-200 placeholder-gray-600 outline-none resize-none transition-all"
                    />
                    <button
                      onClick={addAnnotation}
                      disabled={!newNote.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-500/20 border border-purple-500/25 hover:bg-purple-500/30 text-xs font-semibold text-purple-300 transition-all disabled:opacity-40"
                    >
                      <StickyNote className="w-3.5 h-3.5" />
                      Add Note
                    </button>
                  </div>
                </div>
              )}

              {/* Bookmarks panel */}
              {rightPanel === 'bookmarks' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ scrollbarWidth: 'none' }}>
                  {activeDoc.bookmarks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <Bookmark className="w-8 h-8 text-gray-700" />
                      <p className="text-xs text-gray-600 text-center">No bookmarks yet.<br />Press the bookmark icon on any page.</p>
                    </div>
                  ) : (
                    activeDoc.bookmarks.map(pg => (
                      <button
                        key={pg}
                        onClick={() => goToPage(pg)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${currentPage === pg ? 'bg-amber-500/10 border-amber-500/25' : 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.05]'}`}
                      >
                        <Bookmark className={`w-4 h-4 flex-shrink-0 ${currentPage === pg ? 'text-amber-400 fill-amber-400' : 'text-amber-600'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${currentPage === pg ? 'text-amber-300' : 'text-gray-300'}`}>Page {pg}</p>
                          <p className="text-[11px] text-gray-600 truncate">
                            {activeDoc.outline.find(o => o.page <= pg && (!activeDoc.outline[activeDoc.outline.indexOf(o) + 1] || activeDoc.outline[activeDoc.outline.indexOf(o) + 1].page > pg))?.title ?? 'Document section'}
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom reading progress bar ── */}
        <div className="flex-shrink-0 h-0.5 bg-white/[0.04]">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${Math.round((currentPage / activeDoc.pages) * 100)}%`,
              background: `linear-gradient(90deg, ${activeDoc.color}cc, ${activeDoc.color})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}