import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { EmailService, generatePassword } from "@/lib/email-service"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.MONGODB_DB || "grain_management"

// PATCH - Aprobar o rechazar solicitud
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    const body = await request.json()
    const { action, notes, reviewed_by } = body
    const resolvedParams = await params
    const requestId = resolvedParams.id
    
    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Acción inválida" },
        { status: 400 }
      )
    }
    
    await client.connect()
    const db = client.db(DB_NAME)
    
    // Buscar la solicitud
    const registrationRequest = await db
      .collection("company_registration_requests")
      .findOne({ id: requestId })
    
    if (!registrationRequest) {
      return NextResponse.json(
        { success: false, error: "Solicitud no encontrada" },
        { status: 404 }
      )
    }
    
    if (registrationRequest.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Esta solicitud ya fue procesada" },
        { status: 400 }
      )
    }
    
    const now = new Date().toISOString()
    const newStatus = action === "approve" ? "approved" : "rejected"
    
    // Actualizar la solicitud
    await db.collection("company_registration_requests").updateOne(
      { id: requestId },
      {
        $set: {
          status: newStatus,
          notes,
          reviewed_by,
          reviewed_at: now,
          updated_at: now
        }
      }
    )
    
    if (action === "approve") {
      // Crear la empresa
      const tempPassword = generatePassword()
      const companyId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const newCompany = {
        id: companyId,
        name: registrationRequest.company_name,
        email: registrationRequest.email,
        phone: registrationRequest.phone,
        address: registrationRequest.address,
        cuit: registrationRequest.cuit,
        status: "active",
        subscription_plan: "free",
        operations_count_current_month: 0,
        operations_limit: 50, // Límite para plan gratuito
        billing_cycle_start: now,
        billing_cycle_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
        subscription_status: "active",
        created_at: now,
        updated_at: now
      }
      
      await db.collection("companies").insertOne(newCompany)
      
      // Crear usuario administrador de la empresa
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const newUser = {
        id: userId,
        email: registrationRequest.email,
        full_name: registrationRequest.contact_person,
        phone: registrationRequest.contact_phone || registrationRequest.phone,
        address: registrationRequest.address,
        role: "company_admin",
        is_active: true,
        company_id: companyId,
        password: tempPassword, // En producción esto debería estar hasheado
        created_at: now,
        updated_at: now
      }
      
      await db.collection("users").insertOne(newUser)
      
      // Enviar email de bienvenida
      try {
        await EmailService.sendCompanyApprovalEmail({
          companyEmail: registrationRequest.email,
          companyName: registrationRequest.company_name,
          tempPassword,
          approved: true
        })
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError)
        // Continuar aunque falle el email
      }
      
      return NextResponse.json({
        success: true,
        message: "Solicitud aprobada y empresa creada exitosamente",
        data: {
          company: newCompany,
          user: { ...newUser, password: undefined } // No devolver la contraseña
        }
      })
    } else {
      // Enviar email de rechazo
      try {
        await EmailService.sendCompanyApprovalEmail({
          companyEmail: registrationRequest.email,
          companyName: registrationRequest.company_name,
          approved: false
        })
      } catch (emailError) {
        console.error("Error sending rejection email:", emailError)
        // Continuar aunque falle el email
      }
      
      return NextResponse.json({
        success: true,
        message: "Solicitud rechazada",
        data: { status: newStatus, notes }
      })
    }
  } catch (error) {
    console.error("Error processing company request:", error)
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}