const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { authRequired } = require('../middleware/auth')

const prisma = new PrismaClient()
const router = express.Router()

// GET /comments?postId=1
router.get('/', async (req, res) => {
  const { postId } = req.query

  if (!postId) {
    return res.status(400).json({ message: 'postId query parameter is required' })
  }

  const pid = Number(postId)
  if (isNaN(pid)) {
    return res.status(400).json({ message: 'Invalid postId' })
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { postId: pid },
      orderBy: { created_at: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    res.json(comments)
  } catch (err) {
    console.error('GET /comments error:', err)
    res.status(500).json({ message: 'Failed to load comments' })
  }
})

// POST /comments
router.post('/', authRequired, async (req, res) => {
  const { postId, content, body } = req.body || {}

  // leidžiam ir content, ir body pavadinimus (kad veiktų su senu frontendu)
  const text =
    typeof content === 'string' && content.trim().length > 0
      ? content
      : body

  if (!postId || !text) {
    return res.status(400).json({ message: 'postId and content are required' })
  }

  const pid = Number(postId)
  if (isNaN(pid)) {
    return res.status(400).json({ message: 'Invalid postId' })
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        content: text,
        postId: pid,
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    res.status(201).json(newComment)
  } catch (err) {
    console.error('POST /comments error:', err)
    res.status(500).json({ message: 'Failed to create comment' })
  }
})

// DELETE /comments/:id
router.delete('/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid id' })
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id }
    })

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    const isOwner = comment.userId === req.user.id
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You cannot delete this comment' })
    }

    await prisma.comment.delete({ where: { id } })

    res.status(204).end()
  } catch (err) {
    console.error('DELETE /comments/:id error:', err)
    res.status(500).json({ message: 'Failed to delete comment' })
  }
})

module.exports = router
