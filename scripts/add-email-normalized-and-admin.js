#!/usr/bin/env node
/*
 scripts/add-email-normalized-and-admin.js
 - Añade campo `email_normalized` = email.toLowerCase().trim() a todos los usuarios existentes
 - Crea índice único sobre `email_normalized`
 - Inserta un admin si no existe (lee ADMIN_EMAIL y ADMIN_PASSWORD de env o los pasa por --email y --password)

 Uso:
  node scripts\add-email-normalized-and-admin.js --email ignacio.gherardi@gmail.com --password cuatrogranos1234
  O usando variables de entorno:
  $env:ADMIN_EMAIL='ignacio.gherardi@gmail.com'
  $env:ADMIN_PASSWORD='cuatrogranos1234'
  node scripts\add-email-normalized-and-admin.js

*/

const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')

async function main() {
  try {
    const argv = process.argv.slice(2)
    const uriArgIndex = argv.findIndex(a => a === '--uri')
    const uri = (uriArgIndex >= 0 && argv[uriArgIndex+1]) ? argv[uriArgIndex+1] : process.env.MONGODB_URI
    if (!uri) {
      console.error('Error: MONGODB_URI no definida. Pasa --uri o exporta MONGODB_URI en el entorno.')
      process.exit(1)
    }

    const adminEmailArgIndex = argv.findIndex(a => a === '--email')
    const adminPassArgIndex = argv.findIndex(a => a === '--password')
    const adminEmail = (adminEmailArgIndex >= 0 && argv[adminEmailArgIndex+1]) ? argv[adminEmailArgIndex+1] : process.env.ADMIN_EMAIL
    const adminPassword = (adminPassArgIndex >= 0 && argv[adminPassArgIndex+1]) ? argv[adminPassArgIndex+1] : process.env.ADMIN_PASSWORD

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Conectando a MongoDB...')
    try {
      await client.connect()
    } catch (connectErr) {
      console.error('Error conectando a MongoDB:', connectErr.message)
      throw connectErr
    }
    const db = client.db()
    console.log('Base objetivo:', db.databaseName)

    const users = db.collection('users')

    // 1) Añadir email_normalized a los usuarios existentes (batch)
    console.log('Procesando usuarios para añadir email_normalized...')
    const cursor = users.find({}, { projection: { _id: 1, email: 1 } })
    let updated = 0
    while (await cursor.hasNext()) {
      const doc = await cursor.next()
      if (!doc.email) continue
      const normalized = String(doc.email).toLowerCase().trim()
      // Sólo actualizar si distinto o no existe
      if (doc.email !== normalized) {
        await users.updateOne({ _id: doc._id }, { $set: { email_normalized: normalized } })
        updated++
      } else {
        // asegurar campo existe
        await users.updateOne({ _id: doc._id }, { $set: { email_normalized: normalized } })
      }
    }
    console.log('Usuarios actualizados con email_normalized:', updated)

    // 2) Crear índice único sobre email_normalized
    try {
      console.log('Creando índice único en users.email_normalized...')
      await users.createIndex({ email_normalized: 1 }, { unique: true })
      console.log('Índice users.email_normalized creado (unique).')
    } catch (err) {
      console.error('Error creando índice en email_normalized:', err.message)
    }

    // 3) Insertar admin si se pidió
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

    await client.close()
    console.log('Operación completada.')
  } catch (error) {
    console.error('Error en script:', error)
    process.exit(2)
  }
}

main()
