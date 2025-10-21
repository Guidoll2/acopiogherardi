#!/usr/bin/env node
/*
 scripts/add-email-normalized-and-admin-mongoose.js
 - Usa la conexión Mongoose del proyecto (connectDB) para:
   1) Añadir campo `email_normalized` = email.toLowerCase().trim() a todos los usuarios existentes
   2) Crear índice único sobre `email_normalized`
   3) Insertar un admin si no existe (lee ADMIN_EMAIL y ADMIN_PASSWORD de env o los pasa por --email/--password)

 Uso:
  $env:MONGODB_URI='.../cuatrogranos?...'; node scripts\add-email-normalized-and-admin-mongoose.js --email ignacio.gherardi@gmail.com --password cuatrogranos1234
*/

const path = require('path')
const { pathToFileURL } = require('url')
const mongoose = require('mongoose')

// Try to import the project's connectDB in a robust way
let connectDB
// Try require first
try {
  const dbPath = path.resolve(__dirname, '../app/mongoDB/db')
  const imported = require(dbPath)
  connectDB = imported && (imported.default || imported)
} catch (e) {
  // Fallback: dynamic import inside an async function
  const tryImport = async () => {
    try {
      const module = await import(pathToFileURL(path.resolve(__dirname, '../app/mongoDB/db')).href)
      connectDB = module && (module.default || module)
    } catch (err) {
      console.error('No se pudo importar connectDB desde app/mongoDB/db:', err.message)
      process.exit(1)
    }
  }
  // run the async import synchronously here by blocking until main() runs
  // connectDB will be set before use because main calls connectDB after
  // awaiting connectDB() below
  // store function to call later in main
  global.__tryImportConnectDB = tryImport
}
const bcrypt = require('bcryptjs')

async function main() {
  try {
    const argv = process.argv.slice(2)
    const adminEmailArgIndex = argv.findIndex(a => a === '--email')
    const adminPassArgIndex = argv.findIndex(a => a === '--password')
    const adminEmail = (adminEmailArgIndex >= 0 && argv[adminEmailArgIndex+1]) ? argv[adminEmailArgIndex+1] : process.env.ADMIN_EMAIL
    const adminPassword = (adminPassArgIndex >= 0 && argv[adminPassArgIndex+1]) ? argv[adminPassArgIndex+1] : process.env.ADMIN_PASSWORD

    console.log('Conectando a MongoDB via Mongoose (connectDB)...')
    if (global.__tryImportConnectDB) {
      await global.__tryImportConnectDB()
      delete global.__tryImportConnectDB
    }
    await connectDB()
    const db = mongoose.connection.db
    console.log('Base objetivo:', db.databaseName)

    const users = db.collection('users')

    console.log('Procesando usuarios para añadir email_normalized...')
    const cursor = users.find({}, { projection: { _id: 1, email: 1 } })
    let updated = 0
    while (await cursor.hasNext()) {
      const doc = await cursor.next()
      if (!doc.email) continue
      const normalized = String(doc.email).toLowerCase().trim()
      await users.updateOne({ _id: doc._id }, { $set: { email_normalized: normalized } })
      updated++
    }
    console.log('Usuarios actualizados con email_normalized:', updated)

    try {
      console.log('Creando índice único en users.email_normalized...')
      await users.createIndex({ email_normalized: 1 }, { unique: true })
      console.log('Índice users.email_normalized creado (unique).')
    } catch (err) {
      console.error('Error creando índice en email_normalized:', err.message)
    }

    if (adminEmail && adminPassword) {
      const emailNorm = String(adminEmail).toLowerCase().trim()
      const existing = await users.findOne({ email_normalized: emailNorm })
      if (existing) {
        console.log('Admin ya existe en la base (por email_normalized):', adminEmail)
      } else {
        const hashed = await bcrypt.hash(adminPassword, 12)
        const now = new Date().toISOString()
        const adminDoc = {
          email: String(adminEmail).toLowerCase().trim(),
          email_normalized: emailNorm,
          password: hashed,
          full_name: 'Administrador del sistema',
          role: 'system_admin',
          is_active: true,
          created_at: now,
          updated_at: now
        }
        try {
          const res = await users.insertOne(adminDoc)
          console.log('Admin insertado con _id:', res.insertedId)
        } catch (err) {
          console.error('Error insertando admin:', err.message)
        }
      }
    } else {
      console.log('No se proporcionaron admin email/password; se omite inserción de admin.')
    }

    await mongoose.disconnect()
    console.log('Operación completada.')
  } catch (error) {
    console.error('Error en script:', error)
    process.exit(2)
  }
}

main()
