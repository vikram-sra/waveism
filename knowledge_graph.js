
// ==========================================
// EPISTEMIC GRAPH ENGINE
// Library: D3.js v7
// Topology: Force-Directed Neural Network
// ==========================================

const initGraph = () => {
    const container = document.getElementById('graph-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear previous
    d3.select("#graph-container").selectAll("*").remove();

    const svg = d3.select("#graph-container")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", [0, 0, width, height]);

    // --- ONTOLOGY DATA ---
    // Nodes = Concepts
    // Links = Entailments / Corollaries
    const data = {
        nodes: [
            { id: "Waveism", type: "axiom", val: 20 },
            { id: "Substrate", type: "physics", val: 10 },
            { id: "Vibration", type: "physics", val: 10 },
            { id: "Resonance", type: "mechanism", val: 15 },
            { id: "Interference", type: "mechanism", val: 15 },
            { id: "Consciousness", type: "bio", val: 12 },
            { id: "Entrainment", type: "bio", val: 10 },
            { id: "Social Field", type: "social", val: 12 },
            { id: "Consensus", type: "social", val: 8 },
            { id: "Conflict", type: "social", val: 8 },
            { id: "Double Slit", type: "metaphor", val: 8 }
        ],
        links: [
            { source: "Waveism", target: "Substrate" },
            { source: "Waveism", target: "Resonance" },
            { source: "Substrate", target: "Vibration" },
            { source: "Vibration", target: "Resonance" },
            { source: "Resonance", target: "Entrainment" },
            { source: "Entrainment", target: "Consciousness" },
            { source: "Resonance", target: "Social Field" },
            { source: "Social Field", target: "Interference" },
            { source: "Interference", target: "Consensus" },
            { source: "Interference", target: "Conflict" },
            { source: "Substrate", target: "Double Slit" }
        ]
    };

    // --- SIMULATION PHYSICS ---
    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(80))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide(d => d.val + 5));

    // --- RENDER ELEMENTS ---

    // Links (Synapses)
    const link = svg.append("g")
        .attr("stroke", "#rgba(255,255,255,0.1)")
        .attr("stroke-opacity", 0.2)
        .selectAll("line")
        .data(data.links)
        .join("line")
        .attr("stroke-width", 1);

    // Nodes (Neurons)
    const node = svg.append("g")
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("r", d => d.val / 2)
        .attr("fill", d => getNodeColor(d.type))
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .attr("stroke-opacity", 0.5)
        .call(drag(simulation));

    // Labels
    const label = svg.append("g")
        .selectAll("text")
        .data(data.nodes)
        .join("text")
        .text(d => d.id)
        .attr("font-family", "JetBrains Mono")
        .attr("font-size", "10px")
        .attr("fill", "#888")
        .attr("dx", 12)
        .attr("dy", 4)
        .style("pointer-events", "none");

    // --- INTERACTION ---

    // Hover: "Vibrate" the network
    node.on("mouseover", function (event, d) {
        d3.select(this)
            .transition().duration(100)
            .attr("r", d.val) // Expand
            .attr("fill", "#fff");

        // Highlight neighbors
        link.style("stroke", l => (l.source === d || l.target === d) ? "#00f0ff" : "#rgba(255,255,255,0.1)")
            .style("stroke-opacity", l => (l.source === d || l.target === d) ? 1 : 0.2);
    })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .transition().duration(300)
                .attr("r", d.val / 2)
                .attr("fill", getNodeColor(d.type));

            link.style("stroke", "#rgba(255,255,255,0.1)")
                .style("stroke-opacity", 0.2);
        });

    // --- TICK LOOP ---
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });

    function getNodeColor(type) {
        switch (type) {
            case 'axiom': return '#ffffff';
            case 'physics': return '#00f0ff'; // Cyan
            case 'mechanism': return '#ff0055'; // Magenta
            case 'bio': return '#00ffaa'; // Green
            case 'social': return '#ffaa00'; // Orange
            default: return '#555';
        }
    }

    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
};

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", initGraph);
