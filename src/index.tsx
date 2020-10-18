import * as React from "react";
import * as ReactDOM from "react-dom";
import produce, { Draft } from "immer";
import {} from "styled-components/cssprop";
import styled, { createGlobalStyle } from "styled-components";

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

const OPERATORS = ["y", "d", "=", "gq", "g?", ">", "<"];
const MOTIONS = [
  "h",
  "l",
  "0",
  "^",
  "$",
  "g_",
  ";",
  ",",
  "k",
  "j",
  "gk",
  "gj",
  "G",
  "gg",
  "w",
  "W",
  "e",
  "E",
  "b",
  "B",
  "ge",
  "gE",
];

function times<T>(fn: () => T, n: number): T[] {
  const ops: T[] = [];
  for (let i = 0; i < n; ++i) {
    ops.push(fn());
  }
  return ops;
}

function genOperation(): string {
  const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
  const motion = MOTIONS[Math.floor(Math.random() * MOTIONS.length)];
  return operator.concat(motion);
}

type Millisecond = number;

enum Mode {
  Normal,
  Command,
}

interface App {
  mode: Mode;
  commandInput: string;
  correctInputCount: number;
  startTime: Millisecond;
  wrongInputCount: number;
  testSize: number;
  remChars: string;
  remOperations: string[];
  typedChars: string;
}

type Action = InputAction | ResetAction | ConfigAction;

interface InputAction {
  type: "INPUT";
  key: string;
}

interface ResetAction {
  type: "RESET";
}

interface ConfigAction {
  type: "CONFIG";
  size: number;
}

const app = produce((draft: Draft<App>, action: Action) => {
  if (action.type == "INPUT") {
    if (draft.mode == Mode.Normal) {
      Object.assign(draft, normalInput(draft, action.key));
    } else if (draft.mode == Mode.Command) {
      Object.assign(draft, commandInput(draft, action.key));
    }
  } else if (action.type == "RESET") {
    const size = isNaN(draft.testSize) ? 0 : draft.testSize;
    draft.remChars = size > 0 ? genOperation() : "";
    draft.remOperations = times(genOperation, size - 1);
    draft.typedChars = "";
    draft.correctInputCount = 0;
    draft.wrongInputCount = 0;
    draft.startTime = Date.now();
  } else if (action.type == "CONFIG") {
    draft.testSize = action.size;
    Object.assign(draft, app(draft, { type: "RESET" }));
  }
});

const normalInput = produce((draft: Draft<App>, key: string) => {
  if (key === ":") {
    draft.mode = Mode.Command;
    return;
  }
  if (key === "Shift") return;
  if (draft.remChars === undefined) return;
  if (key === "Escape" || key !== draft.remChars.charAt(0)) {
    draft.wrongInputCount += 1;
    draft.remChars = draft.typedChars + draft.remChars;
    draft.typedChars = "";
    return;
  }
  draft.correctInputCount += 1;
  if (draft.remChars.length > 1) {
    draft.remChars = draft.remChars.substring(1);
    draft.typedChars += key;
  } else {
    draft.remChars = draft.remOperations[0];
    draft.remOperations.shift();
    draft.typedChars = "";
  }
});

const commandInput = produce((draft: Draft<App>, key: string) => {
  if (key === "Escape") {
    draft.commandInput = "";
    draft.mode = Mode.Normal;
    return;
  }
  if (key === "Backspace") {
    draft.commandInput = draft.commandInput.slice(0, -1);
    return;
  }
  if (key === "Enter") {
    const args = draft.commandInput.split(/[\s]+/);
    if (args.length == 1 && args[0] == "edit") {
      Object.assign(draft, app(draft, { type: "RESET" }));
    } else if (args.length == 2 && args[0] == "config") {
      Object.assign(
        draft,
        app(draft, { type: "CONFIG", size: parseInt(args[1]) })
      );
    }
    draft.commandInput = "";
    draft.mode = Mode.Normal;
    return;
  }
  draft.commandInput += key;
});

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
  const [state, dispatch] = useReducer(app, {
    mode: Mode.Normal,
    commandInput: "",
    startTime: Date.now(),
    correctInputCount: 0,
    wrongInputCount: 0,
    testSize: 50,
    remChars: genOperation(),
    remOperations: times(genOperation, 49),
    typedChars: "",
  });
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
