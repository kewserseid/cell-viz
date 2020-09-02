import React from "react";
import { Collapse } from "antd";

export default ({ nodes }) => (
  <Collapse bordered={false} defaultActiveKey={[0]}>
    {nodes.map((n, i) => (
      <Collapse.Panel header={n.data.identifier} key={i}>
        <p>
          <a href={n.data.definition}>{n.data.definition}</a>
        </p>
        <p>
          Location:{" "}
          {n.data.location ? (
            <a
              target="_blank"
              href={`http://amigo.geneontology.org/amigo/term/${n.data.location}`}
            >
              {n.data.location}
            </a>
          ) : (
            "Unlocalized"
          )}
        </p>
        <h3>Connections</h3>
        <ul>
          {n.connectedNodes.map((cn) => (
            <li key={cn.data.id}>
              <a href={cn.data.definition} target="_blank">
                {cn.data.id}
              </a>
            </li>
          ))}
        </ul>
      </Collapse.Panel>
    ))}
  </Collapse>
);
