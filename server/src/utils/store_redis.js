import { createClient } from "redis"
import { RedisStore } from "connect-redis"
import { config } from '../config/server.js'

// Initialize client.
let redisClient = createClient()
redisClient.connect().catch(console.error)

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: config.redisStore.prefix,
})

export default redisStore