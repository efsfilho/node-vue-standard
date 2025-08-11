import { mkdirSync } from 'node:fs'
import sqlite3 from 'sqlite3'
import { sqlite_config } from '../config/sqlite.js'

mkdirSync(sqlite_config.location, { recursive: true }, (err) => {
  if (err)
    throw err
})

const db = new sqlite3.Database(
  sqlite_config.location+sqlite_config.file
)
export default db



