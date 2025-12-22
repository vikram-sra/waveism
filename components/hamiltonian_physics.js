/**
 * Hamiltonian Physics Engine for Epistemic Map
 * Energy-conserving graph dynamics with proper dimensional analysis
 */

class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    subtract(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    multiply(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize() {
        const mag = this.magnitude();
        return mag > 0 ? this.multiply(1 / mag) : new Vector3();
    }

    distanceTo(v) {
        return this.subtract(v).magnitude();
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
}

class HamiltonianNode {
    constructor(config) {
        this.id = config.id;
        this.label = config.label;
        this.desc = config.desc;
        this.group = config.group;
        this.layer = config.layer || 0; // Ontological hierarchy level
        this.r = config.r; // Visual radius

        // Physical properties
        this.mass = config.r / 10; // Mass proportional to size
        this.position = new Vector3(config.x || 0, config.y || 0, config.z || 0);
        this.velocity = new Vector3();
        this.acceleration = new Vector3();
        this.force = new Vector3();

        // Information-theoretic properties
        this.information = config.information || 1.0; // Salience/importance
        this.entropy = config.entropy || 0; // Uncertainty measure

        // Rendering properties
        this.color = config.color || '#00ffff';
        this.glow = config.glow || 1.0;

        // Projection cache
        this.px = 0;
        this.py = 0;
        this.pz = 0;
        this.scale = 1;
    }

    applyForce(f) {
        this.force = this.force.add(f);
    }

    resetForce() {
        this.force = new Vector3();
    }

    update(dt) {
        // Velocity Verlet integration (symplectic, energy-conserving)
        // v(t + dt/2) = v(t) + a(t) * dt/2
        const halfDtAccel = this.acceleration.multiply(dt * 0.5);
        const halfVel = this.velocity.add(halfDtAccel);

        // x(t + dt) = x(t) + v(t + dt/2) * dt
        this.position = this.position.add(halfVel.multiply(dt));

        // a(t + dt) = F(t + dt) / m
        this.acceleration = this.force.multiply(1 / this.mass);

        // v(t + dt) = v(t + dt/2) + a(t + dt) * dt/2
        this.velocity = halfVel.add(this.acceleration.multiply(dt * 0.5));
    }
}

class HamiltonianLink {
    constructor(source, target, config = {}) {
        this.source = source;
        this.target = target;
        this.label = config.label || '';
        this.type = config.type || 'causal'; // causal, bidirectional, constraint
        this.restLength = config.restLength || 120; // Equilibrium distance
        this.stiffness = config.stiffness || 0.1; // Spring constant
        this.informationFlow = config.informationFlow || 0; // 0=substrate, 1=full
        this.channelCapacity = config.channelCapacity || 1.0;

        // Visual properties
        this.particlePhase = Math.random() * Math.PI * 2;
    }

    getLength() {
        return this.source.position.distanceTo(this.target.position);
    }

    getDirection() {
        return this.target.position.subtract(this.source.position).normalize();
    }
}

class HamiltonianSystem {
    constructor(config = {}) {
        this.nodes = [];
        this.links = [];

        // Physical constants (with proper dimensions)
        this.k_coulomb = config.k_coulomb || 1200; // Repulsion strength [energy * distance]
        this.k_spring = config.k_spring || 0.08; // Spring stiffness [energy / distance^2]
        this.k_damping = config.k_damping || 0.02; // Energy dissipation [1/time]
        this.epsilon = 1; // Softening parameter to prevent singularities

        // Simulation parameters
        this.timestep = 1 / 60; // 60 Hz simulation
        this.maxVelocity = 500; // Stability cap
        this.equilibriumThreshold = 0.01; // Energy change tolerance

        // Energy tracking
        this.kineticEnergy = 0;
        this.potentialEnergy = 0;
        this.totalEnergy = 0;
        this.energyHistory = [];
        this.maxHistoryLength = 300; // 5 seconds at 60fps

        // Performance optimization
        this.spatialHashGrid = null;
        this.cellSize = 100;
    }

    addNode(config) {
        const node = new HamiltonianNode(config);
        this.nodes.push(node);
        return node;
    }

    addLink(sourceId, targetId, config = {}) {
        const source = this.nodes.find(n => n.id === sourceId);
        const target = this.nodes.find(n => n.id === targetId);

        if (!source || !target) {
            console.warn(`Link failed: ${sourceId} -> ${targetId}`);
            return null;
        }

        const link = new HamiltonianLink(source, target, config);
        this.links.push(link);
        return link;
    }

    computeCoulombForces() {
        // All-pairs repulsion: F = k * q1 * q2 / r^2
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const nodeA = this.nodes[i];
                const nodeB = this.nodes[j];

                const delta = nodeA.position.subtract(nodeB.position);
                const distSq = delta.magnitude() ** 2 + this.epsilon;
                const dist = Math.sqrt(distSq);

                // Scale by "charge" (node size and information content)
                const charge = (nodeA.r + nodeB.r) * (nodeA.information + nodeB.information) / 4;
                const forceMagnitude = (this.k_coulomb * charge) / distSq;

                const forceDir = delta.normalize();
                const force = forceDir.multiply(forceMagnitude);

                nodeA.applyForce(force);
                nodeB.applyForce(force.multiply(-1));
            }
        }
    }

    computeSpringForces() {
        // Hooke's law for connected nodes: F = -k * (|r| - r0) * r̂
        this.links.forEach(link => {
            const delta = link.target.position.subtract(link.source.position);
            const dist = delta.magnitude();
            if (dist < 0.1) return; // Prevent singularity

            const displacement = dist - link.restLength;
            const forceMagnitude = link.stiffness * displacement;

            const forceDir = delta.normalize();
            const force = forceDir.multiply(forceMagnitude);

            link.source.applyForce(force);
            link.target.applyForce(force.multiply(-1));
        });
    }

    computeCentralGravity(strength = 0.01) {
        // Weak harmonic potential centered at origin
        // F = -k * r (proportional to distance, not 1/r^2)
        this.nodes.forEach(node => {
            const distFromCenter = node.position.magnitude();
            if (distFromCenter < 1) return;

            // Stronger pull when far from center
            const scaledStrength = strength * Math.min(1, distFromCenter / 300);
            const force = node.position.multiply(-scaledStrength * node.mass);
            node.applyForce(force);
        });
    }

    computePlanarBias(strength = 0.02) {
        // Slight pull toward XY plane for better visualization
        this.nodes.forEach(node => {
            const force = new Vector3(0, 0, -node.position.z * strength * node.mass);
            node.applyForce(force);
        });
    }

    computeDamping() {
        // Linear drag: F = -b * v
        this.nodes.forEach(node => {
            const damping = node.velocity.multiply(-this.k_damping * node.mass);
            node.applyForce(damping);
        });
    }

    update(dt, params = {}) {
        const { gravityStrength = 0.05, enableDamping = true } = params;

        // Reset all forces
        this.nodes.forEach(node => node.resetForce());

        // Apply all forces
        this.computeCoulombForces();
        this.computeSpringForces();
        this.computeCentralGravity(gravityStrength);
        this.computePlanarBias();

        if (enableDamping) {
            this.computeDamping();
        }

        // Velocity clamping for stability
        this.nodes.forEach(node => {
            const speed = node.velocity.magnitude();
            if (speed > this.maxVelocity) {
                node.velocity = node.velocity.normalize().multiply(this.maxVelocity);
            }
        });

        // Integrate equations of motion
        this.nodes.forEach(node => node.update(dt));

        // Compute energies
        this.updateEnergies();
    }

    updateEnergies() {
        // Kinetic energy: T = Σ (1/2) * m * v^2
        this.kineticEnergy = this.nodes.reduce((sum, node) => {
            return sum + 0.5 * node.mass * node.velocity.magnitude() ** 2;
        }, 0);

        // Potential energy: V = V_coulomb + V_spring
        let V_coulomb = 0;
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dist = this.nodes[i].position.distanceTo(this.nodes[j].position);
                const charge = (this.nodes[i].r + this.nodes[j].r) / 2;
                V_coulomb += this.k_coulomb * charge / (dist + this.epsilon);
            }
        }

        let V_spring = 0;
        this.links.forEach(link => {
            const dist = link.getLength();
            const displacement = dist - link.restLength;
            V_spring += 0.5 * link.stiffness * displacement ** 2;
        });

        this.potentialEnergy = V_coulomb + V_spring;
        this.totalEnergy = this.kineticEnergy + this.potentialEnergy;

        // Track energy history
        this.energyHistory.push({
            time: performance.now() / 1000,
            kinetic: this.kineticEnergy,
            potential: this.potentialEnergy,
            total: this.totalEnergy
        });

        if (this.energyHistory.length > this.maxHistoryLength) {
            this.energyHistory.shift();
        }
    }

    getEnergyDrift() {
        if (this.energyHistory.length < 2) return 0;
        const initial = this.energyHistory[0].total;
        const current = this.totalEnergy;
        return Math.abs(current - initial) / (Math.abs(initial) + 1e-10);
    }

    isAtEquilibrium() {
        if (this.energyHistory.length < 60) return false; // Need at least 1 second

        const recent = this.energyHistory.slice(-60);
        const avgEnergy = recent.reduce((sum, e) => sum + e.total, 0) / recent.length;
        const variance = recent.reduce((sum, e) => sum + (e.total - avgEnergy) ** 2, 0) / recent.length;

        return variance / (avgEnergy + 1e-10) < this.equilibriumThreshold;
    }

    projectNodes(rotX, rotY, zoom) {
        this.nodes.forEach(node => {
            const projected = project3D(
                node.position.x,
                node.position.y,
                node.position.z,
                rotX, rotY, 0, 0, zoom
            );
            node.px = projected.x;
            node.py = projected.y;
            node.pz = projected.z;
            node.scale = projected.scale;
        });
    }

    propagateSignal(sourceNode, timestamp, propagationSpeed = 300) {
        // Causal signal propagation with finite speed
        const signals = [];

        this.links.filter(link => link.source === sourceNode).forEach(link => {
            const distance = link.getLength();
            const arrivalTime = timestamp + distance / propagationSpeed;

            signals.push({
                time: arrivalTime,
                source: link.source,
                target: link.target,
                strength: Math.exp(-distance / 200), // Exponential decay
                link: link
            });
        });

        return signals;
    }
}

// Export for use in wave_theory.html
if (typeof window !== 'undefined') {
    window.HamiltonianSystem = HamiltonianSystem;
    window.HamiltonianNode = HamiltonianNode;
    window.HamiltonianLink = HamiltonianLink;
    window.Vector3 = Vector3;
}
