# Waveism | Epistemic Interface

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> A Unified Field Theory Dashboard — Interactive physics visualizations exploring fundamental concepts from quantum mechanics to cosmology.

**[▶ Live Demo](https://waveism.duar.one)** | **[◆ Contribute](DOCS_CONTRIBUTING.md)** | **[⚠ Report Bug](https://github.com/vikram-sra/waveism/issues)**

## ⬡ Project Overview

| Category | Details |
|----------|---------|
| **Type** | Progressive Web App (PWA) |
| **Stack** | HTML5, CSS3, JavaScript, Three.js, WebGL |
| **Design** | Cyberpunk/Sci-Fi aesthetic with glitch overlays |
| **Platform** | iOS optimized, responsive web |
| **Navigation** | Horizontal scroll reel with infinite loop |

---

## ◈ Visualization Modules

| Module | File | Question Explored | Domain |
|--------|------|-------------------|--------|
| **Quantum** | `quantum.html` | Can you be in two places? | Wave function, superposition |
| **Uncertainty** | `uncertainty.html` | Is reality fundamentally blurry? | Heisenberg's limit |
| **Waveism** | `wave_theory.html` | Is everything just a vibration? | Oscillatory reality |
| **Resonance** | `resonance.html` | Why does energy amplify? | Interference, entrainment |
| **Chaos** | `chaos.html` | Can a butterfly cause a storm? | Strange attractors |
| **Arrow** | `arrow.html` | Why can't we reverse time? | Entropy, thermodynamics |
| **Fabric** | `fabric.html` | What is empty space made of? | Metric tensor |
| **Wormhole** | `wormhole.html` | Are there shortcuts in space? | Topological bridges |
| **Spacetime** | `spacetime.html` | Is the future already written? | 4D continuum, worldlines |
| **Black Hole** | `blackhole.html` | What happens if you fall in? | Singularities, curvature |
| **Expansion** | `expansion.html` | Where is the universe going? | Cosmic acceleration |
| **Cosmic** | `cosmic.html` | What does the universe look like? | Galactic filaments |
| **Create Wave** | (interactive) | Can you trigger a ripple? | Force feedback canvas |

---

## ▣ Project Structure

| Path | Purpose |
|------|---------|
| `index.html` | Main reel interface with all phase cards |
| `modules/` | Individual visualization pages (quantum, arrow, chaos, etc.) |
| `components/shared.js` | Shared utilities: navigation, starfield, 3D projection, drag/zoom handlers |
| `components/shared.css` | Global styles: navigation, theory tabs, modals, parameter panels |
| `components/physics_ontology.js` | Physics concept ontology system |
| `components/hamiltonian_physics.js` | Hamiltonian mechanics simulation |
| `components/wave_sim.js` | Wave physics simulation engine |
| `components/knowledge_graph.js` | Knowledge graph visualization |
| `icons/` | PWA icons (152px – 512px) |
| `manifest.json` | PWA manifest for standalone install |

---

## ⚡ Features

| Feature | Implementation |
|---------|----------------|
| **Infinite Scroll** | Clone first/last sections for seamless looping |
| **3D Visualizations** | Canvas 2D + Three.js WebGL renders |
| **Parallax Starfield** | Multi-layer depth simulation |
| **Force Feedback** | "Create Wave" touch/force interaction |
| **Scanline Overlay** | Retro CRT glitch effect |
| **Manifesto Gate** | Thesis + disclaimer overlay with localStorage opt-out |
| **Gravitational Time Dilation** | Disk particles slow near the Schwarzschild radius |
| **PWA Support** | Installable, offline-capable manifest |
| **iOS Safe Areas** | `env(safe-area-inset-*)` padding |

---

## ► Getting Started

```bash
# Simply serve any HTTP server — no build step required
python3 -m http.server 8000
# or
npx serve .
```

Then open [http://localhost:8000](http://localhost:8000).

---

## ◉ Design System

| Token | Value |
|-------|-------|
| `--bg` | `#000508` |
| `--accent` | Dynamic per phase (eg. `#00ddff`, `#ff0055`) |
| **Font (Display)** | JetBrains Mono |
| **Font (Body)** | Inter |

---

## ⟡ Contributing

We welcome contributions! Whether it's:
- ⚠ **Bug fixes**
- ◆ **New visualizations** for physics concepts
- ▪ **Documentation improvements**
- ◉ **UI/UX enhancements**

Please read our [**Contributing Guidelines**](DOCS_CONTRIBUTING.md) before submitting a PR.

---

## ⬢ License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this project with attribution.

---

## ◇ Acknowledgments

- **Three.js** for 3D rendering capabilities
- **Physics community** for accurate representations
- **Contributors** who help improve this project

---

*Built with curiosity about the fundamental nature of reality.*

---

## ⚛ Scientific Accuracy

This project is **scientific communication**, not a physics engine. All established physics — equations, descriptions, and concepts — is sourced from standard textbooks and peer-reviewed literature.

Content labeled **"Waveism"** represents speculative interpretive bridges between established theories.

A manifesto/disclaimer overlay appears on the homepage to clearly frame this distinction for visitors. Users may opt out of seeing it again via a checkbox.

### Accuracy Audit
The codebase has undergone a physics accuracy audit verifying:
- ✅ Heisenberg uncertainty (`Δx·Δp ≥ ℏ/2`) — correct inverse relationship
- ✅ Lorenz attractor (σ=10, ρ=28, β=8/3) — canonical parameters with RK4 integration
- ✅ Double-slit interference — textbook superposition with Fraunhofer intensity
- ✅ Gravitational time dilation — `√(1 - rₛ/r)` factor on disk particle velocities
- ✅ Landauer's principle — Maxwell's Demon equation corrected to `ΔS_erase ≥ k_B ln 2`
