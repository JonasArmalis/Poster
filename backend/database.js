const fs = require('fs').promises
const path = require('path')

const DB_PATH = path.join(__dirname, 'db.json')

async function readDb() {
  const json = await fs.readFile(DB_PATH, 'utf-8')
  return JSON.parse(json)
}

async function writeDb(db) {
  const json = JSON.stringify(db, null, 2)
  await fs.writeFile(DB_PATH, json, 'utf-8')
}

module.exports = {
  readDb,
  writeDb
}
