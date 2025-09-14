// DevContext Pro - Popup JavaScript

class PopupManager {
  constructor() {
    this.workspaces = [];
    this.currentWorkspace = null;
    this.analytics = {};
    this.selectedColor = 'blue';
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadData();
    this.render();
  }

  setupEventListeners() {
    // Header actions
    document.getElementById('refreshBtn').addEventListener('click', () => this.refresh());
    document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());

    // Focus mode
    document.getElementById('focusModeBtn').addEventListener('click', () => this.toggleFocusMode());

    // Quick actions
    document.getElementById('saveSessionBtn').addEventListener('click', () => this.saveSession());
    document.getElementById('analyticsBtn').addEventListener('click', () => this.openAnalytics());

    // Create workspace
    document.getElementById('createWorkspaceBtn').addEventListener('click', () => this.showCreateModal());
    document.getElementById('createFirstWorkspaceBtn').addEventListener('click', () => this.showCreateModal());

    // Modal events
    document.getElementById('closeModal').addEventListener('click', () => this.hideCreateModal());
    document.getElementById('cancelCreate').addEventListener('click', () => this.hideCreateModal());
    document.getElementById('confirmCreate').addEventListener('click', () => this.createWorkspace());

    // Color picker
    document.querySelectorAll('.color-option').forEach(btn => {
      btn.addEventListener('click', (e) => this.selectColor(e.target.dataset.color));
    });

    // Close modal on backdrop click
    document.getElementById('createWorkspaceModal').addEventListener('click', (e) => {
      if (e.target.id === 'createWorkspaceModal') {
        this.hideCreateModal();
      }
    });
  }

  async loadData() {
    try {
      // Show loading state
      this.showLoading();

      // Load workspaces
      const workspaces = await this.sendMessage({ action: 'getWorkspaces' });
      this.workspaces = workspaces || [];

      // Load analytics
      const analytics = await this.sendMessage({ action: 'getAnalytics' });
      this.analytics = analytics || {};

      // Get current tab info
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        this.currentWorkspace = this.findWorkspaceForTab(tab.id);
      }

      this.hideLoading();
    } catch (error) {
      console.error('Error loading data:', error);
      this.hideLoading();
    }
  }

  render() {
    this.renderStats();
    this.renderCurrentWorkspace();
    this.renderWorkspaceList();
  }

  renderStats() {
    document.getElementById('workspaceCount').textContent = this.workspaces.length;
    document.getElementById('switchCount').textContent = this.analytics.totalSwitches || 0;
    document.getElementById('focusTime').textContent = this.formatFocusTime(this.analytics.focusTime || 0);
  }

  renderCurrentWorkspace() {
    const currentElement = document.getElementById('currentWorkspace');
    const nameElement = document.getElementById('currentName');
    const techElement = document.getElementById('currentTech');
    const colorElement = document.getElementById('currentColor');

    if (this.currentWorkspace) {
      nameElement.textContent = this.currentWorkspace.name;
      techElement.textContent = this.formatTechStack(this.currentWorkspace.techStack);
      colorElement.style.backgroundColor = this.getColorHex(this.currentWorkspace.color);
    } else {
      nameElement.textContent = 'No Active Workspace';
      techElement.textContent = 'Visit a development site to auto-detect';
      colorElement.style.backgroundColor = '#9aa0a6';
    }
  }

  renderWorkspaceList() {
    const listElement = document.getElementById('workspaceList');
    const emptyState = document.getElementById('emptyState');

    if (this.workspaces.length === 0) {
      listElement.style.display = 'none';
      emptyState.style.display = 'flex';
      return;
    }

    listElement.style.display = 'block';
    emptyState.style.display = 'none';

    // Sort workspaces by last active
    const sortedWorkspaces = [...this.workspaces].sort((a, b) => b.lastActive - a.lastActive);

    listElement.innerHTML = sortedWorkspaces.map(workspace => `
      <div class="workspace-item ${workspace.id === this.currentWorkspace?.id ? 'active' : ''}" 
           data-workspace-id="${workspace.id}">
        <div class="workspace-item-color" style="background-color: ${this.getColorHex(workspace.color)}"></div>
        <div class="workspace-item-info">
          <div class="workspace-item-name">${workspace.name}</div>
          <div class="workspace-item-details">
            <span class="workspace-item-tabs">${workspace.tabs.length} tabs</span>
            ${workspace.techStack.length > 0 ? `<span>${workspace.techStack.slice(0, 2).join(', ')}</span>` : ''}
          </div>
          ${workspace.techStack.length > 0 ? `
            <div class="tech-stack">
              ${workspace.techStack.slice(0, 3).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
          ` : ''}
        </div>
        <div class="workspace-item-actions">
          <button class="workspace-action-btn" data-action="switch" title="Switch to workspace">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
          <button class="workspace-action-btn" data-action="delete" title="Delete workspace">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `).join('');

    // Add event listeners to workspace items
    listElement.querySelectorAll('.workspace-item').forEach(item => {
      const workspaceId = item.dataset.workspaceId;
      
      // Click to switch workspace
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.workspace-action-btn')) {
          this.switchWorkspace(workspaceId);
        }
      });

      // Action buttons
      item.querySelectorAll('.workspace-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          
          if (action === 'switch') {
            this.switchWorkspace(workspaceId);
          } else if (action === 'delete') {
            this.deleteWorkspace(workspaceId);
          }
        });
      });
    });
  }

  async switchWorkspace(workspaceId) {
    try {
      await this.sendMessage({ action: 'switchWorkspace', workspaceId });
      window.close();
    } catch (error) {
      console.error('Error switching workspace:', error);
    }
  }

  async deleteWorkspace(workspaceId) {
    if (confirm('Are you sure you want to delete this workspace?')) {
      try {
        await this.sendMessage({ action: 'deleteWorkspace', workspaceId });
        await this.refresh();
      } catch (error) {
        console.error('Error deleting workspace:', error);
      }
    }
  }

  showCreateModal() {
    document.getElementById('createWorkspaceModal').style.display = 'flex';
    document.getElementById('workspaceName').focus();
  }

  hideCreateModal() {
    document.getElementById('createWorkspaceModal').style.display = 'none';
    this.resetCreateForm();
  }

  resetCreateForm() {
    document.getElementById('workspaceName').value = '';
    document.getElementById('workspaceTech').value = '';
    this.selectColor('blue');
  }

  selectColor(color) {
    this.selectedColor = color;
    document.querySelectorAll('.color-option').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.color === color);
    });
  }

  async createWorkspace() {
    const name = document.getElementById('workspaceName').value.trim();
    const techInput = document.getElementById('workspaceTech').value.trim();
    
    if (!name) {
      alert('Please enter a workspace name');
      return;
    }

    const techStack = techInput ? techInput.split(',').map(t => t.trim()) : [];

    const projectInfo = {
      projectName: name,
      techStack,
      color: this.selectedColor,
      confidence: 1.0 // Manual creation has full confidence
    };

    try {
      await this.sendMessage({ action: 'createWorkspace', projectInfo });
      this.hideCreateModal();
      await this.refresh();
    } catch (error) {
      console.error('Error creating workspace:', error);
      alert('Error creating workspace. Please try again.');
    }
  }

  async toggleFocusMode() {
    try {
      const result = await this.sendMessage({ action: 'toggleFocusMode' });
      const btn = document.getElementById('focusModeBtn');
      
      if (result.active) {
        btn.classList.add('active');
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          Focus Active
        `;
      } else {
        btn.classList.remove('active');
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          Focus Mode
        `;
      }
    } catch (error) {
      console.error('Error toggling focus mode:', error);
    }
  }

  async saveSession() {
    try {
      await this.sendMessage({ action: 'saveCurrentSession' });
      this.showNotification('Session saved successfully!');
    } catch (error) {
      console.error('Error saving session:', error);
      this.showNotification('Error saving session', 'error');
    }
  }

  openAnalytics() {
    chrome.tabs.create({ url: chrome.runtime.getURL('analytics/analytics.html') });
  }

  openSettings() {
    chrome.runtime.openOptionsPage();
  }

  async refresh() {
    await this.loadData();
    this.render();
  }

  showLoading() {
    document.getElementById('loading').style.display = 'flex';
  }

  hideLoading() {
    document.getElementById('loading').style.display = 'none';
  }

  findWorkspaceForTab(tabId) {
    return this.workspaces.find(workspace => workspace.tabs.includes(tabId));
  }

  formatTechStack(techStack) {
    if (!techStack || techStack.length === 0) return 'No tech stack detected';
    return techStack.slice(0, 3).join(', ') + (techStack.length > 3 ? '...' : '');
  }

  formatFocusTime(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  getColorHex(colorName) {
    const colors = {
      'grey': '#9aa0a6',
      'blue': '#4285f4',
      'red': '#ea4335',
      'yellow': '#fbbc04',
      'green': '#34a853',
      'pink': '#ff6d9d',
      'purple': '#9c27b0',
      'cyan': '#00bcd4'
    };
    return colors[colorName] || colors['blue'];
  }

  showNotification(message, type = 'success') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      background: ${type === 'error' ? '#ea4335' : '#34a853'};
      color: white;
      border-radius: 6px;
      font-size: 13px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
