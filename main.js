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

// Projects Data Schema for Hover Slideshows and details Popup modals
const PROJECTS_DATA = {
    "physical-reporting": {
        title: "NITC Token System",
        subtitle: "Campus Admission Slots & Live Queue Tracking",
        description: "A full-stack admission management platform that enables online slot booking, document verification, live queue tracking, role-based admin workflows, secure authentication, and automated token management for a seamless campus reporting experience.",
        explanation: "Developed a full-stack web application to digitize and streamline the physical admission reporting process at NIT Calicut. The system enables students to book reporting slots, upload required documents, track live queue status, and download their final admission slip. It also provides role-based admin dashboards for multi-stage verification, queue management, late reporting handling, secure authentication, and automated token generation, significantly improving the efficiency of the on-campus admission workflow.",
        images: [
            "/images/Project%201/1.png",
            "/images/Project%201/2.png",
            "/images/Project%201/3.png",
            "/images/Project%201/4.png"
        ],
        githubUrl: "https://github.com/Prabhu-E-S/NITC-Physical-Reporting",
        tags: ["HTML", "JavaScript", "SQLite", "Python", "FlaskAPI"]
    },
    "exoplanet": {
        title: "Exoplanet Detection ML",
        subtitle: "AI-powered Exoplanet Detection & Classification",
        description: "Built an intelligent pipeline for analyzing NASA TESS light curves using Box Least Squares (BLS) and XGBoost. The system automatically detects transit signals, extracts astrophysical parameters, classifies candidates, and generates confidence-aware scientific reports with interactive visualizations.",
        explanation: "Developed an end-to-end AI-assisted pipeline for detecting and classifying exoplanet transit signals from NASA TESS light curves. The system processes raw FITS files, applies Box Least Squares (BLS) to identify periodic transits, extracts astrophysical features, retrieves stellar metadata from the TESS Input Catalog, and classifies signals using an XGBoost model trained on NASA TOI datasets. It generates scientifically interpretable outputs including orbital period, transit depth, transit duration, signal-to-noise ratio, confidence scores, and interactive visualizations, providing an automated workflow for exoplanet candidate analysis.",
        images: [
            "/images/Project%202/1.jpg",
            "/images/Project%202/2.png",
            "/images/Project%202/3.png"
        ],
        githubUrl: "https://github.com/Prabhu-E-S/Exoplanet-Detection",
        tags: ["Python", "XGBoost", "Scikit-Learn", "Lightkurve", "NASA-MAST", "Matplotlib"]
    },
    "carbon-wise": {
        title: "AI-Powered Carbon Footprint Awareness Platform",
        subtitle: "Carbon Reducing Tracker",
        description: "Track your carbon footprint, complete eco challenges, and receive AI-powered sustainability guidance.",
        explanation: "Developed CarbonWise AI, a full-stack web application that helps users track, analyze, and reduce their carbon footprint through AI-driven insights. The platform enables users to log daily activities, calculate CO₂ emissions, visualize environmental impact with interactive dashboards, participate in sustainability challenges, and receive personalized recommendations from an AI sustainability coach. Built with Next.js 15, TypeScript, Tailwind CSS, Prisma, SQLite, NextAuth, and OpenAI API, the application features secure authentication, real-time analytics, leaderboards, and responsive UI, making sustainable living engaging and data-driven.",
        images: [
            "/images/Project%203/1.png",
            "/images/Project%203/2.png",
            "/images/Project%203/3.png"
        ],
        githubUrl: "https://github.com/Prabhu-E-S/Carbon-FootPrint",
        tags: ["Next.js 15", "TailwindCSS", "TypeScript", "SQLite"]
    },
    "robo-arm": {
        title: "Robotic Manipulator Simulation with Kinematics & Trajectory Planning",
        subtitle: "3-Dof Robo Arm",
        description: "Track your carbon footprint, complete eco challenges, and receive AI-powered sustainability guidance.",
        explanation: "Developed a 3-DOF robotic manipulator simulation as part of a robotics internship under BSERC (in collaboration with ISRO). The manipulator was virtually modeled in MATLAB Simulink (Simscape Multibody), while Python was used to implement Denavit–Hartenberg (DH) based Forward and Inverse Kinematics. A numerical Jacobian-based inverse kinematics solver achieved sub-millimeter end-effector accuracy (~0.13 mm). The project also included a pick-and-place simulation using cubic trajectory planning, producing smooth joint motion and 3D trajectory visualization. This project strengthened my understanding of robotic kinematics, trajectory generation, and simulation-driven robotic control.",
        images: [
            "/images/Project%204/1.jpg",
            "/images/Project%204/2.png",
            "/images/Project%204/3.png"
        ],
        githubUrl: "https://github.com/Prabhu-E-S/Robotic-Manipulator",
        tags: ["MATLAB Simulink", "Simscape Multibody", "Python", "Forward Kinematics", "Jacobian Inverse Solver"]
    }
};

// Global Interval State tracking
let cardHoverIntervals = {};
let modalSlideshowInterval = null;

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
    const navSections = ['scroll-animation-section', 'projects', 'experience', 'skills', 'about'];
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

    // Set interactive hover parallax to project cards only (excluding modals)
    document.querySelectorAll('[data-project-id]').forEach((card) => {
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

    // Initialize Hover slideshows
    initHoverSlideshows();

    // Initialize Modal popup window integration
    initProjectModal();

    // Initialize Project filter categories
    initProjectFilters();

    // Initialize PCB Background Canvas Animations
    initPCBBg();
}

// 6. Project Cards Hover Slideshow (0.3s cycle)
// 6. Project Cards Hover Slideshow (1.0s sliding transit)
function initHoverSlideshows() {
    document.querySelectorAll('[data-project-id]').forEach((card) => {
        const id = card.getAttribute('data-project-id');
        const project = PROJECTS_DATA[id];
        if (!project || !project.images || project.images.length === 0) return;

        const imgContainer = card.querySelector('.h-48.relative');
        if (!imgContainer) return;

        // Clean container of any stray img or shade
        imgContainer.innerHTML = '';

        // Create slider track
        const track = document.createElement('div');
        track.className = 'card-slideshow-track w-full h-full flex';
        track.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        track.style.width = `${project.images.length * 100}%`;

        project.images.forEach((imgSrc) => {
            const slideImg = document.createElement('img');
            slideImg.className = 'project-card-img h-full object-cover flex-shrink-0';
            slideImg.style.width = `${100 / project.images.length}%`;
            slideImg.src = imgSrc;
            track.appendChild(slideImg);
        });

        imgContainer.appendChild(track);

        let index = 0;

        card.addEventListener('mouseenter', () => {
            // Start rotating every 1s
            if (cardHoverIntervals[id]) clearInterval(cardHoverIntervals[id]);
            cardHoverIntervals[id] = setInterval(() => {
                index = (index + 1) % project.images.length;
                track.style.transform = `translateX(-${(index * 100) / project.images.length}%)`;
            }, 1000);
        });

        card.addEventListener('mouseleave', () => {
            if (cardHoverIntervals[id]) {
                clearInterval(cardHoverIntervals[id]);
                delete cardHoverIntervals[id];
            }
            index = 0;
            track.style.transform = `translateX(0%)`;
        });
    });
}

// 7. Project Details Popup Modal (1.5s sliding transit on left panel)
function initProjectModal() {
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('modal-close');

    console.log("initProjectModal called. modal:", modal, "closeBtn:", closeBtn);
    if (!modal || !closeBtn) {
        console.warn("initProjectModal aborted: elements not found.");
        return;
    }

    // Open handler
    document.querySelectorAll('[data-project-id]').forEach((card) => {
        const id = card.getAttribute('data-project-id');
        console.log("Registering click for project card ID:", id);

        card.addEventListener('click', (e) => {
            console.log("Project card clicked. ID:", id, "Target:", e.target);

            // If click targeted the view repo link, let it behave normally.
            if (e.target.closest('a')) {
                console.log("Clicked inside a link, ignoring modal open");
                return;
            }

            try {
                const project = PROJECTS_DATA[id];
                console.log("Project card data:", project);
                if (!project) return;

                // Stop hover cycle on card if active to avoid glitches
                if (cardHoverIntervals[id]) {
                    clearInterval(cardHoverIntervals[id]);
                    delete cardHoverIntervals[id];
                }

                // Fill Text Details
                const titleEl = document.getElementById('modal-project-title');
                const subtitleEl = document.getElementById('modal-project-subtitle');
                const explanationEl = document.getElementById('modal-project-explanation');

                if (titleEl) titleEl.innerText = project.title;
                if (subtitleEl) subtitleEl.innerText = project.subtitle;
                if (explanationEl) explanationEl.innerText = project.explanation;

                // Set github url
                const githubBtn = document.getElementById('modal-github-btn');
                if (githubBtn) githubBtn.href = project.githubUrl;

                // Render tags
                const tagsContainer = document.getElementById('modal-project-tags');
                if (tagsContainer) {
                    tagsContainer.innerHTML = '';
                    project.tags.forEach(tag => {
                        const tagSpan = document.createElement('span');
                        tagSpan.className = "text-xs font-label-mono text-tertiary bg-tertiary/10 px-2.5 py-1 rounded-full border border-tertiary/20";
                        tagSpan.innerText = tag;
                        tagsContainer.appendChild(tagSpan);
                    });
                }

                // Setup dynamic slide track for modal
                const modalImg = document.getElementById('modal-slideshow-img');
                const dotsContainer = document.getElementById('modal-slideshow-dots');

                if (modalImg && modalImg.parentElement) {
                    const slideshowContainer = modalImg.parentElement;

                    // Create sliding track
                    let track = document.getElementById('modal-slideshow-track');
                    if (!track) {
                        track = document.createElement('div');
                        track.id = 'modal-slideshow-track';
                        track.className = 'w-full h-full flex';
                        track.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                        slideshowContainer.appendChild(track);
                        modalImg.style.display = 'none'; // hide original element
                    }

                    track.innerHTML = '';
                    track.style.width = `${project.images.length * 100}%`;
                    track.style.transform = 'translateX(0%)';

                    project.images.forEach((imgSrc) => {
                        const slideImg = document.createElement('img');
                        // Use contain bg-black/80 to fit the image fully inside the window without crop!
                        slideImg.className = 'h-full object-contain bg-black/80 flex-shrink-0';
                        slideImg.style.width = `${100 / project.images.length}%`;
                        slideImg.src = imgSrc;
                        track.appendChild(slideImg);
                    });

                    // Render dot indicators
                    if (dotsContainer) {
                        dotsContainer.innerHTML = '';
                        project.images.forEach((_, imgIdx) => {
                            const dot = document.createElement('div');
                            dot.className = `modal-dot w-1.5 h-1.5 rounded-full ${imgIdx === 0 ? 'bg-primary' : 'bg-white/30'}`;
                            dotsContainer.appendChild(dot);
                        });
                    }

                    // Start 1.5s slide cycle on the left side of the modal
                    let modalImgIdx = 0;
                    if (modalSlideshowInterval) clearInterval(modalSlideshowInterval);

                    modalSlideshowInterval = setInterval(() => {
                        modalImgIdx = (modalImgIdx + 1) % project.images.length;
                        track.style.transform = `translateX(-${(modalImgIdx * 100) / project.images.length}%)`;

                        // Highlight active dot marker
                        if (dotsContainer) {
                            const dots = dotsContainer.querySelectorAll('.modal-dot');
                            dots.forEach((dot, dotIdx) => {
                                if (dotIdx === modalImgIdx) {
                                    dot.className = "modal-dot w-1.5 h-1.5 rounded-full bg-primary";
                                } else {
                                    dot.className = "modal-dot w-1.5 h-1.5 rounded-full bg-white/30";
                                }
                            });
                        }
                    }, 1500);
                }

                // Open overlay transitions
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                setTimeout(() => {
                    modal.classList.remove('opacity-0');
                    modal.classList.add('opacity-100');
                    console.log("Modal classes updated to visible:", modal.className);
                }, 10);
            } catch (err) {
                console.error("Error opening modal inside click listener:", err);
            }
        });
    });

    // Close handler
    function closeModal() {
        console.log("closeModal triggered");
        if (modalSlideshowInterval) {
            clearInterval(modalSlideshowInterval);
            modalSlideshowInterval = null;
        }

        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.classList.remove('flex');
            modal.classList.add('hidden');

            // Reset all card images to original thumbnails
            document.querySelectorAll('[data-project-id]').forEach(card => {
                const id = card.getAttribute('data-project-id');
                const project = PROJECTS_DATA[id];
                const track = card.querySelector('.card-slideshow-track');
                if (project && track) {
                    track.style.transform = `translateX(0%)`;
                }
            });
        }, 300);
    }

    closeBtn.addEventListener('click', closeModal);

    // Close modal on click outside card
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Escape listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// 8. Project Filtering Logic (All, AI/ML, Web Dev, Robotics)
function initProjectFilters() {
    const filterButtons = document.querySelectorAll('#projects .tech-chip');
    const projectCards = document.querySelectorAll('[data-project-id]');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active styling of buttons
            filterButtons.forEach(btn => {
                btn.classList.remove('text-primary', '!bg-primary/20', '!border-primary');
                btn.classList.add('text-on-surface-variant');
            });
            button.classList.add('text-primary', '!bg-primary/20', '!border-primary');
            button.classList.remove('text-on-surface-variant');

            const filter = button.textContent.trim().replace(/\s+/g, ' ').toLowerCase();

            projectCards.forEach(card => {
                const id = card.getAttribute('data-project-id');
                const project = PROJECTS_DATA[id];

                // Get tags from DOM spans
                const domTags = Array.from(card.querySelectorAll('.text-xs.font-label-mono, .font-label-mono'))
                    .map(el => el.textContent.trim().replace(/\s+/g, ' ').toLowerCase());

                // Get tags from PROJECTS_DATA
                const dataTags = (project && project.tags)
                    ? project.tags.map(t => t.toLowerCase())
                    : [];

                const combinedTags = [...new Set([...domTags, ...dataTags])];

                const isAll = filter === 'all';
                const hasTag = combinedTags.includes(filter);

                if (isAll || hasTag) {
                    // Show card with GSAP
                    gsap.to(card, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.4,
                        ease: 'power2.out',
                        clearProps: 'transform,opacity',
                        onStart: () => {
                            card.style.display = '';
                        }
                    });
                } else {
                    // Hide card with GSAP
                    gsap.to(card, {
                        opacity: 0,
                        scale: 0.9,
                        duration: 0.3,
                        ease: 'power2.in',
                        onComplete: () => {
                            card.style.display = 'none';
                        }
                    });
                }
            });
        });
    });
}

// 9. Calm & Premium PCB Background Canvas with Glowing Sparks & Floating Particles
function initPCBBg() {
    const canvas = document.getElementById('pcb-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let traces = [];
    let activePulses = [];
    let particles = [];

    // State for mouse parallax
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    // Track mouse coordinate for subtle parallax depth
    window.addEventListener('mousemove', (e) => {
        targetParallaxX = ((e.clientX - window.innerWidth / 2) / (window.innerWidth / 2)) * 12;
        targetParallaxY = ((e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)) * 12;
    });

    // Helper: calculate distance between two points
    function dist(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }

    // Generate PCB Traces procedurally
    function generatePCBLayout() {
        traces = [];
        const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, 4000);

        // Number of primary trunk trace pathways
        const numTrunkLines = 25;

        for (let i = 0; i < numTrunkLines; i++) {
            let path = [];
            // Random start point across document height
            let startX = Math.random() * (width - 100) + 50;
            let startY = Math.random() * (docHeight - 300) + 100;
            path.push({ x: startX, y: startY });

            let numSegments = Math.floor(Math.random() * 3) + 3; // 3 to 5 segments
            let currX = startX;
            let currY = startY;

            for (let j = 0; j < numSegments; j++) {
                let segmentLength = Math.random() * 150 + 80; // 80px to 230px

                // Directions: 0-Right, 90-Down, 45-DownRight, 135-DownLeft, 180-Left
                const dirs = [0, 45, 90, 135, 180];
                let dir = dirs[Math.floor(Math.random() * dirs.length)];

                if (dir === 0) {
                    currX += segmentLength;
                } else if (dir === 45) {
                    currX += segmentLength * 0.707;
                    currY += segmentLength * 0.707;
                } else if (dir === 135) {
                    currX -= segmentLength * 0.707;
                    currY += segmentLength * 0.707;
                } else if (dir === 90) {
                    currY += segmentLength;
                } else if (dir === 180) {
                    currX -= segmentLength;
                }

                // Constrain within bounds
                currX = Math.max(50, Math.min(width - 50, currX));

                path.push({ x: currX, y: currY });
            }

            traces.push({
                points: path,
                branches: [] // We'll compute branches next
            });
        }

        // Procedurally build branches at circuit intersections
        // If a vertex in trace A is close to a vertex in trace B, register a branching pointer
        for (let i = 0; i < traces.length; i++) {
            for (let j = 0; j < traces.length; j++) {
                if (i === j) continue;

                // Compare points
                for (let pi = 1; pi < traces[i].points.length - 1; pi++) {
                    const ptA = traces[i].points[pi];

                    for (let pj = 0; pj < traces[j].points.length; pj++) {
                        const ptB = traces[j].points[pj];

                        if (dist(ptA, ptB) < 15) {
                            // Snap points to exact match to look clean
                            ptB.x = ptA.x;
                            ptB.y = ptA.y;

                            traces[i].branches.push({
                                pointIndex: pi,
                                targetTraceIndex: j,
                                targetPointIndex: pj
                            });
                        }
                    }
                }
            }
        }
    }

    // Generate Floating ambient particles
    function generateAmbientParticles() {
        particles = [];
        const numParticles = 75;
        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.2, // neutral drift
                vy: (Math.random() - 0.5) * 0.2, // neutral drift
                radius: Math.random() * 2 + 1, // 1px to 3px
                phase: Math.random() * Math.PI * 2,
                fadeSpeed: Math.random() * 0.01 + 0.005,
                opacity: Math.random()
            });
        }
    }

    // Seed initial pulses
    function spawnPulse(forceTraceIdx = null) {
        if (traces.length === 0) return;
        const colorPalette = ['#00E5FF', '#3B82F6', '#7C3AED', '#00E5FF'];

        let pathIdx = forceTraceIdx !== null ? forceTraceIdx : Math.floor(Math.random() * traces.length);
        let trace = traces[pathIdx];
        if (!trace || trace.points.length < 2) return;

        activePulses.push({
            traceIndex: pathIdx,
            segmentIndex: 0,
            progress: 0.0, // 0 to 1 along segment
            speed: Math.random() * 0.008 + 0.006, // slow, elegant motion
            color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
            width: Math.random() * 1.0 + 1.2,
            isBranch: forceTraceIdx !== null, // branched pulses don't branch again recursively
            history: [] // track coordinates for gradient tail drawing
        });
    }

    // Setup elements
    generatePCBLayout();
    generateAmbientParticles();

    // Spawn starting pulses
    for (let i = 0; i < 12; i++) {
        spawnPulse();
    }

    // Resize handler
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        generatePCBLayout();
        generateAmbientParticles();
    });

    // Main animation frame loop
    function animate() {
        requestAnimationFrame(animate);

        // Smooth cursor parallax interpolation
        currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
        currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;

        // Clear view space
        ctx.clearRect(0, 0, width, height);

        const scrollY = window.scrollY;

        // Fade in particles container as user scrolls past home hero area
        // Fades from 0 to 1 as screen scrolls from 100px to 600px
        const particleOpacityMult = Math.min(1, Math.max(0, (scrollY - 100) / 500));

        // 1. Draw static traces faded in the background
        ctx.shadowBlur = 0; // turn off shadow effects for traces rendering
        ctx.beginPath();
        traces.forEach(trace => {
            // Frustum/viewport check: only draw paths currently on screen (or close to it)
            let isVisible = false;
            for (let i = 0; i < trace.points.length; i++) {
                const drawY = trace.points[i].y - scrollY;
                if (drawY >= -200 && drawY <= height + 200) {
                    isVisible = true;
                    break;
                }
            }

            if (isVisible && trace.points.length > 0) {
                // Apply parallax translation on draw
                const startPtX = trace.points[0].x + currentParallaxX * 0.2;
                const startPtY = trace.points[0].y - scrollY + currentParallaxY * 0.2;
                ctx.moveTo(startPtX, startPtY);

                for (let i = 1; i < trace.points.length; i++) {
                    const ptX = trace.points[i].x + currentParallaxX * 0.2;
                    const ptY = trace.points[i].y - scrollY + currentParallaxY * 0.2;
                    ctx.lineTo(ptX, ptY);
                }
            }
        });
        ctx.strokeStyle = `rgba(165, 237, 255, 0.035)`; // very faint cyan track lines
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 2. Animate and Render Active Current Pulses
        // Loop backwards to allow in-flight removal
        for (let i = activePulses.length - 1; i >= 0; i--) {
            let pulse = activePulses[i];
            let trace = traces[pulse.traceIndex];

            // If trace disappeared or segment index invalid
            if (!trace || pulse.segmentIndex >= trace.points.length - 1) {
                activePulses.splice(i, 1);
                if (activePulses.length < 12) spawnPulse();
                continue;
            }

            let pStart = trace.points[pulse.segmentIndex];
            let pEnd = trace.points[pulse.segmentIndex + 1];

            // Calculate current exact coordinate
            let currentX = pStart.x + (pEnd.x - pStart.x) * pulse.progress;
            let currentY = pStart.y + (pEnd.y - pStart.y) * pulse.progress;

            // Apply parallax coordinates on draw
            let drawX = currentX + currentParallaxX * 0.2;
            let drawY = currentY - scrollY + currentParallaxY * 0.2;

            // History for trail glow
            pulse.history.push({ x: drawX, y: drawY });
            if (pulse.history.length > 12) {
                pulse.history.shift();
            }

            // Draw glowing tail
            if (drawY >= -50 && drawY <= height + 50) {
                ctx.beginPath();
                if (pulse.history.length > 1) {
                    ctx.moveTo(pulse.history[0].x, pulse.history[0].y);
                    for (let h = 1; h < pulse.history.length; h++) {
                        ctx.lineTo(pulse.history[h].x, pulse.history[h].y);
                    }
                }

                // Gradient stroke matching pulse head color fading to tail black opacity
                const gradient = ctx.createLinearGradient(
                    pulse.history[0].x, pulse.history[0].y,
                    drawX, drawY
                );
                gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
                gradient.addColorStop(0.3, pulse.color + '22'); // 13% opacity
                gradient.addColorStop(0.7, pulse.color + '88'); // 53% opacity
                gradient.addColorStop(1, pulse.color);           // 100% opacity

                ctx.strokeStyle = gradient;
                ctx.lineWidth = pulse.width;
                ctx.stroke();

                // Spark spark head circle
                ctx.beginPath();
                ctx.arc(drawX, drawY, pulse.width + 0.8, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF'; // bright header core

                // Add soft neon drop shadow glow during spark render
                ctx.shadowColor = pulse.color;
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0; // reset shadow immediately to preserve performance
            }

            // Advance progress
            pulse.progress += pulse.speed;

            // Handle segment transitions / completions
            if (pulse.progress >= 1.0) {
                pulse.progress = 0.0;
                pulse.segmentIndex++;

                // Intersection Branching
                // Trigger branching probability when transition occurs at trace intersections
                if (!pulse.isBranch && trace.branches && trace.branches.length > 0) {
                    trace.branches.forEach(branch => {
                        if (branch.pointIndex === pulse.segmentIndex && Math.random() < 0.25) {
                            // Check if branch source trace exists and spawn branch spark
                            const bTrace = traces[branch.targetTraceIndex];
                            if (bTrace && branch.targetPointIndex < bTrace.points.length - 1) {
                                // Spawn a short branch spark
                                activePulses.push({
                                    traceIndex: branch.targetTraceIndex,
                                    segmentIndex: branch.targetPointIndex,
                                    progress: 0.0,
                                    speed: pulse.speed * 1.1, // slightly faster branching motion
                                    color: pulse.color,
                                    width: pulse.width * 0.9, // slightly thinner branching line
                                    isBranch: true, // prevent branch loops
                                    history: []
                                });
                            }
                        }
                    });
                }

                // If path completely finished
                if (pulse.segmentIndex >= trace.points.length - 1) {
                    activePulses.splice(i, 1);
                    if (activePulses.length < 12) spawnPulse();
                }
            }
        }

        // Spawning natural pulses over time
        if (activePulses.length < 12 && Math.random() < 0.008) {
            spawnPulse();
        }

        // 3. Render and update Floating Ambient Particles
        if (particleOpacityMult > 0.01) {
            particles.forEach(p => {
                // Update position
                p.x += p.vx;
                p.y += p.vy;
                p.phase += p.fadeSpeed;

                // Wrap around edges
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Naturally oscillate opacity
                const oscOpacity = (Math.sin(p.phase) + 1) / 2 * p.radius * 0.2;
                const finalOpacity = oscOpacity * particleOpacityMult;

                if (finalOpacity > 0.01) {
                    // Parallax depth applied (different depth coefficient than traces)
                    const drawPx = p.x + currentParallaxX * p.radius * 0.15;
                    const drawPy = p.y + currentParallaxY * p.radius * 0.15;

                    ctx.beginPath();
                    ctx.arc(drawPx, drawPy, p.radius, 0, Math.PI * 2);

                    // Draw soft cyan-blue sparks
                    ctx.fillStyle = `rgba(165, 229, 255, ${finalOpacity})`;
                    ctx.fill();
                }
            });
        }
    }

    // Launch loop
    animate();
}

// Fire preloader
preloadFrames();

