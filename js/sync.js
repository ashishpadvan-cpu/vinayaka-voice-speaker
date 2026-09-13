/**
 * Real-Time Mobile & Multi-Device Sync Engine for Committee Members
 * Enables instant synchronization of donors, custom matters, and live previews across all connected mobile devices.
 */

class CommitteeSyncEngine {
  constructor() {
    this.syncInterval = null;
    this.pollFreqOnlineMs = 2500;
    this.pollFreqOfflineMs = 12000;
    this.lastTimestamp = 0;
    this.localIp = '';
    this.mobileSyncUrl = '';
    this.isOnline = false;
    this.connectedDevicesCount = 1;
    this.onSyncUpdate = null;
    this.onStatusChange = null;

    this.serverUrl = this.determineServerUrl();
  }

  determineServerUrl() {
    // 1. User configured override in localStorage
    const customUrl = localStorage.getItem('custom_sync_server_url');
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, '');
    }

    // 2. Settings from StorageManager
    if (window.StorageManager) {
      try {
        const settings = window.StorageManager.getSettings();
        if (settings && settings.syncServerUrl && settings.syncServerUrl.trim()) {
          return settings.syncServerUrl.trim().replace(/\/+$/, '');
        }
      } catch (e) {}
    }

    // 3. Localhost or local network IP default
    const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
    const isLocalhost = (host === 'localhost' || host === '127.0.0.1');
    const isLocalNetworkIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);

    if (isLocalhost || isLocalNetworkIp) {
      const port = (window.location && window.location.port === '5005') ? '5005' : '5005';
      return `http://${host}:${port}`;
    }

    // 4. On GitHub Pages or remote HTTPS hosts, default to empty to prevent mixed-content blocks
    return '';
  }

  getWebAppUrl() {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.href.split('#')[0].split('?')[0];
    }
    return 'https://ashishpadvan-cpu.github.io/vinayaka-voice-speaker/';
  }

  setServerUrl(url) {
    const cleanUrl = (url || '').trim().replace(/\/+$/, '');
    this.serverUrl = cleanUrl;
    if (cleanUrl) {
      localStorage.setItem('custom_sync_server_url', cleanUrl);
    } else {
      localStorage.removeItem('custom_sync_server_url');
    }
    this.isOnline = false;
    this.init();
  }

  init() {
    if (!this.serverUrl) {
      this.isOnline = false;
      this.stopPolling();
      if (this.onStatusChange) {
        this.onStatusChange(false, { serverUrl: '', reason: 'No local sync server configured' });
      }
      return;
    }

    this.fetchSyncInfo();
    this.startPolling();
  }

  startPolling() {
    this.stopPolling();
    const interval = this.isOnline ? this.pollFreqOnlineMs : this.pollFreqOfflineMs;
    this.syncInterval = setInterval(() => this.pollServer(), interval);
  }

  stopPolling() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async testConnection(url) {
    const targetUrl = (url || this.serverUrl || '').trim().replace(/\/+$/, '');
    if (!targetUrl) {
      return { success: false, message: 'Server URL is empty' };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${targetUrl}/api/sync/info`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const info = await res.json();
        return { success: true, info };
      }
      return { success: false, message: `HTTP ${res.status}` };
    } catch (e) {
      return { success: false, message: e.name === 'AbortError' ? 'Connection timed out' : 'Server unreachable' };
    }
  }

  async fetchSyncInfo() {
    if (!this.serverUrl) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${this.serverUrl}/api/sync/info`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const info = await res.json();
        this.localIp = info.localIp || '127.0.0.1';
        this.mobileSyncUrl = info.mobileSyncUrl || `${this.serverUrl}`;
        const wasOffline = !this.isOnline;
        this.isOnline = true;
        if (wasOffline) this.startPolling();
        if (this.onStatusChange) this.onStatusChange(true, info);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (e) {
      const wasOnline = this.isOnline;
      this.isOnline = false;
      if (wasOnline) this.startPolling(); // Switch to slower polling rate
      if (this.onStatusChange) {
        this.onStatusChange(false, { serverUrl: this.serverUrl, error: e.message });
      }
    }
  }

  async pollServer() {
    if (!this.serverUrl) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${this.serverUrl}/api/sync/data`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const wasOffline = !this.isOnline;
      this.isOnline = true;
      if (wasOffline) this.startPolling();

      if (data.localIp) this.localIp = data.localIp;
      if (data.mobileSyncUrl) this.mobileSyncUrl = data.mobileSyncUrl;

      // Initial Sync check: upload local data if server doesn't have it
      if (this.lastTimestamp === 0 && window.StorageManager) {
        const localDonors = window.StorageManager.getDonors();
        const localMatters = window.StorageManager.getMatters();
        const serverDonorIds = new Set((data.donors || []).map(d => d.id));
        const serverMatterIds = new Set((data.matters || []).map(m => m.id));

        const missingDonors = localDonors.filter(d => d && d.id && !serverDonorIds.has(d.id));
        const missingMatters = localMatters.filter(m => m && m.id && !serverMatterIds.has(m.id));

        if (missingDonors.length > 0) {
          await this.pushBulkDonors(missingDonors);
        }
        if (missingMatters.length > 0) {
          await this.pushBulkMatters(missingMatters);
        }
      }

      // Check if server timestamp is newer than our recorded timestamp
      if (data.timestamp && data.timestamp > this.lastTimestamp) {
        this.lastTimestamp = data.timestamp;
        
        // Merge donors into local StorageManager
        if (window.StorageManager) {
          window.StorageManager.applyServerSync(data.donors || [], data.matters || []);
        }

        if (this.onSyncUpdate) {
          this.onSyncUpdate(data);
        }
      }

      if (this.onStatusChange) {
        this.onStatusChange(true, {
          localIp: this.localIp,
          mobileSyncUrl: this.mobileSyncUrl,
          timestamp: data.timestamp
        });
      }

    } catch (err) {
      const wasOnline = this.isOnline;
      this.isOnline = false;
      if (wasOnline) this.startPolling();
      if (this.onStatusChange) {
        this.onStatusChange(false, { serverUrl: this.serverUrl, error: err.message });
      }
    }
  }

  async pushDonorUpdate(donor, action = 'save') {
    if (!this.serverUrl || !this.isOnline) return false;
    try {
      const res = await fetch(`${this.serverUrl}/api/sync/donor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, donor, id: donor ? donor.id : null })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.timestamp) this.lastTimestamp = result.timestamp;
        return true;
      }
    } catch (e) {
      console.warn('Failed to push donor sync update:', e);
    }
    return false;
  }

  async pushBulkDonors(donors) {
    if (!this.serverUrl || !this.isOnline) return false;
    try {
      const res = await fetch(`${this.serverUrl}/api/sync/bulk_donors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donors })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.timestamp) this.lastTimestamp = result.timestamp;
        return true;
      }
    } catch (e) {
      console.warn('Failed to push bulk donors sync update:', e);
    }
    return false;
  }

  async pushMatterUpdate(matter, action = 'save') {
    if (!this.serverUrl || !this.isOnline) return false;
    try {
      const res = await fetch(`${this.serverUrl}/api/sync/matter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, matter, id: matter ? matter.id : null })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.timestamp) this.lastTimestamp = result.timestamp;
        return true;
      }
    } catch (e) {
      console.warn('Failed to push matter sync update:', e);
    }
    return false;
  }

  async pushBulkMatters(matters) {
    if (!this.serverUrl || !this.isOnline) return false;
    try {
      const res = await fetch(`${this.serverUrl}/api/sync/bulk_matters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matters })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.timestamp) this.lastTimestamp = result.timestamp;
        return true;
      }
    } catch (e) {
      console.warn('Failed to push bulk matters sync update:', e);
    }
    return false;
  }

  /**
   * Generates a lightweight SVG/PNG QR Code for mobile access URL
   */
  generateQRCodeSVG(text = '', size = 160) {
    const url = text || this.getWebAppUrl();
    const encoded = encodeURIComponent(url);
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=${size}x${size}&margin=8`;
    return `<img src="${qrApiUrl}" alt="QR Code" width="${size}" height="${size}" style="border-radius:10px; background:#fff; padding:6px; box-shadow:0 4px 12px rgba(0,0,0,0.3); display:block; margin:0 auto;" />`;
  }
}

window.committeeSyncEngine = new CommitteeSyncEngine();
