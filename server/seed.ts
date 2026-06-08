import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { db } from '../src/db'
import { users } from '../src/db/schema'

async function seed() {
  console.log('🌱 Seeding database...')

  const adminPassword = 'admin123'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  try {
    await db
      .insert(users)
      .values({
        username: 'admin',
        fullName: 'Administrator',
        passwordHash,
      })
      .onConflictDoUpdate({
        target: users.username,
        set: {
          passwordHash,
          fullName: 'Administrator',
        },
      })

    console.log('✅ Admin user created/updated successfully.')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
