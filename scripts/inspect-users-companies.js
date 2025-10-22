// scripts/inspect-users-companies.js
// Usage: set MONGODB_URI env then: node scripts/inspect-users-companies.js

const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')

const emailsToCheck = [
  'ignacio.gherardi@gmail.com',
  'guido.llaurado@gmail.com'
]

const passwords = ['Caprichoso', 'cuatrogranos1234']

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI no está definida en el entorno')
    process.exit(1)
  }

  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  await client.connect()
  const db = client.db()
  const users = db.collection('users')
  const companies = db.collection('companies')

  for (const email of emailsToCheck) {
    const normalized = email.toLowerCase().trim()
    const user = await users.findOne({ $or: [{ email_normalized: normalized }, { email: email }] })
    console.log('\n--- User lookup:', email, '---')
    if (!user) {
      console.log('NOT FOUND')
      continue
    }
    console.log('Found user:', { _id: user._id, email: user.email, email_normalized: user.email_normalized, role: user.role, created_at: user.created_at, updated_at: user.updated_at })
    for (const p of passwords) {
      try {
        const ok = await bcrypt.compare(p, user.password)
        console.log(`compare ${p} ->`, ok)
      } catch (err) {
        console.log('bcrypt error for', p, err.message)
      }
    }
  }

  console.log('\n--- Company lookup for guido.llaurado@gmail.com ---')
  const comp = await companies.findOne({ email: 'guido.llaurado@gmail.com' })
  if (!comp) {
    console.log('Company not found')
  } else {
    console.log('Found company:', { id: comp._id, name: comp.name, email: comp.email, status: comp.status, created_at: comp.created_at, updated_at: comp.updated_at })
  }

  await client.close()
}

main().catch(e=>{ console.error(e); process.exit(1) })
