# 📧 Configuración de Email Automático - 4 Granos

## ✅ **SISTEMA YA HABILITADO**

El sistema de envío automático de emails ya está habilitado y funcionando. Cuando el administrador crea una nueva empresa:

1. **Se genera automáticamente un usuario administrador** para la empresa
2. **Se envía un email de bienvenida** con credenciales de acceso
3. **Se notifica al administrador del sistema** sobre la nueva empresa registrada

## 🔧 Opciones de Configuración

### **Opción 1: Gmail (Más rápido para empezar)**

1. **Configura una contraseña de aplicación en Gmail:**
   - Ve a tu cuenta de Google > Seguridad
   - Habilita verificación en 2 pasos
   - Genera una "Contraseña de aplicación"

2. **Edita el archivo `.env.local`:**
   ```bash
   # Descomenta y configura estas líneas:
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASS=tu-password-de-aplicacion-gmail
   EMAIL_FROM=noreply@acopiogh.com
   ADMIN_EMAIL=tu-admin@email.com
   ```

### **Opción 2: Resend (Más profesional - Recomendado)**

1. **Crea una cuenta en [Resend.com](https://resend.com)**
   - Es gratuito hasta 3,000 emails/mes
   - Más confiable que Gmail para emails transaccionales

2. **Obtén tu API Key y configura:**
   ```bash
   # Edita el archivo .env.local:
   RESEND_API_KEY=re_tu_api_key_aqui
   EMAIL_FROM=noreply@tu-dominio.com  # Necesitas verificar el dominio
   ADMIN_EMAIL=admin@tu-dominio.com
   ```

### **Opción 3: Modo Desarrollo (Actual)**
- Si no configuras ningún servicio, los emails se simulan en la consola
- Útil para desarrollo y testing

## 📨 Contenido del Email Automático

Cuando se crea una nueva empresa, se envía un email profesional que incluye:

- **Mensaje de bienvenida** personalizado con el nombre de la empresa
- **Credenciales de acceso** (email y contraseña temporal)
- **URL de la plataforma** para iniciar sesión
- **Instrucciones de seguridad** (cambiar contraseña)
- **Primeros pasos** para usar la plataforma
- **Información de contacto** para soporte

## 🔧 Testing del Sistema

### Verificar configuración:
```bash
# GET request a:
http://localhost:3000/api/test-email
```

### Enviar email de prueba:
```javascript
// POST request a: http://localhost:3000/api/test-email
{
  "type": "test-welcome",
  "email": "test@empresa.com",
  "companyName": "Empresa de Prueba",
  "tempPassword": "TempPass123"
}
```

### Probar notificación al admin:
```javascript
// POST request a: http://localhost:3000/api/test-email
{
  "type": "test-admin-notification",
  "companyName": "Empresa de Prueba",
  "companyEmail": "test@empresa.com",
  "subscriptionPlan": "basic"
}
```

## 📋 Template del Email

El email incluye:

```html
🌾 ¡Bienvenido a 4 Granos!

Hola, equipo de [NOMBRE_EMPRESA]

Tu empresa ha sido registrada exitosamente en nuestro sistema.

📋 Credenciales de Acceso:
- Usuario: [EMAIL]
- Contraseña temporal: [PASSWORD]
- URL: [APP_URL]/login

⚠️ Importante - Seguridad:
- Cambia tu contraseña inmediatamente
- No compartas estas credenciales por medios no seguros
- Utiliza una contraseña fuerte y única

🚀 Primeros pasos:
1. Inicia sesión con las credenciales proporcionadas
2. Cambia tu contraseña en el perfil de usuario
3. Configura los datos básicos de tu empresa
4. Crea usuarios adicionales para tu equipo
5. Comienza a gestionar tus operaciones de acopio

📞 ¿Necesitas ayuda?
Email: soporte@acopiogh.com
Teléfono: +54 11 1234-5678
```

## 🎯 Funcionamiento Actual

1. **Admin crea empresa** → Formulario en `/system-admin`
2. **Sistema crea empresa** → Base de datos MongoDB
3. **Sistema crea usuario admin** → Con email de la empresa
4. **Sistema envía email** → Automáticamente a la empresa
5. **Sistema notifica admin** → Email al administrador del sistema
6. **Empresa recibe credenciales** → Listas para usar

## 🚀 Para Empezar Ahora Mismo

**Opción más rápida (Gmail):**
1. Edita `.env.local`
2. Descomenta las líneas de EMAIL_USER y EMAIL_PASS
3. Configura tu Gmail con contraseña de aplicación
4. Reinicia el servidor
5. ¡Ya funciona!

**Si prefieres seguir en modo desarrollo:**
- El sistema ya funciona, los emails se muestran en la consola
- Puedes ver las credenciales generadas para entregar manualmente
- No necesitas configurar nada adicional

## 📞 Soporte

Si necesitas ayuda configurando cualquier opción, el sistema ya está preparado y funcionando en modo desarrollo.
