import React, { useEffect, useRef } from "react";
import diagram from "./generic_cell.svg";
const d3 = require("d3");

export default () => {
  let svg = useRef();

  useEffect(() => {
    d3.xml(diagram).then((data) => {
      const svgElement = data.documentElement;
      svgElement.setAttribute("id", "svg");
      d3.select("#svg-wrapper").node().append(svgElement);
      svg = d3.select(svgElement);
    });
  }, []);

  return <div id="svg-wrapper" style={{ minWidth: 0 }} />;
};
