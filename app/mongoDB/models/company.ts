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
    enum: ["free", "basic", "enterprise"], 
    default: "free" 
  },
  // Campos para control de suscripción
  operations_count_current_month: { type: Number, default: 0 },
  operations_limit: { type: Number, default: 250 }, // límite según el plan
  billing_cycle_start: { type: Date, default: Date.now },
  billing_cycle_end: { type: Date, default: () => new Date(Date.now() + 30*24*60*60*1000) },
  subscription_status: {
    type: String,
    enum: ["active", "suspended", "cancelled"],
    default: "active"
  },
  notes: { type: String },
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() },
})

export default mongoose.models.Company || mongoose.model("Company", CompanySchema)