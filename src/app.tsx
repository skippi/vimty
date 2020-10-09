import * as React from "react";
import * as ReactDOM from "react-dom";
import produce, { Draft } from "immer";

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

interface App {
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
    const { key } = action;
    if (key === ":") {
      Object.assign(draft, app(draft, { type: "RESET" }));
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
  } else if (action.type == "RESET") {
    const size = isNaN(draft.testSize) ? 0 : draft.testSize;
    draft.remChars = size > 0 ? genOperation() : "";
    draft.remOperations = times(genOperation, size - 1);
    draft.typedChars = "";
  } else if (action.type == "CONFIG") {
    draft.testSize = action.size;
    Object.assign(draft, app(draft, { type: "RESET" }));
  }
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

function AppView(_: {}) {
  const [state, dispatch] = useReducer(app, {
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
    <div>
      <span>
        <span onClick={() => dispatch({ type: "CONFIG", size: 10 })}>10</span>
        <span> / </span>
        <span onClick={() => dispatch({ type: "CONFIG", size: 25 })}>25</span>
        <span> / </span>
        <span onClick={() => dispatch({ type: "CONFIG", size: 50 })}>50</span>
        <span> / </span>
        <span onClick={() => dispatch({ type: "CONFIG", size: 100 })}>100</span>
        <span> / </span>
        <span onClick={() => dispatch({ type: "CONFIG", size: 200 })}>200</span>
      </span>
      &nbsp; ACC:{" "}
      {(
        state.correctInputCount /
        (state.correctInputCount + state.wrongInputCount)
      ).toFixed(4)}
      &nbsp; / CPM:{" "}
      {(((state.correctInputCount / (Date.now() - state.startTime)) *
        1000 *
        60) /
        3).toFixed(2)}
      <Prompt
        typed={state.typedChars}
        tail={state.remChars}
        remaining={state.remOperations}
      />
    </div>
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
