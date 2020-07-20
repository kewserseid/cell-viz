import React from "react";
import diagram from "./diagram.svg";
import config from "../../utils/visualization-config";
import Visualizer from "../visualizer";

export default (props) => (
  <Visualizer
    diagram={diagram}
    locations={config["RIBOSOME"].locations}
    {...props}
  />
);
