// DevContext Pro - Options Page JavaScript

class OptionsManager {
  constructor() {
    this.settings = {};
    this.blockedSites = [];
    this.defaultSettings = {
      autoDetect: true,
      smartGrouping: true,
      sessionPersistence: true,
      contextTracking: true,
      confidenceThreshold: 0.3,
      maxTabs: 20,
      enableFocusMode: true,
      autoFocusDetection: false,
      focusDuration: 45,
      breakReminder: true,
      autoMergeWorkspaces: false,
      colorTheme: 'auto',
      cleanupDays: 30,
      workspaceNotifications: true,
      collectAnalytics: true,
      dataRetention: 90,
      debugMode: false
    };
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadSettings();
    this.renderSettings();
  }

  setupEventListeners() {
    // Save button
    document.getElementById('saveBtn').addEventListener('click', () => this.saveSettings());
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => this.resetSettings());

    // Range input updates
    document.getElementById('confidenceThreshold').addEventListener('input', (e) => {
      const value = Math.round(e.target.value * 100);
      document.querySelector('.range-value').textContent = `${value}%`;
    });

    // Blocked sites management
    document.getElementById('addBlockedSite').addEventListener('click', () => this.addBlockedSite());
    document.getElementById('newBlockedSite').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addBlockedSite();
    });

    // Action buttons
    document.getElementById('exportAnalytics').addEventListener('click', () => this.exportAnalytics());
    document.getElementById('clearAllData').addEventListener('click', () => this.clearAllData());
    document.getElementById('customRules').addEventListener('click', () => this.showCustomRulesModal());
    document.getElementById('backupSettings').addEventListener('click', () => this.backupSettings());
    document.getElementById('importSettings').addEventListener('click', () => this.importSettings());

    // Modal events
    document.getElementById('closeRulesModal').addEventListener('click', () => this.hideCustomRulesModal());
    document.getElementById('cancelRules').addEventListener('click', () => this.hideCustomRulesModal());
    document.getElementById('saveRules').addEventListener('click', () => this.saveCustomRules());

    // Import file handler
    document.getElementById('importFile').addEventListener('change', (e) => this.handleImportFile(e));

    // Auto-save on changes
    this.setupAutoSave();
  }

  setupAutoSave() {
    const inputs = document.querySelectorAll('input[type="checkbox"], input[type="range"], input[type="number"], select');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        this.debounce(() => this.saveSettings(), 1000);
      });
    });
  }

  debounce(func, wait) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(func, wait);
  }

  async loadSettings() {
    try {
      const stored = await chrome.storage.local.get(['settings', 'blockedSites']);
      this.settings = { ...this.defaultSettings, ...(stored.settings || {}) };
      this.blockedSites = stored.blockedSites || [
        'facebook.com',
        'twitter.com',
        'instagram.com',
        'youtube.com',
        'reddit.com',
        'tiktok.com'
      ];
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = { ...this.defaultSettings };
    }
  }

  renderSettings() {
    // General settings
    document.getElementById('autoDetect').checked = this.settings.autoDetect;
    document.getElementById('smartGrouping').checked = this.settings.smartGrouping;
    document.getElementById('sessionPersistence').checked = this.settings.sessionPersistence;
    document.getElementById('contextTracking').checked = this.settings.contextTracking;
    document.getElementById('confidenceThreshold').value = this.settings.confidenceThreshold;
    document.getElementById('maxTabs').value = this.settings.maxTabs;

    // Focus mode settings
    document.getElementById('enableFocusMode').checked = this.settings.enableFocusMode;
    document.getElementById('autoFocusDetection').checked = this.settings.autoFocusDetection;
    document.getElementById('focusDuration').value = this.settings.focusDuration;
    document.getElementById('breakReminder').checked = this.settings.breakReminder;

    // Workspace settings
    document.getElementById('autoMergeWorkspaces').checked = this.settings.autoMergeWorkspaces;
    document.getElementById('colorTheme').value = this.settings.colorTheme;
    document.getElementById('cleanupDays').value = this.settings.cleanupDays;
    document.getElementById('workspaceNotifications').checked = this.settings.workspaceNotifications;

    // Analytics settings
    document.getElementById('collectAnalytics').checked = this.settings.collectAnalytics;
    document.getElementById('dataRetention').value = this.settings.dataRetention;

    // Advanced settings
    document.getElementById('debugMode').checked = this.settings.debugMode;

    // Update range display
    const confidenceValue = Math.round(this.settings.confidenceThreshold * 100);
    document.querySelector('.range-value').textContent = `${confidenceValue}%`;

    // Render blocked sites
    this.renderBlockedSites();
  }

  renderBlockedSites() {
    const container = document.getElementById('blockedSitesList');
    
    if (this.blockedSites.length === 0) {
      container.innerHTML = '<p style="color: #5f6368; font-style: italic;">No blocked sites configured</p>';
      return;
    }

    container.innerHTML = this.blockedSites.map((site, index) => `
      <div class="blocked-site-item">
        <span>${site}</span>
        <button class="remove-btn" data-index="${index}">Remove</button>
      </div>
    `).join('');

    // Add remove event listeners
    container.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.removeBlockedSite(index);
      });
    });
  }

  addBlockedSite() {
    const input = document.getElementById('newBlockedSite');
    const site = input.value.trim().toLowerCase();
    
    if (!site) return;
    
    // Validate URL format
    if (!this.isValidDomain(site)) {
      alert('Please enter a valid domain (e.g., facebook.com)');
      return;
    }
    
    if (this.blockedSites.includes(site)) {
      alert('This site is already blocked');
      return;
    }
    
    this.blockedSites.push(site);
    input.value = '';
    this.renderBlockedSites();
    this.saveSettings();
  }

  removeBlockedSite(index) {
    this.blockedSites.splice(index, 1);
    this.renderBlockedSites();
    this.saveSettings();
  }

  isValidDomain(domain) {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    return domainRegex.test(domain) || domain.includes('localhost');
  }

  async saveSettings() {
    try {
      // Collect all settings from form
      const formSettings = {
        autoDetect: document.getElementById('autoDetect').checked,
        smartGrouping: document.getElementById('smartGrouping').checked,
        sessionPersistence: document.getElementById('sessionPersistence').checked,
        contextTracking: document.getElementById('contextTracking').checked,
        confidenceThreshold: parseFloat(document.getElementById('confidenceThreshold').value),
        maxTabs: parseInt(document.getElementById('maxTabs').value),
        enableFocusMode: document.getElementById('enableFocusMode').checked,
        autoFocusDetection: document.getElementById('autoFocusDetection').checked,
        focusDuration: parseInt(document.getElementById('focusDuration').value),
        breakReminder: document.getElementById('breakReminder').checked,
        autoMergeWorkspaces: document.getElementById('autoMergeWorkspaces').checked,
        colorTheme: document.getElementById('colorTheme').value,
        cleanupDays: parseInt(document.getElementById('cleanupDays').value),
        workspaceNotifications: document.getElementById('workspaceNotifications').checked,
        collectAnalytics: document.getElementById('collectAnalytics').checked,
        dataRetention: parseInt(document.getElementById('dataRetention').value),
        debugMode: document.getElementById('debugMode').checked
      };

      this.settings = formSettings;

      // Save to storage
      await chrome.storage.local.set({
        settings: this.settings,
        blockedSites: this.blockedSites
      });

      // Notify background script of settings change
      chrome.runtime.sendMessage({
        action: 'settingsUpdated',
        settings: this.settings,
        blockedSites: this.blockedSites
      });

      this.showSaveStatus();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  }

  async resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      this.settings = { ...this.defaultSettings };
      this.blockedSites = ['facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'reddit.com', 'tiktok.com'];
      this.renderSettings();
      await this.saveSettings();
    }
  }

  showSaveStatus() {
    const status = document.getElementById('saveStatus');
    status.style.display = 'block';
    
    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  }

  async exportAnalytics() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'exportAnalyticsData' });
      
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devcontext-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting analytics:', error);
      alert('Error exporting analytics data. Please try again.');
    }
  }

  async clearAllData() {
    const confirmation = prompt(
      'This will permanently delete ALL extension data including workspaces, analytics, and settings.\n\n' +
      'Type "DELETE ALL DATA" to confirm:'
    );
    
    if (confirmation === 'DELETE ALL DATA') {
      try {
        await chrome.storage.local.clear();
        await chrome.runtime.sendMessage({ action: 'clearAllData' });
        alert('All data has been cleared. The extension will now reset to defaults.');
        window.location.reload();
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Error clearing data. Please try again.');
      }
    }
  }

  showCustomRulesModal() {
    document.getElementById('customRulesModal').style.display = 'flex';
    
    // Load current custom rules
    chrome.storage.local.get(['customRules']).then(result => {
      const rules = result.customRules || {};
      document.getElementById('customRulesText').value = JSON.stringify(rules, null, 2);
    });
  }

  hideCustomRulesModal() {
    document.getElementById('customRulesModal').style.display = 'none';
  }

  async saveCustomRules() {
    try {
      const rulesText = document.getElementById('customRulesText').value.trim();
      
      if (rulesText) {
        const rules = JSON.parse(rulesText);
        await chrome.storage.local.set({ customRules: rules });
        chrome.runtime.sendMessage({ action: 'customRulesUpdated', rules });
      }
      
      this.hideCustomRulesModal();
      this.showSaveStatus();
    } catch (error) {
      alert('Invalid JSON format. Please check your rules configuration.');
    }
  }

  backupSettings() {
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      settings: this.settings,
      blockedSites: this.blockedSites
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devcontext-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importSettings() {
    document.getElementById('importFile').click();
  }

  async handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      
      if (backup.settings && backup.blockedSites) {
        if (confirm('This will replace your current settings. Continue?')) {
          this.settings = { ...this.defaultSettings, ...backup.settings };
          this.blockedSites = backup.blockedSites || [];
          this.renderSettings();
          await this.saveSettings();
          alert('Settings imported successfully!');
        }
      } else {
        alert('Invalid backup file format.');
      }
    } catch (error) {
      console.error('Error importing settings:', error);
      alert('Error importing settings. Please check the file format.');
    }
    
    // Reset file input
    event.target.value = '';
  }
}

// Initialize options page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager();
});
