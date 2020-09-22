import * as React from "react"
import * as ReactDOM from "react-dom"

const { useEffect, useState } = React

const OPERATORS = ['y', 'd', '=', 'gq', 'g?', '>', '<']
const MOTIONS = [
  'h', 'l', '0', '^', '$', 'g_', ';', ',', 'k', 'j', 'gk', 'gj', 'G',
  'gg', 'w', 'W', 'e', 'E', 'b', 'B', 'ge', 'gE'
]

const OPERATIONS = (() => {
  const ops: string[] = []
  for (let i = 0; i < 50; ++i) {
    const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)]
    const motion = MOTIONS[Math.floor(Math.random() * MOTIONS.length)]
    ops.push(operator.concat(motion))
  }
  return ops
})()

function App(_: {}) {
  const [opIndex, setOpIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const op = OPERATIONS[opIndex]
      if (event.key == "Shift") return
      if (event.key == op.charAt(charIndex)) {
        setCharIndex(charIndex + 1)
      } else {
        setCharIndex(0)
      }
      if (charIndex >= op.length - 1) {
        setCharIndex(0)
        setOpIndex(opIndex + 1)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => { document.removeEventListener("keydown", handleKeyDown) }
  })
  return <Prompt
    current={OPERATIONS[opIndex].slice(charIndex)}
    remaining={OPERATIONS.slice(opIndex + 1)}
  />
}

function Prompt(props: {current: string, remaining: string[]}) {
  const { current, remaining } = props
  return <div>
    <div style={{color: "red"}}>{current}</div>
    <div>{remaining.join(" ")}</div>
  </div>
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
