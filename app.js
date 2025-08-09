// Memory Game PWA
class MemoryGame {
    constructor() {
        this.baseLevels = [
            { gridSize: 2, pairs: 2 }, // Level 1: 2x2, 2 pairs
            { gridSize: 3, pairs: 3 }, // Level 2: 3x2, 3 pairs
            { gridSize: 4, pairs: 4 }, // Level 3: 4x2, 4 pairs
            { gridSize: 4, pairs: 5 }  // Level 4: 4x3, 5 pairs
        ];
        this.currentLevel = 0;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.gameStarted = false;
        this.gamePaused = false;
        this.startTime = null;
        this.timerInterval = null;
        this.totalPairs = this.getPairsForLevel(this.currentLevel);
        // Default local images as fallback
        this.localImages = [
            'images/m1.jpg',
            'images/m2.jpeg', 
            'images/m3.png',
            'images/m4.jpeg',
            'images/m5.jpeg',
            'images/m6.jpeg',
            'images/m7.jpeg',
            'images/m8.png'
        ];
        this.cardImages = [...this.localImages];
        this.init();
    }
    
    async init() {
        await this.fetchMemes();
        this.totalPairs = this.getPairsForLevel(this.currentLevel);
        this.registerServiceWorker();
        this.setupEventListeners();
        this.createGame();
        this.updateDisplay();
        this.updateLevelDisplay && this.updateLevelDisplay();
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
        
        // Next Level button
        const nextLevelBtn = document.getElementById('next-level-btn');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => {
                this.nextLevel();
                document.getElementById('win-modal').classList.remove('active');
            });
        }
        // Restart Level button
        const restartLevelBtn = document.getElementById('restart-level-btn');
        if (restartLevelBtn) {
            restartLevelBtn.addEventListener('click', () => {
                this.restartLevel();
                document.getElementById('win-modal').classList.remove('active');
            });
        }
        
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
    
    async fetchMemes() {
        try {
            const response = await fetch('https://api.imgflip.com/get_memes');
            const data = await response.json();
            if (data.success && data.data && data.data.memes) {
                // Use only the image URLs
                this.cardImages = data.data.memes.map(meme => meme.url);
            } else {
                this.cardImages = [...this.localImages];
            }
        } catch (e) {
            console.error('Failed to fetch memes from API, using local images.', e);
            this.cardImages = [...this.localImages];
        }
    }
    
    createGame() {
        this.totalPairs = this.getPairsForLevel(this.currentLevel);
        const gridSize = this.getGridSizeForLevel(this.currentLevel);
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        // Randomly select images for this level
        let cardImagesForLevel = [];
        if (this.cardImages.length >= this.totalPairs) {
            cardImagesForLevel = this.getRandomUniqueItems(this.cardImages, this.totalPairs);
        } else {
            // Not enough unique images, repeat images as needed
            const repeats = Math.ceil(this.totalPairs / this.cardImages.length);
            cardImagesForLevel = Array(repeats).fill(this.cardImages).flat().slice(0, this.totalPairs);
        }
        const cardValues = [...cardImagesForLevel, ...cardImagesForLevel];
        this.shuffleArray(cardValues);
        this.preloadImages();
        this.cards = [];
        cardValues.forEach((value, index) => {
            const card = this.createCard(value, index);
            this.cards.push(card);
            gameBoard.appendChild(card);
        });
        // Adjust grid style for level
        gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    }
    
    preloadImages() {
        this.cardImages.forEach((imagePath) => {
            const img = new Image();
            img.onload = () => {
                console.log('Preloaded image successfully:', imagePath);
            };
            img.onerror = () => {
                console.error('Failed to preload image:', imagePath);
                // Special debugging for m5.jpeg
                if (imagePath.includes('m5.jpeg')) {
                    console.error('m5.jpeg failed to load. Checking file...');
                    // Try to fetch the file directly
                    fetch(imagePath)
                        .then(response => {
                            console.log('m5.jpeg fetch response:', response.status, response.statusText);
                            return response.blob();
                        })
                        .then(blob => {
                            console.log('m5.jpeg blob size:', blob.size);
                        })
                        .catch(error => {
                            console.error('m5.jpeg fetch error:', error);
                        });
                }
            };
            img.src = imagePath;
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
        
        // Create and display image
        const img = document.createElement('img');
        img.src = card.dataset.value;
        img.alt = 'Card Image';
        img.className = 'card-image';
        
        console.log('Attempting to load image:', card.dataset.value);
        
        // Add error handling for image loading
        img.onerror = () => {
            console.error('Failed to load image:', card.dataset.value);
            // Fallback to text if image fails to load
            card.innerHTML = '<span style="font-size: 2rem; color: white;">❌</span>';
        };
        
        // Add load success logging
        img.onload = () => {
            console.log('Image loaded successfully:', card.dataset.value, {
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                complete: img.complete
            });
        };
        
        // Clear card content and add image
        card.innerHTML = '';
        card.appendChild(img);
        
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
            card1.innerHTML = '';
            card2.innerHTML = '';
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
        // Show next level button if not last level
        if (this.currentLevel < this.baseLevels.length - 1) {
            document.getElementById('next-level-btn').style.display = 'inline-block';
        } else {
            document.getElementById('next-level-btn').style.display = 'none';
        }
    }
    
    newGame() {
        this.resetGame();
        this.createGame();
        this.updateDisplay();
        document.getElementById('win-modal').classList.remove('active');
        document.getElementById('game-overlay').classList.remove('active');
        this.updateLevelDisplay && this.updateLevelDisplay();
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

    getPairsForLevel(level) {
        if (level < this.baseLevels.length) {
            return this.baseLevels[level].pairs;
        } else {
            // Endless: each new level increases pairs by 1
            return this.baseLevels[this.baseLevels.length - 1].pairs + (level - this.baseLevels.length + 1);
        }
    }
    getGridSizeForLevel(level) {
        if (level < this.baseLevels.length) {
            return this.baseLevels[level].gridSize;
        } else {
            // For endless, grid size increases every 2 pairs, capped at 8
            return Math.min(8, 2 + Math.floor(this.getPairsForLevel(level) / 2));
        }
    }

    nextLevel() {
        this.currentLevel++;
        this.newGame();
    }
    restartLevel() {
        this.newGame();
    }
    updateLevelDisplay() {
        const levelDisplay = document.getElementById('level-display');
        if (levelDisplay) {
            levelDisplay.textContent = `Level ${this.currentLevel + 1} (${this.getPairsForLevel(this.currentLevel)} pairs)`;
        }
    }

    // Utility to get N random unique items from an array
    getRandomUniqueItems(array, n) {
        const arr = array.slice();
        const result = [];
        for (let i = 0; i < n && arr.length > 0; i++) {
            const idx = Math.floor(Math.random() * arr.length);
            result.push(arr.splice(idx, 1)[0]);
        }
        return result;
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