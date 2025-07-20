import mongoose from "mongoose"

const DriverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  license_number: { type: String, required: true },
  license_expiry: { type: String },
  transportista: { type: String },
  is_active: { type: Boolean, default: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  
  // Campos adicionales del modelo anterior para compatibilidad
  dni: { type: String },
  license: { type: String }, // Alias para license_number
  address: { type: String },
  
  created_at: { type: String },
  updated_at: { type: String },
  company_id: { type: String }, // Opcional durante desarrollo
})

export default mongoose.models.Driver || mongoose.model("Driver", DriverSchema)