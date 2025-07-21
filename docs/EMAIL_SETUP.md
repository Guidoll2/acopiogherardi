# 📧 Configuración de Email para 4 Granos

## Configuración Rápida

### 1. Configurar variables de entorno

Copia el archivo `.env.local.example` a `.env.local` y configura las siguientes variables:

```env
# Email Configuration
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-de-gmail
EMAIL_FROM=noreply@acopiogh.com
ADMIN_EMAIL=admin@acopiogh.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Configurar Gmail (Recomendado para desarrollo)

1. **Habilitar verificación en 2 pasos** en tu cuenta de Gmail
2. **Generar una contraseña de aplicación**:
   - Ve a [Gestión de cuenta de Google](https://myaccount.google.com/)
   - Seguridad > Verificación en 2 pasos > Contraseñas de aplicaciones
   - Genera una nueva contraseña para "Correo"
   - Usa esta contraseña en `EMAIL_PASS`

### 3. Para producción (Recomendado)

Usa servicios profesionales como:
- **SendGrid** - Gratis hasta 100 emails/día
- **Mailgun** - Gratis hasta 5,000 emails/mes
- **Amazon SES** - Muy económico
- **Resend** - Moderno y fácil de usar

#### Ejemplo con SendGrid:
```env
EMAIL_USER=apikey
EMAIL_PASS=tu-sendgrid-api-key
EMAIL_FROM=noreply@tudominio.com
```

## Funcionalidades implementadas

### ✅ Email de bienvenida automático
Cuando se crea una nueva empresa:
1. Se genera una contraseña temporal segura
2. Se crea un usuario administrador para la empresa
3. Se envía un email profesional con:
   - Credenciales de acceso
   - URL de la plataforma
   - Instrucciones de seguridad
   - Primeros pasos

### ✅ Notificación al administrador del sistema
Se envía un email al admin cuando se registra una nueva empresa.

### ✅ Template HTML profesional
- Diseño responsive
- Información clara y estructurada
- Instrucciones de seguridad
- Enlaces directos

## Estructura del email

```
🌾 ¡Bienvenido a 4 Granos!
├── Saludo personalizado
├── 📋 Credenciales de acceso
├── ⚠️ Instrucciones de seguridad
├── 🚀 Primeros pasos
├── 📞 Información de contacto
└── Footer profesional
```

## Testing

Para probar el envío de emails en desarrollo:

1. Configura las variables de entorno
2. Crea una nueva empresa desde el dashboard del admin
3. Revisa la consola para logs del envío
4. Verifica que llegue el email

## Troubleshooting

### Error: "Invalid login"
- Verifica que hayas habilitado la verificación en 2 pasos
- Usa la contraseña de aplicación, no tu contraseña normal
- Revisa que `EMAIL_USER` tenga el formato correcto

### Email no llega
- Revisa la carpeta de spam
- Verifica las variables de entorno
- Revisa los logs del servidor en la consola

### Para producción
- Usar un dominio verificado
- Configurar registros SPF/DKIM
- Usar un servicio profesional de email
- Implementar retry logic para fallos temporales

## Personalización

Puedes personalizar el template de email editando:
```
lib/email-service.ts > sendWelcomeEmail()
```

Variables disponibles:
- `companyName` - Nombre de la empresa
- `companyEmail` - Email de la empresa  
- `tempPassword` - Contraseña temporal generada
- `process.env.NEXT_PUBLIC_APP_URL` - URL de la aplicación
