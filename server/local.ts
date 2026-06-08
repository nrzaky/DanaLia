import 'dotenv/config'
import { serve } from '@hono/node-server'
import app from './index'

const PORT = Number(process.env.PORT ?? 3001)

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`🌸 Tabungan Lia API running at http://localhost:${PORT}`)
})
