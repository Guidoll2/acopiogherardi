import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from 'bcryptjs'
import connectDB from "@/app/mongoDB/db"
import Company from "@/app/mongoDB/models/company"
import { EmailService } from "@/lib/email-service"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.MONGODB_DB || "cuatrogranos"

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = new MongoClient(MONGODB_URI)
  try {
    await connectDB()
    await client.connect()
    const db = client.db(DB_NAME)

    const resolvedParams = await params
    const company = await Company.findById(resolvedParams.id)
    if (!company) {
      // For security, don't reveal too much
      return NextResponse.json({ success: true, message: 'Si la empresa existe, se enviará un código al email registrado.' })
    }

    const body = await request.json().catch(() => ({}))
    // Optionally accept a requestedBy user id
    const requestedBy = body.requestedBy || null

    // Eliminar solicitudes activas previas
    await db.collection('company_delete_requests').deleteMany({ company_id: resolvedParams.id, used: false })

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    const now = new Date().toISOString()

    // Hash the code before storing
    const saltRounds = 10
    const hashed = await bcrypt.hash(code, saltRounds)

    const doc = {
      company_id: resolvedParams.id,
      code_hash: hashed,
      expires_at: expiresAt,
      used: false,
      requested_by: requestedBy,
      created_at: now
    }

    await db.collection('company_delete_requests').insertOne(doc)

    // Ensure TTL index exists on expires_at (creates if missing)
    try {
      await db.collection('company_delete_requests').createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
    } catch (idxErr) {
      // index may already exist; ignore error
      console.warn('Could not create TTL index (might exist):', idxErr)
    }

    // Send email to company email
    try {
      await EmailService.sendPasswordResetCode({
        email: company.email,
        resetCode: code,
        companyName: company.name
      })
    } catch (err) {
      console.error('Error sending delete code email:', err)
      return NextResponse.json({ success: false, error: 'Error enviando el código por email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Código enviado si la empresa tiene un email registrado' })
  } catch (error) {
    console.error('Error requesting company delete code:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  } finally {
    await client.close()
  }
}
