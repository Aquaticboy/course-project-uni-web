const db = require('better-sqlite3')('database.db')

userId = 2;

const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
console.log(row.firstName, row.lastName, row.email);    