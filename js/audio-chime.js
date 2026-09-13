/**
 * Audio Chime Synthesizer & Celebrity Vocal Hook Processor
 * Generates temple bell chimes and signature celebrity audio intro hooks natively.
 */
class ChimeSynthesizer {
  constructor() {
    this.audioCtx = null;
  }

  initContext() {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch (e) {
      console.warn('AudioContext init warning:', e);
    }
  }

  /**
   * Plays temple bell chime sound
   */
  async playTempleBell() {
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      const fundamental = 587.33; // D5 note
      const harmonics = [1, 2.76, 5.4, 8.9];
      const gains = [0.5, 0.25, 0.12, 0.05];
      const decays = [1.2, 0.8, 0.5, 0.3];

      harmonics.forEach((ratio, index) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = index === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(fundamental * ratio, now);

        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.exponentialRampToValueAtTime(gains[index], now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decays[index]);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + decays[index]);
      });
    } catch (e) {
      console.warn('Temple bell error:', e);
    }

    return new Promise(resolve => setTimeout(resolve, 800));
  }

  /**
   * Plays triple announcement chime
   */
  async playTripleChime() {
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const notes = [523.25, 659.25, 783.99];
      for (let i = 0; i < notes.length; i++) {
        this.playSingleTone(notes[i], 0.2);
        await new Promise(r => setTimeout(r, 120));
      }
    } catch (e) {
      console.warn('Triple chime error:', e);
    }

    return new Promise(resolve => setTimeout(resolve, 300));
  }

  playSingleTone(freq, duration) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  async trigger(type = 'temple_bell') {
    if (type === 'none') return Promise.resolve();

    const chimePromise = (type === 'triple_chime') ? this.playTripleChime() : this.playTempleBell();
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 900));

    return Promise.race([chimePromise, timeoutPromise]).catch(() => Promise.resolve());
  }
}

window.chimeSynth = new ChimeSynthesizer();

/**
 * Soft Devotional Background Music Synthesizer & Player
 */
class DevotionalBGMPlayer {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.oscillators = [];
    this.intervalId = null;
    this.bgmType = 'devotional_tanpura';
  }

  initContext() {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch (e) {
      console.warn('BGM AudioContext init warning:', e);
    }
  }

  startBGM(type = 'none', targetVolume = 0.12) {
    if (type === 'none' || !type) {
      this.stopBGM(true);
      return;
    }

    this.initContext();
    if (!this.audioCtx) return;

    if (this.isPlaying && this.bgmType === type) return;

    this.stopBGM(false);
    this.isPlaying = true;
    this.bgmType = type;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    // Smooth slow fade-in over 1.8 seconds
    this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.01, targetVolume), now + 1.8);
    this.masterGain.connect(ctx.destination);

    if (type === 'devotional_tanpura' || type === 'temple_drone') {
      // Tanpura Harmonically Rich Sacred Ambient Drone (Om 136.1Hz, D3 146.8Hz, A3 220Hz, D4 293.66Hz)
      const freqs = [136.1, 146.83, 220.0, 293.66, 440.0];
      const gains = [0.25, 0.18, 0.14, 0.10, 0.04];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Add subtle slow tremolo/lfo for natural human plucked tanpura vibration
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.18 + idx * 0.05, now);
        lfoGain.gain.setValueAtTime(0.02, now);
        lfo.connect(g.gain);
        lfo.start(now);

        g.gain.setValueAtTime(gains[idx], now);
        osc.connect(g);
        g.connect(this.masterGain);

        osc.start(now);
        this.oscillators.push({ osc, lfo });
      });

      // Periodically play soft gentle temple bell ring every 5 seconds
      this.intervalId = setInterval(() => {
        if (this.isPlaying) this.playGentleChime();
      }, 5200);

    } else if (type === 'peaceful_flute') {
      // Soft Peaceful Flute Drone (Reethi Gowla / Revati notes)
      const freqs = [293.66, 329.63, 392.00, 440.00, 587.33];
      const gains = [0.20, 0.15, 0.12, 0.10, 0.05];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(gains[idx], now);

        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(now);
        this.oscillators.push({ osc });
      });
    }
  }

  playGentleChime() {
    if (!this.audioCtx || !this.isPlaying) return;
    try {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1174.66, now); // D6 soft bell ring

      g.gain.setValueAtTime(0.001, now);
      g.gain.exponentialRampToValueAtTime(0.03, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc.connect(g);
      g.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 2.8);
    } catch (e) {}
  }

  stopBGM(fadeOut = true) {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.masterGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      if (fadeOut) {
        // Slow gentle 2-second fade-out
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
        setTimeout(() => this.cleanupOscillators(), 2100);
      } else {
        this.cleanupOscillators();
      }
    } else {
      this.cleanupOscillators();
    }
  }

  cleanupOscillators() {
    this.oscillators.forEach(item => {
      try {
        if (item.osc) item.osc.stop();
        if (item.lfo) item.lfo.stop();
      } catch (e) {}
    });
    this.oscillators = [];
    this.masterGain = null;
  }
}

window.devotionalBGM = new DevotionalBGMPlayer();
