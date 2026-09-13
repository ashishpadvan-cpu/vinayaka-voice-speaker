/**
 * Main Application Controller for Vinayaka Chavithi Mic Reader & Telugu Speech App
 */

// Preset Templates for Custom Telugu Matter
const PRESET_TEMPLATES = {
  pooja: {
    title: 'పూజా కార్యక్రమ సమయాలు',
    text: 'గమనిక! శ్రీ వినాయక చవితి పందిరి వద్ద ఈరోజు సాయంత్రం 6:30 గంటలకు స్వామివారికి విశేష ధూప దీప నైవేద్యాలు మరియు మహా హారతి కార్యక్రమం నిర్వహించబడును. భక్తులందరూ విశేషంగా పాల్గొని తీర్థ ప్రసాదాలు స్వీకరించగలరని మనవి!'
  },
  annadanam: {
    title: 'మహా అన్నదాన ఆహ్వానం',
    text: 'భక్తులకు విజ్ఞప్తి! ఈరోజు మధ్యాహ్నం 12:30 గంటల నుండి శ్రీ వినాయక స్వామివారి మహాపందిరి ప్రాంగణంలో భక్తులందరికీ మహా అన్నదాన కార్యక్రమం ఏర్పాటు చేయబడింది. ప్రజలందరూ దయచేసి విచ్చేసి స్వామివారి ప్రసాదాన్ని స్వీకరించి స్వామివారి కృపకు పాత్రులు కావలసిందిగా కోరుచున్నాము!'
  },
  laddu: {
    title: 'స్వామివారి లడ్డూ వేలం పాట',
    text: 'అందరికీ నమస్కారం! మన వీధిలో వేంచేసియున్న శ్రీ శక్తి గణపతి స్వామివారి పవిత్ర లడ్డూ ప్రసాదం బహిరంగ వేలం పాట ఈరోజు రాత్రి 8:00 గంటలకు ప్రారంభమగును. ఆసక్తి గల భక్తులందరూ ఈ వేలం పాటలో పాల్గొనవలసిందిగా కోరుచున్నాము!'
  },
  nimajjanam: {
    title: 'వినాయక విగ్రహ నిమజ్జనం',
    text: 'ప్రజలందరికీ గమనిక! శ్రీ వినాయక స్వామివారి శోభాయాత్ర మరియు విగ్రహ నిమజ్జనోత్సవం రేపు సాయంత్రం 4:00 గంటలకు మన ఉత్సవ పందిరి నుండి ప్రారంభమవుతుంది. భక్తజనులందరూ పాల్గొని స్వామివారికి ఘనంగా వీడ్కోలు పలకవలసిందిగా కోరుతున్నాము!'
  },
  cultural: {
    title: 'సాంస్కృతిక కార్యక్రమాలు & పోటీలు',
    text: 'చిన్నారులకు మరియు మహిళలకు శుభవార్త! ఈరోజు సాయంత్రం 5:00 గంటలకు వినాయక చవితి ఉత్సవ వేదికపై పిల్లల భక్తి పాటలు మరియు ముగ్గుల పోటీలు నిర్వహించబడును. విజేతలకు బహుమతులు అందజేయబడును.'
  }
};

/**
 * Convert numbers into Telugu word pronunciation for clear mic speech
 */
function convertNumberToTeluguWords(num) {
  const n = parseInt(num, 10);
  if (isNaN(n)) return num.toString();
  if (n === 0) return 'సున్నా';

  const units = ['', 'ఒక్కటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది', 'పది', 'పదకొండు', 'పన్నెండు', 'పదమూడు', 'పద్నాలుగు', 'పదిహేను', 'పదహారు', 'పదిహేడు', 'పద్ధెనిమిది', 'పంతొమ్మిది'];
  const tens = ['', '', 'ఇరవై', 'ముప్పై', 'నలభై', 'యాభై', 'అరవై', 'దెబ్బై', 'ఎనుభై', 'తొంబై'];

  if (n < 20) return units[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const rem = n % 10;
    return tens[t] + (rem > 0 ? ' ' + units[rem] : '');
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    if (rem === 0) {
      return h === 1 ? 'వంద' : units[h] + ' వందలు';
    } else {
      const hWord = (h === 1 ? 'నూట' : units[h] + ' వందల');
      return hWord + ' ' + convertNumberToTeluguWords(rem);
    }
  }
  if (n < 100000) {
    const th = Math.floor(n / 1000);
    const rem = n % 1000;
    if (rem === 0) {
      return th === 1 ? 'వెయ్యి' : convertNumberToTeluguWords(th) + ' వేలు';
    } else {
      const thWord = (th === 1 ? 'వెయ్యి' : convertNumberToTeluguWords(th) + ' వేల');
      return thWord + ' ' + convertNumberToTeluguWords(rem);
    }
  }
  
  return n.toLocaleString('te-IN');
}

/**
 * Ensures donor name ends with honorific 'గారు' (Garu)
 */
function ensureNameHasGaru(rawName) {
  if (!rawName) return '';
  let name = rawName.trim();
  if (/(\bగారు\b|గారు$|\bgaru\b|\bGaru\b)/i.test(name)) {
    return name;
  }
  return `${name} గారు`;
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

class AppUI {
  constructor() {
    this.activeTab = 'donor-tab';
    this.currentSpeakingText = '';
    this.uiLang = 'te';
    this.initElements();
    
    // Set default sample donor entries if empty so app responds immediately on tap
    if (this.donorName && !this.donorName.value) {
      this.donorName.value = 'పి. రామారావు';
    }
    if (this.donorAmount && !this.donorAmount.value) {
      this.donorAmount.value = '1116';
    }

    // Unlock Web Speech API & Web Audio Context on mobile touch
    const unlockMobileAudio = () => {
      if (window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      if (window.voiceDSP && window.voiceDSP.audioCtx && window.voiceDSP.audioCtx.state === 'suspended') {
        window.voiceDSP.audioCtx.resume();
      }
    };
    document.addEventListener('touchstart', unlockMobileAudio, { passive: true });
    document.addEventListener('click', unlockMobileAudio, { passive: true });

    this.setupTransliteration();
    this.bindEvents();
    this.loadSettings();
    if (window.celebrityAudioEngine && window.celebrityAudioEngine.preloadNaturalVoices) {
      window.celebrityAudioEngine.preloadNaturalVoices();
    }
    this.renderSavedItems();
    this.updateDonorPreview();
  }

  initElements() {
    // Navigation
    this.tabs = document.querySelectorAll('.tab-btn');
    this.tabViews = document.querySelectorAll('.tab-view');
    
    // Donor Form
    this.donorName = document.getElementById('donor-name');
    this.donorAmount = document.getElementById('donor-amount');
    this.donorPurpose = document.getElementById('donor-purpose');
    this.donorVillage = document.getElementById('donor-village');
    this.anchorVoiceStyle = document.getElementById('anchor-voice-style');
    this.quickVoiceTestBtn = document.getElementById('quick-voice-test-btn');
    this.announcementStyle = document.getElementById('announcement-style');
    this.donorPreviewText = document.getElementById('donor-preview-text');
    this.announceDonorBtn = document.getElementById('announce-donor-btn');
    this.saveDonorBtn = document.getElementById('save-donor-btn');
    this.resetDonorBtn = document.getElementById('reset-donor-btn');
    this.copyDonorBtn = document.getElementById('copy-donor-btn');

    // Custom Matter Form
    this.matterTitle = document.getElementById('matter-title');
    this.customTextInput = document.getElementById('custom-text-input');
    this.customPreviewText = document.getElementById('custom-preview-text');
    this.readCustomBtn = document.getElementById('read-custom-btn');
    this.saveMatterBtn = document.getElementById('save-matter-btn');
    this.clearCustomBtn = document.getElementById('clear-custom-btn');

    // Custom Audio File Upload
    this.uploadVoiceProfile = document.getElementById('upload-voice-profile');
    this.customAudioFileInput = document.getElementById('custom-audio-file-input');
    this.saveCustomVoiceBtn = document.getElementById('save-custom-voice-btn');
    this.testUploadedVoiceBtn = document.getElementById('test-uploaded-voice-btn');
    this.removeCustomVoiceBtn = document.getElementById('remove-custom-voice-btn');
    this.customVoiceStatusBox = document.getElementById('custom-voice-status-box');
    this.customVoiceStatusText = document.getElementById('custom-voice-status-text');
    this.customVoicePitchBadge = document.getElementById('custom-voice-pitch-badge');

    // Method 3 AI Server Controls
    this.ttsEngineModeSelect = document.getElementById('tts-engine-mode');
    this.aiServerUrlInput = document.getElementById('ai-server-url');
    this.testAIServerBtn = document.getElementById('test-ai-server-btn');
    this.aiServerStatusBadge = document.getElementById('ai-server-status-badge');

    // Settings Controls
    this.voiceSelect = document.getElementById('voice-select');
    this.chimeSelect = document.getElementById('chime-select');
    this.bgmSelect = document.getElementById('bgm-select');
    this.micEchoSelect = document.getElementById('mic-echo-select');
    this.repeatSelect = document.getElementById('repeat-select');
    this.speedRange = document.getElementById('speed-range');
    this.pitchRange = document.getElementById('pitch-range');
    this.speedVal = document.getElementById('speed-val');
    this.pitchVal = document.getElementById('pitch-val');
    this.testVoiceBtn = document.getElementById('test-voice-btn');

    // Player Bar
    this.mainPlayBtn = document.getElementById('main-play-btn');
    this.mainStopBtn = document.getElementById('main-stop-btn');
    this.statusText = document.getElementById('status-text');
    this.liveDot = document.getElementById('live-dot');
    this.eqVisualizer = document.getElementById('eq-visualizer');
    this.loopText = document.getElementById('loop-text');

    // Header Controls
    this.themeToggle = document.getElementById('theme-toggle');
    this.langToggle = document.getElementById('lang-toggle');
    this.langLabel = document.getElementById('lang-label');

    // Search Box
    this.searchInput = document.getElementById('search-input');

    // Bulk & Announce All Donors Controls
    this.eventTitlePrefix = document.getElementById('event-title-prefix');
    this.announceAllDonorsBtn = document.getElementById('announce-all-donors-btn');
    this.toggleBulkEntryBtn = document.getElementById('toggle-bulk-entry-btn');
    this.tab1ToggleBulkBtn = document.getElementById('tab1-toggle-bulk-btn');
    this.bulkEntryCard = document.getElementById('bulk-entry-card');
    this.bulkDonorsInput = document.getElementById('bulk-donors-input');
    this.saveBulkDonorsBtn = document.getElementById('save-bulk-donors-btn');
    this.clearBulkDonorsBtn = document.getElementById('clear-bulk-donors-btn');

    // Item donation elements
    this.donationTypeBtns = document.querySelectorAll('#donation-type-group .segmented-btn');
    this.amountInputGroup = document.getElementById('amount-input-group');
    this.itemInputGroup = document.getElementById('item-input-group');
    this.donorItem = document.getElementById('donor-item');
    this.itemPills = document.querySelectorAll('.item-pill');
    this.statItemCount = document.getElementById('stat-item-count');
    this.currentDonationType = 'cash';

    // Mobile Sync Elements
    this.mobileSyncBtn = document.getElementById('mobile-sync-btn');
    this.mobileSyncModal = document.getElementById('mobile-sync-modal');
    this.closeMobileSyncModal = document.getElementById('close-mobile-sync-modal');
    this.qrCodeContainer = document.getElementById('qr-code-container');
    this.mobileSyncUrlLink = document.getElementById('mobile-sync-url-link');
    this.syncStatusIndicator = document.getElementById('sync-status-indicator');
  }

  bindEvents() {
    // Tab switching
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        this.switchTab(target);
      });
    });

    // Segmented donation type switcher
    this.donationTypeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.donationTypeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentDonationType = btn.dataset.type;

        if (this.currentDonationType === 'cash') {
          if (this.amountInputGroup) this.amountInputGroup.style.display = 'block';
          if (this.itemInputGroup) this.itemInputGroup.style.display = 'none';
        } else if (this.currentDonationType === 'item') {
          if (this.amountInputGroup) this.amountInputGroup.style.display = 'none';
          if (this.itemInputGroup) this.itemInputGroup.style.display = 'block';
        } else { // both
          if (this.amountInputGroup) this.amountInputGroup.style.display = 'block';
          if (this.itemInputGroup) this.itemInputGroup.style.display = 'block';
        }
        this.updateDonorPreview();
      });
    });

    // Preset Item Pills
    this.itemPills.forEach(pill => {
      pill.addEventListener('click', () => {
        if (this.donorItem) {
          this.donorItem.value = pill.dataset.item;
          this.donorItem.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });

    // Live preview generator on donor input change
    const donorInputs = [this.donorName, this.donorAmount, this.donorItem, this.donorPurpose, this.donorVillage, this.announcementStyle].filter(Boolean);
    donorInputs.forEach(input => {
      input.addEventListener('input', () => this.updateDonorPreview());
      input.addEventListener('change', () => this.updateDonorPreview());
    });

    // Anchor Voice selection update
    if (this.anchorVoiceStyle) {
      this.anchorVoiceStyle.addEventListener('change', () => {
        if (window.ttsEngine) window.ttsEngine.setAnchorStyle(this.anchorVoiceStyle.value);
        this.saveSettingsFromUI();
      });
    }

    // Custom Celebrity Voice Upload & Feature Processing Handler (IndexedDB)
    if (this.uploadVoiceProfile) {
      this.uploadVoiceProfile.addEventListener('change', () => this.renderCustomVoiceStatus());
    }

    if (this.saveCustomVoiceBtn && this.customAudioFileInput) {
      this.saveCustomVoiceBtn.addEventListener('click', async () => {
        const file = this.customAudioFileInput.files[0];
        const profile = this.uploadVoiceProfile.value;
        if (!file) {
          this.showToast(this.uiLang === 'en' ? 'Please select an audio file (.mp3, .m4a, .wav)' : 'దయచేసి ఆడియో ఫైల్ ఎంచుకోండి (.mp3, .m4a, .wav)');
          return;
        }

        try {
          if (window.indexedDBAudioStore) {
            this.showToast(this.uiLang === 'en' ? 'Processing & Analyzing Voice File...' : 'ఆడియో ఫైల్ ప్రొసెస్ మరియు విశ్లేషిస్తోంది...');
            await window.indexedDBAudioStore.saveAudioBlob(profile, file);
            
            let analysis = null;
            if (window.celebrityAudioEngine) {
              analysis = await window.celebrityAudioEngine.processAndAnalyzeVoiceBlob(profile, file);
            }

            const pitchInfo = analysis && analysis.pitchHz > 0 ? ` (${analysis.pitchHz} Hz)` : '';
            this.showToast(this.uiLang === 'en' 
              ? `Voice Audio Saved & Analyzed!${pitchInfo} 🎙️` 
              : `సొంత ఆడియో ప్రొసెస్ & విశ్లేషించబడింది!${pitchInfo} 🎙️`);
              
            await this.renderCustomVoiceStatus();
          }
        } catch (err) {
          console.error('Audio file save error:', err);
          this.showToast(this.uiLang === 'en' ? 'Error processing audio file' : 'ఆడియో ఫైల్ ప్రాసెస్ చేయడంలో పొరపాటు జరిగింది');
        }
      });
    }

    if (this.testUploadedVoiceBtn) {
      this.testUploadedVoiceBtn.addEventListener('click', async () => {
        const profile = this.uploadVoiceProfile.value;
        if (window.indexedDBAudioStore && window.celebrityAudioEngine) {
          const blob = await window.indexedDBAudioStore.getAudioBlob(profile);
          if (blob) {
            this.showToast(this.uiLang === 'en' ? 'Playing Processed Voice Sample...' : 'ప్రోసెస్ చేసిన ఆడియో ప్రసారమవుతోంది...');
            window.celebrityAudioEngine.playCustomAudioBlob(blob);
          } else {
            this.showToast(this.uiLang === 'en' ? 'No uploaded audio found for this profile' : 'ఈ సెలబ్రిటీకి అప్‌లోడ్ చేసిన ఆడియో ఫైల్ ఏదీ లేదు');
          }
        }
      });
    }

    if (this.removeCustomVoiceBtn) {
      this.removeCustomVoiceBtn.addEventListener('click', async () => {
        const profile = this.uploadVoiceProfile.value;
        if (window.indexedDBAudioStore) {
          await window.indexedDBAudioStore.removeAudioBlob(profile);
          this.showToast(this.uiLang === 'en' ? 'Custom Voice Removed' : 'అప్‌లోడ్ చేసిన ఆడియో ఫైల్ తీసివేయబడింది');
          await this.renderCustomVoiceStatus();
        }
      });
    }

    // Quick Voice Test Button Handler
    if (this.quickVoiceTestBtn) {
      this.quickVoiceTestBtn.addEventListener('click', () => {
        const style = this.anchorVoiceStyle.value;
        let testSample = '';

        if (style === 'chaganti') {
          testSample = 'చాగంటి వారి దైవిక వాయిస్ మైక్ టెస్టింగ్... 1 2 3.';
        } else if (style === 'pawan') {
          testSample = 'పవన్ కళ్యాణ్ గారి పవర్ఫుల్ మైక్ టెస్టింగ్... 1 2 3.';
        } else if (style === 'anchor_suma') {
          testSample = 'యాంకర్ సుమ గారి వాయిస్ మైక్ టెస్టింగ్... 1 2 3.';
        } else if (style === 'ntr') {
          testSample = 'ఎన్టీఆర్ గారి పవర్ మైక్ టెస్టింగ్... 1 2 3.';
        } else if (style === 'prabhas') {
          testSample = 'ప్రభాస్ గారి డార్లింగ్ వాయిస్ మైక్ టెస్టింగ్... 1 2 3.';
        } else if (style === 'telugu_female') {
          testSample = 'సహజ సిద్ధమైన తెలుగు స్త్రీ స్వర మైక్ టెస్టింగ్... 1 2 3.';
        } else {
          testSample = 'సహజ సిద్ధమైన తెలుగు పురుష స్వర మైక్ టెస్టింగ్... 1 2 3.';
        }

        window.ttsEngine.speak(testSample, { anchorStyle: style });
        this.showToast(this.uiLang === 'en' ? 'Testing Selected Voice...' : 'ఎంచుకున్న వాయిస్ టెస్ట్ నడుస్తోంది...');
      });
    }

    // Donor Actions
    if (this.announceDonorBtn) {
      this.announceDonorBtn.addEventListener('click', () => {
        const text = this.generateDonorTeluguText();
        if (text) {
          const styleVal = this.anchorVoiceStyle ? this.anchorVoiceStyle.value : 'telugu_male';
          if (window.ttsEngine) window.ttsEngine.speak(text, { anchorStyle: styleVal });
        } else {
          this.showToast(this.uiLang === 'en' ? 'Please enter donor name and amount' : 'దయచేసి దాత పేరు మరియు అమౌంట్ నమోదు చేయండి');
        }
      });
    }

    if (this.copyDonorBtn) {
      this.copyDonorBtn.addEventListener('click', async () => {
        const text = this.generateDonorTeluguText();
        if (!text) {
          this.showToast(this.uiLang === 'en' ? 'Nothing to copy yet' : 'కాపీ చేయడానికి మ్యాటర్ లేదు');
          return;
        }

        try {
          await navigator.clipboard.writeText(text);
          this.showToast(this.uiLang === 'en' ? 'Announcement copied' : 'ఎనౌన్స్‌మెంట్ కాపీ అయింది');
        } catch (err) {
          this.showToast(this.uiLang === 'en' ? 'Copy failed' : 'కాపీ కాలేదు');
        }
      });
    }

    if (this.saveDonorBtn) {
      this.saveDonorBtn.addEventListener('click', () => {
        const name = this.donorName ? this.donorName.value.trim() : '';
        const amount = this.donorAmount ? this.donorAmount.value.trim() : '';
        const item = this.donorItem ? this.donorItem.value.trim() : '';
        const type = this.currentDonationType;

        if (!name) {
          this.showToast(this.uiLang === 'en' ? 'Please enter donor name' : 'దయచేసి దాత పేరు నమోదు చేయండి');
          return;
        }
        if (type === 'cash' && !amount) {
          this.showToast(this.uiLang === 'en' ? 'Please enter donation amount' : 'దయచేసి చందా మొత్తం టైప్ చేయండి');
          return;
        }
        if (type === 'item' && !item) {
          this.showToast(this.uiLang === 'en' ? 'Please enter item details' : 'దయచేసి వస్తువు వివరాలు నమోదు చేయండి');
          return;
        }
        if (type === 'both' && !amount && !item) {
          this.showToast(this.uiLang === 'en' ? 'Please enter amount or item details' : 'దయచేసి నగదు లేదా వస్తువు వివరాలు నమోదు చేయండి');
          return;
        }

        const text = this.generateDonorTeluguText();
        const savedDonor = window.StorageManager ? window.StorageManager.saveDonor({
          name: name,
          donationType: type,
          amount: amount,
          itemDetails: item,
          purpose: this.donorPurpose ? this.donorPurpose.value : '',
          village: this.donorVillage ? this.donorVillage.value : '',
          generatedText: text
        }) : null;
        if (window.committeeSyncEngine) {
          window.committeeSyncEngine.pushDonorUpdate(savedDonor, 'save');
        }
        this.showToast(this.uiLang === 'en' ? 'Donor record saved & synced! 💾' : 'దాత వివరాలు సేవ్ అయ్యాయి & సింక్ అయ్యాయి! 💾');
        this.renderSavedItems();
      });
    }

    if (this.resetDonorBtn) {
      this.resetDonorBtn.addEventListener('click', () => {
        if (this.donorName) this.donorName.value = '';
        if (this.donorAmount) this.donorAmount.value = '';
        if (this.donorItem) this.donorItem.value = '';
        if (this.donorVillage) this.donorVillage.value = '';
        this.updateDonorPreview();
      });
    }

    // Toggle Bulk Entry Box
    const toggleBulk = () => {
      if (this.bulkEntryCard) {
        const isHidden = this.bulkEntryCard.style.display === 'none';
        this.bulkEntryCard.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
          this.switchTab('list-tab');
          if (this.bulkDonorsInput) this.bulkDonorsInput.focus();
        }
      }
    };
    if (this.toggleBulkEntryBtn) this.toggleBulkEntryBtn.addEventListener('click', toggleBulk);
    if (this.tab1ToggleBulkBtn) this.tab1ToggleBulkBtn.addEventListener('click', toggleBulk);
    if (this.clearBulkDonorsBtn) {
      this.clearBulkDonorsBtn.addEventListener('click', () => {
        if (this.bulkEntryCard) this.bulkEntryCard.style.display = 'none';
      });
    }

    // Save Bulk Donors at Once (Supports Cash, Items, and Combined Cash+Items)
    if (this.saveBulkDonorsBtn) {
      this.saveBulkDonorsBtn.addEventListener('click', () => {
        const rawText = this.bulkDonorsInput ? this.bulkDonorsInput.value.trim() : '';
        if (!rawText) {
          this.showToast(this.uiLang === 'en' ? 'Please enter donor details!' : 'దయచేసి దాతల వివరాలు నమోదు చేయండి!');
          return;
        }

        const lines = rawText.split('\n');
        let count = 0;
        const newDonorsList = [];

        lines.forEach(line => {
          const trimmed = line.trim();
          if (!trimmed) return;

          const parts = trimmed.split(/[,:\-\t]+/);
          if (parts.length >= 2) {
            const rawName = parts[0].trim();
            if (!rawName) return;

            const displayName = ensureNameHasGaru(rawName);
            let donationType = 'cash';
            let amount = 0;
            let itemDetails = '';
            let generatedText = '';

            if (parts.length >= 3) {
              amount = parseFloat(parts[1].replace(/[^0-9.]/g, '')) || 0;
              itemDetails = parts.slice(2).join(', ').trim();
              const itemWords = itemDetails.replace(/\b\d+\b/g, m => convertNumberToTeluguWords(m));

              if (amount > 0 && itemDetails) {
                donationType = 'both';
                const amountWords = convertNumberToTeluguWords(amount);
                generatedText = `శ్రీ శ్రీ శ్రీ వినాయక చవితి మహోత్సవాల సందర్భంగా... మన పందిరి దాతలు శ్రీ ${displayName}... రూపాయలు ${amountWords} నగదు చందాతో పాటు... పవిత్ర కానుకగా ${itemWords} సమర్పించి ఉన్నారు!`;
              } else if (amount > 0) {
                donationType = 'cash';
                const amountWords = convertNumberToTeluguWords(amount);
                generatedText = `శ్రీ శ్రీ శ్రీ వినాయక చవితి మహోత్సవాల సందర్భంగా... మన పందిరి దాతలు శ్రీ ${displayName}... స్వామివారి చందా కొరకు... రూపాయలు ${amountWords} సమర్పించి ఉన్నారు!`;
              } else {
                donationType = 'item';
                itemDetails = parts.slice(1).join(', ').trim();
                const itemWordsOnly = itemDetails.replace(/\b\d+\b/g, m => convertNumberToTeluguWords(m));
                generatedText = `శ్రీ శ్రీ శ్రీ వినాయక చవితి మహోత్సవాల సందర్భంగా... మన పందిరి దాతలు శ్రీ ${displayName}... స్వామివారి చందా కొరకు... పవిత్ర కానుకగా ${itemWordsOnly} సమర్పించి ఉన్నారు!`;
              }
            } else {
              // 2 parts: check if part 2 is numeric amount or item description
              const part2 = parts[1].trim();
              const hasWords = /[a-zA-Z\u0C00-\u0C7F]/.test(part2.replace(/^(rs|rupees|రూ|రూపాయలు|₹)\.?\s*/i, ''));
              const numericVal = parseFloat(part2.replace(/[^0-9.]/g, '')) || 0;

              if (!hasWords && numericVal > 0) {
                donationType = 'cash';
                amount = numericVal;
                const amountWords = convertNumberToTeluguWords(amount);
                generatedText = `శ్రీ శ్రీ శ్రీ వినాయక చవితి మహోత్సవాల సందర్భంగా... మన పందిరి దాతలు శ్రీ ${displayName}... స్వామివారి చందా కొరకు... రూపాయలు ${amountWords} సమర్పించి ఉన్నారు!`;
              } else {
                donationType = 'item';
                itemDetails = part2;
                const itemWordsOnly = itemDetails.replace(/\b\d+\b/g, m => convertNumberToTeluguWords(m));
                generatedText = `శ్రీ శ్రీ శ్రీ వినాయక చవితి మహోత్సవాల సందర్భంగా... మన పందిరి దాతలు శ్రీ ${displayName}... స్వామివారి చందా కొరకు... పవిత్ర కానుకగా ${itemWordsOnly} సమర్పించి ఉన్నారు!`;
              }
            }

            const savedEntry = window.StorageManager.saveDonor({
              name: displayName,
              donationType: donationType,
              amount: amount,
              itemDetails: itemDetails,
              purpose: 'వినాయక చవితి చందా',
              village: '',
              generatedText: generatedText
            });
            if (savedEntry) newDonorsList.push(savedEntry);
            count++;
          }
        });

        if (count > 0) {
          if (window.committeeSyncEngine && newDonorsList.length > 0) {
            window.committeeSyncEngine.pushBulkDonors(newDonorsList);
          }
          if (this.bulkDonorsInput) this.bulkDonorsInput.value = '';
          if (this.bulkEntryCard) this.bulkEntryCard.style.display = 'none';
          this.renderSavedItems();
          this.showToast(this.uiLang === 'en' ? `Successfully saved & synced ${count} donors!` : `${count} దాతల వివరాలు విజయవంతంగా సేవ్ & సింక్ చేయబడ్డాయి!`);
        } else {
          this.showToast(this.uiLang === 'en' ? 'Format: Name, Amount or Item (e.g. Rama Rao, 1116)' : 'లైన్‌లు సరిగ్గా గుర్తింపబడలేదు. ఉదా: పి. రామారావు, 1116');
        }
      });
    }

    // Announce All Donors sequentially (Supports Cash, Items, and Both)
    if (this.announceAllDonorsBtn) {
      this.announceAllDonorsBtn.addEventListener('click', () => {
        const donors = window.StorageManager.getDonors();
        if (!donors || donors.length === 0) {
          this.showToast(this.uiLang === 'en' ? 'No saved donors found!' : 'సేవ్ చేసిన దాతల రికార్డులు ఏవీ లేవు!');
          return;
        }

        const eventTitle = this.eventTitlePrefix ? this.eventTitlePrefix.value.trim() : 'శ్రీ శ్రీ వరసిద్ధి వినాయక 16వ వార్షికోత్సవం సందర్భంగా చందాలు మరియు వస్తు కానుకలు ఇచ్చిన దాతల వివరాలు:';
        
        let fullText = `${eventTitle} `;
        let totalSum = 0;
        let totalItemsCount = 0;

        donors.forEach((donor, index) => {
          const numWord = convertNumberToTeluguWords(index + 1);
          const displayName = ensureNameHasGaru(donor.name);
          const itemText = (donor.itemDetails || '').replace(/\b\d+\b/g, m => convertNumberToTeluguWords(m));

          if (donor.donationType === 'item' || (!donor.amount && donor.itemDetails)) {
            totalItemsCount++;
            fullText += `${numWord}. శ్రీ ${displayName}, పవిత్ర కానుకగా ${itemText}. `;
          } else if (donor.donationType === 'both') {
            totalSum += (donor.amount || 0);
            totalItemsCount++;
            const amtWords = convertNumberToTeluguWords(donor.amount);
            fullText += `${numWord}. శ్రీ ${displayName}, ${amtWords} రూపాయల నగదు మరియు ${itemText} కానుక. `;
          } else {
            totalSum += (donor.amount || 0);
            const amtWords = convertNumberToTeluguWords(donor.amount);
            fullText += `${numWord}. శ్రీ ${displayName}, ${amtWords} రూపాయలు చందా. `;
          }
        });

        let summaryStr = '';
        if (totalSum > 0) {
          summaryStr += `మొత్తం చందాల రూపంలో సేకరించిన మొత్తం రూపాయలు ${convertNumberToTeluguWords(totalSum)}. `;
        }
        if (totalItemsCount > 0) {
          summaryStr += `మరియు ${convertNumberToTeluguWords(totalItemsCount)} పవిత్ర వస్తు రూప కానుకలు సమర్పించబడ్డాయి. `;
        }

        fullText += `${summaryStr}దాతలందరికీ ఉత్సవ నిర్వహణ కమిటీ తరఫున హృదయపూర్వక ధన్యవాదాలు!`;

        this.currentSpeakingText = fullText;
        if (window.ttsEngine) window.ttsEngine.speak(fullText, { anchorStyle: this.anchorVoiceStyle ? this.anchorVoiceStyle.value : 'telugu_male' });
        this.showToast(this.uiLang === 'en' ? 'Broadcasting complete donors list...' : 'అందరి దాతల వివరాలు మైక్‌లో ప్రసారమవుతున్నాయి...');
      });
    }

    // Settings Controls
    if (this.speedRange) {
      this.speedRange.addEventListener('input', (e) => {
        if (this.speedVal) this.speedVal.textContent = e.target.value + 'x';
        this.saveSettingsFromUI();
      });
    }

    if (this.pitchRange) {
      this.pitchRange.addEventListener('input', (e) => {
        if (this.pitchVal) this.pitchVal.textContent = e.target.value;
        this.saveSettingsFromUI();
      });
    }

    if (this.chimeSelect) this.chimeSelect.addEventListener('change', () => this.saveSettingsFromUI());
    if (this.bgmSelect) this.bgmSelect.addEventListener('change', () => this.saveSettingsFromUI());
    if (this.micEchoSelect) this.micEchoSelect.addEventListener('change', () => this.saveSettingsFromUI());
    if (this.repeatSelect) {
      this.repeatSelect.addEventListener('change', () => {
        const val = this.repeatSelect.value;
        if (this.loopText) this.loopText.textContent = val === '999' ? 'Loop' : val + 'x';
        this.saveSettingsFromUI();
      });
    }
    if (this.voiceSelect) {
      this.voiceSelect.addEventListener('change', () => {
        if (window.ttsEngine) window.ttsEngine.setVoice(this.voiceSelect.value);
        this.saveSettingsFromUI();
      });
    }

    if (this.testVoiceBtn) {
      this.testVoiceBtn.addEventListener('click', () => {
        const styleVal = this.anchorVoiceStyle ? this.anchorVoiceStyle.value : 'telugu_male';
        if (window.ttsEngine) window.ttsEngine.speak('అందరికీ నమస్కారం! శ్రీ వినాయక చవితి మైక్ టెస్టింగ్... 1 2 3.', { anchorStyle: styleVal });
      });
    }

    // Main Player Bar controls
    if (this.mainPlayBtn) {
      this.mainPlayBtn.addEventListener('click', () => {
        if (window.ttsEngine && window.ttsEngine.isSpeaking) {
          if (window.ttsEngine.isPaused) {
            window.ttsEngine.resume();
          } else {
            window.ttsEngine.pause();
          }
        } else {
          if (this.activeTab === 'donor-tab') {
            if (this.announceDonorBtn) this.announceDonorBtn.click();
          } else {
            if (this.readCustomBtn) this.readCustomBtn.click();
          }
        }
      });
    }

    if (this.mainStopBtn) {
      this.mainStopBtn.addEventListener('click', () => {
        if (window.ttsEngine) window.ttsEngine.stop();
      });
    }

    // TTS Engine callbacks
    if (window.ttsEngine) {
      window.ttsEngine.onStateChange = (state) => this.handleTTSStateChange(state);
      window.ttsEngine.onWordHighlight = (charIndex, charLength) => this.highlightSpokenWord(charIndex, charLength);
    }

    // Theme Toggle
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        this.themeToggle.innerHTML = next === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
      });
    }

    // Language Toggle (English <-> Telugu UI)
    if (this.langToggle) {
      this.langToggle.addEventListener('click', () => {
        this.uiLang = this.uiLang === 'te' ? 'en' : 'te';
        this.applyLanguageUI(this.uiLang);
        this.saveSettingsFromUI();
      });
    }

    // Committee Mobile Sync Modal Handlers
    if (this.mobileSyncBtn) {
      this.mobileSyncBtn.addEventListener('click', () => this.openMobileSyncModal());
    }
    if (this.closeMobileSyncModal) {
      this.closeMobileSyncModal.addEventListener('click', () => {
        if (this.mobileSyncModal) this.mobileSyncModal.style.display = 'none';
      });
    }
    if (this.mobileSyncModal) {
      this.mobileSyncModal.addEventListener('click', (e) => {
        if (e.target === this.mobileSyncModal) this.mobileSyncModal.style.display = 'none';
      });
    }

    // Connect CommitteeSyncEngine callbacks
    if (window.committeeSyncEngine) {
      window.committeeSyncEngine.onSyncUpdate = () => {
        this.renderSavedItems();
      };
      window.committeeSyncEngine.onStatusChange = (isOnline, info) => {
        if (this.syncStatusIndicator && info) {
          const syncUrl = info.mobileSyncUrl || window.committeeSyncEngine.serverUrl;
          this.syncStatusIndicator.innerHTML = `<i class="fa-solid fa-circle-dot" style="color:#10b981;"></i> సింక్ ఇంజిన్ సిద్ధంగా ఉంది (${info.localIp})`;
          if (this.mobileSyncUrlLink) {
            this.mobileSyncUrlLink.href = syncUrl;
            this.mobileSyncUrlLink.textContent = syncUrl;
          }
        }
      };
      window.committeeSyncEngine.init();
    }

    // Search filter
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.renderSavedItems());
    }

    // Font size adjustments for preview text
    document.getElementById('font-increase')?.addEventListener('click', () => {
      if (this.customPreviewText) {
        const cur = parseFloat(window.getComputedStyle(this.customPreviewText).fontSize);
        this.customPreviewText.style.fontSize = (cur + 2) + 'px';
      }
      if (this.donorPreviewText) {
        const cur = parseFloat(window.getComputedStyle(this.donorPreviewText).fontSize);
        this.donorPreviewText.style.fontSize = (cur + 2) + 'px';
      }
    });

    document.getElementById('font-decrease')?.addEventListener('click', () => {
      if (this.customPreviewText) {
        const cur = parseFloat(window.getComputedStyle(this.customPreviewText).fontSize);
        if (cur > 12) {
          this.customPreviewText.style.fontSize = (cur - 2) + 'px';
        }
      }
      if (this.donorPreviewText) {
        const cur = parseFloat(window.getComputedStyle(this.donorPreviewText).fontSize);
        if (cur > 12) {
          this.donorPreviewText.style.fontSize = (cur - 2) + 'px';
        }
      }
    });

    // Custom Matter Template Pills
    document.querySelectorAll('.template-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const key = e.target.dataset.template;
        if (PRESET_TEMPLATES[key]) {
          if (this.matterTitle) this.matterTitle.value = PRESET_TEMPLATES[key].title;
          if (this.customTextInput) this.customTextInput.value = PRESET_TEMPLATES[key].text;
          this.updateCustomPreview();
          this.showToast(this.uiLang === 'en' ? 'Template loaded!' : 'టెంప్లేట్ లోడ్ అయింది!');
        }
      });
    });

    if (this.customTextInput) {
      this.customTextInput.addEventListener('input', () => this.updateCustomPreview());
    }

    if (this.readCustomBtn) {
      this.readCustomBtn.addEventListener('click', () => {
        const text = this.customTextInput ? this.customTextInput.value.trim() : '';
        if (text) {
          const styleVal = this.anchorVoiceStyle ? this.anchorVoiceStyle.value : 'telugu_male';
          if (window.ttsEngine) window.ttsEngine.speak(text, { anchorStyle: styleVal });
        } else {
          this.showToast(this.uiLang === 'en' ? 'Please type Telugu text to announce' : 'దయచేసి మైక్‌లో చదవడానికి తెలుగు మ్యాటర్ రాయండి');
        }
      });
    }

    if (this.saveMatterBtn) {
      this.saveMatterBtn.addEventListener('click', () => {
        const content = this.customTextInput ? this.customTextInput.value.trim() : '';
        if (!content) {
          this.showToast(this.uiLang === 'en' ? 'Please enter content' : 'దయచేసి టైప్ చేయండి');
          return;
        }
        const title = (this.matterTitle && this.matterTitle.value.trim()) || 'ఎనౌన్స్‌మెంట్';
        const savedMatter = window.StorageManager ? window.StorageManager.saveMatter(title, content) : null;
        if (window.committeeSyncEngine) {
          window.committeeSyncEngine.pushMatterUpdate(savedMatter, 'save');
        }
        this.showToast(this.uiLang === 'en' ? 'Matter saved & synced! 💾' : 'మ్యాటర్ సేవ్ అయింది & సింక్ అయింది! 💾');
        this.renderSavedItems();
      });
    }

    if (this.clearCustomBtn) {
      this.clearCustomBtn.addEventListener('click', () => {
        if (this.matterTitle) this.matterTitle.value = '';
        if (this.customTextInput) this.customTextInput.value = '';
        this.updateCustomPreview();
      });
    }

    // Method 3 AI Server Controls
    if (this.ttsEngineModeSelect) {
      this.ttsEngineModeSelect.addEventListener('change', () => this.saveSettingsFromUI());
    }
    if (this.aiServerUrlInput) {
      this.aiServerUrlInput.addEventListener('change', () => this.saveSettingsFromUI());
    }

    if (this.testAIServerBtn) {
      this.testAIServerBtn.addEventListener('click', async () => {
        const url = this.aiServerUrlInput.value.trim() || 'http://localhost:5005/api/generate-voice';
        const healthUrl = url.replace(/\/api\/generate-(celebrity-)?voice\/?$/, '/api/health');
        this.showToast(this.uiLang === 'en' ? 'Testing AI Server Connection...' : 'AI సర్వర్ కనెక్షన్ టెస్ట్ చేస్తోంది...');
        
        try {
          const res = await fetch(healthUrl, { method: 'GET' });
          if (res.ok) {
            const data = await res.json();
            const engineName = data.engine || 'online';
            if (this.aiServerStatusBadge) {
              this.aiServerStatusBadge.style.background = 'rgba(46, 204, 113, 0.2)';
              this.aiServerStatusBadge.style.borderColor = '#2ecc71';
              this.aiServerStatusBadge.style.color = '#2ecc71';
              this.aiServerStatusBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Connected (${engineName})`;
            }
            this.showToast(this.uiLang === 'en' ? 'AI Server Connected & Online! 🟢' : 'AI సర్వర్ సక్రియంగా అనుసంధానించబడింది! 🟢');
          } else {
            throw new Error(`HTTP ${res.status}`);
          }
        } catch (err) {
          if (this.aiServerStatusBadge) {
            this.aiServerStatusBadge.style.background = 'rgba(231, 76, 60, 0.2)';
            this.aiServerStatusBadge.style.borderColor = '#e74c3c';
            this.aiServerStatusBadge.style.color = '#e74c3c';
            this.aiServerStatusBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Offline / Connection Error`;
          }
          this.showToast(this.uiLang === 'en' ? 'AI Server Connection Failed' : 'AI సర్వర్ కనెక్ట్ కాలేదు');
        }
      });
    }

  }

  applyLanguageUI(lang) {
    this.uiLang = lang;
    const dict = window.TRANSLATIONS ? window.TRANSLATIONS[lang] : null;
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.dataset.i18nPh;
      if (dict[key]) {
        el.placeholder = dict[key];
      }
    });

    if (this.langLabel) {
      this.langLabel.textContent = lang === 'te' ? 'EN' : 'తెలుగు';
    }
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    this.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
    this.tabViews.forEach(v => v.classList.toggle('active', v.id === tabId));
  }

  announceCurrentDonor() {
    const text = this.generateDonorTeluguText();
    if (text) {
      const styleVal = this.anchorVoiceStyle ? this.anchorVoiceStyle.value : 'telugu_male';
      if (window.ttsEngine) window.ttsEngine.speak(text, { anchorStyle: styleVal });
    } else {
      this.showToast(this.uiLang === 'en' ? 'Please enter donor name and amount' : 'దయచేసి దాత పేరు మరియు అమౌంట్ నమోదు చేయండి');
    }
  }

  saveCurrentDonor() {
    const name = this.donorName ? this.donorName.value.trim() : '';
    const amount = this.donorAmount ? this.donorAmount.value.trim() : '';
    const item = this.donorItem ? this.donorItem.value.trim() : '';
    const type = this.currentDonationType || 'cash';

    if (!name) {
      this.showToast(this.uiLang === 'en' ? 'Please enter donor name' : 'దయచేసి దాత పేరు నమోదు చేయండి');
      return;
    }
    if (type === 'cash' && !amount) {
      this.showToast(this.uiLang === 'en' ? 'Please enter donation amount' : 'దయచేసి చందా మొత్తం టైప్ చేయండి');
      return;
    }
    if (type === 'item' && !item) {
      this.showToast(this.uiLang === 'en' ? 'Please enter item details' : 'దయచేసి వస్తువు వివరాలు నమోదు చేయండి');
      return;
    }
    if (type === 'both' && !amount && !item) {
      this.showToast(this.uiLang === 'en' ? 'Please enter amount or item details' : 'దయచేసి నగదు లేదా వస్తువు వివరాలు నమోదు చేయండి');
      return;
    }

    const text = this.generateDonorTeluguText();
    const savedDonor = window.StorageManager ? window.StorageManager.saveDonor({
      name: name,
      donationType: type,
      amount: amount,
      itemDetails: item,
      purpose: this.donorPurpose ? this.donorPurpose.value : '',
      village: this.donorVillage ? this.donorVillage.value : '',
      generatedText: text
    }) : null;
    if (window.committeeSyncEngine) {
      window.committeeSyncEngine.pushDonorUpdate(savedDonor, 'save');
    }
    this.showToast(this.uiLang === 'en' ? 'Donor record saved & synced! 💾' : 'దాత వివరాలు సేవ్ అయ్యాయి & సింక్ అయ్యాయి! 💾');
    this.renderSavedItems();
  }

  resetDonorForm() {
    if (this.donorName) this.donorName.value = '';
    if (this.donorAmount) this.donorAmount.value = '';
    if (this.donorItem) this.donorItem.value = '';
    if (this.donorVillage) this.donorVillage.value = '';
    this.updateDonorPreview();
  }

  readCustomMatter() {
    const text = this.customTextInput ? this.customTextInput.value.trim() : '';
    if (text) {
      const styleVal = this.anchorVoiceStyle ? this.anchorVoiceStyle.value : 'telugu_male';
      if (window.ttsEngine) window.ttsEngine.speak(text, { anchorStyle: styleVal });
    } else {
      this.showToast(this.uiLang === 'en' ? 'Please type Telugu text to announce' : 'దయచేసి మైక్‌లో చదవడానికి తెలుగు మ్యాటర్ రాయండి');
    }
  }

  saveCustomMatter() {
    const content = this.customTextInput ? this.customTextInput.value.trim() : '';
    if (!content) {
      this.showToast(this.uiLang === 'en' ? 'Please enter content' : 'దయచేసి టైప్ చేయండి');
      return;
    }
    const title = (this.matterTitle && this.matterTitle.value.trim()) || 'ఎనౌన్స్‌మెంట్';
    const savedMatter = window.StorageManager ? window.StorageManager.saveMatter(title, content) : null;
    if (window.committeeSyncEngine) {
      window.committeeSyncEngine.pushMatterUpdate(savedMatter, 'save');
    }
    this.showToast(this.uiLang === 'en' ? 'Matter saved & synced! 💾' : 'మ్యాటర్ సేవ్ అయింది & సింక్ అయింది! 💾');
    this.renderSavedItems();
  }

  togglePlayPause() {
    if (window.ttsEngine && window.ttsEngine.isSpeaking) {
      if (window.ttsEngine.isPaused) {
        window.ttsEngine.resume();
      } else {
        window.ttsEngine.pause();
      }
    } else {
      if (this.activeTab === 'donor-tab') {
        this.announceCurrentDonor();
      } else {
        this.readCustomMatter();
      }
    }
  }

  stopSpeech() {
    if (window.ttsEngine) window.ttsEngine.stop();
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    if (this.themeToggle) {
      this.themeToggle.innerHTML = next === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    }
  }

  toggleLanguage() {
    this.uiLang = this.uiLang === 'te' ? 'en' : 'te';
    this.applyLanguageUI(this.uiLang);
    this.saveSettingsFromUI();
  }

  generateDonorTeluguText() {
    const name = this.donorName.value.trim();
    if (!name) return '';

    const type = this.currentDonationType || 'cash';
    const rawAmount = this.donorAmount ? this.donorAmount.value.trim() : '';
    const rawItem = this.donorItem ? this.donorItem.value.trim() : '';

    if (type === 'cash' && !rawAmount) return '';
    if (type === 'item' && !rawItem) return '';
    if (type === 'both' && !rawAmount && !rawItem) return '';

    const displayName = ensureNameHasGaru(name);
    const amountWords = rawAmount ? convertNumberToTeluguWords(rawAmount) : '';
    const itemWords = rawItem ? rawItem.replace(/\b\d+\b/g, m => convertNumberToTeluguWords(m)) : '';
    const purpose = this.donorPurpose.value || 'వినాయక చవితి చందా';
    const village = this.donorVillage.value.trim() ? ` ${this.donorVillage.value.trim()}కి చెందిన` : '';
    const style = this.announcementStyle.value;

    let text = '';

    if (type === 'cash') {
      if (style === 'devotional') {
        text = `శ్రీ శ్రీ శ్రీ వినాయక చవితి మహోత్సవాల సందర్భంగా... మన పందిరి దాతలు...${village} శ్రీ ${displayName}... స్వామివారి ${purpose} కొరకు... రూపాయలు ${amountWords} చందాగా సమర్పించి ఉన్నారు! దాత దంపతులకు మరియు వారి కుటుంబ సభ్యులకు ఆ విఘ్నేశ్వరుని కృపాకటాక్షాలు ఎల్లవేళలా కలగాలని మనస్ఫూర్తిగా ప్రార్థిస్తున్నాము... స్వస్తి!`;
      } else if (style === 'formal') {
        text = `గమనిక! మన వినాయక చవితి వేడుకలకు...${village} శ్రీ ${displayName}... రూపాయలు ${amountWords}... ${purpose}గా అందజేశారు. ఉత్సవ నిర్వహణ కమిటీ సభ్యులందరి తరఫున దాత గారికి హృదయపూర్వక ధన్యవాదాలు తెలియజేస్తున్నాము.`;
      } else {
        text = `మైక్ ఎనౌన్స్‌మెంట్! దాత శ్రీ ${displayName}... రూపాయలు ${amountWords} చందాగా ఇచ్చారు. ధన్యవాదాలు!`;
      }
    } else if (type === 'item') {
      if (style === 'devotional') {
        text = `శ్రీ శ్రీ శ్రీ వినాయక చవితి మహోత్సవాల సందర్భంగా... మన పందిరి దాతలు...${village} శ్రీ ${displayName}... స్వామివారి ${purpose} కొరకు... పవిత్ర కానుకగా ${itemWords} భక్తిపూర్వకంగా సమర్పించి ఉన్నారు! శ్రీ వరసిద్ధి వినాయక స్వామివారి దివ్య కృపా కటాక్షాలు వారి కుటుంబానికి ఎల్లవేళలా కలగాలని మనస్ఫూర్తిగా ప్రార్థిస్తున్నాము... స్వస్తి!`;
      } else if (style === 'formal') {
        text = `గమనిక! మన వినాయక చవితి వేడుకలకు...${village} శ్రీ ${displayName}... స్వామివారి ${purpose} నిమిత్తం... ${itemWords} దానంగా అందజేశారు. ఉత్సవ నిర్వహణ కమిటీ సభ్యులందరి తరఫున దాత గారికి హృదయపూర్వక ధన్యవాదాలు తెలియజేస్తున్నాము.`;
      } else {
        text = `మైక్ ఎనౌన్స్‌మెంట్! దాత శ్రీ ${displayName}... ${itemWords} కానుకగా ఇచ్చారు. ధన్యవాదాలు!`;
      }
    } else if (type === 'both') {
      if (style === 'devotional') {
        text = `శ్రీ శ్రీ శ్రీ వినాయక చవితి మహోత్సవాల సందర్భంగా... మన పందిరి దాతలు...${village} శ్రీ ${displayName}... స్వామివారి ${purpose} కొరకు... రూపాయలు ${amountWords} నగదు చందాతో పాటు... పవిత్ర కానుకగా ${itemWords} భక్తిపూర్వకంగా సమర్పించి ఉన్నారు! శ్రీ వరసిద్ధి వినాయక స్వామివారి దివ్య కృపా కటాక్షాలు వారి కుటుంబానికి ఎల్లవేళలా కలగాలని ప్రార్థిస్తున్నాము... స్వస్తి!`;
      } else if (style === 'formal') {
        text = `గమనిక! మన వినాయక చవితి వేడుకలకు...${village} శ్రీ ${displayName}... స్వామివారి ${purpose} నిమిత్తం... రూపాయలు ${amountWords} నగదు మరియు ${itemWords} దానంగా అందజేశారు. ఉత్సవ నిర్వహణ కమిటీ తరఫున హృదయపూర్వక ధన్యవాదాలు తెలియజేస్తున్నాము.`;
      } else {
        text = `మైక్ ఎనౌన్స్‌మెంట్! దాత శ్రీ ${displayName}... రూపాయలు ${amountWords} మరియు ${itemWords} కానుకగా సమర్పించారు. ధన్యవాదాలు!`;
      }
    }

    return text;
  }

  updateDonorPreview() {
    const text = this.generateDonorTeluguText();
    if (text) {
      this.currentSpeakingText = text;
      this.renderFormattedPreview(this.donorPreviewText, text);
    } else {
      const dict = window.TRANSLATIONS ? window.TRANSLATIONS[this.uiLang] : null;
      this.donorPreviewText.innerHTML = dict ? dict.previewPlaceholder : 'దాతల వివరాలు ఎంటర్ చేయగానే ఇక్కడ తెలుగు ఎనౌన్స్‌మెంట్ కనిపిస్తుంది...';
    }
  }

  updateCustomPreview() {
    const text = this.customTextInput.value.trim();
    if (text) {
      this.currentSpeakingText = text;
      this.renderFormattedPreview(this.customPreviewText, text);
    } else {
      const dict = window.TRANSLATIONS ? window.TRANSLATIONS[this.uiLang] : null;
      this.customPreviewText.innerHTML = dict ? dict.customPreviewPlaceholder : 'ఇక్కడ మీరు పైన రాసిన మ్యాటర్ ప్రత్యక్షంగా మైక్‌లో చదివేటప్పుడు ప్రసారమవుతుంది...';
    }
  }

  renderFormattedPreview(containerElement, text) {
    const words = text.split(/(\s+)/);
    let charPos = 0;
    let html = '';

    words.forEach(chunk => {
      if (/\s+/.test(chunk)) {
        html += escapeHTML(chunk);
        charPos += chunk.length;
      } else {
        const start = charPos;
        const end = charPos + chunk.length;
        html += `<span class="word-span" data-start="${start}" data-end="${end}">${escapeHTML(chunk)}</span>`;
        charPos += chunk.length;
      }
    });

    containerElement.innerHTML = html;
  }

  highlightSpokenWord(charIndex, charLength) {
    const targetContainer = this.activeTab === 'donor-tab' ? this.donorPreviewText : this.customPreviewText;
    const spans = targetContainer.querySelectorAll('.word-span');
    
    spans.forEach(span => {
      const start = parseInt(span.dataset.start, 10);
      const end = parseInt(span.dataset.end, 10);

      if (charIndex >= start && charIndex < end + 2) {
        span.classList.add('speaking-active');
        span.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        span.classList.remove('speaking-active');
      }
    });
  }

  handleTTSStateChange(state) {
    const eqBars = this.eqVisualizer.querySelectorAll('.eq-bar');
    const dict = window.TRANSLATIONS ? window.TRANSLATIONS[this.uiLang] : null;

    if (state === 'speaking') {
      this.statusText.textContent = dict ? dict.statusBroadcasting : 'మైక్‌లో చదువుతోంది (Broadcasting...)';
      this.liveDot.className = 'live-indicator speaking';
      this.mainPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      eqBars.forEach(bar => bar.classList.add('active'));
    } else if (state === 'chime') {
      this.statusText.textContent = dict ? dict.statusChime : 'గంట నాదం ప్రసారమవుతోంది (Chime...)';
      this.liveDot.className = 'live-indicator chime';
      this.mainPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      eqBars.forEach(bar => bar.classList.add('active'));
    } else if (state === 'paused') {
      this.statusText.textContent = dict ? dict.statusPaused : 'నిలిపివేయబడింది (Paused)';
      this.liveDot.className = 'live-indicator';
      this.mainPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      eqBars.forEach(bar => bar.classList.remove('active'));
    } else {
      this.statusText.textContent = dict ? dict.statusReady : 'సిద్ధంగా ఉంది (Ready)';
      this.liveDot.className = 'live-indicator';
      this.mainPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      eqBars.forEach(bar => bar.classList.remove('active'));

      document.querySelectorAll('.word-span').forEach(s => s.classList.remove('speaking-active'));
    }
  }

  saveSettingsFromUI() {
    const settings = {
      rate: parseFloat(this.speedRange.value),
      pitch: parseFloat(this.pitchRange.value),
      volume: 1.0,
      voiceURI: this.voiceSelect.value,
      anchorStyle: this.anchorVoiceStyle.value,
      chimeType: this.chimeSelect.value,
      bgmType: this.bgmSelect ? this.bgmSelect.value : 'devotional_tanpura',
      micEcho: this.micEchoSelect ? this.micEchoSelect.value : 'subtle',
      repeatCount: parseInt(this.repeatSelect.value, 10),
      theme: document.documentElement.getAttribute('data-theme'),
      uiLang: this.uiLang,
      ttsEngineMode: this.ttsEngineModeSelect ? this.ttsEngineModeSelect.value : 'browser',
      aiServerUrl: this.aiServerUrlInput ? this.aiServerUrlInput.value.trim() : 'http://localhost:5005/api/generate-voice'
    };
    window.StorageManager.saveSettings(settings);
  }

  loadSettings() {
    const settings = window.StorageManager.getSettings();
    this.speedRange.value = settings.rate;
    this.speedVal.textContent = settings.rate + 'x';
    this.pitchRange.value = settings.pitch;
    this.pitchVal.textContent = settings.pitch;
    this.chimeSelect.value = settings.chimeType;
    if (this.bgmSelect && settings.bgmType) this.bgmSelect.value = settings.bgmType;
    if (this.micEchoSelect && settings.micEcho) this.micEchoSelect.value = settings.micEcho;
    this.repeatSelect.value = settings.repeatCount;
    this.loopText.textContent = settings.repeatCount === 999 ? 'Loop' : settings.repeatCount + 'x';
    
    if (this.ttsEngineModeSelect && settings.ttsEngineMode) {
      this.ttsEngineModeSelect.value = settings.ttsEngineMode;
    }
    if (this.aiServerUrlInput && settings.aiServerUrl) {
      this.aiServerUrlInput.value = settings.aiServerUrl;
    }

    let style = settings.anchorStyle || 'telugu_male';
    if (!['telugu_male', 'telugu_female'].includes(style)) {
      style = (style === 'anchor_suma' || style === 'anchor_jhansi') ? 'telugu_female' : 'telugu_male';
    }
    this.anchorVoiceStyle.value = style;
    window.ttsEngine.setAnchorStyle(style);
    
    if (settings.uiLang) {
      this.applyLanguageUI(settings.uiLang);
    }

    this.renderCustomVoiceStatus();

    setTimeout(() => {
      const voices = window.ttsEngine.getAvailableVoices();
      this.voiceSelect.innerHTML = '<option value="">డిఫాల్ట్ తెలుగు వాయిస్ (Auto-detect Telugu te-IN)</option>';
      voices.forEach(v => {
        const option = document.createElement('option');
        option.value = v.voiceURI;
        option.textContent = `${v.name} (${v.lang})`;
        if (v.voiceURI === settings.voiceURI) option.selected = true;
        this.voiceSelect.appendChild(option);
      });
    }, 500);
  }

  renderSavedItems() {
    const container = document.getElementById('saved-items-container');
    const searchQuery = (this.searchInput?.value || '').toLowerCase().trim();

    const donors = window.StorageManager.getDonors();
    const matters = window.StorageManager.getMatters();
    const stats = window.StorageManager.getTallyStats();

    if (document.getElementById('stat-donor-count')) document.getElementById('stat-donor-count').textContent = stats.totalDonors;
    if (document.getElementById('stat-total-amount')) document.getElementById('stat-total-amount').textContent = '₹ ' + stats.totalAmount.toLocaleString('en-IN');
    if (document.getElementById('stat-item-count')) document.getElementById('stat-item-count').textContent = stats.totalItems || 0;

    let combined = [
      ...donors.map(d => ({ ...d, itemType: 'donor' })),
      ...matters.map(m => ({ ...m, itemType: 'matter' }))
    ];

    if (searchQuery) {
      combined = combined.filter(item => {
        const n = (item.name || item.title || '').toLowerCase();
        const amt = (item.amount || '').toString();
        const itm = (item.itemDetails || '').toLowerCase();
        const txt = (item.generatedText || item.content || '').toLowerCase();
        return n.includes(searchQuery) || amt.includes(searchQuery) || itm.includes(searchQuery) || txt.includes(searchQuery);
      });
    }

    if (combined.length === 0) {
      const dict = window.TRANSLATIONS ? window.TRANSLATIONS[this.uiLang] : null;
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-folder-open"></i>
          <p>${dict ? dict.emptySaved : 'సేవ్ చేసిన దాతల రికార్డులు ఏవీ లేవు.'}</p>
        </div>
      `;
      return;
    }

    let html = '';
    combined.forEach(item => {
      if (item.itemType === 'donor') {
        let amountOrItemHtml = '';
        if (item.donationType === 'item' || (!item.amount && item.itemDetails)) {
          amountOrItemHtml = `<div class="amount" style="color:var(--accent); font-size:1.02rem;"><i class="fa-solid fa-gift"></i> ${escapeHTML(item.itemDetails)}</div>`;
        } else if (item.donationType === 'both') {
          amountOrItemHtml = `<div class="amount">₹ ${parseFloat(item.amount).toLocaleString('en-IN')} <span style="font-size:0.85rem; color:var(--accent); margin-left:6px;"><i class="fa-solid fa-gift"></i> ${escapeHTML(item.itemDetails)}</span></div>`;
        } else {
          amountOrItemHtml = `<div class="amount">₹ ${parseFloat(item.amount).toLocaleString('en-IN')}</div>`;
        }

        html += `
          <div class="donor-item-card">
            <div class="donor-info">
              <h4>${escapeHTML(item.name)} <span class="badge">${this.uiLang === 'en' ? 'Donor' : 'దాత'}</span></h4>
              ${amountOrItemHtml}
              <div class="meta">${escapeHTML(item.purpose)} • ${new Date(item.timestamp).toLocaleDateString('te-IN')}</div>
            </div>
            <div class="donor-actions">
              <button class="btn btn-accent btn-sm announce-saved-btn" data-text="${encodeURIComponent(item.generatedText)}">
                <i class="fa-solid fa-bullhorn"></i> ${this.uiLang === 'en' ? 'Mic' : 'మైక్'}
              </button>
              <button class="btn btn-danger btn-sm delete-saved-btn" data-id="${encodeURIComponent(item.id)}" data-type="donor">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="donor-item-card" style="border-left-color: var(--primary);">
            <div class="donor-info">
              <h4>${escapeHTML(item.title)} <span class="badge" style="background:var(--accent-light); color:var(--accent);">${this.uiLang === 'en' ? 'Matter' : 'మ్యాటర్'}</span></h4>
              <div class="meta" style="margin-top:6px;">${escapeHTML(item.content.substring(0, 70))}...</div>
            </div>
            <div class="donor-actions">
              <button class="btn btn-accent btn-sm announce-saved-btn" data-text="${encodeURIComponent(item.content)}">
                <i class="fa-solid fa-play"></i> ${this.uiLang === 'en' ? 'Read' : 'చదువు'}
              </button>
              <button class="btn btn-danger btn-sm delete-saved-btn" data-id="${encodeURIComponent(item.id)}" data-type="matter">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        `;
      }
    });

    container.innerHTML = html;

    container.querySelectorAll('.announce-saved-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = decodeURIComponent(btn.dataset.text);
        window.ttsEngine.speak(text, { anchorStyle: this.anchorVoiceStyle.value });
      });
    });

    container.querySelectorAll('.delete-saved-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = decodeURIComponent(btn.dataset.id || '');
        const type = btn.dataset.type;
        if (type === 'donor') {
          window.StorageManager.deleteDonor(id);
          if (window.committeeSyncEngine) window.committeeSyncEngine.pushDonorUpdate({ id }, 'delete');
        } else {
          window.StorageManager.deleteMatter(id);
          if (window.committeeSyncEngine) window.committeeSyncEngine.pushMatterUpdate({ id }, 'delete');
        }
        this.renderSavedItems();
        this.showToast(this.uiLang === 'en' ? 'Record deleted' : 'రికార్డు తొలగించబడింది');
      });
    });
  }

  openMobileSyncModal() {
    if (this.mobileSyncModal) {
      this.mobileSyncModal.style.display = 'flex';
      if (window.committeeSyncEngine && this.qrCodeContainer) {
        const url = window.committeeSyncEngine.mobileSyncUrl || window.committeeSyncEngine.serverUrl;
        this.qrCodeContainer.innerHTML = window.committeeSyncEngine.generateQRCodeSVG(url, 180);
        if (this.mobileSyncUrlLink) {
          this.mobileSyncUrlLink.href = url;
          this.mobileSyncUrlLink.textContent = url;
        }
      }
    }
  }

  async renderCustomVoiceStatus() {
    if (!this.customVoiceStatusText || !this.uploadVoiceProfile) return;
    const profile = this.uploadVoiceProfile.value;

    let blob = null;
    if (window.indexedDBAudioStore) {
      blob = await window.indexedDBAudioStore.getAudioBlob(profile);
    }

    const analysis = window.StorageManager ? window.StorageManager.getVoiceAnalysis(profile) : null;

    if (blob) {
      const pitchStr = analysis && analysis.pitchHz > 0 ? `${analysis.pitchHz} Hz` : (this.uiLang === 'en' ? 'Analyzed' : 'విశ్లేషించబడింది');
      const durStr = analysis && analysis.sampleDurationSec ? ` (${analysis.sampleDurationSec}s)` : '';
      
      this.customVoiceStatusText.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--accent)"></i> <strong style="color:var(--accent)">${this.uiLang === 'en' ? 'Processed Voice Active:' : 'ప్రోసెస్ చేసిన వాయిస్ సక్రియంగా ఉంది:'}</strong> ${pitchStr}${durStr}`;
      if (this.customVoicePitchBadge) {
        this.customVoicePitchBadge.style.display = 'inline-block';
        this.customVoicePitchBadge.textContent = pitchStr;
      }
      if (this.customVoiceStatusBox) {
        this.customVoiceStatusBox.style.borderColor = 'var(--accent)';
      }
    } else {
      this.customVoiceStatusText.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${this.uiLang === 'en' ? 'No custom audio uploaded for this voice (Using default vocal model)' : 'ఈ వాయిస్‌కి ఆడియో ఫైల్ అప్‌లోడ్ చేయలేదు (డిఫాల్ట్ వాయిస్ వాడుతోంది)'}`;
      if (this.customVoicePitchBadge) {
        this.customVoicePitchBadge.style.display = 'none';
      }
      if (this.customVoiceStatusBox) {
        this.customVoiceStatusBox.style.borderColor = 'var(--text-muted)';
      }
    }
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  setupTransliteration() {
    this.translitToggleBtn = document.getElementById('translit-toggle');
    this.translitStatusLabel = document.getElementById('translit-status-label');
    this.suggestionBox = document.getElementById('transliteration-suggestions');
    this.convertCustomTextBtn = document.getElementById('convert-custom-text-btn');
    this.convertBulkTextBtn = document.getElementById('convert-bulk-text-btn');

    // Restore transliteration enabled state
    const savedState = localStorage.getItem('te_translit_enabled');
    if (savedState !== null) {
      window.teluguTransliteration.enabled = (savedState === 'true');
    }
    this.updateTransliterationUIState();

    // Transliteration Toggle Button click handler
    if (this.translitToggleBtn) {
      this.translitToggleBtn.addEventListener('click', () => {
        window.teluguTransliteration.enabled = !window.teluguTransliteration.enabled;
        localStorage.setItem('te_translit_enabled', window.teluguTransliteration.enabled);
        this.updateTransliterationUIState();
        
        const dict = window.TRANSLATIONS ? window.TRANSLATIONS[this.uiLang] : null;
        const msg = window.teluguTransliteration.enabled 
          ? (dict ? dict.translitActiveToast : 'తెలుగు టైపింగ్ మోడ్ (Eng ➔ Tel) ఆన్‌లో ఉంది')
          : (dict ? dict.translitDisabledToast : 'తెలుగు టైపింగ్ మోడ్ (Eng ➔ Tel) ఆఫ్ చేయబడింది');
        this.showToast(msg);
      });
    }

    // List of inputs to enable real-time English -> Telugu transliteration
    const targetInputs = [
      this.donorName,
      this.donorVillage,
      this.matterTitle,
      this.customTextInput,
      this.bulkDonorsInput,
      this.searchInput,
      this.eventTitlePrefix
    ].filter(Boolean);

    targetInputs.forEach(inputEl => {
      this.attachTransliterationToInput(inputEl);
    });

    // Batch Convert Buttons Handlers
    if (this.convertCustomTextBtn && this.customTextInput) {
      this.convertCustomTextBtn.addEventListener('click', async () => {
        const text = this.customTextInput.value;
        if (!text || !text.trim()) return;
        this.showToast(this.uiLang === 'en' ? 'Converting text to Telugu...' : 'మ్యాటర్‌ను తెలుగులోకి మార్చుతోంది...');
        const converted = await window.teluguTransliteration.convertFullTextToTelugu(text);
        this.customTextInput.value = converted;
        this.customTextInput.dispatchEvent(new Event('input', { bubbles: true }));
        this.showToast(this.uiLang === 'en' ? 'Converted to Telugu!' : 'తెలుగులోకి మార్చబడింది! ✨');
      });
    }

    if (this.convertBulkTextBtn && this.bulkDonorsInput) {
      this.convertBulkTextBtn.addEventListener('click', async () => {
        const text = this.bulkDonorsInput.value;
        if (!text || !text.trim()) return;
        this.showToast(this.uiLang === 'en' ? 'Converting text to Telugu...' : 'బల్క్ వివరాలను తెలుగులోకి మార్చుతోంది...');
        const converted = await window.teluguTransliteration.convertFullTextToTelugu(text);
        this.bulkDonorsInput.value = converted;
        this.bulkDonorsInput.dispatchEvent(new Event('input', { bubbles: true }));
        this.showToast(this.uiLang === 'en' ? 'Converted to Telugu!' : 'తెలుగులోకి మార్చబడింది! ✨');
      });
    }

    // Hide suggestion box on outside click or touch
    const hideOnOutside = (e) => {
      if (this.suggestionBox && !this.suggestionBox.contains(e.target) && !targetInputs.includes(e.target)) {
        this.hideSuggestionBox();
      }
    };
    document.addEventListener('click', hideOnOutside);
    document.addEventListener('touchstart', hideOnOutside, { passive: true });
  }

  updateTransliterationUIState() {
    if (!this.translitToggleBtn) return;
    const active = window.teluguTransliteration.enabled;
    if (active) {
      this.translitToggleBtn.classList.add('active');
      if (this.translitStatusLabel) this.translitStatusLabel.textContent = 'Eng➔తెలుగు';
    } else {
      this.translitToggleBtn.classList.remove('active');
      if (this.translitStatusLabel) this.translitStatusLabel.textContent = 'English';
    }
  }

  attachTransliterationToInput(inputEl) {
    let activeCandidates = [];
    let selectedCandidateIndex = 0;
    let currentMatchRange = null;

    const getWordBeforeCursor = () => {
      const text = inputEl.value;
      const cursorPos = inputEl.selectionStart;
      const left = text.substring(0, cursorPos);
      const match = left.match(/([a-zA-Z]+)$/);
      if (!match) return null;
      return {
        word: match[1],
        start: cursorPos - match[1].length,
        end: cursorPos
      };
    };

    const replaceWordRange = (range, replacement, appendChar = '') => {
      const text = inputEl.value;
      const before = text.substring(0, range.start);
      const after = text.substring(range.end);
      inputEl.value = before + replacement + appendChar + after;
      const newPos = range.start + replacement.length + appendChar.length;
      inputEl.setSelectionRange(newPos, newPos);
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    };

    // On Keydown (Space / Enter / Arrows / Selection)
    inputEl.addEventListener('keydown', async (e) => {
      if (!window.teluguTransliteration.enabled) return;

      const isSpace = (e.key === ' ' || e.code === 'Space');
      const isEnter = (e.key === 'Enter');

      // If suggestion box is visible and user presses Arrow down/up/Enter/Esc
      if (this.suggestionBox && this.suggestionBox.style.display !== 'none' && activeCandidates.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedCandidateIndex = (selectedCandidateIndex + 1) % activeCandidates.length;
          this.highlightCandidate(selectedCandidateIndex);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedCandidateIndex = (selectedCandidateIndex - 1 + activeCandidates.length) % activeCandidates.length;
          this.highlightCandidate(selectedCandidateIndex);
          return;
        }
        if (e.key === 'Escape') {
          this.hideSuggestionBox();
          return;
        }
        if (isEnter || e.key === 'Tab') {
          e.preventDefault();
          if (currentMatchRange) {
            replaceWordRange(currentMatchRange, activeCandidates[selectedCandidateIndex], isEnter ? '\n' : ' ');
            this.hideSuggestionBox();
          }
          return;
        }
      }

      // Handle Space / Enter transliteration conversion
      if (isSpace || isEnter) {
        const matchRange = getWordBeforeCursor();
        if (matchRange) {
          e.preventDefault();
          const candidates = await window.teluguTransliteration.getTransliterationCandidates(matchRange.word);
          const chosen = (candidates && candidates.length > 0) ? candidates[0] : matchRange.word;
          const appendChar = isEnter ? '\n' : ' ';
          replaceWordRange(matchRange, chosen, appendChar);
          this.hideSuggestionBox();
        }
      }
    });

    // On Input (show suggestion popup as user types letters)
    inputEl.addEventListener('input', async (e) => {
      if (!window.teluguTransliteration.enabled) {
        this.hideSuggestionBox();
        return;
      }

      const matchRange = getWordBeforeCursor();
      if (!matchRange || matchRange.word.length < 2) {
        this.hideSuggestionBox();
        return;
      }

      currentMatchRange = matchRange;
      const candidates = await window.teluguTransliteration.getTransliterationCandidates(matchRange.word);

      if (candidates && candidates.length > 0) {
        activeCandidates = candidates;
        selectedCandidateIndex = 0;
        this.renderSuggestionBox(inputEl, candidates, (chosen) => {
          replaceWordRange(matchRange, chosen, ' ');
          this.hideSuggestionBox();
          inputEl.focus();
        });
      } else {
        this.hideSuggestionBox();
      }
    });
  }

  renderSuggestionBox(inputEl, candidates, onSelect) {
    if (!this.suggestionBox) return;

    const rect = inputEl.getBoundingClientRect();
    this.suggestionBox.style.left = `${rect.left + window.scrollX}px`;
    this.suggestionBox.style.top = `${rect.bottom + window.scrollY + 6}px`;
    this.suggestionBox.style.display = 'flex';

    let html = '';
    candidates.forEach((cand, idx) => {
      html += `
        <div class="translit-candidate-item ${idx === 0 ? 'selected' : ''}" data-idx="${idx}">
          <span>${escapeHTML(cand)}</span>
          <span class="candidate-num">${idx + 1}</span>
        </div>
      `;
    });

    this.suggestionBox.innerHTML = html;

    this.suggestionBox.querySelectorAll('.translit-candidate-item').forEach(item => {
      const handlePick = (e) => {
        e.preventDefault();
        const idx = parseInt(item.dataset.idx, 10);
        if (onSelect) onSelect(candidates[idx]);
      };
      item.addEventListener('click', handlePick);
      item.addEventListener('touchstart', handlePick, { passive: false });
    });
  }

  highlightCandidate(index) {
    if (!this.suggestionBox) return;
    const items = this.suggestionBox.querySelectorAll('.translit-candidate-item');
    items.forEach((item, idx) => {
      if (idx === index) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  hideSuggestionBox() {
    if (this.suggestionBox) {
      this.suggestionBox.style.display = 'none';
      this.suggestionBox.innerHTML = '';
    }
  }
}

function startAppUI() {
  if (!window.appUI) {
    try {
      window.appUI = new AppUI();
      console.log('✅ Vinayaka Voice Speaker App initialized!');
    } catch (err) {
      console.error('❌ AppUI initialization error:', err);
    }
  }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  startAppUI();
} else {
  document.addEventListener('DOMContentLoaded', startAppUI);
}
