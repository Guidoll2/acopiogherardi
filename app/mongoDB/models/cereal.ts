import mongoose from "mongoose"

const CerealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  created_at: { type: String },
  updated_at: { type: String },
  company_id: { type: String, required: true }, // Relación con Company
})

export default mongoose.models.Cereal || mongoose.model("Cereal", CerealSchema)