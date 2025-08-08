import { passportAuthenticate, saveUser } from './service.js'

export const getLogin = (req, res, next) => {
  res.json({ page: '/login'})
}

const login = (req, res, next) => {
  res.format({
    'text/html': () => {
      res.redirect('/')
    },
    'application/json': () => {
      res.json({
        ok: true,
        location: '/'
      })
    }
  })
}

const loginError = (err, req, res, next) => {
  console.log('loginerror ', req.session.messages)
  if (err.status !== 401) {
    return next(err)
  }
  res.format({
    // 'text/html': function() {
    //   res.redirect('/login');
    // },
    'application/json': () => {
      res.json({
        ok: false,
        location: '/login'
      })
    }
  })
}

export const postLogin = [ passportAuthenticate, login, loginError ]

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
    let user = await saveUser(username, password)
    req.login(user, (err) => {
      if (err) {
        return next(err)
      }
      res.redirect('/')
    });
  } catch (err) {
    console.log(err)
    return next(err)
  }
}

export const getIsAutheticated = (req, res, next) => {
  res.json({ message: 'protected' })
}