/**
 * Comic Verse - UI Utilities
 * A collection of utility functions for UI interactions and enhancements
 */

/**
 * Initialize tabs functionality across the site
 */
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
  
  /**
   * Initialize tooltip functionality
   * @param {string} selector - CSS selector for tooltip elements
   */
  function initializeTooltips(selector = '[data-tooltip]') {
    const tooltipElements = document.querySelectorAll(selector);
    
    tooltipElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        const tooltipText = element.getAttribute('data-tooltip');
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
        
        // Show tooltip
        setTimeout(() => {
          tooltip.classList.add('visible');
        }, 10);
      });
      
      element.addEventListener('mouseleave', () => {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
          tooltip.classList.remove('visible');
          setTimeout(() => {
            tooltip.remove();
          }, 200);
        }
      });
    });
  }
  
  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of toast (success, error, info)
   * @param {number} duration - Duration in ms
   */
  function showToast(message, type = 'success', duration = 3000) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
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
  
  /**
   * Initialize modal functionality
   * @param {string} modalSelector - CSS selector for modal
   * @param {string} openBtnSelector - CSS selector for open button
   * @param {string} closeBtnSelector - CSS selector for close button
   */
  function initializeModal(modalSelector, openBtnSelector, closeBtnSelector) {
    const modal = document.querySelector(modalSelector);
    const openBtn = document.querySelector(openBtnSelector);
    const closeBtn = document.querySelector(closeBtnSelector);
    
    if (!modal || !openBtn) return;
    
    // Open modal
    openBtn.addEventListener('click', () => {
      modal.classList.add('show');
      document.body.classList.add('modal-open');
    });
    
    // Close modal
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
      });
    }
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
      }
    });
    
    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
      }
    });
  }
  
  /**
   * Initialize dropdown functionality
   * @param {string} selector - CSS selector for dropdown toggle
   */
  function initializeDropdowns(selector = '.dropdown-toggle') {
    const dropdownToggles = document.querySelectorAll(selector);
    
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const dropdown = toggle.nextElementSibling;
        
        // Close all other dropdowns
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
          if (menu !== dropdown) {
            menu.classList.remove('show');
          }
        });
        
        // Toggle this dropdown
        dropdown.classList.toggle('show');
      });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
      });
    });
  }
  
  /**
   * Initialize progress bars animation
   */
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
  
  /**
   * Initialize lazy loading for images
   */
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
  
  /**
   * Initialize favorite button functionality
   */
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
  
  /**
   * Initialize back to top button
   */
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
  }
  
  /**
   * Initialize dark mode toggle
   */
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
  
  /**
   * Initialize mobile navigation
   */
  function initializeMobileNav() {
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
    }
  }
  
  /**
   * Initialize form validation
   * @param {string} formSelector - CSS selector for the form
   */
  function initializeFormValidation(formSelector) {
    const form = document.querySelector(formSelector);
    
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      let isValid = true;
      const requiredFields = form.querySelectorAll('[required]');
      
      // Check all required fields
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          // Add error class
          field.classList.add('error');
          isValid = false;
          
          // Add error message if not already present
          const parent = field.parentElement;
          if (!parent.querySelector('.error-message')) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'This field is required';
            parent.appendChild(errorMsg);
          }
        } else {
          // Remove error class
          field.classList.remove('error');
          
          // Remove error message if present
          const errorMsg = field.parentElement.querySelector('.error-message');
          if (errorMsg) {
            errorMsg.remove();
          }
        }
      });
      
      // Email validation
      const emailField = form.querySelector('input[type="email"]');
      if (emailField && emailField.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value.trim())) {
          emailField.classList.add('error');
          isValid = false;
          
          // Add error message if not already present
          const parent = emailField.parentElement;
          if (!parent.querySelector('.error-message')) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Please enter a valid email address';
            parent.appendChild(errorMsg);
          }
        }
      }
      
      // Prevent form submission if not valid
      if (!isValid) {
        e.preventDefault();
      }
    });
    
    // Real-time validation as user types/changes fields
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
      field.addEventListener('input', () => {
        if (field.hasAttribute('required') && !field.value.trim()) {
          field.classList.add('error');
        } else {
          field.classList.remove('error');
          
          // Remove error message if present
          const errorMsg = field.parentElement.querySelector('.error-message');
          if (errorMsg) {
            errorMsg.remove();
          }
        }
      });
    });
  }
  
  /**
   * Initialize scroll animations
   */
  function initializeScrollAnimations() {
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    if (!animateElements.length) return;
    
    // Function to check if an element is in viewport
    function isElementInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8
      );
    }
    
    // Function to animate elements
    function animateElements() {
      animateElements.forEach(element => {
        if (isElementInViewport(element) && !element.classList.contains('animated')) {
          element.classList.add('animated');
        }
      });
    }
    
    // Initial check
    animateElements();
    
    // Check on scroll
    window.addEventListener('scroll', animateElements);
  }
  
  /**
   * Initialize all UI components
   */
  function initializeUI() {
    initializeMobileNav();
    initializeThemeToggle();
    initializeTabs();
    initializeTooltips();
    initializeDropdowns();
    initializeProgressBars();
    initializeLazyLoading();
    initializeFavoriteButtons();
    initializeBackToTop();
    initializeScrollAnimations();
    
    // Add initialization for specific pages based on body class
    if (document.body.classList.contains('reader-page')) {
      // Reader specific initializations
    }
    
    if (document.body.classList.contains('dashboard-page')) {
      // Dashboard specific initializations
    }
  }
  
  // Initialize all UI components when DOM is loaded
  document.addEventListener('DOMContentLoaded', initializeUI);
  
  // Export functions for use in other scripts
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      initializeTabs,
      initializeTooltips,
      showToast,
      initializeModal,
      initializeDropdowns,
      initializeProgressBars,
      initializeLazyLoading,
      initializeFavoriteButtons,
      initializeBackToTop,
      initializeThemeToggle,
      initializeMobileNav,
      initializeFormValidation,
      initializeScrollAnimations,
      initializeUI
    };
  }