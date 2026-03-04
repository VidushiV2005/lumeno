import { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { clearUser } from "../features/userSlice";
import { signOut } from "firebase/auth";
import { auth } from "../features/firebase";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare, ArrowRight, ArrowLeft,
  Clock, Trophy, Play, RotateCcw,
  Check, X, ChevronRight, FileText, TrendingUp, 
  BarChart3, BookOpen, 
  CircleDot, MessageSquare, Hash, Timer, Plus, Search
} from "lucide-react";
import LiquidEther from "../components/LiquidEther";
import Sidebar from "../components/Sidebar";
import gsap from 'gsap';

// ─── Types ────────────────────────────────────────────────────────────────────

type PageView = 'lobby' | 'quiz' | 'results';
type Difficulty = 'easy' | 'medium' | 'hard';

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctId: string;
  explanation: string;
  topic: string;
}

interface Quiz {
  id: string;
  title: string;
  source: string;
  color: string;
  difficulty: Difficulty;
  questionCount: number;
  estimatedTime: string;
  lastScore?: number;
  lastAttempt?: string;
  topics: string[];
  questions: QuizQuestion[];
}

interface QuizAttempt {
  questionId: string;
  selectedId: string | null;
  isCorrect: boolean;
  timeTaken: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Quantum Physics — Ch.5',
    source: 'Quantum_Physics_Ch5.pdf',
    color: '#a855f7',
    difficulty: 'hard',
    questionCount: 5,
    estimatedTime: '6 min',
    lastScore: 80,
    lastAttempt: '2h ago',
    topics: ['Wave-Particle Duality', 'Uncertainty Principle', 'Superposition'],
    questions: [
      {
        id: 'q1', topic: 'Wave-Particle Duality',
        question: 'Which experiment most definitively demonstrates wave-particle duality in electrons?',
        options: [
          { id: 'a', text: 'The photoelectric effect experiment' },
          { id: 'b', text: 'The double-slit experiment' },
          { id: 'c', text: "Rutherford's gold foil experiment" },
          { id: 'd', text: "Millikan's oil drop experiment" },
        ],
        correctId: 'b',
        explanation: 'The double-slit experiment shows electrons creating an interference pattern (wave behaviour) when unobserved, but acting as particles when their path is measured — the definitive demonstration of wave-particle duality.',
      },
      {
        id: 'q2', topic: 'Uncertainty Principle',
        question: "Heisenberg's Uncertainty Principle states that Δx · Δp ≥ ħ/2. What does this fundamentally mean?",
        options: [
          { id: 'a', text: 'Our measurement instruments are not precise enough' },
          { id: 'b', text: 'Particles do not have definite positions' },
          { id: 'c', text: 'Position and momentum cannot both be precisely known simultaneously — a fundamental quantum limit' },
          { id: 'd', text: 'Only momentum can be measured accurately' },
        ],
        correctId: 'c',
        explanation: "The Uncertainty Principle is not a technological limitation — it is a fundamental property of quantum systems arising from the wave nature of matter. Even a perfect measuring device cannot overcome it.",
      },
      {
        id: 'q3', topic: 'de Broglie Hypothesis',
        question: "According to de Broglie's hypothesis, what is the wavelength of a particle?",
        options: [
          { id: 'a', text: 'λ = mc²' },
          { id: 'b', text: 'λ = h/p (Planck\'s constant divided by momentum)' },
          { id: 'c', text: 'λ = E/f' },
          { id: 'd', text: 'λ = p/h' },
        ],
        correctId: 'b',
        explanation: "de Broglie proposed λ = h/p, extending wave-particle duality to all matter. This was confirmed by the Davisson-Germer experiment which showed electron diffraction.",
      },
      {
        id: 'q4', topic: 'Superposition',
        question: "In quantum mechanics, what happens to a particle's wave function when it is measured?",
        options: [
          { id: 'a', text: 'It splits into two separate wave functions' },
          { id: 'b', text: 'Nothing — measurement has no effect' },
          { id: 'c', text: "It collapses to a single definite eigenstate (Copenhagen interpretation)" },
          { id: 'd', text: 'It becomes permanently uncertain' },
        ],
        correctId: 'c',
        explanation: 'According to the Copenhagen interpretation, prior to measurement a particle exists in a superposition of states. Measurement causes the wave function to collapse to one definite outcome.',
      },
      {
        id: 'q5', topic: 'Wave Function',
        question: "What does |Ψ|² represent in Born's probabilistic interpretation?",
        options: [
          { id: 'a', text: 'The energy of the particle' },
          { id: 'b', text: 'The exact position of the particle' },
          { id: 'c', text: 'The probability density of finding the particle at a given location' },
          { id: 'd', text: 'The momentum of the particle' },
        ],
        correctId: 'c',
        explanation: "Born's rule states that |Ψ|² gives the probability density — integrating it over a region gives the probability of finding the particle there. The wave function itself is not directly observable.",
      },
    ],
  },
  {
    id: '2',
    title: 'Biology — Cellular Respiration',
    source: 'Biology_CellularRespiration.pdf',
    color: '#10b981',
    difficulty: 'medium',
    questionCount: 5,
    estimatedTime: '5 min',
    lastScore: 92,
    lastAttempt: 'Yesterday',
    topics: ['Glycolysis', 'Krebs Cycle', 'ATP Synthesis'],
    questions: [
      {
        id: 'b1', topic: 'Glycolysis',
        question: 'How many net ATP molecules are produced during glycolysis?',
        options: [
          { id: 'a', text: '1 ATP' }, { id: 'b', text: '2 ATP' },
          { id: 'c', text: '4 ATP' }, { id: 'd', text: '36 ATP' },
        ],
        correctId: 'b',
        explanation: 'Glycolysis produces 4 ATP but uses 2, giving a net yield of 2 ATP. It occurs in the cytoplasm and does not require oxygen.',
      },
      {
        id: 'b2', topic: 'Krebs Cycle',
        question: 'Where does the Krebs cycle (citric acid cycle) take place?',
        options: [
          { id: 'a', text: 'The cytoplasm' }, { id: 'b', text: 'The cell nucleus' },
          { id: 'c', text: 'The mitochondrial matrix' }, { id: 'd', text: 'The inner mitochondrial membrane' },
        ],
        correctId: 'c',
        explanation: 'The Krebs cycle takes place in the mitochondrial matrix. The electron transport chain, by contrast, occurs along the inner mitochondrial membrane.',
      },
      {
        id: 'b3', topic: 'ATP Synthesis',
        question: 'Approximately how many ATP molecules does the electron transport chain produce per glucose molecule?',
        options: [
          { id: 'a', text: '2 ATP' }, { id: 'b', text: '8 ATP' },
          { id: 'c', text: '32–34 ATP' }, { id: 'd', text: '100 ATP' },
        ],
        correctId: 'c',
        explanation: 'The electron transport chain generates approximately 32–34 ATP via chemiosmosis — the vast majority of ATP from cellular respiration, making it the most important stage energetically.',
      },
      {
        id: 'b4', topic: 'Overall Equation',
        question: 'What is the correct overall equation for aerobic cellular respiration?',
        options: [
          { id: 'a', text: 'C₆H₁₂O₆ + 6H₂O → 6CO₂ + 6O₂ + ATP' },
          { id: 'b', text: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~36 ATP' },
          { id: 'c', text: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂' },
          { id: 'd', text: 'C₆H₁₂O₆ → 2C₃H₆O₃ + 2 ATP' },
        ],
        correctId: 'b',
        explanation: 'Aerobic respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~36 ATP. Option C is photosynthesis (reversed). Option D is anaerobic fermentation.',
      },
      {
        id: 'b5', topic: 'Anaerobic Respiration',
        question: 'How many ATP does anaerobic respiration (fermentation) produce compared to aerobic?',
        options: [
          { id: 'a', text: 'The same — 36 ATP' }, { id: 'b', text: 'More — 40 ATP' },
          { id: 'c', text: 'Far fewer — only 2 ATP' }, { id: 'd', text: 'None — fermentation uses ATP' },
        ],
        correctId: 'c',
        explanation: 'Anaerobic respiration produces only 2 ATP (from glycolysis only) because the Krebs cycle and electron transport chain require oxygen. This is why aerobic exercise is far more energetically efficient.',
      },
    ],
  },
  {
    id: '3',
    title: 'Modern History — WW1 Causes',
    source: 'ModernHistory_WW1.pdf',
    color: '#f59e0b',
    difficulty: 'medium',
    questionCount: 5,
    estimatedTime: '5 min',
    lastScore: undefined,
    lastAttempt: undefined,
    topics: ['MAIN Causes', 'Alliance Systems', 'Franz Ferdinand'],
    questions: [
      {
        id: 'h1', topic: 'MAIN Causes',
        question: 'What does the "A" in the MAIN acronym for WW1 causes stand for?',
        options: [
          { id: 'a', text: 'Assassination' }, { id: 'b', text: 'Alliance Systems' },
          { id: 'c', text: 'Austria-Hungary' }, { id: 'd', text: 'Armament' },
        ],
        correctId: 'b',
        explanation: 'MAIN = Militarism, Alliance Systems, Imperialism, Nationalism. Alliance systems were crucial because they meant a local conflict between Austria-Hungary and Serbia automatically drew in all major European powers.',
      },
      {
        id: 'h2', topic: 'Assassination',
        question: 'Who assassinated Archduke Franz Ferdinand on 28 June 1914?',
        options: [
          { id: 'a', text: 'A German spy' }, { id: 'b', text: 'A Russian nationalist' },
          { id: 'c', text: 'Gavrilo Princip, a Bosnian-Serb nationalist' }, { id: 'd', text: 'A French anarchist' },
        ],
        correctId: 'c',
        explanation: 'Gavrilo Princip, a Bosnian-Serb nationalist linked to the Black Hand organisation, shot Archduke Franz Ferdinand and his wife Sophie in Sarajevo. This provided Austria-Hungary with a pretext to declare war on Serbia.',
      },
      {
        id: 'h3', topic: 'Alliance Systems',
        question: 'Which countries formed the Triple Entente?',
        options: [
          { id: 'a', text: 'Germany, Austria-Hungary, Italy' },
          { id: 'b', text: 'Britain, France, Russia' },
          { id: 'c', text: 'Britain, Germany, France' },
          { id: 'd', text: 'Russia, Austria-Hungary, Serbia' },
        ],
        correctId: 'b',
        explanation: 'The Triple Entente comprised Britain, France, and Russia. They opposed the Triple Alliance of Germany, Austria-Hungary, and Italy (though Italy later switched sides).',
      },
      {
        id: 'h4', topic: 'Schlieffen Plan',
        question: "What was the core strategy of Germany's Schlieffen Plan?",
        options: [
          { id: 'a', text: 'Avoid a two-front war by focusing solely on Russia' },
          { id: 'b', text: 'Rapidly defeat France in the west (via Belgium), then turn east to face Russia' },
          { id: 'c', text: 'Negotiate peace with France before attacking Russia' },
          { id: 'd', text: 'Use naval superiority to blockade Britain' },
        ],
        correctId: 'b',
        explanation: "The Schlieffen Plan called for a swift defeat of France through neutral Belgium before Russia could fully mobilise, then redirecting forces east. Its failure led to prolonged trench warfare.",
      },
      {
        id: 'h5', topic: 'Nationalism',
        question: 'Why was Pan-Slavic nationalism a threat to Austria-Hungary specifically?',
        options: [
          { id: 'a', text: 'It threatened their naval dominance' },
          { id: 'b', text: "It inspired Slavic peoples within Austria-Hungary's multi-ethnic empire to seek independence, destabilising imperial control" },
          { id: 'c', text: 'It caused economic competition' },
          { id: 'd', text: 'It had no real effect on Austria-Hungary' },
        ],
        correctId: 'b',
        explanation: 'Austria-Hungary was a vast multi-ethnic empire. Pan-Slavic nationalism, especially from Serbia, threatened to inspire its Slavic subjects (Czechs, Slovaks, Croats, Slovenes) to seek independence, making Serbian ambitions an existential threat.',
      },
    ],
  },
  {
    id: '4',
    title: 'Economics — Supply & Demand',
    source: 'Economics_SupplyDemand.pdf',
    color: '#06b6d4',
    difficulty: 'easy',
    questionCount: 4,
    estimatedTime: '4 min',
    lastScore: 100,
    lastAttempt: '2 days ago',
    topics: ['Demand', 'Supply', 'Equilibrium', 'Elasticity'],
    questions: [
      {
        id: 'e1', topic: 'Law of Demand',
        question: 'According to the Law of Demand, what happens to quantity demanded when price rises (ceteris paribus)?',
        options: [
          { id: 'a', text: 'Quantity demanded increases' },
          { id: 'b', text: 'Quantity demanded decreases' },
          { id: 'c', text: 'Quantity demanded stays the same' },
          { id: 'd', text: 'The demand curve shifts right' },
        ],
        correctId: 'b',
        explanation: "The Law of Demand: price ↑ → quantity demanded ↓ (inverse relationship). This is represented by a downward-sloping demand curve. Note: a price change causes movement *along* the curve, not a shift.",
      },
      {
        id: 'e2', topic: 'Elasticity',
        question: 'If the price elasticity of demand (PED) for a good is -0.3, the demand is:',
        options: [
          { id: 'a', text: 'Elastic — consumers are highly responsive' },
          { id: 'b', text: 'Unit elastic' },
          { id: 'c', text: 'Inelastic — consumers are unresponsive to price changes' },
          { id: 'd', text: 'Perfectly elastic' },
        ],
        correctId: 'c',
        explanation: '|PED| = 0.3 < 1, so demand is inelastic. Consumers are relatively unresponsive to price changes — common for necessities like petrol or medicine where there are few substitutes.',
      },
      {
        id: 'e3', topic: 'Market Equilibrium',
        question: 'What occurs at market equilibrium?',
        options: [
          { id: 'a', text: 'Supply exceeds demand, creating a surplus' },
          { id: 'b', text: 'Demand exceeds supply, creating a shortage' },
          { id: 'c', text: 'Quantity supplied equals quantity demanded — the market clears' },
          { id: 'd', text: 'The government sets the price' },
        ],
        correctId: 'c',
        explanation: 'Equilibrium is where Qs = Qd. At this price the market "clears" — no unsold surplus and no unmet demand. Prices naturally adjust toward equilibrium through market forces.',
      },
      {
        id: 'e4', topic: 'Demand Shifters',
        question: 'Which of the following would cause a SHIFT (not a movement) in the demand curve?',
        options: [
          { id: 'a', text: 'A fall in the price of the good itself' },
          { id: 'b', text: 'A rise in consumer income (for a normal good)' },
          { id: 'c', text: 'A rise in the price of the good itself' },
          { id: 'd', text: 'A government price ceiling' },
        ],
        correctId: 'b',
        explanation: 'Shifts in the demand curve are caused by non-price factors: income, prices of related goods, tastes, expectations. A change in the good\'s own price causes movement *along* the existing demand curve, not a shift.',
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const difficultyConfig = {
  easy:   { label: 'Easy',   color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400'   },
  hard:   { label: 'Hard',   color: '#f43f5e', bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    text: 'text-rose-400'    },
};

const getScoreGrade = (pct: number) => {
  if (pct >= 90) return { grade: 'A',  label: 'Excellent!',    color: '#10b981' };
  if (pct >= 75) return { grade: 'B',  label: 'Great work!',   color: '#3b82f6' };
  if (pct >= 60) return { grade: 'C',  label: 'Good effort!',  color: '#f59e0b' };
  if (pct >= 40) return { grade: 'D',  label: 'Keep studying', color: '#f97316' };
  return               { grade: 'F',  label: 'Need revision',  color: '#f43f5e' };
};

// ─── Quiz Card ────────────────────────────────────────────────────────────────

interface QuizCardProps {
  quiz: Quiz;
  delay: number;
  onStart: (quiz: Quiz) => void;
}

const QuizCard = ({ quiz, delay, onStart }: QuizCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const diff = difficultyConfig[quiz.difficulty];
  const hasAttempt = quiz.lastScore !== undefined;

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay }
      );
    }
  }, []);

  return (
    <div
      ref={ref}
      className="group relative flex flex-col p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-400 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${quiz.color}0c 0%, transparent 65%)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
            style={{ background: `${quiz.color}18`, border: `1px solid ${quiz.color}28` }}
          >
            <CheckSquare className="w-5 h-5" style={{ color: quiz.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white leading-snug">{quiz.title}</h3>
            <p className="text-[11px] text-gray-600 mt-0.5 truncate flex items-center gap-1">
              <FileText className="w-2.5 h-2.5" />{quiz.source}
            </p>
          </div>
        </div>
        <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diff.bg} ${diff.border} ${diff.text}`}>
          {diff.label}
        </span>
      </div>

      {/* Last score */}
      {hasAttempt ? (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-gray-600">Last score</span>
              <span className="text-sm font-bold" style={{ color: getScoreGrade(quiz.lastScore!).color }}>
                {quiz.lastScore}%
              </span>
            </div>
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${quiz.lastScore}%`, background: `linear-gradient(90deg, ${quiz.color}cc, ${quiz.color})` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.07]">
          <CircleDot className="w-3.5 h-3.5 text-gray-700" />
          <span className="text-[11px] text-gray-600">Not attempted yet</span>
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-[11px] text-gray-600 mb-3">
        <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{quiz.questionCount} questions</span>
        <span className="flex items-center gap-1"><Timer className="w-3 h-3" />{quiz.estimatedTime}</span>
        {quiz.lastAttempt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{quiz.lastAttempt}</span>}
      </div>

      {/* Topics */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {quiz.topics.slice(0, 3).map((t, i) => (
          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-gray-500">{t}</span>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => onStart(quiz)}
        className="relative z-10 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border mt-auto hover:scale-[1.02]"
        style={{ background: `${quiz.color}15`, borderColor: `${quiz.color}28`, color: quiz.color }}
      >
        <Play className="w-3.5 h-3.5" />
        {hasAttempt ? 'Retake Quiz' : 'Start Quiz'}
      </button>
    </div>
  );
};

// ─── Active Quiz ──────────────────────────────────────────────────────────────

interface ActiveQuizProps {
  quiz: Quiz;
  onComplete: (attempts: QuizAttempt[]) => void;
  onExit: () => void;
}

const ActiveQuiz = ({ quiz, onComplete, onExit }: ActiveQuizProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);

  const questionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const question = quiz.questions[currentIndex];
  const total = quiz.questions.length;
  const progress = Math.round(((currentIndex) / total) * 100);

  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (questionRef.current) {
      gsap.fromTo(questionRef.current,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' }
      );
    }
  }, [currentIndex]);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    }
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleSelect = (optId: string) => {
    if (revealed) return;
    setSelected(optId);
  };

  const handleReveal = () => {
    if (!selected) return;
    setRevealed(true);
  };

  const handleNext = () => {
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    const attempt: QuizAttempt = {
      questionId: question.id,
      selectedId: selected,
      isCorrect: selected === question.correctId,
      timeTaken,
    };
    const newAttempts = [...attempts, attempt];

    if (currentIndex < total - 1) {
      setAttempts(newAttempts);
      setSelected(null);
      setRevealed(false);
      setQuestionStartTime(Date.now());
      setCurrentIndex(i => i + 1);
    } else {
      onComplete(newAttempts);
    }
  };

  const getOptionStyle = (optId: string) => {
    if (!revealed) {
      return selected === optId
        ? `border-2 bg-purple-500/15 border-purple-500/50 text-white`
        : `border bg-white/[0.03] border-white/[0.08] text-gray-300 hover:border-white/[0.16] hover:bg-white/[0.06]`;
    }
    if (optId === question.correctId) return `border-2 bg-emerald-500/15 border-emerald-500/40 text-emerald-300`;
    if (optId === selected && selected !== question.correctId) return `border-2 bg-rose-500/15 border-rose-500/40 text-rose-300`;
    return `border bg-white/[0.02] border-white/[0.05] text-gray-600`;
  };

  const getOptionIcon = (optId: string) => {
    if (!revealed) return null;
    if (optId === question.correctId) return <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
    if (optId === selected && selected !== question.correctId) return <X className="w-4 h-4 text-rose-400 flex-shrink-0" />;
    return null;
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div ref={headerRef} className="flex-shrink-0 flex items-center gap-4 px-8 py-4 border-b border-white/[0.06]">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit
        </button>

        {/* Progress bar */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${quiz.color}cc, ${quiz.color})` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-600">
            <span>Question {currentIndex + 1} of {total}</span>
            <span className="flex items-center gap-1">
              <Timer className="w-3 h-3" />{formatTime(timeElapsed)}
            </span>
          </div>
        </div>

        <div
          className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border"
          style={{ color: quiz.color, background: `${quiz.color}15`, borderColor: `${quiz.color}28` }}
        >
          {quiz.title.split('—')[0].trim()}
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 overflow-y-auto px-8 py-8" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.2) transparent' }}>
        <div ref={questionRef} className="max-w-2xl mx-auto space-y-6">

          {/* Topic tag */}
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-medium px-2.5 py-1 rounded-full border"
              style={{ color: quiz.color, background: `${quiz.color}12`, borderColor: `${quiz.color}25` }}
            >
              {question.topic}
            </span>
          </div>

          {/* Question */}
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.09]">
            <p className="text-white text-base font-semibold leading-relaxed">{question.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {question.options.map((opt, i) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                disabled={revealed}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-left ${getOptionStyle(opt.id)} ${!revealed ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold border"
                  style={
                    revealed && opt.id === question.correctId
                      ? { background: '#10b98120', borderColor: '#10b98140', color: '#10b981' }
                      : revealed && opt.id === selected && selected !== question.correctId
                        ? { background: '#f43f5e20', borderColor: '#f43f5e40', color: '#f43f5e' }
                        : selected === opt.id && !revealed
                          ? { background: `${quiz.color}25`, borderColor: `${quiz.color}50`, color: quiz.color }
                          : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#6b7280' }
                  }
                >
                  {optionLetters[i]}
                </span>
                <span className="flex-1 text-sm leading-relaxed">{opt.text}</span>
                {getOptionIcon(opt.id)}
              </button>
            ))}
          </div>

          {/* Explanation */}
          {revealed && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center mt-0.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-300 mb-1">Explanation</p>
                <p className="text-sm text-gray-300 leading-relaxed">{question.explanation}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-600">
              {!selected && !revealed && 'Select an answer to continue'}
              {selected && !revealed && 'Answer selected — check it when ready'}
            </div>
            <div className="flex items-center gap-2.5">
              {selected && !revealed && (
                <button
                  onClick={handleReveal}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg, ${quiz.color}cc, ${quiz.color})`, color: '#fff', boxShadow: `0 4px 20px ${quiz.color}30` }}
                >
                  Check Answer
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {revealed && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm text-white font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-purple-600/20"
                >
                  {currentIndex < total - 1 ? 'Next Question' : 'See Results'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Results Screen ───────────────────────────────────────────────────────────

interface ResultsScreenProps {
  quiz: Quiz;
  attempts: QuizAttempt[];
  onRetake: () => void;
  onBack: () => void;
  onChat: () => void;
}

const ResultsScreen = ({ quiz, attempts, onRetake, onBack, onChat }: ResultsScreenProps) => {
  const correct = attempts.filter(a => a.isCorrect).length;
  const total = quiz.questions.length;
  const pct = Math.round((correct / total) * 100);
  const grade = getScoreGrade(pct);
  const avgTime = Math.round(attempts.reduce((a, b) => a + b.timeTaken, 0) / attempts.length);
  const containerRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    if (scoreRef.current) {
      gsap.fromTo(scoreRef.current,
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)', delay: 0.2 }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-8 py-10" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.2) transparent' }}>
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Score hero */}
        <div className="text-center space-y-5">
          <div ref={scoreRef} className="inline-flex flex-col items-center gap-3">
            <div
              className="relative w-28 h-28 rounded-3xl flex flex-col items-center justify-center border-2 shadow-2xl"
              style={{ background: `${grade.color}15`, borderColor: `${grade.color}40`, boxShadow: `0 16px 48px ${grade.color}25` }}
            >
              <span className="text-4xl font-bold" style={{ color: grade.color }}>{grade.grade}</span>
              <span className="text-sm font-semibold text-white mt-0.5">{pct}%</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{grade.label}</p>
              <p className="text-gray-500 text-sm mt-0.5">{correct} out of {total} correct</p>
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Check,  label: 'Correct',   value: String(correct),   color: '#10b981' },
            { icon: X,      label: 'Incorrect',  value: String(total - correct), color: '#f43f5e' },
            { icon: Timer,  label: 'Avg. time',  value: `${avgTime}s`,     color: '#3b82f6' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-xl font-bold text-white">{value}</span>
              <span className="text-[11px] text-gray-600">{label}</span>
            </div>
          ))}
        </div>

        {/* Question breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Question Breakdown
          </h3>
          <div className="space-y-2">
            {quiz.questions.map((q, i) => {
              const attempt = attempts[i];
              const isCorrect = attempt?.isCorrect;
              return (
                <div key={q.id} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 ${isCorrect ? 'bg-emerald-500/15 border border-emerald-500/25' : 'bg-rose-500/15 border border-rose-500/25'}`}>
                    {isCorrect
                      ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                      : <X className="w-3.5 h-3.5 text-rose-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-300 leading-relaxed">{q.question}</p>
                    {!isCorrect && attempt?.selectedId && (
                      <div className="mt-2 space-y-1">
                        <p className="text-[11px] text-rose-400">
                          Your answer: {q.options.find(o => o.id === attempt.selectedId)?.text}
                        </p>
                        <p className="text-[11px] text-emerald-400">
                          Correct: {q.options.find(o => o.id === q.correctId)?.text}
                        </p>
                      </div>
                    )}
                    <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">{q.explanation}</p>
                  </div>
                  <span className="flex-shrink-0 text-[11px] text-gray-600 mt-0.5">{attempt?.timeTaken}s</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 pb-4">
          <button
            onClick={onRetake}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.09] text-sm text-gray-200 font-semibold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </button>
          <button
            onClick={onChat}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.09] text-sm text-gray-200 font-semibold transition-all"
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            Ask AI about mistakes
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm text-white font-semibold transition-all shadow-lg shadow-purple-600/20 hover:scale-[1.02]"
          >
            All Quizzes
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Quizzes Page ─────────────────────────────────────────────────────────────

export default function QuizzesPage() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [pageView, setPageView] = useState<PageView>('lobby');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');

  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageView === 'lobby') {
      if (headerRef.current) gsap.fromTo(headerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.05 });
      if (statsRef.current) gsap.fromTo(statsRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.2 });
    }
  }, [pageView]);

  const handleStart = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setAttempts([]);
    setPageView('quiz');
  };

  const handleComplete = (newAttempts: QuizAttempt[]) => {
    setAttempts(newAttempts);
    const correct = newAttempts.filter(a => a.isCorrect).length;
    const pct = Math.round((correct / newAttempts.length) * 100);
    if (activeQuiz) {
      setQuizzes(prev => prev.map(q => q.id === activeQuiz.id ? { ...q, lastScore: pct, lastAttempt: 'Just now' } : q));
    }
    setPageView('results');
  };

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());
    navigate("/login");
  };

  const attempted = quizzes.filter(q => q.lastScore !== undefined);
  const avgScore = attempted.length
    ? Math.round(attempted.reduce((a, q) => a + q.lastScore!, 0) / attempted.length)
    : 0;
  const perfectScores = attempted.filter(q => q.lastScore === 100).length;
  const totalQuestions = quizzes.reduce((a, q) => a + q.questionCount, 0);

  const filtered = quizzes.filter(q => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) || q.source.toLowerCase().includes(search.toLowerCase());
    const matchDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    return matchSearch && matchDiff;
  });

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex">
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

      <Sidebar
        activePage="Quizzes"
        user={{ name: user.name ?? user.email ?? 'Student', email: user.email ?? '', photo: user.photo ?? null }}
        onLogout={handleLogout}
        onNavigate={(route, _label) => navigate(route)}
      />

      <div className="relative z-10 flex-1 ml-72 flex flex-col overflow-hidden h-screen">

        {/* ── Active Quiz ── */}
        {pageView === 'quiz' && activeQuiz && (
          <ActiveQuiz quiz={activeQuiz} onComplete={handleComplete} onExit={() => setPageView('lobby')} />
        )}

        {/* ── Results ── */}
        {pageView === 'results' && activeQuiz && (
          <>
            <div className="flex-shrink-0 flex items-center gap-3 px-8 py-4 border-b border-white/[0.06]">
              <button onClick={() => setPageView('lobby')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                <ArrowLeft className="w-4 h-4" /> All Quizzes
              </button>
              <span className="text-gray-700">·</span>
              <span className="text-sm text-white font-medium">{activeQuiz.title} — Results</span>
            </div>
            <ResultsScreen
              quiz={activeQuiz}
              attempts={attempts}
              onRetake={() => handleStart(activeQuiz)}
              onBack={() => setPageView('lobby')}
              onChat={() => navigate('/chat')}
            />
          </>
        )}

        {/* ── Lobby ── */}
        {pageView === 'lobby' && (
          <div className="flex-1 overflow-y-auto isolate">
            <div className="max-w-[1200px] mx-auto px-10 py-10 space-y-8">

              <div ref={headerRef} className="pt-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-xs font-medium tracking-widest uppercase text-purple-400/70">Quizzes</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-xs text-gray-600">AI-Generated Tests</span>
                </div>
                <div className="flex items-end justify-between gap-6 flex-wrap">
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                      Test Your{' '}
                      <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                        Knowledge
                      </span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm font-light">
                      AI-generated quizzes from your uploaded study materials.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/upload')}
                    className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-purple-600/20 hover:scale-[1.02] flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Generate New Quiz
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: CheckSquare, label: 'Total Quizzes',    value: String(quizzes.length),    color: '#a855f7' },
                  { icon: Hash,        label: 'Total Questions',  value: String(totalQuestions),    color: '#3b82f6' },
                  { icon: TrendingUp,  label: 'Average Score',    value: attempted.length ? `${avgScore}%` : '—', color: '#10b981' },
                  { icon: Trophy,      label: 'Perfect Scores',   value: String(perfectScores),     color: '#f59e0b' },
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

              {/* Toolbar */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search quizzes…"
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

                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                  {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setFilterDifficulty(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize ${
                        filterDifficulty === d
                          ? 'bg-purple-500/20 border border-purple-500/25 text-purple-300'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {d === 'all' ? 'All' : difficultyConfig[d].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((quiz, i) => (
                  <QuizCard key={quiz.id} quiz={quiz} delay={i * 0.07} onStart={handleStart} />
                ))}

                <div
                  onClick={() => navigate('/upload')}
                  className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-purple-500/30 hover:bg-white/[0.02] transition-all duration-300 cursor-pointer min-h-[240px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] group-hover:border-purple-500/25 flex items-center justify-center transition-all">
                    <Plus className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-400 transition-colors">New Quiz</p>
                    <p className="text-[11px] text-gray-700 mt-0.5">Upload a PDF to generate</p>
                  </div>
                </div>
              </div>

              <div className="h-6" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}