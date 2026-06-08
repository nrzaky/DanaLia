import { handle } from 'hono/vercel'
import app from '../server/index'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default handle(app)
