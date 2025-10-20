/* Buscar un email en todas las colecciones de la base de datos
   Uso: node scripts\find-email-in-db.js
*/
const { MongoClient } = require('mongodb')

const uri = 'mongodb+srv://guidoll:Ellesar33.@emplearg.mongocluster.cosmos.azure.com/acopiogh?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000'

async function run() {
  const target = 'guido.llaurado@gmail.com'
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('Conectado a MongoDB')
    const db = client.db()

    const collections = await db.listCollections().toArray()
    console.log('Collections encontradas:', collections.map(c => c.name).join(', '))

    const results = []

    for (const col of collections) {
      const name = col.name
      // Buscar cualquier documento donde algún campo contenga el email (regex, case insensitive)
      const regex = new RegExp(target.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')

      // Hacemos una búsqueda amplia: any string field contains the email
      const cursor = db.collection(name).find({ $or: [
        { email: regex },
        { to: regex },
        { from: regex },
        { contact_email: regex },
        { user_email: regex },
        { 'user.email': regex },
        { 'contact.email': regex },
        { message: regex },
        { body: regex },
        { value: regex },
      ] }).limit(50)

      const docs = await cursor.toArray()
      if (docs.length > 0) {
        results.push({ collection: name, count: docs.length, samples: docs.slice(0,5) })
      }
    }

    if (results.length === 0) {
      console.log('No se encontró el email en las colecciones buscadas.')
    } else {
      console.log('Resultados:')
      results.forEach(r => {
        console.log(`- Colección: ${r.collection} (count: ${r.count})`)
        r.samples.forEach((s, i) => {
          console.log(`  sample ${i+1}: _id=${s._id} ${JSON.stringify(s).slice(0,200)}...`)
        })
      })
    }

  } catch (err) {
    console.error('Error:', err)
  } finally {
    await client.close()
    process.exit(0)
  }
}

run()
