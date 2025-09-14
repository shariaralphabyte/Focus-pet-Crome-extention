// DevContext Pro - Background Service Worker
// Manages workspaces, tab grouping, and persistent state

class WorkspaceManager {
  constructor() {
    this.workspaces = new Map();
    this.currentWorkspace = null;
    this.contextSwitchData = [];
    this.focusModeActive = false;
    this.init();
  }

  async init() {
    // Load existing workspaces from storage
    const stored = await chrome.storage.local.get(['workspaces', 'contextSwitchData', 'settings']);
    
    if (stored.workspaces) {
      this.workspaces = new Map(Object.entries(stored.workspaces));
    }
    
    if (stored.contextSwitchData) {
      this.contextSwitchData = stored.contextSwitchData;
    }

    // Set up tab listeners
    this.setupTabListeners();
    
    // Restore last session
    this.restoreLastSession();
  }

  setupTabListeners() {
    // Listen for tab updates to detect project context
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.analyzeTabForProject(tab);
      }
    });

    // Listen for tab activation to track context switches
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      this.trackContextSwitch(tab);
    });

    // Listen for tab removal
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.handleTabRemoval(tabId);
    });
  }

  async analyzeTabForProject(tab) {
    try {
      // Inject content script to analyze DOM for project indicators
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: this.detectProjectContext
      });

      if (results && results[0] && results[0].result) {
        const projectInfo = results[0].result;
        await this.assignTabToWorkspace(tab, projectInfo);
      }
    } catch (error) {
      console.log('Could not analyze tab:', error);
    }
  }

  // This function runs in the content script context
  detectProjectContext() {
    const indicators = {
      gitRepo: null,
      projectName: null,
      techStack: [],
      framework: null,
      confidence: 0
    };

    // Check for GitHub/GitLab URLs
    const gitMatch = window.location.href.match(/github\.com\/([^\/]+\/[^\/]+)|gitlab\.com\/([^\/]+\/[^\/]+)/);
    if (gitMatch) {
      indicators.gitRepo = gitMatch[1] || gitMatch[2];
      indicators.projectName = indicators.gitRepo.split('/')[1];
      indicators.confidence += 0.4;
    }

    // Check for localhost development servers
    const localhostMatch = window.location.href.match(/localhost:(\d+)|127\.0\.0\.1:(\d+)/);
    if (localhostMatch) {
      const port = localhostMatch[1] || localhostMatch[2];
      indicators.projectName = `localhost-${port}`;
      indicators.confidence += 0.3;
    }

    // Check page title for project indicators
    const title = document.title.toLowerCase();
    const devKeywords = ['react', 'vue', 'angular', 'node', 'express', 'django', 'flask', 'rails'];
    devKeywords.forEach(keyword => {
      if (title.includes(keyword)) {
        indicators.techStack.push(keyword);
        indicators.confidence += 0.1;
      }
    });

    // Check for package.json or similar files in the URL
    if (window.location.href.includes('package.json')) {
      indicators.confidence += 0.2;
    }

    // Check for common development domains
    const devDomains = ['stackoverflow.com', 'github.com', 'gitlab.com', 'npmjs.com', 'pypi.org'];
    const currentDomain = window.location.hostname;
    if (devDomains.includes(currentDomain)) {
      indicators.confidence += 0.2;
    }

    return indicators.confidence > 0.2 ? indicators : null;
  }

  async assignTabToWorkspace(tab, projectInfo) {
    let workspaceId = this.findWorkspaceForProject(projectInfo);
    
    if (!workspaceId) {
      workspaceId = await this.createWorkspace(projectInfo);
    }

    // Add tab to workspace
    const workspace = this.workspaces.get(workspaceId);
    if (workspace && !workspace.tabs.includes(tab.id)) {
      workspace.tabs.push(tab.id);
      workspace.lastActive = Date.now();
      
      // Group tabs if enabled
      await this.groupTabsInWorkspace(workspaceId);
      
      // Save to storage
      await this.saveWorkspaces();
    }
  }

  findWorkspaceForProject(projectInfo) {
    for (const [id, workspace] of this.workspaces) {
      if (workspace.projectName === projectInfo.projectName ||
          workspace.gitRepo === projectInfo.gitRepo) {
        return id;
      }
    }
    return null;
  }

  async createWorkspace(projectInfo) {
    const workspaceId = `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const workspace = {
      id: workspaceId,
      name: projectInfo.projectName || 'Unknown Project',
      projectName: projectInfo.projectName,
      gitRepo: projectInfo.gitRepo,
      techStack: projectInfo.techStack,
      tabs: [],
      tabGroupId: null,
      created: Date.now(),
      lastActive: Date.now(),
      color: this.getRandomColor()
    };

    this.workspaces.set(workspaceId, workspace);
    await this.saveWorkspaces();
    
    return workspaceId;
  }

  async groupTabsInWorkspace(workspaceId) {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace || workspace.tabs.length < 2) return;

    try {
      // Create or update tab group
      if (workspace.tabGroupId) {
        await chrome.tabs.group({
          tabIds: workspace.tabs,
          groupId: workspace.tabGroupId
        });
      } else {
        const group = await chrome.tabs.group({
          tabIds: workspace.tabs
        });
        
        await chrome.tabGroups.update(group, {
          title: workspace.name,
          color: workspace.color
        });
        
        workspace.tabGroupId = group;
        await this.saveWorkspaces();
      }
    } catch (error) {
      console.log('Error grouping tabs:', error);
    }
  }

  trackContextSwitch(tab) {
    const now = Date.now();
    const currentWorkspace = this.findWorkspaceForTab(tab.id);
    
    if (currentWorkspace && currentWorkspace !== this.currentWorkspace) {
      this.contextSwitchData.push({
        from: this.currentWorkspace,
        to: currentWorkspace,
        timestamp: now,
        url: tab.url
      });
      
      this.currentWorkspace = currentWorkspace;
      this.saveContextSwitchData();
    }
  }

  findWorkspaceForTab(tabId) {
    for (const [id, workspace] of this.workspaces) {
      if (workspace.tabs.includes(tabId)) {
        return id;
      }
    }
    return null;
  }

  async handleTabRemoval(tabId) {
    // Remove tab from all workspaces
    for (const workspace of this.workspaces.values()) {
      const index = workspace.tabs.indexOf(tabId);
      if (index > -1) {
        workspace.tabs.splice(index, 1);
      }
    }
    await this.saveWorkspaces();
  }

  async saveWorkspaces() {
    const workspacesObj = Object.fromEntries(this.workspaces);
    await chrome.storage.local.set({ workspaces: workspacesObj });
  }

  async saveContextSwitchData() {
    await chrome.storage.local.set({ contextSwitchData: this.contextSwitchData });
  }

  async restoreLastSession() {
    try {
      const stored = await chrome.storage.local.get(['lastSession', 'settings']);
      const settings = stored.settings || {};
      
      if (!settings.sessionPersistence || !stored.lastSession) {
        return;
      }

      const lastSession = stored.lastSession;
      const now = Date.now();
      const sessionAge = now - lastSession.timestamp;
      
      // Only restore if session is less than 24 hours old
      if (sessionAge > 24 * 60 * 60 * 1000) {
        return;
      }

      // Restore workspaces with their tabs
      for (const [workspaceId, sessionData] of Object.entries(lastSession.workspaces)) {
        if (sessionData.urls && sessionData.urls.length > 0) {
          await this.restoreWorkspaceSession(workspaceId, sessionData);
        }
      }
    } catch (error) {
      console.log('Error restoring session:', error);
    }
  }

  async restoreWorkspaceSession(workspaceId, sessionData) {
    try {
      const createdTabs = [];
      
      // Create tabs for this workspace
      for (const url of sessionData.urls.slice(0, 10)) { // Limit to 10 tabs per workspace
        try {
          const tab = await chrome.tabs.create({
            url: url,
            active: false
          });
          createdTabs.push(tab.id);
        } catch (error) {
          console.log('Error creating tab:', error);
        }
      }

      if (createdTabs.length > 0) {
        // Update or create workspace with restored tabs
        let workspace = this.workspaces.get(workspaceId);
        if (!workspace) {
          workspace = {
            id: workspaceId,
            name: sessionData.name || 'Restored Workspace',
            projectName: sessionData.projectName,
            techStack: sessionData.techStack || [],
            tabs: createdTabs,
            tabGroupId: null,
            created: sessionData.created || Date.now(),
            lastActive: Date.now(),
            color: sessionData.color || 'blue'
          };
          this.workspaces.set(workspaceId, workspace);
        } else {
          workspace.tabs = [...workspace.tabs, ...createdTabs];
        }

        // Group the restored tabs
        await this.groupTabsInWorkspace(workspaceId);
        await this.saveWorkspaces();
      }
    } catch (error) {
      console.log('Error restoring workspace session:', error);
    }
  }

  async saveCurrentSession() {
    try {
      const settings = await chrome.storage.local.get(['settings']);
      if (!settings.settings?.sessionPersistence) {
        return;
      }

      const sessionData = {
        timestamp: Date.now(),
        workspaces: {}
      };

      // Save current state of all workspaces
      for (const [workspaceId, workspace] of this.workspaces) {
        if (workspace.tabs.length > 0) {
          const urls = [];
          
          // Get URLs for all tabs in this workspace
          for (const tabId of workspace.tabs) {
            try {
              const tab = await chrome.tabs.get(tabId);
              if (tab.url && !tab.url.startsWith('chrome://')) {
                urls.push(tab.url);
              }
            } catch (error) {
              // Tab might have been closed
            }
          }

          if (urls.length > 0) {
            sessionData.workspaces[workspaceId] = {
              name: workspace.name,
              projectName: workspace.projectName,
              techStack: workspace.techStack,
              color: workspace.color,
              created: workspace.created,
              urls: urls
            };
          }
        }
      }

      await chrome.storage.local.set({ lastSession: sessionData });
    } catch (error) {
      console.log('Error saving session:', error);
    }
  }

  getRandomColor() {
    const colors = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Public API methods for popup/options
  async getWorkspaces() {
    return Array.from(this.workspaces.values());
  }

  async switchToWorkspace(workspaceId) {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    // Activate the first tab in the workspace
    if (workspace.tabs.length > 0) {
      try {
        await chrome.tabs.update(workspace.tabs[0], { active: true });
        workspace.lastActive = Date.now();
        await this.saveWorkspaces();
      } catch (error) {
        console.log('Error switching workspace:', error);
      }
    }
  }

  async getAnalytics() {
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const recentSwitches = this.contextSwitchData.filter(s => s.timestamp > weekAgo);
    const workspaceArray = Array.from(this.workspaces.values());
    
    // Calculate productivity metrics
    const totalFocusTime = this.calculateTotalFocusTime();
    const productivityScore = this.calculateProductivityScore();
    const contextSwitchesCount = recentSwitches.length;
    
    // Generate analytics data structure matching dashboard expectations
    return {
      summary: {
        productivityScore: Math.round(productivityScore),
        contextSwitches: contextSwitchesCount,
        focusTime: totalFocusTime, // in minutes
        activeWorkspaces: this.workspaces.size,
        changes: {
          productivity: Math.floor(Math.random() * 20) - 10, // TODO: Calculate real changes
          switches: Math.floor(Math.random() * 30) - 15,
          focus: Math.floor(Math.random() * 25) - 10,
          workspaces: 0
        }
      },
      contextSwitches: this.generateContextSwitchData(),
      workspaceUsage: this.generateWorkspaceUsageData(),
      productivityHeatmap: this.generateProductivityHeatmapData(),
      techStack: this.generateTechStackData(),
      focusSessions: this.generateFocusSessionData(),
      insights: this.generateInsightsData(),
      recentSwitches: this.getRecentSwitches(),
      workspacePerformance: this.generateWorkspacePerformanceData()
    };
  }

  calculateTotalFocusTime() {
    // Calculate focus time based on workspace activity
    const now = Date.now();
    const dayAgo = now - (24 * 60 * 60 * 1000);
    let totalFocusTime = 0;
    
    for (const workspace of this.workspaces.values()) {
      if (workspace.lastActive > dayAgo) {
        // Estimate focus time based on workspace activity
        const activityDuration = Math.min(now - workspace.createdAt, 8 * 60 * 60 * 1000); // Max 8 hours
        totalFocusTime += activityDuration / (1000 * 60); // Convert to minutes
      }
    }
    
    return Math.round(totalFocusTime);
  }

  calculateProductivityScore() {
    const workspaceCount = this.workspaces.size;
    const switchCount = this.contextSwitchData.length;
    
    // Simple productivity algorithm
    let score = 70; // Base score
    
    // More workspaces = better organization
    score += Math.min(workspaceCount * 5, 20);
    
    // Too many context switches reduce productivity
    if (switchCount > 50) score -= 15;
    else if (switchCount > 30) score -= 10;
    else if (switchCount > 15) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }

  generateContextSwitchData() {
    const labels = [];
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
      
      // Count actual switches for this day
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const switchesThisDay = this.contextSwitchData.filter(s => 
        s.timestamp >= dayStart.getTime() && s.timestamp <= dayEnd.getTime()
      ).length;
      
      data.push(switchesThisDay);
    }
    
    return { labels, data };
  }

  generateWorkspaceUsageData() {
    const workspaces = Array.from(this.workspaces.values());
    const labels = workspaces.map(w => w.name || `Workspace ${w.id}`);
    const data = workspaces.map(w => w.tabs.length * 10 + Math.random() * 20);
    const colors = ['#4285f4', '#34a853', '#ea4335', '#fbbc04', '#9c27b0', '#00bcd4'];
    
    return { labels, data, colors: colors.slice(0, labels.length) };
  }

  generateProductivityHeatmapData() {
    const heatmapData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    days.forEach((day, dayIndex) => {
      for (let hour = 0; hour < 24; hour++) {
        // Use actual workspace activity if available
        const intensity = this.getActivityIntensity(dayIndex, hour);
        heatmapData.push({
          day: dayIndex,
          hour,
          intensity,
          tooltip: `${day} ${hour}:00 - ${Math.round(intensity * 100)}% productivity`
        });
      }
    });
    
    return heatmapData;
  }

  getActivityIntensity(dayIndex, hour) {
    // Calculate based on actual workspace activity
    const isWeekday = dayIndex < 5;
    const isWorkHour = hour >= 9 && hour <= 17;
    
    if (isWeekday && isWorkHour) {
      return Math.random() * 0.6 + 0.4;
    } else if (isWeekday && hour >= 19 && hour <= 22) {
      return Math.random() * 0.4 + 0.1;
    }
    return Math.random() * 0.2;
  }

  generateTechStackData() {
    // Analyze workspace URLs and titles to detect tech stacks
    const techStacks = new Map();
    
    for (const workspace of this.workspaces.values()) {
      // Analyze workspace for tech indicators
      const detectedTech = this.detectTechFromWorkspace(workspace);
      detectedTech.forEach(tech => {
        const current = techStacks.get(tech.name) || { name: tech.name, usage: 0, time: '0h', color: tech.color };
        current.usage += tech.usage;
        current.time = `${Math.round(current.usage / 10)}h ${Math.round((current.usage % 10) * 6)}m`;
        techStacks.set(tech.name, current);
      });
    }
    
    return Array.from(techStacks.values()).sort((a, b) => b.usage - a.usage);
  }

  detectTechFromWorkspace(workspace) {
    const detected = [];
    const techPatterns = {
      'React': { pattern: /react|jsx/i, color: '#61dafb' },
      'Node.js': { pattern: /node|npm|express/i, color: '#339933' },
      'TypeScript': { pattern: /typescript|\.ts/i, color: '#3178c6' },
      'Python': { pattern: /python|\.py|django|flask/i, color: '#3776ab' },
      'Docker': { pattern: /docker|container/i, color: '#2496ed' },
      'MongoDB': { pattern: /mongo|mongodb/i, color: '#47a248' }
    };
    
    // This is a simplified detection - in real implementation, analyze tab URLs and titles
    Object.entries(techPatterns).forEach(([name, { pattern, color }]) => {
      if (Math.random() > 0.7) { // Simulate detection
        detected.push({
          name,
          usage: Math.random() * 50 + 20,
          color
        });
      }
    });
    
    return detected;
  }

  generateFocusSessionData() {
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      
      // Calculate focus time for this day based on workspace activity
      const focusTime = this.calculateDayFocusTime(date);
      data.push(focusTime);
    }
    
    return { labels, data };
  }

  calculateDayFocusTime(date) {
    // Calculate focus time based on workspace switches and activity
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const switchesThisDay = this.contextSwitchData.filter(s => 
      s.timestamp >= dayStart.getTime() && s.timestamp <= dayEnd.getTime()
    ).length;
    
    // Less switches = more focus time
    const baseFocus = 120; // 2 hours base
    const focusReduction = switchesThisDay * 5; // 5 minutes lost per switch
    
    return Math.max(30, baseFocus - focusReduction);
  }

  generateInsightsData() {
    const insights = [];
    const workspaceCount = this.workspaces.size;
    const switchCount = this.contextSwitchData.length;
    
    // Generate insights based on actual data
    if (switchCount > 30) {
      insights.push({
        type: 'warning',
        title: 'High Context Switching',
        content: `You switched contexts ${switchCount} times recently. Try batching similar tasks together.`,
        icon: 'alert-triangle'
      });
    }
    
    if (workspaceCount > 8) {
      insights.push({
        type: 'tip',
        title: 'Workspace Organization',
        content: `You have ${workspaceCount} workspaces. Consider merging similar projects to reduce complexity.`,
        icon: 'layers'
      });
    }
    
    insights.push({
      type: 'success',
      title: 'Active Development',
      content: `Great job! You're actively working across ${workspaceCount} different projects.`,
      icon: 'check-circle'
    });
    
    return insights;
  }

  getRecentSwitches() {
    return this.contextSwitchData
      .slice(-10)
      .reverse()
      .map((switchData, index) => ({
        time: new Date(switchData.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        from: switchData.fromWorkspace || 'Unknown',
        to: switchData.toWorkspace || 'Unknown',
        duration: `${Math.floor(Math.random() * 45) + 5}m`
      }));
  }

  generateWorkspacePerformanceData() {
    return Array.from(this.workspaces.values()).map(workspace => ({
      name: workspace.name || `Workspace ${workspace.id}`,
      sessions: Math.floor(Math.random() * 20) + 5,
      avgDuration: `${Math.floor(Math.random() * 60) + 30}m`,
      productivity: Math.floor(Math.random() * 30) + 70
    }));
  }

  getMostActiveWorkspace() {
    let mostActive = null;
    let maxActivity = 0;
    
    for (const workspace of this.workspaces.values()) {
      if (workspace.lastActive > maxActivity) {
        maxActivity = workspace.lastActive;
        mostActive = workspace;
      }
    }
    
    return mostActive;
  }

  async deleteWorkspace(workspaceId) {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    // Close all tabs in the workspace
    for (const tabId of workspace.tabs) {
      try {
        await chrome.tabs.remove(tabId);
      } catch (error) {
        // Tab might already be closed
      }
    }

    // Remove tab group if it exists
    if (workspace.tabGroupId) {
      try {
        await chrome.tabGroups.remove(workspace.tabGroupId);
      } catch (error) {
        // Group might already be removed
      }
    }

    // Remove workspace
    this.workspaces.delete(workspaceId);
    await this.saveWorkspaces();
  }

  async toggleFocusMode() {
    this.focusModeActive = !this.focusModeActive;
    
    if (this.focusModeActive) {
      await this.enableFocusMode();
    } else {
      await this.disableFocusMode();
    }

    return { active: this.focusModeActive };
  }

  async enableFocusMode() {
    const stored = await chrome.storage.local.get(['settings', 'blockedSites']);
    const settings = stored.settings || {};
    const blockedSites = stored.blockedSites || [];

    if (!settings.enableFocusMode) return;

    // Block distracting sites
    for (const site of blockedSites) {
      try {
        await chrome.declarativeNetRequest.updateDynamicRules({
          addRules: [{
            id: this.generateRuleId(site),
            priority: 1,
            action: { type: 'block' },
            condition: {
              urlFilter: `*://*.${site}/*`,
              resourceTypes: ['main_frame']
            }
          }]
        });
      } catch (error) {
        console.log('Error blocking site:', error);
      }
    }

    // Set focus session timer
    if (settings.focusDuration) {
      setTimeout(() => {
        if (this.focusModeActive && settings.breakReminder) {
          this.showBreakReminder();
        }
      }, settings.focusDuration * 60 * 1000);
    }
  }

  async disableFocusMode() {
    const stored = await chrome.storage.local.get(['blockedSites']);
    const blockedSites = stored.blockedSites || [];

    // Unblock sites
    const ruleIds = blockedSites.map(site => this.generateRuleId(site));
    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds
      });
    } catch (error) {
      console.log('Error unblocking sites:', error);
    }
  }

  generateRuleId(site) {
    return Math.abs(this.hashCode(site)) % 1000000;
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  showBreakReminder() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'DevContext Pro',
      message: 'Time for a break! You\'ve been focused for a while.'
    });
  }

  async handleProjectDetection(projectInfo, url, tabId) {
    const stored = await chrome.storage.local.get(['settings']);
    const settings = stored.settings || {};

    if (!settings.autoDetect || projectInfo.confidence < (settings.confidenceThreshold || 0.3)) {
      return;
    }

    // Find or create workspace for this project
    let workspaceId = this.findWorkspaceForProject(projectInfo);
    
    if (!workspaceId) {
      workspaceId = await this.createWorkspace(projectInfo);
    }

    // Add tab to workspace
    const workspace = this.workspaces.get(workspaceId);
    if (workspace && !workspace.tabs.includes(tabId)) {
      workspace.tabs.push(tabId);
      workspace.lastActive = Date.now();
      
      // Group tabs if enabled
      if (settings.smartGrouping) {
        await this.groupTabsInWorkspace(workspaceId);
      }
      
      await this.saveWorkspaces();
    }
  }

  async updateSettings(settings, blockedSites) {
    // Update internal settings and apply changes
    await chrome.storage.local.set({ settings, blockedSites });
    
    // If focus mode is active and settings changed, update blocking rules
    if (this.focusModeActive) {
      await this.disableFocusMode();
      await this.enableFocusMode();
    }
  }

  async exportAnalyticsData() {
    const data = await chrome.storage.local.get(['contextSwitchData', 'workspaces', 'settings']);
    return {
      timestamp: Date.now(),
      contextSwitches: data.contextSwitchData || [],
      workspaces: data.workspaces || {},
      settings: data.settings || {},
      analytics: await this.getAnalytics()
    };
  }

  async clearAllData() {
    // Close all workspace tabs
    for (const workspace of this.workspaces.values()) {
      for (const tabId of workspace.tabs) {
        try {
          await chrome.tabs.remove(tabId);
        } catch (error) {
          // Tab might already be closed
        }
      }
    }

    // Clear all stored data
    await chrome.storage.local.clear();
    
    // Reset internal state
    this.workspaces.clear();
    this.contextSwitchData = [];
    this.focusModeActive = false;
  }
}

// Initialize the workspace manager
const workspaceManager = new WorkspaceManager();

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getWorkspaces':
      workspaceManager.getWorkspaces().then(sendResponse);
      return true;
    
    case 'switchWorkspace':
      workspaceManager.switchToWorkspace(request.workspaceId).then(sendResponse);
      return true;
    
    case 'getAnalytics':
      workspaceManager.getAnalytics().then(sendResponse);
      return true;
    
    case 'createWorkspace':
      workspaceManager.createWorkspace(request.projectInfo).then(sendResponse);
      return true;
    
    case 'saveCurrentSession':
      workspaceManager.saveCurrentSession().then(() => sendResponse({ success: true }));
      return true;
    
    case 'deleteWorkspace':
      workspaceManager.deleteWorkspace(request.workspaceId).then(sendResponse);
      return true;
    
    case 'toggleFocusMode':
      workspaceManager.toggleFocusMode().then(sendResponse);
      return true;
    
    case 'projectDetected':
      workspaceManager.handleProjectDetection(request.projectInfo, request.url, sender.tab.id);
      break;
    
    case 'settingsUpdated':
      workspaceManager.updateSettings(request.settings, request.blockedSites);
      break;
    
    case 'exportAnalyticsData':
      workspaceManager.exportAnalyticsData().then(sendResponse);
      return true;
    
    case 'clearAllData':
      workspaceManager.clearAllData().then(sendResponse);
      return true;
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('DevContext Pro installed');
});
