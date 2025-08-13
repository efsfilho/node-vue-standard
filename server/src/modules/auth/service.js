import crypto from 'node:crypto'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import db from '../../utils/db_sqlite.js'

const SALTSIZE = 16
const PBKDF2 = {
  iterations: 310000,
  keylen: 32,
  digest: 'sha256',
}

const verify = (username, password, cb) => {
  const dbCb = async (err, row) => {
    if (err) {
      return cb(new Error(err))
    }

    if (!row) {
      return cb(null, false, {
        message: 'Incorrect username or password.'
      })
    }
    
    const hashedPass = crypto.pbkdf2Sync(
      password,
      row.salt,
      PBKDF2.iterations,
      PBKDF2.keylen,
      PBKDF2.digest
    )
    if (!crypto.timingSafeEqual(row.hashed_password, hashedPass)) {
      return cb(null, false, {
        message: 'Incorrect username or password.'
      })
    }

    return cb(null, row)
  }
  
  const qry = `
    SELECT * FROM users
    WHERE username = ?;
  `
  db.get(qry, [ username ], dbCb)
}

passport.use(new LocalStrategy(verify))
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username })
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

export const passportAuthenticate = passport.authenticate('local', {
  failureMessage: true,
  failWithError: true,
})

export const saveUser = async (username, password) => {
  const salt = crypto.randomBytes(SALTSIZE)
  const hashedPassword = crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2.iterations,
    PBKDF2.keylen,
    PBKDF2.digest
  )
  let savedUser = {}
  const qry = `
    INSERT INTO users (
      username,
      hashed_password,
      salt
    ) VALUES (
      $user,
      $hash,
      $salt
    );
  `
  const params = {
    $user: username,
    $hash: hashedPassword,
    $salt: salt
  }

  await new Promise((resolve, reject) => {
    // Callback must be old-school function
    const cb = function(err) {
      if (err) {
        reject(new Error(err))
      } else {
        savedUser = {
          id: this.lastID,
          username: username
        };
        resolve()
      }
    }
    db.run(qry, params, cb)
  })

  return savedUser
}