import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import connectDB from "@/app/mongoDB/db"
import Company from "@/app/mongoDB/models/company"
import User from "@/app/mongoDB/models/user"
import Client from "@/app/mongoDB/models/client"
import Driver from "@/app/mongoDB/models/driver"
import DeletedCompany from "@/app/mongoDB/models/deleted-company"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.MONGODB_DB || "cuatrogranos"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = new MongoClient(MONGODB_URI)
  try {
    await connectDB()
    await client.connect()
    const db = client.db(DB_NAME)

    const resolvedParams = await params
    const body = await request.json().catch(() => ({}))
    const { code, force } = body

    if (!code) {
      return NextResponse.json({ error: 'El código es requerido' }, { status: 400 })
    }

    const company = await Company.findById(resolvedParams.id)
    if (!company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })
    }

    // Buscar solicitudes activas para esta empresa
    const reqDoc = await db.collection('company_delete_requests').findOne({ company_id: resolvedParams.id, used: false })
    if (!reqDoc) {
      return NextResponse.json({ error: 'Código inválido o ya utilizado' }, { status: 400 })
    }

    if (new Date(reqDoc.expires_at) < new Date()) {
      return NextResponse.json({ error: 'El código expiró' }, { status: 400 })
    }

    // Compare bcrypt hash
    const bcrypt = (await import('bcryptjs')).default
    const match = await bcrypt.compare(code, reqDoc.code_hash)
    if (!match) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
    }

    // Validación pasada - marcar como usado
    await db.collection('company_delete_requests').updateOne({ _id: reqDoc._id }, { $set: { used: true, used_at: new Date().toISOString() } })

    // Verificar usuarios asociados
    const users = await User.find({ company_id: resolvedParams.id })
    if (users.length > 0 && !force) {
      return NextResponse.json({ error: `La empresa tiene ${users.length} usuario(s) asociados. Use force=true para eliminarlos.` }, { status: 400 })
    }

    let deletedUsersCount = 0
    if (force && users.length > 0) {
      const delUsers = await User.deleteMany({ company_id: resolvedParams.id })
      deletedUsersCount = delUsers.deletedCount || users.length
    }

    const delClients = await Client.deleteMany({ company_id: resolvedParams.id })
    const delDrivers = await Driver.deleteMany({ company_id: resolvedParams.id })

    try {
      await DeletedCompany.create({
        original_id: resolvedParams.id,
        snapshot: company.toObject ? company.toObject() : company,
        deleted_by: request.headers.get('x-deleted-by') || 'system-delete-by-code',
        reason: force ? 'force-delete' : 'manual-delete'
      })
    } catch (archiveErr) {
      console.error('Failed to archive deleted company:', archiveErr)
    }

    await Company.findByIdAndDelete(resolvedParams.id)

    return NextResponse.json({ message: 'Empresa eliminada exitosamente', deletedUsers: deletedUsersCount, deletedClients: delClients.deletedCount || 0, deletedDrivers: delDrivers.deletedCount || 0 })
  } catch (error) {
    console.error('Error confirming company delete:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  } finally {
    await client.close()
  }
}
