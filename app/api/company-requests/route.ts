import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { EmailService } from "@/lib/email-service"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.MONGODB_DB || "grain_management"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

// GET - Obtener todas las solicitudes de registro (solo para system_admin)
export async function GET(request: NextRequest) {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    
    const requests = await db
      .collection("company_registration_requests")
      .find({})
      .sort({ created_at: -1 })
      .toArray()
    
    return NextResponse.json({ success: true, data: requests })
  } catch (error) {
    console.error("Error fetching company requests:", error)
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

// POST - Crear nueva solicitud de registro
export async function POST(request: NextRequest) {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    const body = await request.json()
    const { company_name, email, phone, address, cuit, contact_person, contact_phone } = body
    
    // Validar campos requeridos
    if (!company_name || !email || !phone || !address || !cuit || !contact_person) {
      return NextResponse.json(
        { success: false, error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }
    
    await client.connect()
    const db = client.db(DB_NAME)
    
    // Verificar si ya existe una solicitud con este email o CUIT
    const existingRequest = await db
      .collection("company_registration_requests")
      .findOne({
        $or: [
          { email: email },
          { cuit: cuit }
        ]
      })
    
    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: "Ya existe una solicitud con este email o CUIT" },
        { status: 400 }
      )
    }
    
    // Verificar si ya existe una empresa con este email o CUIT
    const existingCompany = await db
      .collection("companies")
      .findOne({
        $or: [
          { email: email },
          { cuit: cuit }
        ]
      })
    
    if (existingCompany) {
      return NextResponse.json(
        { success: false, error: "Ya existe una empresa registrada con este email o CUIT" },
        { status: 400 }
      )
    }
    
    const now = new Date().toISOString()
    const newRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      company_name,
      email,
      phone,
      address,
      cuit,
      contact_person,
      contact_phone,
      status: "pending",
      created_at: now,
      updated_at: now
    }
    
    await db.collection("company_registration_requests").insertOne(newRequest)
    
    // Enviar notificación al admin del sistema
    try {
      await EmailService.sendCompanyRegistrationNotification({
        adminEmail: process.env.SYSTEM_ADMIN_EMAIL || "admin@sistema.com",
        companyName: company_name,
        requestId: newRequest.id
      })
    } catch (emailError) {
      console.error("Error sending notification email:", emailError)
      // Continuar aunque falle el email
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Solicitud de registro enviada correctamente. Recibirá una respuesta por email una vez que sea revisada.",
      data: newRequest 
    })
  } catch (error) {
    console.error("Error creating company request:", error)
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}