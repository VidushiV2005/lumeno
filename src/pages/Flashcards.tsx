import { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { clearUser } from "../features/userSlice";
import { signOut } from "firebase/auth";
import { auth } from "../features/firebase";
import { useNavigate } from "react-router-dom";
import {
  Brain, ArrowRight, ArrowLeft,
  RotateCcw, Check, X, Star, Zap, Play, Shuffle,
  Plus, FileText, Clock, Target,
  TrendingUp, Layers, Eye, 
  ThumbsUp, ThumbsDown, Award, Flame,
  Search} from "lucide-react";
import LiquidEther from "../components/LiquidEther";
import Sidebar from "../components/Sidebar";
import gsap from 'gsap';

// ─── Types ────────────────────────────────────────────────────────────────────

type Confidence = 'again' | 'hard' | 'good' | 'easy';
type PageView = 'decks' | 'study';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  confidence: Confidence | null;
  starred: boolean;
  timesReviewed: number;
}

interface Deck {
  id: string;
  title: string;
  source: string;
  color: string;
  cards: Flashcard[];
  lastStudied: string;
  mastered: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockDecks: Deck[] = [
  {
    id: '1',
    title: 'Quantum Physics — Ch.5',
    source: 'Quantum_Physics_Ch5.pdf',
    color: '#a855f7',
    lastStudied: '2h ago',
    mastered: 4,
    cards: [
      { id: 'q1', front: 'What is wave-particle duality?', back: 'The principle that quantum entities exhibit both wave-like and particle-like properties depending on the type of measurement performed. Demonstrated conclusively by the double-slit experiment.', confidence: 'good', starred: true, timesReviewed: 3 },
      { id: 'q2', front: "State Heisenberg's Uncertainty Principle", back: 'Δx · Δp ≥ ħ/2\n\nIt is impossible to simultaneously know both the exact position (Δx) and exact momentum (Δp) of a particle. This is a fundamental property of quantum systems, not a measurement limitation.', confidence: 'hard', starred: true, timesReviewed: 4 },
      { id: 'q3', front: 'What is quantum superposition?', back: 'A quantum system exists in multiple possible states simultaneously until a measurement is made. Upon observation, the wave function "collapses" to one definite state. Described by Schrödinger\'s cat thought experiment.', confidence: null, starred: false, timesReviewed: 1 },
      { id: 'q4', front: "What is de Broglie's hypothesis?", back: 'All matter has an associated wavelength given by λ = h/p, where h is Planck\'s constant and p is momentum. This extends wave-particle duality from light to all matter.', confidence: 'easy', starred: false, timesReviewed: 5 },
      { id: 'q5', front: "What does Born's probabilistic interpretation state?", back: 'The square of the wave function |Ψ|² gives the probability density of finding a particle at a given position. The wave function itself does not directly represent a physical wave.', confidence: 'good', starred: false, timesReviewed: 2 },
      { id: 'q6', front: 'Describe the double-slit experiment result', back: 'When particles (electrons, photons) pass through two slits, they create an interference pattern — evidence of wave behaviour. Observing which slit a particle passes through destroys the interference pattern, demonstrating the role of measurement.', confidence: null, starred: true, timesReviewed: 0 },
    ],
  },
  {
    id: '2',
    title: 'Biology — Cellular Respiration',
    source: 'Biology_CellularRespiration.pdf',
    color: '#10b981',
    lastStudied: '5h ago',
    mastered: 3,
    cards: [
      { id: 'b1', front: 'Where does glycolysis occur and what does it produce?', back: 'Glycolysis occurs in the cytoplasm. It splits one glucose molecule into two pyruvate molecules, producing:\n• 2 net ATP\n• 2 NADH\n• No oxygen required', confidence: 'easy', starred: true, timesReviewed: 6 },
      { id: 'b2', front: 'What is the overall equation for cellular respiration?', back: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 36–38 ATP\n\nGlucose is completely oxidised, releasing energy stored as ATP for cellular use.', confidence: 'good', starred: false, timesReviewed: 4 },
      { id: 'b3', front: 'How many ATP does the electron transport chain produce?', back: 'Approximately 32–34 ATP per glucose molecule.\n\nThis occurs via chemiosmosis along the inner mitochondrial membrane, driven by the proton gradient created by NADH and FADH₂ electron donations.', confidence: 'hard', starred: true, timesReviewed: 3 },
      { id: 'b4', front: 'What occurs in the Krebs cycle?', back: 'The Krebs (citric acid) cycle occurs in the mitochondrial matrix. Per glucose molecule it produces:\n• 2 ATP\n• 6 NADH\n• 2 FADH₂\n• 4 CO₂ released', confidence: null, starred: false, timesReviewed: 1 },
    ],
  },
  {
    id: '3',
    title: 'Modern History — WW1 Causes',
    source: 'ModernHistory_WW1.pdf',
    color: '#f59e0b',
    lastStudied: 'Yesterday',
    mastered: 2,
    cards: [
      { id: 'h1', front: 'What does MAIN stand for in the causes of WW1?', back: 'M — Militarism\nA — Alliance Systems\nI — Imperialism\nN — Nationalism\n\nThese four long-term factors created the conditions for a small crisis to escalate into a world war.', confidence: 'easy', starred: true, timesReviewed: 7 },
      { id: 'h2', front: 'What was the immediate trigger of WW1?', back: 'The assassination of Archduke Franz Ferdinand of Austria-Hungary on 28 June 1914 in Sarajevo, by Gavrilo Princip — a Bosnian-Serb nationalist linked to the Black Hand organisation.', confidence: 'easy', starred: false, timesReviewed: 5 },
      { id: 'h3', front: 'What were the two major alliance systems in 1914?', back: 'Triple Entente: Britain, France, Russia\nTriple Alliance: Germany, Austria-Hungary, Italy\n\nThese rigid alliances meant a localised conflict would automatically draw in major powers, escalating rapidly.', confidence: 'good', starred: false, timesReviewed: 3 },
      { id: 'h4', front: 'What was the Schlieffen Plan?', back: "Germany's military strategy for a two-front war: rapidly defeat France in the west (through neutral Belgium) before turning east to face Russia. Its failure led to trench warfare on the Western Front.", confidence: null, starred: true, timesReviewed: 1 },
      { id: 'h5', front: 'Why were the Balkans called the "powder keg of Europe"?', back: 'Competing nationalist movements (Pan-Slavism, Pan-Germanism), the decline of the Ottoman Empire, Austro-Hungarian fears of Serbian expansion, and Russian ambitions created extreme instability in the region throughout the early 1900s.', confidence: 'hard', starred: false, timesReviewed: 2 },
    ],
  },
  {
    id: '4',
    title: 'Economics — Supply & Demand',
    source: 'Economics_SupplyDemand.pdf',
    color: '#06b6d4',
    lastStudied: '2 days ago',
    mastered: 5,
    cards: [
      { id: 'e1', front: 'State the Law of Demand', back: 'Ceteris paribus (all else equal), as the price of a good increases, the quantity demanded decreases. The demand curve slopes downward, reflecting this inverse relationship.', confidence: 'easy', starred: false, timesReviewed: 8 },
      { id: 'e2', front: 'What is price elasticity of demand (PED)?', back: 'PED = % change in Qd ÷ % change in Price\n\n• |PED| > 1: Elastic (consumers responsive to price)\n• |PED| < 1: Inelastic (consumers unresponsive)\n• |PED| = 1: Unit elastic', confidence: 'good', starred: true, timesReviewed: 5 },
      { id: 'e3', front: 'What causes a shift in the demand curve?', back: 'Demand curve shifts (not price changes) are caused by:\n• Income changes\n• Prices of substitutes/complements\n• Consumer expectations\n• Tastes and preferences\n• Population size', confidence: 'good', starred: false, timesReviewed: 4 },
    ],
  },
];

// ─── Confidence config ────────────────────────────────────────────────────────

const confidenceConfig = {
  again: { label: 'Again',  color: '#f43f5e', bg: 'bg-rose-500/15',    border: 'border-rose-500/30',    hover: 'hover:bg-rose-500/25',   icon: RotateCcw  },
  hard:  { label: 'Hard',   color: '#f59e0b', bg: 'bg-amber-500/15',   border: 'border-amber-500/30',   hover: 'hover:bg-amber-500/25',  icon: ThumbsDown },
  good:  { label: 'Good',   color: '#3b82f6', bg: 'bg-blue-500/15',    border: 'border-blue-500/30',    hover: 'hover:bg-blue-500/25',   icon: ThumbsUp   },
  easy:  { label: 'Easy',   color: '#10b981', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', hover: 'hover:bg-emerald-500/25', icon: Zap        },
};

// ─── Deck Card ────────────────────────────────────────────────────────────────

interface DeckCardProps {
  deck: Deck;
  delay: number;
  onStudy: (deck: Deck) => void;
}

const DeckCard = ({ deck, delay, onStudy }: DeckCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const total = deck.cards.length;
  const mastered = deck.cards.filter(c => c.confidence === 'easy' || c.confidence === 'good').length;
  const due = deck.cards.filter(c => c.confidence === null || c.confidence === 'again').length;
  const progress = Math.round((mastered / total) * 100);

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
      className="group relative flex flex-col p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-400 overflow-hidden cursor-pointer"
      onClick={() => onStudy(deck)}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${deck.color}0c 0%, transparent 65%)` }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
            style={{ background: `${deck.color}18`, border: `1px solid ${deck.color}28` }}
          >
            <Brain className="w-5 h-5" style={{ color: deck.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white leading-snug">{deck.title}</h3>
            <p className="text-[11px] text-gray-600 mt-0.5 truncate flex items-center gap-1">
              <FileText className="w-2.5 h-2.5" />{deck.source}
            </p>
          </div>
        </div>
        {due > 0 && (
          <span className="flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
            {due} due
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-600">{mastered}/{total} mastered</span>
          <span className="font-semibold" style={{ color: deck.color }}>{progress}%</span>
        </div>
        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${deck.color}cc, ${deck.color})` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[11px] text-gray-600 mb-4">
        <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{total} cards</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{deck.lastStudied}</span>
      </div>

      {/* Confidence breakdown */}
      <div className="flex gap-1.5 mb-4">
        {(['easy', 'good', 'hard', 'again'] as Confidence[]).map(c => {
          const count = deck.cards.filter(card => card.confidence === c).length;
          if (count === 0) return null;
          const cfg = confidenceConfig[c];
          return (
            <span key={c} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border}`} style={{ color: cfg.color }}>
              {count} {cfg.label}
            </span>
          );
        })}
        {deck.cards.filter(c => c.confidence === null).length > 0 && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-500/10 border border-gray-500/20 text-gray-500">
            {deck.cards.filter(c => c.confidence === null).length} New
          </span>
        )}
      </div>

      {/* CTA */}
      <button
        className="relative z-10 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border"
        style={{
          background: `${deck.color}15`,
          borderColor: `${deck.color}28`,
          color: deck.color,
        }}
        onClick={e => { e.stopPropagation(); onStudy(deck); }}
      >
        <Play className="w-3.5 h-3.5" />
        {due > 0 ? `Study ${due} due cards` : 'Review deck'}
      </button>
    </div>
  );
};

// ─── Flashcard Flip ───────────────────────────────────────────────────────────

interface FlipCardProps {
  card: Flashcard;
  isFlipped: boolean;
  deckColor: string;
  onFlip: () => void;
  cardIndex: number;
  totalCards: number;
}

const FlipCard = ({ card, isFlipped, deckColor, onFlip, cardIndex, totalCards }: FlipCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, scale: 0.94, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power3.out' }
      );
    }
  }, [card.id]);

  return (
    <div ref={cardRef} className="w-full max-w-2xl mx-auto" style={{ perspective: '1200px' }}>
      {/* Card counter */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <span className="text-xs text-gray-600 font-medium">{cardIndex + 1} of {totalCards}</span>
        {card.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
      </div>

      {/* Flip container */}
      <div
        className="relative w-full cursor-pointer select-none"
        style={{ height: '300px', transformStyle: 'preserve-3d', transition: 'transform 0.55s cubic-bezier(0.4,0.2,0.2,1)', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        onClick={onFlip}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 border overflow-hidden"
          style={{ backfaceVisibility: 'hidden', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${deckColor}08 0%, transparent 70%)` }} />
          {/* Corner accent */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t border-l rounded-tl-lg opacity-30" style={{ borderColor: deckColor }} />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r rounded-br-lg opacity-30" style={{ borderColor: deckColor }} />

          <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-medium border" style={{ color: deckColor, background: `${deckColor}12`, borderColor: `${deckColor}25` }}>
            Question
          </div>

          <p className="text-center text-white text-lg font-semibold leading-relaxed relative z-10">{card.front}</p>

          <div className="absolute bottom-4 flex items-center gap-1.5 text-[11px] text-gray-700">
            <Eye className="w-3 h-3" />
            Click to reveal answer
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 border overflow-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'rgba(255,255,255,0.05)', borderColor: `${deckColor}30` }}
        >
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${deckColor}10 0%, transparent 70%)` }} />

          <div className="absolute top-4 left-4 w-4 h-4 border-t border-l rounded-tl-lg opacity-40" style={{ borderColor: deckColor }} />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r rounded-br-lg opacity-40" style={{ borderColor: deckColor }} />

          <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-medium border" style={{ color: deckColor, background: `${deckColor}15`, borderColor: `${deckColor}30` }}>
            Answer
          </div>

          <div className="text-center text-gray-200 text-sm leading-relaxed relative z-10 max-h-52 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {card.back.split('\n').map((line, i) => (
              <p key={i} className={line.trim() === '' ? 'h-2' : 'mb-1'}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Study Session ────────────────────────────────────────────────────────────

interface StudySessionProps {
  deck: Deck;
  onExit: (updatedDeck: Deck) => void;
}

const StudySession = ({ deck, onExit }: StudySessionProps) => {
  const [cards, setCards] = useState<Flashcard[]>([...deck.cards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState<Record<string, Confidence>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [shuffled, setShuffled] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) gsap.fromTo(headerRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    if (controlsRef.current) gsap.fromTo(controlsRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.15 });
  }, []);

  const currentCard = cards[currentIndex];
  const progress = Math.round(((currentIndex) / cards.length) * 100);

  const handleShuffle = () => {
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShuffled(true);
  };

  const handleConfidence = (conf: Confidence) => {
    const updated = { ...sessionResults, [currentCard.id]: conf };
    setSessionResults(updated);

    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(i => i + 1), 120);
    } else {
      // Session complete — apply results to deck
      const updatedCards = deck.cards.map(c => ({
        ...c,
        confidence: updated[c.id] ?? c.confidence,
        timesReviewed: updated[c.id] ? c.timesReviewed + 1 : c.timesReviewed,
      }));
      setIsComplete(true);
      // Delay to let animation play
      setTimeout(() => onExit({ ...deck, cards: updatedCards }), 400);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) { setIsFlipped(false); setTimeout(() => setCurrentIndex(i => i - 1), 120); }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) { setIsFlipped(false); setTimeout(() => setCurrentIndex(i => i + 1), 120); }
  };

  const sessionAnswered = Object.keys(sessionResults).length;

  // Completion screen
  if (isComplete) {
    const counts = { easy: 0, good: 0, hard: 0, again: 0 };
    Object.values(sessionResults).forEach(c => counts[c]++);
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-8 py-16">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/25 flex items-center justify-center">
            <Award className="w-10 h-10 text-purple-300" />
          </div>
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Session Complete!</h2>
          <p className="text-gray-500 text-sm mt-1">You reviewed {cards.length} cards from {deck.title}</p>
        </div>
        <div className="grid grid-cols-4 gap-3 w-full max-w-sm">
          {(['easy', 'good', 'hard', 'again'] as Confidence[]).map(c => {
            const cfg = confidenceConfig[c];
            return (
              <div key={c} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                <span className="text-xl font-bold" style={{ color: cfg.color }}>{counts[c]}</span>
                <span className="text-[11px]" style={{ color: cfg.color }}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => onExit(deck)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-purple-600/20"
        >
          Back to Decks
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Session header */}
      <div ref={headerRef} className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b border-white/[0.06]">
        <button
          onClick={() => onExit(deck)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit
        </button>

        <div className="flex flex-col items-center gap-2 flex-1 max-w-xs mx-6">
          <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${deck.color}cc, ${deck.color})` }}
            />
          </div>
          <span className="text-[11px] text-gray-600">{sessionAnswered} answered · {cards.length - currentIndex} remaining</span>
        </div>

        <button
          onClick={handleShuffle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border ${shuffled ? 'bg-purple-500/15 border-purple-500/25 text-purple-300' : 'bg-white/[0.04] border-white/[0.08] text-gray-500 hover:text-gray-300'}`}
        >
          <Shuffle className="w-3 h-3" />
          Shuffle
        </button>
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 gap-8">
        <FlipCard
          card={currentCard}
          isFlipped={isFlipped}
          deckColor={deck.color}
          onFlip={() => setIsFlipped(f => !f)}
          cardIndex={currentIndex}
          totalCards={cards.length}
        />

        {/* Nav + confidence controls */}
        <div ref={controlsRef} className="flex flex-col items-center gap-4 w-full max-w-2xl">
          {!isFlipped ? (
            /* Before flip: nav arrows + hint */
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-500 hover:text-gray-300 hover:bg-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFlipped(true)}
                className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${deck.color}cc, ${deck.color})`, boxShadow: `0 8px 24px ${deck.color}30`, color: '#fff' }}
              >
                <Eye className="w-4 h-4" />
                Reveal Answer
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === cards.length - 1}
                className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-500 hover:text-gray-300 hover:bg-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* After flip: confidence buttons */
            <div className="w-full">
              <p className="text-center text-xs text-gray-600 mb-3">How well did you know this?</p>
              <div className="grid grid-cols-4 gap-2.5">
                {(['again', 'hard', 'good', 'easy'] as Confidence[]).map(conf => {
                  const cfg = confidenceConfig[conf];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={conf}
                      onClick={() => handleConfidence(conf)}
                      className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border font-medium transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${cfg.bg} ${cfg.border} ${cfg.hover}`}
                      style={{ color: cfg.color }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Flashcards Page ──────────────────────────────────────────────────────────

export default function FlashcardsPage() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [decks, setDecks] = useState<Deck[]>(mockDecks);
  const [pageView, setPageView] = useState<PageView>('decks');
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [search, setSearch] = useState('');

  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageView === 'decks') {
      if (headerRef.current) gsap.fromTo(headerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.05 });
      if (statsRef.current) gsap.fromTo(statsRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.2 });
    }
  }, [pageView]);

  const handleStudy = (deck: Deck) => {
    setActiveDeck(deck);
    setPageView('study');
  };

  const handleExitStudy = (updatedDeck: Deck) => {
    setDecks(prev => prev.map(d => d.id === updatedDeck.id ? updatedDeck : d));
    setActiveDeck(null);
    setPageView('decks');
  };

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());
    navigate("/login");
  };

  const totalCards = decks.reduce((a, d) => a + d.cards.length, 0);
  const masteredCards = decks.reduce((a, d) => a + d.cards.filter(c => c.confidence === 'easy' || c.confidence === 'good').length, 0);
  const dueCards = decks.reduce((a, d) => a + d.cards.filter(c => c.confidence === null || c.confidence === 'again').length, 0);
  const overallProgress = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  const filtered = decks.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.source.toLowerCase().includes(search.toLowerCase())
  );

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
        activePage="Flashcards"
        user={{
          name: user.name ?? user.email ?? 'Student',
          email: user.email ?? '',
          photo: user.photo ?? null,
        }}
        onLogout={handleLogout}
        onNavigate={(route, _label) => navigate(route)}
      />

      {/* Main */}
      <div className="relative z-10 flex-1 ml-72 flex flex-col overflow-hidden h-screen">

        {pageView === 'study' && activeDeck ? (
          <StudySession deck={activeDeck} onExit={handleExitStudy} />
        ) : (
          <div className="flex-1 overflow-y-auto isolate">
            <div className="max-w-[1200px] mx-auto px-10 py-10 space-y-8">

              {/* ── Header ── */}
              <div ref={headerRef} className="pt-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-xs font-medium tracking-widest uppercase text-purple-400/70">Flashcards</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-xs text-gray-600">Spaced Repetition Study</span>
                </div>
                <div className="flex items-end justify-between gap-6 flex-wrap">
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                      Your{' '}
                      <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                        Flashcard Decks
                      </span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm font-light leading-relaxed">
                      Review, flip, and rate cards to lock in your knowledge.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/upload')}
                    className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:scale-[1.02] flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Generate New Deck
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* ── Stats ── */}
              <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Layers,     label: 'Total Cards',     value: String(totalCards),        color: '#a855f7' },
                  { icon: Check,      label: 'Mastered',        value: String(masteredCards),     color: '#10b981' },
                  { icon: Flame,      label: 'Due for Review',  value: String(dueCards),          color: '#f43f5e' },
                  { icon: TrendingUp, label: 'Overall Progress', value: `${overallProgress}%`,   color: '#3b82f6' },
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

              {/* ── Overall progress bar ── */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-semibold text-white">Mastery Progress</span>
                  </div>
                  <span className="text-sm font-bold text-purple-300">{overallProgress}%</span>
                </div>
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${overallProgress}%`, background: 'linear-gradient(90deg, #a855f7, #ec4899, #3b82f6)' }}
                  />
                </div>
                <div className="flex items-center gap-5 text-[11px] text-gray-600">
                  {(['easy', 'good', 'hard', 'again'] as Confidence[]).map(c => {
                    const count = decks.reduce((a, d) => a + d.cards.filter(card => card.confidence === c).length, 0);
                    const cfg = confidenceConfig[c];
                    return (
                      <span key={c} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                        <span style={{ color: cfg.color }}>{count}</span> {cfg.label}
                      </span>
                    );
                  })}
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-600" />
                    <span className="text-gray-500">{decks.reduce((a, d) => a + d.cards.filter(c => c.confidence === null).length, 0)}</span> New
                  </span>
                </div>
              </div>

              {/* ── Search + toolbar ── */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search decks…"
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
              </div>

              {/* ── Decks Grid ── */}
              {dueCards > 0 && (
                <div className="relative overflow-hidden rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-600/12 to-orange-600/10 rounded-2xl" />
                  <div className="absolute inset-0 border border-rose-500/15 rounded-2xl" />
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center">
                      <Flame className="w-4.5 h-4.5 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{dueCards} cards due for review</p>
                      <p className="text-xs text-gray-500 mt-0.5">Keep your streak going — review now for best retention.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { const firstDue = decks.find(d => d.cards.some(c => c.confidence === null || c.confidence === 'again')); if (firstDue) handleStudy(firstDue); }}
                    className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/25 hover:bg-rose-500/25 text-sm text-rose-300 font-semibold transition-all flex-shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Start Review
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((deck, i) => (
                  <DeckCard key={deck.id} deck={deck} delay={i * 0.07} onStudy={handleStudy} />
                ))}

                {/* Add deck placeholder */}
                <div
                  onClick={() => navigate('/upload')}
                  className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-purple-500/30 hover:bg-white/[0.02] transition-all duration-300 cursor-pointer min-h-[200px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] group-hover:border-purple-500/25 flex items-center justify-center transition-all">
                    <Plus className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-400 transition-colors">New Deck</p>
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