import mongoose from "mongoose"

const DriverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dni: { type: String },
  phone: { type: String },
  license: { type: String },
  address: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  created_at: { type: String },
  updated_at: { type: String },
  company_id: { type: String, required: true }, // Relación con Company
})

export default mongoose.models.Driver || mongoose.model("Driver", DriverSchema)