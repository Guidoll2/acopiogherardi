import connectDB from "../app/mongoDB/db"
import Company from "../app/mongoDB/models/company"
import Operation from "../app/mongoDB/models/operation"
import { SubscriptionService } from "../lib/subscription-service"
import { SUBSCRIPTION_PLANS } from "../lib/subscription-config"

async function testSubscriptionLimits() {
  try {
    await connectDB()
    console.log("🔗 Conectado a MongoDB")

    // Obtener primera empresa para probar (si no existe, crear una temporal)
    let company = await Company.findOne({ subscription_plan: "basic" })
    let createdTestCompany = false
    if (!company) {
      console.log("ℹ️ No se encontró ninguna empresa con plan basic, creando una empresa de prueba...")
      const now = new Date()
      const nextCycleEnd = new Date(now)
      nextCycleEnd.setMonth(nextCycleEnd.getMonth() + 1)

      const testData: any = {
        name: `Test Basic ${Date.now()}`,
        email: `test-basic-${Date.now()}@example.com`,
        phone: null,
        address: null,
        cuit: `TEST${Date.now()}`,
        status: "active",
        subscription_plan: "basic",
        operations_count_current_month: 0,
        operations_limit: SUBSCRIPTION_PLANS.basic.operations_limit,
        billing_cycle_start: now,
        billing_cycle_end: nextCycleEnd,
        subscription_status: "active",
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }

      company = await Company.create(testData)
      createdTestCompany = true
      console.log(`✅ Empresa de prueba creada: ${company.email} (id: ${company._id})`)
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

    // Si creamos una empresa de prueba, eliminarla para limpieza
    if (createdTestCompany && company) {
      try {
        await Company.findByIdAndDelete(company._id)
        console.log(`🧹 Empresa de prueba eliminada: ${company.email}`)
      } catch (delErr) {
        console.warn("⚠️ No se pudo eliminar la empresa de prueba:", delErr)
      }
    }

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
