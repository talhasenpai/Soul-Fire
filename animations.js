// animations.js — Soul Fire Creatrix: Ethereal Particle System + Scroll Animations

(function () {
  'use strict';

  /* ============================================================
     1. GLOBAL CANVAS PARTICLE SYSTEM
     Warm golden ember particles floating across the entire page
     ============================================================ */
  function initParticleSystem() {
    const canvas = document.createElement('canvas');
    canvas.id = 'soul-fire-particles';
    canvas.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      opacity: 1;
    `;
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Particle colours — warm amber/gold palette matching brand
    const COLOURS = [
      'rgba(184, 153, 115, VAL)',
      'rgba(212, 182, 150, VAL)',
      'rgba(196, 149, 108, VAL)',
      'rgba(152, 90, 69, VAL)',
      'rgba(240, 217, 181, VAL)',
    ];

    const PARTICLE_COUNT = window.innerWidth < 768 ? 40 : 80;

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * W;
        this.y = initial ? Math.random() * H : H + 10;
        this.size = Math.random() * 3 + 1;
        this.speedY = -(Math.random() * 0.4 + 0.15);
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.5 + 0.1;
        this.fadeInSpeed = Math.random() * 0.008 + 0.003;
        this.fadeOutStart = Math.random() * 0.3 + 0.5;
        this.life = 0;
        this.lifeSpeed = Math.random() * 0.002 + 0.0005;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.04 + 0.01;
        const colorTemplate = COLOURS[Math.floor(Math.random() * COLOURS.length)];
        this.color = colorTemplate;
        this.twinkle = Math.random() > 0.5;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life += this.lifeSpeed;
        this.pulse += this.pulseSpeed;

        if (this.life < this.fadeOutStart) {
          this.opacity = Math.min(this.opacity + this.fadeInSpeed, this.maxOpacity);
        } else {
          this.opacity -= this.fadeInSpeed * 1.5;
        }

        if (this.twinkle) {
          this.opacity += Math.sin(this.pulse) * 0.03;
          this.opacity = Math.max(0, Math.min(this.maxOpacity, this.opacity));
        }

        if (this.y < -10 || this.opacity <= 0) {
          this.reset();
        }
      }

      draw(ctx) {
        if (this.opacity <= 0) return;
        const color = this.color.replace('VAL', this.opacity.toFixed(3));

        ctx.save();
        ctx.beginPath();

        if (this.size > 2.5) {
          const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 2.5
          );
          gradient.addColorStop(0, this.color.replace('VAL', this.opacity.toFixed(3)));
          gradient.addColorStop(1, this.color.replace('VAL', '0'));
          ctx.fillStyle = gradient;
          ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
        } else {
          ctx.fillStyle = color;
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        }

        ctx.fill();
        ctx.restore();
      }
    }

    class Ember extends Particle {
      reset(initial = false) {
        super.reset(initial);
        this.size = Math.random() * 5 + 3;
        this.maxOpacity = Math.random() * 0.25 + 0.05;
        this.speedY = -(Math.random() * 0.25 + 0.08);
        this.lifeSpeed = Math.random() * 0.001 + 0.0003;
      }
    }

    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
    for (let i = 0; i < 8; i++) {
      particles.push(new Ember());
    }

    function animate() {
      if (!document.hidden) {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
          p.update();
          p.draw(ctx);
        });
      }
      requestAnimationFrame(animate);
    }

    animate();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
      }, 200);
    });
  }


  /* ============================================================
     2. SCROLL PROGRESS BAR
     ============================================================ */
  function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const scrollTop = document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      bar.style.width = ((scrollTop / docHeight) * 100) + '%';
    }, { passive: true });
  }


  /* ============================================================
     3. SCROLL REVEAL — IntersectionObserver
     ============================================================ */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll(
      '.reveal, .split-reveal-left, .split-reveal-right, .testimonial-list'
    );

    if (!revealEls.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.classList.contains('testimonial-list')) {
            entry.target.querySelectorAll('li').forEach((li, i) => {
              li.style.setProperty('--li-index', i);
            });
          }
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    revealEls.forEach((el) => {
      const siblings = el.parentElement ? [...el.parentElement.querySelectorAll('.reveal')] : [];
      const idx = siblings.indexOf(el);
      if (idx > 0 && !el.classList.contains('reveal-delay-1') &&
          !el.classList.contains('reveal-delay-2') &&
          !el.classList.contains('reveal-delay-3')) {
        el.style.setProperty('--stagger-index', idx);
      }
      observer.observe(el);
    });
  }


  /* ============================================================
     4. HERO WORD ANIMATION
     ============================================================ */
  function initHeroWordAnimation() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;

    heroTitle.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) return;
      if (node.nodeType === Node.ELEMENT_NODE) {
        const text = node.textContent.trim();
        const words = text.split(' ').filter(w => w);
        node.innerHTML = words.map((w, i) =>
          `<span class="word-animate" style="--word-index:${i}">${w}</span>`
        ).join(' ');
      }
    });

    setTimeout(() => {
      document.querySelectorAll('.word-animate').forEach(w => w.classList.add('visible'));
    }, 200);
  }


  /* ============================================================
     5. STEPS PROGRESS LINE
     ============================================================ */
  function initStepsProgressLine() {
    const stepsEl = document.querySelector('.steps');
    if (!stepsEl) return;

    const line = document.createElement('div');
    line.className = 'steps-progress-line';
    stepsEl.appendChild(line);

    function updateLine() {
      const rect = stepsEl.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0% when section top hits viewport bottom, 100% when section bottom hits viewport top
      const filled = vh - rect.top;
      const total = vh + rect.height;
      const progress = Math.min(1, Math.max(0, filled / total));
      line.style.height = (progress * 100) + '%';
    }

    window.addEventListener('scroll', updateLine, { passive: true });
    updateLine();
  }


  /* ============================================================
     6. 3D CARD TILT
     ============================================================ */
  function initCardTilt() {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const tiltX = ((y - centerY) / centerY) * -6;
        const tiltY = ((x - centerX) / centerX) * 6;
        card.style.setProperty('--tilt-x', tiltX + 'deg');
        card.style.setProperty('--tilt-y', tiltY + 'deg');
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }


  /* ============================================================
     7. MAGNETIC BUTTON EFFECT
     ============================================================ */
  function initMagneticButtons() {
    document.querySelectorAll('.btn-hero-cta, .btn-cta').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) translateY(-3px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }


  /* ============================================================
     8. BUTTON CLICK RIPPLE
     ============================================================ */
  function initRippleEffect() {
    document.querySelectorAll('.btn-primary, .btn-cta, .btn-hero-cta').forEach(btn => {
      btn.style.overflow = 'hidden';
      btn.style.position = 'relative';

      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height) * 2;
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${e.clientX - rect.left - size / 2}px;
          top: ${e.clientY - rect.top - size / 2}px;
          background: rgba(255,255,255,0.25);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple-expand 0.6s ease-out forwards;
          pointer-events: none;
          z-index: 10;
        `;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      });
    });
  }


  /* ============================================================
     9. PARALLAX on scroll
     ============================================================ */
  function initParallax() {
    const orbs = document.querySelectorAll('[data-parallax]');
    if (!orbs.length) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      orbs.forEach(orb => {
        const speed = parseFloat(orb.dataset.parallax) || 0.1;
        orb.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }, { passive: true });
  }


  /* ============================================================
     10. NAV SCROLL EFFECT
     ============================================================ */
  function initNavScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }


  /* ============================================================
     11. MOBILE MENU TOGGLE
     ============================================================ */
  function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }


  /* ============================================================
     12. KEN BURNS observer
     ============================================================ */
  function initKenBurns() {
    // Elements with .ken-burns-active in HTML are the permanent candidates.
    // We store references, then toggle .ken-burns-playing to control animation.
    // CSS must use .ken-burns-active img for the animation (already set).
    // This approach: observe the element, add/remove .ken-burns-active based on visibility.
    // We first capture all candidates using a data attribute added at query time.
    const kenEls = document.querySelectorAll('.ken-burns-active');
    kenEls.forEach(el => el.setAttribute('data-ken-burns', ''));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ken-burns-active');
        } else {
          entry.target.classList.remove('ken-burns-active');
        }
      });
    }, { threshold: 0.2 });

    // Observe using the stable data attribute
    document.querySelectorAll('[data-ken-burns]').forEach(el => observer.observe(el));
  }


  /* ============================================================
     14. SMOOTH SCROLL for anchor links
     ============================================================ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    initParticleSystem();
    initScrollProgress();
    initScrollReveal();
    initHeroWordAnimation();
    initStepsProgressLine();
    initCardTilt();
    initMagneticButtons();
    initRippleEffect();
    initParallax();
    initNavScroll();
    initMobileMenu();
    initKenBurns();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
