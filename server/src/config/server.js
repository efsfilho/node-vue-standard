import 'dotenv/config'

export const config = {
  isDebug: process.env.DEBUG !== '',
  isProduction: process.env.NODE_ENV === 'production',
  port: process.env.SERVER_PORT || 3000,
  log_location: './log',

  // SESSION
  session: {
    secret: process.env.SESSION_SECRET || 'uSHmOckPOryBdEstiNTe'
  },
  redisStore: {
    prefix: process.env.REDIS_STORE_PREFIX || 'node-vue-app'
  },
  redisClient: {
    // url: "redis://alice:foobared@awesome.redis.server:6380",
    url: process.env.REDIS_URL,
  },
  // SESSION

  users: {
    allowWithSameEmail: true
  }
}