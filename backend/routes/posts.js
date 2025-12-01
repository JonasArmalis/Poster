const express = require('express')
const { readDb, writeDb } = require('../database')
const { authRequired } = require('../middleware/auth')

const router = express.Router()

function includesText(haystack, needle) {
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

function attachUser(post, db) {
  const user = db.users.find((u) => u.id === post.userId)
  return {
    ...post,
    user: user
      ? { id: user.id, email: user.email, name: user.name, role: user.role }
      : null
  }
}

function getEffectiveDate(post) {
  const created = post.created_at ? new Date(post.created_at) : null
  const updated = post.updated_at ? new Date(post.updated_at) : null

  if (created && updated) {
    return updated >= created ? updated : created
  }
  return updated || created || null
}

router.get('/', async (req, res) => {
  try {
    const db = await readDb()
    let posts = db.posts.slice()

    const {
      q,
      userId,
      dateFrom,
      dateTo,
      order
    } = req.query

    if (q && typeof q === 'string' && q.trim().length > 0) {
      posts = posts.filter(
        (p) =>
          includesText(p.title || '', q) ||
          includesText(p.body || '', q)
      )
    }

    if (userId) {
      const uid = Number(userId)
      posts = posts.filter((p) => p.userId === uid)
    }

    const fromStr =
      typeof dateFrom === 'string' && dateFrom.trim().length > 0
        ? dateFrom.trim()
        : null
    const toStr =
      typeof dateTo === 'string' && dateTo.trim().length > 0
        ? dateTo.trim()
        : null

    let fromDate = null
    let toDate = null

    if (fromStr) {
      const d = new Date(fromStr)
      if (!isNaN(d.getTime())) {
        fromDate = d
      }
    }

    if (toStr) {
      const d = new Date(toStr)
      if (!isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999)
        toDate = d
      }
    }

    if (fromDate || toDate) {
      posts = posts.filter((p) => {
        const eff = getEffectiveDate(p)
        if (!eff) return false
        if (fromDate && eff < fromDate) return false
        if (toDate && eff > toDate) return false
        return true
      })
    }

    const normalizedOrder = order === 'asc' ? 'asc' : 'desc'
    posts.sort((a, b) => {
      const aDate = getEffectiveDate(a)
      const bDate = getEffectiveDate(b)
      const aTime = aDate ? aDate.getTime() : 0
      const bTime = bDate ? bDate.getTime() : 0
      const cmp = aTime - bTime
      return normalizedOrder === 'asc' ? cmp : -cmp
    })

    const total = posts.length

    const page = Number(req.query._page) || 1
    const limit = Number(req.query._limit) || 10
    const start = (page - 1) * limit
    const end = start + limit

    let paged = posts.slice(start, end)

    if (req.query._expand === 'user') {
      paged = paged.map((p) => attachUser(p, db))
    }

    res.setHeader('X-Total-Count', String(total))
    res.json(paged)
  } catch (err) {
    console.error('GET /posts error:', err)
    res.status(500).json({ message: 'Failed to load posts' })
  }
})

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  try {
    const db = await readDb()
    const post = db.posts.find((p) => p.id === id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (req.query._expand === 'user') {
      return res.json(attachUser(post, db))
    }

    res.json(post)
  } catch (err) {
    console.error('GET /posts/:id error:', err)
    res.status(500).json({ message: 'Failed to load post' })
  }
})

router.post('/', authRequired, async (req, res) => {
  const { title, body } = req.body || {}

  if (!title || !body) {
    return res.status(400).json({ message: 'title and body are required' })
  }

  try {
    const db = await readDb()
    const now = new Date().toISOString()

    const newId =
      db.posts.length > 0 ? Math.max(...db.posts.map((p) => Number(p.id))) + 1 : 1

    const newPost = {
      id: newId,
      title,
      body,
      userId: req.user.id,
      created_at: now,
      updated_at: now
    }

    db.posts.push(newPost)
    await writeDb(db)

    res.status(201).json(newPost)
  } catch (err) {
    console.error('POST /posts error:', err)
    res.status(500).json({ message: 'Failed to create post' })
  }
})

router.patch('/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id)
  const { title, body } = req.body || {}

  try {
    const db = await readDb()
    const post = db.posts.find((p) => p.id === id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const isOwner = post.userId === req.user.id
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You cannot edit this post' })
    }

    if (typeof title === 'string') {
      post.title = title
    }
    if (typeof body === 'string') {
      post.body = body
    }
    post.updated_at = new Date().toISOString()

    await writeDb(db)

    res.json(post)
  } catch (err) {
    console.error('PATCH /posts/:id error:', err)
    res.status(500).json({ message: 'Failed to update post' })
  }
})

router.delete('/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id)

  try {
    const db = await readDb()
    const index = db.posts.findIndex((p) => p.id === id)

    if (index === -1) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const post = db.posts[index]
    const isOwner = post.userId === req.user.id
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You cannot delete this post' })
    }

    db.posts.splice(index, 1)
    db.comments = db.comments.filter((c) => c.postId !== id)

    await writeDb(db)

    res.status(204).end()
  } catch (err) {
    console.error('DELETE /posts/:id error:', err)
    res.status(500).json({ message: 'Failed to delete post' })
  }
})

module.exports = router
