/**
 * Shared JavaScript Utilities for Spacetime Visualizations
 * Common functionality across all visualization pages
 */

// ============ NAVIGATION DATA ============
// Scale: 10^x meters
const NAVIGATION_ITEMS = [
    { href: 'quantum.html', label: 'QUANTUM', id: 'quantum', scale: '10⁻³⁵m', val: -35 },
    { href: 'uncertainty.html', label: 'UNCERTAINTY', id: 'uncertainty', scale: '10⁻³⁰m', val: -30 },
    { href: 'wave_theory.html', label: 'WAVEISM', id: 'wave_theory', scale: '10⁻¹⁵m', val: -15 },
    { href: 'resonance.html', label: 'RESONANCE', id: 'resonance', scale: '10⁻⁶m', val: -6 },
    { href: 'chaos.html', label: 'CHAOS', id: 'chaos', scale: '10⁰m', val: 0 },
    { href: 'arrow.html', label: 'ARROW', id: 'arrow', scale: '10⁵m', val: 5 },
    { href: 'fabric.html', label: 'FABRIC', id: 'fabric', scale: '10¹⁰m', val: 10 },
    { href: 'wormhole.html', label: 'WORMHOLE', id: 'wormhole', scale: '10¹⁵m', val: 15 },
    { href: 'spacetime.html', label: 'SPACETIME', id: 'spacetime', scale: '10¹⁸m', val: 18 },
    { href: 'blackhole.html', label: 'BLACK HOLE', id: 'blackhole', scale: '10²¹m', val: 21 },
    { href: 'expansion.html', label: 'EXPANSION', id: 'expansion', scale: '10²⁴m', val: 24 },
    { href: 'cosmic.html', label: 'COSMIC', id: 'cosmic', scale: '10²⁶m', val: 26 }
];

// ============ RENDER NAVIGATION ============
// ============ RENDER NAVIGATION (TUNING FORK) ============
function renderMainNav(activeId) {
    const homeBtn = `<a href="index.html" class="main-nav-tab home-btn" title="Home">⌂</a>`;

    const navHtml = NAVIGATION_ITEMS.map(item => {
        const activeClass = item.id === activeId ? ' active' : '';
        return `
        <a href="${item.href}" class="main-nav-tab${activeClass}">
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
    <div class="${containerClass}">
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

    infoBtn.addEventListener('click', () => {
        infoModal.classList.toggle('open');
        infoBtn.classList.toggle('active');
    });

    if (infoClose) {
        infoClose.addEventListener('click', () => {
            infoModal.classList.remove('open');
            infoBtn.classList.remove('active');
        });
    }
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

// ============ UPDATE INFO MODAL CONTENT ============
function updateInfoModalContent(data) {
    const descEl = document.getElementById('info-description');
    const conceptsEl = document.getElementById('info-concepts');
    const physicsEl = document.getElementById('info-physics');

    if (descEl && data.description) descEl.textContent = data.description;
    if (physicsEl && data.physics) physicsEl.textContent = data.physics;

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
function makeUIElementDraggable(el) {
    if (!el) return;
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    const onStart = (clientX, clientY) => {
        isDragging = true;
        startX = clientX;
        startY = clientY;
        const rect = el.getBoundingClientRect();
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

        // If it was a tap (not dragged), fire the toggle logic
        if (el.dataset.dragged !== "true") {
            // We'll let the click event handle the toggle to avoid double-firing
        }
    };

    el.addEventListener('pointerdown', e => {
        initialLeft = el.getBoundingClientRect().left;
        initialTop = el.getBoundingClientRect().top;
        onStart(e.clientX, e.clientY);
        el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointermove', e => {
        if (isDragging) onMove(e.clientX, e.clientY);
    });

    el.addEventListener('pointerup', e => {
        onPointerEnd(e);
        el.releasePointerCapture(e.pointerId);
    });

    // Touch Action None is critical for pointer events on mobile
    el.style.touchAction = 'none';
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

    const orb = document.createElement('div');
    orb.className = 'ui-orb';
    orb.title = "Toggle Interface";
    document.body.appendChild(orb);

    makeUIElementDraggable(orb);

    let autoHideTimer = setTimeout(() => {
        document.body.classList.remove('ui-open');
        orb.classList.remove('active');
    }, 15000); // Increased to 15 seconds per user request

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
    // Zen Mode Logic
    const toggleUI = () => {
        if (orb.dataset.dragged === "true") {
            orb.dataset.dragged = "false";
            return;
        }
        cancelAutoHide();
        const isOpen = document.body.classList.toggle('ui-open');
        orb.classList.toggle('active', isOpen);

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
        if (orb.dataset.dragged !== "true") {
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
        if (navContainer) navContainer.classList.add('visible');
    }, 100);
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

// Auto-Init on Load (for all pages)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initOrbUI();
        initOscilloscope();
        initPageTransition();
        initNavSlider();

        // Initialize StarField if container exists
        const starContainer = document.getElementById('three-container') || document.getElementById('background-stars');
        if (starContainer) initStarField(starContainer.id);

        setTimeout(centerActiveNavItems, 100);
    });
} else {
    initOrbUI();
    initOscilloscope();
    initPageTransition();
    initNavSlider();
    const starContainer = document.getElementById('three-container') || document.getElementById('background-stars');
    if (starContainer) initStarField(starContainer.id);
    setTimeout(centerActiveNavItems, 100);
}



// Export for module systems (if used)
if (typeof module !== 'undefined' && module.exports) {
    // ... (rest of exports)
}
