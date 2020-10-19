import * as React from "react";
import * as ReactDOM from "react-dom";
import {} from "styled-components/cssprop";
import { createGlobalStyle } from "styled-components";

import App from "./app/App";

const GlobalStyle = createGlobalStyle`
@font-face {
  font-family: "Cascadia Mono";
  src: url("./CascadiaMono.woff2") format("woff2");
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
`;

ReactDOM.render(
  <>
    <GlobalStyle />
    <App />
  </>,
  document.getElementById("root")
);
