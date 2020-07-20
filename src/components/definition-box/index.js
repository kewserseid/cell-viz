import React from "react";
import { Collapse, Typography } from "antd";

export default ({ nodes }) => {
  return (
    <>
      <Collapse bordered={false} defaultActiveKey={[0]}>
        {nodes.map((n, i) => (
          <Collapse.Panel header={n.data.id} key={i}>
            <h3>
              {n.data.id} - {n.data.name}
            </h3>
            <p>{n.data.definition}</p>
            <h4>Connections</h4>
            <ul>
              {n.connectedNodes.map((cn) => (
                <li>
                  <a href={cn.data.definition} target="_blank">
                    {cn.data.id} - {cn.data.name}
                  </a>
                </li>
              ))}
            </ul>
          </Collapse.Panel>
        ))}
      </Collapse>
    </>
  );
};
