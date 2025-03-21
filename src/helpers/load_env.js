var envLoaded = false
function loadEnv() {
  if (envLoaded) return process.env
  envLoaded = true
  const dotenv = require('dotenv')
  const fs = require('fs')
  if (!process.env.ENV_FILE && !process.env.NODE_ENV) {
    throw new Error('Either ENV_FILE or NODE_ENV must be set')
  }
  const filePath =
    'env/' + (process.env.ENV_FILE || `${process.env.NODE_ENV}.env`)
  console.log('Loading env from', filePath)
  if (!fs.existsSync(filePath)) return process.env
  const parsedEnv = dotenv.parse(fs.readFileSync(filePath))

  process.env = {
    ...process.env,
    ...parsedEnv,
  }
  return parsedEnv
}

module.exports = loadEnv
