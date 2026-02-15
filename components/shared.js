/**
 * Shared JavaScript Utilities for Spacetime Visualizations
 * Common functionality across all visualization pages
 */

// ============ NAVIGATION DATA ============
// Scale: 10^x meters
const NAVIGATION_ITEMS = [
    { href: 'modules/quantum.html', label: 'QUANTUM', id: 'quantum', scale: '10⁻³⁵m', val: -35 },
    { href: 'modules/uncertainty.html', label: 'UNCERTAINTY', id: 'uncertainty', scale: '10⁻³⁰m', val: -30 },
    { href: 'modules/wave_theory.html', label: 'WAVEISM', id: 'wave_theory', scale: '10⁻¹⁵m', val: -15 },
    { href: 'modules/resonance.html', label: 'RESONANCE', id: 'resonance', scale: '10⁻⁶m', val: -6 },
    { href: 'modules/chaos.html', label: 'CHAOS', id: 'chaos', scale: '10⁰m', val: 0 },
    { href: 'modules/arrow.html', label: 'ARROW', id: 'arrow', scale: '10⁵m', val: 5 },
    { href: 'modules/fabric.html', label: 'FABRIC', id: 'fabric', scale: '10¹⁰m', val: 10 },
    { href: 'modules/wormhole.html', label: 'WORMHOLE', id: 'wormhole', scale: '10¹⁵m', val: 15 },
    { href: 'modules/spacetime.html', label: 'SPACETIME', id: 'spacetime', scale: '10¹⁸m', val: 18 },
    { href: 'modules/blackhole.html', label: 'BLACK HOLE', id: 'blackhole', scale: '10²¹m', val: 21 },
    { href: 'modules/expansion.html', label: 'EXPANSION', id: 'expansion', scale: '10²⁴m', val: 24 },
    { href: 'modules/cosmic.html', label: 'COSMIC', id: 'cosmic', scale: '10²⁶m', val: 26 }
];

// ============ RENDER NAVIGATION ============
// ============ RENDER NAVIGATION (TUNING FORK) ============
function renderMainNav(activeId) {
    // Detect if we're in a module page or at root
    const currentPath = window.location.pathname;
    const isInModulesFolder = currentPath.includes('/modules/');

    console.log('[NAV] Path:', currentPath, '| In modules?:', isInModulesFolder);

    const pathPrefix = isInModulesFolder ? '' : 'modules/';
    const homeHref = isInModulesFolder ? '../index.html' : 'index.html';

    const homeBtn = `<a href="${homeHref}" class="main-nav-tab home-btn" title="Home">⌂</a>`;

    const navHtml = NAVIGATION_ITEMS.map(item => {
        const activeClass = item.id === activeId ? ' active' : '';
        // Use just the filename if we're in modules/, otherwise use modules/filename
        const href = isInModulesFolder ? item.href.replace('modules/', '') : item.href;
        if (item.id === 'fabric') console.log('[NAV] Fabric:', item.href, '->', href);
        return `
        <a href="${href}" class="main-nav-tab${activeClass}">
            <div class="nav-content">
                <span class="nav-label">${item.label}</span>
            </div>
        </a>`;
    }).join('\n');

    const isIndex = activeId === 'index';
    const containerClass = isIndex ? 'main-nav-container hidden-on-index' : 'main-nav-container';

    // Auto-init slider if we're rendering this after DOM load
    setTimeout(initNavSlider, 0);

    return `
    <div class="${containerClass} main-nav">
        ${homeBtn}
        ${navHtml}
    </div>`;
}

// ============ PREMIUM 2D PARALLAX STARFIELD ============
let globalStarfield2D = null;
function createStarField(scene, count = 200) {
    if (!globalStarfield2D) globalStarfield2D = init2DStarfield('background-stars');
    return null;
}

function init2DStarfield(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    // Ensure container is clean
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none'
    });
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;

    // Mobile detection
    const isMobile = window.innerWidth <= 900;
    const sizeMultiplier = isMobile ? 0.4 : 1; // Smaller on mobile
    const speedMultiplier = isMobile ? 2.0 : 1; // 2x faster on mobile
    const countMultiplier = isMobile ? 0.5 : 1; // Fewer stars on mobile for performance

    const layers = [
        { count: Math.floor(40 * countMultiplier), size: 0.3 * sizeMultiplier, speed: 0.02 * speedMultiplier, opacity: 0.25, stars: [] },
        { count: Math.floor(20 * countMultiplier), size: 0.6 * sizeMultiplier, speed: 0.05 * speedMultiplier, opacity: 0.4, stars: [] },
        { count: Math.floor(8 * countMultiplier), size: 1.0 * sizeMultiplier, speed: 0.1 * speedMultiplier, opacity: 0.6, stars: [] }
    ];

    function resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Re-generate stars on resize to fit new dimensions
        layers.forEach(layer => {
            layer.stars = [];
            for (let i = 0; i < layer.count; i++) {
                layer.stars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: (Math.random() * 0.4 + 0.6) * layer.size,
                    color: ['#ffffff', '#00ffff', '#ffdd00', '#ff00ff'][Math.floor(Math.random() * 4)]
                });
            }
        });
    }

    window.addEventListener('resize', resize);
    resize();

    const state = {
        ctx,
        layers,
        offsetX: 0,
        offsetY: 0,
        targetOffsetX: 0,
        targetOffsetY: 0,
        activeDrag: null,
        factorX: window.innerWidth / (Math.PI * 2),
        factorY: window.innerHeight / (Math.PI * 2) // Approximate vertical FOV factor
    };

    // Update factors on resize
    window.addEventListener('resize', () => {
        state.factorX = window.innerWidth / (Math.PI * 2);
        state.factorY = window.innerHeight / (Math.PI * 2);
    });

    function animate(time) {
        const t = time * 0.001;
        if (state.activeDrag) {
            // Immersive Rotation: 2PI rotation = 1 full screen width scroll
            state.targetOffsetX = state.activeDrag.rotationY * state.factorX;
            state.targetOffsetY = state.activeDrag.rotationX * state.factorY;
        }

        // Smooth interpolation
        state.offsetX += (state.targetOffsetX - state.offsetX) * 0.1;
        state.offsetY += (state.targetOffsetY - state.offsetY) * 0.1;

        const w = window.innerWidth, h = window.innerHeight;
        ctx.clearRect(0, 0, w, h);

        // Subtle drift for "alive" feel
        const driftX = t * 1.5, driftY = t * 0.8;

        state.layers.forEach(layer => {
            ctx.globalAlpha = layer.opacity;
            layer.stars.forEach(star => {
                // Parallax math: (Position + Offset) % ScreenSize
                let sx = (star.x - (state.offsetX * layer.size * 0.5) + driftX * layer.speed) % w;
                let sy = (star.y + (state.offsetY * layer.size * 0.5) + driftY * layer.speed) % h;

                // Handle negative wrap
                if (sx < 0) sx += w;
                if (sy < 0) sy += h;

                ctx.beginPath();
                const r = star.size * 2.5;
                const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
                grad.addColorStop(0, star.color);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.arc(sx, sy, r, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.fillStyle = '#fff';
                ctx.arc(sx, sy, star.size * 0.4, 0, Math.PI * 2);
                ctx.fill();
            });
        });
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    return state;
}

function updateStarField(dummy, time, drag = null) {
    if (!globalStarfield2D) return;
    if (drag) globalStarfield2D.activeDrag = drag;
}

// Standalone version for pages like index.html or wave_theory.html
function initGlobalStarField(containerId) {
    if (!globalStarfield2D) {
        globalStarfield2D = init2DStarfield(containerId);
    }
    return globalStarfield2D;
}

// ============ OSCILLOSCOPE HEADER ============
function initOscilloscope() {
    const canvas = document.getElementById('nav-oscilloscope');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    const resize = () => {
        const rect = canvas.parentElement.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    let time = 0;
    let amplitude = 0;

    // Mouse interaction
    window.addEventListener('mousemove', (e) => {
        amplitude = Math.min(20, Math.abs(e.movementX) + Math.abs(e.movementY));
    });

    const loop = () => {
        requestAnimationFrame(loop);
        time += 0.1;
        amplitude *= 0.95; // Decay

        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.1 + amplitude / 40})`;
        ctx.beginPath();

        const baseY = height / 2;
        for (let x = 0; x < width; x += 5) {
            const y = baseY + Math.sin(x * 0.05 + time) * (2 + amplitude * Math.sin(x * 0.01));
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
    };
    loop();
}

// ============ INFO MODAL MANAGEMENT ============
function initInfoModal() {
    const infoBtn = document.getElementById('info-btn');
    const infoModal = document.getElementById('info-modal');
    const infoClose = document.getElementById('info-close');

    if (!infoBtn || !infoModal) return;
    if (infoBtn.dataset.initialized === 'true') return; // Guard
    infoBtn.dataset.initialized = 'true';

    // Toggle info panel on button click
    infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = infoModal.classList.contains('open');

        // Close others first
        closeAllWaveismPopups();

        if (!wasOpen) {
            infoModal.classList.add('open');
            infoBtn.classList.add('active');
            document.body.classList.add('info-panel-open');
            infoModal.style.setProperty('display', 'block', 'important');
        }
    });

    if (infoClose) {
        infoClose.addEventListener('click', () => {
            infoModal.classList.remove('open');
            infoBtn.classList.remove('active');
            document.body.classList.remove('info-panel-open');
            infoModal.style.setProperty('display', 'none', 'important');
        });
    }

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (infoModal.classList.contains('open') &&
            !infoModal.contains(e.target) &&
            !infoBtn.contains(e.target)) {
            infoModal.classList.remove('open');
            infoBtn.classList.remove('active');
            document.body.classList.remove('info-panel-open');
            infoModal.style.setProperty('display', 'none', 'important');
        }
    });
}

// ============ THEORY TAB MANAGEMENT ============
function initTheoryTabs(callback) {
    const tabs = document.querySelectorAll('.theory-tab');
    // Ensure parent is draggable
    const parent = document.querySelector('.theory-tabs');
    if (parent) enableDragScrolling(parent);

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Auto-center the clicked tab
            tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

            const theory = tab.dataset.theory;
            if (callback && typeof callback === 'function') {
                callback(theory);
            }
        });
    });
}

// ============ DYNAMIC THEORY HEADER ============
function updateTheoryHeader(title, desc) {
    const titleEl = document.querySelector('.theory-nav-title');
    const descEl = document.querySelector('.theory-nav-desc');
    if (titleEl && title) titleEl.innerText = title.toUpperCase();
    if (descEl && desc) descEl.innerText = desc;
}

// ============ UPDATE INFO PANEL ============
// ============ UPDATE INFO PANEL (DATA LEAK) ============
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ΣΔΠΩθλψΦ";

function scrambleText(element, finalText, duration = 400) {
    if (!element) return;
    const steps = 10;
    const stepTime = duration / steps;
    let step = 0;

    // Clear previous interval if any (rudimentary handling)
    if (element.dataset.leakInterval) clearInterval(parseInt(element.dataset.leakInterval));

    const interval = setInterval(() => {
        if (step >= steps) {
            element.textContent = finalText;
            element.style.color = ""; // Reset color
            clearInterval(interval);
            return;
        }

        const scrambled = finalText.split('').map((char, i) => {
            if (char === ' ') return ' ';
            if (i < (step / steps) * finalText.length) return char;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }).join('');

        element.textContent = scrambled;
        element.style.color = Math.random() > 0.5 ? "#00ffff" : "#cc00ff"; // Chromatic flicker
        step++;
    }, stepTime);

    element.dataset.leakInterval = interval;
}

function updateInfoPanel(data) {
    const nameEl = document.getElementById('theory-name');
    const yearEl = document.getElementById('theory-year');
    const equationEl = document.getElementById('equation');
    const factsEl = document.getElementById('theory-facts');

    if (nameEl && data.name) scrambleText(nameEl, data.name);
    if (yearEl && data.year) yearEl.textContent = data.year;
    if (equationEl && data.equation) scrambleText(equationEl, data.equation, 800);

    if (factsEl && data.facts) {
        factsEl.innerHTML = data.facts.map(fact =>
            `<div class="fact"><span class="fact-dot ${fact.status}"></span> ${fact.text}</div>`
        ).join('');
    }
}

// ============ GLOBAL POPUP MANAGEMENT ============
function closeAllWaveismPopups() {
    // Info Modal
    const infoModal = document.getElementById('info-modal');
    const infoBtn = document.getElementById('info-btn');
    if (infoModal) {
        infoModal.classList.remove('open');
        infoModal.style.setProperty('display', 'none', 'important');
    }
    if (infoBtn) infoBtn.classList.remove('active');
    document.body.classList.remove('info-panel-open');

    // Sliders Panel
    const paramsPanel = document.querySelector('.params-panel');
    const slidersBtn = document.querySelector('.sliders-btn');
    if (paramsPanel) paramsPanel.classList.remove('open');
    if (slidersBtn) slidersBtn.classList.remove('active');
    document.body.classList.remove('sliders-popup-open');

    // Share Popup
    const sharePopup = document.querySelector('.share-popup');
    const shareBtn = document.querySelector('.share-btn');
    if (sharePopup) sharePopup.classList.remove('open');
    if (shareBtn) shareBtn.classList.remove('active');
    document.body.classList.remove('share-popup-open');
}

// ============ UPDATE INFO MODAL CONTENT ============
function updateInfoModalContent(data) {
    const descEl = document.getElementById('info-description');
    const conceptsEl = document.getElementById('info-concepts');
    const physicsEl = document.getElementById('info-physics');
    const eqnExplEl = document.getElementById('info-equation-explanation');
    const quoteSection = document.getElementById('info-quote-section');

    if (descEl && data.description) descEl.textContent = data.description;
    if (physicsEl && data.physics) physicsEl.textContent = data.physics;

    if (eqnExplEl) {
        if (data.equationExpl) {
            eqnExplEl.textContent = data.equationExpl;
            eqnExplEl.parentElement.style.display = 'block';
        } else {
            eqnExplEl.parentElement.style.display = 'none';
        }
    }

    if (quoteSection) {
        if (data.quote) {
            quoteSection.innerHTML = `
                <div class="info-section-title">Perspective</div>
                <blockquote style="border-left: 2px solid #00ffff; padding-left: 15px; margin: 10px 0; font-style: italic; color: rgba(255,255,255,0.9);">
                    "${data.quote.text}"
                    <cite style="display: block; margin-top: 5px; font-style: normal; font-size: 0.7rem; color: #00ffff; opacity: 0.8;">— ${data.quote.author}</cite>
                </blockquote>
            `;
            quoteSection.style.display = 'block';
        } else {
            quoteSection.style.display = 'none';
        }
    }

    if (conceptsEl && data.concepts) {
        conceptsEl.innerHTML = data.concepts.map(c =>
            `<li><span class="info-highlight">${c.term}</span> — ${c.definition}</li>`
        ).join('');
    }
}

// ============ PARAMETER SLIDER MANAGEMENT ============
function initParamSlider(sliderId, valueId, options = {}) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);

    if (!slider) return null;

    const {
        formatter = (v) => v,
        onChange = () => { }
    } = options;

    slider.addEventListener('input', () => {
        const value = parseFloat(slider.value);
        if (valueDisplay) {
            valueDisplay.textContent = formatter(value);
        }
        onChange(value);
    });

    return {
        getValue: () => parseFloat(slider.value),
        setValue: (v) => {
            slider.value = v;
            if (valueDisplay) valueDisplay.textContent = formatter(v);
        }
    };
}

// ============ CANVAS RESIZE HANDLER ============
function initCanvasResize(canvas, onResize) {
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (onResize) onResize(canvas.width, canvas.height);
    }

    window.addEventListener('resize', resize);
    resize();

    return resize;
}

// ============ MOUSE DRAG HANDLER (WITH INERTIA) ============
function initDragRotation(canvas, options = {}) {
    const state = {
        isDragging: false,
        lastX: 0,
        lastY: 0,
        lastY: 0,
        rotationX: options.initialRotationX !== undefined ? options.initialRotationX : 0.4,
        rotationY: options.initialRotationY !== undefined ? options.initialRotationY : 0,
        targetRotationX: options.initialRotationX !== undefined ? options.initialRotationX : 0.4,
        targetRotationY: options.initialRotationY !== undefined ? options.initialRotationY : 0,
        velocityX: 0,
        velocityY: 0,
        autoRotate: options.autoRotate || false, // Default to false
        damping: 0.1,
        friction: 0.95,
        lastInteraction: Date.now(),
        inactivityFactor: 0 // 0 = Sharp, 1 = Blurry/Superposition
    };

    canvas.addEventListener('mousedown', (e) => {
        state.isDragging = true;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        state.autoRotate = false;
        state.lastInteraction = Date.now();
        window.clickPrevented = false;
    });

    window.addEventListener('mousemove', (e) => {
        if (!state.isDragging) return;
        window.clickPrevented = true;
        state.lastInteraction = Date.now(); // Reset inactivity

        const dx = e.clientX - state.lastX;
        const dy = e.clientY - state.lastY;

        state.targetRotationY += dx * 0.005;
        state.targetRotationX += dy * 0.005;
        state.targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, state.targetRotationX));

        state.lastX = e.clientX;
        state.lastY = e.clientY;
    });

    window.addEventListener('mouseup', () => { state.isDragging = false; });

    // Touch support (Real-feel)
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            state.isDragging = true;
            state.lastX = e.touches[0].clientX;
            state.lastY = e.touches[0].clientY;
            state.autoRotate = false;
        }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (!state.isDragging || e.touches.length !== 1) return;

        const dx = e.touches[0].clientX - state.lastX;
        const dy = e.touches[0].clientY - state.lastY;
        state.targetRotationY += dx * 0.005;
        state.targetRotationX += dy * 0.005;
        state.lastX = e.touches[0].clientX;
        state.lastY = e.touches[0].clientY;
    }, { passive: false });

    window.addEventListener('touchend', () => { state.isDragging = false; });

    // Update function to be called in the animation loop
    state.update = () => {
        if (!state.isDragging) {
            if (state.autoRotate) {
                state.targetRotationY += 0.003;
            }
        }

        // Smoothly interpolate current rotation to target
        if (isNaN(state.targetRotationY)) state.targetRotationY = state.rotationY;
        if (isNaN(state.targetRotationX)) state.targetRotationX = state.rotationX;

        state.rotationY += (state.targetRotationY - state.rotationY) * state.damping;
        state.rotationX += (state.targetRotationX - state.rotationX) * state.damping;

        // Observer Effect: Inactivity Drift
        const idleTime = Date.now() - state.lastInteraction;
        if (idleTime > 4000) {
            // Drift into Superposition
            state.inactivityFactor = Math.min(1, (idleTime - 4000) / 5000);
        } else {
            // Collapse to Reality
            state.inactivityFactor = Math.max(0, state.inactivityFactor - 0.05);
        }
    };

    return state;
}

// ============ ZOOM HANDLER (Mouse Wheel + Pinch) ============
function initZoomHandler(canvas, options = {}) {
    const state = {
        zoom: options.initialZoom || 1.0,
        minZoom: options.minZoom || 0.3,
        maxZoom: options.maxZoom || 5.0, // Increased max zoom
        initialPinchDist: 0,
        initialZoom: 1.0
    };

    // Wheel Zoom
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        state.zoom += e.deltaY * -0.001;
        state.zoom = Math.max(state.minZoom, Math.min(state.maxZoom, state.zoom));
        updateZoomDisplay();
    }, { passive: false });

    // Pinch Zoom Logic
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault(); // Prevent page zoom
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            state.initialPinchDist = Math.hypot(dx, dy);
            state.initialZoom = state.zoom;
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.hypot(dx, dy);

            if (state.initialPinchDist > 0) {
                const scale = dist / state.initialPinchDist;
                state.zoom = state.initialZoom * scale;
                state.zoom = Math.max(state.minZoom, Math.min(state.maxZoom, state.zoom));
                updateZoomDisplay();
            }
        }
    }, { passive: false });

    function updateZoomDisplay() {
        const zoomDisplay = document.getElementById('zoom-value');
        if (zoomDisplay) {
            zoomDisplay.textContent = state.zoom.toFixed(1) + '×';
        }
    }

    return state;
}

// ============ KEYBOARD HANDLERS ============
function initKeyboardControls(options = {}) {
    document.addEventListener('keydown', (e) => {
        switch (e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                if (options.onToggleAutoRotate) options.onToggleAutoRotate();
                break;
            case 'r':
                if (options.onReset) options.onReset();
                break;
            case 'i':
                const modal = document.getElementById('info-modal');
                const btn = document.getElementById('info-btn');
                if (modal && btn) {
                    modal.classList.toggle('open');
                    btn.classList.toggle('active');
                }
                break;
        }
    });
}
// ============ 3D PROJECTION ============
function project3D(x, y, z, rotX, rotY, centerX, centerY, zoom = 1, depth = 400, multiplier = 1) {
    // Apply Y rotation
    let px = x * Math.cos(rotY) - z * Math.sin(rotY);
    let pz = x * Math.sin(rotY) + z * Math.cos(rotY);

    // Apply X rotation (Corrected for tilt and inversion)
    let py = y * Math.cos(rotX) + pz * Math.sin(rotX);
    pz = -y * Math.sin(rotX) + pz * Math.cos(rotX);

    // Perspective projection
    const zOffset = depth + pz + (depth / 2);
    // Safety check to prevent division by zero or negative scale
    let scale = 0;
    if (zOffset > 10) {
        scale = depth / zOffset;
    }

    // Clamp scale to prevent visual explosions
    scale = Math.min(scale, 20);

    return {
        x: centerX + px * scale * zoom * multiplier,
        y: centerY - py * scale * zoom * multiplier,
        z: pz,
        scale: scale
    };
}


// ============ COLOR UTILITIES ============
const ColorUtils = {
    hsl: (h, s, l, a = 1) => `hsla(${h}, ${s}%, ${l}%, ${a})`,

    cyan: (alpha = 1) => `rgba(0, 255, 255, ${alpha})`,

    gradient: (ctx, x1, y1, x2, y2, stops) => {
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        stops.forEach(([pos, color]) => grad.addColorStop(pos, color));
        return grad;
    },

    radialGradient: (ctx, x, y, innerR, outerR, stops) => {
        const grad = ctx.createRadialGradient(x, y, innerR, x, y, outerR);
        stops.forEach(([pos, color]) => grad.addColorStop(pos, color));
        return grad;
    }
};

// ============ ANIMATION LOOP ============
function createAnimationLoop(updateFn, renderFn) {
    let running = true;
    let lastTime = 0;

    function loop(timestamp) {
        if (!running) return;

        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        updateFn(deltaTime / 1000);
        renderFn();

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    return {
        stop: () => { running = false; },
        start: () => {
            if (!running) {
                running = true;
                requestAnimationFrame(loop);
            }
        }
    };
}

// ============ DRAGGABLE UI HELPER (POSITION) ============
function makeUIElementDraggable(el, handle = null) {
    if (!el) return;
    const dragTarget = handle || el;
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    const onStart = (clientX, clientY) => {
        isDragging = true;
        startX = clientX;
        startY = clientY;
        const rect = el.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        // Clear relative positioning to prevent jumps
        el.style.bottom = 'auto';
        el.style.right = 'auto';
        el.style.left = rect.left + 'px';
        el.style.top = rect.top + 'px';
        el.style.position = 'fixed';
        el.dataset.dragged = "false";
    };
    const onMove = (clientX, clientY) => {
        if (!isDragging) return;
        const dx = clientX - startX;
        const dy = clientY - startY;
        // Increase threshold for mobile thumb jitter
        if (Math.hypot(dx, dy) > 15) el.dataset.dragged = "true";
        el.style.left = (initialLeft + dx) + 'px';
        el.style.top = (initialTop + dy) + 'px';
    };
    const onEnd = () => { isDragging = false; };

    const onPointerEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;

        // Convert to right/top based coordinates to maintain relative position on resize
        const rect = el.getBoundingClientRect();
        const rightOffset = window.innerWidth - rect.right;
        const topOffset = rect.top;

        // Save relative position
        el.style.left = 'auto';
        el.style.right = rightOffset + 'px';
        el.style.top = topOffset + 'px';

        // Ensure it doesn't go off screen
        keepInBounds(el);

        // Update side for popups (left vs right)
        updatePopupSide(el);
    };

    const updatePopupSide = (element) => {
        const rect = element.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // X-axis Side Detection
        if (rect.left + rect.width / 2 < screenWidth / 2) {
            element.setAttribute('data-side', 'left');
        } else {
            element.setAttribute('data-side', 'right');
        }

        // Y-axis Side Detection (Vertical space)
        if (rect.top < screenHeight / 2) {
            element.setAttribute('data-v-side', 'top'); // Space is below
        } else {
            element.setAttribute('data-v-side', 'bottom'); // Space is above
        }
    };

    const keepInBounds = (element) => {
        const rect = element.getBoundingClientRect();
        const padding = 10;

        if (rect.right > window.innerWidth - padding) {
            element.style.right = padding + 'px';
        }
        if (rect.left < padding) {
            element.style.right = (window.innerWidth - (rect.width + padding)) + 'px';
        }
        if (rect.top < padding) {
            element.style.top = padding + 'px';
        }
        if (rect.bottom > window.innerHeight - padding) {
            element.style.top = (window.innerHeight - rect.height - padding) + 'px';
        }
    };

    window.addEventListener('resize', () => {
        if (el.style.position === 'fixed') {
            keepInBounds(el);
        }
    });

    dragTarget.addEventListener('pointerdown', e => {
        initialLeft = el.getBoundingClientRect().left;
        initialTop = el.getBoundingClientRect().top;
        onStart(e.clientX, e.clientY);
        dragTarget.setPointerCapture(e.pointerId);
    });

    dragTarget.addEventListener('pointermove', e => {
        if (isDragging) onMove(e.clientX, e.clientY);
    });

    dragTarget.addEventListener('pointerup', e => {
        onPointerEnd(e);
        dragTarget.releasePointerCapture(e.pointerId);
    });

    // Touch Action None is critical
    dragTarget.style.touchAction = 'none';
}

// ============ DRAG-TO-SCROLL HELPER (CONTENT) ============
function enableDragScrolling(el) {
    if (!el) return;
    let isDown = false;
    let startX;
    let scrollLeft;

    el.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
        el.style.cursor = 'grabbing';
    });
    el.addEventListener('mouseleave', () => {
        isDown = false;
        el.style.cursor = 'pointer'; // Revert to default
    });
    el.addEventListener('mouseup', () => {
        isDown = false;
        el.style.cursor = 'pointer';
    });
    el.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast multiplier
        el.scrollLeft = scrollLeft - walk;
    });

    // Enable Mouse Wheel Horizontal Scrolling
    el.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            el.scrollLeft += e.deltaY;
        }
    }, { passive: false });
}

// ============ NAV AUTO-CENTERING ============
function centerActiveNavItems() {
    const mainNav = document.querySelector('.main-nav-container');
    if (mainNav) {
        const active = mainNav.querySelector('.active');
        if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    const activeTheory = document.querySelector('.theory-tab.active');
    if (activeTheory) activeTheory.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

// ============ ORB UI INITIALIZER ============
function initOrbUI() {
    // Exclude Index Page explicitly
    const isIndex = document.title.includes('Index') ||
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname === '/' ||
        window.location.pathname === '';

    if (isIndex) return;
    if (document.querySelector('.ui-orb')) return;

    const unit = document.createElement('div');
    unit.className = 'ui-controls-unit';
    document.body.appendChild(unit);

    const orb = document.createElement('div');
    orb.className = 'ui-orb';
    orb.title = "Toggle Interface";
    unit.appendChild(orb);

    // Add animated bars
    for (let i = 0; i < 3; i++) {
        const bar = document.createElement('div');
        bar.className = 'orb-bar';
        orb.appendChild(bar);
    }

    const subControls = document.createElement('div');
    subControls.className = 'ui-sub-controls';
    unit.appendChild(subControls);

    // Move existing info-btn and info-modal into subControls immediately
    const existingInfoBtn = document.getElementById('info-btn');
    const existingInfoModal = document.getElementById('info-modal');
    if (existingInfoBtn) {
        subControls.appendChild(existingInfoBtn);
        existingInfoBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        `;
        existingInfoBtn.style.position = 'relative';
        existingInfoBtn.style.top = 'auto';
        existingInfoBtn.style.right = 'auto';
        existingInfoBtn.style.bottom = 'auto';
        existingInfoBtn.style.left = 'auto';

        // Ensure info button is the first child (if you prefer consistent order)
        subControls.prepend(existingInfoBtn);
    }

    if (existingInfoModal) {
        // Move modal into the draggable unit unit so it follows the Orb
        subControls.appendChild(existingInfoModal);
    }

    // Use the orb as the handle to drag the entire unit
    makeUIElementDraggable(unit, orb);

    // Set initial side and vertical side
    const initialRect = unit.getBoundingClientRect();
    if (initialRect.left < window.innerWidth / 2) {
        unit.setAttribute('data-side', 'left');
    } else {
        unit.setAttribute('data-side', 'right');
    }

    if (initialRect.top < window.innerHeight / 2) {
        unit.setAttribute('data-v-side', 'top');
    } else {
        unit.setAttribute('data-v-side', 'bottom');
    }

    let autoHideTimer = setTimeout(() => {
        document.body.classList.remove('ui-open');
        orb.classList.remove('active');
    }, 30000); // Increased to 30 seconds for better usability

    const cancelAutoHide = () => {
        if (autoHideTimer) {
            clearTimeout(autoHideTimer);
            autoHideTimer = null;
        }
    };

    orb.addEventListener('mousedown', cancelAutoHide);
    orb.addEventListener('touchstart', cancelAutoHide);

    const onInteract = (e) => {
        if (e.target.closest('.main-nav') || e.target.closest('.theory-tabs') || e.target.closest('.params-panel')) {
            cancelAutoHide();
        }
    };

    // Listen for custom interaction events (e.g. scroll)
    window.addEventListener('ui-interaction', cancelAutoHide);

    // Close all popups helper
    const closeAllPopups = closeAllWaveismPopups;

    // Zen Mode Logic
    const toggleUI = () => {
        if (unit.dataset.dragged === "true") {
            unit.dataset.dragged = "false";
            return;
        }
        cancelAutoHide();
        const isOpen = document.body.classList.toggle('ui-open');
        orb.classList.toggle('active', isOpen);

        // If closing UI, also close all popups
        if (!isOpen) {
            closeAllPopups();
        }

        // Notify Engine (Global Event)
        const event = new CustomEvent('zen-mode-toggle', { detail: { active: !isOpen } });
        window.dispatchEvent(event);
    };

    // Use unified click and explicit touchend for immediate response
    orb.addEventListener('click', (e) => {
        toggleUI();
    });

    orb.addEventListener('touchend', (e) => {
        // Prevent default to stop phantom clicks but trigger our logic
        if (unit.dataset.dragged !== "true") {
            e.preventDefault();
            toggleUI();
        }
    });

    document.addEventListener('click', onInteract);

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'h' || e.key.toLowerCase() === 'x') {
            cancelAutoHide();
            const isOpen = document.body.classList.toggle('ui-open');
            orb.classList.toggle('active', isOpen);
        }
    });

    document.body.classList.add('ui-open');
    orb.classList.add('active');

    // Auto-enable drag scroll for navs
    const nav = document.querySelector('.main-nav');
    if (nav) enableDragScrolling(nav);

    const tabs = document.querySelector('.theory-tabs');
    if (tabs) enableDragScrolling(tabs);
}

// ============ INTERACTIVE NAV SLIDER (ROLLING WHEEL) ============
// ============ INTERACTIVE NAV SLIDER (HORIZONTAL TOP) ============
function initNavSlider() {
    const container = document.querySelector('.main-nav-container');
    const items = Array.from(document.querySelectorAll('.main-nav-tab'));
    if (!container || !items.length) return;

    // Enable drag scrolling (mouse/touch)
    enableDragScrolling(container);

    // Initial Center Active Item
    const activeItem = container.querySelector('.active');
    if (activeItem) {
        setTimeout(() => {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 100);
    }

    // Scroll Indicators (Optional, mainly CSS handles overflow)
    // We can add subtle fade masks in CSS instead of JS logic

    // Click Logic (for smooth scroll to item)
    items.forEach(item => {
        item.addEventListener('click', (e) => {
            // Allow default link behavior but animate scroll
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
    });

    // Gentle Fade-In
    setTimeout(() => {
        const navContainer = document.querySelector('.main-nav-container');
        if (navContainer) {
            navContainer.classList.add('visible');
            centerActiveNavItems(); // Re-center once visible
        }
    }, 100);

    // Re-center on window resize (especially orientation change)
    window.addEventListener('resize', () => {
        centerActiveNavItems();
    });
}

// ============ PAGE TRANSITION (FADE ONLY) ============
function initPageTransition() {
    // Zoom effect removed per user request.
    // Just simple opacity fade in.
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });

    // Intercept clicks for smoother fade-out if desired, but default nav is faster + cleaner
    document.body.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (link && link.href && !link.href.includes('#') && link.target !== '_blank') {
            // Optional: fade out
            // e.preventDefault();
            // document.body.style.opacity = '0';
            // setTimeout(() => window.location.href = link.href, 400);
        }
    });
}


// ============ WEBGL ERROR DETECTION & FALLBACK ============
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            throw new Error('WebGL not supported');
        }

        // Check for major performance issues
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            console.log('[Waveism] WebGL Renderer:', renderer);
        }

        return { supported: true, gl };
    } catch (e) {
        console.error('[Waveism] WebGL Error:', e);
        return { supported: false, error: e.message };
    }
}

function showWebGLError(errorMessage = 'WebGL is not available') {
    const overlay = document.createElement('div');
    overlay.className = 'webgl-error-overlay';
    overlay.innerHTML = `
        <div class="error-icon">⚠</div>
        <h2>RENDERING SUBSYSTEM OFFLINE</h2>
        <p>Your browser or device doesn't support WebGL, which is required for the 3D visualizations. 
           ${errorMessage}</p>
        <p style="font-size: 0.75rem; opacity: 0.6;">Try using a modern browser like Chrome, Firefox, or Safari, 
           or enable hardware acceleration in your browser settings.</p>
        <button class="retry-btn" onclick="location.reload()">RETRY CONNECTION</button>
    `;
    document.body.appendChild(overlay);
}

// Wrap Three.js initialization with error boundary
function safeWebGLInit(initFunction) {
    const check = checkWebGLSupport();
    if (!check.supported) {
        showWebGLError(check.error);
        return null;
    }

    try {
        return initFunction();
    } catch (e) {
        console.error('[Waveism] WebGL Runtime Error:', e);
        showWebGLError('A rendering error occurred: ' + e.message);
        return null;
    }
}

// ============ CONTENT MODE TOGGLE (ELI5 / Expert) ============
const CONTENT_MODES = ['eli5', 'standard', 'expert'];

function getContentMode() {
    return localStorage.getItem('waveism_content_mode') || 'standard';
}

function setContentMode(mode) {
    if (!CONTENT_MODES.includes(mode)) mode = 'standard';

    localStorage.setItem('waveism_content_mode', mode);

    // Update body classes
    document.body.classList.remove('eli5-mode', 'standard-mode', 'expert-mode');
    document.body.classList.add(mode + '-mode');

    // Update toggle buttons
    document.querySelectorAll('.content-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Dispatch event for content updates
    window.dispatchEvent(new CustomEvent('content-mode-change', { detail: { mode } }));

    return mode;
}

function initContentModeToggle() {
    // Check if already exists
    if (document.querySelector('.content-mode-toggle')) return;

    const toggle = document.createElement('div');
    toggle.className = 'content-mode-toggle';
    toggle.innerHTML = `
        <button class="content-mode-btn" data-mode="eli5" title="Explain Like I'm 5">ELI5</button>
        <button class="content-mode-btn" data-mode="standard" title="Standard Mode">STD</button>
        <button class="content-mode-btn" data-mode="expert" title="Expert Level Detail">EXP</button>
    `;
    document.body.appendChild(toggle);

    // Set initial mode
    setContentMode(getContentMode());

    // Add click handlers
    toggle.querySelectorAll('.content-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => setContentMode(btn.dataset.mode));
    });
}

// ============ INTERACTIVE EQUATION BREAKDOWNS ============
const EQUATION_TERMS = {
    // Common terms across modules
    'ψ': { term: 'ψ (Psi)', def: 'The quantum wave function - describes the probability amplitude of finding a particle in a given state.' },
    'Ψ': { term: 'Ψ (Psi)', def: 'The quantum wave function representing the complete state of a system.' },
    'Ĥ': { term: 'Ĥ (Hamiltonian)', def: 'The total energy operator of a quantum system, including kinetic and potential energy.' },
    'E': { term: 'E (Energy)', def: 'The eigenvalue representing the total energy of a quantum state.' },
    '∇': { term: '∇ (Nabla/Del)', def: 'The gradient operator - measures the rate of change in all spatial directions.' },
    '∇²': { term: '∇² (Laplacian)', def: 'The divergence of the gradient - appears in wave equations and diffusion.' },
    'ℏ': { term: 'ℏ (h-bar)', def: 'Reduced Planck constant (h/2π) ≈ 1.055 × 10⁻³⁴ J·s - the quantum of action.' },
    'c': { term: 'c', def: 'Speed of light in vacuum ≈ 299,792,458 m/s - the universal speed limit.' },
    'λ': { term: 'λ (Lambda)', def: 'Wavelength - the spatial period of a wave.' },
    'ω': { term: 'ω (Omega)', def: 'Angular frequency - radians per second of oscillation.' },
    'Σ': { term: 'Σ (Sigma)', def: 'Summation operator - adds up all terms in a series.' },
    'dt': { term: 'dt', def: 'Infinitesimal time interval - used in calculus for rates of change.' },
    'dx': { term: 'dx', def: 'Infinitesimal spatial interval - used in calculus for spatial derivatives.' },
    'π': { term: 'π (Pi)', def: 'Mathematical constant ≈ 3.14159 - ratio of circumference to diameter.' },
    'i': { term: 'i', def: 'Imaginary unit where i² = -1 - essential for wave mechanics.' },
    'μν': { term: 'μν (Mu-Nu)', def: 'Tensor indices representing spacetime dimensions (0=time, 1,2,3=space).' },
    'gμν': { term: 'gμν', def: 'Metric tensor - describes the geometry of spacetime.' },
    'Gμν': { term: 'Gμν', def: 'Einstein tensor - encodes spacetime curvature in General Relativity.' },
    'Tμν': { term: 'Tμν', def: 'Stress-energy tensor - describes energy and momentum distribution.' },
    'Rμν': { term: 'Rμν', def: 'Ricci curvature tensor - measures how volumes change under parallel transport.' },
    'R': { term: 'R', def: 'Ricci scalar - the trace of the Ricci tensor, a single number describing curvature.' },
    'Λ': { term: 'Λ (Lambda)', def: 'Cosmological constant - represents the energy density of empty space (dark energy).' },
    'G': { term: 'G', def: 'Gravitational constant ≈ 6.674 × 10⁻¹¹ m³/(kg·s²).' },
    'k': { term: 'k', def: 'Wave number (2π/λ) or Boltzmann constant depending on context.' },
    'S': { term: 'S', def: 'Entropy - measure of disorder, or Action in classical mechanics.' },
    'm': { term: 'm', def: 'Mass - resistance to acceleration, source of gravitational field.' },
    'v': { term: 'v', def: 'Velocity - rate of change of position.' },
    'p': { term: 'p', def: 'Momentum - mass times velocity, conserved in isolated systems.' },
    'γ': { term: 'γ (Gamma)', def: 'Lorentz factor = 1/√(1-v²/c²) - time dilation and length contraction.' },
    'τ': { term: 'τ (Tau)', def: 'Proper time - time measured by a clock moving with the object.' },
    'rs': { term: 'rs (Schwarzschild radius)', def: 'Event horizon radius = 2GM/c² - boundary of a black hole.' }
};

let tooltipElement = null;

function createTooltip() {
    if (tooltipElement) return tooltipElement;

    tooltipElement = document.createElement('div');
    tooltipElement.className = 'term-tooltip';
    document.body.appendChild(tooltipElement);
    return tooltipElement;
}

function showTermTooltip(term, definition, x, y) {
    const tooltip = createTooltip();
    tooltip.innerHTML = `<span class="tooltip-term">${term}</span>${definition}`;

    // Position tooltip
    const rect = tooltip.getBoundingClientRect();
    let left = x - rect.width / 2;
    let top = y - rect.height - 10;

    // Keep on screen
    if (left < 10) left = 10;
    if (left + rect.width > window.innerWidth - 10) left = window.innerWidth - rect.width - 10;
    if (top < 10) top = y + 20;

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.classList.add('visible');
}

function hideTermTooltip() {
    if (tooltipElement) {
        tooltipElement.classList.remove('visible');
    }
}

function parseEquationTerms(equationEl) {
    if (!equationEl || equationEl.dataset.parsed) return;

    const text = equationEl.textContent;
    let html = text;

    // Sort terms by length (longest first) to avoid partial matches
    const sortedTerms = Object.keys(EQUATION_TERMS).sort((a, b) => b.length - a.length);

    sortedTerms.forEach(term => {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'g');
        const data = EQUATION_TERMS[term];
        html = html.replace(regex, `<span class="term" data-term="${data.term}" data-def="${data.def}">$1</span>`);
    });

    equationEl.innerHTML = html;
    equationEl.dataset.parsed = 'true';

    // Add event listeners
    equationEl.querySelectorAll('.term').forEach(termEl => {
        termEl.addEventListener('mouseenter', (e) => {
            const rect = e.target.getBoundingClientRect();
            showTermTooltip(
                e.target.dataset.term,
                e.target.dataset.def,
                rect.left + rect.width / 2,
                rect.top
            );
        });

        termEl.addEventListener('mouseleave', hideTermTooltip);

        // Touch support
        termEl.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = e.target.getBoundingClientRect();
            showTermTooltip(
                e.target.dataset.term,
                e.target.dataset.def,
                rect.left + rect.width / 2,
                rect.top
            );

            // Hide after 3 seconds
            setTimeout(hideTermTooltip, 3000);
        });
    });
}

function initEquationInteractivity() {
    document.querySelectorAll('.equation').forEach(parseEquationTerms);

    // Watch for dynamic content
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.classList?.contains('equation')) {
                        parseEquationTerms(node);
                    }
                    node.querySelectorAll?.('.equation').forEach(parseEquationTerms);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// ============ FIRST-VISIT ONBOARDING HINT ============
function initOnboardingHint() {
    const VISITED_KEY = 'waveism_visited';

    // Check if first visit
    if (localStorage.getItem(VISITED_KEY)) return;

    const hint = document.createElement('div');
    hint.className = 'onboarding-hint';
    hint.innerHTML = `
        <h3>WELCOME TO WAVEISM</h3>
        <p>Drag to rotate visualizations. Scroll to zoom. Tap the ⓘ button for theory details.</p>
        <button class="dismiss-btn">GOT IT</button>
    `;
    document.body.appendChild(hint);

    hint.querySelector('.dismiss-btn').addEventListener('click', () => {
        localStorage.setItem(VISITED_KEY, Date.now().toString());
        hint.style.opacity = '0';
        hint.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => hint.remove(), 300);
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
        if (hint.parentElement) {
            hint.querySelector('.dismiss-btn').click();
        }
    }, 10000);
}

// ============ SLIDERS BUTTON ============
function initSlidersButton() {
    if (document.querySelector('.sliders-btn')) return; // Guard
    // Don't show on homepage
    const isHomepage = window.location.pathname === '/' ||
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname.endsWith('/index');
    if (isHomepage) return;

    // Check if already exists
    if (document.querySelector('.sliders-btn')) return;

    // Check if params-panel exists
    const paramsPanel = document.querySelector('.params-panel');
    if (!paramsPanel) return;

    const btn = document.createElement('button');
    btn.className = 'sliders-btn';
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="2" y1="14" x2="6" y2="14"></line>
            <line x1="10" y1="8" x2="14" y2="8"></line>
            <line x1="18" y1="16" x2="22" y2="16"></line>
        </svg>
    `;
    btn.title = 'Adjust parameters';

    // Append to sub-controls if available
    const subControls = document.querySelector('.ui-sub-controls');
    if (subControls) {
        subControls.appendChild(btn);
        subControls.appendChild(paramsPanel);
        btn.style.position = 'relative';
        btn.style.top = 'auto';
        btn.style.right = 'auto';
        btn.style.left = 'auto';
        btn.style.bottom = 'auto';
    } else {
        document.body.appendChild(btn);
    }

    // Add header to params panel if missing
    if (!paramsPanel.querySelector('.params-header')) {
        const header = document.createElement('div');
        header.className = 'params-header';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '12px';
        header.style.borderBottom = '1px solid rgba(0, 255, 255, 0.2)';
        header.style.paddingBottom = '8px';

        header.innerHTML = `
            <span style="font-family:'JetBrains Mono'; font-size:0.7rem; color:rgba(0,255,255,0.6); text-transform:uppercase; letter-spacing:0.1em;">Parameters</span>
            <button class="params-close" style="background:none; border:none; color:rgba(0,255,255,0.5); font-size:1.1rem; cursor:pointer;">×</button>
        `;
        paramsPanel.prepend(header);

        header.querySelector('.params-close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllWaveismPopups();
        });
    }

    // Toggle popup on button click
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = paramsPanel.classList.contains('open');

        closeAllWaveismPopups();

        if (!wasOpen) {
            paramsPanel.classList.add('open');
            btn.classList.add('active');
            document.body.classList.add('sliders-popup-open');
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.params-panel') && !e.target.closest('.sliders-btn')) {
            paramsPanel.classList.remove('open');
            btn.classList.remove('active');
            document.body.classList.remove('sliders-popup-open');
        }
    });
}

// ============ SHARE BUTTON ============
function initShareButton() {
    if (document.querySelector('.share-btn')) return; // Guard
    // Don't show share button on homepage
    const isHomepage = window.location.pathname === '/' ||
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname.endsWith('/index');
    if (isHomepage) return;

    // Check if already exists
    if (document.querySelector('.share-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'share-btn';
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
    `;
    btn.title = 'Share this page';

    // Append to sub-controls if available
    const subControls = document.querySelector('.ui-sub-controls');
    if (subControls) {
        subControls.appendChild(btn);
        btn.style.position = 'relative';
        btn.style.top = 'auto';
        btn.style.right = 'auto';
        btn.style.left = 'auto';
        btn.style.bottom = 'auto';
    } else {
        document.body.appendChild(btn);
    }

    // Create share popup inside the unit/sub-controls if they exist
    const popup = document.createElement('div');
    popup.className = 'share-popup';
    const shareIcon = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon-s">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>`;

    const copyIcon = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon-s">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>`;

    const nativeIcon = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon-s">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>`;


    const heartIcon = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ui-icon-s">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>`;

    popup.innerHTML = `
        <div class="share-popup-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(0,255,255,0.2); padding-bottom:8px;">
            <h3 style="margin:0; font-family:'JetBrains Mono'; font-size:0.7rem; color:rgba(0,255,255,0.6); text-transform:uppercase; letter-spacing:2px;">Share Manifold</h3>
            <button class="share-close" style="background:none; border:none; color:rgba(0,255,255,0.5); font-size:1.1rem; cursor:pointer;">×</button>
        </div>
        <div class="share-popup-content">
            <p class="share-page-title">${document.title}</p>
            <div class="share-options">
                <button class="share-option" data-action="copy">${copyIcon} Copy Link</button>
                <button class="share-option" data-action="native">${shareIcon} Share</button>
                <button class="share-option donate-btn-primary" data-action="donate" style="border-color:#ff00ff; color:#ff00ff; background:rgba(255,0,255,0.1); font-weight:600;">${heartIcon} Support Project</button>
            </div>
        </div>
    `;

    if (subControls) subControls.appendChild(popup);
    else document.body.appendChild(popup);

    // Close button logic
    const closeBtn = popup.querySelector('.share-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllWaveismPopups();
        });
    }

    // Toggle popup on button click
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = popup.classList.contains('open');

        closeAllWaveismPopups();

        if (!wasOpen) {
            popup.classList.add('open');
            btn.classList.add('active');
            document.body.classList.add('share-popup-open');
        }
    });

    // Handle share options
    popup.querySelectorAll('.share-option').forEach(option => {
        option.addEventListener('click', async () => {
            const action = option.dataset.action;
            const pageTitle = document.title;
            const pageUrl = window.location.href;

            if (action === 'copy') {
                try {
                    await navigator.clipboard.writeText(pageUrl);
                    option.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="ui-icon-s">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Copied!
                    `;
                    setTimeout(() => {
                        option.innerHTML = `${copyIcon} Copy Link`;
                    }, 2000);
                } catch (e) {
                    console.log('[Waveism] Copy failed:', e);
                }
            } else if (action === 'native' && navigator.share) {
                try {
                    await navigator.share({
                        title: pageTitle,
                        text: `Explore ${pageTitle} - An interactive physics visualization`,
                        url: pageUrl
                    });
                } catch (e) {
                    console.log('[Waveism] Share failed:', e);
                }
            } else if (action === 'donate') {
                // Stripe Donation Link
                const stripeUrl = 'https://donate.stripe.com/7sYbJ1be2dvu6tM9XS3oA00';
                window.open(stripeUrl, '_blank');
            }
        });
    });

    // Close popup on click outside
    document.addEventListener('click', (e) => {
        if (popup.classList.contains('open') &&
            !popup.contains(e.target) &&
            !btn.contains(e.target)) {
            popup.classList.remove('open');
            btn.classList.remove('active');
            document.body.classList.remove('share-popup-open');
        }
    });
}

// ============ RELATED CONCEPTS NAVIGATION ============
const CONCEPT_RELATIONSHIPS = {
    'quantum': ['uncertainty', 'wave_theory', 'resonance'],
    'uncertainty': ['quantum', 'wave_theory'],
    'wave_theory': ['quantum', 'resonance', 'fabric'],
    'resonance': ['wave_theory', 'chaos', 'quantum'],
    'chaos': ['resonance', 'arrow'],
    'arrow': ['chaos', 'expansion', 'blackhole'],
    'fabric': ['spacetime', 'wormhole', 'wave_theory'],
    'wormhole': ['fabric', 'spacetime', 'blackhole'],
    'spacetime': ['fabric', 'blackhole', 'wormhole'],
    'blackhole': ['spacetime', 'wormhole', 'expansion'],
    'expansion': ['cosmic', 'blackhole', 'arrow'],
    'cosmic': ['expansion', 'fabric']
};

function initRelatedConcepts(currentPageId) {
    const related = CONCEPT_RELATIONSHIPS[currentPageId];
    if (!related || !related.length) return;

    const infoPanel = document.querySelector('.info-panel');
    if (!infoPanel) return;

    // Check if already added
    if (infoPanel.querySelector('.related-concepts')) return;

    const container = document.createElement('div');
    container.className = 'related-concepts';

    related.forEach(conceptId => {
        const item = NAVIGATION_ITEMS.find(n => n.id === conceptId);
        if (item) {
            const link = document.createElement('a');
            link.href = item.href;
            link.className = 'related-concept-link';
            link.textContent = item.label;
            container.appendChild(link);
        }
    });

    infoPanel.appendChild(container);
}

// ============ ENHANCED AUTO-INIT ============
// Auto-Init on Load (for all pages)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initOrbUI();
        initInfoModal();
        initOscilloscope();
        initPageTransition();
        initNavSlider();
        initOnboardingHint();
        initSlidersButton();
        initShareButton();

        // Initialize StarField if container exists
        const starContainer = document.getElementById('three-container') || document.getElementById('background-stars');
        if (starContainer) initGlobalStarField(starContainer.id);

        setTimeout(centerActiveNavItems, 100);
    });
} else {
    initOrbUI();
    initInfoModal();
    initOscilloscope();
    initPageTransition();
    initNavSlider();
    initEquationInteractivity();
    initOnboardingHint();
    initSlidersButton();
    initShareButton();
    const starContainer = document.getElementById('three-container') || document.getElementById('background-stars');
    if (starContainer) initGlobalStarField(starContainer.id);
    setTimeout(centerActiveNavItems, 100);
}



// Export for module systems (if used)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkWebGLSupport,
        safeWebGLInit,
        setContentMode,
        getContentMode,
        initRelatedConcepts,
        EQUATION_TERMS
    };
}
