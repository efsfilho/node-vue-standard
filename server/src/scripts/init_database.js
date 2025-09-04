import db from "../utils/db_sqlite.js";
import { createUser } from "../modules/users/service.js";

db.serialize(async () => {
  // create the database schema for the todos app
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      -- id INTEGER PRIMARY KEY,
      id                INTEGER 
                        PRIMARY KEY
                        AUTOINCREMENT,
      username          TEXT
                        UNIQUE
                        NOT NULL,
      hashed_password   BLOB,
      salt              BLOB,
      active            BOOLEAN
                        DEFAULT TRUE,
      name              TEXT,
      --                  NOT NULL,
      role              TEXT
                        NOT NULL
                        CHECK (role IN ('admin', 'manager', 'user')),
      email             TEXT 
      --                  UNIQUE
                        NOT NULL,
      createdAt         DATETIME
                        DEFAULT CURRENT_TIMESTAMP,
      updatedAt         DATETIME
                        DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id          INTEGER
                  PRIMARY KEY,
      owner_id    INTEGER
                  NOT NULL,
      title       TEXT
                  NOT NULL,
      completed   INTEGER
    )
  `)
  
  await createUser({
    username: 'test',
    password: 'test',
    name: 'Testd',
    email: 'test@test.com',
    role: 'user'
  })
  await createUser({
    username: 'manager',
    password: 'manager',
    name: 'Testd',
    email: 'test@test.com',
    role: 'manager'
  })

  await createUser({
    username: 'admin',
    password: 'admin',
    name: 'Admin',
    email: 'admin@test.com',
    role: 'admin'
  })
})
