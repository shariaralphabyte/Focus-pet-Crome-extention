// Background Service Worker for FocusPet Extension
class FocusPetBackground {
    constructor() {
        this.timerInterval = null;
        this.currentTimer = null;
        this.distractingSites = [
            'facebook.com',
            'instagram.com',
            'twitter.com',
            'x.com',
            'tiktok.com',
            'youtube.com',
            'reddit.com',
            'netflix.com',
            'twitch.tv',
            'discord.com',
            'snapchat.com',
            'pinterest.com',
            'linkedin.com',
            'amazon.com',
            'ebay.com',
            'shopping.google.com',
            'news.google.com',
            'cnn.com',
            'bbc.com',
            'buzzfeed.com'
        ];
        
        this.init();
    }

    init() {
        this.setupMessageListeners();
        this.setupTabListeners();
        this.setupAlarms();
        this.loadTimerState();
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.action) {
                case 'startTimer':
                    this.startTimer(message.duration);
                    break;
                case 'pauseTimer':
                    this.pauseTimer();
                    break;
                case 'resetTimer':
                    this.resetTimer();
                    break;
                case 'getTimerState':
                    sendResponse(this.currentTimer);
                    break;
            }
        });
    }

    setupTabListeners() {
        // Monitor tab changes for distraction detection
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.checkForDistraction(activeInfo.tabId);
        });

        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.url) {
                this.checkForDistraction(tabId);
            }
        });
    }

    setupAlarms() {
        // Set up periodic alarms for pet care reminders
        chrome.alarms.onAlarm.addListener((alarm) => {
            switch (alarm.name) {
                case 'petCareReminder':
                    this.sendPetCareReminder();
                    break;
                case 'focusReminder':
                    this.sendFocusReminder();
                    break;
            }
        });

        // Create recurring alarms
        chrome.alarms.create('petCareReminder', { 
            delayInMinutes: 60, 
            periodInMinutes: 60 
        });
        
        chrome.alarms.create('focusReminder', { 
            delayInMinutes: 30, 
            periodInMinutes: 30 
        });
    }

    async loadTimerState() {
        const result = await chrome.storage.local.get(['timerState']);
        if (result.timerState && result.timerState.isRunning && !result.timerState.isPaused) {
            // Resume timer if it was running
            this.currentTimer = result.timerState;
            this.startTimerInterval();
        }
    }

    startTimer(duration) {
        this.currentTimer = {
            isRunning: true,
            isPaused: false,
            timeLeft: duration,
            focusDuration: Math.ceil(duration / 60),
            startTime: Date.now()
        };

        this.startTimerInterval();
        this.saveTimerState();
        
        // Show motivational start notification
        const startMessages = [
            'Focus Session Started! 🎯 Your pet believes in you!',
            'Let\'s do this together! 🚀 Your pet is cheering for you!',
            'Focus mode activated! ⚡ Your pet is watching proudly!',
            'Time to shine! ✨ Your pet knows you can do it!'
        ];
        
        const randomMessage = startMessages[Math.floor(Math.random() * startMessages.length)];
        
        this.showNotification(
            'Focus Time! 🐾',
            randomMessage,
            'focus-start'
        );
    }

    pauseTimer() {
        if (this.currentTimer) {
            this.currentTimer.isPaused = true;
            this.clearTimerInterval();
            this.saveTimerState();
            
            this.showNotification(
                'Timer Paused ⏸️',
                'Take a quick break, but don\'t forget to resume!',
                'timer-pause'
            );
        }
    }

    resetTimer() {
        this.currentTimer = {
            isRunning: false,
            isPaused: false,
            timeLeft: 25 * 60,
            startTime: null
        };
        
        this.clearTimerInterval();
        this.saveTimerState();
    }

    startTimerInterval() {
        this.clearTimerInterval();
        
        this.timerInterval = setInterval(() => {
            if (this.currentTimer && this.currentTimer.isRunning && !this.currentTimer.isPaused) {
                this.currentTimer.timeLeft--;
                
                // Send tick to popup if open
                try {
                    chrome.runtime.sendMessage({
                        action: 'timerTick',
                        timeLeft: this.currentTimer.timeLeft
                    });
                } catch (error) {
                    // Popup might not be open, ignore error
                    console.log('Could not send timer tick:', error);
                }

                if (this.currentTimer.timeLeft <= 0) {
                    this.completeTimer();
                } else {
                    this.saveTimerState();
                }
            }
        }, 1000);
    }

    clearTimerInterval() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    completeTimer() {
        this.clearTimerInterval();
        
        // Professional completion notification with break suggestions
        const breakSuggestions = [
            'Time for a break! 🌸 Stretch your legs and move around.',
            'Great work! 💧 Don\'t forget to drink some water.',
            'Session complete! ☕ Grab a healthy snack or tea.',
            'Well done! 🚶 Take a short walk to refresh your mind.',
            'Amazing focus! 🧘 Try some deep breathing exercises.',
            'Fantastic! 🌅 Look out the window and rest your eyes.',
            'Excellent work! 🎵 Listen to your favorite song.',
            'Perfect! 📚 Step away from the screen for a few minutes.'
        ];
        
        const randomSuggestion = breakSuggestions[Math.floor(Math.random() * breakSuggestions.length)];
        
        this.showNotification(
            'Focus Session Complete! 🎉',
            randomSuggestion,
            'timer-complete'
        );

        // Show achievement notification
        setTimeout(() => {
            this.showNotification(
                'Your FocusPet is Happy! 🐾',
                'Your pet gained +25 XP and feels proud of you!',
                'pet-reward'
            );
        }, 2000);

        // Reset timer
        this.currentTimer.isRunning = false;
        this.currentTimer.timeLeft = this.currentTimer.focusDuration * 60 || 25 * 60;
        
        // Notify popup
        try {
            chrome.runtime.sendMessage({
                action: 'timerComplete'
            });
        } catch (error) {
            console.log('Could not send timer complete message:', error);
        }

        this.saveTimerState();
    }

    async saveTimerState() {
        if (this.currentTimer) {
            await chrome.storage.local.set({ timerState: this.currentTimer });
        }
    }

    async checkForDistraction(tabId) {
        // Only check during active focus sessions
        if (!this.currentTimer || !this.currentTimer.isRunning || this.currentTimer.isPaused) {
            return;
        }

        try {
            const tab = await chrome.tabs.get(tabId);
            if (!tab.url) return;

            const url = new URL(tab.url);
            const domain = url.hostname.toLowerCase();

            // Check if current site is distracting
            const isDistracting = this.distractingSites.some(site => 
                domain.includes(site) || domain === site
            );

            if (isDistracting) {
                this.handleDistraction(tab);
            }
        } catch (error) {
            // Tab might not exist or be accessible
            console.log('Error checking tab:', error);
        }
    }

    handleDistraction(tab) {
        // Enhanced distraction warnings
        const distractionMessages = [
            'Your FocusPet is getting sad! 😢 Come back to focus!',
            'Don\'t abandon your pet! 🥺 They\'re waiting for you!',
            'Your pet believes in you! 💪 Return to your task!',
            'Stay strong! 🎯 Your pet is counting on you!'
        ];
        
        const randomMessage = distractionMessages[Math.floor(Math.random() * distractionMessages.length)];
        
        // Show warning notification
        this.showNotification(
            'Stay Focused! 🚨',
            randomMessage,
            'distraction-warning'
        );

        // Notify popup about distraction
        chrome.runtime.sendMessage({
            action: 'distraction',
            site: tab.url
        }).catch(() => {
            // Popup might not be open, ignore error
        });

        // Optional: Show warning on the page itself
        this.injectDistractionWarning(tab.id);
    }

    async injectDistractionWarning(tabId) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: this.showDistractionOverlay
            });
        } catch (error) {
            // Might not have permission for this tab
            console.log('Could not inject warning:', error);
        }
    }

    // Function to be injected into distracting pages
    showDistractionOverlay() {
        // Remove existing overlay if present
        const existingOverlay = document.getElementById('focuspet-distraction-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'focuspet-distraction-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            font-family: Arial, sans-serif;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

        modal.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 20px;">😢</div>
            <h2 style="color: #333; margin-bottom: 16px;">Your FocusPet is Sad!</h2>
            <p style="color: #666; margin-bottom: 24px;">You're on a distracting site during your focus session. Your pet believes in you!</p>
            <button id="focuspet-return-btn" style="
                background: linear-gradient(135deg, #4ecdc4, #44a08d);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                margin-right: 12px;
            ">Return to Focus 🎯</button>
            <button id="focuspet-dismiss-btn" style="
                background: #e2e8f0;
                color: #64748b;
                border: none;
                padding: 12px 24px;
                border-radius: 12px;
                font-size: 16px;
                cursor: pointer;
            ">Dismiss</button>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Add event listeners
        document.getElementById('focuspet-return-btn').addEventListener('click', () => {
            window.close();
        });

        document.getElementById('focuspet-dismiss-btn').addEventListener('click', () => {
            overlay.remove();
        });

        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (document.getElementById('focuspet-distraction-overlay')) {
                overlay.remove();
            }
        }, 10000);
    }

    showNotification(title, message, notificationId) {
        chrome.notifications.create(notificationId, {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: title,
            message: message,
            priority: 1
        });

        // Auto-clear notification after 5 seconds
        setTimeout(() => {
            chrome.notifications.clear(notificationId);
        }, 5000);
    }

    async sendPetCareReminder() {
        const result = await chrome.storage.local.get(['petData']);
        if (!result.petData) return;

        const pet = result.petData;
        
        // Check if pet needs care with enhanced messages
        if (pet.hunger < 50) {
            const hungerMessages = [
                `${pet.name} is getting hungry! 🍖 Feed your pet to keep them happy!`,
                `Your pet needs nutrition! 🥗 Don't forget to feed ${pet.name}!`,
                `${pet.name} is looking for food! 🍽️ Time for a snack!`
            ];
            const randomMessage = hungerMessages[Math.floor(Math.random() * hungerMessages.length)];
            
            this.showNotification(
                'Pet Care Reminder! 🐾',
                randomMessage,
                'pet-hungry'
            );
        } else if (pet.happiness < 60) {
            const lonelyMessages = [
                `${pet.name} misses you! 💕 Come play together!`,
                `Your pet wants attention! 🎾 Time for some fun!`,
                `${pet.name} is feeling lonely! 🤗 Show them some love!`
            ];
            const randomMessage = lonelyMessages[Math.floor(Math.random() * lonelyMessages.length)];
            
            this.showNotification(
                'Your Pet Needs You! 💖',
                randomMessage,
                'pet-lonely'
            );
        }
    }

    async sendFocusReminder() {
        const result = await chrome.storage.local.get(['timerState']);
        if (!result.timerState || result.timerState.isRunning) return;

        const focusMessages = [
            'Your pet is ready for another focus session! 🎯',
            'Time to be productive together! 🚀 Your pet is waiting!',
            'Ready to crush some tasks? 💪 Your pet believes in you!',
            'Let\'s achieve great things! ⭐ Your pet is excited!'
        ];
        const randomMessage = focusMessages[Math.floor(Math.random() * focusMessages.length)];

        this.showNotification(
            'Focus Time! 🐾',
            randomMessage,
            'focus-reminder'
        );
    }
}

// Initialize background script
const focusPetBackground = new FocusPetBackground();
