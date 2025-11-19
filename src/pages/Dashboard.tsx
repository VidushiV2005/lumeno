import { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { clearUser } from "../features/userSlice";
import { signOut } from "firebase/auth";
import { auth } from "../features/firebase";
import { useNavigate } from "react-router-dom";
import { Upload, MessageSquare, FileText, Brain, CheckSquare, Eye } from "lucide-react";
import LiquidEther from "../components/LiquidEther";
import Sidebar from "../components/Sidebar";
import gsap from 'gsap';

const DEFAULT_GLOW_COLOR = '132, 0, 255';
const DEFAULT_SPOTLIGHT_RADIUS = 300;

interface FeatureCard {
  color: string;
  title: string;
  description: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const featureCards: FeatureCard[] = [
  {
    color: '#060010',
    title: 'PDF Upload',
    description: 'Upload and manage your study materials',
    label: 'Documents',
    icon: Upload
  },
  {
    color: '#060010',
    title: 'AI Chat',
    description: 'Ask questions about your PDFs',
    label: 'Interactive',
    icon: MessageSquare
  },
  {
    color: '#060010',
    title: 'Summaries',
    description: 'Get instant AI-generated summaries',
    label: 'Quick Learn',
    icon: FileText
  },
  {
    color: '#060010',
    title: 'Flashcards',
    description: 'Create smart flashcards automatically',
    label: 'Memorize',
    icon: Brain
  },
  {
    color: '#060010',
    title: 'Quizzes',
    description: 'Test your knowledge with AI quizzes',
    label: 'Practice',
    icon: CheckSquare
  },
  {
    color: '#060010',
    title: 'PDF Viewer',
    description: 'Read PDFs with AI assistance sidebar',
    label: 'Study Mode',
    icon: Eye
  }
];

interface ParticleCardProps {
  card: FeatureCard;
  glowColor: string;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
}

const ParticleCard = ({ card, glowColor, enableTilt = true, enableMagnetism = true, clickEffect = true }: ParticleCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLElement[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const isHoveredRef = useRef(false);
  const Icon = card.icon;

  const createParticleElement = (x: number, y: number) => {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(${glowColor}, 1);
      box-shadow: 0 0 6px rgba(${glowColor}, 0.6);
      pointer-events: none;
      z-index: 100;
      left: ${x}px;
      top: ${y}px;
    `;
    return el;
  };

  const clearAllParticles = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        }
      });
    });
    particlesRef.current = [];
  };

  const animateParticles = () => {
    if (!cardRef.current || !isHoveredRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    
    for (let i = 0; i < 12; i++) {
      const timeoutId = window.setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const particle = createParticleElement(Math.random() * width, Math.random() * height);
        cardRef.current.appendChild(particle);
        particlesRef.current.push(particle);

        gsap.fromTo(particle, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

        gsap.to(particle, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true
        });

        gsap.to(particle, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true
        });
      }, i * 100);

      timeoutsRef.current.push(timeoutId);
    }
  };

  useEffect(() => {
    if (!cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;

        gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove()
        }
      );
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div
      ref={cardRef}
      className="magic-bento-card magic-bento-card--border-glow"
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: card.color,
        '--glow-color': glowColor,
        '--glow-x': '50%',
        '--glow-y': '50%',
        '--glow-intensity': '0',
        '--glow-radius': `${DEFAULT_SPOTLIGHT_RADIUS}px`
      } as React.CSSProperties}
    >
      <div className="magic-bento-card__header">
        <div className="magic-bento-card__label">{card.label}</div>
        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <Icon className="w-5 h-5 text-purple-400" />
        </div>
      </div>
      <div className="magic-bento-card__content">
        <h2 className="magic-bento-card__title">{card.title}</h2>
        <p className="magic-bento-card__description">{card.description}</p>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const gridRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());
    navigate("/login");
  };

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex">
      {/* Liquid Ether Background */}
      <div className="absolute inset-0 z-0">
        <LiquidEther
          colors={['#ec4899', '#a855f7', '#3b82f6']}
          mouseForce={30}
          cursorSize={150}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.6}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.3}
          autoIntensity={3.0}
          takeoverDuration={0.4}
          autoResumeDelay={2500}
          autoRampDuration={1.0}
        />
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/60 z-[1]"></div>

      {/* Sidebar */}
      <Sidebar
        activePage="Home"
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigation}
      />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-72 transition-all duration-300 overflow-y-auto">
        {/* Hero Section */}
        <div className="text-center py-16 px-6">
          <h2 className="text-7xl md:text-8xl font-black tracking-tight mb-4 relative">
            <span className="absolute inset-0 blur-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-60"></span>
            <span className="relative bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
              LUMENO
            </span>
          </h2>
          <p className="text-gray-400 text-lg tracking-wide font-light">
            Start Studying with AI-Powered Tools
          </p>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <style>{`
            .card-grid {
              display: grid;
              gap: 0.5em;
              font-size: clamp(1rem, 0.9rem + 0.5vw, 1.5rem);
            }

            .magic-bento-card {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
              aspect-ratio: 4/3;
              min-height: 200px;
              width: 100%;
              max-width: 100%;
              padding: 1.25em;
              border-radius: 20px;
              border: 1px solid #392e4e;
              background: #060010;
              font-weight: 300;
              overflow: hidden;
              transition: all 0.3s ease;
            }

            .magic-bento-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }

            .magic-bento-card__header,
            .magic-bento-card__content {
              display: flex;
              position: relative;
              color: white;
            }

            .magic-bento-card__header {
              gap: 0.75em;
              justify-content: space-between;
            }

            .magic-bento-card__content {
              flex-direction: column;
            }

            .magic-bento-card__label {
              font-size: 16px;
            }

            .magic-bento-card__title {
              font-weight: 400;
              font-size: 16px;
              margin: 0 0 0.25em;
            }

            .magic-bento-card__description {
              font-size: 12px;
              line-height: 1.2;
              opacity: 0.9;
            }

            .magic-bento-card--border-glow::after {
              content: '';
              position: absolute;
              inset: 0;
              padding: 6px;
              background: radial-gradient(
                var(--glow-radius) circle at var(--glow-x) var(--glow-y),
                rgba(132, 0, 255, calc(var(--glow-intensity) * 0.8)) 0%,
                rgba(132, 0, 255, calc(var(--glow-intensity) * 0.4)) 30%,
                transparent 60%
              );
              border-radius: inherit;
              mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              mask-composite: subtract;
              -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor;
              pointer-events: none;
              transition: opacity 0.3s ease;
              z-index: 1;
            }

            @media (max-width: 599px) {
              .card-grid {
                grid-template-columns: 1fr;
              }
            }

            @media (min-width: 600px) {
              .card-grid {
                grid-template-columns: repeat(2, 1fr);
              }
            }

            @media (min-width: 1024px) {
              .card-grid {
                grid-template-columns: repeat(4, 1fr);
              }

              .magic-bento-card:nth-child(3) {
                grid-column: span 2;
                grid-row: span 2;
              }

              .magic-bento-card:nth-child(4) {
                grid-column: 1 / span 2;
                grid-row: 2 / span 2;
              }

              .magic-bento-card:nth-child(6) {
                grid-column: 4;
                grid-row: 3;
              }
            }
          `}</style>

          <div className="card-grid" ref={gridRef}>
            {featureCards.map((card, index) => (
              <ParticleCard
                key={index}
                card={card}
                glowColor={DEFAULT_GLOW_COLOR}
                enableTilt={true}
                enableMagnetism={true}
                clickEffect={true}
              />
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h3 className="text-2xl font-semibold text-white">Ready to start?</h3>
              <p className="text-gray-400 mb-4">Upload your first PDF and experience AI-powered learning</p>
              <button className="group px-8 py-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-white font-medium transition-all duration-200 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <span>Upload PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}