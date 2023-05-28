enum ResourceType {
  EMPTY = 0,
  EGG = 1,
  CRYSTAL = 2,
}

enum ActionType {
  Beacon = 'BEACON',
  Line = 'LINE',
  Wait = 'WAIT',
  Message = 'MESSAGE',
}

enum SearchAlgorithmType {
  BreathFirstSearch = 'BreathFirstSearch',
  HeuristicSearch = 'HeuristicSearch',
}

interface ActionData {
  actionType: ActionType;
  vertexName: number;
  strength: number;
}

interface VertexData {
  resourceType: ResourceType;
  resources: number;
  neighbors: Set<number>;
  myAnts: number;
  oppAnts: number;
}

function logError(name: string, message: string) {
  console.error(`${name}: ${message}`);
}

class Action {
  actionType: ActionData['actionType'];
  vertexName: ActionData['vertexName'];
  strength: ActionData['strength'];
  constructor({ actionType, vertexName, strength }: ActionData) {
    this.actionType = actionType;
    this.vertexName = vertexName;
    this.strength = strength;
  }

  toString() {
    return `${this.actionType} ${this.vertexName} ${this.strength}`;
  }
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

abstract class SearchAlgorithm {
  protected prevActions: Action[] = [];
  protected graph: Graph;

  constructor(graph: Graph) {
    this.graph = graph;
  }
  abstract findBestActions(sourceVertexName: number): Action[];
}

class BreathFirstSearch extends SearchAlgorithm {
  constructor(graph: Graph) {
    super(graph);
  }

  findBestActions(sourceVertexName: number): Action[] {
    const actions: Action[] = [];
    
    return actions;
  }
}

class Graph {
  /**
   * Represents a graph as an array of linked lists
   */
  readonly adjacencyList = new Map<number, Vertex>();

  get numVertices() {
    return this.adjacencyList.size;
  }

  get totalCrystals() {
    let result = 0;
    for (const [_vertexName, data] of this.adjacencyList.entries()) {
      if (data.resourceType === ResourceType.CRYSTAL) {
        result += data.resources;
      }
    }
    return result;
  }

  get totalEggs() {
    let result = 0;
    for (const [_vertexName, data] of this.adjacencyList.entries()) {
      if (data.resourceType === ResourceType.EGG) {
        result += data.resources;
      }
    }
    return result;
  }

  constructor(numVertices: number) {
    this._setup(numVertices);
  }

  print() {
    const output: { size: number; text: string } = {
      size: this.numVertices,
      text: '',
    };

    const texts: string[] = [];
    for (const [vertexName, data] of this.adjacencyList.entries()) {
      const str = `${vertexName} -> ${[...data.neighbors].join(',')}`;
      texts.push(str);
    }
    output.text = texts.join('\n');
    console.error(JSON.stringify(output));
  }

  getVertex(source: number) {
    const sourceVertex = this.adjacencyList.get(source);
    if (!sourceVertex) {
      logError('getVertex', `Node ${source} doesn't exist in graph`);
    }

    return sourceVertex;
  }

  addEdge(source: number, target: number) {
    const sourceVertex = this.getVertex(source);
    const targetVertex = this.getVertex(target);
    if (!sourceVertex || !targetVertex) {
      return logError(
        'addEdge',
        `Add edge from ${source} to ${target} failed!`,
      );
    }
    sourceVertex.neighbors.add(target);
  }

  updateVertexData(source: number, data: Partial<VertexData>) {
    const sourceVertex = this.getVertex(source);
    if (!sourceVertex) {
      return logError(
        'updateVertexData',
        `Cannot update vertex ${source}`,
      );
    }

    Object.assign(sourceVertex, data);
  }

  private _setup(numVertices: number) {
    for (let vertexIndex = 0; vertexIndex < numVertices; vertexIndex++) {
      this.adjacencyList.set(vertexIndex, new Vertex());
    }
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

function buildSearcher(
  searchAlgorithmType: SearchAlgorithmType,
  graph: Graph,
): SearchAlgorithm {
  switch (searchAlgorithmType) {
    case SearchAlgorithmType.BreathFirstSearch:
      return new BreathFirstSearch(graph);

    default:
      const error = `Cannot build searcher: ${searchAlgorithmType}`;
      console.error(error);
      throw new Error(error);
  }
}

(function () {
  const configs = {
    searchType: SearchAlgorithmType.BreathFirstSearch,
  };

  const graph = loadGraph();
  const searcher = buildSearcher(configs.searchType, graph);

  /**
   * As Coding Game defined, numberOfBases will be = 1
   */
  const numberOfBases: number = parseInt(readline());
  /**
   * As Coding Game defined, my bases will has type [number], so we need to pick the first one
   */
  const myBase: number = readline()
    .split(' ')
    .map(n => parseInt(n))[0];

  /**
   * As Coding Game defined,  my opponent bases will has type [number], so we need to pick the first one
   */
  const oppBase: number = readline()
    .split(' ')
    .map(n => parseInt(n))[0];

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
    const actions = searcher.findBestActions(myBase);

    // TODO: choose actions to perform and push them into actions
    // To debug: console.error('Debug messages...');
    if (actions.length === 0) {
      console.log('WAIT');
    } else {
      console.log(actions.join(';'));
    }
  }
})();
