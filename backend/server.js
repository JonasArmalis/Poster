// backend/server.js

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const userRoutes = require('./routes/users')
const postRoutes = require('./routes/posts')
const commentRoutes = require('./routes/comments')
const { JWT_SECRET } = require('./middleware/auth')

const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 4000

// CORS su X-Total-Count headerio „išleidimu“, kad frontend galėtų jį nuskaityti
app.use(
  cors({
    origin: '*', // dev režime leidžiam viską
    exposedHeaders: ['X-Total-Count']
  })
)

app.use(express.json())

app.get('/', (_req, res) => {
  res.send('Poster API is running')
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    )

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }

    res.json({
      accessToken: token,
      user: safeUser
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Login failed' })
  }
})

app.use('/users', userRoutes)
app.use('/posts', postRoutes)
app.use('/comments', commentRoutes)

app.get('/authors', async (_req, res) => {
  try {
    const authors = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: { name: 'asc' }
    })

    res.json(authors)
  } catch (err) {
    console.error('GET /authors error:', err)
    res.status(500).json({ message: 'Failed to load authors' })
  }
})

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.listen(PORT, () => {
  console.log(`Poster API listening on http://localhost:${PORT}`)
})
