const Sentry = require('@sentry/node')
const { nodeProfilingIntegration } = require('@sentry/profiling-node')
const loadEnv = require('./helpers/load_env.js')

loadEnv()
// Ensure to call this before requiring any other modules!
Sentry.init({
  dsn: process.env.SENTRY_DNS,
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
    Sentry.graphqlIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: Number(process.env.SENTRY_TRACE_SAMPLE_RATE),

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE),

  environment: 'carte_verte_' + (process.env.SENTRY_ENV || 'production'),

  enableUserInteractionBreadcrumbs: true,
  enableMetrics: true,
  attachViewHierarchy: true,

  beforeSend(event) {
    if (event.user?.email == process.env.GOOGLE_SERVICE_ACCOUNT) {
      return null
    }
    return event
  },

  beforeSendTransaction(event) {
    const roadToExcludes = ['/handle-webhook', '/webhooks']

    if (shouldBeExcluded(event, roadToExcludes)) {
      return null
    }
    return event
  },
})

function shouldBeExcluded(event, routes) {
  if (routes.some((road) => event.transaction.includes(road))) {
    return true
  }

  return event.user?.email == process.env.GOOGLE_SERVICE_ACCOUNT
}
