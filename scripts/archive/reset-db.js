#!/usr/bin/env node
/*
  scripts/reset-db.js
  - Lee MONGODB_URI desde variables de entorno (o acepta --uri)
  - Conecta a la base indicada por la URI
  - Pide confirmación interactiva (escribir YES) antes de dropear la DB
  - Ejecuta db.dropDatabase()
  - Crea índices mínimos (users.email único case-insensitive)
  - Opcional: si están definidas ADMIN_EMAIL y ADMIN_PASSWORD en env, crea un usuario system_admin

  Uso (cmd.exe):
    set MONGODB_URI=mongodb+srv://.../cuatrogranos?...
    set ADMIN_EMAIL=admin@tuempresa.com
    set ADMIN_PASSWORD=UnaClaveSegura123!
    node scripts\reset-db.js

  Nota: Este script ES DESTRUCTIVO. No lo ejecutes hasta que estés seguro y tengas backups.
*/

const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')
const readline = require('readline')

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => rl.question(question, ans => { rl.close(); resolve(ans) }))
}

async function main() {
  try {
    const argv = process.argv.slice(2)
    const uriArgIndex = argv.findIndex(a => a === '--uri')
    const uri = (uriArgIndex >= 0 && argv[uriArgIndex+1]) ? argv[uriArgIndex+1] : process.env.MONGODB_URI

    if (!uri) {
      console.error('Error: MONGODB_URI no está definida ni se pasó con --uri')
      process.exit(1)
    }

    console.log('\n*********************************************************')
    console.log('ADVERTENCIA: Este script borrará la base de datos indicada por la URI')
    console.log('URI utilizada:')
    console.log(uri)
    console.log('\nSi estás absolutamente seguro, escribe: YES (todo en mayúsculas)')
    console.log('*********************************************************\n')

    const skipConfirm = argv.includes('--yes') || argv.includes('-y')
    if (!skipConfirm) {
      const answer = String(await ask('Confirmar (escribe YES para proceder): ')).trim()
      if (answer !== 'YES') {
        console.log('Operación cancelada por el usuario. No se realizaron cambios.')
        process.exit(0)
      }
    } else {
      console.log('Flag --yes detectado: saltando prompt de confirmación.')
    }

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Conectando a MongoDB...')
    await client.connect()
    const db = client.db() // usa la DB por defecto de la URI
    console.log('Base objetivo:', db.databaseName)

    // Drop database
    console.log('Eliminando la base de datos', db.databaseName, '...')
    await db.dropDatabase()
    console.log('Base eliminada con éxito.')

    // Crear índices mínimos
    console.log('Creando índices mínimos...')
    const usersColl = db.collection('users')
    try {
      await usersColl.createIndex({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } })
      console.log('Índice único en users.email creado.')
    } catch (err) {
      console.error('Error creando índice en users.email:', err.message)
    }

    const companiesColl = db.collection('companies')
    try {
      await companiesColl.createIndex({ cuit: 1 }, { unique: true, sparse: true })
      console.log('Índice en companies.cuit creado (sparse).')
    } catch (err) {
      console.error('Error creando índice en companies.cuit:', err.message)
    }

    // Opcional: crear admin si se pasan variables
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    if (adminEmail && adminPassword) {
      console.log('Insertando usuario admin con el email proporcionado en ADMIN_EMAIL...')
      const hashed = await bcrypt.hash(adminPassword, 12)
      const now = new Date().toISOString()
      const adminDoc = {
        email: adminEmail.toLowerCase().trim(),
        password: hashed,
        full_name: 'Administrador del sistema',
        role: 'system_admin',
        is_active: true,
        created_at: now,
        updated_at: now
      }
      try {
        await usersColl.insertOne(adminDoc)
        console.log('Usuario admin creado con éxito:', adminEmail)
      } catch (err) {
        console.error('Error insertando admin:', err.message)
      }
    } else {
      console.log('No se pasaron ADMIN_EMAIL/ADMIN_PASSWORD: no se crea usuario admin.')
    }

    await client.close()
    console.log('\nOperación completada. Revisa la DB y reinicia la app en producción si corresponde.')

  } catch (error) {
    console.error('Error en reset-db:', error)
    process.exit(2)
  }
}

main()
