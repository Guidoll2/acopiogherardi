/* Eliminar documentos que contengan un email en las colecciones relevantes
   Uso: node scripts\delete-email-everywhere.js
   El script buscará y borrará en: users, clients, drivers
*/
const { MongoClient } = require('mongodb')

const uri = 'mongodb+srv://guidoll:Ellesar33.@emplearg.mongocluster.cosmos.azure.com/acopiogh?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000'

async function run() {
  const target = 'ignacio.gherardi@gmail.com'
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('Conectado a MongoDB')
    const db = client.db()

    const collectionsToClean = ['users', 'clients', 'drivers']
    for (const name of collectionsToClean) {
      const regex = new RegExp('^' + target.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')

      // Búsqueda amplia: match exacto de email en campos comunes o documento con campo email exacto
      const filter = { $or: [ { email: regex }, { 'user.email': regex }, { 'contact.email': regex }, { contact_email: regex }, { user_email: regex } ] }

      // Hacer un count antes
      const preCount = await db.collection(name).countDocuments(filter)
      if (preCount === 0) {
        console.log(`${name}: 0 coincidencias`) 
        continue
      }

      console.log(`${name}: encontradas ${preCount} coincidencias — eliminando...`)
      const res = await db.collection(name).deleteMany(filter)
      console.log(`${name}: eliminados ${res.deletedCount} documentos`)
    }

    console.log('Limpieza completada.')

  } catch (err) {
    console.error('Error durante la limpieza:', err)
  } finally {
    await client.close()
    process.exit(0)
  }
}

run()
