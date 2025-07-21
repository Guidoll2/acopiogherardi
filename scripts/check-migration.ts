import connectDB from "../app/mongoDB/db"
import Company from "../app/mongoDB/models/company"

async function checkMigration() {
  try {
    await connectDB()
    console.log("🔗 Conectado a MongoDB")

    // Obtener todas las empresas y mostrar sus campos de suscripción
    const companies = await Company.find({})
    console.log(`📊 Empresas encontradas: ${companies.length}`)

    companies.forEach((company, index) => {
      console.log(`\n${index + 1}. ${company.name}`)
      console.log(`   📧 Email: ${company.email}`)
      console.log(`   📋 Plan: ${company.subscription_plan}`)
      console.log(`   📊 Límite: ${company.operations_limit || 'No definido'}`)
      console.log(`   🔢 Operaciones actuales: ${company.operations_count_current_month || 0}`)
      console.log(`   📅 Ciclo inicio: ${company.billing_cycle_start || 'No definido'}`)
      console.log(`   📅 Ciclo fin: ${company.billing_cycle_end || 'No definido'}`)
      console.log(`   ✅ Estado: ${company.subscription_status || 'No definido'}`)
    })

    // Resumen por plan
    const planSummary = await Company.aggregate([
      {
        $group: {
          _id: "$subscription_plan",
          count: { $sum: 1 }
        }
      }
    ])

    console.log(`\n📋 Resumen por plan:`)
    planSummary.forEach(item => {
      console.log(`   ${item._id || 'undefined'}: ${item.count} empresas`)
    })

  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    process.exit(0)
  }
}

checkMigration()
