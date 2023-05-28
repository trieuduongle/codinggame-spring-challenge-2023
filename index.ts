enum ResourceType {
  EMPTY = 0,
  EGG = 1,
  CRYSTAL = 2,
}

interface VertexData {
  resourceType: ResourceType;
  resources: number;
  neighbors: Set<number>;
  myAnts: number;
  oppAnts: number;
}
/**
 * A node in graph
 */
class Vertex {
  resourceType: VertexData['resourceType'];
  resources: VertexData['resources'];
  neighbors: VertexData['neighbors'];
  myAnts: VertexData['myAnts'];
  oppAnts: VertexData['oppAnts'];
  constructor(inputs: Partial<VertexData> = {}) {
    const { resourceType, resources, neighbors, myAnts, oppAnts } = {
      ...inputs,
      ...this._defaultVertexData(),
    };

    this.resourceType = resourceType;
    this.resources = resources;
    this.neighbors = neighbors;
    this.myAnts = myAnts;
    this.oppAnts = oppAnts;
    this.neighbors = neighbors;
  }

  private _defaultVertexData(): VertexData {
    return {
      resourceType: ResourceType.EMPTY,
      resources: 0,
      neighbors: new Set(),
      myAnts: 0,
      oppAnts: 0,
    };
  }
}

class Graph {
  /**
   * Represents a graph as an array of linked lists
   */
  private readonly _adjacencyList = new Map<number, Vertex>();

  get numVertices() {
    return this._adjacencyList.size;
  }

  constructor(numVertices: number) {
    this._setup(numVertices);
  }

  getVertex(source: number) {
    const sourceVertex = this._adjacencyList.get(source);
    if (!sourceVertex) {
      this.logError('getVertex', `Node ${source} doesn't exist in graph`);
    }

    return sourceVertex;
  }

  addEdge(source: number, target: number) {
    const sourceVertex = this.getVertex(source);
    const targetVertex = this.getVertex(target);
    if (!sourceVertex || !targetVertex) {
      return this.logError(
        'addEdge',
        `Add edge from ${source} to ${target} failed!`,
      );
    }
    sourceVertex.neighbors.add(target);
  }

  updateVertexData(source: number, data: Partial<VertexData>) {
    const sourceVertex = this.getVertex(source);
    if (!sourceVertex) {
      return this.logError(
        'updateVertexData',
        `Cannot update vertex ${source}`,
      );
    }

    Object.assign(sourceVertex, data);
  }

  print() {
    const output: { size: number; text: string } = {
      size: this.numVertices,
      text: '',
    };

    const texts: string[] = [];
    for (const [vertexName, data] of this._adjacencyList.entries()) {
      const str = `${vertexName} -> ${[...data.neighbors].join(',')}`;
      texts.push(str);
    }
    output.text = texts.join('\n');
    console.error(JSON.stringify(output));
  }

  private _setup(numVertices: number) {
    for (let vertexIndex = 0; vertexIndex < numVertices; vertexIndex++) {
      this._adjacencyList.set(vertexIndex, new Vertex());
    }
  }

  private logError(name: string, message: string) {
    console.error(`${name}: ${message}`);
  }
}

function loadGraph(): Graph {
  const numberOfCells: number = parseInt(readline()); // amount of hexagonal cells in this map
  const graph = new Graph(numberOfCells);

  for (let vertexName = 0; vertexName < numberOfCells; vertexName++) {
    const inputs: string[] = readline().split(' ');
    const resourceType: number = parseInt(inputs[0]); // 0 for empty, 1 for eggs, 2 for food
    const initialResources: number = parseInt(inputs[1]); // the initial amount of eggs/crystals on this cell
    const neigh0: number = parseInt(inputs[2]); // the index of the neighbouring cell for each direction
    const neigh1: number = parseInt(inputs[3]);
    const neigh2: number = parseInt(inputs[4]);
    const neigh3: number = parseInt(inputs[5]);
    const neigh4: number = parseInt(inputs[6]);
    const neigh5: number = parseInt(inputs[7]);

    const vertexData: Partial<VertexData> = {
      resourceType,
      resources: initialResources,
      myAnts: 0,
      oppAnts: 0,
    };

    graph.updateVertexData(vertexName, vertexData);

    [neigh0, neigh1, neigh2, neigh3, neigh4, neigh5].forEach(neigh => {
      if (neigh > -1) {
        graph.addEdge(vertexName, neigh);
      }
    });
  }

  return graph;
}

(function () {
  const graph = loadGraph();

  const numberOfBases: number = parseInt(readline());
  const myBases: number[] = readline()
    .split(' ')
    .map(n => parseInt(n));
  const oppBases: number[] = readline()
    .split(' ')
    .map(n => parseInt(n));

  graph.print();

  // game loop
  while (true) {
    for (let vertexName = 0; vertexName < graph.numVertices; vertexName++) {
      const inputs = readline().split(' ');
      const resources: number = parseInt(inputs[0]); // the current amount of eggs/crystals on this cell
      const myAnts: number = parseInt(inputs[1]); // the amount of your ants on this cell
      const oppAnts: number = parseInt(inputs[2]); // the amount of opponent ants on this cell

      graph.updateVertexData(vertexName, { resources, myAnts, oppAnts });
    }

    // WAIT | LINE <sourceIdx> <targetIdx> <strength> | BEACON <cellIdx> <strength> | MESSAGE <text>
    const actions = [];

    // TODO: choose actions to perform and push them into actions
    // To debug: console.error('Debug messages...');
    if (actions.length === 0) {
      console.log('WAIT');
    } else {
      console.log(actions.join(';'));
    }
  }
})();
