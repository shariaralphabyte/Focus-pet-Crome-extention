# DevContext Pro - Intelligent Project Workspace Manager

A sophisticated Chrome extension designed for full-stack developers to automatically detect and manage development contexts across browser sessions, creating intelligent workspaces that group related tabs, preserve state, and reduce context-switching overhead.

## 🚀 Key Features

### Smart Tab Grouping
- **Automatic Detection**: Analyzes DOM content, URL patterns, and Git repositories to identify project contexts
- **Intelligent Grouping**: Groups related tabs into project-based workspaces with color-coded organization
- **Technology Stack Recognition**: Detects React, Vue, Angular, Node.js, Python, and 20+ other technologies

### Project Session Persistence
- **Auto-Save**: Automatically saves workspace sessions to IndexedDB/chrome.storage.local
- **Smart Restore**: Restores project sessions after browser restarts (within 24 hours)
- **Selective Recovery**: Only restores relevant tabs to avoid clutter

### Context Switching Analytics
- **Productivity Tracking**: Monitors context switches and calculates productivity impact
- **Visual Dashboard**: Interactive charts showing switching patterns and focus time
- **AI-Powered Insights**: Personalized recommendations to improve workflow efficiency

### Intelligent Bookmark Organization
- **Auto-Categorization**: Organizes bookmarks by project and technology stack
- **Smart Suggestions**: Recommends relevant bookmarks based on current workspace context
- **Workspace Association**: Links bookmarks to specific development projects

### Focus Mode Protection
- **Distraction Blocking**: Configurable website blocking during deep work sessions
- **Auto-Detection**: Automatically enables focus mode during extended coding sessions
- **Break Reminders**: Smart notifications for healthy work-break cycles

## 🛠 Technical Implementation

### Architecture
- **Manifest V3**: Modern Chrome extension architecture with service workers
- **Content Scripts**: Advanced DOM analysis for project context detection
- **Background Processing**: Persistent state management and inter-tab communication
- **Local Storage**: All data stored locally for privacy (no external servers)

### APIs Used
- `chrome.tabs` - Tab management and grouping
- `chrome.storage.local` - Persistent data storage
- `chrome.bookmarks` - Bookmark organization
- `chrome.declarativeNetRequest` - Focus mode blocking
- `chrome.notifications` - Break reminders and alerts

### Machine Learning Features
- **Pattern Recognition**: Learns from user behavior to improve project detection
- **Confidence Scoring**: Uses ML patterns stored in IndexedDB to refine accuracy
- **Adaptive Algorithms**: Continuously improves workspace suggestions

## 📦 Installation

### From Source (Developer Mode)
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon will appear in your toolbar

### Configuration
1. Click the extension icon to open the popup
2. Visit your development sites to automatically create workspaces
3. Access settings via the gear icon or right-click → Options
4. Customize focus mode, blocked sites, and analytics preferences

## 🎯 Usage Guide

### Automatic Workspace Creation
The extension automatically detects development contexts when you visit:
- GitHub/GitLab repositories
- Localhost development servers (ports 3000, 8080, 4200, etc.)
- Documentation sites (MDN, React docs, etc.)
- Package managers (npm, PyPI, etc.)

### Manual Workspace Management
- **Create Workspace**: Click the "+" button in the popup
- **Switch Workspaces**: Click any workspace in the list
- **Focus Mode**: Toggle the focus button for distraction-free coding
- **Analytics**: View detailed productivity metrics and insights

### Keyboard Shortcuts
- `Ctrl+Shift+W` - Quick workspace switcher (configurable)
- `Ctrl+Shift+F` - Toggle focus mode
- `Ctrl+Shift+A` - Open analytics dashboard

## ⚙️ Configuration Options

### General Settings
- Auto-detect projects (confidence threshold: 30-100%)
- Smart tab grouping
- Session persistence
- Context switch tracking
- Maximum tabs per workspace (5-50)

### Focus Mode
- Enable/disable distraction blocking
- Auto-detection of deep work sessions
- Custom focus session duration (15-240 minutes)
- Break reminder notifications
- Configurable blocked sites list

### Workspace Management
- Auto-merge similar workspaces
- Color themes (auto, blue, green, purple, random)
- Inactive workspace cleanup (0-90 days)
- Workspace switch notifications

### Analytics & Privacy
- Data collection toggle
- Retention period (30 days - forever)
- Export analytics data
- Clear all data option

## 📊 Analytics Dashboard

### Productivity Metrics
- **Productivity Score**: AI-calculated efficiency rating
- **Context Switches**: Daily/weekly switching frequency
- **Focus Time**: Deep work session tracking
- **Active Workspaces**: Project portfolio overview

### Visual Analytics
- Context switches over time (line chart)
- Workspace usage distribution (pie chart)
- Productivity heatmap (hourly/daily patterns)
- Technology stack usage analysis
- Focus session duration trends

### AI Insights
- Peak productivity hour recommendations
- Context switching pattern analysis
- Workspace organization suggestions
- Technology usage optimization tips

## 🔒 Privacy & Security

### Data Storage
- **100% Local**: All data stored locally in browser storage
- **No External Servers**: No data transmitted to external services
- **User Control**: Complete control over data retention and deletion
- **Export/Import**: Full data portability

### Permissions Explained
- `tabs` - Required for workspace management and tab grouping
- `tabGroups` - Enables visual tab organization
- `storage` - Local data persistence for workspaces and settings
- `bookmarks` - Intelligent bookmark organization
- `declarativeNetRequest` - Focus mode website blocking
- `notifications` - Break reminders and productivity alerts

## 🚧 Development

### Project Structure
```
DevContext Pro/
├── manifest.json              # Extension configuration
├── background/
│   ├── service-worker.js      # Core workspace management
│   └── bookmark-manager.js    # Intelligent bookmark organization
├── content/
│   └── project-detector.js    # DOM analysis and project detection
├── popup/
│   ├── popup.html            # Extension popup interface
│   ├── popup.css             # Popup styling
│   └── popup.js              # Popup functionality
├── options/
│   ├── options.html          # Settings page
│   ├── options.css           # Settings styling
│   └── options.js            # Settings management
├── analytics/
│   ├── analytics.html        # Analytics dashboard
│   ├── analytics.css         # Dashboard styling
│   └── analytics.js          # Charts and insights
└── icons/                    # Extension icons
```

### Building from Source
1. Ensure all dependencies are in place
2. Test in Chrome developer mode
3. Use Chrome DevTools for debugging
4. Check console for any errors or warnings

### Contributing
1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues
- **Workspaces not detected**: Check confidence threshold in settings
- **Tabs not grouping**: Ensure smart grouping is enabled
- **Focus mode not working**: Verify declarativeNetRequest permission
- **Analytics not loading**: Check if data collection is enabled

### Debug Mode
Enable debug mode in Advanced Settings to see detailed logging in Chrome DevTools console.

### Reset Extension
If experiencing issues, use "Clear All Data" in Analytics & Privacy settings to reset the extension to defaults.

## 📈 Roadmap

### Planned Features
- **Team Collaboration**: Share workspaces with team members
- **Cloud Sync**: Optional cloud backup for workspace data
- **IDE Integration**: VS Code and JetBrains plugin support
- **Advanced ML**: Enhanced project detection algorithms
- **Mobile Companion**: React Native app for workspace monitoring

### Version History
- **v1.0.0**: Initial release with core workspace management
- **v1.1.0**: Analytics dashboard and focus mode
- **v1.2.0**: Intelligent bookmark organization
- **v1.3.0**: Advanced ML pattern recognition (planned)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support, feature requests, or bug reports:
- Create an issue on GitHub
- Email: support@devcontextpro.com
- Documentation: https://docs.devcontextpro.com

## 🙏 Acknowledgments

- Chrome Extension API documentation
- Chart.js for analytics visualizations
- The developer community for feedback and testing

---

**DevContext Pro** - Transforming how developers manage their digital workspace, one context at a time.
