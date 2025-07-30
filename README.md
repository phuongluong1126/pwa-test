# Memory Card Game PWA

A beautiful, responsive Progressive Web App (PWA) memory card game built with HTML, CSS, and JavaScript. Test your memory by matching pairs of emoji cards!

## 🎮 Features

- **Progressive Web App**: Install on your device and play offline
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Beautiful UI**: Modern gradient design with smooth animations
- **Game Features**:
  - 4x4 grid with 8 pairs of emoji cards
  - Move counter and timer
  - Score system with bonuses
  - Pause/resume functionality
  - High score tracking
- **PWA Features**:
  - Offline support
  - App-like experience
  - Installable on devices
  - Service worker caching
  - Push notifications ready

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (for development)

### Installation

1. **Clone or download** this repository
2. **Start a local server** in the project directory:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

3. **Open your browser** and navigate to `http://localhost:8000`

### PWA Installation

1. Open the game in Chrome or Edge
2. Look for the install icon in the address bar (or menu)
3. Click "Install" to add the game to your device
4. The game will now work offline and feel like a native app!

## 🎯 How to Play

1. **Start**: Click "New Game" to begin
2. **Match**: Click on cards to flip them and find matching pairs
3. **Strategy**: Remember card positions to minimize moves
4. **Score**: Complete the game with fewer moves and less time for higher scores
5. **Pause**: Use the pause button or press Escape to pause the game

## 📱 PWA Features

### Offline Support
The game works completely offline after the first load. All resources are cached by the service worker.

### App Installation
- **Desktop**: Install from browser menu or address bar
- **Mobile**: Add to home screen from browser menu
- **Chrome**: Look for the install icon in the address bar

### Performance
- Fast loading with service worker caching
- Smooth animations and transitions
- Optimized for mobile devices

## 🛠️ Technical Details

### File Structure
```
pwa-test/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── app.js             # Game logic and PWA features
├── manifest.json      # PWA manifest
├── sw.js             # Service worker
├── icons/            # App icons (placeholders)
└── README.md         # This file
```

### Technologies Used
- **HTML5**: Semantic markup and PWA features
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **JavaScript ES6+**: Game logic, PWA functionality, and modern JS features
- **Service Workers**: Offline caching and background sync
- **Web App Manifest**: App installation and display properties

### Browser Support
- Chrome 67+
- Firefox 67+
- Safari 11.1+
- Edge 79+

## 🎨 Customization

### Changing Game Difficulty
Edit `app.js` and modify the `totalPairs` property in the constructor:

```javascript
this.totalPairs = 8; // Change to 6 for 3x4 grid, 12 for 6x4 grid
```

### Changing Card Emojis
Modify the `emojis` array in `app.js`:

```javascript
this.emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
```

### Styling
The game uses CSS custom properties and modern CSS features. Main color variables are defined in `styles.css`.

## 🚀 Deployment

### GitHub Pages
1. Push your code to a GitHub repository
2. Go to Settings > Pages
3. Select source branch and save
4. Your PWA will be available at `https://username.github.io/repository-name`

### Netlify
1. Drag and drop the project folder to Netlify
2. Your PWA will be deployed automatically
3. Custom domain can be added in settings

### Vercel
1. Connect your GitHub repository to Vercel
2. Deploy automatically on push
3. Get a custom domain and HTTPS

## 🔧 Development

### Adding Icons
Replace the placeholder files in the `icons/` directory with actual PNG icons:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### Testing PWA Features
1. Use Chrome DevTools > Application tab
2. Check Service Worker status
3. Test offline functionality
4. Verify manifest properties

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

If you find any bugs or have suggestions, please open an issue on GitHub.

---

**Enjoy playing the Memory Card Game! 🎮✨** 