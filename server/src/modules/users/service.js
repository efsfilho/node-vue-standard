// import sqlite3 from 'sqlite3';
// import { open } from 'sqlite';
import db from '../../utils/db_sqlite.js'
import logger from '../../utils/logger.js'
// import crypto from 'node:crypto'
import generateHashedPassword from '../../utils/password_hashing.js'
// Initialize database connection
// let db;

// async function initializeDatabase() {
//   db = await open({
//     filename: './users.db',
//     driver: sqlite3.Database
//   });

//   await db.exec(`
//     CREATE TABLE IF NOT EXISTS users (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       email TEXT UNIQUE NOT NULL,
//       password TEXT NOT NULL,
//       createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//       updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
//     )
//   `);
// }

// initializeDatabase().catch(err => {
//   logger.error('Database initialization error:', err);
// });

// User CRUD operations
// export async function createUser(userData) {
//   const { name, email, password } = userData;

//   const result = await db.run(
//     'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
//     [name, email, password]
//   );
//   return { id: result.lastID, name, email };
// }

export const createUser = async (userData) => {
  const { username, name, email, password } = userData
  const { hash, salt } = generateHashedPassword(password)
  let savedUser = {}
  const qry = `
    INSERT INTO users (
      username,
      name,
      email,
      hashed_password,
      salt
    ) VALUES (
      $user,
      $name,
      $email,
      $hash,
      $salt
    );
  `
  const params = {
    $user: username,
    $name: name,
    $email: email,
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
    //   return await db.all('SELECT id, name, email, createdAt, updatedAt FROM users')
    const qry = `
      SELECT id, active, username, name, email, updatedAt
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
        resolve({ ...data, active: !!data.active })
      }
    }
    const qry = `
      SELECT id, active, username, name, email, createdAt, updatedAt
      FROM users
      WHERE id = ?;
    `
    logger.debug('QUERY:', qry)
    logger.debug('PARAMS:', id)

    db.get(qry, [id], cb)
  })
  // return await db.get(
  //   'SELECT id, name, email, createdAt, updatedAt FROM users WHERE id = ?',
  //   [id]
  // );
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
  // const { name, email, password } = userData;
  // await db.run(
  //   'UPDATE users SET name = ?, email = ?, password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
  //   [name, email, password, id]
  // );
  // return { id, name, email };
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
  // await db.run('DELETE FROM users WHERE id = ?', [id]);
  // return { id };
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
  // return await db.get('SELECT * FROM users WHERE email = ?', [email]);
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
  // return await db.get('SELECT * FROM users WHERE email = ?', [email]);
}

// Allowed fields for partial update
export const ALLOWED_FIELDS = ['username', 'name', 'email']

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