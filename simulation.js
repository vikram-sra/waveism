
// ==========================================
// WAVE FIELD SIMULATION KERNEL v2.0
// Method: Finite Difference Time Domain (FDTD)
// Equation: ∂²u/∂t² = c²∇²u - γ(∂u/∂t)
// ==========================================

const sketch = (p) => {
    // --- PHYSICS CONSTANTS ---
    let c = 0.5; // Wave speed (Courant stability: c < 1.0)
    let damping = 0.98; // Global energy dissipation

    // --- GRID PARAMETERS ---
    let cols, rows;
    let resolution = 4; // Lower = higher fidelity, higher CPU load
    let current, previous; // Buffer arrays for time steps t and t-1
    let dampMap; // Spatial damping (1.0 = free space, 0.0 = wall)

    // --- INTERACTION ---
    let emitters = [];
    let mode = 'interference'; // 'interference' | 'slit' | 'diffraction'
    let isRunning = true;

    p.setup = () => {
        let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent('sim-canvas');
        p.pixelDensity(1);

        initGrid();
        resetScenario();
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        initGrid();
        resetScenario();
    };

    function initGrid() {
        cols = Math.ceil(p.width / resolution);
        rows = Math.ceil(p.height / resolution);

        current = new Float32Array(cols * rows).fill(0);
        previous = new Float32Array(cols * rows).fill(0);
        dampMap = new Float32Array(cols * rows).fill(1.0);
    }

    // --- SCENARIO BUILDER ---
    function resetScenario() {
        // Clear fields
        current.fill(0);
        previous.fill(0);
        dampMap.fill(1.0); // Reset to empty space
        emitters = [];

        if (mode === 'slit') {
            buildDoubleSlit();
        } else {
            // Default Interference Mode
            // No walls, just click to add emitters interactions handled in draw
            spawnPulse(Math.floor(cols * 0.3), Math.floor(rows * 0.5));
            spawnPulse(Math.floor(cols * 0.7), Math.floor(rows * 0.5));
        }
    }

    function buildDoubleSlit() {
        // Create a barrier wall at X = 30% of screen
        let wallX = Math.floor(cols * 0.3);
        let slitWidth = Math.floor(10 / resolution) + 1; // Slit size ~10px
        let slitSep = Math.floor(60 / resolution); // Separation ~60px
        let center = Math.floor(rows / 2);

        // Draw Wall
        for (let j = 0; j < rows; j++) {
            // Leave two gaps
            let inSlit1 = (j > center - slitSep / 2 - slitWidth && j < center - slitSep / 2);
            let inSlit2 = (j > center + slitSep / 2 && j < center + slitSep / 2 + slitWidth);

            if (!inSlit1 && !inSlit2) {
                let idx = wallX + j * cols;
                dampMap[idx] = 0; // Wall absorption
                // Make wall slightly thicker
                dampMap[(wallX - 1) + j * cols] = 0;
            }
        }

        // Add a continuous driver source behind the wall
        emitters.push({
            x: Math.floor(wallX * 0.5),
            y: center,
            freq: 0.2,
            phase: 0,
            active: true
        });
    }

    function spawnPulse(x, y, amp = 500) {
        if (x > 1 && x < cols - 1 && y > 1 && y < rows - 1) {
            let idx = x + y * cols;
            current[idx] = amp;
        }
    }

    // --- PHYSICS LOOP ---
    p.draw = () => {
        if (!isRunning) return;

        p.background(0);
        p.loadPixels();

        // 1. Process Emitters (Continuous drivers)
        for (let e of emitters) {
            if (e.active) {
                // Determine grid pos
                let idx = e.x + e.y * cols;
                // Oscillate the source
                e.phase += e.freq;
                current[idx] = Math.sin(e.phase) * 500;
            }
        }

        // 2. Wave Equation Solver (The Core)
        // u_next = 2*u - u_prev + c*c * laplacian
        // Optimized loop
        for (let i = 1; i < cols - 1; i++) {
            for (let j = 1; j < rows - 1; j++) {
                let idx = i + j * cols;

                // Laplacian (Neighbor avg - Center)
                let u = current[idx];
                let u_up = current[idx - cols];
                let u_down = current[idx + cols];
                let u_left = current[idx - 1];
                let u_right = current[idx + 1];

                let laplacian = (u_up + u_down + u_left + u_right - 4 * u);

                // Discrete wave equation update
                let nextVal = (2 * u) - previous[idx] + (c * c * laplacian);

                // Apply damping (global + spatial map)
                nextVal = nextVal * damping * dampMap[idx];

                // Store in 'previous' array temporarily to swap later
                // Note: Standard trick is u_new, u, u_old.
                // Here we write to 'previous' which effectively becomes 'next' 
                // and we will swap references at the end of frame.
                previous[idx] = nextVal;

                // --- RENDERING ---
                // Map wave amplitude to color
                // We render directly to pixels[] for speed
                let pixIdx = (i * resolution + j * resolution * p.width) * 4;

                // Color mapping: 
                // Positive peaks = Cyan/White
                // Negative troughs = Void/Black
                // Abs value visualization for interference pattern clarity

                let val = nextVal;
                let intensity = Math.abs(val) * 2; // Gain
                intensity = p.constrain(intensity, 0, 255);

                // Optimize: only write to pixels if visible grid cell
                // Using resolution > 1 means we are skipping pixels. 
                // For p5 p.rect is slow. Direct pixel manipulation is tricky with resolution.
                // Let's standard fallback: iterate screen pixels? No, too slow for JS.
                // Let's use p.rect? No.
                // Let's Map our grid to an Image?
            }
        }

        // 3. Render Buffer
        // The loop above calculated 'previous' as the new state.
        // We need to visualize it.
        // For performance, let's construct an ImageData or draw small rects
        // Rects are easiest for "Grid" aesthetic.

        p.noStroke();
        for (let i = 1; i < cols - 1; i++) {
            for (let j = 1; j < rows - 1; j++) {
                let idx = i + j * cols;
                let val = previous[idx];

                if (Math.abs(val) > 1) {
                    let intensity = Math.min(Math.abs(val) * 2, 255);
                    let r = 0;
                    let g = mode === 'slit' ? intensity : intensity * 0.8;
                    let b = intensity;

                    p.fill(r, g, b, 255);
                    p.rect(i * resolution, j * resolution, resolution, resolution);
                }

                // Draw walls
                if (dampMap[idx] < 0.1) {
                    p.fill(20, 20, 20);
                    p.rect(i * resolution, j * resolution, resolution, resolution);
                }
            }
        }

        // Swap buffers
        let temp = previous;
        previous = current;
        current = temp; // 'current' now holds the newest frame
    };

    p.mousePressed = () => {
        // Interaction: Spawn ripple
        let gridX = Math.floor(p.mouseX / resolution);
        let gridY = Math.floor(p.mouseY / resolution);
        spawnPulse(gridX, gridY, 1000); // High energy pulse
    };

    // --- EXTERNAL API HOOKS ---
    window.simCtrl = {
        setMode: (m) => {
            mode = m;
            resetScenario();
        },
        reset: () => {
            resetScenario();
        },
        setFreq: (f) => {
            // Update all active emitters
            emitters.forEach(e => e.freq = f);
        }
    };
};

// Start P5
new p5(sketch);
