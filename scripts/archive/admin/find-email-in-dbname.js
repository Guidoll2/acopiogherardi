import { MongoClient } from 'mongodb'
import fs from 'fs'

function readEnvLocal() {
  const p = './.env.local'
  if (!fs.existsSync(p)) return {}
  const txt = fs.readFileSync(p,'utf8')
  const lines = txt.split(/[\r\n]+/)
  const out = {}
  for (const l of lines) {
    const m = l.match(/^\s*([A-Z0-9_]+)=(.*)$/)
    if (m) {
      out[m[1]] = m[2]
    }
  }
  return out
}

async function main() {
  const env = readEnvLocal()
  const uri = process.env.MONGODB_URI || env.MONGODB_URI || 'mongodb://localhost:27017'
  const dbName = process.env.MONGODB_DB || env.MONGODB_DB || 'grain_management'
  const email = 'ignacio.gherardi@gmail.com'
  const cuit = '1231253513123'

  console.log('Using URI:', uri)
  console.log('Checking DB:', dbName)

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  try {
    await client.connect()
    const db = client.db(dbName)
    const collections = ['companies','users','clients','drivers']
    for (const col of collections) {
      const collection = db.collection(col)
      const q = { $or: [ { email: { $regex: `^${email.replace(/[-\\/\\^$*+?.()|[\]{}]/g,'\\$&')}$`, $options: 'i' } }, { cuit }, { 'contact_email': { $regex: `^${email.replace(/[-\\/\\^$*+?.()|[\]{}]/g,'\\$&')}$`, $options: 'i' } } ] }
      const count = await collection.countDocuments(q)
      console.log(`Collection ${col} -> matches: ${count}`)
      if (count>0) {
        const docs = await collection.find(q).limit(10).toArray()
        for (const d of docs) {
          console.log(` - ${col} _id=${d._id} id=${d.id || ''} email=${d.email || d.contact_email || ''} cuit=${d.cuit || ''}`)
        }
      }
    }
  } catch (err) {
    console.error('Error checking DB:', err)
  } finally {
    await client.close()
  }
}

main()
