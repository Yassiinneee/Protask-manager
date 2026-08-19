import React, { useState, useRef } from 'react';
import { Sparkles, CheckCircle2, Layers, Zap } from 'lucide-react';

/**
 * Modern, High-End Interactive Logo Component
 * Features:
 * - 3D Gyroscopic Cursor Tilt on Hover
 * - Orbiting Energy Particle Ring with Speed-Up on Hover
 * - Micro Particle Sparkle Burst on Click
 * - Shimmering Gradient Typography with Live Pulse Node
 * - Multi-variant support: 'header', 'large', 'compact', 'footer'
 */
export default function Logo({
  variant = 'header',
  onClick,
  showTagline = false,
  showStatus = true,
  className = '',
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState([]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Handle subtle 3D interactive tilt on mouse move
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Normalized tilt angle (max +/- 10 degrees)
    setTilt({
      x: -(y / (rect.height / 2)) * 10,
      y: (x / (rect.width / 2)) * 10,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Trigger playful sparkle particle burst on click
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newParticles = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 60,
      size: Math.random() * 8 + 6,
      color: ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b'][i % 5],
    }));

    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 700);

    if (onClick) onClick(e);
  };

  // Dimensions based on variant
  const isLarge = variant === 'large';
  const isCompact = variant === 'compact';
  const isFooter = variant === 'footer';

  const iconBoxSize = isLarge
    ? 'w-16 h-16 sm:w-20 sm:h-20'
    : isCompact || isFooter
    ? 'w-8 h-8'
    : 'w-11 h-11 sm:w-12 sm:h-12';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
      }}
      className={`relative inline-flex items-center gap-3 select-none cursor-pointer group ${className}`}
    >
      {/* Visual Ambient Glow Backdrop */}
      <div
        className={`absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
          isHovered ? 'scale-110' : ''
        }`}
      />

      {/* Emblem Icon Container */}
      <div className={`relative ${iconBoxSize} flex items-center justify-center shrink-0`}>
        {/* Animated Outer Orbit Ring with Glow */}
        <div
          className={`absolute -inset-1 rounded-2xl sm:rounded-3xl border border-dashed border-indigo-400/40 dark:border-indigo-400/30 transition-all duration-700 pointer-events-none ${
            isHovered
              ? 'scale-115 rotate-180 border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
              : 'scale-100 rotate-0'
          }`}
        />

        {/* Outer Tech Orbit Dots */}
        <div
          className={`absolute -inset-1.5 flex items-center justify-between pointer-events-none transition-transform duration-1000 ${
            isHovered ? 'rotate-90 scale-110' : 'rotate-0'
          }`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
        </div>

        {/* Main Emblem Core Body */}
        <div className="relative w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 dark:from-indigo-500 dark:via-purple-600 dark:to-cyan-600 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/50 transition-all duration-300 transform group-hover:scale-105 overflow-hidden">
          {/* Inner Gloss / Shimmer Sweep */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />

          {/* Inner Plate */}
          <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs flex items-center justify-center relative">
            {/* Custom SVG Geometric Task Diamond / Check Nexus */}
            <svg
              className={`w-3/5 h-3/5 text-white transition-transform duration-500 ${
                isHovered ? 'scale-110 rotate-6' : 'scale-100 rotate-0'
              }`}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Diamond Node Background */}
              <path
                d="M12 2L21 7.5V16.5L12 22L3 16.5V7.5L12 2Z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-indigo-200/50"
              />
              {/* Inner Node Cross Flow */}
              <path
                d="M12 22V12M12 12L21 7.5M12 12L3 7.5"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-300/60"
              />
              {/* Dynamic Luminous Checkmark */}
              <path
                d="M8.5 12L11 14.5L16 9.5"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_6px_rgba(56,189,248,0.9)]"
              />
              {/* Center Sparkle Node */}
              <circle cx="12" cy="12" r="1.5" fill="#ffffff" className="animate-ping opacity-75" />
            </svg>

            {/* Sparkle badge on top corner */}
            <Sparkles className="absolute top-1 right-1 w-2.5 h-2.5 text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-spin" />
          </div>
        </div>

        {/* Click Burst Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              transform: `translate(${p.x}px, ${p.y}px) scale(0)`,
              backgroundColor: p.color,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
            className="absolute rounded-full pointer-events-none animate-ping z-30"
          />
        ))}
      </div>

      {/* Typography & Brand Name */}
      {!isCompact && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${
                isLarge
                  ? 'text-2xl sm:text-3xl'
                  : isFooter
                  ? 'text-sm font-bold'
                  : 'text-lg sm:text-xl'
              } text-slate-900 dark:text-white flex items-center gap-1.5`}
            >
              {/* "Pro" highlighted with modern pill or gradient */}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-300 dark:to-cyan-300 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                Pro
              </span>
              <span>Task</span>
              <span className="font-light text-slate-700 dark:text-slate-300">
                Manager
              </span>
            </span>

            {/* Active Live Pulse Badge */}
            {showStatus && !isFooter && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE</span>
              </span>
            )}
          </div>

          {/* Optional Tagline or Subtitle */}
          {showTagline ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <Zap className="w-3 h-3 text-amber-500 inline" />
              <span>Full-Stack Cloud Task Orchestrator</span>
            </p>
          ) : (
            isLarge && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <Layers className="w-3 h-3 text-indigo-500" />
                <span>High-Performance Productivity Hub</span>
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}