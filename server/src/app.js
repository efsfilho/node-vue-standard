import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
// import createError from 'http-errors'
import logger from 'morgan'
import express from 'express'
import session from 'express-session'
// import cookieParser from 'cookie-parser'
import passport from 'passport'
import { ensureLoggedIn } from 'connect-ensure-login'
import redisStore from './utils/store_redis.js'
import { config, } from './config/server.js'
import compression from 'compression'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// app.use(cookieParser())
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
  // handle CSRF token errors here  
  if (err.code == 'EBADCSRFTOKEN') {
    res.status(403)
  }

  res.json({ error: err })
})

app.listen(config.port, () => console.log(`Server running on port ${config.port}`))

