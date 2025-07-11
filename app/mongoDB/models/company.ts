import mongoose from "mongoose"

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  cuit: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ["active", "inactive"], 
    default: "active" 
  },
  subscription_plan: { 
    type: String, 
    enum: ["basic", "premium", "enterprise"], 
    default: "basic" 
  },
  notes: { type: String },
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() },
})

export default mongoose.models.Company || mongoose.model("Company", CompanySchema)