import db from '../../utils/db_sqlite.js'
import logger from '../../utils/logger.js'
import generateHashedPassword from '../../utils/password_hashing.js'

export const createUser = async (userData) => {
  const {
    username,
    name,
    email,
    role = 'user',
    password
  } = userData
  const { hash, salt } = generateHashedPassword(password)
  let savedUser = {}
  const qry = `
    INSERT INTO users (
      username,
      name,
      email,
      role,
      hashed_password,
      salt
    ) VALUES (
      $user,
      $name,
      $email,
      $role,
      $hash,
      $salt
    );
  `
  const params = {
    $user: username,
    $name: name,
    $email: email,
    $role: role,
    $hash: hash,
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
        }
        resolve()
      }
    }
    logger.debug('QUERY:', qry)
    logger.debug('PARAMS:', params)
    db.run(qry, params, cb)
  })

  return savedUser
}

export const getAllUsers = async () => {
  return await new Promise((resolve, reject) => {
    // Callback must be old-school function
    const cb = function(err, data) {
      if (err) {
        reject(new Error(err))
      } else {
        resolve(data.map((e) => ({ ...e, active: !!e.active })))
      }
    }
    const qry = `
      SELECT
        id,
        active,
        username,
        name,
        email,
        role,
        updatedAt,
        createdAt
      FROM users;
    `
    logger.debug('QUERY:', qry)
    db.all(qry, cb)
  })
}

export async function getUserById(id) {
  return await new Promise((resolve, reject) => {
    const cb = function(err, data) {
      if (err) {
        reject(new Error(err))
      } else {
        if (data) {
          resolve({ ...data, active: !!data.active })
        } else {
          resolve(data)
        }
      }
    }
    const qry = `
      SELECT 
        id,
        active,
        username,
        name,
        email,
        role,
        updatedAt,
        createdAt
      FROM users
      WHERE id = ?;
    `
    logger.debug('QUERY:', qry)
    logger.debug('PARAMS:', id)

    db.get(qry, [id], cb)
  })
}

export const updateUser = async (id, userData) => {
  const { username, name, email, password } = userData
  return await new Promise((resolve, reject) => {
    const cb = function(err, data) {
      if (err) {
        reject(new Error(err))
      } else {
        resolve({ id, username, name, email })
      }
    }

    const qry = `
      UPDATE users
      SET username = $user,
          name = $name,
          email = $email,
          hashed_password = $pass,
          updatedAt = CURRENT_TIMESTAMP 
      WHERE id = $id;
    `
    const { hash } = generateHashedPassword(password)
    const params = {
      $user: username,
      $name: name,
      $email: email,
      $pass: hash,
      $id: id
    }
    logger.debug('QUERY:', qry)
    logger.debug('PARAMS:', params)
    db.run(qry, params, cb)
  })
}

export const deleteUser = async (id) => {
  return await new Promise((resolve, reject) => {
    const cb = function(err, data) {
      if (err) {
        reject(new Error(err))
      } else {
        resolve({ id })
      }
    }
    const qry = `
      UPDATE users
      SET active = FALSE,
          updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?;
    `
    logger.debug('QUERY:', qry)
    logger.debug('PARAMS:', id)
    db.run(qry, [id], cb)
  })
}

export const getUserByEmail = async (email) => {
  return await new Promise((resolve, reject) => {
    const cb = function(err, data) {
      if (err) {
        reject(new Error(err))
      } else {
        resolve(data)
      }
    }
    const qry = `
      SELECT id, active, username, name, email
      FROM users
      WHERE email = ?;
    `
    logger.debug('QUERY:', qry)
    logger.debug('PARAMS:', email)
    db.get(qry, [email], cb)
  })
}

export const getUserByUsername = async (username) => {
  return await new Promise((resolve, reject) => {
    const cb = function(err, data) {
      if (err) {
        reject(new Error(err))
      } else {
        resolve(data)
      }
    }
    const qry = `
      SELECT id, active, username, name, email
      FROM users
      WHERE username = ?;
    `
    logger.debug('QUERY:', qry)
    logger.debug('PARAMS:', username)
    db.get(qry, [username], cb)
  })
}

// Allowed fields for partial update
export const ALLOWED_FIELDS = ['username', 'name', 'email', 'active', 'role']

/**
 * @param {*} id 
 * @param {*} updates properties must be included in allowedFieldsForPartialUpdate
 * @returns 
 */
export const partialUpdateUser = async (id, updates) => {
  const user = await getUserById(id)
  if (!user) throw new Error('User not found')

  // Build the update query dynamically
  const setClauses = []
  const values = []
  const allowedFields = ALLOWED_FIELDS
  for (const [field, value] of Object.entries(updates)) {
    if (allowedFields.includes(field)) {
      setClauses.push(`${field} = ?`)
      values.push(value)
    }
  }
  if (setClauses.length === 0) {
    throw new Error('No valid fields to update')
  }

  values.push(id)
  
  const qry = `
    UPDATE users
    SET updatedAt = CURRENT_TIMESTAMP,
        ${setClauses.join(', ')}
    WHERE id = ?
  `
  logger.debug('QUERY:', qry)
  logger.debug('PARAMS:', values)
  return await new Promise((resolve, reject) => {
    const cb = function(err) {
      if (err) {
        reject(new Error(err))
      } else {
        resolve(updates)
      }
    }
    db.get(qry, values, cb)
  })
}