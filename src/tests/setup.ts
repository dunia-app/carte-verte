const isDebug = !!process.env.DEBUG
const timeoutDebug = 1000 * 60 * 15 // 15min

jest.setTimeout(isDebug ? timeoutDebug : 15000)