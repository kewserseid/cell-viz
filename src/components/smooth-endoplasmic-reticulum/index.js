import React from "react";
import diagram from "./diagram.svg";
import config from "../../utils/visualization-config";
import Visualizer from "../visualizer";

export default (props) => (
  <Visualizer
    diagram={diagram}
    locations={config["SMOOTH_ENDOPLASMIC_RETICULUM"].locations}
    {...props}
  />
);
