import React from "react";
import GenericCell from "./components/generic-cell";
import "./style.css";

export default () => {
  return (
    <div className="main-container">
      <div className="toolbar">
        <div>
          <h1>Cell Viz</h1>
          <input type="file" />
        </div>
        <div>
          <button>Settings</button>
        </div>
      </div>
      <nav className="navigation">Navigation</nav>
      <div className="content">
        <GenericCell />
      </div>
      <div className="filters">Filters</div>
    </div>
  );
};
