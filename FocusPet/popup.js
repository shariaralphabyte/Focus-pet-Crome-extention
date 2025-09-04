// Pet System and UI Controller
class FocusPetUI {
    constructor() {
        this.petData = null;
        this.timerState = null;
        this.speechTimeout = null;
        this.progressRingCircumference = 339.292; // 2 * π * 54
        this.petDialogues = {
            welcome: ["Ready to focus together? 🐾", "Let's crush this task! 💪", "I believe in you! ✨"],
            starting: ["Here we go! 🚀", "Focus mode activated! 🎯", "Let's do this together! 🌟"],
            focusing: ["You're doing great! 👏", "Stay strong! 💪", "I'm cheering for you! 📣", "Keep it up! ⭐"],
            completed: ["Amazing work! 🎉", "We did it! 🥳", "You're incredible! 🌟", "Time for a reward! 🎁"],
            distracted: ["Hey, come back! 😢", "I miss you! 💔", "Let's focus together! 🥺", "Don't leave me alone! 😿"],
            break: ["Time for a break! 🌸", "Stretch those legs! 🚶", "Drink some water! 💧", "You earned this! ☕"],
            feeding: ["Yummy! 😋", "Thank you! 💕", "So delicious! 🤤", "I feel energized! ⚡"],
            playing: ["This is fun! 🎾", "I love playing! 🎉", "More games! 🎮", "Best human ever! 💖"],
            petting: ["That feels nice! 😊", "I love cuddles! 🤗", "More pets please! 💕", "You're the best! ❤️"]
        };
        this.accessories = {
            hats: ["🎩", "👑", "🧢", "🎓", "🪖"],
            glasses: ["🕶️", "👓", "🥽"],
            other: ["🎀", "🌸", "⭐", "💎", "🔥"]
        };
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.updateUI();
        this.startUIUpdates();
    }

    async loadData() {
        const result = await chrome.storage.local.get(['petData', 'timerState']);
        
        // Initialize pet data if not exists
        this.petData = result.petData || {
            name: 'Whiskers',
            type: 'cat',
            level: 1,
            xp: 0,
            xpToNext: 100,
            happiness: 100,
            hunger: 80,
            mood: 'happy',
            stage: 'kitten',
            unlockedSkins: ['default'],
            currentSkin: 'default',
            streak: 0,
            totalFocusTime: 0,
            achievements: ['Welcome to FocusPet!'],
            lastFed: Date.now(),
            lastPlayed: Date.now()
        };

        this.timerState = result.timerState || {
            isRunning: false,
            isPaused: false,
            timeLeft: 25 * 60, // 25 minutes in seconds
            focusDuration: 25,
            breakDuration: 5,
            isBreak: false,
            sessionsCompleted: 0
        };

        // Initialize pet data with missing fields
        if (!this.petData.currentAccessory) this.petData.currentAccessory = null;
        if (!this.petData.unlockedAccessories) this.petData.unlockedAccessories = [];

        await this.saveData();
    }

    async saveData() {
        await chrome.storage.local.set({
            petData: this.petData,
            timerState: this.timerState
        });
    }

    setupEventListeners() {
        // Timer controls
        document.getElementById('start-timer').addEventListener('click', () => this.startTimer());
        document.getElementById('pause-timer').addEventListener('click', () => this.pauseTimer());
        document.getElementById('reset-timer').addEventListener('click', () => this.resetTimer());
        
        // Custom timer input
        document.getElementById('custom-minutes').addEventListener('input', (e) => this.updateCustomTimer(e.target.value));
        
        // Quick select buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const minutes = parseInt(e.target.dataset.minutes);
                this.setTimerDuration(minutes);
            });
        });

        // Pet actions
        document.getElementById('feed-pet').addEventListener('click', () => this.feedPet());
        document.getElementById('play-pet').addEventListener('click', () => this.playWithPet());
        document.getElementById('pet-pet').addEventListener('click', () => this.petPet());

        // Pet sprite click for interaction
        document.getElementById('pet-sprite').addEventListener('click', () => this.interactWithPet());

        // Share functionality
        document.getElementById('share-progress').addEventListener('click', () => this.shareProgress());
    }

    updateUI() {
        this.updatePetDisplay();
        this.updateStats();
        this.updateTimer();
        this.updateAchievements();
        this.updateStreak();
    }

    updatePetDisplay() {
        const petEmoji = document.getElementById('pet-emoji');
        const petMood = document.getElementById('pet-mood');
        const petName = document.getElementById('pet-name');
        const petAccessories = document.getElementById('pet-accessories');

        // Pet evolution based on level
        const petStages = {
            cat: { 1: '🐱', 5: '🐈', 10: '🦁' },
            dog: { 1: '🐶', 5: '🐕', 10: '🐺' },
            dragon: { 1: '🐣', 5: '🐉', 10: '🐲' }
        };

        let petIcon = '🐱';
        if (this.petData.level >= 10) petIcon = petStages[this.petData.type][10];
        else if (this.petData.level >= 5) petIcon = petStages[this.petData.type][5];
        else petIcon = petStages[this.petData.type][1];

        petEmoji.textContent = petIcon;
        petName.textContent = this.petData.name;

        // Mood based on happiness and hunger
        let moodIcon = '😊';
        if (this.petData.happiness < 30) moodIcon = '😢';
        else if (this.petData.happiness < 60) moodIcon = '😐';
        else if (this.petData.hunger < 30) moodIcon = '😴';
        else if (this.petData.happiness > 90) moodIcon = '😍';

        petMood.textContent = moodIcon;

        // Display accessories
        if (this.petData.currentAccessory) {
            petAccessories.textContent = this.petData.currentAccessory;
        } else {
            petAccessories.textContent = '';
        }

        // Show welcome speech bubble on first load
        setTimeout(() => {
            this.showSpeechBubble('welcome');
        }, 800);
    }

    updateStats() {
        // Happiness bar
        const happinessBar = document.getElementById('happiness-bar');
        const happinessValue = document.getElementById('happiness-value');
        happinessBar.style.width = `${this.petData.happiness}%`;
        happinessValue.textContent = `${Math.round(this.petData.happiness)}%`;

        // Hunger bar
        const hungerBar = document.getElementById('hunger-bar');
        const hungerValue = document.getElementById('hunger-value');
        hungerBar.style.width = `${this.petData.hunger}%`;
        hungerValue.textContent = `${Math.round(this.petData.hunger)}%`;

        // XP bar
        const xpBar = document.getElementById('xp-bar');
        const xpValue = document.getElementById('xp-value');
        const xpProgress = (this.petData.xp / this.petData.xpToNext) * 100;
        xpBar.style.width = `${xpProgress}%`;
        xpValue.textContent = `Level ${this.petData.level}`;
    }

    updateTimer() {
        const timerText = document.getElementById('timer-text');
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const timerCircle = document.querySelector('.timer-circle');
        const progressRing = document.getElementById('timer-progress-ring');
        const progressCircle = document.querySelector('.progress-ring-progress');

        const minutes = Math.floor(this.timerState.timeLeft / 60);
        const seconds = this.timerState.timeLeft % 60;
        timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update progress ring
        const totalTime = this.timerState.focusDuration * 60;
        const progress = (totalTime - this.timerState.timeLeft) / totalTime;
        const offset = this.progressRingCircumference - (progress * this.progressRingCircumference);
        
        if (progressCircle) {
            progressCircle.style.strokeDashoffset = offset;
        }

        if (this.timerState.isRunning && !this.timerState.isPaused) {
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-flex';
            timerCircle.classList.add('active');
            progressRing.classList.add('active');
        } else {
            startBtn.style.display = 'inline-flex';
            pauseBtn.style.display = 'none';
            timerCircle.classList.remove('active');
            progressRing.classList.remove('active');
        }

        // Update custom timer input
        document.getElementById('custom-minutes').value = this.timerState.focusDuration;
        this.updateQuickSelectButtons();
    }

    updateAchievements() {
        const achievementList = document.getElementById('achievement-list');
        achievementList.innerHTML = '';

        this.petData.achievements.slice(-3).reverse().forEach(achievement => {
            const achievementEl = document.createElement('div');
            achievementEl.className = 'achievement';
            achievementEl.innerHTML = `
                <span class="achievement-icon">🌟</span>
                <span class="achievement-text">${achievement}</span>
            `;
            achievementList.appendChild(achievementEl);
        });
    }

    updateStreak() {
        document.getElementById('streak-count').textContent = this.petData.streak;
    }

    updateCustomTimer(minutes) {
        const value = parseInt(minutes);
        if (value >= 1 && value <= 60) {
            this.timerState.focusDuration = value;
            if (!this.timerState.isRunning) {
                this.timerState.timeLeft = value * 60;
            }
            this.updateQuickSelectButtons();
            this.saveData();
        }
    }

    setTimerDuration(minutes) {
        document.getElementById('custom-minutes').value = minutes;
        this.updateCustomTimer(minutes);
        this.updateUI();
    }

    updateQuickSelectButtons() {
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.minutes) === this.timerState.focusDuration) {
                btn.classList.add('active');
            }
        });
    }

    showSpeechBubble(type, customMessage = null) {
        const speechBubble = document.getElementById('speech-bubble');
        const speechText = document.getElementById('speech-text');
        
        if (!speechBubble || !speechText) {
            console.log('Speech bubble elements not found');
            return;
        }
        
        if (this.speechTimeout) {
            clearTimeout(this.speechTimeout);
        }

        let message;
        if (customMessage) {
            message = customMessage;
        } else if (this.petDialogues[type]) {
            const messages = this.petDialogues[type];
            message = messages[Math.floor(Math.random() * messages.length)];
        } else {
            message = "Hello! 👋";
        }

        speechText.textContent = message;
        speechBubble.style.display = 'block';
        speechBubble.style.opacity = '1';

        // Hide speech bubble after 4 seconds
        this.speechTimeout = setTimeout(() => {
            if (speechBubble) {
                speechBubble.style.opacity = '0';
                setTimeout(() => {
                    speechBubble.style.display = 'none';
                }, 300);
            }
        }, 4000);
    }

    interactWithPet() {
        // Random interaction when clicking pet
        const interactions = ['petting', 'welcome'];
        const randomType = interactions[Math.floor(Math.random() * interactions.length)];
        this.showSpeechBubble(randomType);
        
        // Add small happiness boost
        this.petData.happiness = Math.min(100, this.petData.happiness + 2);
        this.addXP(1);
        
        // Trigger pet animation
        const petSprite = document.getElementById('pet-sprite');
        petSprite.style.animation = 'none';
        setTimeout(() => {
            petSprite.style.animation = 'petBounce 2s ease-in-out infinite';
        }, 10);

        this.saveData();
        this.updateUI();
    }

    showRandomReward() {
        const rewards = [
            { icon: '🎩', text: 'New hat unlocked!' },
            { icon: '👑', text: 'Royal crown earned!' },
            { icon: '🌟', text: 'Shiny star badge!' },
            { icon: '💎', text: 'Precious gem found!' },
            { icon: '🔥', text: 'Fire streak bonus!' },
            { icon: '🎀', text: 'Cute bow tie!' },
            { icon: '🕶️', text: 'Cool sunglasses!' }
        ];

        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        
        // Add to pet's accessories
        if (!this.petData.unlockedAccessories) {
            this.petData.unlockedAccessories = [];
        }
        
        if (!this.petData.unlockedAccessories.includes(reward.icon)) {
            this.petData.unlockedAccessories.push(reward.icon);
            this.petData.currentAccessory = reward.icon;
            
            // Show reward popup
            const rewardPopup = document.getElementById('reward-popup');
            const rewardIcon = document.getElementById('reward-icon');
            const rewardText = document.getElementById('reward-text');
            
            rewardIcon.textContent = reward.icon;
            rewardText.textContent = reward.text;
            rewardPopup.style.display = 'block';
            
            setTimeout(() => {
                rewardPopup.style.display = 'none';
            }, 3000);
            
            this.petData.achievements.push(`Unlocked: ${reward.text}`);
        }
    }

    async startTimer() {
        console.log('Starting timer with duration:', this.timerState.timeLeft);
        this.timerState.isRunning = true;
        this.timerState.isPaused = false;
        
        this.showSpeechBubble('starting');
        
        // Send message to background script to start timer
        try {
            await chrome.runtime.sendMessage({
                action: 'startTimer',
                duration: this.timerState.timeLeft
            });
            console.log('Timer start message sent successfully');
        } catch (error) {
            console.error('Failed to start timer:', error);
        }

        await this.saveData();
        this.updateUI();
    }

    async pauseTimer() {
        this.timerState.isPaused = true;
        
        chrome.runtime.sendMessage({ action: 'pauseTimer' });
        
        await this.saveData();
        this.updateUI();
    }

    async resetTimer() {
        this.timerState.isRunning = false;
        this.timerState.isPaused = false;
        this.timerState.timeLeft = this.timerState.focusDuration * 60;
        
        chrome.runtime.sendMessage({ action: 'resetTimer' });
        
        await this.saveData();
        this.updateUI();
    }

    async changeFocusDuration(duration) {
        this.timerState.focusDuration = parseInt(duration);
        if (!this.timerState.isRunning) {
            this.timerState.timeLeft = duration * 60;
        }
        await this.saveData();
        this.updateUI();
    }

    async feedPet() {
        console.log('Feed pet button clicked');
        const now = Date.now();
        if (now - this.petData.lastFed < 10000) { // 10 second cooldown for testing
            this.showSpeechBubble('cooldown');
            console.log('Feed pet on cooldown');
            return;
        }

        this.petData.lastFed = now;
        this.petData.hunger = Math.min(100, this.petData.hunger + 25);
        this.petData.happiness = Math.min(100, this.petData.happiness + 10);
        
        this.addXP(5);
        this.showSpeechBubble('feeding');
        this.showNotification('🍖 Your pet is happy and well-fed!');
        
        console.log('Pet fed successfully - Hunger:', this.petData.hunger, 'Happiness:', this.petData.happiness);
        
        await this.saveData();
        this.updateUI();
    }

    async playWithPet() {
        console.log('Play with pet clicked');
        const now = Date.now();
        const timeSinceLastPlayed = now - this.petData.lastPlayed;
        const cooldown = 60 * 1000; // 1 minute for testing

        if (timeSinceLastPlayed < cooldown) {
            this.showSpeechBubble('playing', 'I need to rest! 😴');
            this.showNotification('Your pet is tired from playing! 🎾');
            return;
        }

        this.petData.happiness = Math.min(100, this.petData.happiness + 15);
        this.petData.hunger = Math.max(0, this.petData.hunger - 5);
        this.petData.lastPlayed = now;
        
        this.addXP(10);
        this.showSpeechBubble('playing');
        this.showNotification('So much fun! Your pet is happy! 🎉');
        
        await this.saveData();
        this.updateUI();
    }

    async petPet() {
        console.log('Pet pet clicked');
        this.petData.happiness = Math.min(100, this.petData.happiness + 3);
        this.addXP(2);
        this.showSpeechBubble('petting');
        this.showNotification('Your pet loves the attention! 💕');
        
        await this.saveData();
        this.updateUI();
    }

    addXP(amount) {
        this.petData.xp += amount;
        
        // Level up check
        while (this.petData.xp >= this.petData.xpToNext) {
            this.petData.xp -= this.petData.xpToNext;
            this.petData.level++;
            this.petData.xpToNext = Math.floor(this.petData.xpToNext * 1.2);
            
            this.petData.achievements.push(`Reached Level ${this.petData.level}!`);
            this.showNotification(`🎉 Level Up! Your pet is now Level ${this.petData.level}!`);
            
            // Unlock new skins at certain levels
            if (this.petData.level === 5) {
                this.petData.achievements.push('Unlocked Adult Form!');
            } else if (this.petData.level === 10) {
                this.petData.achievements.push('Unlocked Legendary Form!');
            }
        }
    }

    async onTimerComplete() {
        console.log('Timer completed!');
        this.timerState.sessionsCompleted++;
        this.petData.totalFocusTime += this.timerState.focusDuration;
        
        // Reward for completing focus session
        this.addXP(25);
        this.petData.happiness = Math.min(100, this.petData.happiness + 10);
        
        // Show completion speech
        this.showSpeechBubble('completed');
        this.showNotification('🎉 Focus session complete! Your pet is so proud!');
        
        // Random reward chance (30% for completing session)
        if (Math.random() < 0.3) {
            setTimeout(() => this.showRandomReward(), 1000);
        }
        
        // Check for achievements
        if (this.timerState.sessionsCompleted === 1) {
            this.petData.achievements.push('First Focus Session Complete!');
        } else if (this.timerState.sessionsCompleted === 10) {
            this.petData.achievements.push('Focus Master - 10 Sessions!');
        } else if (this.timerState.sessionsCompleted === 50) {
            this.petData.achievements.push('Focus Legend - 50 Sessions!');
        }

        // Update streak
        this.updateStreak();
        
        await this.saveData();
        this.updateUI();
    }

    async onDistraction() {
        this.petData.happiness = Math.max(0, this.petData.happiness - 10);
        this.petData.mood = 'sad';
        
        this.showSpeechBubble('distracted');
        
        await this.saveData();
        this.updateUI();
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastActive = localStorage.getItem('lastActiveDate');
        
        if (lastActive === today) {
            // Already counted today
            return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActive === yesterday.toDateString()) {
            this.petData.streak++;
        } else if (lastActive !== today) {
            this.petData.streak = 1;
        }
        
        localStorage.setItem('lastActiveDate', today);
        
        // Streak achievements
        if (this.petData.streak === 7) {
            this.petData.achievements.push('Week Warrior - 7 Day Streak!');
        } else if (this.petData.streak === 30) {
            this.petData.achievements.push('Month Master - 30 Day Streak!');
        }
    }

    showNotification(message) {
        // Create a temporary notification in the UI
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: #4ecdc4;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            z-index: 1000;
            animation: slideDown 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async shareProgress() {
        const shareText = `🐾 My FocusPet "${this.petData.name}" is Level ${this.petData.level}! 
        
🔥 ${this.petData.streak} day streak
⭐ ${this.petData.xp} XP earned
🎯 ${this.timerState.sessionsCompleted} focus sessions completed
        
Stay productive with FocusPet! 🚀`;

        try {
            await navigator.clipboard.writeText(shareText);
            this.showNotification('Share text copied to clipboard! 📋');
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            this.showNotification('Share text ready! Check console for details.');
            console.log(shareText);
        }
    }

    startUIUpdates() {
        // Update pet stats over time
        setInterval(async () => {
            // Decrease hunger over time
            this.petData.hunger = Math.max(0, this.petData.hunger - 0.1);
            
            // Decrease happiness if hungry
            if (this.petData.hunger < 20) {
                this.petData.happiness = Math.max(0, this.petData.happiness - 0.2);
            }
            
            await this.saveData();
            this.updateUI();
        }, 60000); // Update every minute

        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('Received message:', message);
            if (message.action === 'timerTick') {
                this.timerState.timeLeft = message.timeLeft;
                this.updateTimer();
            } else if (message.action === 'timerComplete') {
                this.timerState.isRunning = false;
                this.timerState.timeLeft = this.timerState.focusDuration * 60;
                this.onTimerComplete();
            } else if (message.action === 'distraction') {
                this.onDistraction();
            }
            sendResponse({received: true});
        });
    }
}

// Initialize the app when popup opens
document.addEventListener('DOMContentLoaded', () => {
    new FocusPetUI();
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
`;
document.head.appendChild(style);
