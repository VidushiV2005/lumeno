import { useState } from 'react';
import { 
  Upload, MessageSquare, FileText, Brain, CheckSquare, Eye, LogOut, 
  Home, Menu, X, User
} from "lucide-react";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  route?: string;
  section?: string;
}

interface UserData {
  name?: string | null;
  email?: string | null;
  photo?: string | null;
}

interface SidebarProps {
  activePage?: string;
  user?: UserData;
  onLogout?: () => void;
  onNavigate?: (route: string, label: string) => void;
}

const navigationItems: NavItem[] = [
  { icon: Home,         label: 'Home',       route: '/dashboard'                         },
  { icon: Upload,       label: 'PDF Upload', route: '/upload',    section: 'Study Tools' },
  { icon: MessageSquare,label: 'AI Chat',    route: '/chat'                              },
  { icon: FileText,     label: 'Summaries',  route: '/summaries'                         },
  { icon: Brain,        label: 'Flashcards', route: '/flashcards'                        },
  { icon: CheckSquare,  label: 'Quizzes',    route: '/quizzes'                           },
  { icon: Eye,          label: 'PDF Viewer', route: '/viewer'                            },
  { icon: User,         label: 'Account',    route: '/account',   section: 'Settings'   },
];

export default function Sidebar({ 
  activePage = 'Home',
  user = { name: 'User', email: 'user@example.com' },
  onLogout,
  onNavigate
}: SidebarProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState(activePage);

  const handleNavigation = (route: string, label: string) => {
    setActiveItem(label);
    if (onNavigate) onNavigate(route, label);
  };

  let lastSection = '';

  return (
    <div
      className={`${
        sidebarCollapsed ? 'w-20' : 'w-72'
      } flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300`}
      style={{
        background: 'linear-gradient(180deg, rgba(4,0,12,0.92) 0%, rgba(10,4,24,0.88) 100%)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(168,85,247,0.08)',
      }}
    >

      {/* ── Logo + Collapse ── */}
      <div className={`flex items-center border-b h-16 flex-shrink-0 px-4 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}
        style={{ borderColor: 'rgba(168,85,247,0.08)' }}>

        {/* LUMENO wordmark */}
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5">
            
            <span
              className="text-lg font-black tracking-[0.18em] bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent select-none"
            >
              LUMENO
            </span>
          </div>
        )}

        {/* Collapsed: just the icon */}
        {sidebarCollapsed && (
          <div className="flex items-center justify-center">
            <img src="/vite.svg" alt="Lumeno" className="w-8 h-8" />
          </div>
        )}

        {!sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-purple-500/10 text-purple-400/40 hover:text-purple-400 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapsed expand button */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="mx-auto mt-3 p-1.5 rounded-lg hover:bg-purple-500/10 text-purple-400/40 hover:text-purple-400 transition-all"
        >
          <Menu className="w-4 h-4" />
        </button>
      )}

      {/* ── Navigation ── */}
      <div
        className="flex-1 overflow-y-auto py-3 px-2.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          const isActive = activeItem === item.label;

          return (
            <div key={index}>
              {/* Section label */}
              {showSection && !sidebarCollapsed && (
                <div className="px-3 pt-5 pb-1.5">
                  <p className="text-[10px] font-semibold text-purple-400/30 uppercase tracking-[0.14em]">
                    {item.section}
                  </p>
                </div>
              )}
              {showSection && sidebarCollapsed && <div className="my-2 mx-3 h-px bg-purple-500/10" />}

              {/* Nav button */}
              <div className="relative group mb-0.5">
                <button
                  onClick={() => handleNavigation(item.route || '', item.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/25 to-pink-600/15 text-white'
                      : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-200'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  style={isActive ? { boxShadow: 'inset 0 0 0 1px rgba(168,85,247,0.2)' } : {}}
                >
                  {/* Active left bar */}
                  {isActive && !sidebarCollapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-gradient-to-b from-purple-400 to-pink-400" />
                  )}

                  <Icon
                    className={`w-[18px] h-[18px] flex-shrink-0 transition-all duration-200 ${
                      isActive
                        ? 'text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]'
                        : 'group-hover:text-purple-400/80'
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className={`text-sm transition-all ${isActive ? 'font-semibold' : 'font-normal'}`}>
                      {item.label}
                    </span>
                  )}
                </button>

                {/* Collapsed tooltip */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#111] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] pointer-events-none shadow-xl border border-purple-500/15">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[5px] w-2 h-2 bg-[#111] rotate-45 border-l border-b border-purple-500/15" />
                    {item.label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── User Card ── */}
      {!sidebarCollapsed && (
        <div className="px-3 pb-3 pt-2 flex-shrink-0" style={{ borderTop: '1px solid rgba(168,85,247,0.07)' }}>

          {/* Built by */}
          <p className="text-[10px] text-center text-gray-700 mb-2.5 tracking-wide">
            crafted by{' '}
            <span className="bg-gradient-to-r from-purple-400/70 to-pink-400/70 bg-clip-text text-transparent font-semibold">
              Vidushi
            </span>
          </p>

          {/* User row */}
          <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt="Profile"
                  className="w-8 h-8 rounded-lg ring-1 ring-purple-500/25 flex-shrink-0 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center ring-1 ring-purple-500/25 flex-shrink-0">
                  <span className="text-white font-semibold text-xs">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-200 truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-gray-600 truncate mt-0.5 leading-tight">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg hover:bg-red-500/15 text-gray-600 hover:text-red-400 transition-all flex-shrink-0"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Collapsed user avatar */}
      {sidebarCollapsed && (
        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(168,85,247,0.07)' }}>
          <div className="relative group flex flex-col items-center gap-2">
            {user.photo ? (
              <img
                src={user.photo}
                alt="Profile"
                className="w-8 h-8 rounded-lg ring-1 ring-purple-500/25 object-cover cursor-pointer hover:ring-purple-500/50 transition-all"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center ring-1 ring-purple-500/25 cursor-pointer hover:ring-purple-500/50 transition-all">
                <span className="text-white font-semibold text-xs">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}

            {/* Collapsed tooltip */}
            <div className="absolute left-full ml-3 bottom-0 px-3.5 py-3 bg-[#111] backdrop-blur-xl text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-2xl border border-purple-500/15 min-w-[180px]">
              <div className="absolute left-0 bottom-3 -translate-x-[5px] w-2 h-2 bg-[#111] rotate-45 border-l border-b border-purple-500/15" />
              <p className="font-semibold text-gray-100 truncate mb-0.5">{user.name}</p>
              <p className="text-[10px] text-gray-500 truncate mb-3">{user.email}</p>
              <button
                onClick={onLogout}
                className="w-full px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 rounded-lg text-red-400 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all"
              >
                <LogOut className="w-3 h-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}