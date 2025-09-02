const Route = require('../models/Route');

class ShortestPath {
  constructor() {
    this.graph = {};
    this.distances = {};
    this.previous = {};
  }

  // Build graph from routes
  async buildGraph() {
    try {
      const routes = await Route.find();
      this.graph = {};
      
      routes.forEach(route => {
        if (!this.graph[route.from]) {
          this.graph[route.from] = {};
        }
        this.graph[route.from][route.to] = route.timeInMinutes;
      });
      
      return this.graph;
    } catch (error) {
      throw new Error('Failed to build graph: ' + error.message);
    }
  }

  // Dijkstra's algorithm implementation
  async findShortestPath(source, destination) {
    await this.buildGraph();
    
    if (!this.graph[source]) {
      throw new Error(`Source location '${source}' not found`);
    }
    
    if (!this.graph[destination] && !Object.values(this.graph).some(neighbors => neighbors[destination])) {
      throw new Error(`Destination location '${destination}' not found`);
    }

    // Initialize distances and previous nodes
    const nodes = new Set();
    Object.keys(this.graph).forEach(node => nodes.add(node));
    Object.values(this.graph).forEach(neighbors => {
      Object.keys(neighbors).forEach(node => nodes.add(node));
    });

    this.distances = {};
    this.previous = {};
    const unvisited = new Set(nodes);

    // Initialize distances
    nodes.forEach(node => {
      this.distances[node] = node === source ? 0 : Infinity;
      this.previous[node] = null;
    });

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let currentNode = null;
      let minDistance = Infinity;
      
      unvisited.forEach(node => {
        if (this.distances[node] < minDistance) {
          minDistance = this.distances[node];
          currentNode = node;
        }
      });

      if (currentNode === null || this.distances[currentNode] === Infinity) {
        break;
      }

      unvisited.delete(currentNode);

      if (currentNode === destination) {
        break;
      }

      // Update distances to neighbors
      if (this.graph[currentNode]) {
        Object.entries(this.graph[currentNode]).forEach(([neighbor, weight]) => {
          if (unvisited.has(neighbor)) {
            const newDistance = this.distances[currentNode] + weight;
            if (newDistance < this.distances[neighbor]) {
              this.distances[neighbor] = newDistance;
              this.previous[neighbor] = currentNode;
            }
          }
        });
      }
    }

    // Reconstruct path
    if (this.distances[destination] === Infinity) {
      throw new Error(`No path found from ${source} to ${destination}`);
    }

    const path = [];
    let current = destination;
    
    while (current !== null) {
      path.unshift(current);
      current = this.previous[current];
    }

    return {
      path,
      totalTime: this.distances[destination],
      distance: this.distances[destination]
    };
  }

  // Get all possible destinations from a source
  async getDestinations(source) {
    await this.buildGraph();
    
    const destinations = new Set();
    
    // Direct destinations
    if (this.graph[source]) {
      Object.keys(this.graph[source]).forEach(dest => destinations.add(dest));
    }
    
    // All nodes that can be reached (for indirect routes)
    Object.keys(this.graph).forEach(node => {
      if (node !== source) {
        destinations.add(node);
      }
    });
    
    Object.values(this.graph).forEach(neighbors => {
      Object.keys(neighbors).forEach(node => {
        if (node !== source) {
          destinations.add(node);
        }
      });
    });

    return Array.from(destinations).sort();
  }

  // Get all source locations
  async getSources() {
    await this.buildGraph();
    
    const sources = new Set();
    
    Object.keys(this.graph).forEach(source => sources.add(source));
    Object.values(this.graph).forEach(neighbors => {
      Object.keys(neighbors).forEach(dest => sources.add(dest));
    });

    return Array.from(sources).sort();
  }
}

module.exports = ShortestPath;
