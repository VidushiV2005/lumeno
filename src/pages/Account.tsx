import { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { clearUser } from "../features/userSlice";
import { signOut, deleteUser } from "firebase/auth";
import { auth } from "../features/firebase";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Calendar, Shield, LogOut, Trash2,
  Brain, CheckSquare, MessageSquare, Upload,
  Edit3, Check, X, ChevronRight, Sparkles, Bell,
  Globe, Lock, AlertTriangle, Zap,
  TrendingUp, Award, FileText, Eye,
  Copy} from "lucide-react";
import LiquidEther from "../components/LiquidEther";
import Sidebar from "../components/Sidebar";
import gsap from 'gsap';

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface AccountStatProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
  delay: number;
}

const AccountStat = ({ icon: Icon, label, value, color, delay }: AccountStatProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay }
      );
    }
  }, []);

  return (
    <div ref={ref} className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.05] transition-all duration-300">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
        <div style={{ color }}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-white leading-none">{value}</p>
        <p className="text-[11px] text-gray-600 mt-1">{label}</p>
      </div>
    </div>
  );
};

// ─── Section Card ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  delay: number;
  children: React.ReactNode;
}

const SectionCard = ({ title, icon: Icon, iconColor = '#a855f7', delay, children }: SectionCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', delay }
      );
    }
  }, []);

  return (
    <div ref={ref} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${iconColor}18`, color: iconColor }}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
};

// ─── Toggle Row ───────────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}

const ToggleRow = ({ label, description, value, onChange, color = '#a855f7' }: ToggleRowProps) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-white/[0.05] last:border-0">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-200">{label}</p>
      <p className="text-xs text-gray-600 mt-0.5">{description}</p>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`flex-shrink-0 relative w-10 h-5.5 rounded-full transition-all duration-300 ${value ? 'bg-opacity-100' : 'bg-white/[0.08]'}`}
      style={value ? { background: `linear-gradient(135deg, ${color}cc, ${color})` } : {}}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${value ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  </div>
);

// ─── Account Page ─────────────────────────────────────────────────────────────

export default function AccountPage() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Display name editing
  const [displayName, setDisplayName] = useState(user.name ?? 'Student');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [nameSaved, setNameSaved] = useState(false);

  // Prefs
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    studyReminders: true,
    weeklyReport: false,
    darkMode: true,
    autoFlashcards: true,
    autoSummary: true,
  });

  // Danger zone modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const heroRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(heroRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.05 }
      );
    }
    if (avatarRef.current) {
      gsap.fromTo(avatarRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.4)', delay: 0.2 }
      );
    }
  }, []);

  const handleSaveName = () => {
    if (tempName.trim()) {
      setDisplayName(tempName.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    }
    setIsEditingName(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    try {
      const currentUser = auth.currentUser;
      if (currentUser) await deleteUser(currentUser);
      dispatch(clearUser());
      navigate("/login");
    } catch (err) {
      console.error('Delete account error:', err);
    }
  };

  const joinDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstInitial = (user.name ?? user.email ?? 'S').charAt(0).toUpperCase();

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
        activePage="Account"
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
        <div className="max-w-[900px] mx-auto px-10 py-10 space-y-8">

          {/* ── Breadcrumb ── */}
          <div className="pt-4 flex items-center gap-2.5">
            <span className="text-xs font-medium tracking-widest uppercase text-purple-400/70">Account</span>
            <span className="text-gray-700">·</span>
            <span className="text-xs text-gray-600">Profile & Settings</span>
          </div>

          {/* ── Hero Profile Card ── */}
          <div ref={heroRef} className="relative overflow-hidden rounded-2xl border border-white/[0.08]">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-pink-600/10 to-blue-600/15" />
            <div className="absolute inset-0 border border-white/[0.05] rounded-2xl" />
            {/* Orbs */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 p-8">
              <div className="flex items-start gap-7 flex-wrap">

                {/* Avatar */}
                <div ref={avatarRef} className="relative flex-shrink-0">
                  <div className="relative w-24 h-24">
                    {user.photo ? (
                      <img
                        src={user.photo}
                        alt="Profile"
                        className="w-24 h-24 rounded-2xl ring-2 ring-purple-500/40 object-cover shadow-xl shadow-purple-500/20"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center ring-2 ring-purple-500/40 shadow-xl shadow-purple-500/20">
                        <span className="text-3xl font-bold text-white">{firstInitial}</span>
                      </div>
                    )}
                    {/* Online dot */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-black flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Name row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={tempName}
                          onChange={e => setTempName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setIsEditingName(false); }}
                          className="text-2xl font-bold bg-white/[0.06] border border-purple-500/40 rounded-xl px-3 py-1 text-white outline-none focus:border-purple-500/70 transition-all w-64"
                        />
                        <button onClick={handleSaveName} className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsEditingName(false)} className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-gray-500 hover:text-gray-300 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white tracking-tight">{displayName}</h1>
                        <button
                          onClick={() => { setTempName(displayName); setIsEditingName(true); }}
                          className="p-1.5 rounded-lg hover:bg-white/[0.07] text-gray-600 hover:text-gray-300 transition-all"
                          title="Edit display name"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {nameSaved && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <Check className="w-3 h-3" /> Saved
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                    <span>{user.email}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <Shield className="w-2.5 h-2.5" /> Verified
                    </span>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      Joined {joinDate}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3" />
                      Google Account
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400 font-medium">12-day streak</span>
                    </span>
                  </div>

                  {/* Plan badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/25">
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                    <span className="text-xs font-semibold text-purple-200">Free Plan</span>
                    <span className="text-gray-600">·</span>
                    <button className="text-xs text-pink-400 hover:text-pink-300 font-medium transition-colors flex items-center gap-1">
                      Upgrade to Pro <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Sign out button */}
                <button
                  onClick={handleLogout}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-red-500/10 hover:border-red-500/25 text-sm text-gray-400 hover:text-red-400 font-medium transition-all duration-300 self-start"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* ── Activity Stats ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white">Study Activity</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <AccountStat icon={FileText}    label="PDFs Uploaded"     value="24"       color="#a855f7" delay={0.15} />
              <AccountStat icon={MessageSquare} label="AI Chats"        value="156"      color="#ec4899" delay={0.2}  />
              <AccountStat icon={Brain}       label="Flashcards"        value="438"      color="#3b82f6" delay={0.25} />
              <AccountStat icon={CheckSquare} label="Quizzes Taken"     value="31"       color="#10b981" delay={0.3}  />
              <AccountStat icon={Eye}         label="Pages Read"        value="1,204"    color="#f59e0b" delay={0.35} />
              <AccountStat icon={Award}       label="Best Streak"       value="12 days"  color="#f43f5e" delay={0.4}  />
            </div>
          </div>

          {/* ── Two column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Profile Details */}
            <SectionCard title="Profile Details" icon={User} iconColor="#a855f7" delay={0.25}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</label>
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                    <span className="text-sm text-gray-200">{displayName}</span>
                    <button
                      onClick={() => { setTempName(displayName); setIsEditingName(true); }}
                      className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                    <span className="text-sm text-gray-400">{user.email}</span>
                    <span className="text-[10px] text-gray-600 flex items-center gap-1"><Lock className="w-3 h-3" />Via Google</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Auth Provider</label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
                      <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm text-gray-300">Google</span>
                    <span className="ml-auto text-[10px] text-emerald-400 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <Shield className="w-2.5 h-2.5" /> Active
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</label>
                  <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                    <span className="text-xs text-gray-600 font-mono truncate">{user.uid ?? 'uid_xxxxxxxxxxxxxxxx'}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(user.uid ?? '')}
                      className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/[0.08] text-gray-600 hover:text-gray-400 transition-all"
                      title="Copy UID"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Notifications */}
            <SectionCard title="Notifications" icon={Bell} iconColor="#ec4899" delay={0.3}>
              <div className="divide-y divide-white/[0.05]">
                <ToggleRow
                  label="Email Notifications"
                  description="Receive updates and summaries via email"
                  value={prefs.emailNotifications}
                  onChange={v => setPrefs(p => ({ ...p, emailNotifications: v }))}
                  color="#ec4899"
                />
                <ToggleRow
                  label="Study Reminders"
                  description="Daily nudges to keep your streak going"
                  value={prefs.studyReminders}
                  onChange={v => setPrefs(p => ({ ...p, studyReminders: v }))}
                  color="#a855f7"
                />
                <ToggleRow
                  label="Weekly Progress Report"
                  description="Summary of your study activity each week"
                  value={prefs.weeklyReport}
                  onChange={v => setPrefs(p => ({ ...p, weeklyReport: v }))}
                  color="#3b82f6"
                />
              </div>
            </SectionCard>

            {/* AI Preferences */}
            <SectionCard title="AI Preferences" icon={Sparkles} iconColor="#3b82f6" delay={0.35}>
              <div className="divide-y divide-white/[0.05]">
                <ToggleRow
                  label="Auto-generate Flashcards"
                  description="Automatically create flashcards when a PDF is uploaded"
                  value={prefs.autoFlashcards}
                  onChange={v => setPrefs(p => ({ ...p, autoFlashcards: v }))}
                  color="#3b82f6"
                />
                <ToggleRow
                  label="Auto-generate Summary"
                  description="Instantly summarise every uploaded document"
                  value={prefs.autoSummary}
                  onChange={v => setPrefs(p => ({ ...p, autoSummary: v }))}
                  color="#a855f7"
                />
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                  <div>
                    <p className="text-sm font-medium text-gray-200">AI Model</p>
                    <p className="text-xs text-gray-600 mt-0.5">Current generation model</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-purple-300 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/25">Lumeno AI v1</span>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Quick Links */}
            <SectionCard title="Quick Navigation" icon={Zap} iconColor="#f59e0b" delay={0.4}>
              <div className="space-y-2">
                {[
                  { label: 'My Summaries',   icon: FileText,    color: '#a855f7', route: '/summaries'  },
                  { label: 'Flashcard Decks', icon: Brain,       color: '#3b82f6', route: '/flashcards' },
                  { label: 'Quiz History',   icon: CheckSquare, color: '#10b981', route: '/quizzes'    },
                  { label: 'AI Chat',        icon: MessageSquare, color: '#ec4899', route: '/chat'     },
                  { label: 'PDF Library',    icon: Eye,         color: '#f59e0b', route: '/viewer'     },
                  { label: 'Upload PDF',     icon: Upload,      color: '#06b6d4', route: '/upload'     },
                ].map(({ label, icon: Icon, color, route }) => (
                  <button
                    key={route}
                    onClick={() => navigate(route)}
                    className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.05] transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <span className="flex-1 text-sm text-gray-300 text-left font-medium">{label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* ── Danger Zone ── */}
          <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-500/[0.04]">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-600/8 to-transparent rounded-2xl pointer-events-none" />
            <div className="relative z-10 p-6 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500/15 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <h2 className="text-sm font-semibold text-rose-300">Danger Zone</h2>
              </div>

              <div className="flex items-center justify-between gap-6 flex-wrap p-4 rounded-xl bg-white/[0.02] border border-rose-500/15">
                <div>
                  <p className="text-sm font-semibold text-white">Delete Account</p>
                  <p className="text-xs text-gray-500 mt-0.5">Permanently remove your account and all associated data. This action cannot be undone.</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-sm text-rose-400 font-semibold transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>

              <div className="flex items-center justify-between gap-6 flex-wrap p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <p className="text-sm font-semibold text-white">Sign Out Everywhere</p>
                  <p className="text-xs text-gray-500 mt-0.5">Sign out of all active sessions on all devices.</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] hover:bg-white/[0.08] text-sm text-gray-400 hover:text-white font-semibold transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between py-4 border-t border-white/[0.05] text-xs text-gray-700">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-bold tracking-widest">LUMENO</span>
            <span>© {new Date().getFullYear()} · All rights reserved</span>
          </div>

          <div className="h-4" />
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-[#0c0c14] border border-rose-500/25 shadow-2xl shadow-rose-900/30 overflow-hidden p-6 space-y-5">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-600/10 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete Account</h3>
                  <p className="text-xs text-gray-500">This cannot be undone</p>
                </div>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed mb-5">
                All your PDFs, summaries, flashcards, quiz history, and notes will be <strong className="text-rose-400">permanently deleted</strong>. Your account cannot be recovered after deletion.
              </p>

              <div className="space-y-2 mb-5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type <span className="text-rose-400 font-bold">DELETE</span> to confirm
                </label>
                <input
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-rose-500/25 focus:border-rose-500/50 text-sm text-gray-200 placeholder-gray-700 outline-none transition-all font-mono tracking-widest"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-gray-300 font-semibold hover:bg-white/[0.09] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== 'DELETE'}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-sm text-rose-300 font-semibold hover:bg-rose-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}