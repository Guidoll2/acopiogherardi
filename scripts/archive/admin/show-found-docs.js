import { MongoClient, ObjectId } from 'mongodb'
import fs from 'fs'

function readEnvLocal() {
  const p = './.env.local'
  if (!fs.existsSync(p)) return {}
  const txt = fs.readFileSync(p,'utf8')
  const lines = txt.split(/[\r\n]+/)
  const out = {}
  for (const l of lines) {
    const m = l.match(/^\s*([A-Z0-9_]+)=(.*)$/)
    if (m) out[m[1]] = m[2]
  }
  return out
}

async function main() {
  const env = readEnvLocal()
  const uri = process.env.MONGODB_URI || env.MONGODB_URI || 'mongodb://localhost:27017'
  const dbName = process.env.MONGODB_DB || env.MONGODB_DB || 'grain_management'

  console.log('Using URI:', uri)
  console.log('DB:', dbName)

  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)

    const companyId = '68d5073bf97f5ff9b532e709'
    const userId = '68d5073bf97f5ff9b532e70a'

    const company = await db.collection('companies').findOne({ _id: new ObjectId(companyId) })
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })

    console.log('--- COMPANY DOC ---')
    console.log(JSON.stringify(company, null, 2))
    console.log('--- USER DOC ---')
    console.log(JSON.stringify(user, null, 2))
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await client.close()
  }
}

main()
