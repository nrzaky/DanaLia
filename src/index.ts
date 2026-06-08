import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.get('/api', (c) => {
  return c.json({ message: "Cloudflare Workers OK" })
})

app.post('/api/auth/login', async (c) => {
  const body = await c.req.json().catch(() => null)

  // Frontend sends { username, password }
  if (!body || !body.username || !body.password) {
    return c.json({ error: "Missing fields" }, 400)
  }

  if (body.username === "admin" && body.password === "123456") {
    return c.json({ message: "Login success", token: "dummy-token" })
  }

  return c.json({ error: "Invalid credentials" }, 401)
})

app.get('/api/auth/me', (c) => {
  return c.json({
    user: {
      id: 1,
      name: "Admin"
    }
  })
})

export default app
