import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import DeletedCompany from "@/app/mongoDB/models/deleted-company"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    // Return the latest 200 deleted companies
    const items = await DeletedCompany.find({}).sort({ deleted_at: -1 }).limit(200).lean()
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Error fetching deleted companies:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
