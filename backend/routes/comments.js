const express = require('express')
const { readDb, writeDb } = require('../database')
const { authRequired } = require('../middleware/auth')

const router = express.Router()

function attachUser(comment, db) {
  const user = db.users.find((u) => u.id === comment.userId)
  return {
    ...comment,
    user: user
      ? { id: user.id, email: user.email, name: user.name, role: user.role }
      : null
  }
}

// GET /comments?postId=1&_expand=user
router.get('/', async (req, res) => {
  try {
    const db = await readDb()
    let comments = db.comments.slice()

    const { postId } = req.query
    if (postId) {
      const pid = Number(postId)
      comments = comments.filter((c) => c.postId === pid)
    }

    comments.sort((a, b) => {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0
      return aDate - bDate
    })

    if (req.query._expand === 'user') {
      comments = comments.map((c) => attachUser(c, db))
    }

    res.json(comments)
  } catch (err) {
    console.error('GET /comments error:', err)
    res.status(500).json({ message: 'Failed to load comments' })
  }
})

// POST /comments
router.post('/', authRequired, async (req, res) => {
  const { postId, body } = req.body || {}

  if (!postId || !body || typeof body !== 'string' || body.trim().length === 0) {
    return res.status(400).json({ message: 'postId and non-empty body are required' })
  }

  try {
    const db = await readDb()
    const pid = Number(postId)

    const post = db.posts.find((p) => p.id === pid)
    if (!post) {
      return res.status(400).json({ message: 'Post does not exist' })
    }

    const newId =
      db.comments.length > 0
        ? Math.max(...db.comments.map((c) => Number(c.id))) + 1
        : 1

    const now = new Date().toISOString()

    const newComment = {
      id: newId,
      postId: pid,
      userId: req.user.id,
      body: body.trim(),
      created_at: now,
      updated_at: now
    }

    db.comments.push(newComment)
    await writeDb(db)

    res.status(201).json(newComment)
  } catch (err) {
    console.error('POST /comments error:', err)
    res.status(500).json({ message: 'Failed to create comment' })
  }
})

// DELETE /comments/:id
router.delete('/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id)

  try {
    const db = await readDb()
    const index = db.comments.findIndex((c) => c.id === id)

    if (index === -1) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    const comment = db.comments[index]
    const isOwner = comment.userId === req.user.id
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You cannot delete this comment' })
    }

    db.comments.splice(index, 1)
    await writeDb(db)

    res.status(204).end()
  } catch (err) {
    console.error('DELETE /comments/:id error:', err)
    res.status(500).json({ message: 'Failed to delete comment' })
  }
})

module.exports = router
