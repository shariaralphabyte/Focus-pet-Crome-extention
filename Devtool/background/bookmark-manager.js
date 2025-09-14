// DevContext Pro - Intelligent Bookmark Organization

class BookmarkManager {
  constructor() {
    this.workspaceBookmarks = new Map();
    this.techStackPatterns = {
      'react': ['react', 'jsx', 'create-react-app', 'next.js', 'gatsby'],
      'vue': ['vue', 'nuxt', 'vuejs'],
      'angular': ['angular', 'ng-', '@angular'],
      'node': ['node.js', 'nodejs', 'npm', 'yarn'],
      'python': ['python', 'django', 'flask', 'pip', 'conda'],
      'javascript': ['javascript', 'js', 'typescript', 'ts'],
      'php': ['php', 'laravel', 'symfony', 'composer'],
      'ruby': ['ruby', 'rails', 'gem', 'bundler'],
      'java': ['java', 'spring', 'maven', 'gradle'],
      'go': ['golang', 'go'],
      'rust': ['rust', 'cargo'],
      'docker': ['docker', 'dockerfile', 'container'],
      'kubernetes': ['kubernetes', 'k8s', 'kubectl']
    };
    this.init();
  }

  async init() {
    await this.loadWorkspaceBookmarks();
    this.setupBookmarkListeners();
  }

  async loadWorkspaceBookmarks() {
    const stored = await chrome.storage.local.get(['workspaceBookmarks']);
    if (stored.workspaceBookmarks) {
      this.workspaceBookmarks = new Map(Object.entries(stored.workspaceBookmarks));
    }
  }

  setupBookmarkListeners() {
    // Listen for bookmark creation
    chrome.bookmarks.onCreated.addListener((id, bookmark) => {
      this.categorizeBookmark(bookmark);
    });

    // Listen for bookmark changes
    chrome.bookmarks.onChanged.addListener((id, changeInfo) => {
      chrome.bookmarks.get(id).then(bookmarks => {
        if (bookmarks[0]) {
          this.categorizeBookmark(bookmarks[0]);
        }
      });
    });
  }

  async categorizeBookmark(bookmark) {
    if (!bookmark.url) return;

    const category = this.detectBookmarkCategory(bookmark);
    if (category) {
      await this.organizeBookmarkByCategory(bookmark, category);
    }
  }

  detectBookmarkCategory(bookmark) {
    const url = bookmark.url.toLowerCase();
    const title = bookmark.title.toLowerCase();
    const content = `${url} ${title}`;

    // Check for development-related patterns
    for (const [tech, patterns] of Object.entries(this.techStackPatterns)) {
      for (const pattern of patterns) {
        if (content.includes(pattern)) {
          return {
            type: 'technology',
            tech: tech,
            confidence: this.calculateConfidence(content, pattern)
          };
        }
      }
    }

    // Check for common development domains
    const devDomains = {
      'github.com': { type: 'repository', tech: 'git' },
      'gitlab.com': { type: 'repository', tech: 'git' },
      'stackoverflow.com': { type: 'documentation', tech: 'general' },
      'developer.mozilla.org': { type: 'documentation', tech: 'web' },
      'npmjs.com': { type: 'package', tech: 'node' },
      'pypi.org': { type: 'package', tech: 'python' },
      'packagist.org': { type: 'package', tech: 'php' },
      'rubygems.org': { type: 'package', tech: 'ruby' }
    };

    for (const [domain, info] of Object.entries(devDomains)) {
      if (url.includes(domain)) {
        return {
          ...info,
          confidence: 0.8
        };
      }
    }

    return null;
  }

  calculateConfidence(content, pattern) {
    const matches = (content.match(new RegExp(pattern, 'gi')) || []).length;
    const baseConfidence = Math.min(matches * 0.3, 0.9);
    return baseConfidence;
  }

  async organizeBookmarkByCategory(bookmark, category) {
    try {
      const settings = await chrome.storage.local.get(['settings']);
      if (!settings.settings?.smartBookmarkOrganization) {
        return;
      }

      // Find or create appropriate folder
      const folderId = await this.findOrCreateCategoryFolder(category);
      
      // Move bookmark to appropriate folder
      await chrome.bookmarks.move(bookmark.id, { parentId: folderId });
      
      // Associate with workspace if applicable
      await this.associateWithWorkspace(bookmark, category);
      
    } catch (error) {
      console.log('Error organizing bookmark:', error);
    }
  }

  async findOrCreateCategoryFolder(category) {
    const folderName = this.getCategoryFolderName(category);
    
    // Look for existing folder
    const bookmarkTree = await chrome.bookmarks.getTree();
    const existingFolder = this.findFolderByName(bookmarkTree, folderName);
    
    if (existingFolder) {
      return existingFolder.id;
    }

    // Create new folder in bookmarks bar
    const bookmarkBar = bookmarkTree[0].children.find(child => child.id === '1') || bookmarkTree[0].children[0];
    const newFolder = await chrome.bookmarks.create({
      parentId: bookmarkBar.id,
      title: folderName
    });

    return newFolder.id;
  }

  getCategoryFolderName(category) {
    switch (category.type) {
      case 'technology':
        return `Dev - ${category.tech.charAt(0).toUpperCase() + category.tech.slice(1)}`;
      case 'repository':
        return 'Dev - Repositories';
      case 'documentation':
        return 'Dev - Documentation';
      case 'package':
        return 'Dev - Packages';
      default:
        return 'Dev - General';
    }
  }

  findFolderByName(bookmarkTree, name) {
    for (const node of bookmarkTree) {
      if (node.title === name && !node.url) {
        return node;
      }
      if (node.children) {
        const found = this.findFolderByName(node.children, name);
        if (found) return found;
      }
    }
    return null;
  }

  async associateWithWorkspace(bookmark, category) {
    // Get current workspaces
    const workspaces = await chrome.runtime.sendMessage({ action: 'getWorkspaces' });
    
    // Find matching workspace based on technology stack
    const matchingWorkspace = workspaces.find(workspace => 
      workspace.techStack.includes(category.tech)
    );

    if (matchingWorkspace) {
      // Associate bookmark with workspace
      let workspaceBookmarks = this.workspaceBookmarks.get(matchingWorkspace.id) || [];
      workspaceBookmarks.push({
        id: bookmark.id,
        url: bookmark.url,
        title: bookmark.title,
        category: category,
        timestamp: Date.now()
      });
      
      this.workspaceBookmarks.set(matchingWorkspace.id, workspaceBookmarks);
      await this.saveWorkspaceBookmarks();
    }
  }

  async saveWorkspaceBookmarks() {
    const bookmarksObj = Object.fromEntries(this.workspaceBookmarks);
    await chrome.storage.local.set({ workspaceBookmarks: bookmarksObj });
  }

  async getWorkspaceBookmarks(workspaceId) {
    return this.workspaceBookmarks.get(workspaceId) || [];
  }

  async suggestBookmarksForWorkspace(workspaceId, techStack) {
    const suggestions = [];
    
    // Get all bookmarks
    const bookmarkTree = await chrome.bookmarks.getTree();
    const allBookmarks = this.flattenBookmarkTree(bookmarkTree);
    
    // Find relevant bookmarks based on tech stack
    for (const bookmark of allBookmarks) {
      if (!bookmark.url) continue;
      
      const category = this.detectBookmarkCategory(bookmark);
      if (category && techStack.includes(category.tech)) {
        suggestions.push({
          ...bookmark,
          category: category,
          relevanceScore: category.confidence
        });
      }
    }

    // Sort by relevance
    suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return suggestions.slice(0, 10); // Return top 10 suggestions
  }

  flattenBookmarkTree(bookmarkTree) {
    const bookmarks = [];
    
    function traverse(nodes) {
      for (const node of nodes) {
        if (node.url) {
          bookmarks.push(node);
        }
        if (node.children) {
          traverse(node.children);
        }
      }
    }
    
    traverse(bookmarkTree);
    return bookmarks;
  }

  async exportWorkspaceBookmarks(workspaceId) {
    const bookmarks = await this.getWorkspaceBookmarks(workspaceId);
    return {
      workspaceId,
      bookmarks,
      exportDate: new Date().toISOString()
    };
  }

  async importWorkspaceBookmarks(workspaceId, bookmarksData) {
    const existingBookmarks = this.workspaceBookmarks.get(workspaceId) || [];
    const mergedBookmarks = [...existingBookmarks, ...bookmarksData.bookmarks];
    
    // Remove duplicates based on URL
    const uniqueBookmarks = mergedBookmarks.filter((bookmark, index, self) =>
      index === self.findIndex(b => b.url === bookmark.url)
    );
    
    this.workspaceBookmarks.set(workspaceId, uniqueBookmarks);
    await this.saveWorkspaceBookmarks();
  }
}

// Export for use in service worker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BookmarkManager;
}
