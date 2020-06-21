export const placeNodesOnPath = (nodes, path) => {
  const length = path.getTotalLength();
  return nodes.map((c, i, arr) => {
    const { x, y } = path.getPointAtLength((length * i) / arr.length);
    return { ...c, x, y };
  });
};
