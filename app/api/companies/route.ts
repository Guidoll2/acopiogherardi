import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/app/mongoDB/db"
import Company from "@/app/mongoDB/models/company"
import User from "@/app/mongoDB/models/user"
import { generatePassword, sendWelcomeEmail, sendAdminNotification } from "@/lib/email-config"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Obtener todas las empresas
    const companies = await Company.find({})
    
    // Transformar el _id a id para compatibilidad con el frontend
    const companiesData = companies.map(company => ({
      id: company._id.toString(),
      name: company.name,
      email: company.email,
      phone: company.phone || '',
      address: company.address || '',
      cuit: company.cuit,
      status: company.status,
      subscription_plan: company.subscription_plan,
      created_at: company.created_at,
      updated_at: company.updated_at,
    }))

    return NextResponse.json({ companies: companiesData })

  } catch (error) {
    console.error("Error obteniendo empresas:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { name, email, phone, address, cuit, subscription_plan } = await request.json()

    // Verificar si ya existe una empresa con el mismo email o CUIT
    const existingCompany = await Company.findOne({
      $or: [{ email }, { cuit }]
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: "Ya existe una empresa con ese email o CUIT" },
        { status: 400 }
      )
    }

    // Verificar si ya existe un usuario con ese email
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese email" },
        { status: 400 }
      )
    }

    // Crear la empresa
    const newCompany = new Company({
      name,
      email,
      phone,
      address,
      cuit,
      subscription_plan: subscription_plan || "basic",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    await newCompany.save()

    // Generar contraseña temporal
    const temporaryPassword = generatePassword(12)
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12)

    // Crear usuario administrador para la empresa
    const adminUser = new User({
      email: email,
      password: hashedPassword,
      full_name: `Administrador de ${name}`,
      role: "company_admin",
      is_active: true,
      company_id: newCompany._id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    await adminUser.save()

    // Preparar datos de respuesta
    const companyData = {
      id: newCompany._id.toString(),
      name: newCompany.name,
      email: newCompany.email,
      phone: newCompany.phone || '',
      address: newCompany.address || '',
      cuit: newCompany.cuit,
      status: newCompany.status,
      subscription_plan: newCompany.subscription_plan,
      created_at: newCompany.created_at,
      updated_at: newCompany.updated_at,
    }

    // Intentar enviar email de bienvenida
    let emailResult = { success: false }
    let adminNotificationResult = { success: false }

    try {
      // Enviar email de bienvenida a la empresa
      emailResult = await sendWelcomeEmail(email, name, temporaryPassword)
      
      // Enviar notificación al administrador del sistema
      adminNotificationResult = await sendAdminNotification(name, email, subscription_plan || "basic")
      
      console.log(`Empresa "${name}" creada exitosamente.`)
      console.log(`Email de bienvenida enviado: ${emailResult.success ? '✅ Sí' : '❌ No'}`)
      console.log(`Notificación al admin enviada: ${adminNotificationResult.success ? '✅ Sí' : '❌ No'}`)
      
    } catch (error) {
      console.error('Error enviando emails:', error)
    }

    // Si no se pudo enviar el email, mostrar credenciales para entrega manual
    if (!emailResult.success) {
      console.log(`Email de administrador: ${email}`)
      console.log(`Contraseña temporal: ${temporaryPassword}`)
      console.log(`IMPORTANTE: Guarda estas credenciales para entregar manualmente al cliente.`)
    }

    return NextResponse.json({ 
      company: companyData,
      adminUser: {
        email: adminUser.email,
        full_name: adminUser.full_name,
        role: adminUser.role
      },
      temporaryPassword: temporaryPassword,
      message: emailResult.success 
        ? "Empresa creada exitosamente. Email de bienvenida enviado." 
        : "Empresa creada exitosamente. Email no enviado - credenciales para entrega manual.",
      emailSent: emailResult.success,
      adminNotificationSent: adminNotificationResult.success
    })

  } catch (error) {
    console.error("Error creando empresa:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
