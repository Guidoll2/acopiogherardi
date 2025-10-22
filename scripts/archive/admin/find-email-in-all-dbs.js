/* Busca un email en todas las bases de datos accesibles desde la URI
   Verifica variantes gmail/googlemail, case-insensitive.
   Uso: node scripts\admin\find-email-in-all-dbs.js
*/
const { MongoClient } = require('mongodb')

const uri = 'mongodb+srv://guidoll:Ellesar33.@emplearg.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000'

const targets = [
  'ignacio.gherardi@gmail.com',
  'guido.llaurado@googlemail.com'
]

function escapeRegex(s) { return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') }

async function run() {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    console.log('Conectado al servidor Mongo')

    const adminDb = client.db().admin()
    const { databases } = await adminDb.listDatabases()
    console.log('Bases de datos encontradas:', databases.map(d => d.name).join(', '))

    for (const dbInfo of databases) {
      const dbName = dbInfo.name
      // skip internal dbs
      if (['admin','local','config'].includes(dbName)) continue

      const db = client.db(dbName)
      const collections = await db.listCollections().toArray()
      for (const col of collections) {
        const name = col.name
        // we'll only check likely collections
        if (!['users','companies','clients','drivers','operations','password_resets','company_requests'].includes(name)) continue

        for (const t of targets) {
          const regex = new RegExp(escapeRegex(t), 'i')
          const count = await db.collection(name).countDocuments({ $or: [ { email: regex }, { to: regex }, { from: regex }, { contact_email: regex }, { user_email: regex }, { 'user.email': regex }, { 'contact.email': regex } ] })
          if (count > 0) {
            console.log(`DB=${dbName} COL=${name} -> matches ${count} for ${t}`)
            const samples = await db.collection(name).find({ $or: [ { email: regex }, { 'user.email': regex }, { contact_email: regex } ] }).limit(5).toArray()
            samples.forEach(s => console.log('   sample:', s._id, JSON.stringify(s).slice(0,200)))
          }
        }
      }
    }

    console.log('Búsqueda completa')
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await client.close()
    process.exit(0)
  }
}

run()
