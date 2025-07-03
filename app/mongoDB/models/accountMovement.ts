import mongoose from "mongoose"

const AccountMovementSchema = new mongoose.Schema({
  client_id: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  balance: { type: Number },
  type: { type: String, enum: ["debit", "credit"], required: true },
  created_at: { type: String },
  updated_at: { type: String },
  company_id: { type: String, required: true }, // Relación con Company
})

export default mongoose.models.AccountMovement || mongoose.model("AccountMovement", AccountMovementSchema)