import { useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../features/firebase";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../features/userSlice";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../store";
import LiquidEther from "../components/LiquidEther";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  // Redirect if already logged in
  useEffect(() => {
    if (user.uid) {
      navigate("/dashboard", { replace: true });
    }
  }, [user.uid, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      dispatch(setUser({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photo: user.photoURL,
      }));

      navigate("/dashboard"); 
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center">
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

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* LUMENO Title - Large and Glowing */}
        <h1 className="text-8xl md:text-9xl font-black tracking-tight mb-6 relative">
          <span className="absolute inset-0 blur-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-60"></span>
          <span className="relative bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
            LUMENO
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg md:text-xl mb-16 tracking-wide font-light">
          Your AI-Powered Study Companion
        </p>

        {/* Elegant Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          className="group relative px-12 py-5 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95"
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-75 group-hover:opacity-100 transition-opacity blur-sm"></div>
          
          {/* Inner background */}
          <div className="absolute inset-[2px] rounded-2xl bg-black/90 backdrop-blur-xl"></div>
          
          {/* Button content */}
          <div className="relative flex items-center gap-4">
            {/* Google Icon */}
            <div className="w-6 h-6 flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            
            {/* Text */}
            <span className="text-white font-medium text-lg tracking-wide">
              Continue with Google
            </span>
            
            {/* Arrow icon */}
            <svg 
              className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </button>

        {/* Bottom glow effect */}
        <div className="absolute -bottom-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
}