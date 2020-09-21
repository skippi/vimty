import * as React from "react"
import * as ReactDOM from "react-dom"

const OPERATORS = ['y', 'd', '=', 'gq', 'g?', '>', '<']
const MOTIONS = [
  'h', 'l', '0', '^', '$', 'g_', ';', ',', 'k', 'j', 'gk', 'gj', 'G',
  'gg', 'w', 'W', 'e', 'E', 'b', 'B', 'ge', 'gE'
]

const problem: string[] = []
for (let i = 0; i < 50; ++i) {
  problem.push(MOTIONS[Math.floor(Math.random() * MOTIONS.length)])
}

function App(_: any) {
  return <div>
    <div>{problem.join(' ')}</div>
    <br />
    <textarea id="" name="" cols={30} rows={10}></textarea>
    <br />
    hello world
  </div>
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
