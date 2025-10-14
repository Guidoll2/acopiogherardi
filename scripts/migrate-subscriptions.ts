import connectDB from "../app/mongoDB/db"
import Company from "../app/mongoDB/models/company"
import { SUBSCRIPTION_PLANS } from "../lib/subscription-config"

async function migrateExistingCompanies() {
  try {
    await connectDB()
    console.log("🔗 Conectado a MongoDB")

    // Obtener todas las empresas
    const companies = await Company.find({})
    console.log(`📊 Encontradas ${companies.length} empresas para migrar`)

    let migratedCount = 0

    for (const company of companies) {
      console.log(`\n🏢 Migrando empresa: ${company.name}`)
      
      // Determinar el límite basado en el plan actual
  let operations_limit = 50 // default free
      let new_plan = "free"

      // Mapear planes antiguos a nuevos
      switch (company.subscription_plan) {
        case "basic":
          operations_limit = SUBSCRIPTION_PLANS.basic.operations_limit
          new_plan = "basic"
          break
        case "premium":
          // Premium se convierte en basic
          operations_limit = SUBSCRIPTION_PLANS.basic.operations_limit
          new_plan = "basic"
          break
        case "enterprise":
          operations_limit = SUBSCRIPTION_PLANS.enterprise.operations_limit
          new_plan = "enterprise"
          break
        default:
          operations_limit = SUBSCRIPTION_PLANS.free.operations_limit
          new_plan = "free"
      }

      // Calcular fechas de ciclo de facturación
      const billing_cycle_start = new Date()
      const billing_cycle_end = new Date()
      billing_cycle_end.setMonth(billing_cycle_end.getMonth() + 1)

      // Actualizar la empresa
      const updateData = {
        subscription_plan: new_plan,
        operations_count_current_month: 0,
        operations_limit: operations_limit,
        billing_cycle_start: billing_cycle_start,
        billing_cycle_end: billing_cycle_end,
        subscription_status: "active",
        updated_at: new Date().toISOString()
      }

      await Company.findByIdAndUpdate(company._id, updateData)
      
      console.log(`   ✅ Plan: ${company.subscription_plan} → ${new_plan}`)
      console.log(`   📊 Límite: ${operations_limit === -1 ? 'Ilimitado' : operations_limit} operaciones/mes`)
      
      migratedCount++
    }

    console.log(`\n🎉 ¡Migración completada!`)
    console.log(`📈 Empresas migradas: ${migratedCount}`)
    
    // Mostrar resumen por plan
    const summary = await Company.aggregate([
      {
        $group: {
          _id: "$subscription_plan",
          count: { $sum: 1 }
        }
      }
    ])

    console.log(`\n📋 Resumen por plan:`)
    summary.forEach(item => {
      console.log(`   ${item._id}: ${item.count} empresas`)
    })

  } catch (error) {
    console.error("❌ Error durante la migración:", error)
  } finally {
    process.exit(0)
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  migrateExistingCompanies()
}

export default migrateExistingCompanies
