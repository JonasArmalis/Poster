const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key_change_me'
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set')
}

function authRequired(req, res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' })
  }

  const token = header.substring('Bearer '.length)

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload // { id, email, role }
    next()
  } catch (err) {
    console.error('JWT error:', err)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = {
  authRequired,
  JWT_SECRET
}
