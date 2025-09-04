# 🚀 FocusPet Installation Guide

## Quick Start (5 minutes)

### Step 1: Download FocusPet
- Download the FocusPet folder to your computer
- Make sure all files are in the same directory

### Step 2: Enable Developer Mode
1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Toggle **"Developer mode"** ON (top right corner)

### Step 3: Load the Extension
1. Click **"Load unpacked"** button
2. Select the `FocusPet` folder
3. Click **"Select Folder"**

### Step 4: Start Using FocusPet! 🎉
- Look for the FocusPet icon in your Chrome toolbar
- Click it to meet your new pet companion
- Set your first focus timer and start being productive!

## Detailed Installation

### Prerequisites
- Google Chrome browser (version 88+)
- Basic computer file management skills

### File Structure
Make sure your FocusPet folder contains these files:
```
FocusPet/
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── background.js
├── content.js
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── README.md
└── INSTALL.md
```

### Troubleshooting

#### Extension Won't Load
- **Check file structure**: Ensure `manifest.json` is in the root folder
- **Refresh extensions page**: Press F5 on `chrome://extensions/`
- **Check Chrome version**: Update Chrome if it's outdated

#### No Icon in Toolbar
- **Pin the extension**: Click the puzzle piece icon → pin FocusPet
- **Check extension list**: Make sure FocusPet is enabled
- **Restart Chrome**: Close and reopen the browser

#### Notifications Not Working
1. Go to Chrome Settings → Privacy and Security → Site Settings
2. Click "Notifications"
3. Make sure notifications are allowed
4. Add `chrome-extension://` to allowed sites if needed

#### Timer Not Starting
- **Check permissions**: Extension needs storage and alarms permissions
- **Disable other timers**: Other timer extensions might conflict
- **Clear extension data**: Remove and reinstall if needed

### Permissions Explained

FocusPet requests these permissions for functionality:

- **Storage**: Save your pet's data and progress locally
- **Notifications**: Show focus reminders and achievements
- **Active Tab**: Detect when you visit distracting websites
- **Tabs**: Monitor tab changes for distraction warnings
- **Alarms**: Schedule pet care reminders

**Privacy Note**: All data stays on your device. No information is sent to external servers.

### First Time Setup

1. **Meet Your Pet**: Click the extension icon to see your new companion
2. **Choose Timer**: Start with 25 minutes (Pomodoro technique)
3. **Complete First Session**: Stay focused and avoid distracting sites
4. **Care for Pet**: Feed and play with your pet after the session
5. **Watch Growth**: Your pet gains XP and evolves as you focus!

### Uninstalling

To remove FocusPet:
1. Go to `chrome://extensions/`
2. Find FocusPet in the list
3. Click "Remove"
4. Confirm removal

**Note**: This will delete all your pet's progress and data.

### Getting Help

If you encounter issues:
1. Check this troubleshooting guide first
2. Restart Chrome and try again
3. Report bugs on our GitHub page
4. Contact support via email

---

**Ready to boost your productivity with FocusPet? Let's go! 🐾**
