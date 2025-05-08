/**
 * Simple and Reliable Carousel
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
    
    // Set up autoplay
    function startAutoplay() {
      autoplayInterval = setInterval(() => {
        goToSlide((currentSlide + 1) % totalSlides);
      }, 5000);
    }
    
    function pauseAutoplay() {
      clearInterval(autoplayInterval);
    }
    
    function restartAutoplay() {
      pauseAutoplay();
      startAutoplay();
    }
    
    // Pause on hover
    carousel.addEventListener('mouseenter', pauseAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    
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
  });
});