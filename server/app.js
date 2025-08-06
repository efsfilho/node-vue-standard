import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url';
import createError from 'http-errors'
import logger from 'morgan'
import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { ensureLoggedIn } from 'connect-ensure-login'
import { createClient } from 'redis'
import { RedisStore } from 'connect-redis'
// import compression from 'compression'

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(compression())

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, 'public')));

// Initialize client.
let redisClient = createClient()
redisClient.connect().catch(console.error)
// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
})

app.use(session({
  secret: 'keyboard cat',
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  store: redisStore,
}));

app.use(passport.authenticate('session'));

app.use((req, res, next) => {
  let msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !! msgs.length;
  req.session.messages = [];
  next();
});


// var indexRouter = require('./routes/index');
// var testRouter = require('./routes/csrf_check');
// const authRouter = require('./routes/auth');

// app.use('/',  import('./routes/auth'));
import authRoutes from './auth/auth.js';
app.use('/',  authRoutes);
// import rr from './routes/r.js';
// app.use('/',  rr);

// app.get('/protected', ensureLoggedIn(), (req, res, next) => {
//   res.json({ message: 'protected' });
// });

// catch 404 and forward to error handler
// app.use(( req, res, next) => {
//   // console.log('errrr', err);
//   next(createError(404));
// });

// error handler
app.use((err, req, res, next) => {
  // handle CSRF token errors here  
  if (err.code == 'EBADCSRFTOKEN') {
    res.status(403)
  }

  res.json({ error: err })
});

app.listen(3000, () => console.log('Server running on http://localhost:3000/'));
// module.exports = app;
