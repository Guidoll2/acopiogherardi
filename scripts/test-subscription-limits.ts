import connectDB from "../app/mongoDB/db"
import Company from "../app/mongoDB/models/company"
import Operation from "../app/mongoDB/models/operation"
import { SubscriptionService } from "../lib/subscription-service"

async function testSubscriptionLimits() {
  try {
    await connectDB()
    console.log("🔗 Conectado a MongoDB")

    // Obtener primera empresa para probar
    const company = await Company.findOne({ subscription_plan: "basic" })
    if (!company) {
      console.log("❌ No se encontró ninguna empresa con plan basic")
      return
    }

    console.log(`\n🏢 Probando límites para: ${company.name}`)
    console.log(`📧 Email: ${company.email}`)
    console.log(`📋 Plan: ${company.subscription_plan}`)

    // Verificar estado inicial
    const initialCheck = await SubscriptionService.checkOperationLimit(company._id)
    console.log("\n📊 Estado inicial:")
    console.log(`   ✅ Puede crear operación: ${initialCheck.canCreate}`)
    console.log(`   🔢 Operaciones actuales: ${initialCheck.currentCount}`)
    console.log(`   📈 Límite: ${initialCheck.limit === -1 ? 'Ilimitado' : initialCheck.limit}`)
    console.log(`   ⏳ Operaciones restantes: ${initialCheck.remainingOperations === -1 ? 'Ilimitadas' : initialCheck.remainingOperations}`)

    // Simular crear algunas operaciones
    console.log("\n🧪 Simulando creación de operaciones...")
    
    for (let i = 1; i <= 3; i++) {
      const check = await SubscriptionService.checkOperationLimit(company._id)
      
      if (check.canCreate) {
        // Simular crear operación
        await SubscriptionService.incrementOperationCount(company._id)
        console.log(`   ✅ Operación ${i} creada`)
      } else {
        console.log(`   ❌ Operación ${i} rechazada: ${check.errorMessage}`)
        break
      }
    }

    // Verificar estado final
    const finalCheck = await SubscriptionService.checkOperationLimit(company._id)
    console.log("\n📊 Estado final:")
    console.log(`   ✅ Puede crear operación: ${finalCheck.canCreate}`)
    console.log(`   🔢 Operaciones actuales: ${finalCheck.currentCount}`)
    console.log(`   📈 Límite: ${finalCheck.limit === -1 ? 'Ilimitado' : finalCheck.limit}`)
    console.log(`   ⏳ Operaciones restantes: ${finalCheck.remainingOperations === -1 ? 'Ilimitadas' : finalCheck.remainingOperations}`)

    // Probar información completa de suscripción
    console.log("\n📋 Información completa de suscripción:")
    const subscriptionInfo = await SubscriptionService.getSubscriptionInfo(company._id)
    if (subscriptionInfo) {
      console.log(`   🏢 Empresa: ${subscriptionInfo.company.name}`)
      console.log(`   📦 Plan: ${subscriptionInfo.subscription.planName} ($${subscriptionInfo.subscription.price}/mes)`)
      console.log(`   📊 Uso: ${subscriptionInfo.subscription.currentCount}/${subscriptionInfo.subscription.limit === -1 ? '∞' : subscriptionInfo.subscription.limit}`)
      console.log(`   ⭐ Características:`)
      subscriptionInfo.subscription.features.forEach(feature => {
        console.log(`      - ${feature}`)
      })
    }

    console.log("\n✅ Prueba completada exitosamente")

  } catch (error) {
    console.error("❌ Error durante la prueba:", error)
  } finally {
    process.exit(0)
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  testSubscriptionLimits()
}

export default testSubscriptionLimits
