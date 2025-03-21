// run via cmd : task {taskName}
const [_ts_node, _tasks, ...taskNameArgs] = process.argv

const [taskName, ...args] = taskNameArgs.join(' ').split(':')

const task = require(`./${taskName}`).default

console.log(`starting task -- ${taskName}`)
task(...args)
  .then(() => {
    console.log(`done with task -- ${taskName}`)
    process.exit(0)
  })
  .catch((err: any) => {
    console.log(`ERROR with task -- ${taskName} :`, err)
    process.exit(1)
  })