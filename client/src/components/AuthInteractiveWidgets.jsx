import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, Heart, Code2, Database, 
  Server, Cpu, Sparkles, Shield, Globe, 
  Layers, Check, ExternalLink, Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function LiveTimeDateWidget({ variant = 'default' }) {
  const { t, formatDate } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);
  const [showTimezone, setShowTimezone] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time
  const hours = currentTime.getHours();
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');
  
  let formattedTime = '';
  let ampm = '';

  if (is24Hour) {
    formattedTime = `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
  } else {
    const hour12 = hours % 12 || 12;
    ampm = hours >= 12 ? 'PM' : 'AM';
    formattedTime = `${hour12}:${minutes}:${seconds}`;
  }

  // Dynamic Greeting based on time of day and selected language
  const getGreeting = () => {
    if (hours < 12) return { text: t('greetingMorning'), icon: '🌅' };
    if (hours < 18) return { text: t('greetingAfternoon'), icon: '☀️' };
    return { text: t('greetingEvening'), icon: '🌙' };
  };

  const greeting = getGreeting();

  // Dynamic Date in English or French
  const formattedDate = formatDate(currentTime, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div 
      className="w-full mb-6 select-none transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/90 to-purple-950/90 text-white p-4 border border-indigo-500/30 shadow-lg shadow-indigo-950/20 backdrop-blur-md">
        {/* Subtle decorative ambient glow */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          {/* Date & Greeting Column */}
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-indigo-300 font-semibold text-xs tracking-wide">
              <span>{greeting.icon}</span>
              <span>{greeting.text}!</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" title={t('liveSystemSync')} />
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-300 font-medium capitalize">
              <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Dynamic Time Clock with 12h/24h toggle on click */}
          <div className="flex flex-col items-center sm:items-end">
            <button
              type="button"
              onClick={() => setIs24Hour(!is24Hour)}
              title={t('toggleTimeFormat')}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition active:scale-95 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-45 transition-transform duration-300" />
              <span className="font-mono text-base sm:text-lg font-black tracking-wider text-white">
                {formattedTime}
              </span>
              {ampm && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/40 text-indigo-200 uppercase">
                  {ampm}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setShowTimezone(!showTimezone)}
                className="text-[10px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition cursor-pointer"
              >
                <Globe className="w-2.5 h-2.5" />
                <span>{showTimezone ? timezoneName : (t('tzLabel') + ': ' + (timezoneName.split('/')[1] || timezoneName))}</span>
              </button>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-[9px] text-indigo-300/80 font-mono">
                {is24Hour ? t('timeFormat24') : t('timeFormat12')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InteractiveAuthFooter() {
  const { language, t } = useLanguage();
  const [heartLikes, setHeartLikes] = useState(() => {
    const saved = localStorage.getItem('pro_task_manager_likes');
    return saved ? parseInt(saved, 10) : 94;
  });
  const [hasLiked, setHasLiked] = useState(false);
  const [activeStackInfo, setActiveStackInfo] = useState(null);

  const handleHeartClick = () => {
    const nextLikes = hasLiked ? heartLikes - 1 : heartLikes + 1;
    setHeartLikes(nextLikes);
    setHasLiked(!hasLiked);
    localStorage.setItem('pro_task_manager_likes', nextLikes.toString());
  };

  const mernStack = [
    { 
      letter: 'M', 
      name: 'MongoDB', 
      color: 'from-emerald-500 to-green-600', 
      badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      role: language === 'fr' 
        ? 'Base de données documentaire NoSQL & Schéma de cache' 
        : 'NoSQL Document Database & Caching Schema' 
    },
    { 
      letter: 'E', 
      name: 'Express.js', 
      color: 'from-slate-600 to-slate-800', 
      badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
      role: language === 'fr' 
        ? 'API RESTful & Architecture de middlewares' 
        : 'RESTful API & Middleware Architecture' 
    },
    { 
      letter: 'R', 
      name: 'React 18', 
      color: 'from-cyan-500 to-blue-600', 
      badge: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
      role: language === 'fr' 
        ? 'Composants interactifs & Interface Tailwind UI' 
        : 'Interactive Component Layer & Tailwind UI' 
    },
    { 
      letter: 'N', 
      name: 'Node.js', 
      color: 'from-lime-500 to-emerald-600', 
      badge: 'bg-lime-500/10 text-lime-700 dark:text-lime-400 border-lime-500/20',
      role: language === 'fr' 
        ? 'Backend haute performance orienté événements' 
        : 'High-Performance Event-Driven Backend' 
    },
  ];

  return (
    <div className="mt-8 space-y-4 text-center select-none">
      {/* Interactive Creator Card & Loving Signature */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-sm transition-all hover:border-indigo-500/40">
        <div className="flex flex-col items-center justify-center gap-2">
          {/* Main Statement required by user */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-black tracking-tight">
              Pro Task Manager
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-normal">
              {language === 'fr' ? 'créé par' : 'building By'}
            </span>
            <span className="font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300">
              Yassine Kalthoum
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-normal">
              {language === 'fr' ? 'avec' : 'with'}
            </span>
            
            {/* Interactive Love Button */}
            <button
              type="button"
              onClick={handleHeartClick}
              title={hasLiked ? t('lovedTooltip') : t('clickToSendLove')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all transform active:scale-90 cursor-pointer ${
                hasLiked
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 transition-transform ${hasLiked ? 'fill-current animate-bounce' : 'fill-rose-500/40 hover:scale-125'}`} />
              <span>{language === 'fr' ? 'amour' : 'love'} ({heartLikes})</span>
            </button>
          </div>

          {/* Interactive MERN Stack Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mr-1">
              {language === 'fr' ? 'avec la suite' : 'using'}
            </span>
            {mernStack.map((tech) => (
              <button
                key={tech.letter}
                type="button"
                onClick={() => setActiveStackInfo(activeStackInfo?.letter === tech.letter ? null : tech)}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  activeStackInfo?.letter === tech.letter
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-105'
                    : tech.badge + ' hover:scale-105'
                }`}
                title={`Click for ${tech.name} details`}
              >
                <span className="underline decoration-indigo-400 decoration-2">{tech.letter}</span>
                <span>{tech.name.substring(1)}</span>
              </button>
            ))}
          </div>

          {/* Stack Info Popover if clicked */}
          {activeStackInfo && (
            <div className="mt-2 p-2.5 rounded-xl bg-indigo-50 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-800 text-left text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150 w-full max-w-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-700 dark:text-indigo-300">
                  {activeStackInfo.name}
                </span>
                <span className="text-[10px] text-slate-400">MERN Component</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                {activeStackInfo.role}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Copyright & All rights reserved */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
        <Shield className="w-3 h-3 text-indigo-500/70" />
        <span>© {new Date().getFullYear()} Pro Task Manager. {language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</span>
      </div>
    </div>
  );
}

