/**
 * Web Audio API Vocal Equalizer, Compressor & Temple Mic Echo DSP Processor
 */
class VoiceDSPProcessor {
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
      console.warn('DSP AudioContext init warning:', e);
    }
  }

  /**
   * Process audio stream with Vocal EQ, Studio Compression, and Temple Mic Echo
   */
  attachDSPToAudioElement(audioEl, options = {}) {
    this.initContext();
    if (!this.audioCtx || !audioEl) return;

    try {
      const ctx = this.audioCtx;
      const source = ctx.createMediaElementSource(audioEl);

      // Low Shelf Filter: Warmth Bass Boost (+3.5dB at 160Hz)
      const lowShelf = ctx.createBiquadFilter();
      lowShelf.type = 'lowshelf';
      lowShelf.frequency.setValueAtTime(160, ctx.currentTime);
      lowShelf.gain.setValueAtTime(3.5, ctx.currentTime);

      // High Shelf Filter: Vocal Presence & Clarity (+4.0dB at 3200Hz)
      const highShelf = ctx.createBiquadFilter();
      highShelf.type = 'highshelf';
      highShelf.frequency.setValueAtTime(3200, ctx.currentTime);
      highShelf.gain.setValueAtTime(4.0, ctx.currentTime);

      // Dynamics Compressor: Studio Vocal Punch & Normalizer
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-18, ctx.currentTime);
      compressor.knee.setValueAtTime(12, ctx.currentTime);
      compressor.ratio.setValueAtTime(4, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      // Temple Mic Echo / Reverb Effect
      const echoType = options.micEcho || 'none';
      if (echoType !== 'none') {
        const delay = ctx.createDelay();
        delay.delayTime.setValueAtTime(echoType === 'heavy' ? 0.22 : 0.12, ctx.currentTime);

        const feedback = ctx.createGain();
        feedback.gain.setValueAtTime(echoType === 'heavy' ? 0.35 : 0.20, ctx.currentTime);

        source.connect(lowShelf);
        lowShelf.connect(highShelf);
        highShelf.connect(compressor);

        compressor.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);

        compressor.connect(ctx.destination);
        feedback.connect(ctx.destination);
      } else {
        source.connect(lowShelf);
        lowShelf.connect(highShelf);
        highShelf.connect(compressor);
        compressor.connect(ctx.destination);
      }
    } catch (e) {
      console.warn('DSP processing warning:', e);
    }
  }
}

window.voiceDSP = new VoiceDSPProcessor();

class TeluguTTSEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.anchorStyle = 'telugu_male';
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.repeatRemaining = 1;
    this.currentText = '';
    this.onWordHighlight = null;
    this.onStateChange = null;
    this.chimeEnabled = true;
    this.chimeType = 'temple_bell';

    this.initVoices();
    if (this.synth) {
      this.synth.onvoiceschanged = () => this.initVoices();
    }
  }

  initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  getAvailableVoices() {
    if (!this.synth) return [];
    this.voices = this.synth.getVoices();
    return this.voices;
  }

  setAnchorStyle(styleKey) {
    if (styleKey === 'telugu_female' || styleKey === 'female') {
      this.anchorStyle = 'telugu_female';
    } else {
      this.anchorStyle = 'telugu_male';
    }
  }

  isMaleProfile(profileKey) {
    if (profileKey === 'telugu_female' || profileKey === 'female' || profileKey === 'anchor_suma' || profileKey === 'anchor_jhansi') {
      return false;
    }
    return true;
  }

  setVoice(voiceURI) {
    if (!voiceURI) return;
    this.selectedVoiceURI = voiceURI;
  }

  selectVoiceForProfile(profileKey) {
    if (!this.synth) return null;
    this.voices = this.synth.getVoices();
    if (!this.voices || this.voices.length === 0) return null;

    if (this.selectedVoiceURI) {
      const explicitVoice = this.voices.find(v => v.voiceURI === this.selectedVoiceURI);
      if (explicitVoice) return explicitVoice;
    }

    const isMale = this.isMaleProfile(profileKey);

    // Priority 1: High Definition / Neural / Natural Telugu Voices with gender matching
    const teluguVoices = this.voices.filter(v => v.lang.toLowerCase().includes('te'));
    if (teluguVoices.length > 0) {
      const maleKeywords = ['mohan', 'rishi', 'karan', 'male', 'man'];
      const femaleKeywords = ['shruti', 'kavya', 'veena', 'female', 'woman'];

      if (isMale) {
        const maleTe = teluguVoices.find(v => maleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
        if (maleTe) return maleTe;
      } else {
        const femaleTe = teluguVoices.find(v => femaleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
        if (femaleTe) return femaleTe;
      }

      const neuralTe = teluguVoices.find(v => /natural|neural|google|hd|premium|online/i.test(v.name));
      if (neuralTe) return neuralTe;
      return teluguVoices[0];
    }

    // Priority 2: Indian Voices (Rishi, Mohan, Shruti, Veena, etc.)
    if (isMale) {
      const maleKeywords = ['ravi', 'mohan', 'karan', 'prabhat', 'david', 'george', 'mark', 'heera', 'rishi', 'male', 'man'];
      const indianMale = this.voices.find(v => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        const matchesMale = maleKeywords.some(kw => name.includes(kw));
        const isIndian = lang.includes('in') || lang.includes('hi');
        return matchesMale && isIndian;
      });

      if (indianMale) return indianMale;

      const anyMale = this.voices.find(v => maleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
      if (anyMale) return anyMale;
    } else {
      const femaleKeywords = ['shruti', 'kavya', 'veena', 'zira', 'susan', 'female', 'woman'];
      const indianFemale = this.voices.find(v => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        return femaleKeywords.some(kw => name.includes(kw)) && (lang.includes('in') || lang.includes('hi'));
      });
      if (indianFemale) return indianFemale;
    }

    return this.voices[0] || null;
  }

  /**
   * Reads extracted pitch features from uploaded file OR general voice acoustics
   */
  getAnchorAcoustics(userRate = 0.95, userPitch = 1.0) {
    let rate = userRate;
    let pitch = userPitch;

    const customAnalysis = window.StorageManager ? window.StorageManager.getVoiceAnalysis(this.anchorStyle) : null;

    if (customAnalysis && customAnalysis.pitchParam) {
      pitch = customAnalysis.pitchParam;
    } else if (this.anchorStyle === 'telugu_female' || this.anchorStyle === 'female') {
      rate = userRate * 0.96;
      pitch = userPitch * 1.05;
    } else {
      rate = userRate * 0.94;
      pitch = userPitch * 0.97;
    }

    rate = Math.min(Math.max(rate, 0.5), 1.6);
    pitch = Math.min(Math.max(pitch, 0.5), 1.8);

    return { rate, pitch };
  }

  formatAnchorText(text) {
    let formatted = text;
    formatted = formatted.replace(/రూపాఅయలు/g, 'రూపాయలు');
    formatted = formatted.replace(/(గారు|గారూ)/g, '$1, ');
    formatted = formatted.replace(/(రూపాయలు|రూపాయల)/g, ' $1. ');
    formatted = formatted.replace(/(కానుకగా|కానుక)/g, ' $1, ');
    formatted = formatted.replace(/(సమర్పించి ఉన్నారు|అందజేశారు|సమర్పించారు)/g, '$1! ');

    return formatted;
  }

  async speak(text, options = {}) {
    if (!text || text.trim() === '') return;

    if (!this.synth) {
      alert('Your browser does not support Web Speech API');
      return;
    }

    this.synth.cancel();

    this.currentText = text.trim();
    const settings = window.StorageManager ? window.StorageManager.getSettings() : {};
    
    const baseRate = options.rate !== undefined ? options.rate : settings.rate || 0.95;
    const basePitch = options.pitch !== undefined ? options.pitch : settings.pitch || 1.0;
    const volume = options.volume !== undefined ? options.volume : settings.volume || 1.0;
    const repeat = options.repeat !== undefined ? options.repeat : settings.repeatCount || 1;
    const chime = options.chime !== undefined ? options.chime : (settings.chimeType !== 'none');
    const chimeType = options.chimeType || settings.chimeType || 'temple_bell';
    
    if (options.anchorStyle) {
      this.anchorStyle = options.anchorStyle;
    } else if (settings.anchorStyle) {
      this.anchorStyle = settings.anchorStyle;
    }

    const { rate, pitch } = this.getAnchorAcoustics(baseRate, basePitch);

    this.repeatRemaining = repeat;
    this.chimeEnabled = chime;
    this.chimeType = chimeType;

    // Stop background sound while reading donations for crystal clear speech audio
    const bgmMode = options.bgmType || settings.bgmType || 'none';
    if (window.devotionalBGM) {
      if (bgmMode !== 'none') {
        window.devotionalBGM.startBGM(bgmMode, 0.12);
      } else {
        window.devotionalBGM.stopBGM(true);
      }
    }

    if (settings.ttsEngineMode === 'ai_server' && settings.aiServerUrl) {
      await this.executeAIServerSpeech(rate, pitch, volume, settings);
    } else {
      this.executeSpeech(rate, pitch, volume);
    }
  }

  async executeAIServerSpeech(rate, pitch, volume, settings) {
    this.isSpeaking = true;
    this.isPaused = false;
    if (this.onStateChange) this.onStateChange('speaking');

    try {
      let sampleBase64 = null;
      if (window.indexedDBAudioStore) {
        const customBlob = await window.indexedDBAudioStore.getAudioBlob(this.anchorStyle);
        if (customBlob) {
          sampleBase64 = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(customBlob);
          });
        }
      }

      const formattedText = this.formatAnchorText(this.currentText);
      const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
      const serverUrl = settings.aiServerUrl || `http://${host}:5005/api/generate-voice`;

      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formattedText,
          profile: this.anchorStyle,
          audioSampleBase64: sampleBase64
        })
      });

      if (!response.ok) {
        throw new Error(`AI Server HTTP Error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const objectUrl = URL.createObjectURL(audioBlob);

      if (this.activeAudioElement) {
        this.activeAudioElement.pause();
        this.activeAudioElement = null;
      }

      this.activeAudioElement = new Audio(objectUrl);
      this.activeAudioElement.volume = volume;

      this.activeAudioElement.onended = () => {
        URL.revokeObjectURL(objectUrl);
        this.isSpeaking = false;
        this.isPaused = false;
        if (window.devotionalBGM) window.devotionalBGM.stopBGM(true);
        if (this.onStateChange) this.onStateChange('stopped');
      };

      this.activeAudioElement.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        console.warn('AI Server Audio play error, falling back to local TTS');
        this.executeSpeech(rate, pitch, volume);
      };

      if (window.voiceDSP) {
        window.voiceDSP.attachDSPToAudioElement(this.activeAudioElement, { micEcho: settings.micEcho || 'subtle' });
      }

      await this.activeAudioElement.play();

    } catch (err) {
      console.warn('Method 3 AI Server fetch failed:', err);
      if (window.appUI && window.appUI.showToast) {
        window.appUI.showToast('AI Server offline, using fallback browser engine');
      }
      this.executeSpeech(rate, pitch, volume);
    }
  }

  executeSpeech(rate, pitch, volume) {
    if (!this.synth) return;

    this.isSpeaking = true;
    this.isPaused = false;
    if (this.onStateChange) this.onStateChange('speaking');

    const formattedText = this.formatAnchorText(this.currentText);
    const utterance = new SpeechSynthesisUtterance(formattedText);
    utterance.lang = 'te-IN';
    
    const profileVoice = this.selectVoiceForProfile(this.anchorStyle);
    if (profileVoice) {
      utterance.voice = profileVoice;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onboundary = (event) => {
      if (event.name === 'word' && this.onWordHighlight) {
        this.onWordHighlight(event.charIndex, event.charLength);
      }
    };

    utterance.onend = () => {
      if (this.isSpeaking) {
        this.repeatRemaining--;
        if (this.repeatRemaining > 0 || this.repeatRemaining === 999) {
          setTimeout(() => {
            if (this.isSpeaking) {
              const settings = window.StorageManager ? window.StorageManager.getSettings() : {};
              const { rate, pitch } = this.getAnchorAcoustics(settings.rate || 0.95, settings.pitch || 1.0);
              this.executeSpeech(rate, pitch, volume);
            }
          }, 1400);
        } else {
          this.isSpeaking = false;
          this.isPaused = false;
          if (window.devotionalBGM) window.devotionalBGM.stopBGM(true);
          if (this.onStateChange) this.onStateChange('stopped');
        }
      }
    };

    utterance.onerror = (event) => {
      console.error('SpeechSynthesis error:', event);
      this.isSpeaking = false;
      this.isPaused = false;
      if (this.onStateChange) this.onStateChange('error');
    };

    window.activeUtterance = utterance;
    this.currentUtterance = utterance;

    try {
      this.synth.cancel();
      if (this.synth.paused) {
        this.synth.resume();
      }
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis speak error:', e);
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange('stopped');
    }
  }

  pause() {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      if (this.onStateChange) this.onStateChange('paused');
    }
  }

  resume() {
    if (this.synth && this.isSpeaking && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      if (this.onStateChange) this.onStateChange('speaking');
    }
  }

  stop() {
    if (this.synth) {
      this.repeatRemaining = 0;
      this.isSpeaking = false;
      this.isPaused = false;
      this.synth.cancel();
      if (this.activeAudioElement) {
        try { this.activeAudioElement.pause(); } catch(e){}
        this.activeAudioElement = null;
      }
      if (window.devotionalBGM) window.devotionalBGM.stopBGM(true);
      if (this.onStateChange) this.onStateChange('stopped');
    }
  }
}

window.ttsEngine = new TeluguTTSEngine();
