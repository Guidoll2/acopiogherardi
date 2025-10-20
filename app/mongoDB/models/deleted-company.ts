import mongoose from "mongoose"

const DeletedCompanySchema = new mongoose.Schema({
  original_id: { type: String },
  snapshot: { type: mongoose.Schema.Types.Mixed },
  deleted_by: { type: String },
  reason: { type: String },
  deleted_at: { type: String, default: () => new Date().toISOString() }
})

export default mongoose.models.DeletedCompany || mongoose.model('DeletedCompany', DeletedCompanySchema)
