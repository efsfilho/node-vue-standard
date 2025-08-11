import db from "../utils/db_sqlite.js";
import { saveUser } from '../modules/auth/service.js';

db.serialize(() => {
  // create the database schema for the todos app
  db.run("CREATE TABLE IF NOT EXISTS users ( \
    id INTEGER PRIMARY KEY, \
    username TEXT UNIQUE, \
    role TEXT, \
    hashed_password BLOB, \
    salt BLOB \
  )")
  
  db.run("CREATE TABLE IF NOT EXISTS todos ( \
    id INTEGER PRIMARY KEY, \
    owner_id INTEGER NOT NULL, \
    title TEXT NOT NULL, \
    completed INTEGER \
  )")
  
  saveUser('alice', 'letmein')
})
