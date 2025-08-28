
import { createLogger, transports, format } from 'winston'
import { join } from 'node:path'
import { config } from '../config/server.js';

// TODO test process.cwd()
const app_root = process.cwd()
const logLocation = join(app_root, config.logLocation)

const myFormat = ({ timestamp, level, message, ms, splat, ...meta }) => {
  if (meta && meta.stack) {
    // check for error objects
    meta = '\n'+meta.stack.replace(/\\n/g, '\n')+'\n'
  } else {
    if (Object.keys(meta).length >= 1) {
      meta = JSON.stringify(meta)
    } else {
      const splat = meta[Symbol.for('splat')]
      meta = splat ? splat: ''
    }
  }
  const msg = `${timestamp} ${ms} [${level}] ${message} ${meta}`
  console.log(msg)
  return msg
};

const logger = createLogger({
  format: format.combine(
    format.errors({ stack: true }), // Includes stack trace
    format.json()
  ),
  transports: [
    new transports.File({
      filename: 'info.log',
      dirname: logLocation,
      maxsize: 5000000,
      level: config.isDebug ? 'debug' : 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSSZZ' }),
        format.ms(),
        format.printf(myFormat)
      ),
    }),
  ],
});
export default logger