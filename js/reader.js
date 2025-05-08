/**
 * Comic Verse - Reader.js
 * Manga-style continuous vertical reader with enhanced reading experience
 */

class ComicReader {
    constructor(options = {}) {
      // Default options
      this.options = {
        containerId: 'reader-container',
        pdfUrl: null,
        startPage: 1,
        zoomFactor: 1.0,
        mobileSensitivity: 1.2,
        uiHideDelay: 3000,
        preloadPages: 2,
        ...options
      };
      
      // State
      this.pdfDoc = null;
      this.currentPage = this.options.startPage;
      this.totalPages = 0;
      this.renderedPages = [];
      this.observers = [];
      this.visiblePage = this.options.startPage;
      this.uiVisible = true;
      this.uiTimeout = null;
      this.isZoomed = false;
      this.isMobile = window.innerWidth < 768;
      this.isUIHidden = false;
      this.userHasInteracted = false;
      
      // UI Elements
      this.container = document.getElementById(this.options.containerId);
      this.header = document.querySelector('.reader-header');
      this.footer = document.querySelector('.reader-footer');
      this.progressBar = document.querySelector('.reading-progress');
      this.currentPageEl = document.getElementById('current-page');
      this.totalPagesEl = document.getElementById('total-pages');
      this.prevPageBtn = document.getElementById('prev-page');
      this.nextPageBtn = document.getElementById('next-page');
      this.prevChapterBtn = document.getElementById('prev-chapter');
      this.nextChapterBtn = document.getElementById('next-chapter');
      this.settingsBtn = document.getElementById('settings-btn');
      this.settingsPanel = document.querySelector('.settings-panel');
      this.settingsOverlay = document.querySelector('.settings-overlay');
      this.zoomSlider = document.getElementById('zoom-range');
      this.touchHint = document.querySelector('.touch-hint');
      
      // Initialize PDF.js
      if (typeof pdfjsLib === 'undefined') {
        this.showError('PDF.js library not loaded. Please check your connection and reload the page.');
        return;
      }
      
      // Set worker source for PDF.js
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      
      // Initialize the reader
      this.init();
    }
    
    init() {
      // Show loading indicator
      this.showLoading();
      
      // Load PDF document
      if (this.options.pdfUrl) {
        this.loadPDF(this.options.pdfUrl);
      } else {
        // For demo purposes, use a placeholder
        this.loadPlaceholder();
      }
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Check if first-time visitor (for touch hint)
      this.checkFirstTimeVisitor();
      
      // Initialize UI
      this.setupUI();
    }
    
    setupUI() {
      // Initial UI state
      if (this.currentPageEl) this.currentPageEl.textContent = this.currentPage;
      
      // Show auto-hide UI on first interaction
      const autoHideUI = () => {
        if (!this.userHasInteracted) {
          this.userHasInteracted = true;
          this.scheduleUIHide();
          document.removeEventListener('mousemove', autoHideUI);
          document.removeEventListener('touchstart', autoHideUI);
        }
      };
      
      document.addEventListener('mousemove', autoHideUI);
      document.addEventListener('touchstart', autoHideUI);
      
      // Setup settings panel
      this.setupSettingsPanel();
    }
    
    setupSettingsPanel() {
      if (!this.settingsBtn || !this.settingsPanel || !this.settingsOverlay) return;
      
      // Open settings panel
      this.settingsBtn.addEventListener('click', () => {
        this.settingsPanel.classList.add('active');
        this.settingsOverlay.classList.add('active');
        this.cancelUIHide();
      });
      
      // Close settings panel
      const closeSettingsBtn = document.querySelector('.btn-close-settings');
      if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => {
          this.settingsPanel.classList.remove('active');
          this.settingsOverlay.classList.remove('active');
          this.scheduleUIHide();
        });
      }
      
      this.settingsOverlay.addEventListener('click', () => {
        this.settingsPanel.classList.remove('active');
        this.settingsOverlay.classList.remove('active');
        this.scheduleUIHide();
      });
      
      // Zoom control
      if (this.zoomSlider) {
        this.zoomSlider.value = this.options.zoomFactor * 100;
        
        this.zoomSlider.addEventListener('input', () => {
          const zoom = parseInt(this.zoomSlider.value) / 100;
          this.adjustZoom(zoom);
        });
      }
      
      // Reading mode buttons
      const readingModeButtons = document.querySelectorAll('.settings-button[data-mode]');
      readingModeButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Remove active class from all buttons
          readingModeButtons.forEach(btn => btn.classList.remove('active'));
          
          // Add active class to clicked button
          button.classList.add('active');
          
          // Apply reading mode
          const mode = button.getAttribute('data-mode');
          this.applyReadingMode(mode);
        });
      });
    }
    
    applyReadingMode(mode) {
      const pageContainers = document.querySelectorAll('.comic-page');
      
      switch(mode) {
        case 'light':
          document.body.classList.remove('dark-theme');
          document.body.classList.remove('sepia-theme');
          break;
        case 'dark':
          document.body.classList.add('dark-theme');
          document.body.classList.remove('sepia-theme');
          break;
        case 'sepia':
          document.body.classList.remove('dark-theme');
          document.body.classList.add('sepia-theme');
          break;
      }
    }
    
    adjustZoom(zoom) {
      this.options.zoomFactor = zoom;
      
      // Apply zoom to all pages
      const pages = document.querySelectorAll('.comic-page img');
      pages.forEach(page => {
        page.style.width = `${zoom * 100}%`;
      });
    }
    
    loadPDF(url) {
      // Load the PDF document
      pdfjsLib.getDocument(url).promise.then(pdfDoc => {
        this.pdfDoc = pdfDoc;
        this.totalPages = pdfDoc.numPages;
        
        // Update UI
        if (this.totalPagesEl) {
          this.totalPagesEl.textContent = this.totalPages;
        }
        
        // Hide loading indicator
        this.hideLoading();
        
        // Render pages
        this.renderPages();
        
        // Set up intersection observer for page tracking
        this.setupIntersectionObserver();
        
      }).catch(error => {
        console.error('Error loading PDF:', error);
        this.showError('Failed to load comic. Please try again later.');
      });
    }
    
    loadPlaceholder() {
      // For demo purposes, create a placeholder with multiple pages
      this.totalPages = 10;
      
      // Update UI
      if (this.totalPagesEl) {
        this.totalPagesEl.textContent = this.totalPages;
      }
      
      // Hide loading indicator
      this.hideLoading();
      
      // Create placeholder pages
      for (let i = 1; i <= this.totalPages; i++) {
        this.createPlaceholderPage(i);
      }
      
      // Set up intersection observer for page tracking
      this.setupIntersectionObserver();
    }
    
    createPlaceholderPage(pageNumber) {
      // Create page container
      const pageContainer = document.createElement('div');
      pageContainer.className = 'page-container';
      pageContainer.id = `page-container-${pageNumber}`;
      
      // Create comic page
      const comicPage = document.createElement('div');
      comicPage.className = 'comic-page';
      comicPage.setAttribute('data-page', pageNumber);
      comicPage.style.height = '600px';
      
      // Create image (placeholder)
      const img = document.createElement('img');
      img.src = `/assets/demo/page-${pageNumber}.jpg`;
      img.alt = `Page ${pageNumber}`;
      img.onerror = () => {
        img.src = `https://via.placeholder.com/800x1200/121212/6200ea?text=Page+${pageNumber}`;
      };
      
      comicPage.appendChild(img);
      pageContainer.appendChild(comicPage);
      
      // Add page divider (except for the last page)
      if (pageNumber < this.totalPages) {
        const divider = document.createElement('div');
        divider.className = 'page-divider';
        pageContainer.appendChild(divider);
      }
      
      // Add to container
      this.container.appendChild(pageContainer);
      this.renderedPages.push(pageNumber);
    }
    
    renderPages() {
      // Clear container first
      this.container.innerHTML = '';
      this.renderedPages = [];
      
      // Render all pages in sequence
      for (let i = 1; i <= this.totalPages; i++) {
        this.renderPage(i);
      }
    }
    
    renderPage(pageNumber) {
      // Create page container
      const pageContainer = document.createElement('div');
      pageContainer.className = 'page-container';
      pageContainer.id = `page-container-${pageNumber}`;
      
      // Create comic page
      const comicPage = document.createElement('div');
      comicPage.className = 'comic-page loading';
      comicPage.setAttribute('data-page', pageNumber);
      
      // Create preloader
      const preloader = document.createElement('div');
      preloader.className = 'page-preloader';
      preloader.innerHTML = '<div class="spinner"></div>';
      comicPage.appendChild(preloader);
      
      pageContainer.appendChild(comicPage);
      
      // Add page divider (except for the last page)
      if (pageNumber < this.totalPages) {
        const divider = document.createElement('div');
        divider.className = 'page-divider';
        pageContainer.appendChild(divider);
      }
      
      // Add to container first
      this.container.appendChild(pageContainer);
      
      // Then render the actual PDF page
      this.pdfDoc.getPage(pageNumber).then(page => {
        const viewport = page.getViewport({ scale: this.options.zoomFactor });
        
        // Create image
        const img = document.createElement('img');
        img.alt = `Page ${pageNumber}`;
        img.setAttribute('data-page', pageNumber);
        
        // Create a canvas to render the PDF page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Render the PDF page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        page.render(renderContext).promise.then(() => {
          // Convert canvas to image
          img.src = canvas.toDataURL();
          
          // Add image to page and remove loading state
          img.onload = () => {
            comicPage.appendChild(img);
            comicPage.classList.remove('loading');
            preloader.classList.add('hidden');
            
            // After some time, remove the preloader entirely
            setTimeout(() => {
              preloader.remove();
            }, 300);
          };
          
          this.renderedPages.push(pageNumber);
        });
      }).catch(error => {
        console.error(`Error rendering page ${pageNumber}:`, error);
        comicPage.innerHTML = `<div class="page-error">Failed to load page ${pageNumber}</div>`;
      });
    }
    
    setupIntersectionObserver() {
      // Create an intersection observer to track which page is currently in view
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // 50% of the page is visible
      };
      
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const page = entry.target;
            const pageNumber = parseInt(page.getAttribute('data-page'));
            
            if (pageNumber !== this.visiblePage) {
              this.visiblePage = pageNumber;
              this.currentPage = pageNumber;
              
              // Update UI
              if (this.currentPageEl) {
                this.currentPageEl.textContent = pageNumber;
              }
              
              // Update progress bar
              this.updateProgressBar();
              
              // Update URL with current page (for sharing/bookmarking)
              this.updateURLWithPage();
            }
          }
        });
      }, options);
      
      // Observe all pages
      const pages = document.querySelectorAll('.comic-page');
      pages.forEach(page => {
        observer.observe(page);
      });
      
      this.observers.push(observer);
    }
    
    updateProgressBar() {
      if (!this.progressBar) return;
      
      const progress = (this.currentPage / this.totalPages) * 100;
      this.progressBar.style.width = `${progress}%`;
    }
    
    updateURLWithPage() {
      // Update URL with current page for sharing/bookmarking
      const url = new URL(window.location.href);
      url.searchParams.set('page', this.currentPage);
      window.history.replaceState({}, '', url);
    }
    
    goToPage(pageNumber) {
      // Validate page number
      if (pageNumber < 1) {
        pageNumber = 1;
      } else if (pageNumber > this.totalPages) {
        pageNumber = this.totalPages;
      }
      
      // Update current page
      this.currentPage = pageNumber;
      
      // Scroll to the page
      const pageElement = document.querySelector(`.comic-page[data-page="${pageNumber}"]`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Update UI
        if (this.currentPageEl) {
          this.currentPageEl.textContent = pageNumber;
        }
        
        // Update progress bar
        this.updateProgressBar();
      }
    }
    
    setupEventListeners() {
      // Navigation buttons
      if (this.prevPageBtn) {
        this.prevPageBtn.addEventListener('click', () => {
          this.goToPage(this.currentPage - 1);
          this.cancelUIHide();
          this.scheduleUIHide();
        });
      }
      
      if (this.nextPageBtn) {
        this.nextPageBtn.addEventListener('click', () => {
          this.goToPage(this.currentPage + 1);
          this.cancelUIHide();
          this.scheduleUIHide();
        });
      }
      
      // Chapter navigation
      if (this.prevChapterBtn) {
        this.prevChapterBtn.addEventListener('click', () => {
          // In a real implementation, this would navigate to the previous chapter
          // For demo, show alert
          alert('Previous chapter would be loaded here');
          this.cancelUIHide();
        });
      }
      
      if (this.nextChapterBtn) {
        this.nextChapterBtn.addEventListener('click', () => {
          // In a real implementation, this would navigate to the next chapter
          // For demo, show alert
          alert('Next chapter would be loaded here');
          this.cancelUIHide();
        });
      }
      
      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          this.goToPage(this.currentPage - 1);
          this.showUI();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          this.goToPage(this.currentPage + 1);
          this.showUI();
        }
      });
      
      // Mouse movement shows UI
      document.addEventListener('mousemove', () => {
        if (this.userHasInteracted) {
          this.showUI();
          this.scheduleUIHide();
        }
      });
      
      // Touch events for mobile
      document.addEventListener('touchstart', () => {
        if (this.userHasInteracted) {
          this.showUI();
          this.scheduleUIHide();
        }
      });
      
      // Show UI on scroll
      window.addEventListener('scroll', () => {
        if (this.userHasInteracted) {
          this.showUI();
          this.scheduleUIHide();
        }
      });
      
      // Handle swipe gestures on mobile
      this.setupSwipeDetection();
      
      // Setup double-tap zoom
      this.setupDoubleTapZoom();
      
      // Window resize event
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth < 768;
      });
      
      // Close touch hint
      const closeHintBtn = document.querySelector('.btn-close-hint');
      if (closeHintBtn && this.touchHint) {
        closeHintBtn.addEventListener('click', () => {
          this.touchHint.classList.remove('active');
          localStorage.setItem('comic_verse_reader_hint_seen', 'true');
        });
      }
    }
    
    setupSwipeDetection() {
      let touchStartX, touchStartY;
      const threshold = 50; // Minimum swipe distance
      const restraint = 100; // Maximum perpendicular distance
      
      document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });
      
      document.addEventListener('touchend', (e) => {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const distX = touchEndX - touchStartX;
        const distY = touchEndY - touchStartY;
        
        // Detect horizontal swipe (only if vertical movement is limited)
        if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
          // Right swipe (previous page)
          if (distX > 0) {
            this.goToPage(this.currentPage - 1);
          } 
          // Left swipe (next page)
          else {
            this.goToPage(this.currentPage + 1);
          }
        }
      }, { passive: true });
    }
    
    setupDoubleTapZoom() {
      const pages = document.querySelectorAll('.comic-page');
      let lastTap = 0;
      
      pages.forEach(page => {
        page.addEventListener('touchend', (e) => {
          const currentTime = new Date().getTime();
          const tapLength = currentTime - lastTap;
          
          // Double tap detected
          if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
            
            // Toggle zoom
            if (this.isZoomed) {
              // Reset zoom
              pages.forEach(p => p.classList.remove('zoomed'));
              this.isZoomed = false;
            } else {
              // Apply zoom to current page
              page.classList.add('zoomed');
              this.isZoomed = true;
            }
          }
          
          lastTap = currentTime;
        });
      });
    }
    
    showUI() {
      if (this.isUIHidden) {
        this.header.classList.remove('hidden');
        this.footer.classList.remove('hidden');
        this.isUIHidden = false;
      }
    }
    
    hideUI() {
      if (!this.isUIHidden && !this.settingsPanel.classList.contains('active')) {
        this.header.classList.add('hidden');
        this.footer.classList.add('hidden');
        this.isUIHidden = true;
      }
    }
    
    scheduleUIHide() {
      this.cancelUIHide();
      this.uiTimeout = setTimeout(() => {
        this.hideUI();
      }, this.options.uiHideDelay);
    }
    
    cancelUIHide() {
      if (this.uiTimeout) {
        clearTimeout(this.uiTimeout);
        this.uiTimeout = null;
      }
    }
    
    checkFirstTimeVisitor() {
      if (this.touchHint && this.isMobile) {
        const hintSeen = localStorage.getItem('comic_verse_reader_hint_seen');
        if (!hintSeen) {
          setTimeout(() => {
            this.touchHint.classList.add('active');
          }, 1000);
        }
      }
    }
    
    showLoading() {
      // Create loading indicator if it doesn't exist
      if (!document.querySelector('.loading-indicator')) {
        const loading = document.createElement('div');
        loading.className = 'loading-indicator';
        loading.innerHTML = `
          <div class="spinner"></div>
          <div>Loading comic...</div>
        `;
        this.container.appendChild(loading);
      }
    }
    
    hideLoading() {
      // Remove loading indicator
      const loading = document.querySelector('.loading-indicator');
      if (loading) {
        loading.remove();
      }
    }
    
    showError(message) {
      // Create error message
      const error = document.createElement('div');
      error.className = 'error-message';
      error.textContent = message;
      
      // Clear container and show error
      this.container.innerHTML = '';
      this.container.appendChild(error);
    }
  }
  
  // Initialize reader when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on reader page
    if (document.querySelector('.reader-page')) {
      // Get URL parameters (for page number)
      const urlParams = new URLSearchParams(window.location.search);
      const startPage = parseInt(urlParams.get('page')) || 1;
      
      // Get comic ID from URL (if present)
      const comicId = urlParams.get('id') || '1';
      
      // Initialize comic reader
      const reader = new ComicReader({
        containerId: 'reader-container',
        pdfUrl: `/assets/comics/${comicId}.pdf`, // In a real site, this would be a server path
        startPage: startPage,
        zoomFactor: 1.0
      });
      
      // Add floating navigation buttons for mobile
      if (window.innerWidth < 768) {
        addMobileNavButtons();
      }
    }
  });
  
  // Add floating navigation buttons for mobile devices
  function addMobileNavButtons() {
    // Check if buttons already exist
    if (document.querySelector('.mobile-nav-buttons')) return;
    
    // Create container
    const container = document.createElement('div');
    container.className = 'mobile-nav-buttons';
    
    // Top button
    const topButton = document.createElement('button');
    topButton.className = 'btn-float btn-top';
    topButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    `;
    topButton.setAttribute('aria-label', 'Scroll to top');
    
    // Bottom button
    const bottomButton = document.createElement('button');
    bottomButton.className = 'btn-float btn-bottom';
    bottomButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;
    bottomButton.setAttribute('aria-label', 'Scroll to bottom');
    
    // Add event listeners
    topButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    bottomButton.addEventListener('click', () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
    
    // Add buttons to container
    container.appendChild(topButton);
    container.appendChild(bottomButton);
    
    // Add container to body
    document.body.appendChild(container);
    
    // Show/hide buttons based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        topButton.style.display = 'flex';
      } else {
        topButton.style.display = 'none';
      }
      
      if (window.scrollY + window.innerHeight < document.body.scrollHeight - 100) {
        bottomButton.style.display = 'flex';
      } else {
        bottomButton.style.display = 'none';
      }
    });
    
    // Initial check
    if (window.scrollY <= 100) {
      topButton.style.display = 'none';
    }
  }