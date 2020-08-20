import React, { useEffect, useRef, useState } from "react";
import {
  getUniqueLocations,
  mapLocations,
  assignRenderLocationToNodes,
  duplicateMutlilocationNodes,
  placeNodesOnPath,
  getShapeForNode,
} from "../../utils/graph";
const d3 = require("d3");

export default ({ graph, onNodeClick, selectedNodes, diagram, locations }) => {
  let svg = useRef();
  let nodeGroups = useRef();
  let edgeGroups = useRef();
  const [adaptedGraph, setAdaptedGraph] = useState();

  /*
  *
  *
  embed the svg drawing to DOM
  *
  *
  */
  useEffect(() => {
    if (graph)
      embedDrawing().then(() => {
        setAdaptedGraph(adaptGraphToVisualizer(graph));
      });
  }, [graph]);

  /*
  *
  *
  embed the svg drawing to DOM
  *
  *
  */
  const embedDrawing = () => {
    return d3.xml(diagram).then((data) => {
      if (svg.current) svg.current.remove();
      const element = data.documentElement;
      d3.select("#svg-wrapper").node().append(element);
      element.setAttribute("id", "svg");
      svg.current = d3.select(element);
    });
  };

  /*
  *
  *
  embed the svg drawing to DOM
  *
  *
  */
  useEffect(() => {
    if (adaptedGraph && svg.current) renderGraph();
  }, [adaptedGraph]);

  /*
  *
  *
  embed the svg drawing to DOM
  *
  *
  */
  function adaptGraphToVisualizer() {
    const uniqueNodeLocations = getUniqueLocations(graph.nodes);
    const locationMapping = mapLocations(uniqueNodeLocations, locations);
    let nodesWithRenderLocations = assignRenderLocationToNodes(
      graph.nodes,
      locationMapping
    );
    const duplicatedGraph = duplicateMutlilocationNodes({
      nodes: nodesWithRenderLocations,
      edges: graph.edges,
    });
    const nodes = getPositionAssignedNodes(duplicatedGraph.nodes);
    const edges = duplicatedGraph.edges
      .filter((e) => {
        return (
          nodes.some((n) => n.data.id === e.data.source) &&
          nodes.some((n) => n.data.id === e.data.target)
        );
      })
      .map((e) => ({
        ...e,
        data: {
          ...e.data,
          source: nodes.find((n) => n.data.id === e.data.source),
          target: nodes.find((n) => n.data.id === e.data.target),
        },
      }));
    return { nodes, edges };
  }
  /*
    draw the graph 
  */
  const renderGraph = () => {
    svg.current.selectAll("g.node,g.edge,div.tooltip").remove();
    if (!adaptedGraph) return;
    const { nodes, edges } = adaptedGraph;
    const nodeTypeColorScheme = d3
      .scaleOrdinal()
      .domain(nodes.map((n) => n.data.subgroup))
      .range([
        "#40a9ff",
        "#fa8c16",
        "#F49531",
        "#73d13d",
        "#eb2f96",
        "#36cfc9",
      ]);

    /*
      Create an SVG group for each node placed in the visualization. This group will contain the shape representing the node, as well as labels, tooltips and other elements that belong to that specific node
      */
    edgeGroups.current = svg.current
      .selectAll("g.edge")
      .data(edges)
      .attr("id", (e) => e.data.id)
      .enter()
      .append("g")
      .classed("edge", true);

    /*
      Create an SVG group for each node placed in the visualization. This group will contain the shape representing the node, as well as labels, tooltips and other elements that belong to that specific node
      */
    nodeGroups.current = svg.current
      .selectAll("g.node")
      .data(nodes)
      .attr("id", (n) => n.data.id)
      .enter()
      .append("g")
      .classed("node", true)
      .attr("transform", (n) => `translate(${n.x},${n.y})`)
      .on("mouseover", handleNodeMouseOver)
      .on("mouseout", handleNodeMouseOut)
      .on("click", onNodeClick);

    /*
      Append shape to node group
      */

    nodeGroups.current
      .append("path")
      .attr("d", (n) => d3.symbol().type(d3[getShapeForNode(n)]).size(40)())
      .style("fill", (n) => nodeTypeColorScheme(n.data.subgroup));

    /*
      Append line to edge group
      */
    edgeGroups.current
      .append("line")
      .attr("id", (e) => e.data.id)
      .attr("x1", (e) => e.data.source.x)
      .attr("y1", (e) => e.data.source.y)
      .attr("x2", (e) => e.data.target.x)
      .attr("y2", (e) => e.data.target.y);
  };

  /*
    Given an array of nodes and locations to place them into, the functions returns array of nodes given coordinates on the locations they belong to
  */
  /*
  TODO: memoize the result of this function because it might be very expensive depending on the size of the input
  */
  function getPositionAssignedNodes(nodes) {
    const nodesWithPosition = [];
    locations.forEach((location) => {
      const nodesToPlace = nodes.filter((n) => n.data.location === location);
      nodesWithPosition.push(
        ...placeNodesOnPath(
          nodesToPlace,
          d3.select(`#${location.replace(":", "")}`).node()
        )
      );
    });

    nodesWithPosition.push(
      ...placeNodesOnPath(
        nodes.filter((n) => n.data.location === ""),
        d3.select("#unlocalized").node()
      )
    );

    return nodesWithPosition;
  }

  /*
  Event handler for when the cursor is put over a node
  */
  function handleNodeMouseOver(n) {
    d3.select(this).classed("highlighted", true);
    edgeGroups.current.classed(
      "highlighted",
      (e) => e.data.source === n || e.data.target === n
    );
    d3.select("body")
      .append("div")
      .classed("tooltip", true)
      .html(n.data.identifier)
      .classed("highlighted", true)
      .style("left", d3.event.pageX + 5 + "px")
      .style("top", d3.event.pageY - 30 + "px");
  }

  /*
Event handler for when the cursor is put over a node
*/
  function handleNodeMouseOut(n) {
    d3.select(this).classed("highlighted", false);
    d3.select(".tooltip").remove();
    edgeGroups.current.classed("highlighted", false);
  }

  /*
    when nodes are selected or unselected, update the visualization accordingly
  */
  useEffect(() => {
    if (!nodeGroups.current) return;
    // If a node is found in the list of selected nodes, assign it a "selected" class
    nodeGroups.current.classed("selected", (n) =>
      selectedNodes.find((sn) => sn.data.id === n.data.id)
    );
    // If one of an edge's endpoint is found in the list of selected nodes, assing it a "selected" class
    // If both of an edge's endpoints are found in the selected nodes list, assign the edge a "selected-endpoints" class
    edgeGroups.current
      .classed("selected", (e) =>
        selectedNodes.find(
          (sn) =>
            e.data.source.data.id === sn.data.id ||
            e.data.target.data.id === sn.data.id
        )
      )
      .classed(
        "selected-endpoints",
        (e) =>
          selectedNodes.find((sn) => e.data.source.data.id === sn.data.id) &&
          selectedNodes.find((sn) => e.data.target.data.id === sn.data.id)
      );
  }, [selectedNodes]);

  // TODO: Style the nodes according to their annotations or locations
  // TODO: Style the edges

  return <div id="svg-wrapper" />;
};
