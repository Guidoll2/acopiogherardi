import connectDB from "../app/mongoDB/db"
import Company from "../app/mongoDB/models/company"
import { SubscriptionService } from "../lib/subscription-service"
import { SUBSCRIPTION_PLANS } from "../lib/subscription-config"

async function testFreePlanLimits() {
  try {
    await connectDB()
    console.log("---Conectando a MongoDB---")
    console.log("---Conexión exitosa a MongoDB---")

    // Buscar o crear empresa con plan 'free'
    let company = await Company.findOne({ subscription_plan: "free" })
    let createdTestCompany = false

    if (!company) {
      console.log("ℹ️ No se encontró ninguna empresa con plan free, creando una empresa de prueba...")
      const now = new Date()
      const nextCycleEnd = new Date(now)
      nextCycleEnd.setMonth(nextCycleEnd.getMonth() + 1)

      const testData: any = {
        name: `Test Free ${Date.now()}`,
        email: `test-free-${Date.now()}@example.com`,
        cuit: `TESTFREE${Date.now()}`,
        status: "active",
        subscription_plan: "free",
        operations_count_current_month: 0,
        operations_limit: SUBSCRIPTION_PLANS.free.operations_limit,
        billing_cycle_start: now,
        billing_cycle_end: nextCycleEnd,
        subscription_status: "active",
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }

      company = await Company.create(testData)
      createdTestCompany = true
      console.log(`✅ Empresa de prueba creada: ${company.email} (id: ${company._id})`)
    } else {
      console.log(`ℹ️ Usando empresa existente con plan free: ${company.email} (id: ${company._id})`)
      // Resetear contador por si acaso
      await Company.findByIdAndUpdate(company._id, { operations_count_current_month: 0 })
    }

    console.log(`\n🏢 Probando límites para: ${company.name}`)
    console.log(`📋 Plan: ${company.subscription_plan}`)

    // Intentar crear 55 operaciones hasta que sea rechazado
    const maxAttempts = SUBSCRIPTION_PLANS.free.operations_limit + 5

    for (let i = 1; i <= maxAttempts; i++) {
      const check = await SubscriptionService.checkOperationLimit(company._id)
      if (check.canCreate) {
        const inc = await SubscriptionService.incrementOperationCount(company._id)
        if (!inc) {
          console.warn(`⚠️ No se pudo incrementar contador en iteración ${i}`)
          break
        }
        console.log(`   ✅ Operación ${i} creada (Uso: ${check.currentCount + 1}/${check.limit === -1 ? '∞' : check.limit})`)
      } else {
        console.log(`   ❌ Operación ${i} rechazada como es esperado: ${check.errorMessage}`)
        break
      }
    }

    const finalCheck = await SubscriptionService.checkOperationLimit(company._id)
    console.log("\n📊 Estado final:")
    console.log(`   🔢 Operaciones actuales: ${finalCheck.currentCount}`)
    console.log(`   📈 Límite: ${finalCheck.limit === -1 ? 'Ilimitado' : finalCheck.limit}`)

    if (createdTestCompany) {
      try {
        await Company.findByIdAndDelete(company._id)
        console.log(`🧹 Empresa de prueba eliminada: ${company.email}`)
      } catch (err) {
        console.warn("⚠️ No se pudo eliminar la empresa de prueba:", err)
      }
    } else {
      // Si era empresa existente, resetear contador a 0 para no afectar datos reales
      await Company.findByIdAndUpdate(company._id, { operations_count_current_month: 0 })
      console.log("ℹ️ Empresa existente: contador reseteado a 0")
    }

    console.log("\n✅ Test de plan free finalizado")

  } catch (error) {
    console.error("❌ Error en test de plan free:", error)
  } finally {
    process.exit(0)
  }
}

if (require.main === module) {
  testFreePlanLimits()
}

export default testFreePlanLimits
