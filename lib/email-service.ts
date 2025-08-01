import nodemailer from 'nodemailer'

// Configuración del transportador de email
const createTransporter = () => {
  // Opción 1: Gmail con contraseña de aplicación (método tradicional)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  // Opción 2: Para desarrollo sin configuración (usa Ethereal - emails falsos para testing)
  console.log('⚠️ Configuración de email no encontrada. Usando modo de desarrollo (Ethereal)')
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.pass'
    }
  })
}

// Función para generar contraseña aleatoria
export const generatePassword = (length: number = 12): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Función para enviar email de bienvenida con credenciales
export const sendWelcomeEmail = async (
  companyEmail: string,
  companyName: string,
  tempPassword: string
) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: companyEmail,
      subject: `¡Bienvenido a 4 Granos! - Credenciales de acceso para ${companyName}`,
      html: `
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
      `,
      // Versión en texto plano como fallback
      text: `
¡Bienvenido a 4 Granos!

Hola, equipo de ${companyName}

Tu empresa ${companyName} ha sido registrada exitosamente.

Credenciales de acceso:
- Usuario: ${companyEmail}
- Contraseña temporal: ${tempPassword}
- URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login

IMPORTANTE: Cambia tu contraseña inmediatamente después del primer inicio de sesión.

¿Necesitas ayuda? Contáctanos en soporte@acopiogh.com

© ${new Date().getFullYear()} 4 Granos
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email enviado exitosamente:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('Error enviando email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Función para enviar email de notificación al admin del sistema
export const sendAdminNotification = async (
  companyName: string,
  companyEmail: string,
  subscriptionPlan: string
) => {
  try {
    const transporter = createTransporter()
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER

    if (!adminEmail) {
      console.log('No se configuró email de admin, saltando notificación')
      return { success: true }
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: adminEmail,
      subject: `Nueva empresa registrada: ${companyName}`,
      html: `
        <h2>Nueva empresa registrada en 4 Granos</h2>
        <p><strong>Empresa:</strong> ${companyName}</p>
        <p><strong>Email:</strong> ${companyEmail}</p>
        <p><strong>Plan:</strong> ${subscriptionPlan}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
        
        <p>Las credenciales han sido enviadas automáticamente al email de la empresa.</p>
      `
    }

    await transporter.sendMail(mailOptions)
    return { success: true }
    
  } catch (error) {
    console.error('Error enviando notificación al admin:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
