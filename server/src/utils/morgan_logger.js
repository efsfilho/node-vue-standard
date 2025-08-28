import { join } from 'node:path'
import { createStream } from 'rotating-file-stream'
import morgan from 'morgan'
import logger from './logger.js'
import { config } from '../config/server.js'

const app_root = process.cwd()
const accessLogStream = createStream('access.log', {
  size: '10M',
  interval: '1d', // rotate daily
  path: join(app_root, config.logLocation),
})

let localFormat = ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms ":referrer" :user-logged ":user-agent"'

morgan.token('user-logged', (req) => {
  let userLogged = '-'
  try {
    if (req.user && req.user.username) {
      userLogged = req.user.username
    }
  } catch (err) {
    logger.error(err)
  }
  return userLogged
})

let morganLogger = morgan(localFormat, { stream: accessLogStream })

if (!config.isProduction) {
  morganLogger = morgan('dev')
}
export default morganLogger
