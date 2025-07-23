import mongoose from "mongoose"

const OperationSchema = new mongoose.Schema({
  type: { type: String, enum: ["ingreso", "egreso"], required: true },
  date: { type: String, required: true },
  client_id: { type: String, required: true },
  driver_id: { type: String, required: true },
  cereal_type_id: { type: String, required: false }, // Opcional para ingresos espontáneos
  silo_id: { type: String, required: false }, // Opcional para ingresos espontáneos
  chassis_plate: { type: String, required: true },
  trailer_plate: { type: String },
  quantity: { type: Number, default: 0 },
  gross_weight: { type: Number, default: 0 },
  tare_weight: { type: Number, default: 0 },
  net_weight: { type: Number, default: 0 },
  moisture: { type: Number, default: 0 },
  impurities: { type: Number, default: 0 },
  test_weight: { type: Number, default: 0 },
  notes: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ["pendiente", "autorizar_acceso", "balanza_ingreso", "en_carga_descarga", "balanza_egreso", "autorizar_egreso", "completado", "cancelado"], 
    default: "pendiente" 
  },
  scheduled_date: { type: Date },
  estimated_duration: { type: Number, default: 60 },
  
  // Campos de autorización de garita
  authorized_entry: {
    timestamp: { type: Date },
    authorized_by: { type: String },
    notes: { type: String }
  },
  authorized_exit: {
    timestamp: { type: Date },
    authorized_by: { type: String },
    notes: { type: String }
  },
  
  // Campo para identificar operaciones creadas desde garita
  created_from_garita: { type: Boolean, default: false },
  
  company_id: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Forzar la eliminación del modelo anterior si existe
if (mongoose.models.Operation) {
  delete mongoose.models.Operation
}

export default mongoose.model("Operation", OperationSchema)