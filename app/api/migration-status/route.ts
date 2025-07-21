import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import Company from "@/app/mongoDB/models/company"

export async function GET() {
  try {
    await connectDB()

    // Obtener todas las empresas
    const companies = await Company.find({})
    
    // Crear resumen de migración
    const migrationStatus = companies.map(company => ({
      name: company.name,
      email: company.email,
      subscription_plan: company.subscription_plan,
      operations_limit: company.operations_limit,
      operations_count_current_month: company.operations_count_current_month,
      billing_cycle_start: company.billing_cycle_start,
      billing_cycle_end: company.billing_cycle_end,
      subscription_status: company.subscription_status,
      hasNewFields: !!(company.operations_limit !== undefined && 
                      company.operations_count_current_month !== undefined)
    }))

    // Resumen por plan
    const planSummary = await Company.aggregate([
      {
        $group: {
          _id: "$subscription_plan",
          count: { $sum: 1 }
        }
      }
    ])

    return NextResponse.json({
      success: true,
      total_companies: companies.length,
      companies: migrationStatus,
      plan_summary: planSummary,
      migration_needed: migrationStatus.filter(c => !c.hasNewFields).length > 0
    })

  } catch (error) {
    console.error("Error checking migration:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
