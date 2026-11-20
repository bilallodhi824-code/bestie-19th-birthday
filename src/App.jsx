import React, { useState, useEffect } from 'react';
import BackgroundStars from './components/BackgroundStars';
import SceneIntro from './components/SceneIntro';
import SceneWishes from './components/SceneWishes';
import SceneLetter from './components/SceneLetter';
import { ambientSoundtrack } from './utils/audio';
import { Volume2, VolumeX, Sparkles, Heart } from 'lucide-react';

export default function App() {
  // Scene state: 'intro' | 'wishes' | 'letter'
  const [currentScene, setCurrentScene] = useState('intro');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Real-time lock check: Unlocks automatically at 12:00:00 AM on 21st November
  useEffect(() => {
    // 1. Developer preview query parameter bypass: ?unlock=true or ?preview=true
    const params = new URLSearchParams(window.location.search);
    if (params.get('unlock') === 'true' || params.get('preview') === 'true') {
      setIsUnlocked(true);
      return;
    }

    // 2. Real-time clock check
    const evaluateLock = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const target = new Date(currentYear, 10, 21, 0, 0, 0); // 21 Nov 00:00:00 local time
      if (now.getTime() >= target.getTime()) {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }
    };

    evaluateLock();
    const timer = setInterval(evaluateLock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Developer manual secret unlock toggle
  const handleDevUnlock = () => {
    setIsUnlocked(true);
  };

  const handleDevLock = () => {
    setIsUnlocked(false);
  };

  // Toggle ambient music
  const handleToggleAudio = () => {
    const newState = ambientSoundtrack.toggle();
    setIsAudioPlaying(newState);
  };

  // Scene transition helpers
  const handleStartWishes = () => {
    // Start ambient soundtrack on first interaction
    if (!isAudioPlaying) {
      ambientSoundtrack.start();
      setIsAudioPlaying(true);
    }
    setCurrentScene('wishes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToLetter = () => {
    setCurrentScene('letter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToWishes = () => {
    setCurrentScene('wishes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToIntro = () => {
    setCurrentScene('intro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#080711] text-slate-100 font-sans overflow-x-hidden">
      {/* Dynamic Starfield & Atmospheric particles */}
      <BackgroundStars />

      {/* Persistent Audio Pill ONLY on SceneIntro (Wishes and Letter have audio integrated in their own clean navbars) */}
      {currentScene === 'intro' && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleToggleAudio}
            className={`group flex items-center gap-2 px-3.5 py-2 rounded-full glass-panel border shadow-lg backdrop-blur-xl text-xs font-medium transition-all ${
              isAudioPlaying
                ? 'border-rose-500/40 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20'
                : 'border-slate-700/60 text-slate-400 bg-slate-900/80 hover:text-white'
            }`}
            title={isAudioPlaying ? 'Mute ambient melody' : 'Play ambient midnight music'}
          >
            {isAudioPlaying ? (
              <>
                <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />
                <span className="hidden sm:inline">Melody Playing</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Melody Off</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Scenes Rendering */}
      {currentScene === 'intro' && (
        <SceneIntro
          onStart={handleStartWishes}
          isUnlocked={isUnlocked}
          onDevUnlock={handleDevUnlock}
          onDevLock={handleDevLock}
        />
      )}

      {/* Wishes and Letter are strictly protected by isUnlocked state */}
      {isUnlocked && currentScene === 'wishes' && (
        <SceneWishes
          onProceedToLetter={handleProceedToLetter}
          isAudioPlaying={isAudioPlaying}
          onToggleAudio={handleToggleAudio}
        />
      )}

      {isUnlocked && currentScene === 'letter' && (
        <SceneLetter
          onBackToWishes={handleBackToWishes}
          isAudioPlaying={isAudioPlaying}
          onToggleAudio={handleToggleAudio}
        />
      )}
    </div>
  );
}
