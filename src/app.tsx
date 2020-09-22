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

const OPERATIONS = (() => {
  const ops: string[] = [];
  for (let i = 0; i < 50; ++i) {
    const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
    const motion = MOTIONS[Math.floor(Math.random() * MOTIONS.length)];
    ops.push(operator.concat(motion));
  }
  return ops;
})();

function modifyKey(key: string, shift: boolean) {
  return shift ? key.toUpperCase() : key.toLowerCase();
}

function App(_: {}) {
  const [opIndex, setOpIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.length > 1) return;
      const op = OPERATIONS[opIndex];
      const key = modifyKey(event.key, event.shiftKey);
      let newCharIndex = charIndex;
      let newOpIndex = opIndex;
      if (key === op.charAt(charIndex)) {
        newCharIndex += 1;
        if (newCharIndex == op.length) {
          newOpIndex += 1;
          newCharIndex = 0;
        }
      } else {
        newCharIndex = 0;
      }
      setOpIndex(newOpIndex);
      setCharIndex(newCharIndex);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });
  return (
    <Prompt
      typed={OPERATIONS[opIndex].slice(0, charIndex)}
      tail={OPERATIONS[opIndex].slice(charIndex)}
      remaining={OPERATIONS.slice(opIndex + 1)}
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

ReactDOM.render(<App />, document.getElementById("root"));
