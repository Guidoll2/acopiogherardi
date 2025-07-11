import connectDB from "../app/mongoDB/db"
import Company from "../app/mongoDB/models/company"

async function createSampleCompanies() {
  try {
    await connectDB()
    console.log("---Conexión exitosa a MongoDB---")

    // Verificar si ya existen empresas
    const existingCompanies = await Company.countDocuments()
    if (existingCompanies > 0) {
      console.log(`Ya existen ${existingCompanies} empresas en la base de datos`)
      return
    }

    const sampleCompanies = [
      {
        name: "Acopio Central S.A.",
        email: "admin@acopio.com",
        phone: "+54 11 2345-6789",
        address: "Rosario, Santa Fe",
        cuit: "30-12345678-9",
        status: "active",
        subscription_plan: "premium",
      },
      {
        name: "Granos del Sur",
        email: "contacto@granossur.com",
        phone: "+54 11 3456-7890",
        address: "Córdoba, Córdoba",
        cuit: "30-87654321-0",
        status: "active",
        subscription_plan: "enterprise",
      },
      {
        name: "Cooperativa Agrícola",
        email: "info@coopagricola.com.ar",
        phone: "+54 11 4567-8901",
        address: "Mendoza, Mendoza",
        cuit: "30-11223344-5",
        status: "active",
        subscription_plan: "basic",
      },
    ]

    for (const companyData of sampleCompanies) {
      const company = new Company(companyData)
      await company.save()
      console.log(`✅ Empresa creada: ${company.name}`)
    }

    console.log("\n🎉 Empresas de ejemplo creadas exitosamente!")

  } catch (error) {
    console.error("❌ Error creando empresas:", error)
  } finally {
    process.exit(0)
  }
}

createSampleCompanies()
