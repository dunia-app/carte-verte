const isProductionEnv = /^production$/.test(process.env.NODE_ENV!)
const isDevEnv = /^development$/.test(process.env.NODE_ENV!)
const isTestEnv = /^test$/.test(process.env.NODE_ENV!)

export { isProductionEnv, isDevEnv, isTestEnv }
