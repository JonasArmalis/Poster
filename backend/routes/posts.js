const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { authRequired } = require('../middleware/auth')

const prisma = new PrismaClient()
const router = express.Router()

function buildWhere(query) {
  const {
    q,
    userId,
    dateFrom,
    dateTo
  } = query

  const where = {}

  // Teksto paieska
  if (q && typeof q === 'string' && q.trim().length > 0) {
    const search = q.trim()

    where.OR = [
      { title: { contains: search } },
      { body:  { contains: search } }
    ]
  }

  // Filtravimas pagal autoriu
  if (userId) {
    const uid = Number(userId)
    if (!isNaN(uid)) {
      where.userId = uid
    }
  }

  // Datos filtrai
  if (
    typeof dateFrom === 'string' && dateFrom.trim() ||
    typeof dateTo === 'string' && dateTo.trim()
  ) {
    where.created_at = {}
    if (dateFrom && dateFrom.trim()) {
      const d = new Date(dateFrom.trim())
      if (!isNaN(d.getTime())) {
        where.created_at.gte = d
      }
    }
    if (dateTo && dateTo.trim()) {
      const d = new Date(dateTo.trim())
      if (!isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999)
        where.created_at.lte = d
      }
    }
  }

  return where
}


// GET /posts
router.get('/', async (req, res) => {
  try {
    const page = Math.max(Number(req.query._page) || 1, 1)
    const limit = Math.max(Number(req.query._limit) || 10, 1)
    const skip = (page - 1) * limit

    const sortOrder = req.query.order === 'asc' ? 'asc' : 'desc'
    const where = buildWhere(req.query)

    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy: { created_at: sortOrder },
        skip,
        take: limit,
        include: { user: true }
      })
    ])

    res.setHeader('X-Total-Count', String(total))
    res.json(posts)
  } catch (err) {
    console.error('GET /posts error:', err)
    res.status(500).json({ message: 'Failed to load posts' })
  }
})

// GET /posts/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid id' })
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    res.json(post)
  } catch (err) {
    console.error('GET /posts/:id error:', err)
    res.status(500).json({ message: 'Failed to load post' })
  }
})

// POST /posts
router.post('/', authRequired, async (req, res) => {
  const { title, body } = req.body || {}

  if (!title || !body) {
    return res.status(400).json({ message: 'title and body are required' })
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        body,
        userId: req.user.id
      }
    })

    res.status(201).json(newPost)
  } catch (err) {
    console.error('POST /posts error:', err)
    res.status(500).json({ message: 'Failed to create post' })
  }
})

// PATCH /posts/:id
router.patch('/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id)
  const { title, body } = req.body || {}

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid id' })
  }

  try {
    const post = await prisma.post.findUnique({ where: { id } })

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const isOwner = post.userId === req.user.id
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You cannot edit this post' })
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        title: typeof title === 'string' ? title : post.title,
        body: typeof body === 'string' ? body : post.body
      }
    })

    res.json(updated)
  } catch (err) {
    console.error('PATCH /posts/:id error:', err)
    res.status(500).json({ message: 'Failed to update post' })
  }
})

// DELETE /posts/:id
router.delete('/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id)

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid id' })
  }

  try {
    const post = await prisma.post.findUnique({ where: { id } })

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const isOwner = post.userId === req.user.id
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You cannot delete this post' })
    }

    await prisma.comment.deleteMany({ where: { postId: id } })
    await prisma.post.delete({ where: { id } })

    res.status(204).end()
  } catch (err) {
    console.error('DELETE /posts/:id error:', err)
    res.status(500).json({ message: 'Failed to delete post' })
  }
})

module.exports = router
