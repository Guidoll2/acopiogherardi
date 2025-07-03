import mongoose from "mongoose"

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  tax_id: { type: String },
  contact_person: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  created_at: { type: String },
  updated_at: { type: String },
  company_id: { type: String, required: true }, // Relación con Company
})

export default mongoose.models.Client || mongoose.model("Client", ClientSchema)