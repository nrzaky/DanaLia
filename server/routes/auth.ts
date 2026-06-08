import { Hono } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../../src/db'
import { users } from '../../src/db/schema'
import { authMiddleware } from '../middleware/auth'
import { logActivity } from '../../src/db/queries/activity'
import { AppEnv } from '../index'

const authRouter = new Hono<AppEnv>()

// Login
authRouter.post('/login', async (c) => {
  const body = await c.req.json()
  const { username, password } = body

  if (!username || !password) {
    return c.json({ error: 'Username and password are required' }, 400)
  }

  const userResult = await db.select().from(users).where(eq(users.username, username)).limit(1)
  const user = userResult[0]

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash)
  if (!isValidPassword) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error('JWT_SECRET is not set')
    return c.json({ error: 'Internal server error' }, 500)
  }

  // Generate JWT
  const payload = {
    sub: user.id,
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  }
  const token = await sign(payload, secret)

  // Set HttpOnly Cookie
  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !c.req.header('host')?.includes('localhost'),
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  // Exclude passwordHash from response
  const { passwordHash, ...userWithoutPassword } = user
  return c.json(userWithoutPassword)
})

// Logout
authRouter.post('/logout', async (c) => {
  deleteCookie(c, 'auth_token', {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  })
  return c.json({ success: true })
})

// Get Current User (Protected)
authRouter.get('/me', authMiddleware, async (c) => {
  const user = c.get('user')
  const { passwordHash, ...userWithoutPassword } = user
  return c.json(userWithoutPassword)
})

// Change Password (Protected)
authRouter.post('/change-password', authMiddleware, async (c) => {
  const user = c.get('user')
  const body = await c.req.json()
  const { oldPassword, newPassword } = body

  if (!oldPassword || !newPassword) {
    return c.json({ error: 'Old password and new password are required' }, 400)
  }

  const isValidOldPassword = await bcrypt.compare(oldPassword, user.passwordHash)
  if (!isValidOldPassword) {
    return c.json({ error: 'Invalid old password' }, 401)
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10)
  await db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, user.id))

  await logActivity({
    userId: user.id,
    action: 'Reset Password',
    entityType: 'USER',
    entityId: user.id,
    description: 'User reset their password',
  })

  return c.json({ success: true })
})

export { authRouter }
