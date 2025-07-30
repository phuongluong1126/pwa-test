// Memory Game PWA
class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.gameStarted = false;
        this.gamePaused = false;
        this.startTime = null;
        this.timerInterval = null;
        this.totalPairs = 8; // 4x4 grid
        
        this.emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
        
        this.init();
    }
    
    init() {
        this.registerServiceWorker();
        this.setupEventListeners();
        this.createGame();
        this.updateDisplay();
    }
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }
    
    setupEventListeners() {
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.newGame();
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.newGame();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.togglePause();
            }
            if (e.key === 'Enter' && this.gamePaused) {
                this.resumeGame();
            }
        });
        
        // Prevent context menu on cards
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    createGame() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        // Create card pairs
        const cardValues = [...this.emojis, ...this.emojis];
        this.shuffleArray(cardValues);
        
        this.cards = [];
        cardValues.forEach((value, index) => {
            const card = this.createCard(value, index);
            this.cards.push(card);
            gameBoard.appendChild(card);
        });
    }
    
    createCard(value, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.value = value;
        card.dataset.index = index;
        
        card.addEventListener('click', () => {
            this.flipCard(card);
        });
        
        return card;
    }
    
    flipCard(card) {
        if (this.gamePaused || card.classList.contains('flipped') || 
            card.classList.contains('matched') || card.classList.contains('disabled')) {
            return;
        }
        
        if (!this.gameStarted) {
            this.startGame();
        }
        
        card.classList.add('flipped');
        card.textContent = card.dataset.value;
        
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            this.checkMatch();
        }
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const match = card1.dataset.value === card2.dataset.value;
        
        if (match) {
            this.handleMatch(card1, card2);
        } else {
            this.handleMismatch(card1, card2);
        }
    }
    
    handleMatch(card1, card2) {
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;
            this.score += 100;
            this.updateDisplay();
            
            if (this.matchedPairs === this.totalPairs) {
                this.endGame();
            }
        }, 500);
        
        this.flippedCards = [];
    }
    
    handleMismatch(card1, card2) {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '';
            card2.textContent = '';
        }, 1000);
        
        this.flippedCards = [];
    }
    
    startGame() {
        this.gameStarted = true;
        this.startTime = Date.now();
        this.startTimer();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.gamePaused) {
                this.updateDisplay();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    getElapsedTime() {
        if (!this.startTime) return 0;
        const elapsed = this.gamePaused ? this.pauseTime - this.startTime : Date.now() - this.startTime;
        return Math.floor(elapsed / 1000);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateDisplay() {
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('timer').textContent = this.formatTime(this.getElapsedTime());
        document.getElementById('score').textContent = this.score;
    }
    
    togglePause() {
        if (!this.gameStarted || this.matchedPairs === this.totalPairs) return;
        
        if (this.gamePaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }
    
    pauseGame() {
        this.gamePaused = true;
        this.pauseTime = Date.now();
        document.getElementById('pause-btn').textContent = 'Resume';
        document.getElementById('game-overlay').classList.add('active');
    }
    
    resumeGame() {
        this.gamePaused = false;
        this.startTime += Date.now() - this.pauseTime;
        document.getElementById('pause-btn').textContent = 'Pause';
        document.getElementById('game-overlay').classList.remove('active');
    }
    
    endGame() {
        this.stopTimer();
        const finalTime = this.getElapsedTime();
        
        // Calculate bonus score based on time and moves
        const timeBonus = Math.max(0, 300 - finalTime) * 10;
        const moveBonus = Math.max(0, 50 - this.moves) * 20;
        this.score += timeBonus + moveBonus;
        
        // Update final stats
        document.getElementById('final-moves').textContent = this.moves;
        document.getElementById('final-time').textContent = this.formatTime(finalTime);
        document.getElementById('final-score').textContent = this.score;
        
        // Show win modal
        setTimeout(() => {
            document.getElementById('win-modal').classList.add('active');
        }, 1000);
        
        // Save high score
        this.saveHighScore();
    }
    
    newGame() {
        this.resetGame();
        this.createGame();
        this.updateDisplay();
        document.getElementById('win-modal').classList.remove('active');
        document.getElementById('game-overlay').classList.remove('active');
    }
    
    resetGame() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.gameStarted = false;
        this.gamePaused = false;
        this.startTime = null;
        this.stopTimer();
        document.getElementById('pause-btn').textContent = 'Pause';
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    saveHighScore() {
        const highScore = localStorage.getItem('memoryGameHighScore') || 0;
        if (this.score > highScore) {
            localStorage.setItem('memoryGameHighScore', this.score);
            localStorage.setItem('memoryGameBestTime', this.getElapsedTime());
            localStorage.setItem('memoryGameBestMoves', this.moves);
        }
    }
    
    getHighScore() {
        return localStorage.getItem('memoryGameHighScore') || 0;
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});

// PWA Install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button if you want to add one
    // showInstallButton();
});

// Handle app installed
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
});

// Handle offline/online status
window.addEventListener('online', () => {
    console.log('App is online');
    // You can show a notification here
});

window.addEventListener('offline', () => {
    console.log('App is offline');
    // You can show a notification here
}); 