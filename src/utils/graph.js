/*
 *
 *
 *
 *
 *
 */
export const getCuratedGraph = ({ nodes, edges }) => {
  const newNodes = nodes.filter(
    (n) =>
      !n.data.id.includes("GO:") &&
      !n.data.id.includes("R-HSA") &&
      !n.data.id.includes("SMPDB") &&
      !n.data.id.includes("CL:") &&
      !n.data.id.includes("UBERON")
  );
  const newEdges = edges.filter(
    (e) =>
      newNodes.some((n) => n.data.id === e.data.source) &&
      newNodes.some((n) => n.data.id === e.data.target)
  );
  return { nodes: newNodes, edges: newEdges };
};

/*
 *
 *
 *
 *
 *
 */
export const placeNodesOnPath = (nodes, path) => {
  const length = path.getTotalLength();
  return nodes.map((c, i, arr) => {
    const { x, y } = path.getPointAtLength((length * i) / arr.length);
    return { ...c, x, y };
  });
};

/*
 *
 *
 *
 *
 *
 */
export const getShapeForNode = (node) => {
  switch (node.data.subgroup) {
    case "Genes":
      return "symbolCircle";
    case "Reactome":
      return "symbolDiamond";
    case "Uniprot":
      return "symbolTriangle";
    default:
      return "symbolStar";
  }
};

/*
 *
 *
 for the input node, return all nodes connected to it with an edge
 *
 *
 */
export const getConnectedNodes = (node, graphData) => {
  const { id } = node.data;
  const { nodes, edges } = graphData.elements;
  const connectedNodes = [];
  // for every edge, if the selected node is its source add the target as a connected node. If the selected node is its target, add its source as a connected node.
  edges.forEach((e) => {
    const { source, target } = e.data;
    if (source === id) {
      connectedNodes.push(nodes.find((n) => n.data.id === target));
    }
    if (target === id) {
      connectedNodes.push(nodes.find((n) => n.data.id === source));
    }
  });
  return connectedNodes;
};

/*
 *
 *
 duplicate nodes with multiple locations
 *
 *
 */
export const duplicateMutlilocationNodes = ({ nodes, edges }) => {
  const newNodes = [];
  const newEdges = [];
  // map through the list of nodes and for each location in a node add a new node with the location
  nodes.forEach((n) => {
    // assign new id to it. The new ID will be combination of the previous ID and the locationn ID. Assign the previous ID to a new "name" field. This name will displayed in the tooltip and in description.
    // replace location field with a render location
    const duplicates = n.data.location.split(",").map((l) => {
      return {
        ...n,
        data: {
          ...n.data,
          name: n.data.id,
          id: `${n.data.id}${l.replace(":", "")}`,
          location: l,
        },
      };
    });
    // add the new nodes to the graph
    newNodes.push(...duplicates);
  });

  // for each node, find edges where it appears as a source or a target and add new edges that link the new node
  edges.forEach((e) => {
    const sources = newNodes.filter((n) => n.data.name === e.data.source);
    const targets = newNodes.filter((n) => n.data.name === e.data.target);
    // for each source and target combination, add an edge
    sources.forEach((s) => {
      targets.forEach((t) => {
        newEdges.push({
          ...e,
          data: {
            ...e.data,
            id: `${s.data.id}${t.data.id}`,
            source: s.data.id,
            target: t.data.id,
          },
        });
      });
    });
  });

  // return a new graph data with the duplicated nodes and edges
  return { nodes: newNodes, edges: newEdges };
};
