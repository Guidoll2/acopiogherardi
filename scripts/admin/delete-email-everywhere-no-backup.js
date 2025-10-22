/* Elimina documentos que contengan los emails objetivo en todas las DBs accesibles
   Uso: node scripts/admin/delete-email-everywhere-no-backup.js
   ADVERTENCIA: destructivo, sin backups. Se elimina por email (case-insensitive) y variantes googlemail/gmail.
*/
const { MongoClient } = require('mongodb')

const uri = 'mongodb+srv://guidoll:Ellesar33.@emplearg.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000'
const targets = ['ignacio.gherardi@gmail.com','ignacio.gherardi@googlemail.com']

function escapeRegex(s) { return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') }

async function run() {
  const client = new MongoClient(uri)
  const deleted = []
  try {
    await client.connect()
    console.log('Conectado al servidor Mongo')

    const adminDb = client.db().admin()
    const { databases } = await adminDb.listDatabases()

    for (const dbInfo of databases) {
      const dbName = dbInfo.name
      if (['admin','local','config'].includes(dbName)) continue
      const db = client.db(dbName)
      const collections = await db.listCollections().toArray()
      for (const col of collections) {
        const name = col.name
        if (!['users','companies','clients','drivers','operations','password_resets','company_requests'].includes(name)) continue
        for (const t of targets) {
          const regex = new RegExp(escapeRegex(t), 'i')
          const q = { $or: [ { email: regex }, { 'user.email': regex }, { contact_email: regex }, { to: regex }, { from: regex } ] }
          const colRef = db.collection(name)
          const docs = await colRef.find(q).toArray()
          if (docs.length===0) continue
          for (const d of docs) {
            try {
              const res = await colRef.deleteOne({ _id: d._id })
              if (res.deletedCount>0) {
                console.log(`Deleted DB=${dbName} COL=${name} _id=${d._id}`)
                deleted.push({ db: dbName, col: name, _id: d._id.toString() })
              }
            } catch (err) {
              console.error('Error deleting doc', d._id, err)
            }
          }
        }
      }
    }

    console.log('Deletion complete. Total deleted:', deleted.length)
    console.log(JSON.stringify(deleted, null, 2))
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await client.close()
    process.exit(0)
  }
}

run()
