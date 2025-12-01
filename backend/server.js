const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { readDb } = require('./database')
const userRoutes = require('./routes/users')
const postRoutes = require('./routes/posts')
const commentRoutes = require('./routes/comments')
const { JWT_SECRET } = require('./middleware/auth')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
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
    const db = await readDb()
    const user = db.users.find((u) => u.email === email)

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
    const db = await readDb()

    const authors = db.users
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

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
