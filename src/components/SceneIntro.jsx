import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles, Gift, Heart, Stars, Clock, ArrowRight, Lock, Unlock,
  EyeOff, CheckCircle2, BookOpen
} from 'lucide-react';

export default function SceneIntro({ onStart, isUnlocked, onDevUnlock, onDevLock }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isPastMidnight: false });
  const [isOpening, setIsOpening] = useState(false);
  const [shakeLock, setShakeLock] = useState(false);
  const [teaserMessage, setTeaserMessage] = useState(null);

  // Live countdown to 21 Nov midnight (12:00:00 AM)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Target: 21 Nov 00:00:00 local time
      const currentYear = now.getFullYear();
      const target = new Date(currentYear, 10, 21, 0, 0, 0);

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isPastMidnight: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isPastMidnight: false });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const isActuallyUnlocked = isUnlocked || timeLeft.isPastMidnight;

  // Auto-launch into reading the exact second 12:00:00 AM strikes!
  useEffect(() => {
    if (timeLeft.isPastMidnight && !isOpening && !isUnlocked) {
      handleOpenSurprise();
    }
  }, [timeLeft.isPastMidnight]);

  // Playful teaser trigger if clicked while locked
  const handleLockedClick = () => {
    setShakeLock(true);
    setTimeout(() => setShakeLock(false), 600);

    const teasers = [
      "No peeking, meri jaan! Sabar ka phal meetha hota hai... 12 baje sab khulega! ⏳✨",
      "Itni jaldi kya hai? 12:00 AM sharp pe hi reading shuru hogi! 🙈🔒",
      "Sneak peek mana hai! Thoda sa intezar aur, surprise bohot bada hai... ❤️",
      "Ghari ki sui 12 ko chhoone do, phir direct reading shuru ho jayegi! 🌟"
    ];
    const randomTeaser = teasers[Math.floor(Math.random() * teasers.length)];
    setTeaserMessage(randomTeaser);
    setTimeout(() => setTeaserMessage(null), 4000);
  };

  const handleOpenSurprise = () => {
    if (!isActuallyUnlocked) {
      handleLockedClick();
      return;
    }

    if (isOpening) return;
    setIsOpening(true);

    // Fire celebration confetti burst
    const count = 220;
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

    function fire(particleRatio, opts) {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#f43f5e', '#ec4899', '#fbcfe8'] });
    fire(0.2, { spread: 60, colors: ['#fbbf24', '#f59e0b', '#ffffff'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#a855f7', '#ec4899', '#60a5fa'] });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, colors: ['#fda4af', '#f43f5e', '#ffd700'] });
    fire(0.1, { spread: 120, startVelocity: 45, colors: ['#ffffff', '#f472b6'] });

    setTimeout(() => {
      onStart();
    }, 800);
  };

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center select-none overflow-hidden">
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-rose-500/20 via-purple-600/15 to-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Status Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-medium mb-6 shadow-lg shadow-rose-950/40 animate-fade-in">
        {isActuallyUnlocked ? (
          <>
            <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>It is 12:00 AM — Vault Unlocked!</span>
            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
          </>
        ) : (
          <>
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Secret Birthday Vault — Unlocks Tonight at 12:00 AM</span>
            <Stars className="w-3.5 h-3.5 text-rose-400" />
          </>
        )}
      </div>

      {/* Main title */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight mb-4 max-w-4xl leading-tight">
        Happy 19th Birthday, <br />
        <span className="text-shimmer font-handwriting text-5xl sm:text-7xl md:text-8xl italic block mt-1">
          Meri Jaan
        </span>
      </h1>

      {/* Subtitle / Teaser */}
      <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto font-light leading-relaxed mb-8">
        {isActuallyUnlocked
          ? "The clock has struck twelve, and your 19th birthday is here. Your birthday wishes and 40,000 words letter are now open for you to read."
          : "Almost 40,000 words, countless memories, and heartfelt wishes are sealed inside. Aaj raat theek 12:00 AM baje yeh khud-ba-khud unlock ho jayega aur aap reading shuru kar sakengi."}
      </p>

      {/* Live Countdown Timer */}
      <div className="mb-10 w-full max-w-md">
        {isActuallyUnlocked ? (
          <div className="p-4 rounded-2xl glass-panel border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-3 shadow-2xl bg-emerald-950/20 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="font-semibold text-sm sm:text-base">
              It is 21st November. Vault is Unlocked!
            </span>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-slate-700/80 shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-xs text-rose-300 font-mono tracking-widest uppercase mb-3">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Unlocks Automatically in:</span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Hours */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                <div className="text-2xl sm:text-3xl font-mono font-bold text-rose-300">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1">
                  Hours
                </div>
              </div>

              {/* Minutes */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                <div className="text-2xl sm:text-3xl font-mono font-bold text-rose-300">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1">
                  Minutes
                </div>
              </div>

              {/* Seconds */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-300 animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1">
                  Seconds
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Teaser Toast when clicked while locked */}
      {teaserMessage && (
        <div className="mb-6 px-5 py-3 rounded-2xl glass-panel border border-amber-400/60 bg-amber-950/40 text-amber-200 text-xs sm:text-sm font-medium shadow-2xl flex items-center justify-center gap-2 animate-bounce max-w-md mx-auto">
          <EyeOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{teaserMessage}</span>
        </div>
      )}

      {/* Interactive Gift / Box element */}
      <div
        className={`relative mb-8 cursor-pointer select-none transition-transform ${
          shakeLock ? 'animate-shake' : 'hover:-translate-y-1'
        }`}
        onClick={handleOpenSurprise}
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-rose-500 to-purple-600 blur-xl opacity-50 scale-95 transition" />
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl glass-panel border-2 border-rose-400/50 flex flex-col items-center justify-center text-rose-300 shadow-2xl">
          {isActuallyUnlocked ? (
            <>
              <Gift className={`w-14 h-14 text-rose-400 transition-transform duration-500 ${isOpening ? 'scale-125 rotate-12' : 'animate-bounce'}`} />
              <div className="mt-2 text-[11px] uppercase tracking-widest font-semibold text-rose-200 flex items-center gap-1">
                <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                <span>Tap to Start Reading!</span>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <Gift className="w-14 h-14 text-slate-500 opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-slate-950/90 border border-amber-400/60 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-widest font-mono text-amber-300/90">
                Sealed Vault
              </div>
            </>
          )}
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={handleOpenSurprise}
        disabled={isOpening}
        className={`relative group px-8 sm:px-10 py-4 sm:py-4.5 rounded-full font-semibold text-base sm:text-lg text-white transition-all duration-300 shadow-xl overflow-hidden cursor-pointer ${
          isActuallyUnlocked
            ? 'hover:shadow-rose-500/40 hover:scale-105'
            : 'hover:border-amber-400/50'
        }`}
      >
        {isActuallyUnlocked ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-pink-500 to-purple-600 group-hover:from-rose-500 group-hover:to-pink-500 transition duration-300 rounded-full" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_60%)] opacity-70" />

            <span className="relative flex items-center justify-center gap-3">
              <BookOpen className="w-5 h-5 text-rose-200" />
              <span>{isOpening ? "Opening Your World..." : "Start Reading Wishes & Letter"}</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </span>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-slate-800 border border-slate-700/80 rounded-full group-hover:bg-slate-750 transition" />
            <span className="relative flex items-center justify-center gap-2.5 text-slate-300 group-hover:text-amber-200">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Locked Until 12:00 AM (21 Nov)</span>
            </span>
          </>
        )}
      </button>

      {/* Quick Testing Bar for User ONLY */}
      <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-center gap-2 text-xs">
        {isUnlocked ? (
          <button
            onClick={onDevLock}
            className="text-[11px] text-slate-500 hover:text-rose-400 underline transition cursor-pointer"
          >
            🔒 Re-Lock for Bestie (Preview Locked View)
          </button>
        ) : (
          <button
            onClick={onDevUnlock}
            className="text-[11px] text-slate-500 hover:text-emerald-400 underline transition cursor-pointer"
          >
            🧪 Test Unlock (Preview Reading Mode as it will appear at 12 AM)
          </button>
        )}
      </div>
    </div>
  );
}
