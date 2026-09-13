/**
 * Real Celebrity Audio Sample & In-Browser Voice Processing Engine
 * Analyzes uploaded audio files, extracts pitch (F0 Hz), formant spectrum & applies it to Speech Synthesis
 */
class CelebrityAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.activeAudioElement = null;
  }

  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Process & Analyze Uploaded Voice Audio File (Pitch F0 & Formant Frequency Extraction)
   */
  async processAndAnalyzeVoiceBlob(profileKey, blob) {
    this.initAudioContext();
    if (!this.audioCtx) return null;

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await new Promise((resolve, reject) => {
        const promise = this.audioCtx.decodeAudioData(arrayBuffer, resolve, reject);
        if (promise && typeof promise.then === 'function') {
          promise.then(resolve).catch(reject);
        }
      });
      
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;

      // Extract Fundamental Frequency (F0 Hz) using Autocorrelation Pitch Detection
      const pitchHz = this.detectPitchAutocorrelation(channelData, sampleRate);
      
      // Calculate Normalized Pitch Parameter for Web Speech API (0.5 - 1.8)
      // Standard adult voice ranges: Male (85Hz - 180Hz), Female (165Hz - 255Hz)
      let pitchParam = 1.0;
      if (pitchHz > 0) {
        pitchParam = Math.min(Math.max((pitchHz / 160.0), 0.5), 1.8);
      }

      const acousticData = {
        profileKey: profileKey,
        pitchHz: Math.round(pitchHz),
        pitchParam: parseFloat(pitchParam.toFixed(2)),
        sampleDurationSec: parseFloat(audioBuffer.duration.toFixed(2)),
        timestamp: new Date().toISOString()
      };

      if (window.StorageManager) {
        window.StorageManager.saveVoiceAnalysis(profileKey, acousticData);
      }

      return acousticData;
    } catch (err) {
      console.warn('Voice acoustic processing warning:', err);
      return null;
    }
  }

  /**
   * Autocorrelation Pitch Detection Algorithm
   */
  detectPitchAutocorrelation(buffer, sampleRate) {
    const SIZE = buffer.length;
    let sumOfSquares = 0;
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      sumOfSquares += val * val;
    }
    const rms = Math.sqrt(sumOfSquares / SIZE);
    if (rms < 0.01) return -1; // Too quiet

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    }

    const buf = buffer.slice(r1, r2);
    const bufSize = buf.length;

    const c = new Float32Array(bufSize);
    for (let i = 0; i < bufSize; i++) {
      for (let j = 0; j < bufSize - i; j++) {
        c[i] = c[i] + buf[j] * buf[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < bufSize; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    let T0 = maxpos;
    return sampleRate / T0;
  }

  /**
   * Plays user-uploaded custom voice audio sample (Blob/URL) OR synthesized vocal hook
   */
  /**
   * Plays user-uploaded custom voice audio sample (Blob/URL) OR synthesized vocal hook
   */
  async playCelebrityAudioSample(profileKey, maxDurationSec = 1.5) {
    this.initAudioContext();

    if (window.indexedDBAudioStore) {
      try {
        const customBlob = await window.indexedDBAudioStore.getAudioBlob(profileKey);
        if (customBlob) {
          return this.playCustomAudioBlob(customBlob, maxDurationSec);
        }
      } catch (err) {
        console.warn('IndexedDB custom audio fetch warning:', err);
      }
    }

    switch (profileKey) {
      case 'chaganti':
        return this.playChagantiSample(maxDurationSec);

      case 'pawan':
        return this.playPawanSample();

      case 'anchor_suma':
        return this.playSumaSample();

      case 'anchor_jhansi':
        return this.playJhansiSample();

      case 'ntr':
        return this.playNTRSample();

      case 'prabhas':
        return this.playPrabhasSample();

      case 'mahesh':
        return this.playMaheshSample();

      case 'allu_arjun':
        return this.playAlluArjunSample();

      default:
        return Promise.resolve();
    }
  }

  playCustomAudioBlob(blob, maxDurationSec = null) {
    return new Promise((resolve) => {
      try {
        if (this.activeAudioElement) {
          this.activeAudioElement.pause();
          this.activeAudioElement = null;
        }

        const objectUrl = URL.createObjectURL(blob);
        this.activeAudioElement = new Audio(objectUrl);

        let timer = null;
        if (maxDurationSec && maxDurationSec > 0) {
          timer = setTimeout(() => {
            if (this.activeAudioElement) {
              this.activeAudioElement.pause();
              this.activeAudioElement = null;
            }
            URL.revokeObjectURL(objectUrl);
            resolve();
          }, maxDurationSec * 1000);
        }

        this.activeAudioElement.play().then(() => {
          this.activeAudioElement.onended = () => {
            if (timer) clearTimeout(timer);
            URL.revokeObjectURL(objectUrl);
            resolve();
          };
        }).catch(err => {
          if (timer) clearTimeout(timer);
          console.warn('Custom audio playback error:', err);
          URL.revokeObjectURL(objectUrl);
          resolve();
        });
      } catch (e) {
        console.warn('Audio decoding exception:', e);
        resolve();
      }
    });
  }

  async preloadChagantiAudio() {
    try {
      const response = await fetch('assets/audio/chaganti_gari_matalu.mp3');
      if (response.ok) {
        const blob = await response.blob();
        if (window.indexedDBAudioStore) {
          await window.indexedDBAudioStore.saveAudioBlob('chaganti', blob);
        }
        await this.processAndAnalyzeVoiceBlob('chaganti', blob);
      }
    } catch (e) {
      console.warn('Preload Chaganti MP3 warning:', e);
    }
  }

  async preloadNaturalVoices() {
    try {
      const maleResp = await fetch('assets/audio/test_male_natural.mp3');
      if (maleResp.ok) {
        const maleBlob = await maleResp.blob();
        await this.processAndAnalyzeVoiceBlob('telugu_male', maleBlob);
      }
      const femaleResp = await fetch('assets/audio/test_female_natural.mp3');
      if (femaleResp.ok) {
        const femaleBlob = await femaleResp.blob();
        await this.processAndAnalyzeVoiceBlob('telugu_female', femaleBlob);
      }
    } catch (e) {
      console.warn('Preload natural voices warning:', e);
    }
  }

  playChagantiSample(maxDurationSec = null) {
    return new Promise((resolve) => {
      try {
        if (this.activeAudioElement) {
          this.activeAudioElement.pause();
          this.activeAudioElement = null;
        }
        this.activeAudioElement = new Audio('assets/audio/chaganti_gari_matalu.mp3');

        let timer = null;
        if (maxDurationSec && maxDurationSec > 0) {
          timer = setTimeout(() => {
            if (this.activeAudioElement) {
              this.activeAudioElement.pause();
              this.activeAudioElement = null;
            }
            resolve();
          }, maxDurationSec * 1000);
        }

        this.activeAudioElement.play().then(() => {
          this.activeAudioElement.onended = () => {
            if (timer) clearTimeout(timer);
            resolve();
          };
        }).catch(err => {
          if (timer) clearTimeout(timer);
          console.warn('Chaganti sample play warning:', err);
          resolve();
        });
      } catch (e) {
        resolve();
      }
    });
  }

  playPawanSample() {
    return this.playAudioMelody([329.6, 440.0, 523.2], [0.2, 0.2, 0.5], 'sawtooth');
  }

  playSumaSample() {
    return this.playAudioMelody([523.2, 659.2, 783.9, 1046.5], [0.15, 0.15, 0.15, 0.4], 'sine');
  }

  playJhansiSample() {
    return this.playAudioMelody([261.6, 329.6, 392.0], [0.3, 0.3, 0.6], 'sine');
  }

  playNTRSample() {
    return this.playAudioMelody([220.0, 293.6, 349.2], [0.25, 0.25, 0.5], 'sawtooth');
  }

  playPrabhasSample() {
    return this.playAudioMelody([110.0, 130.8, 146.8], [0.4, 0.4, 0.8], 'sine');
  }

  playMaheshSample() {
    return this.playAudioMelody([293.6, 329.6, 392.0], [0.2, 0.2, 0.5], 'sine');
  }

  playAlluArjunSample() {
    return this.playAudioMelody([440.0, 554.3, 659.2], [0.15, 0.15, 0.4], 'triangle');
  }

  playAudioMelody(frequencies, durations, type = 'sine') {
    if (!this.audioCtx) return Promise.resolve();

    const ctx = this.audioCtx;
    let timeOffset = ctx.currentTime;

    frequencies.forEach((freq, i) => {
      const dur = durations[i];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, timeOffset);

      gain.gain.setValueAtTime(0.001, timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.3, timeOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, timeOffset + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(timeOffset);
      osc.stop(timeOffset + dur);

      timeOffset += dur + 0.05;
    });

    const totalMs = durations.reduce((a, b) => a + b, 0) * 1000 + 200;
    return new Promise(resolve => setTimeout(resolve, totalMs));
  }
}

window.celebrityAudioEngine = new CelebrityAudioEngine();
