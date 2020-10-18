import produce, { Draft } from "immer";

import { times } from "../util/algorithm";

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

type Millisecond = number;

export enum Mode {
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

export const baseState = {
  mode: Mode.Normal,
  commandInput: "",
  startTime: Date.now(),
  correctInputCount: 0,
  wrongInputCount: 0,
  testSize: 50,
  remChars: genOperation(),
  remOperations: times(genOperation, 49),
  typedChars: "",
};

export const app = produce((draft: Draft<App>, action: Action) => {
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

function genOperation(): string {
  const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
  const motion = MOTIONS[Math.floor(Math.random() * MOTIONS.length)];
  return operator.concat(motion);
}
