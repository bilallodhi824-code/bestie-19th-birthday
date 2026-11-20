import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import letterData from '../data/letterData.json';
import { ambientSoundtrack } from '../utils/audio';
import {
  BookOpen, Sparkles, Heart, Bookmark, Search, ArrowUp,
  Moon, ChevronRight, Play, Pause, FastForward, Check, X, PartyPopper,
  Volume2, VolumeX
} from 'lucide-react';

const THEMES = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Celestial',
    bg: 'bg-[#070a14]',
    cardBg: 'bg-slate-900/60',
    border: 'border-slate-800',
    text: 'text-slate-200',
    textMuted: 'text-slate-400',
    accent: 'text-rose-400',
    accentBg: 'bg-rose-500/20',
    dropCap: 'text-rose-400',
  },
  candlelight: {
    id: 'candlelight',
    name: 'Rose Candlelight',
    bg: 'bg-[#180916]',
    cardBg: 'bg-[#240e21]/70',
    border: 'border-rose-900/50',
    text: 'text-rose-100',
    textMuted: 'text-rose-300/70',
    accent: 'text-pink-400',
    accentBg: 'bg-pink-500/20',
    dropCap: 'text-pink-400',
  },
  parchment: {
    id: 'parchment',
    name: 'Cozy Parchment',
    bg: 'bg-[#fbf7ee]',
    cardBg: 'bg-[#f4ede0]',
    border: 'border-[#e4d6bf]',
    text: 'text-[#2a241e]',
    textMuted: 'text-[#6b5e51]',
    accent: 'text-amber-800',
    accentBg: 'bg-amber-100',
    dropCap: 'text-amber-800',
  },
  noir: {
    id: 'noir',
    name: 'OLED Noir',
    bg: 'bg-[#000000]',
    cardBg: 'bg-[#0c0c0e]',
    border: 'border-neutral-800',
    text: 'text-neutral-200',
    textMuted: 'text-neutral-400',
    accent: 'text-neutral-100',
    accentBg: 'bg-neutral-800',
    dropCap: 'text-white',
  }
};

const FONT_SIZES = {
  sm: { label: 'Small', pClass: 'text-[16px] leading-[1.85]' },
  md: { label: 'Medium', pClass: 'text-[18px] leading-[1.95]' },
  lg: { label: 'Large', pClass: 'text-[20px] leading-[2.05]' },
  xl: { label: 'X-Large', pClass: 'text-[22px] leading-[2.15]' }
};

export default function SceneLetter({ onBackToWishes, isAudioPlaying, onToggleAudio }) {
  const allParagraphs = letterData.paragraphs;

  // Reading state
  const [themeKey, setThemeKey] = useState('midnight');
  const [fontSizeKey, setFontSizeKey] = useState('md');
  const [renderedCount, setRenderedCount] = useState(80); // Progressive windowing for ultra smooth 60fps
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);

  // Auto-scroll state
  const [isAutoReading, setIsAutoReading] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState(1.0); // 0.6: Slow, 1.0: Comfortable, 1.6: Fast

  // Search & Bookmark
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIndex, setBookmarkedIndex] = useState(null);
  const [showBookmarkToast, setShowBookmarkToast] = useState(false);

  // Grand Celebration Modal & Floating Balloons
  const [isCelebrationModalOpen, setIsCelebrationModalOpen] = useState(false);
  const [floatingBalloons, setFloatingBalloons] = useState([]);

  const triggerCelebration = () => {
    // 1. Play musical celebration fanfare sound
    ambientSoundtrack.playCelebrationFanfare();

    // 2. Multi-cannons confetti explosion
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { x: 0.15, y: 0.7 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24', '#ffffff']
    });
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { x: 0.85, y: 0.7 },
      colors: ['#a855f7', '#60a5fa', '#f43f5e', '#ffd700']
    });
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24', '#a855f7', '#ffffff']
    });

    // 3. Spawn floating 3D balloons & hearts
    const newBalloons = Array.from({ length: 24 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 88 + 6,
      duration: Math.random() * 4 + 6,
      delay: Math.random() * 1.5,
      size: Math.random() * 18 + 30,
      type: Math.random() > 0.4 ? 'balloon' : 'heart',
      color: ['#f43f5e', '#ec4899', '#a855f7', '#fbbf24', '#fb7185', '#c084fc'][Math.floor(Math.random() * 6)]
    }));
    setFloatingBalloons(prev => [...prev.slice(-10), ...newBalloons]);

    // 4. Open Grand Celebration Modal
    setIsCelebrationModalOpen(true);
  };

  const theme = THEMES[themeKey] || THEMES.midnight;
  const fontSize = FONT_SIZES[fontSizeKey] || FONT_SIZES.md;
  const autoScrollRaf = useRef(null);

  // Load saved bookmark from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bestie_letter_bookmark');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < allParagraphs.length) {
          setBookmarkedIndex(parsed);
        }
      }
    } catch {
      // LocalStorage access graceful fallback
    }
  }, [allParagraphs.length]);

  // Infinite progressive chunk loader as user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;

      // Scroll progress percentage
      const maxScroll = totalHeight - windowHeight;
      const pct = maxScroll > 0 ? Math.min(100, Math.round((scrollY / maxScroll) * 100)) : 0;
      setProgressPercent(pct);

      // Estimate current paragraph
      const estIdx = Math.min(allParagraphs.length - 1, Math.floor((pct / 100) * allParagraphs.length));
      setCurrentParagraphIndex(estIdx);

      // Trigger more paragraphs if within 1200px of bottom
      if (scrollY + windowHeight >= totalHeight - 1200) {
        setRenderedCount(prev => Math.min(allParagraphs.length, prev + 50));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [allParagraphs.length]);

  // Auto-scroll loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isAutoReading) {
        const scrollAmount = 35 * autoSpeed * delta;
        window.scrollBy({ top: scrollAmount, behavior: 'auto' });
      }
      autoScrollRaf.current = requestAnimationFrame(loop);
    };

    autoScrollRaf.current = requestAnimationFrame(loop);
    return () => {
      if (autoScrollRaf.current) cancelAnimationFrame(autoScrollRaf.current);
    };
  }, [isAutoReading, autoSpeed]);

  // Save bookmark handler
  const handleSaveBookmark = () => {
    try {
      localStorage.setItem('bestie_letter_bookmark', currentParagraphIndex.toString());
      setBookmarkedIndex(currentParagraphIndex);
      setShowBookmarkToast(true);
      setTimeout(() => setShowBookmarkToast(false), 3000);
    } catch {
      // fallback
    }
  };

  // Jump to specific paragraph index
  const jumpToParagraph = (idx) => {
    if (idx >= renderedCount) {
      setRenderedCount(Math.min(allParagraphs.length, idx + 40));
    }
    setTimeout(() => {
      const el = document.getElementById(`para-${idx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Filter paragraphs for search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const results = [];
    for (let i = 0; i < allParagraphs.length; i++) {
      if (allParagraphs[i].toLowerCase().includes(q)) {
        results.push({ index: i, text: allParagraphs[i] });
        if (results.length >= 25) break;
      }
    }
    return results;
  }, [searchQuery, allParagraphs]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${theme.bg} ${theme.text} pb-28 selection:bg-rose-500 selection:text-white`}>
      {/* Top Floating Glass Control & Status Bar */}
      <nav className="sticky top-0 z-40 border-b border-slate-700/40 bg-slate-950/85 backdrop-blur-xl px-3 sm:px-6 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Back & Progress */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onBackToWishes}
              className="text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-xl glass-panel text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              ← Wishes
            </button>
            <span className="text-xs font-semibold text-rose-300 font-mono px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
              {progressPercent}% Read
            </span>
          </div>

          {/* Right: Reading Controls + Integrated Audio */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Auto Read toggle */}
            <button
              onClick={() => setIsAutoReading(prev => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                isAutoReading
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-900/50'
                  : 'glass-panel text-slate-300 hover:text-white'
              }`}
              title="Hands-free auto-reading scroll"
            >
              {isAutoReading ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isAutoReading ? 'Pause' : 'Auto-Read'}</span>
            </button>

            {/* Font size button */}
            <div className="flex items-center rounded-xl glass-panel p-0.5 border border-slate-700/60 text-xs">
              <button
                onClick={() => {
                  const sizes = ['sm', 'md', 'lg', 'xl'];
                  const cur = sizes.indexOf(fontSizeKey);
                  if (cur > 0) setFontSizeKey(sizes[cur - 1]);
                }}
                disabled={fontSizeKey === 'sm'}
                className="px-1.5 py-1 rounded hover:bg-slate-800 disabled:opacity-30"
                title="Decrease font size"
              >
                A-
              </button>
              <span className="px-1 text-[11px] text-slate-400 font-mono uppercase">{fontSizeKey}</span>
              <button
                onClick={() => {
                  const sizes = ['sm', 'md', 'lg', 'xl'];
                  const cur = sizes.indexOf(fontSizeKey);
                  if (cur < sizes.length - 1) setFontSizeKey(sizes[cur + 1]);
                }}
                disabled={fontSizeKey === 'xl'}
                className="px-1.5 py-1 rounded hover:bg-slate-800 disabled:opacity-30"
                title="Increase font size"
              >
                A+
              </button>
            </div>

            {/* Theme switcher */}
            <button
              onClick={() => {
                const keys = Object.keys(THEMES);
                const cur = keys.indexOf(themeKey);
                const next = keys[(cur + 1) % keys.length];
                setThemeKey(next);
              }}
              className="p-1.5 rounded-xl glass-panel border border-slate-700/60 text-slate-300 hover:text-white transition"
              title={`Theme: ${theme.name}`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>

            {/* Search within letter */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 rounded-xl glass-panel border border-slate-700/60 text-slate-300 hover:text-white"
              title="Search within letter"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* Bookmark */}
            <button
              onClick={handleSaveBookmark}
              className="p-1.5 rounded-xl glass-panel border border-slate-700/60 text-rose-300 hover:text-rose-200"
              title="Save current reading position"
            >
              <Bookmark className="w-3.5 h-3.5 fill-rose-500/30" />
            </button>

            {/* Integrated Audio Toggle (Zero CSS Overlap!) */}
            {onToggleAudio && (
              <button
                onClick={onToggleAudio}
                className={`p-1.5 rounded-xl glass-panel border transition ${
                  isAudioPlaying
                    ? 'border-rose-500/50 text-rose-400 bg-rose-500/20'
                    : 'border-slate-700/60 text-slate-400 hover:text-white'
                }`}
                title={isAudioPlaying ? 'Mute ambient melody' : 'Play ambient melody'}
              >
                {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Linear progress bar line at very top edge */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </nav>

      {/* Bookmark Resume Prompt Banner if bookmark exists */}
      {bookmarkedIndex !== null && currentParagraphIndex === 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div className="p-4 rounded-2xl glass-panel border border-rose-500/30 flex items-center justify-between gap-4 bg-rose-500/10">
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-rose-400 fill-rose-400" />
              <div>
                <p className="text-sm font-semibold text-rose-200">You have a saved reading position</p>
                <p className="text-xs text-rose-300/80">Paragraph {bookmarkedIndex + 1} of {allParagraphs.length}</p>
              </div>
            </div>
            <button
              onClick={() => jumpToParagraph(bookmarkedIndex)}
              className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow hover:bg-rose-500 transition"
            >
              Resume Reading →
            </button>
          </div>
        </div>
      )}

      {/* Bookmark Toast notification */}
      {showBookmarkToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl glass-panel border border-rose-400 bg-slate-900 text-rose-200 text-sm font-medium shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-rose-400" />
          <span>Bookmark saved at paragraph {currentParagraphIndex + 1}!</span>
        </div>
      )}

      {/* Main Letter Content Body */}
      <main className="max-w-3xl mx-auto px-5 sm:px-8 pt-12 pb-24">
        {/* Letter Editorial Masthead */}
        <header className="text-center mb-16 pb-12 border-b border-slate-800/80">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 mb-4">
            <Heart className="w-3.5 h-3.5 fill-rose-400" />
            An Unspoken Heartfelt Tribute
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight mb-4 text-white">
            Words That Will Never Fade
          </h1>

          <p className="text-rose-200/85 text-sm sm:text-base max-w-lg mx-auto font-serif italic leading-relaxed">
            Har lafz dil ki gehraiyon se, sirf aur sirf tumhare liye.
          </p>
        </header>

        {/* The Cleaned Paragraphs — Uninterrupted, Continuous Stream */}
        <div className="space-y-8 font-serif">
          {allParagraphs.slice(0, renderedCount).map((para, index) => {
            const isFirst = index === 0;

            return (
              <p
                key={index}
                id={`para-${index}`}
                className={`${fontSize.pClass} ${theme.text} transition-colors tracking-normal text-justify sm:text-left`}
              >
                {isFirst ? (
                  <>
                    <span className={`float-left text-5xl sm:text-6xl font-bold font-serif mr-3 leading-none ${theme.dropCap}`}>
                      {para.charAt(0)}
                    </span>
                    {para.slice(1)}
                  </>
                ) : (
                  para
                )}
              </p>
            );
          })}
        </div>

        {/* Load More trigger / End of letter celebration */}
        {renderedCount < allParagraphs.length ? (
          <div className="mt-16 text-center">
            <button
              onClick={() => setRenderedCount(prev => Math.min(allParagraphs.length, prev + 100))}
              className="px-6 py-2.5 rounded-full glass-panel border border-slate-700 text-sm text-slate-300 hover:text-white hover:border-rose-500/50 transition shadow-lg"
            >
              Load more paragraphs ({renderedCount} of {allParagraphs.length} shown)...
            </button>
          </div>
        ) : (
          <div className="mt-20 glowing-box-border">
            <div className="glowing-box-inner p-8 sm:p-12 text-center relative overflow-hidden">
              {/* Subtle ambient light flare */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-36 bg-rose-500/25 blur-3xl pointer-events-none rounded-full" />

              {/* Pulsing Beating Heart */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full bg-rose-500/30 blur-xl animate-ping opacity-60" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-purple-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/60">
                  <Heart className="w-7 h-7 fill-rose-500/60 text-rose-300 animate-pulse" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white mb-3 tracking-tight leading-snug">
                Words Can Come To An End, <br />
                <span className="text-shimmer">But Your Appreciation Never Will</span>
              </h3>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm font-mono tracking-widest text-rose-300/80 uppercase mb-6">
                Lafz Mukammal Ho Sakte Hain, Magar Tumhari Qadar Nahi
              </p>

              {/* Heartfelt Paragraphs */}
              <div className="space-y-4 max-w-2xl mx-auto text-slate-200 text-sm sm:text-base leading-relaxed font-sans text-justify sm:text-center font-light mb-8">
                <p>
                  Tumne ek baar kaha tha ke tum mere nazariye se khud ko jaan-na chahti ho... Maine tumhari shakhsiyat ke har pehlu, har ada, aur har khoobsurat baat ko apne angle se bayaan karne ki poori koshish ki. Magar sach yeh hai ke yeh chaalis hazaar alfaaz bhi tumhare wajood ke saamne kam parh gaye.
                </p>
                <p className="text-rose-100/90 italic font-serif text-base sm:text-lg">
                  "Words can come to an end, pages can finish, but who you are and what you mean to me will never be bound by sentences. You are endlessly deeper, rarer, and far more beautiful than anything words could ever capture."
                </p>
              </div>

              {/* Cursive Signature */}
              <div className="text-rose-300 font-handwriting text-3xl sm:text-4xl mb-8 block">
                Happy 19th Birthday meri jaan! <br />
                <span className="text-xl sm:text-2xl font-light text-rose-200/90">Hamesha aisi hi muskurati rehna.</span>
              </div>

              {/* Interactive Confetti & Celebration Action Button */}
              <button
                onClick={triggerCelebration}
                className="relative group inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-4.5 rounded-full text-sm sm:text-base font-semibold text-white shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                {/* Animated gradient fill & light sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 group-hover:from-rose-500 group-hover:to-pink-500 transition duration-300 rounded-full" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_60%)] opacity-70" />

                <span className="relative flex items-center gap-2.5">
                  <PartyPopper className="w-5 h-5 text-amber-300 animate-bounce" />
                  <span>Celebrate My Favourite Soul ✨</span>
                  <Heart className="w-4 h-4 fill-rose-300 text-rose-300" />
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Quick Action Bar */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-slate-700/80 shadow-2xl backdrop-blur-xl bg-slate-950/80">
        <button
          onClick={scrollToTop}
          className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition"
          title="Scroll to Top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-slate-700" />

        <button
          onClick={() => setIsAutoReading(prev => !prev)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
        >
          {isAutoReading ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isAutoReading ? 'Pause' : 'Auto Read'}</span>
        </button>

        <div className="w-[1px] h-4 bg-slate-700" />

        <button
          onClick={handleSaveBookmark}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-slate-300 hover:text-white transition"
          title="Save Bookmark"
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span>Save Place</span>
        </button>
      </div>

      {/* Search in Letter Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-xl max-h-[80vh] rounded-3xl glass-panel border border-slate-700 p-5 shadow-2xl flex flex-col bg-slate-900 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-rose-400" />
                <h3 className="font-semibold text-white">Search Within The Letter</h3>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a word or phrase (e.g. smile, kind, dosti, tareef)..."
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {searchQuery.trim().length > 1 && searchResults.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No matching paragraphs found for "{searchQuery}".</p>
              )}
              {searchResults.map((res) => (
                <div
                  key={res.index}
                  onClick={() => {
                    jumpToParagraph(res.index);
                    setIsSearchOpen(false);
                  }}
                  className="p-3 rounded-xl glass-panel border border-slate-800 hover:border-rose-500/40 hover:bg-slate-800 cursor-pointer transition text-xs"
                >
                  <span className="font-mono text-[10px] text-rose-400 block mb-1">
                    Paragraph {res.index + 1}
                  </span>
                  <p className="text-slate-300 line-clamp-2">{res.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating 3D Balloons & Rising Hearts Celebration Layer */}
      {floatingBalloons.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {floatingBalloons.map(b => (
            <div
              key={b.id}
              className="absolute animate-floating-balloon select-none"
              style={{
                left: `${b.left}%`,
                bottom: '-80px',
                animationDuration: `${b.duration}s`,
                animationDelay: `${b.delay}s`,
              }}
            >
              {b.type === 'balloon' ? (
                <div
                  className="relative rounded-full shadow-2xl flex items-center justify-center"
                  style={{
                    width: `${b.size}px`,
                    height: `${b.size * 1.25}px`,
                    background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${b.color} 55%, #4a044e 100%)`,
                    boxShadow: `0 0 25px ${b.color}99`
                  }}
                >
                  <div className="absolute -bottom-2 w-1.5 h-1.5 rounded-full" style={{ background: b.color }} />
                  <div className="absolute -bottom-8 w-[1px] h-8 bg-slate-400/50" />
                </div>
              ) : (
                <Heart
                  className="fill-current drop-shadow-lg"
                  style={{
                    width: `${b.size}px`,
                    height: `${b.size}px`,
                    color: b.color,
                    filter: `drop-shadow(0 0 16px ${b.color})`
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Special Grand Celebration Modal */}
      {isCelebrationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl glowing-box-border shadow-2xl animate-scale-up">
            <div className="glowing-box-inner p-7 sm:p-9 text-center relative overflow-hidden">
              {/* Close icon */}
              <button
                onClick={() => setIsCelebrationModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full glass-panel hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Glowing Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500/30 to-purple-500/30 border border-rose-400/50 flex items-center justify-center text-rose-300 mx-auto mb-5 shadow-xl shadow-rose-950/60 animate-bounce">
                <PartyPopper className="w-8 h-8 text-rose-400" />
              </div>

              {/* Modal Headline */}
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                A Midnight Blessing For You
              </h2>
              <p className="text-xs font-mono uppercase tracking-widest text-rose-300 mb-6">
                To My Dearest Best Friend
              </p>

              {/* Deeply Touching Message */}
              <div className="space-y-4 text-slate-200 text-sm sm:text-base leading-relaxed font-light mb-8 font-sans">
                <p>
                  "To the world, you might just be one person. But to those whose lives you touch, you make the entire universe kinder, brighter, and worth smiling for."
                </p>
                <p className="text-rose-100 font-serif italic text-base sm:text-lg">
                  Dua hai ke tumhara har saal, har din, aur har lamha tumhari hasi ki tarah pur-noor rahe. May your life be filled with endless peace, health, success, and pure joy.
                </p>
              </div>

              <div className="text-rose-300 font-handwriting text-3xl mb-8">
                Happy 19th Birthday meri jaan!
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    ambientSoundtrack.playCelebrationFanfare();
                    confetti({
                      particleCount: 110,
                      spread: 85,
                      origin: { y: 0.6 },
                      colors: ['#f43f5e', '#ec4899', '#fbbf24', '#ffffff']
                    });
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 shadow-xl transition cursor-pointer"
                >
                  🎉 More Confetti & Fireworks!
                </button>
                <button
                  onClick={() => setIsCelebrationModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-full text-xs sm:text-sm font-medium glass-panel border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Close & Read Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
