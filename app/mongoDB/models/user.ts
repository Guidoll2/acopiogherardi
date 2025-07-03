import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  full_name: { type: String },
  phone: { type: String },
  position: { type: String },
  name: { type: String },
  address: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  role: { 
    type: String, 
    enum: ["system_admin", "admin", "company_admin", "garita"], 
    required: true 
  },
  is_active: { type: Boolean, default: true },
  company_id: { type: String },
})

export default mongoose.models.User || mongoose.model("User", UserSchema)