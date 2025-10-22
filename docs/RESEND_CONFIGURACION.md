# Configuración de Resend para Envío de Emails

## Problema Actual

Resend está configurado con `onboarding@resend.dev` que es un **email de sandbox/desarrollo**. En este modo, Resend **solo puede enviar emails a direcciones verificadas**.

## Soluciones

### Opción 1: Verificar emails específicos (Rápido)

1. Ve a tu dashboard de Resend: https://resend.com/emails
2. En la sección de "API Keys" o "Domains", busca la opción de "Audience" o emails verificados
3. Agrega `guido.llaurado@gmail.com` y cualquier otro email de prueba
4. Verifica el email haciendo clic en el link que te enviarán

**Pros:** Rápido, funciona inmediatamente
**Contras:** Solo funcionará para emails verificados manualmente

### Opción 2: Verificar tu dominio (Recomendado para producción)

1. Ve a Resend dashboard: https://resend.com/domains
2. Haz clic en "Add Domain"
3. Agrega tu dominio (ej: `cuatrogranos.com`)
4. Sigue las instrucciones para agregar los registros DNS:
   - SPF
   - DKIM
   - DMARC
5. Una vez verificado, cambia en `.env.local`:
   ```bash
   EMAIL_FROM=noreply@cuatrogranos.com
   ```

**Pros:** Puedes enviar a cualquier email, aspecto más profesional
**Contras:** Requiere acceso a configuración DNS del dominio

### Opción 3: Usar Gmail temporalmente (Alternativa)

Si necesitas enviar emails inmediatamente a cualquier dirección mientras configuras Resend:

1. En `.env.local`, comenta las variables de Resend y configura Gmail:
   ```bash
   # Opción 2: Resend (comentado temporalmente)
   # EMAIL_SERVICE=resend
   # RESEND_API_KEY=re_B6qCYime_9C4xBrhkor2hBuXuDEwk4DiX
   # EMAIL_FROM=onboarding@resend.dev

   # Opción 1: Gmail (Nodemailer) - Temporal
   EMAIL_SERVICE=gmail
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASS=tu-app-password-de-gmail
   EMAIL_FROM=tu-email@gmail.com
   ```

2. Para generar una App Password de Gmail:
   - Ve a https://myaccount.google.com/security
   - Activa verificación en 2 pasos
   - Busca "App passwords"
   - Genera una para "Mail"

## Código Actualizado

El código ya ha sido actualizado para:
1. ✅ Intentar enviar directamente a la empresa
2. ✅ Si falla (restricción de sandbox), envía al admin como respaldo
3. ✅ Mostrar las credenciales en la UI si el email falla

## Estado Actual

- Base de datos: ✅ Corregida a "cuatrogranos"
- Credenciales en UI: ✅ Se muestran cuando el email falla
- Email directo: ⚠️ Limitado por sandbox de Resend (requiere verificación)

## Siguiente Paso Recomendado

**Para testing inmediato:** Verifica `guido.llaurado@gmail.com` en Resend (Opción 1)

**Para producción:** Verifica tu dominio en Resend (Opción 2)
