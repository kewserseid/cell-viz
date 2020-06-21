import React, { useEffect, useRef } from "react";
import { placeNodesOnPath } from "../../utils/graph";
import diagram from "./generic_cell.svg";
const d3 = require("d3");

export default ({ graph }) => {
  let svg = useRef();
  let nodeGroups = useRef();
  let edgeGroups = useRef();

  useEffect(() => {
    embedDrawing();
  }, []);

  /*
  embed the svg drawing to DOM
  */
  const embedDrawing = () => {
    d3.xml(diagram).then((data) => {
      const element = data.documentElement;
      d3.select("#svg-wrapper").node().append(element);
      element.setAttribute("id", "svg");
      svg.current = d3.select(element);
    });
  };

  useEffect(() => {
    if (svg.current) renderGraph();
  }, [graph]);

  /*
    draw the graph 
  */
  const renderGraph = () => {
    // TODO: Map the locations of the nodes to available locations in this visualizer
    const nodes = getPositionAssignedNodes(graph.elements.nodes, []);
    const edges = graph.elements.edges.map((e) => ({
      ...e,
      data: {
        ...e.data,
        source: nodes.find((n) => n.data.id === e.data.source),
        target: nodes.find((n) => n.data.id === e.data.target),
      },
    }));

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
      .on("mouseover", handleNodeMouseOver)
      .on("mouseout", handleNodeMouseOut);

    /*
      Append shape to node group
      */
    nodeGroups.current
      .append("circle")
      .attr("r", 3)
      .attr("cx", (n) => n.x)
      .attr("cy", (n) => n.y)
      .style("fill", "#20A4F3")
      .style("stroke", "#fff");

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
      Append line to edge group
      */
    edgeGroups.current
      .append("line")
      .attr("id", (e) => e.data.id)
      .style("stroke", "#000000")
      .style("opacity", 0.05)
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
  const getPositionAssignedNodes = (nodes, locations) => {
    // TODO: Place the nodes on the mapped location paths
    const nucleoplasm = d3.select(`#nucleoplasm`).node();
    const golgi = d3.select(`#golgi_apparatus`).node();
    const plasma = d3.select(`#plasma_membrane`).node();

    const nodesWithPosition = [
      ...placeNodesOnPath(
        nodes.filter((n) => n.data.location.includes("nucleus")),
        nucleoplasm
      ),
      ...placeNodesOnPath(
        nodes.filter((n) => n.data.location.includes("golgi apparatus")),
        golgi
      ),
      ...placeNodesOnPath(
        nodes.filter(
          (n) =>
            !n.data.location.includes("nucleus") &&
            !n.data.location.includes("golgi apparatus")
        ),
        plasma
      ),
    ];

    return nodesWithPosition;
  };

  /*
  Event handler for when the cursor is put over a node
  */
  function handleNodeMouseOver(n) {
    // Enlarge the node to make it obvious which the hovered node is
    d3.select(this).select("circle").attr("r", 10);
    // Disply tooltip and make it appear near the hovered node
    d3.select("body")
      .append("div")
      .classed("tooltip", true)
      .html(n.data.id)
      .style("left", d3.event.pageX + 5 + "px")
      .style("top", d3.event.pageY - 30 + "px")
      .style("display", "block");
    // Highlight edges connected to this node
    edgeGroups.current.select("line").style("opacity", (e) => {
      return e.data.source === n || e.data.target === n ? 0.5 : 0;
    });
  }

  /*
Event handler for when the cursor is put over a node
*/
  function handleNodeMouseOut(n) {
    // Restore the node to its original size
    d3.select(this).select("circle").attr("r", 3);
    //  Remove tooltips
    d3.select(".tooltip").remove();
    // Reset highlighted edges to default style
    edgeGroups.current.select("line").style("opacity", 0.05);
  }

  // TODO: Style the nodes according to their annotations or locations
  // TODO: Style the edges

  return <div id="svg-wrapper" />;
};
