
/**
 * Waveism Knowledge Graph
 * Powered by D3.js
 * 
 * Visualization of the "Epistemic Network"
 */

const graphData = {
    nodes: [
        { id: "Waveism", group: 1, r: 20 },
        { id: "The Field", group: 1, r: 15 },
        { id: "Superposition", group: 2, r: 10 },
        { id: "Entrainment", group: 3, r: 12 },
        { id: "Resonance", group: 3, r: 12 },
        { id: "Interference", group: 4, r: 12 },
        { id: "The Observer", group: 2, r: 15 },
        { id: "Consciousness", group: 2, r: 10 },
        { id: "Society", group: 4, r: 15 },
        { id: "Conflict", group: 4, r: 8 },
        { id: "Harmony", group: 4, r: 8 },
        { id: "Quantum", group: 1, r: 10 },
        { id: "Gravity", group: 1, r: 10 },
        { id: "Time", group: 1, r: 10 }
    ],
    links: [
        { source: "Waveism", target: "The Field" },
        { source: "Waveism", target: "The Observer" },
        { source: "Waveism", target: "Society" },
        { source: "The Field", target: "Superposition" },
        { source: "The Field", target: "Quantum" },
        { source: "The Field", target: "Gravity" },
        { source: "The Observer", target: "Consciousness" },
        { source: "The Observer", target: "Entrainment" },
        { source: "Entrainment", target: "Resonance" },
        { source: "Society", target: "Interference" },
        { source: "Interference", target: "Conflict" },
        { source: "Interference", target: "Harmony" },
        { source: "Consciousness", target: "Time" },
        { source: "Resonance", target: "Harmony" }
    ]
};

function initKnowledgeGraph(containerId) {
    const width = document.getElementById(containerId).clientWidth;
    const height = document.getElementById(containerId).clientHeight;

    const svg = d3.select("#" + containerId)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("overflow", "visible");

    // Simulation Setup
    const simulation = d3.forceSimulation(graphData.nodes)
        .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(80))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(d => d.r + 5));

    // Render Links
    const link = svg.append("g")
        .attr("stroke", "rgba(0, 255, 255, 0.2)")
        .attr("stroke-width", 1.5)
        .selectAll("line")
        .data(graphData.links)
        .join("line");

    // Render Nodes
    const node = svg.append("g")
        .selectAll("g")
        .data(graphData.nodes)
        .join("g")
        .call(drag(simulation));

    // Node Circles
    node.append("circle")
        .attr("r", d => d.r)
        .attr("fill", d => getTypeColor(d.group))
        .attr("stroke", "#00ffff")
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        .attr("class", "node-circle");

    // Node Labels
    node.append("text")
        .attr("x", d => d.r + 5)
        .attr("y", 4)
        .text(d => d.id)
        .attr("fill", "#fff")
        .style("font-family", "JetBrains Mono")
        .style("font-size", "0.7rem")
        .style("pointer-events", "none")
        .style("text-shadow", "0 0 5px #000");

    // Interaction: "Vibration"
    node.on("mouseover", function (event, d) {
        // Vibrate this node
        d3.select(this).select("circle")
            .transition().duration(200).attr("r", d.r * 1.5)
            .attr("fill", "#ffffff");

        // "Vibrate" connected neighbors
        link.style("stroke", l => {
            if (l.source.id === d.id || l.target.id === d.id) return "rgba(0, 255, 255, 0.8)";
            return "rgba(0, 255, 255, 0.1)";
        }).style("stroke-width", l => {
            if (l.source.id === d.id || l.target.id === d.id) return 3;
            return 1;
        });

        // Find neighbors
        const neighborIds = new Set();
        graphData.links.forEach(l => {
            if (l.source.id === d.id) neighborIds.add(l.target.id);
            if (l.target.id === d.id) neighborIds.add(l.source.id);
        });

        node.select("circle").filter(n => neighborIds.has(n.id))
            .transition().duration(200)
            .attr("fill", "#ccffff")
            .attr("r", n => n.r * 1.2);
    })
        .on("mouseout", function (event, d) {
            // Reset
            d3.select(this).select("circle")
                .transition().duration(500).attr("r", d.r)
                .attr("fill", getTypeColor(d.group));

            link.style("stroke", "rgba(0, 255, 255, 0.2)")
                .style("stroke-width", 1.5);

            node.select("circle")
                .transition().duration(500)
                .attr("fill", n => getTypeColor(n.group))
                .attr("r", n => n.r);
        });

    // Tick Frame
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function getTypeColor(group) {
        switch (group) {
            case 1: return "rgba(0, 255, 255, 0.3)"; // Core
            case 2: return "rgba(255, 0, 255, 0.3)"; // Observer
            case 3: return "rgba(255, 255, 0, 0.3)"; // Bio
            case 4: return "rgba(0, 255, 0, 0.3)";   // Social
            default: return "#fff";
        }
    }
}

// Drag Interaction
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
