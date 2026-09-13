/**
 * Real-Time Mobile & Multi-Device Sync Engine for Committee Members
 * Enables instant synchronization of donors, custom matters, and live previews across all connected mobile devices.
 */

class CommitteeSyncEngine {
  constructor() {
    this.syncInterval = null;
    this.pollFreqMs = 2000;
    this.lastTimestamp = 0;
    this.localIp = '';
    this.mobileSyncUrl = '';
    this.isOnline = false;
    this.connectedDevicesCount = 1;
    this.onSyncUpdate = null;
    this.onStatusChange = null;

    const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
    this.serverUrl = `http://${host}:5005`;
  }

  init() {
    this.fetchSyncInfo();
    this.startPolling();
  }

  startPolling() {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.pollServer();
    this.syncInterval = setInterval(() => this.pollServer(), this.pollFreqMs);
  }

  stopPolling() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async fetchSyncInfo() {
    try {
      const res = await fetch(`${this.serverUrl}/api/sync/info`);
      if (res.ok) {
        const info = await res.json();
        this.localIp = info.localIp || '127.0.0.1';
        this.mobileSyncUrl = info.mobileSyncUrl || `http://${this.localIp}:8085`;
        this.isOnline = true;
        if (this.onStatusChange) this.onStatusChange(true, info);
      }
    } catch (e) {
      this.isOnline = false;
      if (this.onStatusChange) this.onStatusChange(false, null);
    }
  }

  async pollServer() {
    try {
      const res = await fetch(`${this.serverUrl}/api/sync/data`);
      if (!res.ok) throw new Error('Sync server error');

      const data = await res.json();
      this.isOnline = true;

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
      if (this.isOnline) {
        this.isOnline = false;
        if (this.onStatusChange) this.onStatusChange(false, null);
      }
    }
  }

  async pushDonorUpdate(donor, action = 'save') {
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
   * Generates a lightweight SVG QR Code for mobile access URL
   */
  generateQRCodeSVG(text = '', size = 160) {
    const url = text || this.mobileSyncUrl || 'http://localhost:8085';
    // Using quick chart API or fallback SVG QR Code generator
    const encoded = encodeURIComponent(url);
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=${size}x${size}&margin=8`;
    return `<img src="${qrApiUrl}" alt="Mobile Sync QR Code" width="${size}" height="${size}" style="border-radius:10px; background:#fff; padding:6px; box-shadow:0 4px 12px rgba(0,0,0,0.3);" />`;
  }
}

window.committeeSyncEngine = new CommitteeSyncEngine();
