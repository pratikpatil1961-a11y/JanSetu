"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function SpaceBackground() {
  const [theme, setTheme] = useState<"light" | "dark">("dark"); // Default to dark for the space theme!
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sb_theme");
    // If not set, default to dark for the cool space effect
    if (saved === "light") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("sb_theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("sb_theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("sb_theme", "light");
    }
  };

  // Generate random stars
  const [stars] = useState(() => Array.from({ length: 200 }).map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
  })));

  // Shooting stars
  const [shootingStars] = useState(() => Array.from({ length: 5 }).map(() => ({
    top: Math.random() * 50,
    delay: Math.random() * 10 + 2,
    duration: Math.random() * 2 + 1,
  })));

  if (!mounted) return null;

  return (
    <>
      <button 
        onClick={toggleTheme}
        className={`fixed bottom-6 left-6 z-50 p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 ${
          theme === "light" 
            ? "bg-amber-100 text-amber-600 hover:bg-amber-200" 
            : "bg-slate-800 text-indigo-300 hover:bg-slate-700 hover:shadow-indigo-500/50"
        }`}
        aria-label="Toggle Dark Mode"
      >
        {theme === "light" ? <Sun className="w-6 h-6 animate-[spin_10s_linear_infinite]" /> : <Moon className="w-6 h-6" />}
      </button>

      <div className={`fixed inset-0 z-[-10] pointer-events-none transition-colors duration-1000 ${theme === 'dark' ? 'bg-[#050510]' : 'bg-sky-50'}`}>
        
        {/* Dark Mode: Space Nebula & Stars */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
          {/* Deep Space Nebula */}
          <div className="absolute top-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-indigo-900/30 filter blur-[120px] mix-blend-screen animate-[float-slow_25s_infinite_alternate]" />
          <div className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-900/20 filter blur-[100px] mix-blend-screen animate-[float-fast_20s_infinite_alternate-reverse]" />
          <div className="absolute top-[40%] left-[50%] w-[40vw] h-[40vw] rounded-full bg-blue-900/20 filter blur-[130px] mix-blend-screen animate-[float-slow_30s_infinite_alternate]" />
          
          {/* Static Twinkling Stars */}
          {stars.map((star, i) => (
            <div 
              key={i}
              className="absolute bg-white rounded-full star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                '--duration': `${star.duration}s`,
                '--delay': `${star.delay}s`,
                boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)`
              } as any}
            />
          ))}

          {/* Shooting Stars */}
          {shootingStars.map((meteor, i) => (
            <div 
              key={`meteor-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent shooting-star"
              style={{
                top: `${meteor.top}%`,
                left: '-10%',
                width: '150px',
                transform: 'rotate(-45deg)',
                animation: `shoot ${meteor.duration}s linear infinite`,
                animationDelay: `${meteor.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Light Mode: Realistic Village & Gram Panchayat */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* Realistic Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[60s] ease-linear hover:scale-110"
            style={{ 
              backgroundImage: 'url(/village-bg.png)',
              filter: 'contrast(1.1) brightness(1.1) saturate(1.2)'
            }}
          />
          
          {/* Glass Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]"></div>

          {/* Animated Sun Flare over the image */}
          <div className="absolute top-[5%] right-[10%] w-40 h-40 rounded-full bg-yellow-300/40 filter blur-[60px] animate-[pulse_5s_infinite]" />

          {/* Drifting Clouds overlay for extra realism */}
          <div className="absolute top-[10%] left-[10%] opacity-70 animate-[cloud-drift_50s_linear_infinite]">
            <div className="w-48 h-16 bg-white/80 rounded-full blur-[4px]"></div>
            <div className="w-24 h-24 bg-white/80 rounded-full absolute -top-10 left-8 blur-[4px]"></div>
          </div>
          
          <div className="absolute top-[20%] left-[60%] opacity-50 animate-[cloud-drift_70s_linear_infinite_reverse]">
            <div className="w-64 h-20 bg-white/70 rounded-full blur-[6px]"></div>
            <div className="w-32 h-32 bg-white/70 rounded-full absolute -top-16 left-12 blur-[6px]"></div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shoot {
          0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 1; }
          100% { transform: translateX(200vw) translateY(200vh) rotate(-45deg); opacity: 0; }
        }
        @keyframes cloud-drift {
          0% { transform: translateX(-30vw); }
          100% { transform: translateX(130vw); }
        }
      `}} />
    </>
  );
}
