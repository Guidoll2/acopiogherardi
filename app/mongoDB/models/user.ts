import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  // Campo adicional para index único normalizado (lowercase) - compatible con proveedores que no soportan collation
  email_normalized: { type: String, required: false, index: false },
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

// Middleware para mantener email_normalized en minúsculas y sin espacios
UserSchema.pre('save', function (next: (err?: any) => void) {
  try {
    if ((this as any).email) {
      ;(this as any).email_normalized = String((this as any).email).toLowerCase().trim()
      // Mantener también el email en lowercase (schema tiene lowercase:true pero esto asegura)
      ;(this as any).email = String((this as any).email).toLowerCase().trim()
    }
    next()
  } catch (err) {
    next(err as any)
  }
})

// Para operaciones de update que usan findOneAndUpdate / updateOne
UserSchema.pre('findOneAndUpdate', function (next: (err?: any) => void) {
  try {
    const update: any = this.getUpdate()
    // Support for updates that use $set or direct fields
    let emailValue: string | undefined
    if (update) {
      if (update.email) emailValue = update.email
      else if (update.$set && update.$set.email) emailValue = update.$set.email
    }
    if (emailValue) {
      const normalized = String(emailValue).toLowerCase().trim()
      if (update.$set) update.$set.email = normalized
      else update.email = normalized
      if (update.$set) update.$set.email_normalized = normalized
      else update.email_normalized = normalized
      this.setUpdate(update)
    }
    next()
  } catch (err) {
    next(err as any)
  }
})

// Índice único sobre email_normalized (portable)
UserSchema.index({ email_normalized: 1 }, { unique: true })

export default mongoose.models.User || mongoose.model("User", UserSchema)