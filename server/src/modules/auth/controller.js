import logger from '../../utils/logger.js'
import { passportAuthenticate, saveUser } from './service.js'
import { body, validationResult } from 'express-validator'

export const getLogin = (req, res, next) => {
  res.json({ page: '/login'})
}

const login = (req, res, next) => {
  res.status(200).json()
}

const loginError = (err, req, res, next) => {
  if (err && err.status === 400 && err.message === 'Bad Request') {
    logger.debug('loginError-Bad Request:', Object.getOwnPropertyNames(req.body))
    return res.status(400).json({
      detail: 'Bad Request'
    });
  }
  if (err && err.status === 401 && err.message === 'Unauthorized') {
    logger.debug('loginError-Unauthorized:', req.user)
    return res.status(401).json({
      title: 'Authentication failed',
      detail: 'Incorrect username or password'
    });
  }
  next(err)
}

const checkLoginPayload = (req, res, next) => {
  const { username, password } = req.body
  const isValid = (s) => s && typeof s === 'string' && s.length > 0
  if (!isValid(username) || !isValid(password)) {
    return res.status(400).json({
      detail: 'Bad Request'
    });
  }
  next()
};

export const postLogin = [ checkLoginPayload, passportAuthenticate, login, loginError]

export const postLogOut = (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      return next(err)
    }
    res.redirect('/login')
  })
}

export const getSignUp = (req, res, next) => {
  res.render('signup')
}

// body('password').isStrongPassword({
//   minLength: 8,
//   minLowercase: 1,
//   minUppercase: 1,
//   minNumbers: 1,
//   minSymbols: 1,
//   returnScore: false,
//   pointsPerUnique: 1,
//   pointsPerRepeat: 0.5,
//   pointsForContainingLower: 10,
//   pointsForContainingUpper: 10,
//   pointsForContainingNumber: 10,
//   pointsForContainingSymbol: 10,
// })
const userValidator = body('username').isString().trim().isLength({ min: 4, max: 10 })
const passValidator = body('password').isString().isLength({ min: 6 })

const checkSignUpPayload = (req, res, next) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    if (result.errors.filter(e => e.path === 'username').length >= 1) {
      return res.status(400).json({
        detail: 'Invalid username. Please try again.'
      })
    }
    if (result.errors.filter(e => e.path === 'password').length >= 1) {
      return res.status(400).json({
        detail: 'Password must be longer than 6 characters.'
      })
    }
    next(Error('/signup payload validation'))
  }
  next()
}

const signUp = async (req, res, next) => {
  const { username, password } = req.body
  try {
    const user = await saveUser(username, password)
    req.login(user, (err) => {
      if (err) {
        return next(err)
      }
      res.redirect('/')
    });
  } catch (err) {
    next(err)
  }
}
// TODO User already exists
export const postSignUp = [ checkLoginPayload, userValidator, passValidator, checkSignUpPayload, signUp ]

export const getIsAutheticated = (req, res, next) => {
  res.json({ message: 'protected' })
}