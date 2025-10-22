// Configuración unificada de emails
import { sendWelcomeEmail as sendWelcomeEmailNodemailer, sendAdminNotification as sendAdminNotificationNodemailer } from './email-service'
import { sendWelcomeEmail as sendWelcomeEmailResend, sendAdminNotification as sendAdminNotificationResend } from './email-service-resend'

// Detectar qué servicio de email usar basado en las variables de entorno
const getEmailService = () => {
  // Prioridad 1: Resend (más moderno y fácil)
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_api_key_here') {
    console.log('📧 Usando servicio de email: Resend')
    return 'resend'
  }
  
  // Prioridad 2: Gmail con Nodemailer (tradicional)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('📧 Usando servicio de email: Gmail (Nodemailer)')
    return 'gmail'
  }
  
  // Sin configuración - modo desarrollo
  console.log('📧 Modo desarrollo: emails simulados')
  return 'development'
}

// Función unificada para enviar email de bienvenida
export const sendWelcomeEmail = async (
  companyEmail: string,
  companyName: string,
  tempPassword: string
) => {
  const service = getEmailService()
  
  switch (service) {
    case 'resend':
      // Intentar enviar directamente a la empresa
      console.log(`📧 Resend: enviando email de bienvenida a ${companyEmail}`)
      
      const result = await sendWelcomeEmailResend(companyEmail, companyName, tempPassword)
      
      // Si falla (por restricciones de sandbox), enviar al admin como respaldo
      if (!result.success) {
        const adminEmail = process.env.ADMIN_EMAIL || 'ignacio.gherardi@gmail.com'
        console.log(`⚠️ No se pudo enviar a ${companyEmail}. Enviando al admin (${adminEmail}) como respaldo`)
        return sendWelcomeEmailResend(adminEmail, companyName, tempPassword, companyEmail)
      }
      
      return result
    case 'gmail':
      return sendWelcomeEmailNodemailer(companyEmail, companyName, tempPassword)
    case 'development':
    default:
      // En modo desarrollo, simular envío exitoso y mostrar en consola
      console.log('📧 EMAIL SIMULADO - MODO DESARROLLO')
      console.log('=' .repeat(50))
      console.log('📨 Para:', companyEmail)
      console.log('🏢 Empresa:', companyName)
      console.log('🔑 Contraseña temporal:', tempPassword)
      console.log('🔗 URL:', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
      console.log('=' .repeat(50))
      return { 
        success: true, 
        messageId: 'dev-simulation-' + Date.now(),
        service: 'development' 
      }
  }
}

// Función unificada para enviar notificación al admin
export const sendAdminNotification = async (
  companyName: string,
  companyEmail: string,
  subscriptionPlan: string
) => {
  const service = getEmailService()
  
  switch (service) {
    case 'resend':
      return sendAdminNotificationResend(companyName, companyEmail, subscriptionPlan)
    case 'gmail':
      return sendAdminNotificationNodemailer(companyName, companyEmail, subscriptionPlan)
    case 'development':
    default:
      // En modo desarrollo, simular notificación al admin
      console.log('📧 NOTIFICACIÓN AL ADMIN - SIMULADA')
      console.log('📨 Para admin:', process.env.ADMIN_EMAIL || 'admin@acopiogh.com')
      console.log('🏢 Nueva empresa:', companyName)
      console.log('📧 Email empresa:', companyEmail)
      console.log('📋 Plan:', subscriptionPlan)
      console.log('📅 Fecha:', new Date().toLocaleString('es-AR'))
      return { 
        success: true, 
        messageId: 'admin-dev-simulation-' + Date.now(),
        service: 'development' 
      }
  }
}

// Función para verificar la configuración de email
export const checkEmailConfiguration = () => {
  const service = getEmailService()
  
  const config = {
    service,
    configured: service !== 'development',
    details: {}
  }
  
  switch (service) {
    case 'resend':
      config.details = {
        provider: 'Resend',
        apiKey: process.env.RESEND_API_KEY ? '✅ Configurado' : '❌ No configurado',
  fromEmail: process.env.EMAIL_FROM || 'noresponder@cuatrogranos.com',
        adminEmail: process.env.ADMIN_EMAIL || 'No configurado'
      }
      break
    case 'gmail':
      config.details = {
        provider: 'Gmail (Nodemailer)',
        user: process.env.EMAIL_USER || 'No configurado',
        password: process.env.EMAIL_PASS ? '✅ Configurado' : '❌ No configurado',
  fromEmail: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noresponder@cuatrogranos.com',
        adminEmail: process.env.ADMIN_EMAIL || 'No configurado'
      }
      break
    case 'development':
      config.details = {
        provider: 'Desarrollo (Simulado)',
        note: 'Los emails se mostrarán en la consola para testing',
        adminEmail: process.env.ADMIN_EMAIL || 'admin@acopiogh.com'
      }
      break
  }
  
  return config
}

// Exportar también las funciones de generación de contraseña
export { generatePassword } from './email-service'
