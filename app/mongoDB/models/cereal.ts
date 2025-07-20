import mongoose from "mongoose"

const CerealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, uppercase: true },
  price_per_ton: { type: Number, required: true, min: 0 },
  description: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  created_at: { type: String },
  updated_at: { type: String },
  company_id: { type: String }, // Relación con Company - temporal opcional para desarrollo
})

export default mongoose.models.Cereal || mongoose.model("Cereal", CerealSchema)