/**
 * Toonzy - Enhanced Carousel Functionality
 * Self-contained carousel implementation with improved visibility handling
 */

// Use IIFE to avoid global scope pollution
(function() {
  // Class to handle all carousel functionality
  class ToonzyCarousel {
    constructor(element) {
      // Get elements
      this.carousel = element;
      this.slides = this.carousel.querySelectorAll('.carousel-item');
      
      // No need for carousel with only one slide
      if (this.slides.length <= 1) return;
      
      // Set up initial state
      this.currentSlide = 0;
      this.totalSlides = this.slides.length;
      this.isAnimating = false;
      this.autoplayInterval = null;
      this.isPaused = false;
      this.isHovered = false;
      this.isVisible = true; // Whether the carousel is in a visible tab/window
      
      // Initialize the carousel
      this.init();
    }
    
    init() {
      // Set initial slide visibility
      this.slides.forEach((slide, index) => {
        if (index !== 0) {
          slide.style.display = 'none';
          slide.setAttribute('aria-hidden', 'true');
        } else {
          slide.setAttribute('aria-hidden', 'false');
        }
      });
      
      // Create indicators
      this.createIndicators();
      
      // Create navigation arrows
      this.createNavigationArrows();
      
      // Add event listeners
      this.addEventListeners();
      
      // Start autoplay
      this.startAutoplay();
    }
    
    createIndicators() {
      // Create indicators container
      this.indicatorsContainer = document.createElement('div');
      this.indicatorsContainer.className = 'carousel-indicators';
      
      // Create indicators
      for (let i = 0; i < this.totalSlides; i++) {
        const indicator = document.createElement('button');
        indicator.className = i === 0 ? 'carousel-indicator active' : 'carousel-indicator';
        indicator.setAttribute('data-index', i);
        indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
        
        indicator.addEventListener('click', () => {
          if (this.isAnimating || this.currentSlide === i) return;
          this.goToSlide(i);
        });
        
        this.indicatorsContainer.appendChild(indicator);
      }
      
      this.carousel.appendChild(this.indicatorsContainer);
    }
    
    createNavigationArrows() {
      // Create navigation container
      this.navigationContainer = document.createElement('div');
      this.navigationContainer.className = 'carousel-navigation';
      
      // Create previous button
      this.prevButton = document.createElement('button');
      this.prevButton.className = 'carousel-arrow carousel-prev';
      this.prevButton.setAttribute('aria-label', 'Previous slide');
      this.prevButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      `;
      
      // Create next button
      this.nextButton = document.createElement('button');
      this.nextButton.className = 'carousel-arrow carousel-next';
      this.nextButton.setAttribute('aria-label', 'Next slide');
      this.nextButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      `;
      
      // Add buttons to navigation container
      this.navigationContainer.appendChild(this.prevButton);
      this.navigationContainer.appendChild(this.nextButton);
      
      // Add navigation container to carousel
      this.carousel.appendChild(this.navigationContainer);
      
      // Add event listeners for buttons
      this.prevButton.addEventListener('click', () => {
        if (this.isAnimating) return;
        this.goToSlide((this.currentSlide - 1 + this.totalSlides) % this.totalSlides);
      });
      
      this.nextButton.addEventListener('click', () => {
        if (this.isAnimating) return;
        this.goToSlide((this.currentSlide + 1) % this.totalSlides);
      });
    }
    
    addEventListeners() {
      // Mouse hover events
      this.carousel.addEventListener('mouseenter', () => {
        this.isHovered = true;
        this.pauseAutoplay();
        this.showControls();
      });
      
      this.carousel.addEventListener('mouseleave', () => {
        this.isHovered = false;
        if (this.isVisible) {
          this.startAutoplay();
        }
        this.fadeControls();
      });
      
      // Touch events
      this.addTouchSupport();
      
      // Keyboard navigation
      this.addKeyboardSupport();
      
      // Page visibility change
      this.handleVisibilityChanges();
      
      // Initial control visibility
      setTimeout(() => {
        if (!this.isHovered) {
          this.fadeControls();
        }
      }, 3000);
    }
    
    addTouchSupport() {
      let touchStartX = 0;
      
      this.carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        this.pauseAutoplay();
      }, { passive: true });
      
      this.carousel.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;
        
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            // Swipe right - previous slide
            this.goToSlide((this.currentSlide - 1 + this.totalSlides) % this.totalSlides);
          } else {
            // Swipe left - next slide
            this.goToSlide((this.currentSlide + 1) % this.totalSlides);
          }
        }
        
        if (this.isVisible && !this.isHovered) {
          this.startAutoplay();
        }
      }, { passive: true });
    }
    
    addKeyboardSupport() {
      document.addEventListener('keydown', (e) => {
        // Only if carousel is in viewport
        const rect = this.carousel.getBoundingClientRect();
        const isInViewport = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth
        );
        
        if (isInViewport) {
          if (e.key === 'ArrowLeft') {
            this.goToSlide((this.currentSlide - 1 + this.totalSlides) % this.totalSlides);
            this.resetAutoplay();
          } else if (e.key === 'ArrowRight') {
            this.goToSlide((this.currentSlide + 1) % this.totalSlides);
            this.resetAutoplay();
          }
        }
      });
    }
    
    handleVisibilityChanges() {
      // Handle page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          // Pause when tab is not visible
          this.pauseAutoplay();
          this.isVisible = false;
        } else if (document.visibilityState === 'visible') {
          // Resume when tab becomes visible again
          this.isVisible = true;
          if (!this.isHovered) {
            this.startAutoplay();
          }
          
          // Ensure UI elements are visible
          this.showControls();
          
          // Schedule hiding them after a delay if mouse is not over carousel
          if (!this.isHovered) {
            setTimeout(() => {
              if (!this.isHovered && document.visibilityState === 'visible') {
                this.fadeControls();
              }
            }, 3000);
          }
        }
      });
      
      // Handle window focus/blur events as additional visibility change detection
      window.addEventListener('focus', () => {
        this.isVisible = true;
        if (!this.isHovered) {
          this.startAutoplay();
        }
      });
      
      window.addEventListener('blur', () => {
        this.pauseAutoplay();
        this.isVisible = false;
      });
    }
    
    goToSlide(index) {
      if (this.currentSlide === index || this.isAnimating) return;
      
      this.isAnimating = true;
      
      // Update indicators
      const indicators = this.carousel.querySelectorAll('.carousel-indicator');
      indicators.forEach((indicator, i) => {
        if (i === index) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
      
      // Make sure navigation is visible during transitions
      this.showControls();
      
      // Get current and next slide
      const currentSlide = this.slides[this.currentSlide];
      const nextSlide = this.slides[index];
      
      // Ensure both slides exist before proceeding
      if (!currentSlide || !nextSlide) {
        this.isAnimating = false;
        return;
      }
      
      // Fade out current slide
      currentSlide.style.opacity = '0';
      currentSlide.setAttribute('aria-hidden', 'true');
      
      // Wait for fade out animation to complete
      setTimeout(() => {
        // Hide current slide
        currentSlide.style.display = 'none';
        
        // Show next slide
        nextSlide.style.display = 'block';
        nextSlide.style.opacity = '0';
        
        // Force a reflow to ensure the transition works
        void nextSlide.offsetWidth;
        
        // Fade in next slide
        nextSlide.style.opacity = '1';
        nextSlide.setAttribute('aria-hidden', 'false');
        
        // Update current slide
        this.currentSlide = index;
        
        // Reset animation flag after transition completes
        setTimeout(() => {
          this.isAnimating = false;
        }, 500);
      }, 500);
      
      // Restart autoplay
      this.resetAutoplay();
    }
    
    showControls() {
      if (this.navigationContainer) {
        this.navigationContainer.style.opacity = '1';
      }
      if (this.indicatorsContainer) {
        this.indicatorsContainer.style.opacity = '1';
      }
    }
    
    fadeControls() {
      if (this.navigationContainer) {
        this.navigationContainer.style.opacity = '0.3';
      }
      if (this.indicatorsContainer) {
        this.indicatorsContainer.style.opacity = '0.3';
      }
    }
    
    startAutoplay() {
      // Clear any existing interval first
      this.pauseAutoplay();
      
      // Only start autoplay if the carousel is visible
      if (this.isVisible) {
        this.autoplayInterval = setInterval(() => {
          // Only advance the carousel if it's visible and not paused
          if (this.isVisible && !this.isAnimating && !this.isHovered) {
            this.goToSlide((this.currentSlide + 1) % this.totalSlides);
          }
        }, 5000);
      }
    }
    
    pauseAutoplay() {
      if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
      }
    }
    
    resetAutoplay() {
      this.pauseAutoplay();
      if (this.isVisible && !this.isHovered) {
        this.startAutoplay();
      }
    }
  }

  // Initialize all carousels when DOM is loaded
  function initializeCarousels() {
    const carousels = document.querySelectorAll('.carousel');
    
    // Initialize each carousel
    carousels.forEach(carousel => {
      // Skip if carousel already initialized
      if (carousel.dataset.initialized === 'true') return;
      
      // Mark carousel as initialized
      carousel.dataset.initialized = 'true';
      
      // Create new carousel instance
      new ToonzyCarousel(carousel);
    });
  }

  // Create global function for home page carousel initialization
  window.initializeHomePageCarousel = function() {
    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel && heroCarousel.dataset.initialized !== 'true') {
      heroCarousel.dataset.initialized = 'true';
      new ToonzyCarousel(heroCarousel);
    }
  };

  // Initialize carousels when DOM is loaded
  document.addEventListener('DOMContentLoaded', initializeCarousels);
})();