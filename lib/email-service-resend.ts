import { Resend } from 'resend'

// Configuración de Resend (alternativa moderna y gratuita)
const resend = new Resend(process.env.RESEND_API_KEY)

// Función para generar contraseña aleatoria
export const generatePassword = (length: number = 12): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Función para enviar email con Resend
export const sendWelcomeEmail = async (
  companyEmail: string,
  companyName: string,
  tempPassword: string
) => {
  try {
    // Si no hay configuración de Resend, simular envío exitoso para desarrollo
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 MODO DESARROLLO - Email que se enviaría:')
      console.log('📨 Para:', companyEmail)
      console.log('🏢 Empresa:', companyName)
      console.log('🔑 Contraseña temporal:', tempPassword)
      console.log('💌 Email simulado enviado exitosamente!')
      return { success: true, messageId: 'dev-mode-' + Date.now() }
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@acopiogh.com',
      to: [companyEmail],
      subject: `¡Bienvenido a 4 Granos! - Credenciales de acceso para ${companyName}`,
      html: getEmailTemplate(companyEmail, companyName, tempPassword),
    })

    if (error) {
      console.error('Error enviando email con Resend:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Email enviado exitosamente con Resend:', data?.id)
    return { success: true, messageId: data?.id }
    
  } catch (error) {
    console.error('Error enviando email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Template del email
const getEmailTemplate = (companyEmail: string, companyName: string, tempPassword: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .credentials { background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .warning { background-color: #fef3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌾 ¡Bienvenido a 4 Granos!</h1>
        </div>
        
        <div class="content">
          <h2>Hola, equipo de ${companyName}</h2>
          
          <p>¡Nos complace darte la bienvenida a nuestra plataforma de gestión de acopio de cereales!</p>
          
          <p>Tu empresa <strong>${companyName}</strong> ha sido registrada exitosamente en nuestro sistema. A continuación, encontrarás tus credenciales de acceso:</p>
          
          <div class="credentials">
            <h3>📋 Credenciales de Acceso</h3>
            <p><strong>Usuario (Email):</strong> ${companyEmail}</p>
            <p><strong>Contraseña temporal:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
            <p><strong>URL de acceso:</strong> <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login">${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login</a></p>
          </div>
          
          <div class="warning">
            <h4>⚠️ Importante - Seguridad</h4>
            <ul>
              <li><strong>Cambia tu contraseña inmediatamente</strong> después del primer inicio de sesión</li>
              <li>No compartas estas credenciales por email o medios no seguros</li>
              <li>Utiliza una contraseña fuerte y única para tu cuenta</li>
            </ul>
          </div>
          
          <h3>🚀 Primeros pasos:</h3>
          <ol>
            <li>Inicia sesión con las credenciales proporcionadas</li>
            <li>Cambia tu contraseña en el perfil de usuario</li>
            <li>Configura los datos básicos de tu empresa</li>
            <li>Crea usuarios adicionales para tu equipo</li>
            <li>Comienza a gestionar tus operaciones de acopio</li>
          </ol>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="button">
              Acceder a la Plataforma
            </a>
          </div>
          
          <h3>📞 ¿Necesitas ayuda?</h3>
          <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos:</p>
          <ul>
            <li><strong>Email de soporte:</strong> soporte@acopiogh.com</li>
            <li><strong>Teléfono:</strong> +54 11 1234-5678</li>
            <li><strong>Horario de atención:</strong> Lunes a Viernes, 8:00 - 18:00 hs</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Este email fue enviado automáticamente por 4 Granos</p>
          <p>© ${new Date().getFullYear()} 4 Granos. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Función para enviar email de notificación al admin del sistema
export const sendAdminNotification = async (
  companyName: string,
  companyEmail: string,
  subscriptionPlan: string
) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL
    
    if (!adminEmail) {
      console.log('⚠️ No se configuró email de admin, saltando notificación')
      return { success: true }
    }

    if (!process.env.RESEND_API_KEY) {
      console.log('📧 MODO DESARROLLO - Notificación al admin que se enviaría:')
      console.log('📨 Para:', adminEmail)
      console.log('🏢 Nueva empresa:', companyName)
      console.log('📧 Email:', companyEmail)
      console.log('📋 Plan:', subscriptionPlan)
      return { success: true }
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@acopiogh.com',
      to: [adminEmail],
      subject: `Nueva empresa registrada: ${companyName}`,
      html: `
        <h2>Nueva empresa registrada en 4 Granos</h2>
        <p><strong>Empresa:</strong> ${companyName}</p>
        <p><strong>Email:</strong> ${companyEmail}</p>
        <p><strong>Plan:</strong> ${subscriptionPlan}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
        
        <p>Las credenciales han sido enviadas automáticamente al email de la empresa.</p>
      `
    })

    if (error) {
      console.error('Error enviando notificación al admin:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
    
  } catch (error) {
    console.error('Error enviando notificación al admin:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
