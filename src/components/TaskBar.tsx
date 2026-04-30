"use client";

import { Home, Search, Plus, User, Shield, Briefcase, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TaskBar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  
  // Hide on login/register pages
  useEffect(() => {
    const hiddenRoutes = ['/login', '/register', '/citizen/login', '/validator/login', '/official/login'];
    const shouldHide = hiddenRoutes.some(route => pathname?.includes(route));
    setIsVisible(!shouldHide);
  }, [pathname]);

  if (!isVisible) return null;

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname?.includes('/citizen') && !pathname?.includes('/login')) return 'citizen';
    if (pathname?.includes('/validator') && !pathname?.includes('/login')) return 'validator';
    if (pathname?.includes('/official') && !pathname?.includes('/login')) return 'official';
    return 'home';
  };

  const activeTab = getActiveTab();

  const tabs = [
    { id: 'home', icon: Home, label: 'Home', href: '/' },
    { id: 'citizen', icon: User, label: 'Citizen', href: '/citizen' },
    { id: 'validator', icon: Shield, label: 'Validator', href: '/validator' },
    { id: 'official', icon: Briefcase, label: 'Official', href: '/official' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-2 py-2 shadow-2xl">
        <div className="flex items-center space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`
                  relative flex items-center justify-center w-12 h-12 rounded-full
                  transition-all duration-300 group
                  ${isActive 
                    ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500' 
                    : 'hover:bg-white/10'
                  }
                `}
              >
                <Icon 
                  className={`
                    w-5 h-5 transition-all duration-300
                    ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}
                  `} 
                />
                
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full animate-pulse" />
                )}
                
                {/* Tooltip */}
                <span className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-black text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Gradient glow effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-2xl -translate-y-1/2 rounded-full opacity-50" />
    </div>
  );
}