import CELLULAR_LOCATION_MAPPING from "../assets/location_mapping.json";

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
export const getUniqueLocations = (nodes) => {
  const locations = [];
  nodes.forEach((node) => {
    locations.push(...node.data.location.split(","));
  });
  return Array.from(new Set(locations));
};

/*
 *
 *
 *
 *
 *
 */
export const mapLocations = (nodeLocations, availableLocations) => {
  const locationMapping = {};
  nodeLocations.forEach((location) => {
    const renderLocation =
      location === "" ? "" : getRenderLocation([location], availableLocations);
    locationMapping[location] = renderLocation;
  });
  // Return node_locations: available_location mapping
  return locationMapping;
};

/*
*
*
from the input location list, find one that is in the available locations list if none is found, get the parent locations of the input locations and try to find one that is in the available locations list. Keep doing that recursively until an available location is found. If no location is found, return undefined
*
*
*/
function getRenderLocation(locations, availableLocations) {
  // Find an available location from the input list
  const location = locations.find((l) => availableLocations.includes(l));
  //   If availale location is found return that and exit
  if (location) return location;
  //   If none of the input locations are available, find their parents
  let parentLocations = [];
  locations.forEach((l) => {
    const parents = CELLULAR_LOCATION_MAPPING.filter((m) =>
      m.sub_component.find((c) => c.id === l)
    ).map((m) => m.id);
    parentLocations.push(...parents);
  });

  // make sure parent locations are unique
  parentLocations = Array.from(new Set(parentLocations));
  //   if there is no parent location for any of the input locations, that means we have reached the end of the mapping and there is no appropriate location from the list of available locations to place the node at. Therefore, we return undefined
  if (!parentLocations.length) return "unlocalized";
  //   recursively look for an available location
  return getRenderLocation(parentLocations, availableLocations);
}

/*
 *
 *
 *
 *
 *
 *
 */
export const assignRenderLocationToNodes = (nodes, locationMapping) => {
  return nodes.map((node) => {
    const renderLocations = node.data.location
      .split(",")
      .map((l) => locationMapping[l]);
    return {
      ...node,
      data: {
        ...node.data,
        render_locations: Array.from(new Set(renderLocations)),
      },
    };
  });
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
    // assign new id to it. The new ID will be combination of the previous ID and the locationn ID. Assign the previous ID to a new "identifier" field.
    // replace location field with a render location
    const duplicates = n.data.render_locations.map((l) => {
      return {
        ...n,
        data: {
          ...n.data,
          identifier: n.data.id,
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
    const sources = newNodes.filter((n) => n.data.identifier === e.data.source);
    const targets = newNodes.filter((n) => n.data.identifier === e.data.target);
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
  const { identifier } = node.data;
  const { nodes, edges } = graphData.elements;
  const connectedNodes = [];
  // for every edge, if the selected node is its source add the target as a connected node. If the selected node is its target, add its source as a connected node.
  edges.forEach((e) => {
    const { source, target } = e.data;
    if (source === identifier) {
      const node = nodes.find((n) => n.data.id === target);
      if (node) connectedNodes.push(node);
    }
    if (target === identifier) {
      const node = nodes.find((n) => n.data.id === source);
      if (node) connectedNodes.push(node);
    }
  });
  return connectedNodes;
};
