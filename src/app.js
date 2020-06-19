import React from "react";
import GenericCell from "./components/generic-cell";
import "./style.css";

export default () => {
  return (
    <div className="main-container">
      <nav className="navigation">
        <h1>Cell Viz</h1>
        <input
          type="file"
          accept="application/JSON"
          onChange={handleFileUpload}
        />
        <br />
        Navigation
      </nav>
      <div className="content">
        <GenericCell />
      </div>
      <div className="filters">Filters</div>
    </div>
  );
};
