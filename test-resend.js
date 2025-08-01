#!/usr/bin/env node

/**
 * Script para probar la configuración de Resend
 * Uso: node test-resend.js tu-email@example.com
 */

const { Resend } = require('resend')
require('dotenv').config({ path: '.env.local' })

async function testResend() {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const testEmail = process.argv[2]

  if (!testEmail) {
    console.log('❌ Debes proporcionar un email para la prueba')
    console.log('Uso: node test-resend.js tu-email@example.com')
    process.exit(1)
  }

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_api_key_here') {
    console.log('❌ RESEND_API_KEY no configurado en .env.local')
    console.log('   Obtén tu API key en: https://resend.com/api-keys')
    process.exit(1)
  }

  console.log('🧪 Probando configuración de Resend...')
  console.log(`📨 Enviando email de prueba a: ${testEmail}`)
  console.log(`📤 Desde: ${process.env.EMAIL_FROM}`)

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: [testEmail],
      subject: '🧪 Prueba de configuración - 4 Granos',
      html: `
        <h2>🎉 ¡Configuración exitosa!</h2>
        <p>Tu configuración de Resend está funcionando correctamente.</p>
        <p><strong>Hora de la prueba:</strong> ${new Date().toLocaleString('es-AR')}</p>
        <p>Ya puedes crear empresas y se enviarán los emails automáticamente.</p>
        <hr>
        <p><small>Este email fue enviado desde 4 Granos usando Resend</small></p>
      `
    })

    if (error) {
      console.error('❌ Error enviando email:', error)
      process.exit(1)
    }

    console.log('✅ Email enviado exitosamente!')
    console.log(`📧 ID del mensaje: ${data.id}`)
    console.log('')
    console.log('🎉 ¡Configuración completada!')
    console.log('   Ya puedes crear empresas y se enviarán emails automáticamente.')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

testResend()
