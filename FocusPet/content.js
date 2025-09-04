// Content Script for FocusPet - Enhanced Distraction Detection
class FocusPetContent {
    constructor() {
        this.isDistracting = false;
        this.focusSessionActive = false;
        this.init();
    }

    init() {
        this.checkIfDistracting();
        this.setupMessageListener();
        this.monitorUserActivity();
    }

    checkIfDistracting() {
        const distractingSites = [
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
            'amazon.com',
            'ebay.com',
            'shopping.google.com',
            'news.google.com',
            'cnn.com',
            'bbc.com',
            'buzzfeed.com',
            'linkedin.com',
            'medium.com',
            'quora.com',
            'stackoverflow.com'
        ];

        const currentDomain = window.location.hostname.toLowerCase();
        this.isDistracting = distractingSites.some(site => 
            currentDomain.includes(site) || currentDomain === site
        );
        
        console.log('FocusPet: Checking distraction for', currentDomain, '- Distracting:', this.isDistracting);
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'focusSessionStarted') {
                this.focusSessionActive = true;
                if (this.isDistracting) {
                    this.showDistractionWarning();
                }
            } else if (message.action === 'focusSessionEnded') {
                this.focusSessionActive = false;
                this.hideDistractionWarning();
            }
        });
    }

    monitorUserActivity() {
        if (!this.isDistracting) return;

        // Monitor scrolling and clicking on distracting sites
        let activityTimeout;
        const reportActivity = () => {
            if (this.focusSessionActive) {
                chrome.runtime.sendMessage({
                    action: 'distractionActivity',
                    site: window.location.hostname,
                    timestamp: Date.now()
                });
            }
        };

        ['scroll', 'click', 'keydown'].forEach(event => {
            document.addEventListener(event, () => {
                clearTimeout(activityTimeout);
                activityTimeout = setTimeout(reportActivity, 1000);
            }, { passive: true });
        });
    }

    showDistractionWarning() {
        // Remove existing warning
        this.hideDistractionWarning();

        // Create floating warning
        const warning = document.createElement('div');
        warning.id = 'focuspet-floating-warning';
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
            color: white;
            padding: 16px 20px;
            border-radius: 16px;
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
            z-index: 999999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            max-width: 280px;
            animation: slideInRight 0.3s ease-out;
            cursor: pointer;
            user-select: none;
        `;

        warning.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 24px;">😢</div>
                <div>
                    <div style="font-size: 16px; margin-bottom: 4px;">FocusPet Alert!</div>
                    <div style="font-size: 12px; opacity: 0.9;">Your pet is getting sad. Return to focus?</div>
                </div>
                <div style="font-size: 18px; opacity: 0.7;">✕</div>
            </div>
        `;

        // Add click to dismiss
        warning.addEventListener('click', () => {
            this.hideDistractionWarning();
        });

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(warning);

        // Auto-hide after 8 seconds
        setTimeout(() => {
            this.hideDistractionWarning();
        }, 8000);
    }

    hideDistractionWarning() {
        const warning = document.getElementById('focuspet-floating-warning');
        if (warning) {
            warning.remove();
        }
    }
}

// Initialize content script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FocusPetContent();
    });
} else {
    new FocusPetContent();
}
