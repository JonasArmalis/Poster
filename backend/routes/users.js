const express = require('express')
const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client')

const { authRequired } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/role')

const prisma = new PrismaClient()
const router = express.Router()

// GET /users tik adminam
router.get('/', authRequired, requireAdmin, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      },
      orderBy: { id: 'asc' }
    })
    res.json(users)
  } catch (err) {
    console.error('GET /users error:', err)
    res.status(500).json({ message: 'Failed to load users' })
  }
})

// POST /users sukurti nauja vartotoja tik adminam
router.post('/', authRequired, requireAdmin, async (req, res) => {
  const { name, email, password, role } = req.body || {}

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ message: 'name, email, password and role are required' })
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email }
    })

    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    const hashed = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    })

    res.status(201).json(newUser)
  } catch (err) {
    console.error('POST /users error:', err)
    res.status(500).json({ message: 'Failed to create user' })
  }
})

// PATCH /users/:id atnaujinti vartotojo duomenis tik adminam
router.patch('/:id', authRequired, requireAdmin, async (req, res) => {
  const id = Number(req.params.id)
  const { role, name, email } = req.body || {}

  try {
    const existing = await prisma.user.findUnique({
      where: { id }
    })

    if (!existing) {
      return res.status(404).json({ message: 'User not found' })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role: typeof role !== 'undefined' ? role : existing.role,
        name: typeof name !== 'undefined' ? name : existing.name,
        email: typeof email !== 'undefined' ? email : existing.email
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    })

    res.json(updated)
  } catch (err) {
    console.error('PATCH /users/:id error:', err)
    res.status(500).json({ message: 'Failed to update user' })
  }
})

// DELETE /users/:id istrinti vartotoja tik adminam
router.delete('/:id', authRequired, requireAdmin, async (req, res) => {
  const id = Number(req.params.id)

  try {
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' })
    }

    const existing = await prisma.user.findUnique({
      where: { id }
    })

    if (!existing) {
      return res.status(404).json({ message: 'User not found' })
    }

    await prisma.comment.deleteMany({ where: { userId: id } })
    await prisma.post.deleteMany({ where: { userId: id } })
    await prisma.user.delete({ where: { id } })

    res.status(204).end()
  } catch (err) {
    console.error('DELETE /users/:id error:', err)
    res.status(500).json({ message: 'Failed to delete user' })
  }
})

module.exports = router
