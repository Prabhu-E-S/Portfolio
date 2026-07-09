/* -------------------------------------------------------------
 * AURA.CORE // MAIN JS CONTROLLER
 * Canvas image frame preloader & GSAP ScrollTrigger integration
 * ------------------------------------------------------------- */

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Project Configuration
const CONFIG = {
    frameCount: 240,
    framePath: (index) => `/Frames/ezgif-frame-${String(index).padStart(3, '0')}.jpg`
};

// Application State
const state = {
    loadedFramesCount: 0,
    images: [],
    currentFrameIndex: 0
};

// Select DOM Elements
const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d');
const preloader = document.getElementById('preloader');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('loader-percent');

// 1. Initial Canvas Scaling
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Redraw current frame on resize if loaded
    if (state.images[state.currentFrameIndex]) {
        drawFrame(state.currentFrameIndex);
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Target initial sizing

// 2. High-Performance Frame Drawing (object-fit: cover equivalent)
function drawFrame(index) {
    const img = state.images[index];
    if (!img) return;

    state.currentFrameIndex = index;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.width;
    const imgHeight = img.height;

    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let drawX = 0;
    let drawY = 0;

    if (canvasRatio > imgRatio) {
        // Canvas is wider than standard image ratio
        drawHeight = canvasWidth / imgRatio;
        drawY = (canvasHeight - drawHeight) / 2;
    } else {
        // Canvas is taller than standard image ratio
        drawWidth = canvasHeight * imgRatio;
        drawX = (canvasWidth - drawWidth) / 2;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// 3. Preload all 240 frames in-cache
function preloadFrames() {
    const loadPromises = [];

    for (let i = 1; i <= CONFIG.frameCount; i++) {
        const promise = new Promise((resolve) => {
            const img = new Image();
            img.src = CONFIG.framePath(i);
            img.onload = () => {
                state.loadedFramesCount++;
                updateLoadingProgress();
                resolve();
            };
            img.onerror = () => {
                console.error(`Aura core failed to load image at index ${i}: ${img.src}`);
                state.loadedFramesCount++;
                updateLoadingProgress();
                resolve();
            };
            state.images.push(img);
        });
        loadPromises.push(promise);
    }

    Promise.all(loadPromises).then(() => {
        setTimeout(onPreloaderComplete, 400);
    });
}

// Update loading percentages
function updateLoadingProgress() {
    const percent = Math.min(100, Math.floor((state.loadedFramesCount / CONFIG.frameCount) * 100));
    progressBar.style.width = `${percent}%`;
    progressPercent.innerText = `${percent}%`;
}

// Initialize website elements after preloader finishes
function onPreloaderComplete() {
    // Fade out preloader
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';

    // Draw the very first frame to establish context
    drawFrame(0);

    // Initialize ScrollTrigger mapping
    initScrollTimeline();

    // Initialize Custom Interactions (Cursor, Nav link states)
    initInteractivity();
}

// 4. Map scrolling timeline to Frame sequence using GSAP ScrollTrigger
function initScrollTimeline() {
    // Pin scroll animation section and tween frames
    ScrollTrigger.create({
        trigger: '#scroll-animation-section',
        start: 'top top',
        end: '+=200%', // Pins for 2 viewports worth of scroll before releasing
        pin: true,
        scrub: 0.5, // Inertia smoothing
        onUpdate: (self) => {
            const progress = self.progress;
            const frameIndex = Math.round(progress * (CONFIG.frameCount - 1));
            drawFrame(frameIndex);

            // Dynamically calculate opacity and vertical position fade
            const heroContent = document.getElementById('scroll-hero-content');
            if (heroContent) {
                // Fades linearly from 1 to 0 at progress = 0.3 (30%)
                let opacity = 1 - (progress / 0.3);
                if (opacity < 0) opacity = 0;
                if (opacity > 1) opacity = 1;
                heroContent.style.opacity = opacity;

                // Accompanying slide-up effect
                const translateY = progress * -60; // moves up by 60px max
                heroContent.style.transform = `translateY(${translateY}px)`;
            }
        }
    });

    // Track active navigation links based on current scroll position
    const navSections = ['scroll-animation-section', 'projects', 'experience'];
    navSections.forEach((id) => {
        ScrollTrigger.create({
            trigger: `#${id}`,
            start: 'top 50%',
            end: 'bottom 50%',
            onToggle: (self) => {
                if (self.isActive) {
                    const navLinks = document.querySelectorAll('.nav-link');
                    navLinks.forEach((link) => {
                        link.classList.remove('active', 'text-primary');
                        link.classList.add('text-on-surface-variant');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active', 'text-primary');
                            link.classList.remove('text-on-surface-variant');
                        }
                    });
                }
            }
        });
    });
}

// 5. Connect UI custom cursor controls & navigation updates
function initInteractivity() {
    // Custom Cursor tracking
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });
    }

    // Set interactive hover parallax to project cards
    document.querySelectorAll('.glass-panel').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Limit tilt degrees
            const tiltX = (y / rect.height) * -8;
            const tiltY = (x / rect.width) * 8;

            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
}

// Fire preloader
preloadFrames();
