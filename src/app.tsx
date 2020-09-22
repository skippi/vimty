import * as React from "react"
import * as ReactDOM from "react-dom"

const { useEffect, useState } = React

const OPERATORS = ['y', 'd', '=', 'gq', 'g?', '>', '<']
const MOTIONS = [
  'h', 'l', '0', '^', '$', 'g_', ';', ',', 'k', 'j', 'gk', 'gj', 'G',
  'gg', 'w', 'W', 'e', 'E', 'b', 'B', 'ge', 'gE'
]

function makePrompt() {
  const ops: string[] = []
  for (let i = 0; i < 50; ++i) {
    const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)]
    const motion = MOTIONS[Math.floor(Math.random() * MOTIONS.length)]
    ops.push(operator.concat(motion))
  }
  return ops.join(" ")
}

function App(_: {}) {
  const [text] = useState(makePrompt())
  const [position, setPosition] = useState(0)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key == text.charAt(position)) {
        setPosition(position + 1)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => { document.removeEventListener("keydown", handleKeyDown) }
  })
  return <Prompt text={text} position={position} />
}

function Prompt(props: {text: string, position: number}) {
  const { text, position } = props
  return <div>
    <span style={{color: "red"}}>{text.slice(0, position)}</span>
    <span>{text.slice(position)}</span>
  </div>
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
