import { config, } from './config/server.js'
import logger from './utils/logger.js'
import morganLogger from './utils/morgan_logger.js'
import redisStore from './utils/store_redis.js'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import compression from 'compression'
import { ensureLoggedIn } from 'connect-ensure-login'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(morganLogger)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(join(__dirname, 'public')))

app.use(session({
  secret: config.session.secret,
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  store: redisStore,
}))
app.use(passport.authenticate('session'))
app.use(compression())

app.use((req, res, next) => {
  // Used by passport.authenticate
  let msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !! msgs.length;
  req.session.messages = [];
  next()
})

import authRoutes from './modules/auth/index.js'
app.use('/',  authRoutes)

app.get('/list', async(req, res, next) => {
  res.json({ message: await redisStore.all() })
})

app.get('/admin', (req, res) => {
  const { role } = req.user;
  
  if (role) {
    return res.status(401)
  }

  if (role !== 'admin') {
    return res.status(403)
  }
  res.json({ message: 'admin autenticado'})
});

app.get('/', ensureLoggedIn(), async(req, res, next) => {
  res.json({ message: 'await redisStore.all()' })
})

app.get('/clear', async(req, res, next) => {
  const l = (await redisStore.all()).length
  redisStore.clear()
  res.json({ message: l })
})

// catch 404 and forward to error handler
// app.use(( req, res, next) => {
//   // console.log('errrr', err)
//   next(createError(404))
// })

// error handler
app.use((err, req, res, next) => {
  logger.error(err)
  if (err.code == 'EBADCSRFTOKEN') {
    res.status(403)
  }
  res.status(500).json({
    detail: 'Internal Server Error'
  });
})

app.listen(config.port, () => console.log(`Server running on port ${config.port}`))

