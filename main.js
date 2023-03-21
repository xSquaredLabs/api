import fs from 'fs'
import { promisify } from 'util'
import { exec } from 'child_process'
import express from 'express'
import yaml from 'js-yaml'

const port = process.env.PORT || 9888
const asyncExec = promisify(exec)

// Load configuration file from disk
const config = yaml.load(fs.readFileSync('config.yml', 'utf8'))

// Start a web server
const app = express()

// Expose the brain stem to a local API
app.listen(port, () => {
  console.log(`This server is exposed on port: ${port}`)
})

// All following routes will use JSON
app.use(express.json())

// Register all routes on startup
for (const [route, values] of Object.entries(config.routes)) {
  if (values.type === 'GET') {
    app.get(route, async (req, res) => {
      const response = await executeShellCommand(values.cmd)
      res.json({ response })
    })
  }
  else if (values.type === 'POST') {
    app.post(route, async (req, res) => {
      res.json('ok')
    })
  }
  console.log(`http://127.0.0.1:${port}${route}`)
}

// Executes a command from the terminal
async function executeShellCommand(command) {
  try {
    const response = await asyncExec(command)
    return response
  }
  catch (err) {
    return err
  }
}