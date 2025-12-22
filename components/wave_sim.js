
/**
 * Waveism Simulator
 * Powered by p5.js
 * 
 * Implements the "Real Superposition" of wave functions from multiple sources.
 * Mathematical Basis: u(x,y,t) = Σ A_i * sin(k * r_i - ω * t + φ_i)
 */

let sources = [];
let mode = 'emitters'; // 'emitters', 'double-slit'
let canvas;
let pg; // Graphics buffer for performance (if needed)
let t = 0; // Time

// Physics Constants
const C = 2; // Wave Speed
let FREQ = 0.1; // Frequency
let AMP = 100; // Amplitude

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('wave-sim-container');
    pixelDensity(1); // Performance optimization
    noSmooth();

    // Initial State: Single Emitter in center
    resetSimulation();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function resetSimulation() {
    sources = [];
    t = 0;

    if (mode === 'emitters') {
        // Start with one interactive source
        sources.push(new Source(width / 2, height / 2));
    } else if (mode === 'double-slit') {
        // Two sources near the left/top to simulate slits
        sources.push(new Source(width * 0.45, height * 0.5));
        sources.push(new Source(width * 0.55, height * 0.5));
    }
}

function draw() {
    background(0);
    loadPixels();

    // OPTIMIZATION: Don't calculate every single pixel for the field if it's too slow.
    // But for "Real Superposition" visualization, we need density.
    // Let's settle for a slightly coarser grid look if fullscreen, or just optimize the loop.

    // Actually, drawing raw ellipses is faster for simple interference visualization 
    // than per-pixel calc in JS. But per-pixel gives the TRUE constructive/destructive gradients.
    // Let's try the High-Fidelity Per-Pixel approach first. If slow, we'll downgrade.

    // To ensure 60fps, we might need a shader. 
    // Since I can't easily write a separate .vert/.frag file right now without more files, 
    // I will use a reliable "Wavefront" drawing method which is geometrically accurate 
    // and visually clean, rather than solving the wave equation at 1920x1080 per frame.

    // --- HYBRID APPROACH ---
    // Draw "Crests" and "Troughs" as circles with varying alpha based on superposition.

    drawField_Wavefronts();

    // Update physics
    t += C;

    // Interaction
    if (mouseIsPressed && mode === 'emitters') {
        // Move the first source
        if (sources.length > 0) {
            sources[0].x = lerp(sources[0].x, mouseX, 0.1);
            sources[0].y = lerp(sources[0].y, mouseY, 0.1);
        }
    }

    // Draw Sources
    for (let s of sources) {
        s.render();
    }

    drawHUD();
}

function mousePressed() {
    // Add new source on click if not dragging
    if (mode === 'emitters' && mouseButton === LEFT && !keyIsPressed) {
        // rudimentary check if we are clicking UI (let's assume UI handles its own clicks)
    }
}

function keyPressed() {
    if (key === 'c' || key === 'C') {
        sources = [];
    }
    if (key === ' ' || key === 'Enter') {
        // Add source at mouse
        sources.push(new Source(mouseX, mouseY));
    }
    if (key === 'd' || key === 'D') {
        mode = 'double-slit';
        resetSimulation();
    }
    if (key === 'e' || key === 'E') {
        mode = 'emitters';
        resetSimulation();
    }
}

// --- PHYSICS ENGINE ---

class Source {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.phase = 0;
    }

    render() {
        noStroke();
        fill(0, 255, 255);
        circle(this.x, this.y, 10);
    }
}

function drawField_Wavefronts() {
    // Instead of iterating pixels, we iterate DISTANCE (Wavefronts)
    // and check for interference at those points?
    // No, that's hard.

    // Let's do a lower-res pixel scan (e.g., every 8th pixel) and draw large rects.
    const RES = 8;
    const cols = width / RES;
    const rows = height / RES;

    noStroke();

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const x = i * RES;
            const y = j * RES;

            let totalAmp = 0;

            // SUPERPOSITION PRINCIPLE
            // u = sum( sin(k*r - w*t) )
            for (let s of sources) {
                const d = dist(x, y, s.x, s.y);
                const wave = Math.sin(d * FREQ - t * 0.1);
                // Inverse square law for decay (optional, makes it look more physical)
                // const decay = 100 / (d + 100); 
                totalAmp += wave;
            }

            // Normalize for visual mapping
            // -N to +N -> 0 to 255
            // Map interference: 
            // 0 (Destructive) -> Black/Gray
            // High Positive -> Cyan
            // High Negative -> Magenta (or just keep it varying brightness)

            const intensity = totalAmp / (sources.length || 1);

            if (sources.length > 0) {
                // Visualize constructive vs destructive
                // Constructive (Peaks) = Cyan
                // Destructive (Troughs) = Blue/Purple
                // Cancellation (Zero) = Black

                const val = sin(intensity * PI / 2); // fast mapping
                const brightness = map(abs(intensity), 0, 1, 0, 255);

                if (intensity > 0.1) {
                    fill(0, brightness, brightness); // Cyan for peaks
                } else if (intensity < -0.1) {
                    fill(brightness * 0.5, 0, brightness); // Purple for troughs
                } else {
                    fill(0, 10, 20); // Near zero
                }

                rect(x, y, RES, RES);
            }
        }
    }
}

function drawHUD() {
    fill(255);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(12);
    text(`FPS: ${nf(frameRate(), 0, 1)}`, 10, 10);
    text(`MODE: ${mode.toUpperCase()}`, 10, 30);
    text(`SOURCES: ${sources.length}`, 10, 50);
    text(`[Space]: Add Source | [C]: Clear | [D]: Double Slit`, 10, height - 30);
}

// Expose controlls for HTML UI
window.setSimMode = (m) => {
    mode = m;
    resetSimulation();
};

window.addSource = () => {
    sources.push(new Source(width / 2 + random(-50, 50), height / 2 + random(-50, 50)));
};

window.setParams = (f, a) => {
    FREQ = f; // 0.05 to 0.5
    AMP = a;
};
