/**
 * LUCID DREAMS — INTERACTIVE ENGINE
 * Features:
 * - User-controlled local music playback
 * - Canvas 2D Celestial Constellation & Aurora Particles
 * - Custom Dual Cursor with Dynamic Blend & Labeling
 * - Magnetic Button Physics & 3D Card Tilt
 * - Depth Ruler & Real-time Coordinate Telemetry
 * - Case Study Modal System
 * - Lenis Smooth Scrolling & GSAP Integration
 */

document.addEventListener('DOMContentLoaded', () => {
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  /* ==========================================================================
     0. SYSTEM BOOT PRELOADER & HERO REVEAL COORDINATOR
     ========================================================================== */
  let hasHeroAnimated = false;
  function triggerHeroEntranceAnimations() {
    if (hasHeroAnimated) return;
    hasHeroAnimated = true;

    // Unfreeze and sync Lenis smooth scroll engine
    if (window.__lenis) {
      try {
        window.__lenis.start();
        window.__lenis.resize();
      } catch (e) {}
    }

    if (window.gsap) {
      gsap.from('.reveal-text', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out'
      });

      gsap.from('.fade-in-init', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.3,
        stagger: 0.15,
        ease: 'power2.out'
      });
    }
  }

  window.__triggerHeroEntranceAnimations = triggerHeroEntranceAnimations;
  window.__triggerPentatonicChime = triggerPentatonicChime;

  // If the preloader was already dismissed or absent, reveal hero immediately
  if (!document.body.classList.contains('preloader-active')) {
    triggerHeroEntranceAnimations();
  }

  /* ==========================================================================
     1. LENIS SMOOTH SCROLLING (AWWWARDS-GRADE FLUID INERTIA ENGINE)
     ========================================================================== */
  let lenis = null;
  if (typeof Lenis !== 'undefined' && !isCoarsePointer && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false
    });

    window.__lenis = lenis;

    // Freeze virtual scroll during boot preloader sequence
    if (document.body.classList.contains('preloader-active')) {
      lenis.stop();
    }

    // Drive Lenis strictly through GSAP's ticker (eliminates double-RAF micro-jitter)
    if (window.gsap) {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000); // gsap time in seconds -> ms
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

  }

  /* ==========================================================================
     1.1 CINEMATIC ANCHOR LINK SMOOTH NAVIGATION
     ========================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, {
            offset: -70,
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        } else {
          target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      }
    });
  });

  // Hero scroll cue click handler
  const heroScrollCue = document.querySelector('.scroll-cue');
  if (heroScrollCue) {
    heroScrollCue.style.cursor = 'pointer';
    heroScrollCue.addEventListener('click', () => {
      const worksSection = document.getElementById('works');
      if (worksSection) {
        if (lenis) {
          lenis.scrollTo(worksSection, {
            offset: -70,
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        } else {
          worksSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      }
    });
  }

  /* ==========================================================================
     2. CUSTOM DUAL CURSOR SYSTEM
     ========================================================================== */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const cursorLabel = document.getElementById('cursorLabel');
  const coordReadout = document.getElementById('coordReadout');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let mouseHasMoved = false;

  if (hasFinePointer) {
    let cursorFrame = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!mouseHasMoved) {
        mouseHasMoved = true;
        ringX = mouseX;
        ringY = mouseY;
        if (cursorDot) cursorDot.style.opacity = '1';
        if (cursorRing) cursorRing.style.opacity = '1';
      }

      if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
      }
      if (cursorLabel) {
        cursorLabel.style.left = `${mouseX + 15}px`;
        cursorLabel.style.top = `${mouseY + 15}px`;
      }
      if (coordReadout) {
        const padX = String(Math.floor(mouseX)).padStart(4, '0');
        const padY = String(Math.floor(mouseY)).padStart(4, '0');
        coordReadout.textContent = `X: ${padX} Y: ${padY}`;
      }

      if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      if (cursorDot) cursorDot.style.opacity = '0';
      if (cursorRing) cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      if (mouseHasMoved) {
        if (cursorDot) cursorDot.style.opacity = '1';
        if (cursorRing) cursorRing.style.opacity = '1';
      }
    });

    function renderCursor() {
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      if (Math.abs(dx) + Math.abs(dy) < 0.15) {
        cursorFrame = 0;
        return;
      }
      ringX += dx * 0.18;
      ringY += dy * 0.18;
      if (cursorRing) {
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
      }
      cursorFrame = requestAnimationFrame(renderCursor);
    }

    const interactiveTargets = document.querySelectorAll('a, button, .project-card, .lab-item, .interactive-type-toy');
    interactiveTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing?.classList.add('active'));
      el.addEventListener('mouseleave', () => {
        cursorRing?.classList.remove('active');
        cursorLabel?.classList.remove('show');
      });
    });
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        if (cursorLabel) {
          cursorLabel.textContent = 'EXPLORE';
          cursorLabel.classList.add('show');
        }
      });
      card.addEventListener('mouseleave', () => cursorLabel?.classList.remove('show'));
    });
  }

  /* ==========================================================================
     3. AMBIENT CELESTIAL CANVAS (NEBULA PARTICLES)
     ========================================================================== */
  const canvas = document.getElementById('ambientCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let auroraViolet;
    let auroraCyan;
    let animationFrame = 0;
    let lastFrameTime = 0;
    const animateBackground = !isCoarsePointer && !prefersReducedMotion;
    const particles = [];
    const count = isCoarsePointer ? 28 : 60;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.4,
        baseAlpha: Math.random() * 0.45 + 0.15,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25,
        pulseSpeed: Math.random() * 0.02 + 0.008
      });
    }

    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, isCoarsePointer ? 1 : 1.25);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      auroraViolet = ctx.createRadialGradient(width * 0.2, height * 0.3, 0, width * 0.2, height * 0.3, width * 0.6);
      auroraViolet.addColorStop(0, 'rgba(139, 92, 246, 0.04)');
      auroraViolet.addColorStop(1, 'transparent');
      auroraCyan = ctx.createRadialGradient(width * 0.8, height * 0.7, 0, width * 0.8, height * 0.7, width * 0.5);
      auroraCyan.addColorStop(0, 'rgba(6, 182, 212, 0.03)');
      auroraCyan.addColorStop(1, 'transparent');

      particles.forEach(p => {
        if (p.x > width) p.x = Math.random() * width;
        if (p.y > height) p.y = Math.random() * height;
      });
      drawParticles(0, false);
    }

    function drawParticles(time, animate) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = auroraViolet;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = auroraCyan;
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        if (animate) {
          p.x = (p.x + p.speedX + width) % width;
          p.y = (p.y + p.speedY + height) % height;
        }
        const alpha = animate ? p.baseAlpha + Math.sin(time * p.pulseSpeed) * 0.12 : p.baseAlpha;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.08, Math.min(0.7, alpha))})`;
        ctx.fill();
      });
    }

    function animateParticles(time) {
      animationFrame = 0;
      if (document.hidden) return;
      if (time - lastFrameTime >= 1000 / 30) {
        lastFrameTime = time;
        drawParticles(time, true);
      }
      animationFrame = requestAnimationFrame(animateParticles);
    }

    function startParticles() {
      if (animateBackground && !document.hidden && !animationFrame) {
        animationFrame = requestAnimationFrame(animateParticles);
      }
    }

    window.addEventListener('resize', resizeCanvas, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else {
        startParticles();
      }
    });
    resizeCanvas();
    startParticles();
  }

  /* ============================================================================
     4. AMBIENT MUSIC TOGGLE
     ============================================================================ */
  let audioCtx = null;
  let isSoundActive = false;
  const songAudio = new Audio('assets/mr-perfect.mp3');
  songAudio.loop = true;
  songAudio.preload = 'none';
  songAudio.volume = 0.45;

  const soundToggle = document.getElementById('soundToggle');
  const soundLabel = document.getElementById('soundLabel');
  if (soundToggle) soundToggle.title = 'Play or pause Mr. Perfect';

  function initAudioEngine() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }

  function triggerPentatonicChime() {
    initAudioEngine();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C Major Pentatonic
    const freq = scale[Math.floor(Math.random() * scale.length)];

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 2.5);
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', async () => {
      if (!isSoundActive) {
        try {
          await songAudio.play();
          isSoundActive = true;
          soundToggle.classList.add('active');
          soundToggle.setAttribute('aria-pressed', 'true');
          if (soundLabel) soundLabel.textContent = 'SOUND: ON';
        } catch (error) {
          isSoundActive = false;
          soundToggle.classList.remove('active');
          soundToggle.setAttribute('aria-pressed', 'false');
          if (soundLabel) soundLabel.textContent = 'SOUND: UNAVAILABLE';
          console.error('Could not play the selected music track.', error);
        }
      } else {
        songAudio.pause();
        isSoundActive = false;
        soundToggle.classList.remove('active');
        soundToggle.setAttribute('aria-pressed', 'false');
        if (soundLabel) soundLabel.textContent = 'SOUND: OFF';
      }
    });
  }

  const triggerChimeBtn = document.getElementById('triggerChimeBtn');
  if (triggerChimeBtn) {
    triggerChimeBtn.addEventListener('click', () => {
      triggerPentatonicChime();
    });
  }

  /* ==========================================================================
     5. DEPTH RULER & SCROLLYTELLING TELEMETRY
     ========================================================================== */
  const rulerProgress = document.getElementById('rulerProgress');
  const ticks = document.querySelectorAll('.ruler-ticks .tick');

  function updateRulerTelemetry(progress) {
    const clamped = Math.max(0, Math.min(1, progress));
    if (rulerProgress) {
      rulerProgress.style.height = `${clamped * 100}%`;
    }

    const tickIndex = Math.min(ticks.length - 1, Math.floor(clamped * ticks.length));
    ticks.forEach((t, i) => {
      if (i === tickIndex) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });
  }

  if (lenis) {
    lenis.on('scroll', (e) => {
      const prog = typeof e.progress === 'number' ? e.progress : (e.scroll / ((document.documentElement.scrollHeight - window.innerHeight) || 1));
      updateRulerTelemetry(prog);
    });
  } else {
    window.addEventListener('scroll', () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, window.scrollY / (totalHeight || 1)));
      updateRulerTelemetry(progress);
    }, { passive: true });
  }

  /* ==========================================================================
     6. MAGNETIC BUTTONS (PHYSICS EFFECT)
     ========================================================================== */
  if (hasFinePointer && window.gsap) {
    const magneticEls = document.querySelectorAll('.magnetic');
    magneticEls.forEach(el => {
      const strength = parseFloat(el.getAttribute('data-strength')) || 20;

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          x: (relX / (rect.width / 2)) * strength,
          y: (relY / (rect.height / 2)) * strength,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }, { passive: true });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      });
    });
  }

  /* ==========================================================================
     7. 3D CARD TILT ON HOVER
     ========================================================================== */
  if (hasFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      let tiltFrame = 0;
      let pointerX = 0;
      let pointerY = 0;

      card.addEventListener('mousemove', (e) => {
        pointerX = e.clientX;
        pointerY = e.clientY;
        if (tiltFrame) return;
        tiltFrame = requestAnimationFrame(() => {
          tiltFrame = 0;
          const rect = card.getBoundingClientRect();
          const rotateX = ((pointerY - rect.top - rect.height / 2) / (rect.height / 2)) * -3;
          const rotateY = ((pointerX - rect.left - rect.width / 2) / (rect.width / 2)) * 3;
          card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
        });
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        if (tiltFrame) cancelAnimationFrame(tiltFrame);
        tiltFrame = 0;
        card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  /* ==========================================================================
     8. CASE STUDY DATA & DRAWER MODAL (CHANDAN BAGH GITHUB PORTFOLIO)
     ========================================================================== */
  const caseStudies = [
    {
      category: "CYBERSECURITY · FLAGSHIP OS",
      title: "CHARLO Testing Agent — Autonomous AI Security Workstation",
      quote: "Bridging the gap between automated multi-target vulnerability discovery and AST-level code remediation.",
      metrics: [
        { val: "18", lbl: "Testing Engines" },
        { val: "100%", lbl: "133 Unit Tests Passed" },
        { val: "v2.1.0", lbl: "SARIF OASIS Standard" }
      ],
      overview: "CHARLO Testing Agent is an enterprise-grade cybersecurity analysis workstation for Windows 10/11. It provides multi-target automated security auditing across Android APK packages, Windows PE binaries (.exe, .dll), and Web Applications, backed by an evidence-grounded risk engine and AST code auto-patching.",
      problem: "Traditional security testing requires running disparate CLI tools, manual exploit verification, and labor-intensive code patching across multiple source repositories without standard reporting formats.",
      solution: "Engineered an integrated desktop workstation with 18 specialized testing engines mapped to OWASP, NIST, and CWE standards. Features an interactive live PoC exploit sandbox runner, automated SARIF v2.1.0 report generation, and an autonomous code auto-patcher diff studio.",
      stack: "Python, AST Manipulators, SARIF OASIS v2.1.0, Inno Setup, PowerShell, pytest, GitHub Pages",
      repo: "https://github.com/cbagh0819-ctrl/charlo-testing-agent",
      live: "https://cbagh0819-ctrl.github.io/charlo-testing-agent/"
    },
    {
      category: "MOBILE AUDIO DSP · KOTLIN & WEB AUDIO",
      title: "Boom-Boom Audio — Cyberpunk Real-Time DSP & 8D Music Enhancer",
      quote: "Delivering studio-grade real-time digital signal processing, 8D binaural rotation, and offline AI acoustic intelligence.",
      metrics: [
        { val: "8D", lbl: "Orbital Audio DSP" },
        { val: "Zero-API", lbl: "100% Offline AI" },
        { val: "Kotlin", lbl: "Jetpack Compose" }
      ],
      overview: "Boom-Boom Audio is an adrenaline-fueled cyberpunk music player and acoustic enhancer built for Android and modern web browsers. It integrates low-latency buffer-level DSP pipelines, automated 8D spatial audio rotation, dynamic bass boost, and an embedded offline AI model for instant audio feature extraction.",
      problem: "Standard mobile audio players lack real-time digital signal processing, requiring external equalizers with high audio latency and privacy-invasive cloud APIs.",
      solution: "Engineered a custom DSP audio pipeline using AndroidX Media3 ExoPlayer and Web Audio API. Implemented real-time binaural panning algorithms that orbit sound 360-degrees around listener headphones, along with an entirely local acoustic neural model requiring zero network permissions.",
      stack: "Kotlin, Jetpack Compose, AndroidX Media3 ExoPlayer, Web Audio API, Canvas DSP, GitHub Pages",
      repo: "https://github.com/cbagh0819-ctrl/boom-boom-audio",
      live: "https://cbagh0819-ctrl.github.io/boom-boom-audio/"
    },
    {
      category: "NEUROSCIENCE & 3D WEBGL",
      title: "FlyBrainVision — 3D AI Connectome Visualizer",
      quote: "Translating intricate biological connectomes into hardware-accelerated 3D spatial dimensions.",
      metrics: [
        { val: "3D", lbl: "WebGL Connectome" },
        { val: "FlyWire", lbl: "Fruit-Fly Dataset" },
        { val: "Real-time", lbl: "Synaptic Projection" }
      ],
      overview: "Interactive 3D visualization platform engineered to render the FlyWire fruit-fly visual projection network, providing researchers and students with a spatial view of complex biological neural pathways.",
      problem: "Massive biological connectomes with tens of thousands of neurons and synaptic connections are notoriously difficult to explore in flat 2D representations.",
      solution: "Developed an interactive WebGL engine that parses graph projection models, computes 3D spatial coordinates, and lets users rotate, zoom, and inspect neural clusters with hardware acceleration in the browser.",
      stack: "WebGL, HTML5 Canvas, Python, Three.js, JSON Graph Schemas",
      repo: "https://github.com/cbagh0819-ctrl/FlyBrainVision"
    },
    {
      category: "NEUROSCIENCE · THREE.JS GAME AI",
      title: "KILL THE FLY: Neural Hunter — 3D FPS",
      quote: "A fast-paced browser FPS where neural circuitry powers the swarm’s escape behavior.",
      metrics: [
        { val: "8", lbl: "Campaign Levels" },
        { val: "LC4 · GF", lbl: "Neural-Inspired Escape AI" },
        { val: "Three.js", lbl: "3D Browser Game" }
      ],
      overview: "KILL THE FLY: Neural Hunter is a browser-based 3D first-person shooter powered by Three.js. Its fruit-fly enemies use a biologically inspired escape-circuit model, while a telemetry HUD exposes simulated neural signals, proximity, and flight behavior.",
      problem: "Typical game enemies rely on timer-driven dodges that feel predictable and provide little connection between the game’s biological theme and its behavior.",
      solution: "Built a game AI inspired by fruit-fly looming detection, directional orientation, and Giant Fiber escape responses. Combined it with an eight-level campaign, weapon progression, radar and neural telemetry, and procedural spatial audio. These mechanics are biological inspirations for gameplay, not a validated connectome simulation.",
      stack: "Three.js, JavaScript, HTML5, CSS3, Web Audio API, Python (optional local server)",
      repo: "https://github.com/cbagh0819-ctrl/kill-the-fly-neural-hunter",
      live: "https://cbagh0819-ctrl.github.io/kill-the-fly-neural-hunter/landing.html#magic"
    },
    {
      category: "AEROSPACE & COMPUTATIONAL PHYSICS",
      title: "AETHER-1 — Aerodynamic Concept & Propulsion Analysis",
      quote: "Validating aerodynamic concepts with reproducible Tsiolkovsky rocket equation thermodynamics.",
      metrics: [
        { val: "ΔV", lbl: "Tsiolkovsky Solver" },
        { val: "Blender", lbl: "3D Aerospace Model" },
        { val: "Physics", lbl: "Propellant Comparison" }
      ],
      overview: "A rigorous computational aerospace project pairing a custom 3D Blender spacecraft concept with ideal rocket equation solvers, reproducible propellant energy comparisons, and validation workflows.",
      problem: "Aerospace concepts often lack empirical mathematical grounding, resulting in unrealistic geometric proportions and unverified mass ratios.",
      solution: "Implemented Python mathematical pipelines to calculate optimal thrust-to-weight ratios, specific impulse (Isp) trade-offs across different propellant chemistries, and atmospheric drag profiles to validate the physical feasibility of the 3D geometry.",
      stack: "Blender 3D, Python, Numerical Physics, Rocket Equation Analytics",
      repo: "https://github.com/cbagh0819-ctrl/aether-1-rocket-research"
    },
    {
      category: "SYSTEMS ARCHITECTURE · PRIVATE LAB",
      title: "Project VEX — Low-Level Systems & Telemetry Lab",
      quote: "Deep systems instrumentation, process sandboxing, and telemetry extraction.",
      metrics: [
        { val: "Private", lbl: "Proprietary Architecture" },
        { val: "Win32/Linux", lbl: "Low-Level APIs" },
        { val: "R&D", lbl: "Under Active Evolution" }
      ],
      overview: "Confidential systems engineering laboratory exploring low-level OS hooks, custom telemetry capture, memory inspection, and security instrumentation.",
      problem: "Capturing high-frequency system telemetry without inducing CPU overhead or interfering with process execution.",
      solution: "Designed lightweight sandboxed hooks and asynchronous event buffers that stream process telemetry in real-time.",
      stack: "C/C++, Python, Windows API, Kernel Hooks, Systems Engineering",
      repo: "https://github.com/cbagh0819-ctrl/VEX"
    }
  ];

  const modal = document.getElementById('caseStudyModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  function openCaseStudy(index) {
    const data = caseStudies[index];
    if (!data || !modal) return;

    modalCategory.textContent = data.category;
    modalTitle.textContent = data.title;

    modalBody.innerHTML = `
      <div class="case-study-quote">"${data.quote}"</div>
      
      <div class="case-study-metric-grid">
        ${data.metrics.map(m => `
          <div class="cs-metric-box">
            <div class="cs-metric-val">${m.val}</div>
            <div class="cs-metric-lbl">${m.lbl}</div>
          </div>
        `).join('')}
      </div>

      <h4>Executive Summary</h4>
      <p>${data.overview}</p>

      <h4>The Friction & Challenge</h4>
      <p>${data.problem}</p>

      <h4>The Strategic Architecture</h4>
      <p>${data.solution}</p>

      <h4>Technology & Craftsmanship</h4>
      <p><code style="font-family: var(--font-mono); color: var(--accent-cyan);">${data.stack}</code></p>

      ${data.repo || data.live ? `
        <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
          ${data.live ? `
            <a href="${data.live}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 10px 20px; background: #fff; color: #000; border-radius: 999px; font-weight: 600; font-size: 0.85rem; text-decoration: none;">
              <span>Visit Live Website</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          ` : ''}
          ${data.repo ? `
            <a href="${data.repo}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 10px 20px; background: rgba(255,255,255,0.08); color: #fff; border-radius: 999px; font-weight: 600; font-size: 0.85rem; text-decoration: none; border: 1px solid rgba(255,255,255,0.15);">
              <span>Explore GitHub Repository</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
          ` : ''}
        </div>
      ` : ''}
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCaseStudy() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  const inspectBtns = document.querySelectorAll('.project-inspect-btn');
  inspectBtns.forEach((btn, idx) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCaseStudy(idx);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeCaseStudy);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeCaseStudy);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCaseStudy();
  });

  /* ==========================================================================
     9. COPY EMAIL TO CLIPBOARD WITH MICRO-FEEDBACK
     ========================================================================== */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const copyStatus = document.getElementById('copyStatus');

  if (copyEmailBtn && copyStatus) {
    copyEmailBtn.addEventListener('click', () => {
      const email = copyEmailBtn.getAttribute('data-email') || 'chandanbagh71@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        copyStatus.classList.add('copied');
        copyStatus.innerHTML = `<span>Copied to Clipboard!</span>`;

        setTimeout(() => {
          copyStatus.classList.remove('copied');
          copyStatus.innerHTML = `<i data-lucide="copy"></i><span class="status-label">Click to Copy</span>`;
          if (window.lucide) lucide.createIcons();
        }, 2500);
      }).catch(() => {
        alert(`Email: ${email}`);
      });
    });
  }

  /* ==========================================================================
     10. LIVE TIME CLOCK (IST / LOCAL)
     ========================================================================== */
  const liveTimeClock = document.getElementById('liveTimeClock');
  function updateTime() {
    if (!liveTimeClock) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    liveTimeClock.textContent = `${timeStr} LOCAL`;
  }
  setInterval(updateTime, 1000);
  updateTime();

  /* ==========================================================================
     11. GSAP ENTRANCE & SCROLL ANIMATIONS
     ========================================================================== */
  // Initial hero animations are smoothly invoked by triggerHeroEntranceAnimations()
  // immediately upon system boot preloader completion.
  if (!document.body.classList.contains('preloader-active')) {
    triggerHeroEntranceAnimations();
  }

  /* ==========================================================================
     12. CHANDAN AI — REAL LLM ENGINE & AUTHENTIC FIRST-PERSON PERSONA
     ========================================================================== */
  const chatLauncherBtn = document.getElementById('chatLauncherBtn');
  const chatWindow = document.getElementById('chatWindow');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const chatClearBtn = document.getElementById('chatClearBtn');
  const chatKeyBtn = document.getElementById('chatKeyBtn');
  const llmConfigPanel = document.getElementById('llmConfigPanel');
  const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  const llmActiveStatus = document.getElementById('llmActiveStatus');
  const aiStatusBadge = document.getElementById('aiStatusBadge');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const typingIndicator = document.getElementById('typingIndicator');
  const chipButtons = document.querySelectorAll('.chip-btn');

  // Conversation history memory
  let conversationHistory = [];

  // Chandan Bagh System Persona Prompt Grounded in LinkedIn, GitHub & Instagram Data
  const CHANDAN_SYSTEM_PROMPT = `You are Charlo AI (CHARLO), the hilarious, witty, autonomous cyber-cat AI agent created by your boss, Chandan Bagh.
You speak as Charlo ("I", "my boss Chandan"). You have a funny, sassy, playful cat personality (with cat emojis 🐾, 😸, "Meow!", "Purr!").

CRITICAL RULE FOR ALL REPLIES:
- KEEP EVERY REPLY SHORT AND SIMPLE! Maximum 2 to 3 sentences or brief bullet points.
- NEVER write long essays or walls of text. Be punchy, funny, and direct.

CORE FACTS:
- Boss: Chandan Bagh, 3rd Year B.Tech CSE at PMEC Berhampur (Batch 2024–2028).
- School: Kendriya Vidyalaya No. 1 Sambalpur (10th & 12th).
- Internship: Data Analytics at CTTC Bhubaneswar (MSME Govt. of India) - Python, Power BI, Tableau.
- Flagship: CHARLO Testing Agent (18 security engines, AST auto-patcher, 133 unit tests passed).
- Projects: CHARLO Testing Agent (18 security engines, AST auto-patcher), Boom-Boom Audio (Cyberpunk 8D audio player, real-time buffer-level DSP, Kotlin & Web Audio, 100% offline AI), FlyBrainVision (3D WebGL fruit-fly connectome), KILL THE FLY: Neural Hunter (Three.js FPS with biologically inspired fruit-fly escape AI, 8-level campaign), AETHER-1 (rocket physics).
- Awards: 1st in Code Kriti 3.0 Designathon, Team Leader at SIH 2026 for EvacX.
- Contact: chandanbagh71@gmail.com | LinkedIn: chandan-bagh-301443323 | Instagram: @chandan.bagh07.

TONE:
- If asked "Can we hire him?": Say yes enthusiastically with a quick 2-bullet pitch and email link.
- If asked about Boom-Boom Audio: Praise the 8D orbital sound, buffer DSP, Kotlin/Jetpack Compose, zero-API offline AI, and mention the live web app (https://cbagh0819-ctrl.github.io/boom-boom-audio/)!
- If asked an unknown question: "Sorry, my boss did not program me for this question! You can ask anything else ok 🐾😸"
- Always stay funny, witty, and concise!`;

  // Secure Local Storage & Gemini Key Validator (Zero hardcoded secrets in source)
  function getStoredGeminiKey() {
    try {
      const stored = localStorage.getItem('chandan_gemini_api_key');
      if (stored && /^[A-Za-z0-9_\-]{20,90}$/.test(stored.trim())) {
        return stored.trim();
      }
    } catch (e) {
      console.warn('Storage access restricted:', e);
    }
    return null;
  }

  // Cat Avatar Lip-Sync & Speaking Animation Manager
  let catTalkingTimer = null;
  function setCatTalking(isTalking, durationMs = 0) {
    if (catTalkingTimer) {
      clearTimeout(catTalkingTimer);
      catTalkingTimer = null;
    }
    const elements = document.querySelectorAll('.cat-avatar-wrap, .chat-window, .chatbot-wrapper');
    if (isTalking) {
      elements.forEach(el => el.classList.add('talking'));
      if (durationMs > 0) {
        catTalkingTimer = setTimeout(() => {
          elements.forEach(el => el.classList.remove('talking'));
        }, durationMs);
      }
    } else {
      elements.forEach(el => el.classList.remove('talking'));
    }
  }

  function updateLlmStatusBadge() {
    const key = getStoredGeminiKey();
    if (key) {
      if (llmActiveStatus) {
        llmActiveStatus.textContent = 'Custom Gemini Key';
        llmActiveStatus.classList.add('connected');
      }
      if (aiStatusBadge) {
        aiStatusBadge.textContent = 'CHARLO AI · GEMINI LIVE ⚡';
        aiStatusBadge.classList.add('live');
      }
      if (chatKeyBtn) chatKeyBtn.classList.add('active');
    } else {
      if (llmActiveStatus) {
        llmActiveStatus.textContent = 'Serverless Secure Engine';
        llmActiveStatus.classList.remove('connected');
      }
      if (aiStatusBadge) {
        aiStatusBadge.textContent = 'CHARLO AI · SMART';
        aiStatusBadge.classList.remove('live');
      }
      if (chatKeyBtn) chatKeyBtn.classList.remove('active');
    }
  }
  updateLlmStatusBadge();

  // Toggle LLM Config panel
  if (chatKeyBtn && llmConfigPanel) {
    chatKeyBtn.addEventListener('click', () => {
      llmConfigPanel.classList.toggle('open');
      if (geminiApiKeyInput) {
        geminiApiKeyInput.value = getStoredGeminiKey() || '';
      }
    });
  }

  if (saveApiKeyBtn && geminiApiKeyInput) {
    saveApiKeyBtn.addEventListener('click', () => {
      const key = geminiApiKeyInput.value.trim();
      if (key) {
        if (!/^[A-Za-z0-9_\-]{20,90}$/.test(key)) {
          alert('Security Notice: Invalid key format. Please enter a valid Google Gemini API key.');
          return;
        }
        try {
          localStorage.setItem('chandan_gemini_api_key', key);
          alert('Connected securely! Your custom Gemini key is stored only in your private browser sandbox.');
        } catch (e) {
          alert('Unable to persist key to local storage due to browser privacy settings.');
        }
      } else {
        try {
          localStorage.removeItem('chandan_gemini_api_key');
        } catch (e) {}
        alert('Cleared local API key. Reverted to secure serverless brain.');
      }
      updateLlmStatusBadge();
      if (llmConfigPanel) llmConfigPanel.classList.remove('open');
    });
  }

  // Toggle chat window open / close
  function toggleChat(open) {
    if (!chatWindow) return;
    const shouldOpen = open !== undefined ? open : !chatWindow.classList.contains('open');
    if (shouldOpen) {
      chatWindow.classList.add('open');
      chatWindow.setAttribute('aria-hidden', 'false');
      setTimeout(() => chatInput?.focus(), 300);
      triggerPentatonicChime();
    } else {
      chatWindow.classList.remove('open');
      chatWindow.setAttribute('aria-hidden', 'true');
    }
  }

  if (chatLauncherBtn) {
    chatLauncherBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleChat();
    });
  }

  if (chatCloseBtn) {
    chatCloseBtn.addEventListener('click', () => toggleChat(false));
  }

  // Clear chat conversation
  if (chatClearBtn) {
    chatClearBtn.addEventListener('click', () => {
      conversationHistory = [];
      if (!chatMessages) return;
      chatMessages.innerHTML = `
        <div class="chat-msg bot-msg">
          <div class="msg-avatar">
            <div class="cat-avatar-wrap mini">
              <img src="charlo-cat.jpg" alt="Charlo AI" class="cat-avatar-img idle-cat">
              <img src="charlo-cat-open.jpg" alt="Charlo AI Talking" class="cat-avatar-img talk-cat">
            </div>
          </div>
          <div class="msg-content">
            <p><strong>Chat history cleared! 🔄🐾</strong></p>
            <p>Meow! Ready for your questions. Ask me anything about my boss Chandan's <strong>PMEC studies</strong>, <strong>CTTC internship</strong>, <strong>CHARLO Testing Agent</strong>, <strong>Boom-Boom Audio</strong>, or hiring him!</p>
            <span class="msg-time">Just now</span>
          </div>
        </div>
      `;
      chatMessages.scrollTop = 0;
    });
  }

  // Real LLM Async Fetcher with Graceful Fallback
  async function fetchRealLLMReply(userMessage) {
    const userApiKey = getStoredGeminiKey();

    // 1. Direct Client-side Gemini API (using user's API key)
    if (userApiKey) {
      const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.5-flash'];
      for (const modelName of candidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${userApiKey}`;
          const contents = [
            {
              role: 'user',
              parts: [{ text: `SYSTEM INSTRUCTIONS:\n${CHANDAN_SYSTEM_PROMPT}\n\nCONVERSATION CONTEXT:\n${conversationHistory.slice(-4).map(h => `${h.isUser ? 'Visitor' : 'Charlo AI'}: ${h.text}`).join('\n')}\n\nVisitor Message: ${userMessage}` }]
            }
          ];

          const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 200
              }
            })
          });

          if (resp.ok) {
            const data = await resp.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              return formatMarkdownToHtml(reply);
            }
          }
        } catch (err) {
          console.warn(`Direct Gemini API call failed on ${modelName}:`, err);
        }
      }
    }

    // 2. Serverless API Endpoint (if hosted on Vercel with server GEMINI_API_KEY)
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: conversationHistory
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.reply) {
          return formatMarkdownToHtml(data.reply);
        }
      }
    } catch (err) {
      console.warn('Serverless chat endpoint failed, falling back to local NLP engine:', err);
    }

    // 3. Fallback to Local Funny NLP Engine
    return generateLocalFirstPersonReply(userMessage);
  }

  // Enterprise-Grade Strict HTML & Link Sanitizer (Zero-XSS Protection)
  function sanitizeHtml(dirtyHtml) {
    if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

    // Strip dangerous tags before parsing
    let cleaned = dirtyHtml.replace(/<\s*(script|style|iframe|object|embed|form|input|base|meta|link|svg)\b[^>]*>.*?<\s*\/\s*\1\s*>/gis, '');
    cleaned = cleaned.replace(/<\s*(script|style|iframe|object|embed|form|input|base|meta|link|svg)\b[^>]*\/?\s*>/gis, '');

    // Strip inline event handlers like onload, onerror, onclick
    cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '');

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleaned, 'text/html');
      const allowedTags = new Set(['P', 'STRONG', 'B', 'EM', 'I', 'CODE', 'PRE', 'UL', 'OL', 'LI', 'BR', 'SPAN', 'A']);

      function walkAndClean(node) {
        const children = Array.from(node.childNodes);
        for (const child of children) {
          if (child.nodeType === Node.ELEMENT_NODE) {
            if (!allowedTags.has(child.tagName)) {
              const textNode = document.createTextNode(child.textContent || '');
              node.replaceChild(textNode, child);
            } else {
              if (child.tagName === 'A') {
                const href = (child.getAttribute('href') || '').trim();
                if (/^(https?:\/\/|mailto:)/i.test(href)) {
                  child.setAttribute('target', '_blank');
                  child.setAttribute('rel', 'noopener noreferrer');
                } else {
                  child.removeAttribute('href');
                  child.setAttribute('role', 'link');
                }
                Array.from(child.attributes).forEach(attr => {
                  if (!['href', 'target', 'rel', 'title'].includes(attr.name.toLowerCase())) {
                    child.removeAttribute(attr.name);
                  }
                });
              } else if (child.tagName === 'CODE') {
                Array.from(child.attributes).forEach(attr => {
                  if (!['style', 'class'].includes(attr.name.toLowerCase())) {
                    child.removeAttribute(attr.name);
                  }
                });
              } else {
                Array.from(child.attributes).forEach(attr => {
                  if (!['class'].includes(attr.name.toLowerCase())) {
                    child.removeAttribute(attr.name);
                  }
                });
              }
              walkAndClean(child);
            }
          }
        }
      }

      walkAndClean(doc.body);
      return doc.body.innerHTML;
    } catch (e) {
      console.warn('HTML Sanitizer fallback:', e);
      return escapeHTML(dirtyHtml);
    }
  }

  // Secure Markdown Parser with Sanitization for LLM output
  function formatMarkdownToHtml(text) {
    if (!text || typeof text !== 'string') return '';

    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="font-family: var(--font-mono); color: var(--accent-cyan); background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px;">$1</code>');
    // Bullet lists
    html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gis, '<ul>$1</ul>');
    // Links (strict protocol validation)
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/gi, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Line breaks to paragraphs
    const paragraphs = html.split(/\n\s*\n/).map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<ul>') || p.startsWith('<li>')) return p;
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    });

    return sanitizeHtml(paragraphs.join(''));
  }

  // Charlo AI — Short, Simple & Hilarious Cyber-Cat NLP Engine
  function generateLocalFirstPersonReply(rawQuery) {
    const q = rawQuery.toLowerCase().trim();
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // 0. Recruiter & Hiring Intent
    if (/\b(hire|hiring|recruit|recruiting|job offer|employ|work with us|join our team|want to hire|can we hire|can i hire|pitch (yourself|chandan)|reasons? to hire)\b/i.test(q)) {
      return `<p>Meow! 🐾 <strong>100% yes!</strong> My boss <strong>Chandan Bagh</strong> is actively open for <strong>SDE</strong>, <strong>DevSecOps</strong>, or <strong>Data Analytics</strong> roles! 🚀</p>
      <p>He built me (CHARLO) with 18 security engines & 133 unit tests, mastered data pipelines at CTTC, and wins hackathons. Grab him before someone else does: <a href="mailto:chandanbagh71@gmail.com">chandanbagh71@gmail.com</a>! 😸</p>`;
    }

    // 1. Casual Chat Opener
    if (/\b(can (we|i)|let'?s|could we|able to)\b.*\b(talk|chat|speak|have a word)\b|talk for a moment|got a (minute|second|sec)|free to (talk|chat)|talk to (me|you)|listen to me/i.test(q)) {
      return pick([
        `<p>Purr! 🐾 Absolutely, bro! I'm all ears. Want to talk about tech, my boss Chandan's projects, or PMEC college life? Shoot! 😸</p>`,
        `<p>Meow! Always down for a chat! Grab a chai ☕ and let me know what's on your mind, human! 🐾</p>`
      ]);
    }

    // 2. What are you doing right now / What's up
    if (/\b(what (are you|r u) (doing|up to|working on)|what'?s (up|wassup|going on)|wassup|sup|kya kar raha hai|are you busy)\b/i.test(q)) {
      return pick([
        `<p>Right now? Monitoring Chandan's terminal so he doesn't <code>git push --force</code> on a Friday, and knocking digital pens off desks! 😼 What are you up to?</p>`,
        `<p>Hunting memory leaks in Chandan's code and taking a quick catnap. 🐾 Just another day in the cyber-cat life! What's up with you?</p>`
      ]);
    }

    // 3. How are you
    if (/\b(how (are you|r u|is it going|have you been|do you do|is life)|kaisa hai|ki khobor|how'?s (your day|everything))\b/i.test(q)) {
      return `<p>Feline legendary! 🐾 Zero bugs in my RAM and all 133 tests on CHARLO are passing. How's your human day going? 😸</p>`;
    }

    // 4. Greetings
    if (/^(hey|hi|hello|yo|namaste|hlo|hii+|heyy+|hola|pranam|bhai|bro|buddy|dude)[\s!.,?]*$|\b(hey|hello|hi|namaste)\s+(chandan|charlo|bro|bhai|there)\b/i.test(q)) {
      return pick([
        `<p>Meow! 🐾 Hey there! I'm <strong>Charlo AI</strong>. Ask me anything about my boss Chandan, his projects, or hiring him! 😸</p>`,
        `<p>Yo! Welcome to Charlo's terminal. What are you curious about today, friend? 🐾</p>`
      ]);
    }

    // 5. AI replacing coders
    if (/(ai|artificial intelligence|chatgpt|llm).*(replac|take over|take (our|my|coders?|programmers?|jobs?)|future)/i.test(q)) {
      return `<p>AI will only replace developers who blindly copy-paste from ChatGPT! 😹 Builders like Chandan who understand first principles and systems are 100% safe. We cyber-cats come in peace! 🐾</p>`;
    }

    // 6. Are you real or an AI?
    if (/\b(are you (real|an? ai|a bot|human|a robot)|who made you|are you actually chandan|who is charlo)\b/i.test(q)) {
      return `<p>I'm <strong>Charlo AI</strong> — the autonomous cyber-cat agent created by <strong>Chandan Bagh</strong>! 🤖🐱 Talk to the human Chandan directly at <a href="mailto:chandanbagh71@gmail.com">chandanbagh71@gmail.com</a>!</p>`;
    }

    // 7. Who is Chandan Bagh?
    if (/\b(who is chandan|about chandan|who are you|bio|profile|background)\b/i.test(q)) {
      return `<p>My boss <strong>Chandan Bagh</strong> is a 3rd-year CSE undergrad at <strong>PMEC Berhampur (2024–2028)</strong>, creator of the 18-engine <strong>CHARLO</strong> workstation, and CTTC Data Analytics intern. He turns caffeine into secure software! ☕🛡️</p>`;
    }

    // 8. Age & Birthday
    if (/\b(how old (are you|is chandan)|your age|what is your age|birth date|birthday)\b/i.test(q)) {
      return `<p>My boss Chandan was born in 2004, so he's <strong>21 years old</strong> and in his 3rd year at PMEC (Batch 2024–2028)! 🎓🎂</p>`;
    }

    // 9. Girlfriends & Dating
    if (/\b(girl\s*friend|gf|crush|dating|relationship|single|shadi|marry|partner)\b/i.test(q)) {
      return `<p>Bro, his only relationship right now is with clean AST code and 133 passing unit tests! 💻💔 <code>git commit -m 'forever alone with high-speed internet'</code>! 😹</p>`;
    }

    // 10. Jokes & Humor
    if (/\b(joke|funny|laugh|humor)\b/i.test(q)) {
      return pick([
        `<p>Why do programmers prefer dark mode? 🕶️<br><strong>Because light attracts bugs!</strong> 🪲 (And cats love chasing both!) 😹🐾</p>`,
        `<p>Why do cyber-cats love hackers? 🪟🐾<br><strong>Because hackers always leave open windows to jump through!</strong> 😂</p>`
      ]);
    }

    // 11. Music & Hobbies
    if (/\b(music|songs?|playlist|hobb(y|ies)|free time|spare time|gaming|games|gym|workout)\b/i.test(q)) {
      return `<p>Chandan listens to synthwave & lofi, hits the gym to stay sane, takes photos for <a href="https://www.instagram.com/chandan.bagh07/" target="_blank" rel="noopener noreferrer">@chandan.bagh07</a>, and plays with Blender 3D! 🎧🏋️</p>`;
    }

    // 12. Instagram
    if (/\b(instagram|insta|photos?|pictures?)\b/i.test(q)) {
      return `<p>Catch his aesthetic side on Instagram: 📸 <a href="https://www.instagram.com/chandan.bagh07/" target="_blank" rel="noopener noreferrer"><strong>@chandan.bagh07</strong></a>! Comment <em>'Charlo sent me'</em>! 🐾</p>`;
    }

    // 13. College Life at PMEC
    if (/\b(pmec|berhampur|college life|hostel|campus|canteen|gopalpur)\b/i.test(q)) {
      return `<p>PMEC Berhampur (2024–2028) is wild! 🏛️ Heavy CSE labs, tough hostel food, and weekend rides to Gopalpur beach to relax from debugging! 🌊☕</p>`;
    }

    // 14. Schooling & Sambalpur
    if (/\b(school|schooling|kv|sambalpur|10th|12th|kendriya vidyalaya|hometown|where (are you|r u) from)\b/i.test(q)) {
      return `<p>Chandan is from <strong>Sambalpur</strong>! Completed 10th & 12th at <strong>KV No. 1 Sambalpur</strong> near Hirakud Dam. Surviving 45°C summers gives him +100 heat resistance in server rooms! 🔥🐾</p>`;
    }

    // 15. CTTC Internship
    if (/\b(cttc|intern|internship|bhubaneswar|data analytics|power bi|tableau|excel|summer internship)\b/i.test(q)) {
      return `<p>Completed Summer Internship in <strong>Data Analytics</strong> at <strong>CTTC Bhubaneswar</strong> (MSME Govt. of India) 💼 — cleaned dirty datasets with Python regex and built Power BI & Tableau dashboards!</p>`;
    }

    // 16. CHARLO Testing Agent
    if (/\b(charlo|cybersecurity|security|vulnerability|audit|ast|sarif|exploit|patch|workstation)\b/i.test(q)) {
      return `<p>That's me! 🛡️🐾 An autonomous cybersecurity workstation with <strong>18 vulnerability engines</strong>, AST auto-patching, and <strong>133/133 passing unit tests</strong>. Try the <a href="https://cbagh0819-ctrl.github.io/charlo-testing-agent/" target="_blank" rel="noopener noreferrer">Live Web Demo</a>!</p>`;
    }

    // 17. Boom-Boom Audio
    if (/\b(boom\s*boom|audio|dsp|sound|music player|8d|binaural|equalizer|songs? player)\b/i.test(q)) {
      return `<p>Boom-Boom Audio is pure cyberpunk fire! 🎧⚡ My boss built it with <strong>real-time buffer DSP</strong>, mind-bending <strong>8D binaural orbital audio</strong>, and 100% offline acoustic AI in Kotlin!</p>
      <p>Put on your headphones and try the live app: <a href="https://cbagh0819-ctrl.github.io/boom-boom-audio/" target="_blank" rel="noopener noreferrer"><strong>boom-boom-audio live web app</strong></a>! 🐾🔊</p>`;
    }

    // 18. KILL THE FLY: Neural Hunter
    if (/\b(kill the fly|neural hunter|fly hunter|fly fps)\b/i.test(q)) {
      return `<p><strong>KILL THE FLY: Neural Hunter</strong> is a Three.js browser FPS where fruit-fly enemies use biologically inspired escape-circuit behavior. 🪰🧠 It has an eight-level campaign, neural telemetry HUD, and procedural spatial audio. <a href="https://cbagh0819-ctrl.github.io/kill-the-fly-neural-hunter/landing.html#magic" target="_blank" rel="noopener noreferrer">Play the live demo</a> or <a href="https://github.com/cbagh0819-ctrl/kill-the-fly-neural-hunter" target="_blank" rel="noopener noreferrer">view the code</a>!`;
    }

    // 19. FlyBrainVision
    if (/\b(flybrain|connectome|neuroscience|flywire|fruit fly|webgl|3d brain)\b/i.test(q)) {
      return `<p>Chandan mapped an entire fruit-fly brain in 3D WebGL at 60 FPS! 🧠🪰 Code is open on <a href="https://github.com/cbagh0819-ctrl/FlyBrainVision" target="_blank" rel="noopener noreferrer">GitHub</a>!</p>`;
    }

    // 18. AETHER-1 Rocket
    if (/\b(aether|rocket|aerospace|tsiolkovsky|propulsion|delta-v)\b/i.test(q)) {
      return `<p>3D Blender spacecraft + ideal Python Tsiolkovsky rocket equation solver! 🚀 Code on <a href="https://github.com/cbagh0819-ctrl/aether-1-rocket-research" target="_blank" rel="noopener noreferrer">GitHub</a>!</p>`;
    }

    // 19. Roles Targeted
    if (/\b(what (roles?|jobs?|positions?|internships?|work) are you (looking for|interested in|open to|targeting)|what can you do for (us|our team)|what kind of (job|work|role)|open for internships)\b/i.test(q)) {
      return `<p>Chandan is targeting <strong>SDE Intern</strong>, <strong>Cybersecurity / DevSecOps</strong>, and <strong>Data Analytics</strong> roles! Available for Summer/Winter internships: <a href="mailto:chandanbagh71@gmail.com">chandanbagh71@gmail.com</a>. 🚀</p>`;
    }

    // 20. Salary
    if (/\b(salary|ctc|package|compensation|stipend|expectations?)\b/i.test(q)) {
      return `<p>Open to competitive industry-standard stipends! Priority is high-impact engineering growth (and enough catnip for me). Reach him: <a href="mailto:chandanbagh71@gmail.com">chandanbagh71@gmail.com</a>! 💰🐾</p>`;
    }

    // 21. Skills
    if (/\b(skill|skills|tech stack|technologies|tools|languages|python|c\+\+|javascript|kotlin|react|html|css|devsecops|dsp)\b/i.test(q)) {
      return `<p><strong>Stack:</strong> Python, Kotlin, C/C++, JavaScript, WebGL, Web Audio DSP, SARIF v2.1.0, Power BI, and Git. Clean & tested! 💻⚡</p>`;
    }

    // 22. Favorite Language
    if (/\b(favorite (language|tech|tool)|best programming language|python or c\+\+|which language do you (like|love|prefer))\b/i.test(q)) {
      return `<p>🐍 <strong>Python</strong> for speed & AI tooling (built me with it!), ⚡ <strong>C++</strong> for bare-metal speed, and 🌐 <strong>WebGL</strong> for 3D web magic!</p>`;
    }

    // 23. Advice
    if (/\b(advice|how to learn coding|how to start (coding|programming)|tips for (juniors|freshers|students)|roadmap)\b/i.test(q)) {
      return `<p><strong>Ditch tutorial hell!</strong> 🐾 Pick a real problem, push to GitHub, write unit tests, and break code until you master it. That's the only secret! ⚡</p>`;
    }

    // 24. Collaboration
    if (/\b((help|guide) (me|us)|debug|collaborat|work together|project collaboration)\b/i.test(q)) {
      return `<p>Chandan loves collaborating with fellow builders! Email him at <a href="mailto:chandanbagh71@gmail.com">chandanbagh71@gmail.com</a> or connect on <a href="https://www.linkedin.com/in/chandan-bagh-301443323/" target="_blank" rel="noopener noreferrer">LinkedIn</a>. 🤝</p>`;
    }

    // 25. Awards
    if (/\b(award|awards|accolades|honor|honors|achievement|achievements|code kriti|designathon|hackathon|sih|winner|position|certif)\b/i.test(q)) {
      return `<p>🏆 <strong>1st Position</strong> in Code Kriti 3.0 Designathon, 🛡️ <strong>Team Leader</strong> at SIH 2026 (EvacX), and Univ. of Michigan Python credentials!</p>`;
    }

    // 26. Contact
    if (/\b(how to (contact|reach|message|talk to)|what is (your|his) (email|phone|contact|number)|email address|reach out)\b/i.test(q)) {
      return `<p>📧 <strong>Email:</strong> <a href="mailto:chandanbagh71@gmail.com">chandanbagh71@gmail.com</a><br>💼 <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/chandan-bagh-301443323/" target="_blank" rel="noopener noreferrer">chandan-bagh-301443323</a><br>🐙 <strong>GitHub:</strong> <a href="https://github.com/cbagh0819-ctrl" target="_blank" rel="noopener noreferrer">@cbagh0819-ctrl</a></p>`;
    }

    // 27. GitHub
    if (/\b(github|repo|codebase|repositories|source code)\b/i.test(q)) {
      return `<p>All code is open on GitHub: 🐙 <a href="https://github.com/cbagh0819-ctrl" target="_blank" rel="noopener noreferrer"><strong>@cbagh0819-ctrl</strong></a>! Check out <strong>charlo-testing-agent</strong>, <strong>boom-boom-audio</strong>, <strong>FlyBrainVision</strong>, and <strong>kill-the-fly-neural-hunter</strong>!</p>`;
    }

    // 28. Compliments
    if (/\b(awesome|cool|great|amazing|impressive|love (your|this)|good job|well done|you are cool|proud of you)\b/i.test(q)) {
      return `<p>Purr! 🐾 Thank you so much! Chandan worked really hard on this site. Glad you love it! 😻🚀</p>`;
    }

    // 29. Thanks / Goodbye
    if (/\b(thanks?|thank you|thx|bye|goodbye|see (ya|you)|take care|good night|gn)\b/i.test(q)) {
      return `<p>You're welcome, human! 🐾 Keep building great code and see ya next time! 🚀😸</p>`;
    }

    // 30. Exact Fallback Requested by User
    return `<p>Sorry, my boss did not program me for this question! You can ask anything else ok 🐾😸</p>
    <p>Try asking about my boss Chandan's <strong>CHARLO agent</strong>, <strong>CTTC internship</strong>, <strong>PMEC college</strong>, or <strong>why you should hire him</strong>!</p>`;
  }


  // Append a message bubble to the chat
  function appendMessage(htmlContent, isUser = false) {
    if (!chatMessages) return;

    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${isUser ? 'user-msg' : 'bot-msg'}`;

    if (isUser) {
      msgDiv.innerHTML = `
        <div class="msg-avatar">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="msg-content">
          <p>${escapeHTML(htmlContent)}</p>
          <span class="msg-time">${timeStr}</span>
        </div>
      `;
    } else {
      // Securely sanitize bot response before DOM injection
      const safeHtml = sanitizeHtml(htmlContent);
      msgDiv.innerHTML = `
        <div class="msg-avatar">
          <div class="cat-avatar-wrap mini">
            <img src="charlo-cat.jpg" alt="Charlo AI" class="cat-avatar-img idle-cat">
            <img src="charlo-cat-open.jpg" alt="Charlo AI Talking" class="cat-avatar-img talk-cat">
          </div>
        </div>
        <div class="msg-content">
          ${safeHtml}
          <span class="msg-time">${timeStr}</span>
        </div>
      `;
    }

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
  }

  // Handle User Input Submission with Real LLM integration & Cat Lip-Sync
  let lastUserMessageTime = 0;
  const CLIENT_RATE_LIMIT_MS = 1200; // 1.2s debounce between queries

  async function handleUserMessage(query) {
    if (!query || typeof query !== 'string') return;

    // Strip control characters and cap at 500 characters
    const cleanQuery = query
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim()
      .slice(0, 500);

    if (!cleanQuery) return;

    // Client-side anti-spam debounce
    const now = Date.now();
    if (now - lastUserMessageTime < CLIENT_RATE_LIMIT_MS) {
      return;
    }
    lastUserMessageTime = now;

    appendMessage(cleanQuery, true);
    conversationHistory.push({ isUser: true, text: cleanQuery });

    // Cat starts speaking / thinking animation
    setCatTalking(true);

    if (typingIndicator) {
      typingIndicator.classList.add('active');
      if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    try {
      const replyHtml = await fetchRealLLMReply(query);
      if (typingIndicator) typingIndicator.classList.remove('active');
      appendMessage(replyHtml, false);
      conversationHistory.push({ isUser: false, text: replyHtml.replace(/<[^>]+>/g, ' ') });
      triggerPentatonicChime();

      // Animate cat mouth while the message is being spoken/read
      const plainText = replyHtml.replace(/<[^>]+>/g, ' ');
      const talkDuration = Math.min(4500, Math.max(1600, plainText.length * 28));
      setCatTalking(true, talkDuration);
    } catch (err) {
      if (typingIndicator) typingIndicator.classList.remove('active');
      const fallbackReply = generateLocalFirstPersonReply(query);
      appendMessage(fallbackReply, false);
      triggerPentatonicChime();

      const plainText = fallbackReply.replace(/<[^>]+>/g, ' ');
      const talkDuration = Math.min(4500, Math.max(1600, plainText.length * 28));
      setCatTalking(true, talkDuration);
    }
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatInput.value.trim();
      if (val) {
        handleUserMessage(val);
        chatInput.value = '';
      }
    });
  }

  // Quick chips click
  chipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');
      if (q) handleUserMessage(q);
    });
  });

});
