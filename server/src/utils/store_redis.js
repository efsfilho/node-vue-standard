import { createClient } from "redis"
import { RedisStore } from "connect-redis"
import { config } from '../config/server.js'
import logger from "./logger.js";

// Initialize client.
const redisClient = await createClient()
  .on('error', (err) => logger.error('Session store error(Redis Client)', err))
  .on('connect', () => logger.info('Redis connected!'))
  .on('ready', () => logger.info('Redis ready!'))
  .connect()

// Initialize store.
const redisStore = new RedisStore({
  client: redisClient,
  prefix: config.redisStore.prefix,
})

export default redisStore