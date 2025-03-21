import React from "react";
import ReactDOM from "react-dom";
import Root from "./Root";
import "antd/dist/antd.css";

const render = (RootComponent: any) =>
  ReactDOM.render(
    React.createElement(RootComponent),
    document.getElementById("root")
  );

render(Root);
