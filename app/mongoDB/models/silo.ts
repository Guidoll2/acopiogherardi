import mongoose from "mongoose"

const SiloSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true, min: 0 },
  current_stock: { type: Number, default: 0, min: 0 },
  cereal_type_id: { type: String }, // Relación con Cereal
  location: { type: String },
  is_active: { type: Boolean, default: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  created_at: { type: String },
  updated_at: { type: String },
  company_id: { type: String }, // Relación con Company - temporal opcional para desarrollo
})

export default mongoose.models.Silo || mongoose.model("Silo", SiloSchema)