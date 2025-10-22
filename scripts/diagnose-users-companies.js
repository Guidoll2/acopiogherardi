// scripts/diagnose-users-companies.js
// Busca usuarios/companies relacionados con 'guido' y comprueba si alguna cuenta acepta la contraseña 'Caprichoso'

const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')

  const TARGET_EMAIL = 'ignacio.gherardi@gmail.com'
const checkPassword = 'Caprichoso'

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI no definida')
    process.exit(1)
  }
  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  await client.connect()
  const db = client.db()
  const users = db.collection('users')
  const companies = db.collection('companies')
  const companyRequests = db.collection('company_requests')

  console.log('Buscando usuarios con email exacto/regex...')
  const uExact = await users.findOne({ $or: [{ email_normalized: TARGET_EMAIL }, { email: TARGET_EMAIL }] })
  const uRegex = await users.find({ email: { $regex: /guido.llaurado|guido/i } }).toArray()

  console.log('\nUsuario exacto:', uExact ? { _id: uExact._id, email: uExact.email, email_normalized: uExact.email_normalized } : 'NOT_FOUND')
  console.log('\nUsuarios por regex (primeros 10):', uRegex.slice(0,10).map(u=>({ _id: u._id, email: u.email, email_normalized: u.email_normalized })))

  console.log('\nBuscando companies con email exacto/regex...')
  const cExact = await companies.findOne({ email: TARGET_EMAIL })
  const cRegex = await companies.find({ email: { $regex: /guido.llaurado|guido/i } }).toArray()
  console.log('Company exact:', cExact ? { id: cExact._id, email: cExact.email, name: cExact.name } : 'NOT_FOUND')
  console.log('Companies regex (primeros 10):', cRegex.slice(0,10).map(c=>({ id: c._id, email: c.email, name: c.name })))

  console.log('\nBuscando company_requests con email exacto/regex...')
  const crExact = await companyRequests.findOne({ email: TARGET_EMAIL })
  const crRegex = await companyRequests.find({ email: { $regex: /guido.llaurado|guido/i } }).toArray()
  console.log('Company request exact:', crExact ? { id: crExact._id, email: crExact.email, name: crExact.name } : 'NOT_FOUND')
  console.log('Company requests regex (primeros 10):', crRegex.slice(0,10).map(c=>({ id: c._id, email: c.email, name: c.name })))

  // Ahora, comprobar si algún usuario acepta la contraseña 'Caprichoso'
  console.log('\nComprobando si alguna cuenta coincide con contraseña "Caprichoso" (puede tardar)')
  const cursor = users.find({}, { projection: { _id:1, email:1, password:1 } })
  const matches = []
  while (await cursor.hasNext()) {
    const u = await cursor.next()
    try {
      const ok = await bcrypt.compare(checkPassword, u.password)
      if (ok) matches.push({ _id: u._id, email: u.email })
    } catch (err) {
      // ignore compare errors
    }
  }
  console.log('Usuarios que aceptan Caprichoso:', matches)

  await client.close()
}

main().catch(e=>{ console.error(e); process.exit(1) })
