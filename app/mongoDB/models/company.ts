import mongoose from "mongoose"

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  tax_id: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
})

export default mongoose.models.Company || mongoose.model("Company", CompanySchema)