const express = require('express')
const bcrypt = require('bcrypt')

const { readDb, writeDb } = require('../database')
const { authRequired } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/role')

const router = express.Router()

router.get('/', authRequired, requireAdmin, async (_req, res) => {
  try {
    const db = await readDb()
    const users = db.users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role
    }))
    res.json(users)
  } catch (err) {
    console.error('GET /users error:', err)
    res.status(500).json({ message: 'Failed to load users' })
  }
})

router.post('/', authRequired, requireAdmin, async (req, res) => {
  const { name, email, password, role } = req.body || {}

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ message: 'name, email, password and role are required' })
  }

  try {
    const db = await readDb()

    if (db.users.some((u) => u.email === email)) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    const hashed = await bcrypt.hash(password, 10)

    const newId =
      db.users.length > 0 ? Math.max(...db.users.map((u) => Number(u.id))) + 1 : 1

    const now = new Date().toISOString()

    const newUser = {
      id: newId,
      email,
      name,
      password: hashed,
      role,
      created_at: now,
      updated_at: now
    }

    db.users.push(newUser)
    await writeDb(db)

    const { password: _pw, ...safeUser } = newUser
    res.status(201).json(safeUser)
  } catch (err) {
    console.error('POST /users error:', err)
    res.status(500).json({ message: 'Failed to create user' })
  }
})

router.patch('/:id', authRequired, requireAdmin, async (req, res) => {
  const id = Number(req.params.id)
  const { role, name, email } = req.body || {}

  try {
    const db = await readDb()
    const user = db.users.find((u) => u.id === id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (typeof role !== 'undefined') {
      user.role = role
    }
    if (typeof name !== 'undefined') {
      user.name = name
    }
    if (typeof email !== 'undefined') {
      user.email = email
    }

    user.updated_at = new Date().toISOString()

    await writeDb(db)

    const { password: _pw, ...safeUser } = user
    res.json(safeUser)
  } catch (err) {
    console.error('PATCH /users/:id error:', err)
    res.status(500).json({ message: 'Failed to update user' })
  }
})

router.delete('/:id', authRequired, requireAdmin, async (req, res) => {
  const id = Number(req.params.id)

  try {
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' })
    }

    const db = await readDb()
    const index = db.users.findIndex((u) => u.id === id)

    if (index === -1) {
      return res.status(404).json({ message: 'User not found' })
    }

    db.users.splice(index, 1)
    db.posts = db.posts.filter((p) => p.userId !== id)
    db.comments = db.comments.filter((c) => c.userId !== id)

    await writeDb(db)

    res.status(204).end()
  } catch (err) {
    console.error('DELETE /users/:id error:', err)
    res.status(500).json({ message: 'Failed to delete user' })
  }
})

module.exports = router
