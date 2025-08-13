import logger from '../../utils/logger.js'
import { passportAuthenticate, saveUser } from './service.js'

export const getLogin = (req, res, next) => {
  res.json({ page: '/login'})
}

const login = (req, res, next) => {
  res.status(200).json()
}

const loginError = (err, req, res, next) => {
  if (err && err.status === 401 && err.message === 'Unauthorized') {
    logger.debug('loginError:', req.user)
    res.status(401).json({
      title: 'Authentication failed',
      detail: 'Incorrect username or password'
    });
  } else {
    next(err)
  }
}

export const postLogin = [ passportAuthenticate, login, loginError]

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

export const postSignUp = async (req, res, next) => {
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
    logger.debug('signupError')
    logger.debug('username:' , username)
    next(err)
  }
}

export const getIsAutheticated = (req, res, next) => {
  res.json({ message: 'protected' })
}