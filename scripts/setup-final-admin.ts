import connectDB from "../app/mongoDB/db"
import User from "../app/mongoDB/models/user"
import bcrypt from "bcryptjs"

async function setupFinalAdmin() {
  try {
    await connectDB()
    console.log("🔗 Conectado a MongoDB")

    // Verificar si existe el usuario correcto
    const targetUser = await User.findOne({ email: "ignacio.gherardi@gmail.com" })
    
    if (targetUser) {
      console.log("✅ Usuario encontrado:", targetUser.email)
      console.log("   Nombre:", targetUser.full_name)
      console.log("   Rol:", targetUser.role)
      console.log("   Activo:", targetUser.is_active)
      
      // Verificar contraseña
      const isPasswordCorrect = await bcrypt.compare("Caprichoso", targetUser.password)
      console.log("   Contraseña correcta:", isPasswordCorrect ? "✅ Sí" : "❌ No")
      
      if (!isPasswordCorrect) {
        targetUser.password = await bcrypt.hash("Caprichoso", 12)
        await targetUser.save()
        console.log("   ⚡ Contraseña actualizada")
      }
      
    } else {
      console.log("⚠️  Usuario no encontrado, creando...")
      
      const newAdmin = new User({
        email: "ignacio.gherardi@gmail.com",
        password: await bcrypt.hash("Caprichoso", 12),
        full_name: "Ignacio Gherardi",
        phone: "+54 11 1234-5678",
        role: "system_admin",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      
      await newAdmin.save()
      console.log("✅ Usuario administrador creado exitosamente!")
    }

    // Mostrar resumen final
    const allUsers = await User.find({})
    console.log(`\n📊 RESUMEN FINAL (${allUsers.length} usuarios):`)
    console.log("=" .repeat(50))
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. 📧 ${user.email}`)
      console.log(`   👤 ${user.full_name}`)
      console.log(`   🔑 ${user.role}`)
      console.log(`   ${user.is_active ? '🟢' : '🔴'} ${user.is_active ? 'Activo' : 'Inactivo'}`)
      console.log("")
    })

    console.log("🎉 ¡CONFIGURACIÓN COMPLETADA!")
    console.log("📧 Email: ignacio.gherardi@gmail.com")
    console.log("🔒 Contraseña: Caprichoso")
    console.log("🔑 Rol: system_admin")

  } catch (error) {
    console.error("❌ Error en configuración final:", error)
  } finally {
    process.exit(0)
  }
}

setupFinalAdmin()
