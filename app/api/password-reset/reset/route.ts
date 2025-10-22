import { NextResponse } from 'next/server'
import connectDB from '@/app/mongoDB/db'
import User from '@/app/mongoDB/models/user'
import { generatePassword, sendPasswordResetEmail } from '@/lib/email-service-resend'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      )
    }

    await connectDB()

    // Buscar el usuario por email
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json(
        { error: 'No se encontró un usuario con ese email' },
        { status: 404 }
      )
    }

    // Generar nueva contraseña
    const newPassword = generatePassword(10)
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar la contraseña en la base de datos
    user.password = hashedPassword
    user.updatedAt = new Date()
    await user.save()

    // Enviar email con la nueva contraseña
    const emailResult = await sendPasswordResetEmail(
      email,
      user.name || user.email,
      newPassword
    )

    if (!emailResult.success) {
      console.error('Error al enviar email:', emailResult.error)
      return NextResponse.json(
        { error: 'La contraseña fue actualizada pero no se pudo enviar el email. Contacte al administrador.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Nueva contraseña enviada exitosamente'
    })

  } catch (error) {
    console.error('Error en reset de contraseña:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
