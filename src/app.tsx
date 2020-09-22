import * as React from "react";
import * as ReactDOM from "react-dom";

const { useEffect, useState } = React;

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

interface App {
  remChars: string;
  remOperations: string[];
  typedChars: string;
}

function makeApp(): App {
  return {
    remChars: genOperation(),
    remOperations: times(genOperation, 49),
    typedChars: "",
  };
}

function inputApp(app: Readonly<App>, key: string): App {
  if (key == "Escape") return resetTyped(app);
  if (key.length > 1) return app;
  if (key !== app.remChars.slice(0, 1)) return resetTyped(app);
  const inputed = {
    ...app,
    remChars: app.remChars.slice(1),
    typedChars: app.typedChars.concat(key),
  };
  return tryLoadNextOperation(inputed);
}

function tryLoadNextOperation(app: Readonly<App>): App {
  if (app.remChars) return app;
  return {
    ...app,
    remChars: app.remOperations[0],
    remOperations: app.remOperations.slice(1),
    typedChars: "",
  };
}

function resetTyped(app: Readonly<App>): App {
  return {
    ...app,
    remChars: app.typedChars.concat(app.remChars),
    typedChars: "",
  };
}

function modifyKey(key: string, shift: boolean) {
  if (key.length > 1) return key;
  return shift ? key.toUpperCase() : key.toLowerCase();
}

function AppView(_: {}) {
  const [app, setApp] = useState(makeApp());
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = modifyKey(event.key, event.shiftKey);
      setApp(inputApp(app, key));
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });
  return (
    <Prompt
      typed={app.typedChars}
      tail={app.remChars}
      remaining={app.remOperations}
    />
  );
}

function Prompt(props: { typed: string; tail: string; remaining: string[] }) {
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
