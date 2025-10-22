// scripts/set-admin-password.js
// Usage: set MONGODB_URI in env, then: node scripts/set-admin-password.js

const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ignacio.gherardi@gmail.com'
const NEW_PASSWORD = process.env.ADMIN_PASSWORD || 'cuatrogranos1234'

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI no está definida en el entorno')
    process.exit(1)
  }

  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  await client.connect()
  const db = client.db()
  const users = db.collection('users')

  const hashed = await bcrypt.hash(NEW_PASSWORD, 12)
  const res = await users.findOneAndUpdate(
    { email_normalized: ADMIN_EMAIL.toLowerCase().trim() },
    { $set: { password: hashed, updated_at: new Date().toISOString() } },
    { returnDocument: 'after' }
  )

  console.log('Resultado:', res.value)
  await client.close()
}

main().catch(e => { console.error(e); process.exit(1) })
