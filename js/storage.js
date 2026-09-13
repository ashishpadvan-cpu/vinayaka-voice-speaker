/**
 * Storage & High-Capacity IndexedDB Engine for Universal Audio Files & Voice Feature Analysis
 */
const STORAGE_KEYS = {
  DONORS: 'vinayaka_donors_v1',
  MATTERS: 'vinayaka_matters_v1',
  SETTINGS: 'vinayaka_settings_v1',
  VOICE_ANALYSIS: 'vinayaka_voice_analysis_v1'
};

class IndexedDBAudioStore {
  constructor() {
    this.dbName = 'VinayakaVoiceAudioDB';
    this.storeName = 'custom_voice_blobs';
    this.db = null;
    this.initDB();
  }

  initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      request.onerror = (e) => reject(e);
    });
  }

  async saveAudioBlob(profileKey, blob) {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.put(blob, profileKey);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e);
    });
  }

  async getAudioBlob(profileKey) {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(profileKey);
      req.onsuccess = (e) => resolve(e.target.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async removeAudioBlob(profileKey) {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.delete(profileKey);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e);
    });
  }
}

window.indexedDBAudioStore = new IndexedDBAudioStore();

const StorageManager = {
  get defaultSettings() {
    const isLocal = (typeof window !== 'undefined' && window.location && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));
    return {
      rate: 0.95,
      pitch: 1.0,
      volume: 1.0,
      voiceURI: '',
      anchorStyle: 'telugu_male',
      chimeType: 'temple_bell',
      bgmType: 'none',
      micEcho: 'subtle',
      repeatCount: 1,
      theme: 'dark',
      uiLang: 'te',
      ttsEngineMode: 'browser',
      aiServerUrl: isLocal ? 'http://localhost:5005/api/generate-voice' : '',
      syncServerUrl: isLocal ? 'http://localhost:5005' : ''
    };
  },

  getSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
      const isLocal = (host === 'localhost' || host === '127.0.0.1');
      const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
      const settings = saved ? { ...this.defaultSettings, ...JSON.parse(saved) } : this.defaultSettings;

      // On GitHub Pages or hosted domains without local server, default to native browser speech engine
      if (!isLocal && !isIp) {
        if (settings.ttsEngineMode === 'ai_server' && (!settings.aiServerUrl || settings.aiServerUrl.includes('localhost') || settings.aiServerUrl.includes('github.io'))) {
          settings.ttsEngineMode = 'browser';
        }
      }

      // Only substitute localhost if host is a local network IP address (e.g., 192.168.x.x)
      if (settings.aiServerUrl && isIp && settings.aiServerUrl.includes('localhost')) {
        settings.aiServerUrl = settings.aiServerUrl.replace('localhost', host);
      }
      return settings;
    } catch (e) {
      return this.defaultSettings;
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  saveVoiceAnalysis(profileKey, data) {
    try {
      const map = this.getVoiceAnalysisMap();
      map[profileKey] = data;
      localStorage.setItem(STORAGE_KEYS.VOICE_ANALYSIS, JSON.stringify(map));
    } catch (e) {
      console.error('Failed to save voice analysis:', e);
    }
  },

  getVoiceAnalysis(profileKey) {
    try {
      const map = this.getVoiceAnalysisMap();
      return map[profileKey] || null;
    } catch (e) {
      return null;
    }
  },

  getVoiceAnalysisMap() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOICE_ANALYSIS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  getDonors() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DONORS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveDonor(donor) {
    const donors = this.getDonors();
    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    const newEntry = {
      id: donor.id || ('donor_' + Date.now() + '_' + uniqueSuffix),
      name: donor.name.trim(),
      donationType: donor.donationType || 'cash',
      amount: parseFloat(donor.amount) || 0,
      itemDetails: donor.itemDetails ? donor.itemDetails.trim() : '',
      purpose: donor.purpose || 'వినాయక చవితి చందా',
      village: donor.village ? donor.village.trim() : '',
      generatedText: donor.generatedText,
      timestamp: new Date().toISOString()
    };
    donors.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(donors));
    return newEntry;
  },

  deleteDonor(id) {
    let donors = this.getDonors();
    donors = donors.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(donors));
  },

  getMatters() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATTERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveMatter(title, content, category = 'సాధారణ') {
    const matters = this.getMatters();
    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    const newEntry = {
      id: 'matter_' + Date.now() + '_' + uniqueSuffix,
      title: title.trim() || 'ఎనౌన్స్‌మెంట్ ' + (matters.length + 1),
      content: content.trim(),
      category: category,
      timestamp: new Date().toISOString()
    };
    matters.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.MATTERS, JSON.stringify(matters));
    return newEntry;
  },

  deleteMatter(id) {
    let matters = this.getMatters();
    matters = matters.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MATTERS, JSON.stringify(matters));
  },

  getTallyStats() {
    const donors = this.getDonors();
    const totalAmount = donors.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalItems = donors.filter(d => d.donationType === 'item' || d.donationType === 'both' || (d.itemDetails && d.itemDetails.trim().length > 0)).length;
    return {
      totalDonors: donors.length,
      totalAmount: totalAmount,
      totalItems: totalItems
    };
  },

  applyServerSync(serverDonors, serverMatters) {
    if (Array.isArray(serverDonors)) {
      localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(serverDonors));
    }
    if (Array.isArray(serverMatters)) {
      localStorage.setItem(STORAGE_KEYS.MATTERS, JSON.stringify(serverMatters));
    }
  }
};

window.StorageManager = StorageManager;
