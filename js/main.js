/**
 * Toonzy - Main JavaScript
 * Core functionality for the Toonzy comic platform
 */

// Use IIFE to avoid global scope pollution
(function() {
  // Store initialized components to avoid duplication
  const initialized = {
    navigation: false,
    tabs: false,
    themeToggle: false,
    progressBars: false,
    favoriteButtons: false,
    backToTop: false
  };

  // Main initialization function
  function initializeUI() {
    // Only initialize components that haven't been initialized yet
    if (!initialized.navigation) initializeNavigation();
    if (!initialized.tabs) initializeTabs();
    if (!initialized.themeToggle) initializeThemeToggle();
    if (!initialized.progressBars) initializeProgressBars();
    if (!initialized.favoriteButtons) initializeFavoriteButtons();
    if (!initialized.backToTop) initializeBackToTop();
    
    // Page-specific initializations based on body classes
    if (document.body.classList.contains('home-page') && typeof initializeHomePageCarousel === 'function') {
      initializeHomePageCarousel();
    }
    
    // Note: We're not initializing the reader here - that's handled by reader.js
  }

  // Navigation and Mobile Menu
  function initializeNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
      // Remove any existing event listeners (just in case)
      const newMenuToggle = menuToggle.cloneNode(true);
      const newNavMenu = navMenu.cloneNode(true);
      
      if (menuToggle.parentNode) {
        menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
      }
      
      if (navMenu.parentNode) {
        navMenu.parentNode.replaceChild(newNavMenu, navMenu);
      }
      
      // Add event listeners to the new elements
      newMenuToggle.addEventListener('click', () => {
        newNavMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (newNavMenu.classList.contains('active') && 
            !newNavMenu.contains(e.target) && 
            !newMenuToggle.contains(e.target)) {
          newNavMenu.classList.remove('active');
          document.body.classList.remove('menu-open');
        }
      });
      
      // Close menu on window resize (when switching to desktop)
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && newNavMenu.classList.contains('active')) {
          newNavMenu.classList.remove('active');
          document.body.classList.remove('menu-open');
        }
      });
      
      // Add active class to current page in navigation
      const currentLocation = window.location.pathname;
      const navLinks = document.querySelectorAll('.nav-link');
      
      navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentLocation.includes(linkPath) && linkPath !== '/' && linkPath !== 'index.html') {
          link.classList.add('active');
        } else if ((currentLocation === '/' || currentLocation.includes('index.html')) && 
                   (linkPath === '/' || linkPath === 'index.html')) {
          link.classList.add('active');
        }
      });
      
      initialized.navigation = true;
    }
  }

  // Tabs functionality
  function initializeTabs() {
    const tabLists = document.querySelectorAll('.tab-list');
    
    tabLists.forEach(tabList => {
      const tabItems = tabList.querySelectorAll('.tab-item');
      const tabContents = document.querySelectorAll('.tab-content');
      
      tabItems.forEach(tab => {
        // Remove existing click listeners by cloning and replacing
        const newTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(newTab, tab);
        
        newTab.addEventListener('click', () => {
          const targetId = newTab.getAttribute('data-tab');
          
          // Remove active class from all tabs and contents
          tabItems.forEach(item => item.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));
          
          // Add active class to clicked tab and corresponding content
          newTab.classList.add('active');
          const targetContent = document.getElementById(targetId);
          if (targetContent) {
            targetContent.classList.add('active');
          }
        });
      });
    });
    
    initialized.tabs = true;
  }

  // Daily tabs functionality - separate to avoid conflicts
  function initializeDailyTabs() {
    const dayTabs = document.querySelectorAll('.day-tab');
    const dayContents = document.querySelectorAll('.day-content');
    
    dayTabs.forEach(tab => {
      // Remove existing click listeners by cloning and replacing
      const newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);
      
      newTab.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get the target day
        const targetDay = this.getAttribute('data-day');
        
        // Remove active class from all tabs
        dayTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Hide all day contents
        dayContents.forEach(content => {
          content.classList.remove('active');
        });
        
        // Show the selected day content
        const targetContent = document.getElementById(`${targetDay}-content`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }

  // Dark/Light Theme Toggle
  function initializeThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    
    if (themeToggle) {
      // Check for saved theme preference or system preference
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Apply theme
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-theme');
        updateThemeIcon(true);
        if (themeToggleCheckbox) {
          themeToggleCheckbox.checked = true;
        }
      }
      
      // Remove any existing click listeners by cloning and replacing
      const newThemeToggle = themeToggle.cloneNode(true);
      themeToggle.parentNode.replaceChild(newThemeToggle, themeToggle);
      
      // Theme toggle click event
      newThemeToggle.addEventListener('click', () => {
        const isDarkMode = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateThemeIcon(isDarkMode);
        
        // Sync with settings checkbox if it exists
        if (themeToggleCheckbox) {
          themeToggleCheckbox.checked = isDarkMode;
        }
      });
      
      // Settings checkbox theme toggle (if on profile page)
      if (themeToggleCheckbox) {
        themeToggleCheckbox.addEventListener('change', function() {
          const isDarkMode = this.checked;
          document.body.classList.toggle('dark-theme', isDarkMode);
          localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
          updateThemeIcon(isDarkMode);
        });
      }
      
      initialized.themeToggle = true;
    }
    
    // Update theme toggle icon
    function updateThemeIcon(isDarkMode) {
      const themeToggleBtn = document.querySelector('.theme-toggle');
      if (!themeToggleBtn) return;
      
      if (isDarkMode) {
        themeToggleBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        `;
      } else {
        themeToggleBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        `;
      }
    }
  }

  // Progress Bars Animation
  function initializeProgressBars() {
    const progressBars = document.querySelectorAll('.progress');
    
    if (!progressBars.length) return;
    
    // Function to check if an element is in viewport
    function isElementInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
    
    // Function to animate progress bars
    function animateProgressBars() {
      progressBars.forEach(progress => {
        if (isElementInViewport(progress) && !progress.classList.contains('animated')) {
          const value = progress.getAttribute('data-value') || progress.style.width;
          progress.style.width = value;
          progress.classList.add('animated');
        }
      });
    }
    
    // Initial check
    animateProgressBars();
    
    // Check on scroll
    window.addEventListener('scroll', animateProgressBars);
    
    initialized.progressBars = true;
  }

  // Favorite Button Functionality
  function initializeFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.btn-favorite');
    
    if (!favoriteButtons.length) return;
    
    favoriteButtons.forEach(button => {
      // Clone the button to remove existing event listeners
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      newButton.addEventListener('click', function() {
        this.classList.toggle('active');
        
        const comicId = this.getAttribute('data-id');
        const isFavorited = this.classList.contains('active');
        
        // Add/remove from local storage favorites
        updateFavorite(comicId, isFavorited);
        
        // Show feedback to user
        const message = isFavorited ? 'Added to favorites!' : 'Removed from favorites';
        showToast(message);
      });
    });
    
    // Update favorite in local storage
    function updateFavorite(comicId, isFavorited) {
      let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      
      if (isFavorited) {
        // Add to favorites if not already in the list
        if (!favorites.includes(comicId)) {
          favorites.push(comicId);
        }
      } else {
        // Remove from favorites
        favorites = favorites.filter(id => id !== comicId);
      }
      
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    
    // Check if a comic is in favorites and update UI
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    favoriteButtons.forEach(button => {
      const comicId = button.getAttribute('data-id');
      if (favorites.includes(comicId)) {
        button.classList.add('active');
      }
    });
    
    initialized.favoriteButtons = true;
  }

  // Toast Notification
  function showToast(message, duration = 3000) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // Append to body
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Hide and remove toast after duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }

  // Back to Top Button
  function initializeBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (!backToTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });
    
    // Scroll to top when clicked
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    initialized.backToTop = true;
  }

  // Page-specific initializations
  
  // Home page carousel - this is a placeholder that will be defined in carousel.js
  // and won't conflict with the main.js initialization
  function initializeHomePageCarousel() {
    // This function will be defined in carousel.js
    console.log('Home page carousel initialization is handled by carousel.js');
  }

  // Initialize smooth scrolling for anchor links
  function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          window.scrollTo({
            top: target.offsetTop - 80, // Account for fixed header
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Call initialization function when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeUI();
    initializeSmoothScrolling();
    
    // Initialize daily tabs if present
    if (document.querySelector('.day-tab')) {
      initializeDailyTabs();
    }
    
    // Handle filter buttons if present
    const filterButtons = document.querySelectorAll('.filter-item');
    if (filterButtons.length > 0) {
      filterButtons.forEach(button => {
        button.addEventListener('click', function() {
          // Remove active class from all buttons in the same group
          const parentGroup = this.closest('.filter-group');
          if (parentGroup) {
            parentGroup.querySelectorAll('.filter-item').forEach(btn => {
              btn.classList.remove('active');
            });
          }
          
          // Add active class to clicked button
          this.classList.add('active');
        });
      });
    }
  });

  // Expose necessary functions to global scope for other scripts to use
  window.ToonzyUI = {
    showToast: showToast,
    updateTheme: function(isDarkMode) {
      document.body.classList.toggle('dark-theme', isDarkMode);
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      if (document.querySelector('.theme-toggle')) {
        updateThemeIcon(isDarkMode);
      }
    },
    isDarkMode: function() {
      return document.body.classList.contains('dark-theme');
    }
  };
})();