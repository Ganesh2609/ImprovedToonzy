// Comic Verse - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeCarousel();
    initializeTabs();
    initializeThemeToggle();
    initializeProgressBars();
    
    // Add smooth scrolling for anchor links
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
});

// Navigation and Mobile Menu
function initializeNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
        
        // Close menu on window resize (when switching to desktop)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
        
        // Add active class to current page in navigation
        const currentLocation = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (currentLocation.includes(linkPath) && linkPath !== '/') {
                link.classList.add('active');
            } else if (currentLocation === '/' && linkPath === '/') {
                link.classList.add('active');
            }
        });
    }
}

// Hero Carousel
function initializeCarousel() {
    const carousel = document.querySelector('.carousel');
    
    if (!carousel) return;
    
    const carouselInner = carousel.querySelector('.carousel-inner');
    const carouselItems = carousel.querySelectorAll('.carousel-item');
    const indicators = carousel.querySelectorAll('.carousel-indicator');
    const prevButton = carousel.querySelector('.carousel-prev');
    const nextButton = carousel.querySelector('.carousel-next');
    
    if (!carouselInner || !carouselItems.length) return;
    
    let currentIndex = 0;
    let autoplayInterval;
    const autoplayDelay = 5000;
    
    // Set up indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
            resetAutoplay();
        });
    });
    
    // Previous button
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
            resetAutoplay();
        });
    }
    
    // Next button
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
            resetAutoplay();
        });
    }
    
    // Start autoplay
    startAutoplay();
    
    // Pause autoplay on hover
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });
    
    // Resume autoplay on mouse leave
    carousel.addEventListener('mouseleave', () => {
        startAutoplay();
    });
    
    // Go to specific slide
    function goToSlide(index) {
        // Handle out of bounds
        if (index < 0) {
            index = carouselItems.length - 1;
        } else if (index >= carouselItems.length) {
            index = 0;
        }
        
        // Update current index
        currentIndex = index;
        
        // Update carousel position with smooth transition
        carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update indicators
        indicators.forEach((indicator, i) => {
            if (i === currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    // Start autoplay
    function startAutoplay() {
        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, autoplayDelay);
    }
    
    // Reset autoplay
    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }
    
    // Handle touch events for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const threshold = 50;
        
        // Left swipe
        if (touchEndX < touchStartX - threshold) {
            goToSlide(currentIndex + 1);
            resetAutoplay();
        }
        
        // Right swipe
        if (touchEndX > touchStartX + threshold) {
            goToSlide(currentIndex - 1);
            resetAutoplay();
        }
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Only if carousel is in viewport
        const rect = carousel.getBoundingClientRect();
        const isInViewport = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
        
        if (isInViewport) {
            if (e.key === 'ArrowLeft') {
                goToSlide(currentIndex - 1);
                resetAutoplay();
            } else if (e.key === 'ArrowRight') {
                goToSlide(currentIndex + 1);
                resetAutoplay();
            }
        }
    });
}

// Tabs
function initializeTabs() {
    const tabLists = document.querySelectorAll('.tab-list');
    
    tabLists.forEach(tabList => {
        const tabItems = tabList.querySelectorAll('.tab-item');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabItems.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabItems.forEach(item => item.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                document.getElementById(targetId)?.classList.add('active');
            });
        });
    });
}

// Dark/Light Theme Toggle
function initializeThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (themeToggle) {
        // Check for saved theme preference or system preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Apply theme
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-theme');
            updateThemeIcon(true);
        }
        
        // Theme toggle click event
        themeToggle.addEventListener('click', () => {
            const isDarkMode = document.body.classList.toggle('dark-theme');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            updateThemeIcon(isDarkMode);
        });
    }
    
    // Update theme toggle icon
    function updateThemeIcon(isDarkMode) {
        if (!themeToggle) return;
        
        if (isDarkMode) {
            themeToggle.innerHTML = `
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
            themeToggle.innerHTML = `
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
                const value = progress.getAttribute('data-value') || 0;
                progress.style.width = `${value}%`;
                progress.classList.add('animated');
            }
        });
    }
    
    // Initial check
    animateProgressBars();
    
    // Check on scroll
    window.addEventListener('scroll', animateProgressBars);
}

// Favorite Button Functionality
function initializeFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.btn-favorite');
    
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
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

// Search Functionality
function initializeSearch() {
    const searchForm = document.querySelector('.search-box');
    
    if (searchForm) {
        const searchInput = searchForm.querySelector('input');
        
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            
            if (query.length > 0) {
                // Redirect to search results page
                window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
            }
        });
    }
}

// Image Lazy Loading
function initializeLazyLoading() {
    // Check if browser supports native lazy loading
    if ('loading' in HTMLImageElement.prototype) {
        // Native lazy loading supported
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    } else {
        // Fallback to Intersection Observer
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if (lazyImages.length > 0) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
}

// Call all initializers after DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeCarousel();
    initializeTabs();
    initializeThemeToggle();
    initializeProgressBars();
    initializeFavoriteButtons();
    initializeSearch();
    initializeLazyLoading();
    
    // Add scrollspy effect for section headers
    const sectionHeaders = document.querySelectorAll('.section-title');
    
    function animateSectionHeaders() {
        sectionHeaders.forEach(header => {
            const rect = header.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            if (rect.top < windowHeight * 0.9) {
                header.classList.add('animated');
            }
        });
    }
    
    // Initial check
    animateSectionHeaders();
    
    // Check on scroll
    window.addEventListener('scroll', animateSectionHeaders);
});


// Enhanced theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    
    if (themeToggle) {
      // Check for saved theme preference or system preference
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Apply theme on initial load
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-theme');
        updateThemeIcon(true);
        if (themeToggleCheckbox) themeToggleCheckbox.checked = true;
      }
      
      // Theme toggle click event
      themeToggle.addEventListener('click', function() {
        const isDarkMode = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateThemeIcon(isDarkMode);
        
        // Sync with settings checkbox if it exists
        if (themeToggleCheckbox) {
          themeToggleCheckbox.checked = isDarkMode;
        }
      });
    }
    
    // Settings checkbox theme toggle (if on profile page)
    if (themeToggleCheckbox) {
      themeToggleCheckbox.addEventListener('change', function() {
        const isDarkMode = this.checked;
        document.body.classList.toggle('dark-theme', isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateThemeIcon(isDarkMode);
      });
    }
    
    // Update theme toggle icon
    function updateThemeIcon(isDarkMode) {
      if (!themeToggle) return;
      
      if (isDarkMode) {
        themeToggle.innerHTML = `
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
        themeToggle.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        `;
      }
    }
  });


  // Mobile menu functionality
function initializeMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
      });
      
      // Close menu when clicking nav links
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
          }
        });
      });
    }
  }
  
  // Call this function when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    // ... other initializations
  });