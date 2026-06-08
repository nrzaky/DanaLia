import { Context, Next } from 'hono'
import { getCookie, deleteCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { db } from '../../src/db'
import { users } from '../../src/db/schema'
import { eq } from 'drizzle-orm'
import { AppEnv } from '../index'

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const token = getCookie(c, 'auth_token')

  if (!token) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401)
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET is not defined')

    const payload = await verify(token, secret, "HS256")
    const userId = payload.sub as string

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)

    if (user.length === 0) {
      return c.json({ error: 'Unauthorized: User not found' }, 401)
    }

    c.set('user', user[0])
    await next()
  } catch (error: any) {
    deleteCookie(c, 'auth_token')
    return c.json({ error: `Unauthorized: ${error?.message}` }, 401)
  }
}
