import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import Company from "@/app/mongoDB/models/company"
import User from "@/app/mongoDB/models/user"
import Client from "@/app/mongoDB/models/client"
import Driver from "@/app/mongoDB/models/driver"
import DeletedCompany from "@/app/mongoDB/models/deleted-company"

// GET /api/companies/[id] - Obtener empresa por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const resolvedParams = await params
    const company = await Company.findById(resolvedParams.id)
    if (!company) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PUT /api/companies/[id] - Actualizar empresa
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { name, email, phone, address, cuit, subscription_plan, status, notes } = body
    const resolvedParams = await params

    // Validaciones básicas
    if (!name || !email || !cuit) {
      return NextResponse.json(
        { error: "Nombre, email y CUIT son obligatorios" },
        { status: 400 }
      )
    }

    // Verificar que la empresa existe
    const existingCompany = await Company.findById(resolvedParams.id)
    if (!existingCompany) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      )
    }

    // Verificar que el email no esté en uso por otra empresa
    if (email !== existingCompany.email) {
      const emailExists = await Company.findOne({ 
        email, 
        _id: { $ne: resolvedParams.id } 
      })
      if (emailExists) {
        return NextResponse.json(
          { error: "Ya existe una empresa con este email" },
          { status: 400 }
        )
      }
    }

    // Verificar que el CUIT no esté en uso por otra empresa
    if (cuit !== existingCompany.cuit) {
      const cuitExists = await Company.findOne({ 
        cuit, 
        _id: { $ne: resolvedParams.id } 
      })
      if (cuitExists) {
        return NextResponse.json(
          { error: "Ya existe una empresa con este CUIT" },
          { status: 400 }
        )
      }
    }

    // Actualizar empresa
    const updatedCompany = await Company.findByIdAndUpdate(
      resolvedParams.id,
      {
        name,
        email,
        phone,
        address,
        cuit,
        subscription_plan,
        status,
        notes,
        updated_at: new Date()
      },
      { new: true }
    )

    return NextResponse.json(updatedCompany)
  } catch (error) {
    console.error("Error updating company:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE /api/companies/[id] - Eliminar empresa
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const url = new URL(request.url)
    const force = url.searchParams.get('force') === 'true'
    const resolvedParams = await params
    
    // Verificar que la empresa existe
    const company = await Company.findById(resolvedParams.id)
    if (!company) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      )
    }

    // Verificar si hay usuarios asociados a esta empresa
    const users = await User.find({ company_id: resolvedParams.id })
    if (users.length > 0 && !force) {
      const userNames = users.map(u => u.full_name).join(", ")
      return NextResponse.json(
        { 
          error: `No se puede eliminar la empresa. Tiene ${users.length} usuario(s) asociado(s): ${userNames}. Elimine primero los usuarios o transfiéralos a otra empresa.`,
          users: users.map(u => ({ id: u._id, name: u.full_name, email: u.email })),
          canForceDelete: true
        },
        { status: 400 }
      )
    }

    // Si force=true, eliminar primero todos los usuarios asociados
    let deletedUsersCount = 0
    if (force && users.length > 0) {
      const delUsers = await User.deleteMany({ company_id: resolvedParams.id })
      deletedUsersCount = delUsers.deletedCount || users.length
      console.log(`Eliminados ${deletedUsersCount} usuarios asociados a la empresa ${company.name}`)
    }

    // Also remove clients and drivers linked to the company to avoid residual emails
    const delClients = await Client.deleteMany({ company_id: resolvedParams.id })
    const delDrivers = await Driver.deleteMany({ company_id: resolvedParams.id })
    console.log(`Eliminados ${delClients.deletedCount || 0} clients y ${delDrivers.deletedCount || 0} drivers asociados a la empresa ${company.name}`)

    // Archive the company snapshot before deletion so we keep a record
    try {
      await DeletedCompany.create({
        original_id: resolvedParams.id,
        snapshot: company.toObject ? company.toObject() : company,
        deleted_by: request.headers.get('x-deleted-by') || 'system',
        reason: force ? 'force-delete' : 'manual-delete'
      })
      console.log('Company archived in deleted_companies')
    } catch (archiveErr) {
      console.error('Failed to archive deleted company:', archiveErr)
      // proceed with deletion even if archive fails
    }

    // Remove the company document
    await Company.findByIdAndDelete(resolvedParams.id)

    return NextResponse.json({ 
      message: force && (deletedUsersCount>0 || delClients.deletedCount || delDrivers.deletedCount) 
        ? `Empresa eliminada exitosamente junto con ${deletedUsersCount} usuario(s) y referencias asociadas.`
        : "Empresa eliminada exitosamente",
      deletedCompany: company,
      deletedUsers: deletedUsersCount,
      deletedClients: delClients.deletedCount || 0,
      deletedDrivers: delDrivers.deletedCount || 0
    })
  } catch (error) {
    console.error("Error deleting company:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
