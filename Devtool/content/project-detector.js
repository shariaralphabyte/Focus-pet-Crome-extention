// DevContext Pro - Content Script for Project Detection
// Advanced DOM analysis to detect development project context

class ProjectDetector {
  constructor() {
    this.projectInfo = {
      gitRepo: null,
      projectName: null,
      techStack: [],
      framework: null,
      packageManager: null,
      confidence: 0,
      urls: [],
      keywords: []
    };
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.analyzeProject());
    } else {
      this.analyzeProject();
    }
  }

  analyzeProject() {
    this.analyzeURL();
    this.analyzePageContent();
    this.analyzeMetaTags();
    this.analyzeScriptTags();
    this.analyzeGitHubRepo();
    this.analyzeLocalhost();
    this.analyzeDocumentationSites();
    this.analyzePackageFiles();
    
    // Send results to background script if confidence is high enough
    if (this.projectInfo.confidence > 0.3) {
      this.sendProjectInfo();
    }
  }

  analyzeURL() {
    const url = window.location.href;
    const hostname = window.location.hostname;
    
    // GitHub/GitLab repository detection
    const gitRepoMatch = url.match(/(?:github|gitlab)\.com\/([^\/]+\/[^\/]+)/);
    if (gitRepoMatch) {
      this.projectInfo.gitRepo = gitRepoMatch[1];
      this.projectInfo.projectName = gitRepoMatch[1].split('/')[1];
      this.projectInfo.confidence += 0.5;
    }

    // Localhost development servers
    const localhostMatch = url.match(/(?:localhost|127\.0\.0\.1):(\d+)/);
    if (localhostMatch) {
      const port = localhostMatch[1];
      this.projectInfo.projectName = this.detectProjectFromPort(port);
      this.projectInfo.confidence += 0.4;
    }

    // Development-related domains
    const devDomains = {
      'stackoverflow.com': 0.2,
      'github.com': 0.3,
      'gitlab.com': 0.3,
      'npmjs.com': 0.2,
      'pypi.org': 0.2,
      'packagist.org': 0.2,
      'rubygems.org': 0.2,
      'docs.python.org': 0.2,
      'developer.mozilla.org': 0.2,
      'reactjs.org': 0.3,
      'vuejs.org': 0.3,
      'angular.io': 0.3,
      'nodejs.org': 0.3
    };

    if (devDomains[hostname]) {
      this.projectInfo.confidence += devDomains[hostname];
    }
  }

  analyzePageContent() {
    const title = document.title.toLowerCase();
    const bodyText = document.body ? document.body.innerText.toLowerCase() : '';
    
    // Technology stack detection from content
    const techPatterns = {
      'react': /react|jsx|create-react-app/gi,
      'vue': /vue\.?js|nuxt/gi,
      'angular': /angular|ng-|@angular/gi,
      'node': /node\.?js|npm|yarn/gi,
      'python': /python|django|flask|pip/gi,
      'javascript': /javascript|js|typescript|ts/gi,
      'php': /php|laravel|symfony|composer/gi,
      'ruby': /ruby|rails|gem|bundler/gi,
      'java': /java|spring|maven|gradle/gi,
      'go': /golang|go\s/gi,
      'rust': /rust|cargo/gi,
      'docker': /docker|dockerfile|container/gi,
      'kubernetes': /kubernetes|k8s|kubectl/gi
    };

    Object.entries(techPatterns).forEach(([tech, pattern]) => {
      if (pattern.test(title) || pattern.test(bodyText)) {
        this.projectInfo.techStack.push(tech);
        this.projectInfo.confidence += 0.1;
      }
    });
  }

  analyzeMetaTags() {
    const metaTags = document.querySelectorAll('meta');
    
    metaTags.forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      
      if (name && content) {
        // Check for generator meta tags
        if (name.toLowerCase() === 'generator') {
          this.detectFrameworkFromGenerator(content);
        }
        
        // Check for application name
        if (name.toLowerCase() === 'application-name' || name === 'og:site_name') {
          this.projectInfo.projectName = content;
          this.projectInfo.confidence += 0.2;
        }
      }
    });
  }

  analyzeScriptTags() {
    const scripts = document.querySelectorAll('script[src]');
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      
      // Detect frameworks from CDN URLs
      const frameworkPatterns = {
        'react': /react|reactdom/i,
        'vue': /vue\.js|vue\.min\.js/i,
        'angular': /angular\.js|angular\.min\.js/i,
        'jquery': /jquery/i,
        'bootstrap': /bootstrap/i,
        'lodash': /lodash/i,
        'moment': /moment\.js/i
      };

      Object.entries(frameworkPatterns).forEach(([framework, pattern]) => {
        if (pattern.test(src)) {
          this.projectInfo.techStack.push(framework);
          this.projectInfo.confidence += 0.05;
        }
      });
    });
  }

  analyzeGitHubRepo() {
    if (!window.location.hostname.includes('github.com')) return;

    // Extract repository information from GitHub
    const repoMatch = window.location.pathname.match(/^\/([^\/]+\/[^\/]+)/);
    if (repoMatch) {
      this.projectInfo.gitRepo = repoMatch[1];
      this.projectInfo.projectName = repoMatch[1].split('/')[1];
      
      // Look for language indicators
      const languageElements = document.querySelectorAll('[data-ga-click*="language"]');
      languageElements.forEach(el => {
        const lang = el.textContent.trim().toLowerCase();
        if (lang && !this.projectInfo.techStack.includes(lang)) {
          this.projectInfo.techStack.push(lang);
        }
      });

      // Check for package.json, requirements.txt, etc.
      this.detectProjectFiles();
      
      this.projectInfo.confidence += 0.4;
    }
  }

  analyzeLocalhost() {
    if (!window.location.hostname.match(/localhost|127\.0\.0\.1/)) return;

    const port = window.location.port;
    
    // Common development server ports
    const portMappings = {
      '3000': 'react/node',
      '3001': 'react/node',
      '8080': 'vue/webpack',
      '4200': 'angular',
      '8000': 'django/python',
      '5000': 'flask/python',
      '9000': 'php',
      '4000': 'jekyll/ruby',
      '1313': 'hugo/go'
    };

    if (portMappings[port]) {
      const [framework, language] = portMappings[port].split('/');
      this.projectInfo.framework = framework;
      if (language && !this.projectInfo.techStack.includes(language)) {
        this.projectInfo.techStack.push(language);
      }
      this.projectInfo.confidence += 0.3;
    }

    // Try to detect from page content on localhost
    this.detectLocalProjectFromContent();
  }

  analyzeDocumentationSites() {
    const docPatterns = {
      'reactjs.org': 'react',
      'vuejs.org': 'vue',
      'angular.io': 'angular',
      'nodejs.org': 'node',
      'docs.python.org': 'python',
      'php.net': 'php',
      'rubyonrails.org': 'ruby'
    };

    const hostname = window.location.hostname;
    if (docPatterns[hostname]) {
      this.projectInfo.techStack.push(docPatterns[hostname]);
      this.projectInfo.confidence += 0.2;
    }
  }

  analyzePackageFiles() {
    // Check if we're viewing package files
    const url = window.location.href;
    const packageFiles = {
      'package.json': 'node',
      'requirements.txt': 'python',
      'Gemfile': 'ruby',
      'composer.json': 'php',
      'pom.xml': 'java',
      'Cargo.toml': 'rust',
      'go.mod': 'go'
    };

    Object.entries(packageFiles).forEach(([file, tech]) => {
      if (url.includes(file)) {
        this.projectInfo.techStack.push(tech);
        this.projectInfo.confidence += 0.3;
        
        // Try to extract project name from package file content
        this.extractProjectNameFromPackageFile(file);
      }
    });
  }

  detectProjectFiles() {
    // Look for common project files in the file tree (GitHub)
    const fileLinks = document.querySelectorAll('a[href*="blob/"], a[href*="tree/"]');
    
    fileLinks.forEach(link => {
      const href = link.getAttribute('href');
      const fileName = href.split('/').pop();
      
      const projectIndicators = {
        'package.json': 'node',
        'requirements.txt': 'python',
        'Dockerfile': 'docker',
        'docker-compose.yml': 'docker',
        '.gitignore': 'git',
        'README.md': 'documentation'
      };

      if (projectIndicators[fileName]) {
        const tech = projectIndicators[fileName];
        if (!this.projectInfo.techStack.includes(tech)) {
          this.projectInfo.techStack.push(tech);
        }
        this.projectInfo.confidence += 0.1;
      }
    });
  }

  detectProjectFromPort(port) {
    const commonPorts = {
      '3000': 'React App',
      '3001': 'React App (Alt)',
      '8080': 'Vue/Webpack Dev Server',
      '4200': 'Angular App',
      '8000': 'Django App',
      '5000': 'Flask App',
      '9000': 'PHP App',
      '4000': 'Jekyll Site',
      '1313': 'Hugo Site'
    };

    return commonPorts[port] || `Local App (${port})`;
  }

  detectFrameworkFromGenerator(generator) {
    const frameworks = {
      'gatsby': 'gatsby',
      'next.js': 'nextjs',
      'nuxt': 'nuxt',
      'jekyll': 'jekyll',
      'hugo': 'hugo',
      'wordpress': 'wordpress'
    };

    const lowerGenerator = generator.toLowerCase();
    Object.entries(frameworks).forEach(([key, framework]) => {
      if (lowerGenerator.includes(key)) {
        this.projectInfo.framework = framework;
        this.projectInfo.confidence += 0.2;
      }
    });
  }

  detectLocalProjectFromContent() {
    // Look for webpack dev server indicators
    if (document.querySelector('script[src*="webpack"]') || 
        document.querySelector('script[src*="hot-update"]')) {
      this.projectInfo.techStack.push('webpack');
      this.projectInfo.confidence += 0.2;
    }

    // Look for React dev tools
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      this.projectInfo.techStack.push('react');
      this.projectInfo.confidence += 0.3;
    }

    // Look for Vue dev tools
    if (window.__VUE__) {
      this.projectInfo.techStack.push('vue');
      this.projectInfo.confidence += 0.3;
    }
  }

  extractProjectNameFromPackageFile(fileName) {
    // This would require additional API calls to fetch file content
    // For now, we'll use URL patterns to infer project name
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 2) {
      this.projectInfo.projectName = pathParts[2];
    }
  }

  sendProjectInfo() {
    // Send the detected project information to the background script
    chrome.runtime.sendMessage({
      action: 'projectDetected',
      projectInfo: this.projectInfo,
      url: window.location.href,
      timestamp: Date.now()
    });
  }

  // Public method to get current project info
  getProjectInfo() {
    return this.projectInfo;
  }
}

// Initialize the project detector
const projectDetector = new ProjectDetector();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProjectInfo') {
    sendResponse(projectDetector.getProjectInfo());
  }
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectDetector;
}
