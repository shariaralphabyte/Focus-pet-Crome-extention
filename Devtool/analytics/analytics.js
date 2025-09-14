// DevContext Pro - Analytics Dashboard JavaScript

class AnalyticsDashboard {
  constructor() {
    this.charts = {};
    this.data = {};
    this.timeRange = 'week';
    this.init();
  }

  async init() {
    this.showLoading();
    this.setupEventListeners();
    await this.loadData();
    if (this.data && this.data.summary) {
      this.renderDashboard();
    } else {
      console.error('Failed to load analytics data');
    }
    this.hideLoading();
  }

  setupEventListeners() {
    // Time range selector
    document.getElementById('timeRangeSelect').addEventListener('change', (e) => {
      this.timeRange = e.target.value;
      this.refreshData();
    });

    // Export button
    document.getElementById('exportBtn').addEventListener('click', () => {
      this.exportData();
    });
  }

  async loadData() {
    try {
      // Check if we're in extension context
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        console.log('Loading real analytics data from extension...');
        // Load analytics data from background script
        const response = await this.sendMessage({ action: 'getAnalytics', timeRange: this.timeRange });
        if (response && response.summary) {
          this.data = response;
          console.log('Successfully loaded real analytics data:', response);
        } else {
          console.warn('Invalid response from extension, using mock data');
          this.data = this.generateMockData();
        }
      } else {
        // Fallback to mock data if not in extension context
        console.log('Running in web context, using mock data');
        this.data = this.generateMockData();
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      console.log('Falling back to mock data');
      this.data = this.generateMockData();
    }
  }

  generateMockData() {
    // Generate realistic mock data for demonstration
    const now = new Date();
    const days = this.timeRange === 'today' ? 1 : this.timeRange === 'week' ? 7 : this.timeRange === 'month' ? 30 : 90;
    
    return {
      summary: {
        productivityScore: 85,
        contextSwitches: 47,
        focusTime: 272, // minutes
        activeWorkspaces: 8,
        changes: {
          productivity: 5,
          switches: 12,
          focus: 18,
          workspaces: 0
        }
      },
      contextSwitches: this.generateContextSwitchData(days),
      workspaceUsage: this.generateWorkspaceUsageData(),
      productivityHeatmap: this.generateProductivityHeatmap(),
      techStack: this.generateTechStackData(),
      focusSessions: this.generateFocusSessionData(days),
      insights: this.generateInsights(),
      recentSwitches: this.generateRecentSwitches(),
      workspacePerformance: this.generateWorkspacePerformance()
    };
  }

  generateContextSwitchData(days) {
    const data = [];
    const labels = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
      
      // Simulate realistic context switch patterns (higher during work hours)
      const baseValue = Math.random() * 10 + 5;
      const workdayMultiplier = date.getDay() >= 1 && date.getDay() <= 5 ? 1.5 : 0.7;
      data.push(Math.round(baseValue * workdayMultiplier));
    }
    
    return { labels, data };
  }

  generateWorkspaceUsageData() {
    const workspaces = ['React Dashboard', 'API Backend', 'Mobile App', 'Documentation', 'DevOps Scripts', 'Research'];
    const data = workspaces.map(() => Math.random() * 100 + 20);
    const colors = ['#4285f4', '#34a853', '#ea4335', '#fbbc04', '#9c27b0', '#00bcd4'];
    
    return { labels: workspaces, data, colors };
  }

  generateProductivityHeatmap() {
    const heatmapData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    days.forEach((day, dayIndex) => {
      for (let hour = 0; hour < 24; hour++) {
        const isWorkHour = hour >= 9 && hour <= 17;
        const isWeekday = dayIndex < 5;
        let intensity = 0;
        
        if (isWeekday && isWorkHour) {
          intensity = Math.random() * 0.6 + 0.4; // High productivity during work hours
        } else if (isWeekday && (hour >= 19 && hour <= 22)) {
          intensity = Math.random() * 0.4 + 0.1; // Some evening work
        } else {
          intensity = Math.random() * 0.2; // Low activity otherwise
        }
        
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

  generateTechStackData() {
    const techStacks = [
      { name: 'React', usage: 85, time: '34h 20m', color: '#61dafb' },
      { name: 'Node.js', usage: 72, time: '28h 45m', color: '#339933' },
      { name: 'TypeScript', usage: 68, time: '26h 15m', color: '#3178c6' },
      { name: 'Python', usage: 45, time: '18h 30m', color: '#3776ab' },
      { name: 'Docker', usage: 38, time: '15h 20m', color: '#2496ed' },
      { name: 'MongoDB', usage: 32, time: '12h 45m', color: '#47a248' }
    ];
    
    return techStacks.sort((a, b) => b.usage - a.usage);
  }

  generateFocusSessionData(days) {
    const data = [];
    const labels = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      
      // Simulate focus session durations (in minutes)
      const sessions = Math.floor(Math.random() * 4) + 1;
      const totalFocus = Array.from({ length: sessions }, () => Math.random() * 90 + 30)
        .reduce((sum, duration) => sum + duration, 0);
      
      data.push(Math.round(totalFocus));
    }
    
    return { labels, data };
  }

  generateInsights() {
    return [
      {
        type: 'tip',
        title: 'Peak Productivity Hours',
        content: 'Your most productive hours are between 10 AM and 2 PM. Consider scheduling important tasks during this time.',
        icon: 'lightbulb'
      },
      {
        type: 'warning',
        title: 'High Context Switching',
        content: 'You switched contexts 47 times this week, 12% more than last week. Try batching similar tasks together.',
        icon: 'alert-triangle'
      },
      {
        type: 'success',
        title: 'Improved Focus Time',
        content: 'Great job! Your focus time increased by 18% this week. Your longest session was 2h 45m.',
        icon: 'check-circle'
      },
      {
        type: 'tip',
        title: 'Workspace Organization',
        content: 'Consider merging your "API Backend" and "DevOps Scripts" workspaces as they share similar technologies.',
        icon: 'layers'
      }
    ];
  }

  generateRecentSwitches() {
    const workspaces = ['React Dashboard', 'API Backend', 'Mobile App', 'Documentation'];
    const switches = [];
    
    for (let i = 0; i < 10; i++) {
      const time = new Date();
      time.setMinutes(time.getMinutes() - (i * 15));
      
      switches.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        from: workspaces[Math.floor(Math.random() * workspaces.length)],
        to: workspaces[Math.floor(Math.random() * workspaces.length)],
        duration: `${Math.floor(Math.random() * 45) + 5}m`
      });
    }
    
    return switches;
  }

  generateWorkspacePerformance() {
    const workspaces = ['React Dashboard', 'API Backend', 'Mobile App', 'Documentation', 'DevOps Scripts'];
    
    return workspaces.map(name => ({
      name,
      sessions: Math.floor(Math.random() * 20) + 5,
      avgDuration: `${Math.floor(Math.random() * 60) + 30}m`,
      productivity: Math.floor(Math.random() * 30) + 70
    }));
  }

  renderDashboard() {
    this.renderSummaryCards();
    this.renderCharts();
    this.renderProductivityHeatmap();
    this.renderTechStackList();
    this.renderInsights();
    this.renderTables();
  }

  renderSummaryCards() {
    const { summary } = this.data;
    
    if (!summary) {
      console.error('Summary data is not available');
      return;
    }
    
    const productivityElement = document.getElementById('productivityScore');
    const contextSwitchesElement = document.getElementById('contextSwitches');
    const focusTimeElement = document.getElementById('focusTime');
    const activeWorkspacesElement = document.getElementById('activeWorkspaces');
    
    if (productivityElement) productivityElement.textContent = `${summary.productivityScore || 0}%`;
    if (contextSwitchesElement) contextSwitchesElement.textContent = summary.contextSwitches || 0;
    if (focusTimeElement) focusTimeElement.textContent = this.formatTime(summary.focusTime || 0);
    if (activeWorkspacesElement) activeWorkspacesElement.textContent = summary.activeWorkspaces || 0;
    
    // Update change indicators
    if (summary.changes) {
      this.updateChangeIndicator('productivityChange', summary.changes.productivity || 0, 'from last week');
      this.updateChangeIndicator('switchesChange', summary.changes.switches || 0, 'from last week');
      this.updateChangeIndicator('focusChange', summary.changes.focus || 0, 'from last week');
      this.updateChangeIndicator('workspacesChange', summary.changes.workspaces || 0, 'from last week');
    }
  }

  updateChangeIndicator(elementId, change, suffix) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const sign = change > 0 ? '+' : change < 0 ? '-' : '';
    const className = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
    
    element.textContent = change === 0 ? `Same ${suffix}` : `${sign}${Math.abs(change)}% ${suffix}`;
    element.className = `card-change ${className}`;
  }

  renderCharts() {
    this.renderContextSwitchesChart();
    this.renderWorkspaceUsageChart();
    this.renderFocusSessionsChart();
  }

  renderContextSwitchesChart() {
    const ctx = document.getElementById('contextSwitchesChart').getContext('2d');
    const { labels, data } = this.data.contextSwitches;
    
    this.charts.contextSwitches = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Context Switches',
          data,
          borderColor: '#4285f4',
          backgroundColor: 'rgba(66, 133, 244, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#e8eaed'
            }
          },
          x: {
            grid: {
              color: '#e8eaed'
            }
          }
        }
      }
    });
  }

  renderWorkspaceUsageChart() {
    const ctx = document.getElementById('workspaceUsageChart').getContext('2d');
    const { labels, data, colors } = this.data.workspaceUsage;
    
    this.charts.workspaceUsage = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          }
        }
      }
    });
  }

  renderFocusSessionsChart() {
    const ctx = document.getElementById('focusSessionsChart').getContext('2d');
    const { labels, data } = this.data.focusSessions;
    
    this.charts.focusSessions = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Focus Time (minutes)',
          data,
          backgroundColor: '#34a853',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#e8eaed'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  renderProductivityHeatmap() {
    const container = document.getElementById('productivityHeatmap');
    const heatmapData = this.data.productivityHeatmap;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Create heatmap grid
    container.innerHTML = '';
    
    // Add day labels
    const dayLabels = document.createElement('div');
    dayLabels.style.cssText = `
      display: grid;
      grid-template-columns: repeat(24, 1fr);
      gap: 2px;
      margin-bottom: 8px;
      font-size: 12px;
      color: #5f6368;
    `;
    
    for (let hour = 0; hour < 24; hour++) {
      const label = document.createElement('div');
      label.textContent = hour % 6 === 0 ? `${hour}:00` : '';
      label.style.textAlign = 'center';
      dayLabels.appendChild(label);
    }
    container.appendChild(dayLabels);
    
    // Create heatmap rows
    days.forEach((day, dayIndex) => {
      const row = document.createElement('div');
      row.style.cssText = `
        display: grid;
        grid-template-columns: repeat(24, 1fr);
        gap: 2px;
        margin-bottom: 2px;
      `;
      
      for (let hour = 0; hour < 24; hour++) {
        const cell = document.createElement('div');
        const dataPoint = heatmapData.find(d => d.day === dayIndex && d.hour === hour);
        const intensity = dataPoint ? dataPoint.intensity : 0;
        
        cell.className = 'heatmap-cell';
        cell.style.cssText = `
          aspect-ratio: 1;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: rgba(66, 133, 244, ${intensity});
        `;
        cell.title = dataPoint ? dataPoint.tooltip : '';
        
        row.appendChild(cell);
      }
      
      container.appendChild(row);
    });
    
    // Add legend
    const legend = document.createElement('div');
    legend.className = 'heatmap-legend';
    legend.innerHTML = `
      <span>Less</span>
      <div style="display: flex; gap: 2px;">
        <div style="width: 12px; height: 12px; background: rgba(66, 133, 244, 0.1); border-radius: 2px;"></div>
        <div style="width: 12px; height: 12px; background: rgba(66, 133, 244, 0.3); border-radius: 2px;"></div>
        <div style="width: 12px; height: 12px; background: rgba(66, 133, 244, 0.5); border-radius: 2px;"></div>
        <div style="width: 12px; height: 12px; background: rgba(66, 133, 244, 0.7); border-radius: 2px;"></div>
        <div style="width: 12px; height: 12px; background: rgba(66, 133, 244, 0.9); border-radius: 2px;"></div>
      </div>
      <span>More</span>
    `;
    container.appendChild(legend);
  }

  renderTechStackList() {
    const container = document.getElementById('techStackList');
    const techStack = this.data.techStack;
    
    container.innerHTML = techStack.map(tech => `
      <div class="tech-stack-item">
        <div class="tech-info">
          <div class="tech-icon" style="background-color: ${tech.color};">
            ${tech.name.charAt(0).toUpperCase()}
          </div>
          <div class="tech-details">
            <h4>${tech.name}</h4>
            <p>Used in development</p>
          </div>
        </div>
        <div class="tech-usage">
          <div class="usage-percentage">${tech.usage}%</div>
          <div class="usage-time">${tech.time}</div>
        </div>
      </div>
    `).join('');
  }

  renderInsights() {
    const container = document.getElementById('insightsGrid');
    const insights = this.data.insights;
    
    const iconMap = {
      'lightbulb': '<path d="m15,14c0,1.845 -1.355,3 -3,3s-3,-1.155 -3,-3c0,-1.845 1.355,-3 3,-3s3,1.155 3,3z"></path><path d="M9 18h6"></path><path d="M10 21h4"></path>',
      'alert-triangle': '<path d="m21.73,18l-8,-14a2,2 0 0,0 -3.46,0l-8,14A2,2 0 0,0 4,21H20A2,2 0 0,0 21.73,18Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
      'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22,4 12,14.01 9,11.01"></polyline>',
      'layers': '<polygon points="12,2 2,7 12,12 22,7 12,2"></polygon><polyline points="2,17 12,22 22,17"></polyline><polyline points="2,12 12,17 22,12"></polyline>'
    };
    
    container.innerHTML = insights.map(insight => `
      <div class="insight-card ${insight.type}">
        <div class="insight-header">
          <div class="insight-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${iconMap[insight.icon] || iconMap['lightbulb']}
            </svg>
          </div>
          <div class="insight-content">
            <h3>${insight.title}</h3>
          </div>
        </div>
        <p>${insight.content}</p>
      </div>
    `).join('');
  }

  renderTables() {
    this.renderRecentSwitchesTable();
    this.renderWorkspacePerformanceTable();
  }

  renderRecentSwitchesTable() {
    const tbody = document.querySelector('#contextSwitchesTable tbody');
    const switches = this.data.recentSwitches;
    
    tbody.innerHTML = switches.map(sw => `
      <tr>
        <td>${sw.time}</td>
        <td>${sw.from}</td>
        <td>${sw.to}</td>
        <td>${sw.duration}</td>
      </tr>
    `).join('');
  }

  renderWorkspacePerformanceTable() {
    const tbody = document.querySelector('#workspacePerformanceTable tbody');
    const performance = this.data.workspacePerformance;
    
    tbody.innerHTML = performance.map(wp => `
      <tr>
        <td>${wp.name}</td>
        <td>${wp.sessions}</td>
        <td>${wp.avgDuration}</td>
        <td>
          <span style="color: ${wp.productivity >= 80 ? '#34a853' : wp.productivity >= 60 ? '#fbbc04' : '#ea4335'};">
            ${wp.productivity}%
          </span>
        </td>
      </tr>
    `).join('');
  }

  async refreshData() {
    this.showLoading();
    await this.loadData();
    this.renderDashboard();
    this.hideLoading();
  }

  exportData() {
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange: this.timeRange,
      data: this.data
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devcontext-analytics-${this.timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  formatTime(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
  }

  hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
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

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AnalyticsDashboard();
});
