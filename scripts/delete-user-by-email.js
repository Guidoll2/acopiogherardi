/* Script para buscar y eliminar usuarios por email
   Uso: node scripts\delete-user-by-email.js
*/
const mongoose = require('mongoose')

const connectionString = 'mongodb+srv://guidoll:Ellesar33.@emplearg.mongocluster.cosmos.azure.com/acopiogh?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000'

async function run() {
  const targetEmail = 'guido.llaurado@gmail.com'

  try {
    console.log('Conectando a MongoDB...')
    await mongoose.connect(connectionString)
    console.log('Conectado')

    const db = mongoose.connection.db

    const collections = await db.listCollections().toArray()
    console.log('Colecciones:', collections.map(c => c.name).join(', '))

    const userSchema = new mongoose.Schema({}, { strict: false })
    const User = mongoose.model('User', userSchema)

    const found = await User.find({ email: targetEmail })
    console.log(`Usuarios encontrados con email ${targetEmail}: ${found.length}`)
    found.forEach((u, i) => {
      console.log(`${i + 1}) id=${u._id} email=${u.email} role=${u.role} company_id=${u.company_id}`)
    })

    if (found.length === 0) {
      console.log('No hay usuarios para eliminar. Saliendo.')
      await mongoose.disconnect()
      process.exit(0)
    }

    // Eliminar
    const res = await db.collection('users').deleteMany({ email: targetEmail })
    console.log(`Eliminados ${res.deletedCount} documentos de la colección users`)

    // Comprobación final
    const remaining = await User.find({ email: targetEmail })
    console.log(`Quedan ${remaining.length} usuarios con ese email`)    

  } catch (err) {
    console.error('Error en script:', err)
  } finally {
    try { await mongoose.disconnect() } catch(e){}
    process.exit(0)
  }
}

run()
