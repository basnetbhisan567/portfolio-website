// ===== BHISAN BASNET PORTFOLIO - ADVANCED PORTFOLIO SYSTEM =====

document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🚀 SYSTEM DASHBOARD INITIALIZING...', 'color: #00FF41; font-size: 18px; font-weight: bold;');
    console.log('%cBhisan Basnet Portfolio v3.0 | Advanced Matrix System', 'color: #00FFFF; font-size: 12px;');

    // ===== 1. THEME MANAGER =====
    class ThemeManager {
        constructor() {
            this.themeToggle = document.querySelector('.theme-toggle');
            this.body = document.body;
            this.storageKey = 'portfolio-theme';
            this.init();
        }

        init() {
            if (!this.themeToggle) {
                console.error('Theme toggle button not found!');
                return;
            }

            // Load saved theme
            const savedTheme = localStorage.getItem(this.storageKey) || 'dark';
            this.setTheme(savedTheme);

            // Add click event
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
            
            // Update button icon
            this.updateButtonIcon();
        }

        setTheme(theme) {
            this.body.setAttribute('data-theme', theme);
            localStorage.setItem(this.storageKey, theme);
            this.updateButtonIcon();
            
            // Add smooth transition
            this.body.style.transition = 'background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1), color 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            
            setTimeout(() => {
                this.body.style.transition = '';
            }, 500);
        }

        toggleTheme() {
            const currentTheme = this.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        }

        updateButtonIcon() {
            const currentTheme = this.body.getAttribute('data-theme');
            const icon = this.themeToggle.querySelector('i');
            
            if (icon) {
                if (currentTheme === 'dark') {
                    icon.className = 'fas fa-sun';
                    this.themeToggle.title = 'Switch to Light Mode';
                } else {
                    icon.className = 'fas fa-moon';
                    this.themeToggle.title = 'Switch to Dark Mode';
                }
            }
        }
    }

    // ===== 2. TERMINAL EFFECTS =====
    class TerminalEffects {
        constructor() {
            this.typewriterText = document.getElementById('typewriter-text');
            this.typewriterCursor = document.getElementById('typewriter-cursor');
            this.init();
        }

        init() {
            if (this.typewriterText) {
                this.setupTypewriter();
            }
            
            // Start cursor blink
            if (this.typewriterCursor) {
                setInterval(() => {
                    this.typewriterCursor.style.opacity = this.typewriterCursor.style.opacity === '0' ? '1' : '0';
                }, 500);
            }
        }

        setupTypewriter() {
            const phrases = [
                "I'll be a C++ Developer",
                "I'll be a Systems Engineer",
                "I'll be a Full Stack Developer",
                "I'll be a Algorithm Designer",
                "I'll be a Problem Solver",
                "I'll be a Software Engineer"
            ];
            
            let phraseIndex = 0;
            let charIndex = 0;
            let isDeleting = false;
            let typeSpeed = 100;

            const type = () => {
                const currentPhrase = phrases[phraseIndex];
                
                if (isDeleting) {
                    this.typewriterText.textContent = currentPhrase.substring(0, charIndex - 1);
                    charIndex--;
                    typeSpeed = 50;
                } else {
                    this.typewriterText.textContent = currentPhrase.substring(0, charIndex + 1);
                    charIndex++;
                    typeSpeed = 100;
                }

                if (!isDeleting && charIndex === currentPhrase.length) {
                    isDeleting = true;
                    typeSpeed = 2000;
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    typeSpeed = 500;
                }

                setTimeout(type, typeSpeed);
            };
            
            setTimeout(type, 1000);
        }
    }

    // ===== 3. NAVIGATION SYSTEM =====
    class NavigationSystem {
        constructor() {
            this.navToggle = document.querySelector('.nav__toggle');
            this.navList = document.querySelector('.nav__list');
            this.navLinks = document.querySelectorAll('.nav__link');
            this.sections = document.querySelectorAll('section[id]');
            this.header = document.querySelector('.header');
            this.init();
        }

        init() {
            this.setupMobileMenu();
            this.setupSmoothScroll();
            this.setupActiveSection();
            this.setupHeaderEffects();
        }

        setupMobileMenu() {
            if (!this.navToggle || !this.navList) return;
            
            this.navToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
            
            // Close menu on link click
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });
            
            // Close on outside click
            document.addEventListener('click', (e) => {
                if (this.navList.classList.contains('active') && 
                    !this.navToggle.contains(e.target) && 
                    !this.navList.contains(e.target)) {
                    this.closeMenu();
                }
            });
            
            // Close on Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.navList.classList.contains('active')) {
                    this.closeMenu();
                }
            });
            
            // Auto-close on resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768 && this.navList.classList.contains('active')) {
                    this.closeMenu();
                }
            });
        }

        toggleMenu() {
            const isOpening = !this.navList.classList.contains('active');
            this.navList.classList.toggle('active');
            this.navToggle.classList.toggle('active');
            this.navToggle.setAttribute('aria-expanded', isOpening);
            
            // Toggle body scroll
            document.body.style.overflow = isOpening ? 'hidden' : '';
        }

        closeMenu() {
            this.navList.classList.remove('active');
            this.navToggle.classList.remove('active');
            this.navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        setupSmoothScroll() {
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (!href || !href.startsWith('#')) return;
                    
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        e.preventDefault();
                        this.scrollToElement(targetElement);
                    }
                });
            });
            
            // Back to top button
            const backToTopBtn = document.getElementById('back-to-top');
            if (backToTopBtn) {
                backToTopBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            }
        }

        scrollToElement(element) {
            const headerHeight = this.header?.offsetHeight || 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }

        setupActiveSection() {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const id = entry.target.id;
                            this.setActiveLink(id);
                        }
                    });
                },
                { threshold: 0.3, rootMargin: '-100px 0px -100px 0px' }
            );
            
            this.sections.forEach(section => observer.observe(section));
        }

        setActiveLink(sectionId) {
            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }

        setupHeaderEffects() {
            if (!this.header) return;
            
            let lastScroll = 0;
            
            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;
                
                if (currentScroll > 50) {
                    this.header.classList.add('scrolled');
                    
                    // Hide/show based on scroll direction
                    if (currentScroll > lastScroll && currentScroll > 100) {
                        this.header.style.transform = 'translateY(-100%)';
                    } else {
                        this.header.style.transform = 'translateY(0)';
                    }
                } else {
                    this.header.classList.remove('scrolled');
                    this.header.style.transform = 'translateY(0)';
                }
                
                lastScroll = currentScroll;
                
                // Show/hide back to top
                const backToTopBtn = document.getElementById('back-to-top');
                if (backToTopBtn) {
                    if (window.scrollY > 300) {
                        backToTopBtn.classList.add('show');
                    } else {
                        backToTopBtn.classList.remove('show');
                    }
                }
            });
        }
    }

    // ===== 4. MATRIX BACKGROUND =====
    class MatrixBackground {
        constructor() {
            this.canvas = document.getElementById('matrix-canvas');
            this.ctx = null;
            this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%+-=<>';
            this.columns = 0;
            this.drops = [];
            this.animationId = null;
            this.init();
        }

        init() {
            if (!this.canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                document.body.classList.add('reduced-motion');
                return;
            }
            
            this.setupCanvas();
            this.startAnimation();
            this.setupResizeHandler();
        }

        setupCanvas() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.ctx = this.canvas.getContext('2d');
            this.ctx.font = '14px "Fira Code", monospace';
            
            this.columns = Math.floor(this.canvas.width / 14);
            this.drops = Array(this.columns).fill(1);
        }

        startAnimation() {
            const draw = () => {
                // Semi-transparent overlay for trail effect
                this.ctx.fillStyle = 'rgba(13, 13, 13, 0.05)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                for (let i = 0; i < this.drops.length; i++) {
                    const char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    
                    // Gradient color
                    const gradient = this.ctx.createLinearGradient(0, this.drops[i], 0, this.drops[i] + 20);
                    gradient.addColorStop(0, '#00FF41');
                    gradient.addColorStop(0.5, '#FFFFFF');
                    gradient.addColorStop(1, '#00FF41');
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillText(char, i * 14, this.drops[i]);
                    
                    // Move drop down
                    this.drops[i] += 14;
                    
                    // Reset drop
                    if (this.drops[i] > this.canvas.height && Math.random() > 0.975) {
                        this.drops[i] = 0;
                    }
                }
                
                this.animationId = requestAnimationFrame(draw);
            };
            
            draw();
        }

        setupResizeHandler() {
            window.addEventListener('resize', () => {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.columns = Math.floor(this.canvas.width / 14);
                this.drops = Array(this.columns).fill(1);
            });
        }

        destroy() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
    }

    // ===== 5. SYSTEM TELEMETRY =====
    class SystemTelemetry {
        constructor() {
            this.cpuElement = document.getElementById('cpu-usage');
            this.cpuBar = document.getElementById('cpu-bar');
            this.memoryElement = document.getElementById('mem-usage');
            this.memoryBar = document.getElementById('mem-bar');
            this.networkElement = document.getElementById('net-speed');
            this.networkBar = document.getElementById('net-bar');
            this.systemTimeElement = document.getElementById('system-time');
            this.init();
        }

        init() {
            if (this.systemTimeElement) {
                this.updateSystemTime();
                setInterval(() => this.updateSystemTime(), 1000);
            }
            
            if (this.cpuElement) {
                this.updateTelemetry();
                setInterval(() => this.updateTelemetry(), 2000);
            }
        }

        updateTelemetry() {
            // Simulate realistic system stats
            const cpu = 15 + Math.random() * 50;
            const memory = 40 + Math.random() * 30;
            const network = 100 + Math.random() * 200;
            
            if (this.cpuElement) {
                this.cpuElement.textContent = `${cpu.toFixed(1)}%`;
                if (this.cpuBar) {
                    this.cpuBar.style.width = `${cpu}%`;
                }
            }
            
            if (this.memoryElement) {
                this.memoryElement.textContent = `${memory.toFixed(1)}%`;
                if (this.memoryBar) {
                    this.memoryBar.style.width = `${memory}%`;
                }
            }
            
            if (this.networkElement) {
                const speed = Math.round(network);
                this.networkElement.textContent = `${speed} KB/s`;
                if (this.networkBar) {
                    this.networkBar.style.width = `${Math.min(speed / 300 * 100, 100)}%`;
                }
            }
            
            // Add color coding
            if (cpu > 70) {
                this.cpuElement.style.color = '#ef4444';
                if (this.cpuBar) this.cpuBar.style.background = '#ef4444';
            } else if (cpu > 50) {
                this.cpuElement.style.color = '#f59e0b';
                if (this.cpuBar) this.cpuBar.style.background = '#f59e0b';
            } else {
                this.cpuElement.style.color = '#00FF41';
                if (this.cpuBar) this.cpuBar.style.background = '#00FF41';
            }
        }

        updateSystemTime() {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            
            if (this.systemTimeElement) {
                this.systemTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
            }
        }
    }

    // ===== 6. SKILL BADGES ANIMATION =====
    class SkillBadgesAnimation {
        constructor() {
            this.badges = document.querySelectorAll('.skill-badge-enhanced');
            this.observer = null;
            this.init();
        }

        init() {
            if (this.badges.length) this.setupBadgeAnimations();
        }

        setupBadgeAnimations() {
            // Setup Intersection Observer for scroll animations
            const options = {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            };
            
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateBadge(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, options);
            
            this.badges.forEach(badge => {
                this.observer.observe(badge);
                this.addHoverEffects(badge);
            });
        }

        animateBadge(badge) {
            // Reset animation
            badge.style.animation = 'none';
            badge.offsetHeight; // Trigger reflow
            
            // Add pop-in animation
            const delay = Array.from(this.badges).indexOf(badge) * 0.05;
            badge.style.animation = `skillPopIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${delay}s forwards`;
        }

        addHoverEffects(badge) {
            badge.addEventListener('mouseenter', () => {
                badge.style.transform = 'translateY(-10px) scale(1.05)';
                badge.style.boxShadow = '0 20px 40px rgba(0, 255, 65, 0.3)';
            });
            
            badge.addEventListener('mouseleave', () => {
                badge.style.transform = 'translateY(0) scale(1)';
                badge.style.boxShadow = '';
            });
        }
    }

    // Add CSS animation for skill badges
    const style = document.createElement('style');
    style.textContent = `
        @keyframes skillPopIn {
            0% {
                opacity: 0;
                transform: translateY(30px) scale(0.9);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .fade-in {
            animation: fadeInUp 0.8s ease-out both;
        }
    `;
    document.head.appendChild(style);

    // ===== 7. CONTACT FORM =====
    class ContactFormHandler {
        constructor() {
            this.form = document.getElementById('contact-form');
            this.init();
        }

        init() {
            if (!this.form) return;
            
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.setupEmailCopy();
        }

        async handleSubmit(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = this.form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                await this.simulateApiCall();
                
                // Show success message
                this.showSuccessMessage();
                
            } catch (error) {
                console.error('Error sending message:', error);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }

        simulateApiCall() {
            return new Promise((resolve) => {
                setTimeout(resolve, 2000);
            });
        }

        showSuccessMessage() {
            this.form.reset();
            
            const success = document.createElement('div');
            success.className = 'form-success';
            success.innerHTML = `
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Message Sent Successfully!</h3>
                <p style="color: var(--text-secondary);">Thank you for your message. I'll get back to you soon.</p>
            `;
            success.style.cssText = `
                text-align: center;
                padding: 40px 20px;
                animation: fadeIn 0.5s ease;
            `;
            
            this.form.style.display = 'none';
            this.form.parentNode.appendChild(success);
            
            // Reset after 5 seconds
            setTimeout(() => {
                success.remove();
                this.form.style.display = 'flex';
            }, 5000);
        }

        setupEmailCopy() {
            const emailLinks = document.querySelectorAll('[data-copy-email]');
            emailLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const email = link.href.replace('mailto:', '');
                    
                    navigator.clipboard.writeText(email).then(() => {
                        // Show copied state
                        const originalHTML = link.innerHTML;
                        link.innerHTML = '<i class="fas fa-check"></i> Copied!';
                        link.style.color = '#00FF41';
                        
                        // Reset after 2 seconds
                        setTimeout(() => {
                            link.innerHTML = originalHTML;
                            link.style.color = '';
                        }, 2000);
                    });
                });
            });
        }
    }

    // ===== 8. SCROLL ANIMATIONS =====
    class ScrollAnimations {
        constructor() {
            this.fadeElements = document.querySelectorAll('.fade-in');
            this.init();
        }

        init() {
            if (this.fadeElements.length) this.setupScrollAnimations();
        }

        setupScrollAnimations() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });
            
            this.fadeElements.forEach(el => observer.observe(el));
        }
    }

    // ===== 9. INITIALIZE EVERYTHING =====
    const initializePortfolio = () => {
        // Set current year
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
        
        // Initialize all components
        const themeManager = new ThemeManager();
        const terminalEffects = new TerminalEffects();
        const navigationSystem = new NavigationSystem();
        const matrixBackground = new MatrixBackground();
        const systemTelemetry = new SystemTelemetry();
        const skillBadgesAnimation = new SkillBadgesAnimation();
        const contactFormHandler = new ContactFormHandler();
        const scrollAnimations = new ScrollAnimations();
        
        // Dispatch initialization event
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('portfolioReady', {
                detail: {
                    timestamp: Date.now(),
                    version: '3.0.0',
                    theme: document.body.getAttribute('data-theme')
                }
            }));
            
            console.log('%c✅ PORTFOLIO SYSTEM READY', 'color: #00FF41; font-size: 16px; font-weight: bold;');
            console.log('%cAll systems operational | Advanced features active', 'color: #00FFFF; font-size: 12px;');
        }, 1000);
    };

    // Initialize everything
    initializePortfolio();
});

// ===== GLOBAL UTILITIES =====
// Prevent form resubmission
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}