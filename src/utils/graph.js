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
