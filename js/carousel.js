/**
 * Comic Verse - Enhanced Carousel Component
 * A flexible and responsive carousel with smooth transitions and touch support
 */

class Carousel {
    constructor(options = {}) {
      // Default options
      this.options = {
        selector: '.carousel',
        autoplay: true,
        interval: 5000,
        pauseOnHover: true,
        animationDuration: 500,
        infinite: true,
        showIndicators: true,
        showControls: true,
        slideClass: 'carousel-item',
        indicatorClass: 'carousel-indicator',
        ...options
      };
      
      // Get carousel element
      this.carousel = document.querySelector(this.options.selector);
      if (!this.carousel) return;
      
      // Carousel elements
      this.carouselInner = this.carousel.querySelector('.carousel-inner');
      this.slides = this.carousel.querySelectorAll(`.${this.options.slideClass}`);
      
      // Initialize properties
      this.currentIndex = 0;
      this.autoplayInterval = null;
      this.isPaused = false;
      this.isTransitioning = false;
      this.slidesTotal = this.slides.length;
      this.slideWidth = 100; // percentage
      this.touchStartX = 0;
      this.touchStartY = 0;
      
      // Check if carousel has slides
      if (this.slidesTotal < 1) return;
      
      // Initialize carousel
      this.init();
    }
    
    init() {
      // Create control elements if needed
      if (this.options.showControls) {
        this.createControls();
      }
      
      // Create indicator elements if needed
      if (this.options.showIndicators) {
        this.createIndicators();
      }
      
      // Setup slides
      this.setupSlides();
      
      // Set initial position
      this.goToSlide(this.currentIndex, false);
      
      // Start autoplay if enabled
      if (this.options.autoplay) {
        this.startAutoplay();
      }
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Make carousel visible after initialization
      setTimeout(() => {
        this.carousel.classList.add('initialized');
      }, 100);
    }
    
    setupSlides() {
      // Set width for inner container based on number of slides
      this.carouselInner.style.width = `${this.slidesTotal * 100}%`;
      
      // Set width for each slide
      this.slides.forEach(slide => {
        slide.style.width = `${this.slideWidth / this.slidesTotal}%`;
      });
      
      // Clone slides for infinite scrolling if enabled
      if (this.options.infinite && this.slidesTotal > 1) {
        const firstSlideClone = this.slides[0].cloneNode(true);
        const lastSlideClone = this.slides[this.slidesTotal - 1].cloneNode(true);
        
        firstSlideClone.classList.add('clone');
        lastSlideClone.classList.add('clone');
        
        this.carouselInner.appendChild(firstSlideClone);
        this.carouselInner.insertBefore(lastSlideClone, this.slides[0]);
        
        // Recalculate width
        const totalSlides = this.slidesTotal + 2;
        this.carouselInner.style.width = `${totalSlides * 100}%`;
        
        // Update slides collection
        this.slides = this.carousel.querySelectorAll(`.${this.options.slideClass}`);
        
        // Adjust initial position to account for cloned slide
        this.carouselInner.style.transform = `translateX(-${100 / totalSlides}%)`;
        this.currentIndex = 1;
      }
    }
    
    createControls() {
      // Create previous button
      const prevButton = document.createElement('button');
      prevButton.className = 'carousel-arrow carousel-prev';
      prevButton.setAttribute('aria-label', 'Previous slide');
      prevButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      `;
      
      // Create next button
      const nextButton = document.createElement('button');
      nextButton.className = 'carousel-arrow carousel-next';
      nextButton.setAttribute('aria-label', 'Next slide');
      nextButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      `;
      
      // Create navigation container
      const navigationContainer = document.createElement('div');
      navigationContainer.className = 'carousel-navigation';
      navigationContainer.appendChild(prevButton);
      navigationContainer.appendChild(nextButton);
      
      // Add to carousel
      this.carousel.appendChild(navigationContainer);
      
      // Store references
      this.prevButton = prevButton;
      this.nextButton = nextButton;
    }
    
    createIndicators() {
      // Create indicators container
      const indicatorsContainer = document.createElement('div');
      indicatorsContainer.className = 'carousel-indicators';
      
      // Create individual indicators
      for (let i = 0; i < this.slidesTotal; i++) {
        const indicator = document.createElement('button');
        indicator.className = this.options.indicatorClass;
        indicator.setAttribute('data-index', i);
        indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
        
        if (i === 0) {
          indicator.classList.add('active');
        }
        
        indicatorsContainer.appendChild(indicator);
      }
      
      // Add to carousel
      this.carousel.appendChild(indicatorsContainer);
      
      // Store reference
      this.indicators = this.carousel.querySelectorAll(`.${this.options.indicatorClass}`);
    }
    
    setupEventListeners() {
      // Control buttons
      if (this.prevButton) {
        this.prevButton.addEventListener('click', () => {
          this.prev();
        });
      }
      
      if (this.nextButton) {
        this.nextButton.addEventListener('click', () => {
          this.next();
        });
      }
      
      // Indicators
      if (this.indicators) {
        this.indicators.forEach((indicator, index) => {
          indicator.addEventListener('click', () => {
            const adjustedIndex = this.options.infinite ? index + 1 : index;
            this.goToSlide(adjustedIndex);
          });
        });
      }
      
      // Pause on hover
      if (this.options.pauseOnHover) {
        this.carousel.addEventListener('mouseenter', () => {
          this.pauseAutoplay();
        });
        
        this.carousel.addEventListener('mouseleave', () => {
          if (!this.isPaused) {
            this.startAutoplay();
          }
        });
      }
      
      // Touch events for swipe
      this.carousel.addEventListener('touchstart', (e) => {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.pauseAutoplay();
      }, { passive: true });
      
      this.carousel.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchEndX - this.touchStartX;
        const diffY = touchEndY - this.touchStartY;
        
        // Only register as horizontal swipe if horizontal movement was greater than vertical
        if (Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX > 50) {
            // Right swipe
            this.prev();
          } else if (diffX < -50) {
            // Left swipe
            this.next();
          }
        }
        
        if (!this.isPaused && this.options.autoplay) {
          this.startAutoplay();
        }
      }, { passive: true });
      
      // Keyboard navigation
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
            this.prev();
          } else if (e.key === 'ArrowRight') {
            this.next();
          }
        }
      });
      
      // Ensure autoplay is paused when tab/window is inactive
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseAutoplay();
        } else if (!this.isPaused && this.options.autoplay) {
          this.startAutoplay();
        }
      });
      
      // Handle browser back/forward navigation
      window.addEventListener('popstate', () => {
        this.goToSlide(this.currentIndex, false);
      });
      
      // Pause autoplay if user manually scrolls the page
      window.addEventListener('scroll', () => {
        if (this.options.autoplay) {
          this.pauseAutoplay();
          
          // Resume autoplay after scroll stops
          clearTimeout(this.scrollTimeout);
          this.scrollTimeout = setTimeout(() => {
            if (!this.isPaused) {
              this.startAutoplay();
            }
          }, 1000);
        }
      }, { passive: true });
      
      // Handle window resize
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.goToSlide(this.currentIndex, false);
        }, 200);
      });
      
      // Add transition end event for infinite scrolling logic
      this.carouselInner.addEventListener('transitionend', () => {
        this.isTransitioning = false;
        
        if (this.options.infinite) {
          // If we're at the cloned slide, jump to the real slide without transition
          if (this.currentIndex === 0) {
            this.goToSlide(this.slidesTotal, false);
          } else if (this.currentIndex === this.slides.length - 1) {
            this.goToSlide(1, false);
          }
        }
      });
    }
    
    goToSlide(index, animate = true) {
      // Prevent transition during another transition
      if (this.isTransitioning) return;
      
      // Validate index
      if (index < 0) {
        index = this.slides.length - 1;
      } else if (index >= this.slides.length) {
        index = 0;
      }
      
      // Update current index
      this.currentIndex = index;
      
      // Calculate position
      const position = -(this.currentIndex * (100 / this.slides.length));
      
      // Set transition duration
      if (animate) {
        this.isTransitioning = true;
        this.carouselInner.style.transition = `transform ${this.options.animationDuration}ms ease`;
      } else {
        this.carouselInner.style.transition = 'none';
      }
      
      // Transform to new position
      this.carouselInner.style.transform = `translateX(${position}%)`;
      
      // Update indicators
      if (this.indicators) {
        const indicatorIndex = this.options.infinite ? (this.currentIndex - 1 + this.slidesTotal) % this.slidesTotal : this.currentIndex;
        
        this.indicators.forEach((indicator, i) => {
          if (i === indicatorIndex) {
            indicator.classList.add('active');
          } else {
            indicator.classList.remove('active');
          }
        });
      }
      
      // Reset transition after animation
      if (!animate) {
        setTimeout(() => {
          this.carouselInner.style.transition = `transform ${this.options.animationDuration}ms ease`;
        }, 50);
      }
    }
    
    next() {
      this.goToSlide(this.currentIndex + 1);
      this.restartAutoplay();
    }
    
    prev() {
      this.goToSlide(this.currentIndex - 1);
      this.restartAutoplay();
    }
    
    startAutoplay() {
      if (!this.options.autoplay) return;
      
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = setInterval(() => {
        this.next();
      }, this.options.interval);
    }
    
    pauseAutoplay() {
      clearInterval(this.autoplayInterval);
    }
    
    restartAutoplay() {
      this.pauseAutoplay();
      if (!this.isPaused && this.options.autoplay) {
        this.startAutoplay();
      }
    }
    
    pause() {
      this.isPaused = true;
      this.pauseAutoplay();
    }
    
    resume() {
      this.isPaused = false;
      this.startAutoplay();
    }
    
    destroy() {
      // Clear autoplay
      this.pauseAutoplay();
      
      // Remove event listeners (would need to refactor to use named functions for this)
      
      // Remove controls and indicators
      if (this.prevButton && this.nextButton) {
        const navigationContainer = this.carousel.querySelector('.carousel-navigation');
        if (navigationContainer) navigationContainer.remove();
      }
      
      const indicatorsContainer = this.carousel.querySelector('.carousel-indicators');
      if (indicatorsContainer) indicatorsContainer.remove();
      
      // Remove cloned slides
      const clones = this.carousel.querySelectorAll('.clone');
      clones.forEach(clone => clone.remove());
      
      // Reset styles
      this.carouselInner.style.width = '';
      this.carouselInner.style.transform = '';
      this.carouselInner.style.transition = '';
      
      this.slides.forEach(slide => {
        slide.style.width = '';
      });
      
      this.carousel.classList.remove('initialized');
    }
  }
  
  // Initialize all carousels on page load
  document.addEventListener('DOMContentLoaded', () => {
    // Main hero carousel
    const heroCarousel = new Carousel({
      selector: '.hero-carousel',
      autoplay: true,
      interval: 5000,
      animationDuration: 600
    });
    
    // Featured comics carousel
    const featuredCarousel = new Carousel({
      selector: '.featured-carousel',
      autoplay: false,
      showIndicators: false
    });
    
    // New releases carousel
    const newReleasesCarousel = new Carousel({
      selector: '.new-releases-carousel',
      interval: 6000,
      showIndicators: false
    });
    
    // Make carousels available globally if needed
    window.comicVerseCarousels = {
      hero: heroCarousel,
      featured: featuredCarousel,
      newReleases: newReleasesCarousel
    };
  });