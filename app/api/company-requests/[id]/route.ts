import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { EmailService, generatePassword } from "@/lib/email-service"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.MONGODB_DB || "cuatrogranos"

// PATCH - Aprobar o rechazar solicitud
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Endpoint deprecated: approvals are no longer required. Return informative response.
  return NextResponse.json({ success: false, error: 'Este endpoint de aprobación está deshabilitado. Los registros se crean automáticamente al enviar el formulario.' }, { status: 410 })
}