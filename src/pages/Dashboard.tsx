import { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { clearUser } from "../features/userSlice";
import { signOut } from "firebase/auth";
import { auth } from "../features/firebase";
import { useNavigate } from "react-router-dom";
import { 
  Upload, MessageSquare, FileText, Brain, CheckSquare, 
  ClipboardList, PenTool, TrendingUp, Zap, BookOpen, 
  Award, BarChart3, Activity, Sparkles, ArrowRight
} from "lucide-react";
import LiquidEther from "../components/LiquidEther";
import Sidebar from "../components/Sidebar";
import gsap from 'gsap';

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
}

const StatCard = ({ icon: Icon, label, value, trend, trendUp, delay = 0 }: StatCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay }
      );
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className="group relative p-7 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-purple-500/25 hover:bg-white/[0.06] transition-all duration-500 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/[0.04] group-hover:to-pink-500/[0.04] transition-all duration-500 rounded-2xl" />
      
      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/15 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-4 h-4 text-purple-300" />
          </div>
          {trend && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              trendUp 
                ? 'text-emerald-400 bg-emerald-400/10' 
                : 'text-rose-400 bg-rose-400/10'
            }`}>
              {trend}
            </span>
          )}
        </div>

        <div>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
          <p className="text-sm text-gray-500 mt-0.5 font-light">{label}</p>
        </div>
      </div>
    </div>
  );
};

// ─── Quick Action ─────────────────────────────────────────────────────────────

interface QuickActionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  onClick?: () => void;
}

const QuickAction = ({ icon: Icon, title, description, color, onClick }: QuickActionProps) => (
  <button
    onClick={onClick}
    className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-300 text-left overflow-hidden w-full"
  >
    <div 
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: `radial-gradient(ellipse at top left, ${color}0d 0%, transparent 65%)` }}
    />
    
    <div className="relative z-10 flex items-start gap-4">
      <div 
        className="p-2.5 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:scale-105"
        style={{ background: `${color}12` }}
      >
        <div style={{ color }}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0" />
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  </button>
);

// ─── Recent Activity ──────────────────────────────────────────────────────────

interface RecentActivityProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  time: string;
  color: string;
}

const RecentActivity = ({ icon: Icon, title, subtitle, time, color }: RecentActivityProps) => (
  <div className="group flex items-start gap-4 py-3.5 px-3 rounded-xl hover:bg-white/[0.03] transition-all duration-300 cursor-pointer">
    <div 
      className="p-2 rounded-lg flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-300"
      style={{ background: `${color}12` }}
    >
      <div style={{ color }}>
        <Icon className="w-3.5 h-3.5" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-200 truncate">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
    </div>
    <span className="text-xs text-gray-600 flex-shrink-0 mt-0.5">{time}</span>
  </div>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────

interface ProgressBarProps {
  label: string;
  value: string;
  percent: number;
  gradient: string;
}

const ProgressBar = ({ label, value, percent, gradient }: ProgressBarProps) => (
  <div className="space-y-2.5">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${percent}%`, background: gradient }} 
      />
    </div>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex">
      {/* Background — locked behind all content */}
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
      {/* Dark overlay — keeps fluid subtle and text fully legible */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-black/80" />
      <div className="fixed inset-0 z-[2] pointer-events-none bg-gradient-to-b from-black/50 via-black/10 to-black/50" />

      {/* Sidebar */}
      <Sidebar
        activePage="Home"
        user={user}
        onLogout={handleLogout}
        onNavigate={(route) => navigate(route)}
      />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-72 overflow-y-auto isolate">
        <div className="max-w-[1400px] mx-auto px-10 py-10 space-y-10">

          {/* ── Welcome ── */}
          <div className="pt-4 pb-2">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-xs font-medium tracking-widest uppercase text-purple-400/70">Dashboard</span>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-gray-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {greeting},{' '}
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                {user.name?.split(' ')[0] || 'Student'}
              </span>
            </h1>
            <p className="text-gray-500 mt-2 text-sm font-light leading-relaxed">
              Here's an overview of your study activity and tools.
            </p>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={BookOpen}     label="PDFs Uploaded"     value="24"      trend="+3 this week"  trendUp delay={0.05} />
            <StatCard icon={MessageSquare} label="AI Conversations"  value="156"     trend="+12 today"     trendUp delay={0.1}  />
            <StatCard icon={Brain}         label="Flashcards Created" value="438"    trend="+28 this week" trendUp delay={0.15} />
            <StatCard icon={Award}         label="Study Streak"       value="12 days" trend="Personal best" trendUp delay={0.2}  />
          </div>

          {/* ── Two Column: Quick Actions + Activity ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Quick Actions — 3 cols */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-purple-400" />
                <h2 className="text-base font-semibold text-white">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <QuickAction icon={Upload}       title="Upload PDF"        description="Add study materials for AI processing"  color="#ec4899" onClick={() => navigate('/upload')}     />
                <QuickAction icon={MessageSquare} title="AI Chat"           description="Ask questions about your materials"     color="#a855f7" onClick={() => navigate('/chat')}       />
                <QuickAction icon={Brain}         title="Flashcards"        description="Review and memorize with smart cards"   color="#3b82f6" onClick={() => navigate('/flashcards')} />
                <QuickAction icon={CheckSquare}   title="Take a Quiz"       description="Test knowledge with AI-generated quizzes" color="#10b981" onClick={() => navigate('/quiz')}   />
                <QuickAction icon={PenTool}       title="Create Notes"      description="Capture notes from study sessions"      color="#f59e0b" onClick={() => navigate('/notes')}     />
                <QuickAction icon={ClipboardList} title="Manage Tasks"      description="Organise your study schedule"           color="#06b6d4" onClick={() => navigate('/todo')}      />
              </div>
            </div>

            {/* Recent Activity — 2 cols */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col">
              <div className="flex items-center gap-2.5 mb-5">
                <Activity className="w-4 h-4 text-purple-400" />
                <h2 className="text-base font-semibold text-white">Recent Activity</h2>
              </div>
              <div className="flex-1 divide-y divide-white/[0.04]">
                <RecentActivity icon={Upload}        title="Quantum Physics Ch.5 uploaded"   subtitle="Successfully processed with AI"   time="2h ago"       color="#ec4899" />
                <RecentActivity icon={Brain}         title="Created 24 flashcards"           subtitle="From 'Biology Notes.pdf'"         time="5h ago"       color="#3b82f6" />
                <RecentActivity icon={CheckSquare}   title="Modern History quiz"             subtitle="Score: 92% · 23/25 correct"       time="Yesterday"    color="#10b981" />
                <RecentActivity icon={MessageSquare} title="AI Chat session"                 subtitle="Discussed calculus derivatives"   time="Yesterday"    color="#a855f7" />
                <RecentActivity icon={FileText}      title="Summary generated"               subtitle="Economics textbook, chapter 3"    time="2 days ago"   color="#f59e0b" />
              </div>
            </div>
          </div>

          {/* ── Weekly Progress + CTA ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Weekly Progress */}
            <div className="lg:col-span-2 p-7 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-7">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <h2 className="text-base font-semibold text-white">This Week</h2>
              </div>
              <div className="space-y-6">
                <ProgressBar label="Study Time"       value="18.5 hrs" percent={74} gradient="linear-gradient(90deg, #a855f7, #ec4899)" />
                <ProgressBar label="Flashcard Review" value="156 / 200" percent={78} gradient="linear-gradient(90deg, #3b82f6, #06b6d4)" />
                <ProgressBar label="Quiz Completion"  value="8 / 10"    percent={80} gradient="linear-gradient(90deg, #10b981, #34d399)" />
              </div>
              <div className="pt-5 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">+23% from last week</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Keep up the great work!</p>
              </div>
            </div>

            {/* CTA Banner */}
            <div className="lg:col-span-3 relative overflow-hidden rounded-2xl p-8 flex flex-col justify-between min-h-[200px]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/15 to-blue-600/20" />
              <div className="absolute inset-0 border border-purple-500/20 rounded-2xl" />
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-5">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span className="text-xs font-medium text-purple-300">AI-Powered Learning</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                  Ready to level up<br />
                  <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                    your studies?
                  </span>
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                  Upload a PDF and experience AI-assisted learning — summaries, flashcards, and quizzes in seconds.
                </p>
              </div>

              <div className="relative z-10 mt-8">
                <button 
                  onClick={() => navigate('/upload')}
                  className="group/btn inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:scale-[1.02]"
                >
                  <Upload className="w-4 h-4" />
                  Upload a PDF
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Bottom spacing ── */}
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}