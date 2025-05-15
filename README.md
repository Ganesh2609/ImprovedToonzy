# Toonzy 2.0 (Improved Toonzy)

An enhanced web-based platform for manga and comic enthusiasts, featuring a modern dark theme, responsive design, and seamless reading experience.

![Toonzy Logo](assets/icons/logo.png)

## 🚀 Live Demo

Check out the live demo: [https://ganesh2609.github.io/ImprovedToonzy/](https://ganesh2609.github.io/ImprovedToonzy/)

## 🌟 Features

- **Modern Dark Theme** - Sleek, eye-friendly dark interface with light theme toggle option
- **Responsive Design** - Optimized for all devices from mobile to desktop
- **Enhanced Comic Reader** - Continuous scrolling manga-style reader with PDF support
- **Genre Exploration** - Browse comics by various genres with visually appealing cards
- **Creator Dashboard** - Tools for comic creators to upload and manage their content  
- **User Profiles** - Personalized user accounts with reading history and favorites
- **Daily Updates** - Stay updated with latest comic releases organized by weekdays
- **Library Management** - Save and organize your favorite comics
- **Progress Tracking** - Keep track of your reading progress across all comics
- **Touch Gestures** - Swipe navigation and double-tap zoom for mobile devices

## 🛠️ Technologies Used

- **HTML5** - Semantic markup and structure
- **CSS3** - Custom properties, Flexbox, Grid, and animations
- **JavaScript (ES6+)** - Interactive elements and functionality
- **PDF.js** - For rendering comic PDFs in the browser
- **LocalStorage API** - For saving user preferences and favorites
- **Intersection Observer API** - For lazy loading and page tracking
- **Touch Events API** - For mobile gesture support

## 📱 Responsive Design

The platform is fully responsive across all device sizes:
- Mobile phones (320px and up)
- Tablets (768px and up)
- Desktops (1024px and up)
- Large displays (1440px and up)

## 🎨 UI Components

### Core Components
- **Dark/Light Theme Toggle** - Switch between themes with persistent user preference
- **Tabbed Interfaces** - Organize content in a clean, accessible way
- **Toast Notifications** - Provide feedback for user actions
- **Modal Dialogs** - For confirmations and detailed information
- **Dropdown Menus** - For compact navigation options
- **Animated Transitions** - Smooth state changes and loading effects
- **Progress Indicators** - Visual feedback for asynchronous operations

### Comic Reading Features
- **Continuous Scrolling** - Manga-style reading experience
- **Page Navigation Controls** - Navigate through pages easily
- **Zoom Capabilities** - Double-tap to zoom on mobile
- **Fullscreen Mode** - Immersive reading experience
- **Reading Progress Bar** - Track your progress through chapters
- **Multiple Reading Modes** - Vertical scroll, horizontal page-turn
- **Auto-hide UI** - Interface fades away while reading

## 📖 Comic Reader

The enhanced comic reader includes:
- PDF rendering support
- Smooth page transitions
- Mobile gesture controls (swipe, double-tap)
- Keyboard navigation
- Settings panel for customization
- Reading progress persistence
- Chapter navigation

## 🎯 Key Features Breakdown

### User Features
- **Login with Google** - Quick authentication
- **Favorites System** - Mark and organize favorite comics
- **Reading History** - Track what you've read
- **Continue Reading** - Pick up where you left off
- **Collections** - Create custom comic collections
- **Profile Settings** - Customize your experience

### Creator Features
- **Creator Dashboard** - Manage your published works
- **Analytics** - View reads, likes, and follower counts
- **Upload System** - Publish new comics and chapters
- **Revenue Tracking** - Monitor earnings

## 📁 Project Structure

```
toonzy-2.0/
├── assets/
│   ├── icons/           # Application icons and logo
│   ├── images/          # Static images
│   │   ├── banner/      # Carousel banners
│   │   ├── covers/      # Comic cover images
│   │   └── profile.png  # Default profile image
│   └── demo/           # Demo comic pages
├── css/
│   ├── main.css        # Core styles and components
│   ├── normalize.css   # CSS reset
│   ├── reader.css      # Comic reader specific styles
│   ├── dashboard.css   # Creator dashboard styles
│   └── comic-detail.css # Comic detail page styles
├── js/
│   ├── main.js         # Core functionality
│   ├── reader.js       # Comic reader functionality
│   ├── carousel.js     # Carousel component
│   └── ui-utils.js     # Reusable UI utilities
├── index.html          # Home page
├── genres.html         # Genre browsing
├── daily.html          # Daily updates schedule
├── library.html        # User library
├── profile.html        # User profile
├── comic-detail.html    # Comic details page
├── reader.html         # Comic reader
├── creator-dashboard.html # Creator dashboard
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server-side requirements - this is a static website

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ganesh2609/ImprovedToonzy.git
   ```

2. Navigate to the project directory:
   ```bash
   cd ImprovedToonzy
   ```

3. Open `index.html` in your web browser:
   - **Option 1**: Double-click the file
   - **Option 2**: Right-click and select "Open with" your browser
   - **Option 3**: Use a local server (recommended for full functionality)

## 🖥️ Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## 📱 Progressive Web App Features

- Responsive design for all screen sizes
- Touch-optimized for mobile devices
- Offline support for saved favorites
- Fast loading with lazy image loading
- Smooth animations and transitions

## 🔮 Future Enhancements

- User authentication and backend integration
- Real-time notifications for new chapters
- Social features (comments, ratings, sharing)
- Advanced search and filtering
- Recommendation engine
- Multi-language support
- Offline reading with PWA
- Creator monetization features

## 📝 Notes

- This is a frontend-only demonstration
- Comic PDFs are not included (uses placeholders)
- User data is stored in browser's localStorage
- For production use, a backend API would be required
