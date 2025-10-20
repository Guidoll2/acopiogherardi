import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  full_name: { type: String, required: true },
  phone: { type: String },
  position: { type: String },
  name: { type: String },
  address: { type: String },
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() },
  role: { 
    type: String, 
    enum: ["system_admin", "admin", "company_admin", "supervisor", "operator", "garita"], 
    required: true 
  },
  is_active: { type: Boolean, default: true },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
})

// Asegurar índice único case-insensitive en `email`
UserSchema.index({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } })

export default mongoose.models.User || mongoose.model("User", UserSchema)