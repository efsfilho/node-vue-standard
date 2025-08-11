import 'dotenv/config'

export const config = {
  port: process.env.SERVER_PORT || 3000,
  session: {
    secret: process.env.SESSION_SECRET || 'uSHmOckPOryBdEstiNTe'
  },
  redisStore: {
    prefix: process.env.REDIS_STORE_PREFIX || 'node-vue-app'
  },
}