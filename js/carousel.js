/**
 * Enhanced Carousel functionality with improved tab visibility handling
 * Replace or update the carousel.js file with these improvements
 */

document.addEventListener('DOMContentLoaded', function() {
  const carousels = document.querySelectorAll('.carousel');
  
  carousels.forEach(carousel => {
    // Get elements
    const slides = carousel.querySelectorAll('.carousel-item');
    if (slides.length <= 1) return; // No need for carousel with only one slide
    
    // Set up initial state
    let currentSlide = 0;
    let isAnimating = false;
    let autoplayInterval = null;
    let isPaused = false;
    const totalSlides = slides.length;
    
    // Hide all slides except the first one
    slides.forEach((slide, index) => {
      if (index !== 0) {
        slide.style.display = 'none';
      }
    });
    
    // Create indicators
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'carousel-indicators';
    
    for (let i = 0; i < totalSlides; i++) {
      const indicator = document.createElement('button');
      indicator.className = i === 0 ? 'carousel-indicator active' : 'carousel-indicator';
      indicator.setAttribute('data-index', i);
      indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
      
      indicator.addEventListener('click', () => {
        if (isAnimating || currentSlide === i) return;
        goToSlide(i);
      });
      
      indicatorsContainer.appendChild(indicator);
    }
    carousel.appendChild(indicatorsContainer);
    
    // Create navigation arrows
    const navigationContainer = document.createElement('div');
    navigationContainer.className = 'carousel-navigation';
    
    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-arrow carousel-prev';
    prevButton.setAttribute('aria-label', 'Previous slide');
    prevButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    `;
    
    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-arrow carousel-next';
    nextButton.setAttribute('aria-label', 'Next slide');
    nextButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    `;
    
    navigationContainer.appendChild(prevButton);
    navigationContainer.appendChild(nextButton);
    carousel.appendChild(navigationContainer);
    
    // Event listeners for arrows
    prevButton.addEventListener('click', () => {
      if (isAnimating) return;
      goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
    });
    
    nextButton.addEventListener('click', () => {
      if (isAnimating) return;
      goToSlide((currentSlide + 1) % totalSlides);
    });
    
    // Function to change slides
    function goToSlide(index) {
      if (currentSlide === index || isAnimating) return;
      
      isAnimating = true;
      
      // Update indicators
      const indicators = carousel.querySelectorAll('.carousel-indicator');
      indicators.forEach((indicator, i) => {
        if (i === index) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
      
      // Make sure navigation is visible during transitions
      navigationContainer.style.opacity = '1';
      indicatorsContainer.style.opacity = '1';
      
      // Fade out current slide
      slides[currentSlide].style.opacity = '0';
      
      setTimeout(() => {
        // Hide current slide
        slides[currentSlide].style.display = 'none';
        
        // Show next slide
        slides[index].style.display = 'block';
        slides[index].style.opacity = '0';
        
        // Trigger reflow
        void slides[index].offsetWidth;
        
        // Fade in next slide
        slides[index].style.opacity = '1';
        
        // Update current slide
        currentSlide = index;
        
        // Reset animation flag after transition completes
        setTimeout(() => {
          isAnimating = false;
        }, 500);
      }, 500);
      
      // Restart autoplay
      restartAutoplay();
    }
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Pause when tab is not visible
        pauseAutoplay();
        isPaused = true;
      } else if (document.visibilityState === 'visible') {
        // Resume when tab becomes visible again
        if (isPaused) {
          startAutoplay();
          isPaused = false;
        }
        
        // Ensure UI elements are visible
        navigationContainer.style.opacity = '1';
        indicatorsContainer.style.opacity = '1';
        
        // Schedule hiding them after a delay if mouse is not over carousel
        if (!isHovered) {
          setTimeout(() => {
            if (!isHovered && document.visibilityState === 'visible') {
              navigationContainer.style.opacity = '0.3';
              indicatorsContainer.style.opacity = '0.3';
            }
          }, 3000);
        }
      }
    });
    
    // Set up autoplay
    function startAutoplay() {
      clearInterval(autoplayInterval);
      autoplayInterval = setInterval(() => {
        if (!isPaused && document.visibilityState === 'visible') {
          goToSlide((currentSlide + 1) % totalSlides);
        }
      }, 5000);
    }
    
    function pauseAutoplay() {
      clearInterval(autoplayInterval);
    }
    
    function restartAutoplay() {
      pauseAutoplay();
      startAutoplay();
    }
    
    // Track hover state
    let isHovered = false;
    
    // Pause on hover with UI enhancement
    carousel.addEventListener('mouseenter', () => {
      isHovered = true;
      pauseAutoplay();
      // Make sure navigation is fully visible on hover
      navigationContainer.style.opacity = '1';
      indicatorsContainer.style.opacity = '1';
    });
    
    carousel.addEventListener('mouseleave', () => {
      isHovered = false;
      startAutoplay();
      // Fade navigation slightly when not hovering
      navigationContainer.style.opacity = '0.3';
      indicatorsContainer.style.opacity = '0.3';
    });
    
    // Start autoplay
    startAutoplay();
    
    // Touch swipe support
    let touchStartX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      pauseAutoplay();
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe right - previous slide
          goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
        } else {
          // Swipe left - next slide
          goToSlide((currentSlide + 1) % totalSlides);
        }
      }
      
      startAutoplay();
    }, { passive: true });
    
    // Initial state - slightly faded navigation when not hovering
    setTimeout(() => {
      if (!isHovered) {
        navigationContainer.style.opacity = '0.3';
        indicatorsContainer.style.opacity = '0.3';
      }
    }, 3000);
  });
});