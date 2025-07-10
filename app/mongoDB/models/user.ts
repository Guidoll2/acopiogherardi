import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
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
    enum: ["system_admin", "admin", "company_admin", "operador", "garita"], 
    required: true 
  },
  is_active: { type: Boolean, default: true },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
})

export default mongoose.models.User || mongoose.model("User", UserSchema)