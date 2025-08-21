import crypto from 'node:crypto'
const SALTSIZE = 16
const PBKDF2 = {
  iterations: 310000,
  keylen: 32,
  digest: 'sha256',
}

export default (password) => {
  const salt = crypto.randomBytes(SALTSIZE)
  const hashedPassword = crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2.iterations,
    PBKDF2.keylen,
    PBKDF2.digest
  )

  return {
    salt: salt,
    hash: hashedPassword
  }
}