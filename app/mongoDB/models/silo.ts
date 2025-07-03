import mongoose from "mongoose"

const SiloSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number },
  current_stock: { type: Number, default: 0 },
  location: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  created_at: { type: String },
  updated_at: { type: String },
  company_id: { type: String, required: true }, // Relación con Company
})

export default mongoose.models.Silo || mongoose.model("Silo", SiloSchema)