import * as React from "react";
import * as ReactDOM from "react-dom";
import {} from "styled-components/cssprop";
import styled, { createGlobalStyle } from "styled-components";

import { Mode, app, baseState } from "./app/reducer";

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

const { useEffect, useReducer, useRef } = React;

function modifyKey(key: string, shift: boolean): string {
  if (key.length > 1) return key;
  return shift ? key.toUpperCase() : key.toLowerCase();
}

function useEventListener(event: string, handler: EventListener) {
  const ref: { current: EventListener } = useRef();
  useEffect(() => {
    ref.current = handler;
  }, [handler]);
  useEffect(() => {
    const listener = (event: Event) => ref.current(event);
    addEventListener(event, listener);
    return () => {
      removeEventListener(event, listener);
    };
  }, [event, window]);
}

const StyledApp = styled.div`
  display: grid;
  font-family: "Cascadia Mono";
  font-size: 20px;
  grid-template-areas: "header-window" "buf-windows" "command-window";
  grid-template-rows: 1.25em 10em 1.25em;
  margin: 5rem;
`;

const HeaderWindow = styled.div`
  background-color: #373737;
  color: #d4d4d4;
  grid-area: header-window;
  padding-left: 0.25em;
  padding-right: 0.25em;
`;

const BufferWindows = styled.div`
  background-color: #1e1e1e;
  color: #d4d4d4;
  grid-area: buf-windows;
  overflow: hidden;
  padding-left: 0.25em;
  padding-right: 0.25em;
`;

const CommandWindow = styled.div`
  background-color: #373737;
  color: #d4d4d4;
  grid-area: command-window;
`;

function AppView(_: {}) {
  const [state, dispatch] = useReducer(app, baseState);
  useEventListener("keydown", (event: KeyboardEvent) => {
    dispatch({ type: "INPUT", key: modifyKey(event.key, event.shiftKey) });
  });
  return (
    <StyledApp>
      <GlobalStyle />
      <HeaderWindow>
        ACC:{" "}
        {(
          state.correctInputCount /
          (state.correctInputCount + state.wrongInputCount)
        ).toFixed(4)}
        &nbsp; / CPM:{" "}
        {(
          ((state.correctInputCount / (Date.now() - state.startTime)) *
            1000 *
            60) /
          3
        ).toFixed(2)}
      </HeaderWindow>
      <BufferWindows>
        <Prompt
          typed={state.typedChars}
          tail={state.remChars}
          remaining={state.remOperations}
        />
      </BufferWindows>
      <CommandWindow>
        {state.mode == Mode.Command ? (
          <span>:{state.commandInput}</span>
        ) : (
          <span>&nbsp;</span>
        )}
      </CommandWindow>
    </StyledApp>
  );
}

function Prompt(props: {
  typed: string;
  tail: string;
  remaining: readonly string[];
}) {
  const { typed, tail, remaining } = props;
  return (
    <div>
      <div>
        <span style={{ color: "red" }}>{typed}</span>
        <span>{tail}</span>
      </div>
      <div>{remaining.join(" ")}</div>
    </div>
  );
}

ReactDOM.render(<AppView />, document.getElementById("root"));
