import { useState } from 'react';
import { 
  Upload, MessageSquare, FileText, Brain, CheckSquare, Eye, LogOut, 
  Home, Menu, X, Sun, Moon, User
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
  { icon: Home, label: 'Home', route: '/dashboard' },
  { icon: Upload, label: 'PDF Upload', route: '/upload', section: 'Study Tools' },
  { icon: MessageSquare, label: 'AI Chat', route: '/chat' },
  { icon: FileText, label: 'Summaries', route: '/summaries' },
  { icon: Brain, label: 'Flashcards', route: '/flashcards' },
  { icon: CheckSquare, label: 'Quizzes', route: '/quizzes' },
  { icon: Eye, label: 'PDF Viewer', route: '/viewer' },
];

export default function Sidebar({ 
  activePage = 'Home',
  user = { name: 'User', email: 'user@example.com' },
  onLogout,
  onNavigate
}: SidebarProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState(activePage);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleNavigation = (route: string, label: string) => {
    setActiveItem(label);
    if (onNavigate) {
      onNavigate(route, label);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  let lastSection = '';

  return (
    <div
      className={`${
        sidebarCollapsed ? 'w-20' : 'w-72'
      } bg-black/40 backdrop-blur-2xl border-r border-purple-500/10 transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-50`}
      style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(16,6,32,0.5) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Toggle Button */}
      <div className="p-4 border-b border-purple-500/10 flex items-center justify-end">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-lg hover:bg-purple-500/10 text-purple-400/60 hover:text-purple-400 transition-all hover:shadow-lg hover:shadow-purple-500/20"
        >
          {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;

          return (
            <div key={index}>
              {showSection && !sidebarCollapsed && (
                <div className="px-3 py-2 mt-4 mb-2">
                  <p className="text-xs font-medium text-purple-400/40 uppercase tracking-wider">
                    {item.section}
                  </p>
                </div>
              )}
              <div className="relative mb-1">
                <div className={`group ${sidebarCollapsed ? 'relative' : ''}`}>
                  <button
                    onClick={() => handleNavigation(item.route || '', item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                      activeItem === item.label
                        ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/20 text-white shadow-lg shadow-purple-500/20'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-all ${
                      activeItem === item.label 
                        ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' 
                        : 'group-hover:text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                    }`} />
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </button>

                  {/* Tooltip on hover for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 ease-out whitespace-nowrap z-[100] pointer-events-none shadow-2xl border border-purple-500/20">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[5px] w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-purple-500/20"></div>
                      {item.label}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Settings Section */}
        <div className="mt-6">
          {!sidebarCollapsed && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-medium text-purple-400/40 uppercase tracking-wider">
                Settings
              </p>
            </div>
          )}

          {/* Light/Dark Mode Toggle */}
          <div className="relative group mb-1">
            

            {sidebarCollapsed && (
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 ease-out whitespace-nowrap z-[100] pointer-events-none shadow-2xl border border-purple-500/20">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[5px] w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-purple-500/20"></div>
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </div>
            )}
          </div>

          {/* Account */}
          <div className="relative group mb-1">
            <button
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-gray-400 hover:bg-white/5 hover:text-white ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <User className="w-5 h-5 flex-shrink-0 group-hover:text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] transition-all" />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">Account</span>
              )}
            </button>

            {sidebarCollapsed && (
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 ease-out whitespace-nowrap z-[100] pointer-events-none shadow-2xl border border-purple-500/20">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[5px] w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-purple-500/20"></div>
                Account
              </div>
            )}
          </div>
        </div>
      </div>

     
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-purple-500/10">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all backdrop-blur-sm">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {user.photo ? (
                <img src={user.photo} alt="Profile" className="w-10 h-10 rounded-full ring-2 ring-purple-500/30" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center ring-2 ring-purple-500/30">
                  <span className="text-white font-semibold text-sm">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            </button>
          </div>
        </div>
      )}

     
      {sidebarCollapsed && (
        <div className="p-4 border-t border-purple-500/10">
          <div className="relative group">
            {user.photo ? (
              <img 
                src={user.photo} 
                alt="Profile" 
                className="w-10 h-10 rounded-full ring-2 ring-purple-500/30 mx-auto cursor-pointer hover:ring-purple-500/60 transition-all" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center ring-2 ring-purple-500/30 mx-auto cursor-pointer hover:ring-purple-500/60 transition-all">
                <span className="text-white font-semibold text-sm">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            
            {/* Tooltip showing user info and logout */}
            <div className="absolute left-full ml-4 bottom-0 px-4 py-3 bg-gray-900 backdrop-blur-xl text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out whitespace-nowrap z-[100] shadow-2xl border border-purple-500/20 min-w-[200px]">
              <div className="absolute left-0 bottom-4 -translate-x-[5px] w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-purple-500/20"></div>
              <p className="font-medium mb-1">{user.name}</p>
              <p className="text-xs text-gray-300 mb-3">{user.email}</p>
              <div className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer">
                <LogOut className="w-3 h-3" />
                Logout
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}