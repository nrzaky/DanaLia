// This module is SERVER-SIDE ONLY — used by Hono API (server/index.ts)
// Do not import this from frontend React components

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env['DATABASE_URL']!)
export const db = drizzle(sql, { schema })
