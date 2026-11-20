// Ambient Synthesizer using Web Audio API
// Generates dreamy, soothing, pentatonic celestial chords and gentle harp arpeggios
// 100% offline, zero external dependencies, never fails to load

class AmbientSoundtrack {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.masterGain = null;
    this.filter = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

      // Low pass filter for soft, warm, dreamy ambient tone
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      // Simple stereo delay / reverb simulation
      const delay = this.ctx.createDelay();
      delay.delayTime.setValueAtTime(0.38, this.ctx.currentTime);

      const feedback = this.ctx.createGain();
      feedback.gain.setValueAtTime(0.35, this.ctx.currentTime);

      delay.connect(feedback);
      feedback.connect(delay);

      this.masterGain.connect(this.filter);
      this.filter.connect(this.ctx.destination);
      this.filter.connect(delay);
      delay.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playNote(freq, time, duration = 2.5, velocity = 0.08) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      // Warm triangle wave with slight sine blend
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      noteGain.gain.setValueAtTime(0.0001, time);
      noteGain.gain.exponentialRampToValueAtTime(velocity, time + 0.15);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration);
    } catch {
      // Audio note failed gracefully
    }
  }

  playChord(frequencies, time, duration = 4.0, volume = 0.05) {
    frequencies.forEach((freq, idx) => {
      this.playNote(freq, time + idx * 0.08, duration, volume);
    });
  }

  start() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Fade in master volume softly
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 2.0);

    // Pentatonic emotional chords (A minor, F major, C major, G major)
    const chords = [
      [220.00, 261.63, 329.63, 392.00, 523.25], // Am7 / C
      [174.61, 220.00, 261.63, 329.63, 440.00], // Fmaj7
      [261.63, 329.63, 392.00, 523.25, 659.25], // Cmaj9
      [196.00, 246.94, 293.66, 392.00, 493.88], // Gsus
    ];

    let chordIdx = 0;

    const playSequence = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      // Play soft pad chord
      this.playChord(currentChord, now, 6.0, 0.06);

      // Play delicate twinkling arpeggios
      currentChord.forEach((freq, i) => {
        this.playNote(freq * 1.5, now + 1.2 + i * 0.45, 2.0, 0.025);
      });
    };

    playSequence();
    this.intervalId = setInterval(playSequence, 4800);
  }

  playCelebrationFanfare() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Shimmering musical box celebration fanfare
      const notes = [
        523.25, // C5
        659.25, // E5
        783.99, // G5
        987.77, // B5
        1046.50, // C6
        1318.51, // E6
        1567.98, // G6
        2093.00  // C7 (sparkling high note)
      ];

      notes.forEach((freq, idx) => {
        const time = now + idx * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(0.12, time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 1.8);
      });
    } catch {
      // Audio fallback
    }
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 1.0);
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }
}

export const ambientSoundtrack = new AmbientSoundtrack();
