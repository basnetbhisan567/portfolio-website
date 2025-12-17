/* ============================================
   Bhisan Basnet — Portfolio JS (Ultra Smooth 3D)
   Modern, responsive, 3D motion & polished animations
   ============================================ */

// ================= GLOBAL VARIABLES =================
let THREE = null;
let particles = [];
let mouseX = 0;
let mouseY = 0;
let scrollProgress = 0;
let isModalOpen = false;

// ================= DOM ELEMENTS =================
const DOM = {
  body: null,
  header: null,
  themeToggle: null,
  navToggle: null,
  navList: null,
  backToTop: null,
  sections: [],
  navLinks: [],
  cards: [],
  form: null,
  heroCanvas: null,
  exitModal: null
};

// ================= INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
  initializeElements();
  setupEventListeners();
  initializeAnimations();
  initialize3DCanvas();
  updateCurrentYear();
  checkReducedMotion();
});

// ================= ELEMENT INITIALIZATION =================
function initializeElements() {
  DOM.body = document.body;
  DOM.header = document.querySelector('.header');
  DOM.themeToggle = document.getElementById('theme-toggle');
  DOM.navToggle = document.querySelector('.nav__toggle');
  DOM.navList = document.getElementById('nav-list');
  DOM.backToTop = document.getElementById('back-to-top');
  DOM.sections = Array.from(document.querySelectorAll('main section[id]'));
  DOM.navLinks = Array.from(document.querySelectorAll('.nav__link'));
  DOM.cards = Array.from(document.querySelectorAll('.card, .project-card'));
  DOM.form = document.getElementById('contact-form');
  DOM.heroCanvas = document.getElementById('hero-canvas');
  DOM.exitModal = document.getElementById('exit-modal');
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {
  // Mobile Navigation
  if (DOM.navToggle && DOM.navList) {
    DOM.navToggle.addEventListener('click', toggleMobileNav);
    
    // Close mobile menu when clicking a link
    DOM.navLinks.forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!DOM.navToggle.contains(e.target) && !DOM.navList.contains(e.target)) {
        closeMobileNav();
      }
    });
  }
  
  // Theme Toggle
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Smooth Scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', handleSmoothScroll);
  });
  
  // Back to Top
  if (DOM.backToTop) {
    DOM.backToTop.addEventListener('click', scrollToTop);
  }
  
  // Window Events
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleResize);
  window.addEventListener('mousemove', handleMouseMove);
  
  // Keyboard Shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
  
  // Form Submission
  if (DOM.form) {
    DOM.form.addEventListener('submit', handleFormSubmit);
  }
  
  // Exit Intent Detection
  document.addEventListener('mouseleave', handleExitIntent);
}

// ================= MOBILE NAVIGATION =================
function toggleMobileNav() {
  const isExpanded = DOM.navToggle.getAttribute('aria-expanded') === 'true';
  DOM.navToggle.setAttribute('aria-expanded', !isExpanded);
  DOM.navList.classList.toggle('is-open');
  
  // Animate hamburger to X
  const lines = DOM.navToggle.querySelectorAll('.nav__toggle-line');
  if (!isExpanded) {
    lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    lines[1].style.opacity = '0';
    lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
  } else {
    lines[0].style.transform = 'none';
    lines[1].style.opacity = '1';
    lines[2].style.transform = 'none';
  }
}

function closeMobileNav() {
  DOM.navToggle.setAttribute('aria-expanded', 'false');
  DOM.navList.classList.remove('is-open');
  const lines = DOM.navToggle.querySelectorAll('.nav__toggle-line');
  lines[0].style.transform = 'none';
  lines[1].style.opacity = '1';
  lines[2].style.transform = 'none';
}

// ================= THEME MANAGEMENT =================
function toggleTheme() {
  const isDark = DOM.body.classList.contains('dark');
  const newTheme = isDark ? 'light' : 'dark';
  
  // Add transition class for smooth theme change
  DOM.body.classList.add('theme-transition');
  
  // Toggle theme classes
  DOM.body.classList.toggle('dark');
  DOM.body.classList.toggle('light');
  
  // Update button icon
  DOM.themeToggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
  
  // Save preference
  localStorage.setItem('theme', newTheme);
  
  // Update particles for new theme
  if (window.particlesJS) {
    updateParticlesForTheme(newTheme);
  }
  
  // Remove transition class after animation
  setTimeout(() => {
    DOM.body.classList.remove('theme-transition');
  }, 300);
}

function updateParticlesForTheme(theme) {
  const particleConfig = {
    particles: {
      color: {
        value: theme === 'dark' ? '#4e9af1' : '#3b82f6'
      },
      line_linked: {
        color: theme === 'dark' ? '#4e9af1' : '#3b82f6'
      }
    }
  };
  
  if (window.pJS) {
    window.pJS.fn.particlesRefresh(particleConfig);
  }
}

// ================= SMOOTH SCROLLING =================
function handleSmoothScroll(e) {
  const href = this.getAttribute('href');
  
  if (href === '#' || href === '#!') return;
  
  if (href.startsWith('#')) {
    e.preventDefault();
    const target = document.querySelector(href);
    
    if (target) {
      // Close mobile nav if open
      closeMobileNav();
      
      // Scroll to target
      const headerHeight = DOM.header ? DOM.header.offsetHeight : 0;
      const targetPosition = target.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Update URL without page reload
      history.pushState(null, null, href);
      
      // Focus on target for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus();
      setTimeout(() => target.removeAttribute('tabindex'), 1000);
    }
  }
}

// ================= SCROLL MANAGEMENT =================
function handleScroll() {
  updateHeaderOnScroll();
  updateBackToTopButton();
  updateActiveNavLink();
  updateScrollProgress();
  triggerScrollAnimations();
}

function updateHeaderOnScroll() {
  if (DOM.header) {
    const scrolled = window.scrollY > 50;
    DOM.header.classList.toggle('scrolled', scrolled);
  }
}

function updateBackToTopButton() {
  if (DOM.backToTop) {
    const showButton = window.scrollY > 300;
    DOM.backToTop.style.opacity = showButton ? '1' : '0';
    DOM.backToTop.style.visibility = showButton ? 'visible' : 'hidden';
  }
}

function updateActiveNavLink() {
  const scrollPosition = window.scrollY + 100;
  
  DOM.sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      DOM.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

function updateScrollProgress() {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  scrollProgress = (winScroll / height) * 100;
  
  // Update CSS variable for progress bar
  document.documentElement.style.setProperty('--scroll-progress', `${scrollProgress}%`);
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// ================= ANIMATIONS =================
function initializeAnimations() {
  // Intersection Observer for section reveals
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Animate progress bars in skills section
        if (entry.target.id === 'skills') {
          animateProgressBars();
        }
        
        // Animate skill tags
        if (entry.target.classList.contains('skills-list')) {
          animateSkillTags();
        }
        
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });
  
  // Observe all sections
  document.querySelectorAll('.section').forEach(section => {
    revealObserver.observe(section);
  });
  
  // Observe cards
  document.querySelectorAll('.card').forEach(card => {
    revealObserver.observe(card);
  });
}

function triggerScrollAnimations() {
  // Parallax effect for hero
  const hero = document.querySelector('.hero');
  if (hero) {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    hero.style.transform = `translate3d(0, ${rate}px, 0)`;
  }
}

function animateProgressBars() {
  const progressBars = document.querySelectorAll('.progress-fill');
  progressBars.forEach(bar => {
    const width = bar.getAttribute('data-width') || '80%';
    bar.style.width = width;
  });
}

function animateSkillTags() {
  const tags = document.querySelectorAll('.skill-tag');
  tags.forEach((tag, index) => {
    setTimeout(() => {
      tag.classList.add('animate-in');
    }, index * 50);
  });
}

// ================= 3D INTERACTIONS =================
function handleMouseMove(e) {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  
  // Apply 3D tilt to cards on mousemove
  applyCardTilt(e);
}

function applyCardTilt(e) {
  DOM.cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 5;
    const rotateX = ((centerY - y) / centerY) * 5;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    
    // Add shine effect
    const shine = card.querySelector('.card-shine') || createShineElement(card);
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;
    shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.3) 0%, transparent 80%)`;
  });
}

function createShineElement(card) {
  const shine = document.createElement('div');
  shine.className = 'card-shine';
  shine.style.position = 'absolute';
  shine.style.top = '0';
  shine.style.left = '0';
  shine.style.width = '100%';
  shine.style.height = '100%';
  shine.style.pointerEvents = 'none';
  shine.style.borderRadius = 'inherit';
  shine.style.zIndex = '1';
  card.style.position = 'relative';
  card.appendChild(shine);
  return shine;
}

function resetCardTilt() {
  DOM.cards.forEach(card => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

// ================= 3D CANVAS ANIMATION =================
function initialize3DCanvas() {
  if (!DOM.heroCanvas) return;
  
  const canvas = DOM.heroCanvas;
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  function setCanvasSize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  
  setCanvasSize();
  window.addEventListener('resize', setCanvasSize);
  
  // Particle system
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.color = DOM.body.classList.contains('dark') ? 
        `rgba(78, 154, 241, ${Math.random() * 0.5 + 0.1})` : 
        `rgba(59, 130, 246, ${Math.random() * 0.5 + 0.1})`;
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Bounce off edges
      if (this.x > canvas.width) this.speedX = -Math.abs(this.speedX);
      if (this.x < 0) this.speedX = Math.abs(this.speedX);
      if (this.y > canvas.height) this.speedY = -Math.abs(this.speedY);
      if (this.y < 0) this.speedY = Math.abs(this.speedY);
      
      // Mouse interaction
      const dx = mouseX * 100 - this.x;
      const dy = mouseY * 100 - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const angle = Math.atan2(dy, dx);
        this.x -= Math.cos(angle) * 0.5;
        this.y -= Math.sin(angle) * 0.5;
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }
  
  // Create particles
  const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 10000));
  particles = [];
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  // Draw connections between particles
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const opacity = 1 - (distance / 100);
          ctx.beginPath();
          ctx.strokeStyle = DOM.body.classList.contains('dark') ? 
            `rgba(78, 154, 241, ${opacity * 0.2})` : 
            `rgba(59, 130, 246, ${opacity * 0.2})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }
  
  // Draw floating name
  function drawFloatingName() {
    const name = "BHISAN BASNET";
    ctx.save();
    ctx.font = `bold ${Math.min(canvas.width * 0.1, 100)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, DOM.body.classList.contains('dark') ? '#4e9af1' : '#3b82f6');
    gradient.addColorStop(1, DOM.body.classList.contains('dark') ? '#f14e9a' : '#ef4444');
    
    // Draw with very low opacity
    ctx.fillStyle = DOM.body.classList.contains('dark') ? 
      'rgba(78, 154, 241, 0.02)' : 'rgba(59, 130, 246, 0.01)';
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);
    
    // Draw outline with even lower opacity
    ctx.strokeStyle = DOM.body.classList.contains('dark') ? 
      'rgba(241, 94, 166, 0.01)' : 'rgba(239, 68, 68, 0.01)';
    ctx.lineWidth = 1;
    ctx.strokeText(name, canvas.width / 2, canvas.height / 2);
    
    ctx.restore();
  }
  
  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw floating name
    drawFloatingName();
    
    // Update and draw particles
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    
    // Draw connections
    drawConnections();
    
    requestAnimationFrame(animate);
  }
  
  // Start animation
  animate();
}

// ================= FORM HANDLING =================
function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(DOM.form);
  const submitBtn = DOM.form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  // Show loading state
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  submitBtn.disabled = true;
  
  // Simulate API call (replace with actual Formspree)
  setTimeout(() => {
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <h3>Message Sent!</h3>
      <p>Thank you for reaching out. I'll get back to you soon.</p>
    `;
    
    DOM.form.parentNode.replaceChild(successMessage, DOM.form);
    
    // Reset button state after delay
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 3000);
  }, 1500);
}

// ================= EXIT INTENT MODAL =================
function handleExitIntent(e) {
  if (e.clientY <= 0 && !isModalOpen) {
    showExitModal();
  }
}

function showExitModal() {
  if (!DOM.exitModal) return;
  
  isModalOpen = true;
  DOM.exitModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Focus trap
  const focusableElements = DOM.exitModal.querySelectorAll('button');
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  firstFocusable.focus();
  
  DOM.exitModal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeExitModal();
    }
    
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });
}

function closeExitModal() {
  if (!DOM.exitModal) return;
  
  isModalOpen = false;
  DOM.exitModal.style.display = 'none';
  document.body.style.overflow = '';
}

function continueAction() {
  closeExitModal();
  // Track user decision (optional analytics)
  console.log('User chose to stay on the site');
}

function leaveSite() {
  // Redirect to external site
  window.location.href = 'https://github.com/bhisanb';
}

// ================= KEYBOARD SHORTCUTS =================
function handleKeyboardShortcuts(e) {
  const activeElement = document.activeElement;
  const isFormElement = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName);
  
  if (isFormElement) return;
  
  switch(e.key.toLowerCase()) {
    case 't':
      if (DOM.themeToggle && e.ctrlKey) {
        e.preventDefault();
        DOM.themeToggle.click();
      }
      break;
      
    case 'escape':
      if (isModalOpen) {
        closeExitModal();
      }
      break;
      
    case '1':
      if (e.ctrlKey) {
        e.preventDefault();
        document.querySelector('.nav__link[href="#hero"]')?.click();
      }
      break;
      
    case '2':
      if (e.ctrlKey) {
        e.preventDefault();
        document.querySelector('.nav__link[href="#projects"]')?.click();
      }
      break;
  }
}

// ================= UTILITY FUNCTIONS =================
function handleResize() {
  // Reset canvas size
  if (DOM.heroCanvas) {
    DOM.heroCanvas.width = DOM.heroCanvas.clientWidth;
    DOM.heroCanvas.height = DOM.heroCanvas.clientHeight;
  }
  
  // Close mobile nav on large screens
  if (window.innerWidth >= 860 && DOM.navList) {
    closeMobileNav();
  }
}

function updateCurrentYear() {
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

function checkReducedMotion() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Disable all animations
    document.documentElement.style.setProperty('--transition', 'none');
    document.documentElement.classList.add('reduced-motion');
  }
}

// ================= PERFORMANCE OPTIMIZATION =================
// Debounce function for resize events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Optimize event listeners
window.addEventListener('resize', debounce(handleResize, 250));
window.addEventListener('scroll', throttle(handleScroll, 100));

// ================= PROGRESSIVE ENHANCEMENT =================
// Check for WebGL support
function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch(e) {
    return false;
  }
}

// Fallback if WebGL not supported
if (!checkWebGLSupport() && DOM.heroCanvas) {
  DOM.heroCanvas.style.display = 'none';
  console.log('WebGL not supported, using CSS background instead');
}

// ================= SERVICE WORKER REGISTRATION =================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful');
    }).catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

// ================= ANALYTICS (Optional) =================
function trackEvent(category, action, label) {
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      'event_category': category,
      'event_label': label
    });
  }
  
  // Custom tracking
  console.log(`Event: ${category} - ${action} - ${label}`);
}

// Track page views
window.addEventListener('load', () => {
  trackEvent('Page', 'View', document.title);
});

// Track outbound links
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link && link.href && link.hostname !== window.location.hostname) {
    trackEvent('Outbound', 'Click', link.href);
  }
});

// Export for debugging (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    toggleTheme,
    showExitModal,
    closeExitModal
  };
}