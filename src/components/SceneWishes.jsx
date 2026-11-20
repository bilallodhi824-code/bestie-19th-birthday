import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { BIRTHDAY_WISHES } from '../data/wishes';
import {
  Play, Pause, FastForward, ArrowDown, Sparkles, BookOpen, Heart,
  ChevronDown, ChevronUp, CheckCircle2, RotateCcw, Volume2, VolumeX
} from 'lucide-react';

export default function SceneWishes({ onProceedToLetter, isAudioPlaying, onToggleAudio }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0); // 0.6: Gentle, 1.0: Normal, 1.6: Swift
  const [hasCompletedAll, setHasCompletedAll] = useState(false);
  const [currentWishIndex, setCurrentWishIndex] = useState(0);
  const [isUserHovering, setIsUserHovering] = useState(false);

  const reelRef = useRef(null);
  const scrollPosRef = useRef(0);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Auto-scrolling loop using smooth subpixel translation on the reel container
  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;

    lastTimeRef.current = performance.now();

    const scrollLoop = (time) => {
      const delta = (time - (lastTimeRef.current || time)) / 1000;
      lastTimeRef.current = time;

      if (isPlaying && !isUserHovering && !hasCompletedAll && reel) {
        // Base pixels per second (around 38px/sec at 1.0x)
        const pixelsPerSec = 38 * speed;
        scrollPosRef.current += pixelsPerSec * delta;

        const maxScroll = reel.scrollHeight - reel.clientHeight;

        if (scrollPosRef.current >= maxScroll) {
          scrollPosRef.current = maxScroll;
          reel.scrollTop = maxScroll;
          if (!hasCompletedAll) {
            setHasCompletedAll(true);
            setIsPlaying(false);
            // Celebration confetti
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.75 },
              colors: ['#f43f5e', '#ec4899', '#fbcfe8', '#ffd700']
            });
          }
        } else {
          reel.scrollTop = scrollPosRef.current;
        }
      }

      animFrameRef.current = requestAnimationFrame(scrollLoop);
    };

    animFrameRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isUserHovering, speed, hasCompletedAll]);

  // Sync scroll position when user manually scrolls or touches
  const handleScroll = () => {
    const reel = reelRef.current;
    if (!reel) return;
    scrollPosRef.current = reel.scrollTop;

    // Track active card
    const cards = reel.querySelectorAll('.wish-card');
    const midPoint = reel.scrollTop + reel.clientHeight * 0.4;
    cards.forEach((card, idx) => {
      if (card.offsetTop <= midPoint && card.offsetTop + card.offsetHeight >= midPoint) {
        setCurrentWishIndex(idx);
      }
    });

    const maxScroll = reel.scrollHeight - reel.clientHeight;
    if (reel.scrollTop >= maxScroll - 30 && !hasCompletedAll) {
      setHasCompletedAll(true);
      setIsPlaying(false);
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#f43f5e', '#a855f7', '#fbbf24']
      });
    }
  };

  const handleFinish = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#a855f7', '#fbbf24']
    });
    setTimeout(() => {
      onProceedToLetter();
    }, 500);
  };

  // Jump to specific wish
  const scrollToWish = (index) => {
    const reel = reelRef.current;
    if (!reel) return;
    const cards = reel.querySelectorAll('.wish-card');
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
      setCurrentWishIndex(index);
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-between max-w-4xl mx-auto px-4 sm:px-6 py-6 text-slate-100">
      {/* Top Floating Control Bar */}
      <header className="p-3 sm:p-4 rounded-2xl glass-panel border border-slate-700/60 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Progress & Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Heart className="w-4 h-4 fill-rose-500/40 text-rose-400" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
              <span>Birthday Wishes</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-rose-300 border border-slate-700">
                {currentWishIndex + 1} / {BIRTHDAY_WISHES.length}
              </span>
            </div>
            <div className="w-28 sm:w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-purple-500 transition-all duration-300"
                style={{ width: `${Math.round(((currentWishIndex + 1) / BIRTHDAY_WISHES.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scroll Controls (Play/Pause, Speed, Skip) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => setIsPlaying(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              isPlaying
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
            title={isPlaying ? "Pause auto-scroll" : "Start auto-scroll"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? "Pause" : "Scroll"}</span>
          </button>

          {/* Speed cycle */}
          <button
            onClick={() => {
              if (speed === 0.6) setSpeed(1.0);
              else if (speed === 1.0) setSpeed(1.6);
              else setSpeed(0.6);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 hover:text-white"
            title="Adjust scroll speed"
          >
            <FastForward className="w-3 h-3 text-purple-400" />
            <span>{speed === 0.6 ? "Gentle" : speed === 1.0 ? "Normal" : "Swift"}</span>
          </button>

          {/* Skip straight to letter */}
          <button
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 text-white text-xs sm:text-sm font-medium hover:from-rose-500 hover:to-purple-500 shadow-md shadow-rose-950/40"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Letter</span>
          </button>

          {/* Integrated Audio toggle */}
          {onToggleAudio && (
            <button
              onClick={onToggleAudio}
              className={`p-1.5 rounded-xl glass-panel border transition ${
                isAudioPlaying
                  ? 'border-rose-500/50 text-rose-400 bg-rose-500/20'
                  : 'border-slate-700/60 text-slate-400 hover:text-white'
              }`}
              title={isAudioPlaying ? 'Mute melody' : 'Play melody'}
            >
              {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </header>

      {/* Intro Subtitle */}
      <div className="text-center mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 uppercase tracking-widest">
          <Sparkles className="w-3 h-3 text-rose-400" />
          Midnight Wishes For You
        </span>
        <p className="text-xs text-slate-400 mt-1">
          {isPlaying ? "Wishes are gently scrolling... Hover or touch anytime to pause and read." : "Auto-scroll paused. Scroll or click Play to resume."}
        </p>
      </div>

      {/* The Scrolling Reel Viewport */}
      <div
        className="relative my-2 rounded-3xl glass-panel border border-slate-800/80 shadow-2xl overflow-hidden"
        onMouseEnter={() => setIsUserHovering(true)}
        onMouseLeave={() => setIsUserHovering(false)}
        onTouchStart={() => setIsUserHovering(true)}
        onTouchEnd={() => setTimeout(() => setIsUserHovering(false), 2000)}
      >
        {/* Soft gradient masks at top and bottom for cinema fade */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#080711] via-[#080711]/70 to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#080711] via-[#080711]/70 to-transparent pointer-events-none z-20" />

        {/* Scrollable Container */}
        <div
          ref={reelRef}
          onScroll={handleScroll}
          className="h-[62vh] sm:h-[66vh] overflow-y-auto px-4 sm:px-8 py-10 space-y-12 sm:space-y-16 scroll-smooth select-text"
          style={{ scrollbarWidth: 'thin' }}
        >
          {BIRTHDAY_WISHES.map((wish, index) => {
            const isActive = index === currentWishIndex;

            return (
              <article
                key={wish.id}
                className={`wish-card relative p-6 sm:p-9 rounded-2xl transition-all duration-500 border ${
                  isActive
                    ? 'border-rose-400/60 bg-slate-900/90 shadow-2xl shadow-rose-950/50 scale-[1.01]'
                    : 'border-slate-800/70 bg-slate-900/40 opacity-85 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                {/* Active glow */}
                {isActive && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/20 to-purple-600/20 rounded-2xl blur-lg -z-10" />
                )}

                {/* Tag & Counter */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold tracking-wider uppercase text-rose-400">
                    {wish.tag}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {index + 1} of {BIRTHDAY_WISHES.length}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3">
                  {wish.title}
                </h3>

                {/* Poetic Quote */}
                <div className="my-4 p-3.5 sm:p-4 rounded-xl bg-rose-500/10 border-l-4 border-rose-500 text-rose-200 font-serif italic text-sm sm:text-base leading-relaxed">
                  "{wish.quote}"
                </div>

                {/* Message */}
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {wish.message}
                </p>

                {/* Footer note */}
                <div className="mt-5 pt-3 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5 text-rose-400/70">
                    <Heart className="w-3 h-3 fill-rose-500/40 text-rose-400" />
                    21st November
                  </span>
                  <span>Pure heartfelt blessing</span>
                </div>
              </article>
            );
          })}

          {/* Grand Finale Card at bottom of reel */}
          <div className="pt-6 pb-8">
            <div className="p-6 sm:p-8 rounded-2xl glass-panel border-2 border-rose-400/60 text-center bg-gradient-to-b from-slate-900 to-rose-950/40 shadow-2xl">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/40 mb-4">
                <CheckCircle2 className="w-6 h-6 text-rose-400" />
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
                All Birthday Wishes Read With Love
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-6">
                Now comes the main tribute: an unfiltered, honest celebration of your character and soul across 40,000 words.
              </p>

              <button
                onClick={handleFinish}
                className="group relative inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base text-white shadow-xl hover:scale-105 transition duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 group-hover:from-rose-500 group-hover:to-pink-500" />
                <span className="relative flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-rose-200" />
                  <span>Open The Grand Tribute</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Jump Pills for Wishes */}
      <footer className="mt-3 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
        {BIRTHDAY_WISHES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToWish(idx)}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-mono font-medium transition-all ${
              idx === currentWishIndex
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-950/50 scale-110'
                : 'glass-panel text-slate-400 hover:text-white border border-slate-800'
            }`}
            title={`Jump to Wish ${idx + 1}`}
          >
            {idx + 1}
          </button>
        ))}
      </footer>
    </div>
  );
}
