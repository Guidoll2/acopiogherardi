import mongoose from "mongoose"

const OperationSchema = new mongoose.Schema({
  type: { type: String, enum: ["ingreso", "egreso"], required: true },
  date: { type: String, required: true },
  client_id: { type: String, required: true },
  driver_id: { type: String, required: true },
  cereal_id: { type: String, required: true },
  silo_id: { type: String, required: true },
  gross_weight: { type: Number, required: true },
  tare_weight: { type: Number, required: true },
  net_weight: { type: Number, required: true },
  observations: { type: String },
  status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
  created_at: { type: String },
  updated_at: { type: String },
  company_id: { type: String, required: true }, // Relación con Company
})

export default mongoose.models.Operation || mongoose.model("Operation", OperationSchema)