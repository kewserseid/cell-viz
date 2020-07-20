/*

*/
export const getCuratedGraph = ({ elements }) => {
  const nodes = elements.nodes.filter(
    (n) =>
      !n.data.id.includes("GO:") &&
      !n.data.id.includes("R-HSA") &&
      !n.data.id.includes("SMPDB") &&
      !n.data.id.includes("CL:") &&
      !n.data.id.includes("UBERON")
  );
  const edges = elements.edges.filter(
    (e) =>
      nodes.some((n) => n.data.id === e.data.source) &&
      nodes.some((n) => n.data.id === e.data.target)
  );
  return { nodes, edges };
};

/*

*/
export const placeNodesOnPath = (nodes, path) => {
  const length = path.getTotalLength();
  return nodes.map((c, i, arr) => {
    const { x, y } = path.getPointAtLength((length * i) / arr.length);
    return { ...c, x, y };
  });
};

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
  for the input node, return all nodes connected to it with an edge
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
