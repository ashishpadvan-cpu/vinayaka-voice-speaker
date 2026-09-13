/**
 * Hybrid English to Telugu Phonetic Transliteration Engine
 * Supports real-time API (Google Input Tools) with robust offline rule-based fallback.
 */

class TransliterationEngine {
  constructor() {
    this.enabled = true; // Transliteration mode active status
    this.cache = new Map();
    this.activeInput = null;
    this.suggestionBox = null;
    this.selectedIndex = 0;
    this.currentWordCandidates = [];
    this.currentWordRange = null;

    // Common Telugu Dictionary for instant high-precision offline matching
    this.commonWords = {
      'garu': 'గారు',
      'gari': 'గారి',
      'sri': 'శ్రీ',
      'shri': 'శ్రీ',
      'chanda': 'చందా',
      'namaskaram': 'నమస్కారం',
      'namaste': 'నమస్తే',
      'vinayaka': 'వినాయక',
      'vinayakudu': 'వినాయకుడు',
      'ganapati': 'గణపతి',
      'ganapathi': 'గణపతి',
      'chavithi': 'చవితి',
      'chaviti': 'చవితి',
      'swami': 'స్వామి',
      'swamivari': 'స్వామివారి',
      'pooja': 'పూజ',
      'puja': 'పూజ',
      'annadanam': 'అన్నదానం',
      'harati': 'హారతి',
      'prasadam': 'ప్రసాదం',
      'laddu': 'లడ్డూ',
      'nimajjanam': 'నిమజ్జనం',
      'rupayalu': 'రూపాయలు',
      'rupeelu': 'రూపాయలు',
      'rs': 'రూ.',
      'veedhi': 'వీధి',
      'vidhi': 'వీధి',
      'ooru': 'ఊరు',
      'uru': 'ఊరు',
      'nagar': 'నగర్',
      'pandi': 'పందిరి',
      'pandiri': 'పందిరి',
      'utsavalu': 'ఉత్సవాలు',
      'bhaktulu': 'భక్తులు',
      'donors': 'దాతలు',
      'donor': 'దాత',
      'peru': 'పేరు',
      'ramarao': 'రామారావు',
      'rao': 'రావు',
      'reddy': 'రెడ్డి',
      'sharma': 'శర్మ',
      'sarma': 'శర్మ',
      'satyanarayana': 'సత్యనారాయణ',
      'kumar': 'కుమార్',
      'vigneswara': 'విఘ్నేశ్వర',
      'vighneswara': 'విఘ్నేశ్వర'
    };

    // Phonetic mapping rules for offline engine
    this.initPhoneticTables();
    this.loadCacheFromStorage();
  }

  initPhoneticTables() {
    this.independentVowels = {
      'aa': 'ఆ', 'a': 'అ', 'ii': 'ఈ', 'ee': 'ఈ', 'i': 'ఇ',
      'uu': 'ఊ', 'oo': 'ఊ', 'u': 'ఉ', 'ea': 'ఏ', 'e': 'ఎ',
      'ai': 'ఐ', 'oa': 'ఓ', 'o': 'ఒ', 'au': 'ఔ', 'ou': 'ఔ',
      'am': 'అం', 'aha': 'అః'
    };

    this.vowelSigns = {
      'aa': 'ా', 'a': '', 'ii': 'ీ', 'ee': 'ీ', 'i': 'ి',
      'uu': 'ూ', 'oo': 'ూ', 'u': 'ు', 'ea': 'ే', 'e': 'ె',
      'ai': 'ై', 'oa': 'ో', 'o': 'ొ', 'au': 'ౌ', 'ou': 'ౌ',
      'am': 'ం', 'aha': 'ః'
    };

    this.consonants = {
      'kh': 'ఖ', 'k': 'క', 'gh': 'ఘ', 'g': 'గ',
      'chh': 'ఛ', 'ch': 'చ', 'jh': 'ఝ', 'j': 'జ',
      'Th': 'ఠ', 'th': 'థ', 'T': 'ట', 't': 'త',
      'Dh': 'ఢ', 'dh': 'ధ', 'D': 'డ', 'd': 'ద',
      'Nh': 'ణ', 'N': 'ణ', 'n': 'న',
      'ph': 'ఫ', 'p': 'ప', 'f': 'ఫ', 'bh': 'భ', 'b': 'బ', 'm': 'మ',
      'y': 'య', 'r': 'ర', 'l': 'ల', 'v': 'వ', 'w': 'వ',
      'shh': 'ష', 'sh': 'శ', 's': 'స', 'h': 'హ', 'L': 'ళ'
    };
  }

  loadCacheFromStorage() {
    try {
      const saved = localStorage.getItem('te_translit_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(k => this.cache.set(k, parsed[k]));
      }
    } catch (e) {
      console.warn('Could not load transliteration cache:', e);
    }
  }

  saveCacheToStorage() {
    try {
      const obj = {};
      let count = 0;
      for (const [k, v] of this.cache.entries()) {
        obj[k] = v;
        if (++count > 500) break; // Limit cache persistence size
      }
      localStorage.setItem('te_translit_cache', JSON.stringify(obj));
    } catch (e) {
      // Ignore quota storage limits silently
    }
  }

  /**
   * Fetch Transliteration Candidates from Google API with fallback
   */
  async getTransliterationCandidates(word) {
    if (!word || !word.trim()) return [];
    const cleanWord = word.trim().toLowerCase();

    // Check if it's already non-English (e.g., numbers, Telugu script, symbols)
    if (!/^[a-zA-Z]+$/.test(cleanWord)) {
      return [word];
    }

    // Check Memory/Storage Cache
    if (this.cache.has(cleanWord)) {
      return this.cache.get(cleanWord);
    }

    // Check Dictionary
    if (this.commonWords[cleanWord]) {
      const dictMatch = [this.commonWords[cleanWord]];
      // We will also attempt background API fetch to enrich
      this.fetchFromAPI(cleanWord).then(apiRes => {
        if (apiRes && apiRes.length) {
          const merged = Array.from(new Set([dictMatch[0], ...apiRes]));
          this.cache.set(cleanWord, merged);
          this.saveCacheToStorage();
        }
      });
      return dictMatch;
    }

    // Online Fetch
    const apiCandidates = await this.fetchFromAPI(cleanWord);
    if (apiCandidates && apiCandidates.length > 0) {
      this.cache.set(cleanWord, apiCandidates);
      this.saveCacheToStorage();
      return apiCandidates;
    }

    // Offline Rule Engine Fallback
    const offlineCandidate = this.offlinePhoneticConvertWord(cleanWord);
    const candidates = [offlineCandidate];
    this.cache.set(cleanWord, candidates);
    return candidates;
  }

  /**
   * Fetch from Google Input Tools REST API
   */
  async fetchFromAPI(word) {
    try {
      const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8&app=jsapi&itc=te-t-i0-und`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!resp.ok) return null;
      const data = await resp.json();

      if (data && data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
        return data[1][0][1]; // Array of candidates: ["నమస్కారం", "నమస్కారము", ...]
      }
    } catch (e) {
      // API call failed or timed out, will fall back gracefully
    }
    return null;
  }

  /**
   * Rule-based Phonetic Transliteration Engine (Offline Fallback)
   */
  offlinePhoneticConvertWord(word) {
    if (!word) return '';
    const clean = word.toLowerCase();
    let res = '';
    let i = 0;

    while (i < clean.length) {
      // Try 3-char consonant combinations (e.g., chh, shh)
      let match = null;
      if (i + 3 <= clean.length) {
        const sub3 = clean.substring(i, i + 3);
        if (this.consonants[sub3]) match = { type: 'c', len: 3, char: this.consonants[sub3] };
        else if (this.independentVowels[sub3]) match = { type: 'v', len: 3, char: this.independentVowels[sub3], sign: this.vowelSigns[sub3] };
      }

      // Try 2-char combinations (e.g., kh, ch, th, sh, aa, ee, oo, ai, au)
      if (!match && i + 2 <= clean.length) {
        const sub2 = clean.substring(i, i + 2);
        if (this.consonants[sub2]) match = { type: 'c', len: 2, char: this.consonants[sub2] };
        else if (this.independentVowels[sub2]) match = { type: 'v', len: 2, char: this.independentVowels[sub2], sign: this.vowelSigns[sub2] };
      }

      // Try 1-char combination
      if (!match) {
        const sub1 = clean.substring(i, i + 1);
        if (this.consonants[sub1]) match = { type: 'c', len: 1, char: this.consonants[sub1] };
        else if (this.independentVowels[sub1]) match = { type: 'v', len: 1, char: this.independentVowels[sub1], sign: this.vowelSigns[sub1] };
      }

      if (match) {
        if (match.type === 'c') {
          // Consonant found. Look ahead for vowel sign
          i += match.len;
          let vMatch = null;

          if (i + 3 <= clean.length && this.vowelSigns[clean.substring(i, i + 3)]) {
            vMatch = { len: 3, sign: this.vowelSigns[clean.substring(i, i + 3)] };
          } else if (i + 2 <= clean.length && this.vowelSigns[clean.substring(i, i + 2)]) {
            vMatch = { len: 2, sign: this.vowelSigns[clean.substring(i, i + 2)] };
          } else if (i + 1 <= clean.length && this.vowelSigns[clean.substring(i, i + 1)]) {
            vMatch = { len: 1, sign: this.vowelSigns[clean.substring(i, i + 1)] };
          }

          if (vMatch) {
            res += match.char + vMatch.sign;
            i += vMatch.len;
          } else {
            // Next char is another consonant or end of word -> add Virama (halant)
            if (i < clean.length && /[b-df-hj-np-tv-z]/.test(clean[i])) {
              res += match.char + '్';
            } else {
              res += match.char;
            }
          }
        } else if (match.type === 'v') {
          // Standalone Vowel
          res += (res.length === 0 ? match.char : match.sign);
          i += match.len;
        }
      } else {
        // Unknown or non-alphabetic character
        res += clean[i];
        i++;
      }
    }

    return res || word;
  }

  /**
   * Transliterate a full text string (e.g. pasted paragraph or bulk list)
   */
  async convertFullTextToTelugu(text, onProgress) {
    if (!text) return '';
    const tokens = text.split(/([a-zA-Z]+)/);
    let result = '';
    const wordTokensCount = tokens.filter(t => /^[a-zA-Z]+$/.test(t)).length;
    let processed = 0;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (/^[a-zA-Z]+$/.test(token)) {
        const candidates = await this.getTransliterationCandidates(token);
        result += (candidates && candidates.length > 0) ? candidates[0] : token;
        processed++;
        if (onProgress && wordTokensCount > 0) {
          onProgress(Math.round((processed / wordTokensCount) * 100));
        }
      } else {
        result += token;
      }
    }
    return result;
  }
}

// Global instance
window.teluguTransliteration = new TransliterationEngine();
