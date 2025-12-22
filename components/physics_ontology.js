/**
 * Physics-Based Ontology for Epistemic Map
 * Structured as a Directed Acyclic Graph (DAG) with causal relationships
 */

const PHYSICS_ONTOLOGY = {
    // Node definitions with layer-based hierarchy
    nodes: [
        // ========== LAYER 0: FUNDAMENTAL SUBSTRATE ==========
        {
            id: "SPACETIME",
            label: "SPACETIME",
            r: 102,
            group: 0,
            layer: 0,
            color: '#ffffff',
            information: 2.0,
            desc: "The (3+1)-dimensional Lorentzian manifold. The kinematic stage on which all physics unfolds.",
            equation: "ds² = -c²dt² + dx² + dy² + dz²",
            field: "g_μν(x)"
        },
        {
            id: "QUANTUM_VACUUM",
            label: "VACUUM",
            r: 82,
            group: 0,
            layer: 0,
            color: '#00ffff',
            information: 2.0,
            desc: "The lowest energy state of quantum fields. Not empty—filled with zero-point fluctuations.",
            equation: "⟨0|Ĥ|0⟩ = ½ℏω",
            field: "ψ̂(x,t)"
        },

        // ========== LAYER 1: EMERGENT CLASSICAL FIELDS ==========
        {
            id: "QUANTUM_FIELD",
            label: "QFT",
            r: 45,
            group: 1,
            layer: 1,
            color: '#ff00ff',
            information: 1.5,
            desc: "Operator-valued distributions on spacetime. Particles are excitations of these fields.",
            equation: "[ψ̂(x), ψ̂†(y)] = δ³(x-y)",
            field: "Φ̂(x)"
        },
        {
            id: "CLASSICAL_FIELD",
            label: "Classical",
            r: 37,
            group: 1,
            layer: 1,
            color: '#00ff00',
            information: 1.3,
            desc: "Coherent states and expectation values. The classical limit (ℏ → 0).",
            equation: "⟨ψ̂⟩ = Φ_classical",
            field: "φ(x,t)"
        },
        {
            id: "CAUSALITY",
            label: "CAUSALITY",
            r: 33,
            group: 1,
            layer: 1,
            color: '#ffff00',
            information: 1.8,
            desc: "Light cone structure. Information cannot propagate faster than c.",
            equation: "ds² < 0 ⇒ timelike",
            field: "∂_μ φ"
        },

        // ========== LAYER 2: THERMODYNAMIC & STATISTICAL ==========
        {
            id: "ENTROPY",
            label: "Entropy",
            r: 30,
            group: 2,
            layer: 3,
            color: '#ff6600',
            information: 1.2,
            desc: "Statistical measure of disorder. The arrow of time emerges from entropy increase.",
            equation: "S = -k_B Tr(ρ ln ρ)",
            field: "S[ρ]"
        },
        {
            id: "TIME_EMERGENCE",
            label: "TIME",
            r: 42,
            group: 2,
            layer: 3,
            color: '#ff4466',
            information: 1.6,
            desc: "Time is not fundamental—it emerges from thermodynamic gradients and decoherence.",
            equation: "dS/dt ≥ 0",
            field: "t_thermal"
        },
        {
            id: "DECOHERENCE",
            label: "Decohere",
            r: 27,
            group: 2,
            layer: 3,
            color: '#cc66ff',
            information: 1.1,
            desc: "Environmental entanglement destroys superposition, yielding classical appearance.",
            equation: "ρ → Σ_i p_i |i⟩⟨i|",
            field: "γ_dec"
        },

        // ========== LAYER 3: BIOLOGICAL SYSTEMS ==========
        {
            id: "NEURAL_DYNAMICS",
            label: "Neural",
            r: 33,
            group: 3,
            layer: 4,
            color: '#00ddff',
            information: 1.3,
            desc: "Self-organized criticality in neural networks. Oscillatory binding at ~40Hz (gamma).",
            equation: "∂ρ/∂t = D∇²ρ + R(ρ)",
            field: "ρ_neural(x,t)"
        },
        {
            id: "CIRCADIAN",
            label: "Circadian",
            r: 22,
            group: 3,
            layer: 4,
            color: '#44ff88',
            information: 0.9,
            desc: "Biological oscillators (~24h period). Entrainment to environmental cycles.",
            equation: "τ ≈ 24 hours",
            field: "Clock(t)"
        },

        // ========== LAYER 4: COGNITIVE PROCESSES ==========
        {
            id: "BAYESIAN_BRAIN",
            label: "Inference",
            r: 36,
            group: 4,
            layer: 6,
            color: '#ff88ff',
            information: 1.4,
            desc: "Predictive coding and free energy minimization. The brain as a Bayesian inference machine.",
            equation: "F = ⟨E⟩_Q - H[Q]",
            field: "Q(θ|D)"
        },
        {
            id: "PERCEPTION",
            label: "PERCEPTION",
            r: 39,
            group: 4,
            layer: 6,
            color: '#8888ff',
            information: 1.5,
            desc: "Interface theory: we perceive fitness payoffs, not objective reality.",
            equation: "I(X;Y) ≥ Fitness",
            field: "Ψ_perceived"
        },
        {
            id: "CONSCIOUSNESS",
            label: "Conscious",
            r: 30,
            group: 4,
            layer: 6,
            color: '#ff66ff',
            information: 1.7,
            desc: "Integrated information (Φ). The 'hard problem'—why does it feel like something?",
            equation: "Φ = IIT measure",
            field: "Φ(system)"
        },

        // ========== LAYER 5: SOCIAL & MEMETIC ==========
        {
            id: "SOCIAL_NETWORK",
            label: "Social",
            r: 30,
            group: 5,
            layer: 7,
            color: '#ffaa44',
            information: 1.1,
            desc: "Graph structure of social connections. Information spreads via network topology.",
            equation: "dI/dt = βSI - γI",
            field: "G = (V, E)"
        },
        {
            id: "MEMETICS",
            label: "Memes",
            r: 24,
            group: 5,
            layer: 7,
            color: '#ff8844',
            information: 0.8,
            desc: "Cultural replicators. Ideas that spread and evolve via social contagion.",
            equation: "R₀ > 1 ⇒ spread",
            field: "m(t)"
        }
    ],

    // Causal links (directed edges)
    links: [
        // Layer 0 → Layer 1 (Substrate enables fields)
        {
            source: "SPACETIME",
            target: "QUANTUM_FIELD",
            label: "Supports",
            type: "substrate",
            informationFlow: 0,
            restLength: 140
        },
        {
            source: "SPACETIME",
            target: "CAUSALITY",
            label: "Defines",
            type: "causal",
            informationFlow: 0,
            restLength: 130
        },
        {
            source: "QUANTUM_VACUUM",
            target: "QUANTUM_FIELD",
            label: "Fluctuations",
            type: "causal",
            informationFlow: 0.2,
            restLength: 120
        },

        // Layer 1 → Layer 1 (Lateral connections)
        {
            source: "QUANTUM_FIELD",
            target: "CLASSICAL_FIELD",
            label: "ℏ → 0",
            type: "coarse_graining",
            informationFlow: 0.8,
            restLength: 100
        },
        {
            source: "CAUSALITY",
            target: "CLASSICAL_FIELD",
            label: "Constrains",
            type: "constraint",
            informationFlow: 0.1,
            restLength: 110
        },

        // Layer 1 → Layer 2 (Fields → Thermodynamics)
        {
            source: "QUANTUM_FIELD",
            target: "DECOHERENCE",
            label: "Environment",
            type: "causal",
            informationFlow: 0.9,
            restLength: 130
        },
        {
            source: "CLASSICAL_FIELD",
            target: "ENTROPY",
            label: "Statistics",
            type: "causal",
            informationFlow: 0.7,
            restLength: 120
        },
        {
            source: "ENTROPY",
            target: "TIME_EMERGENCE",
            label: "Arrow",
            type: "causal",
            informationFlow: 1.0,
            restLength: 90
        },
        {
            source: "DECOHERENCE",
            target: "TIME_EMERGENCE",
            label: "Correlation",
            type: "causal",
            informationFlow: 0.8,
            restLength: 100
        },

        // Layer 2 → Layer 3 (Thermodynamics → Biology)
        {
            source: "TIME_EMERGENCE",
            target: "NEURAL_DYNAMICS",
            label: "Enables",
            type: "causal",
            informationFlow: 0.6,
            restLength: 140
        },
        {
            source: "TIME_EMERGENCE",
            target: "CIRCADIAN",
            label: "Periodicity",
            type: "causal",
            informationFlow: 0.5,
            restLength: 135
        },
        {
            source: "ENTROPY",
            target: "NEURAL_DYNAMICS",
            label: "Dissipation",
            type: "constraint",
            informationFlow: 0.4,
            restLength: 150
        },

        // Layer 3 → Layer 4 (Biology → Cognition)
        {
            source: "NEURAL_DYNAMICS",
            target: "BAYESIAN_BRAIN",
            label: "Implements",
            type: "causal",
            informationFlow: 1.0,
            restLength: 110
        },
        {
            source: "NEURAL_DYNAMICS",
            target: "CONSCIOUSNESS",
            label: "Integration",
            type: "causal",
            informationFlow: 0.9,
            restLength: 105
        },
        {
            source: "BAYESIAN_BRAIN",
            target: "PERCEPTION",
            label: "Constructs",
            type: "causal",
            informationFlow: 1.0,
            restLength: 95
        },
        {
            source: "CIRCADIAN",
            target: "CONSCIOUSNESS",
            label: "Modulates",
            type: "modulation",
            informationFlow: 0.3,
            restLength: 130
        },

        // Layer 4 → Layer 5 (Cognition → Social)
        {
            source: "PERCEPTION",
            target: "SOCIAL_NETWORK",
            label: "Agency",
            type: "causal",
            informationFlow: 0.8,
            restLength: 130
        },
        {
            source: "CONSCIOUSNESS",
            target: "SOCIAL_NETWORK",
            label: "Communication",
            type: "causal",
            informationFlow: 0.7,
            restLength: 125
        },
        {
            source: "BAYESIAN_BRAIN",
            target: "MEMETICS",
            label: "Learning",
            type: "causal",
            informationFlow: 0.9,
            restLength: 140
        },

        // Layer 5 internal
        {
            source: "SOCIAL_NETWORK",
            target: "MEMETICS",
            label: "Propagates",
            type: "causal",
            informationFlow: 1.0,
            restLength: 90
        },

        // Feedback loops (carefully chosen to avoid breaking DAG at macro level)
        {
            source: "PERCEPTION",
            target: "SPACETIME",
            label: "Measurement",
            type: "observer_effect",
            informationFlow: 0.1,
            restLength: 200,
            style: "dashed" // Visual indicator of feedback
        }
    ]
};

// Layer-based initialization positions (spread nodes by layer)
function initializeLayeredPositions(ontology) {
    const layerGroups = {};

    // Group nodes by layer
    ontology.nodes.forEach(node => {
        if (!layerGroups[node.layer]) {
            layerGroups[node.layer] = [];
        }
        layerGroups[node.layer].push(node);
    });

    // Position nodes in cylindrical shells by layer
    Object.keys(layerGroups).forEach(layer => {
        const nodes = layerGroups[layer];
        const radius = 100 + parseInt(layer) * 100; // Increasing radius per layer
        const angleStep = (Math.PI * 2) / nodes.length;

        nodes.forEach((node, i) => {
            const angle = i * angleStep;
            node.x = Math.cos(angle) * radius;
            node.y = Math.sin(angle) * radius * 0.6; // Flatten vertically
            node.z = (parseInt(layer) - 2.5) * 60; // Spread in depth
        });
    });

    return ontology;
}

// Export
if (typeof window !== 'undefined') {
    window.PHYSICS_ONTOLOGY = PHYSICS_ONTOLOGY;
    window.initializeLayeredPositions = initializeLayeredPositions;
}
