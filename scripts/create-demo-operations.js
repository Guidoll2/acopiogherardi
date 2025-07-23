const { MongoClient } = require('mongodb');

async function createOperations() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('acopiogh');
    
    // Obtener IDs necesarios
    const company = await db.collection('companies').findOne({});
    const clientDoc = await db.collection('clients').findOne({});
    const driver = await db.collection('drivers').findOne({});
    
    if (!company || !clientDoc || !driver) {
      console.log('❌ Faltan datos base. Asegúrate de tener empresa, cliente y conductor.');
      return;
    }
    
    console.log('📊 Datos encontrados:', {
      company: company.name,
      client: clientDoc.name,
      driver: driver.name
    });
    
    const today = new Date();
    const todayISO = today.toISOString();
    
    // Crear operaciones de prueba con estados específicos para garita
    const operations = [
      {
        type: "ingreso",
        date: todayISO,
        client_id: clientDoc._id.toString(),
        driver_id: driver._id.toString(),
        cereal_type_id: "demo_cereal",
        silo_id: "demo_silo",
        chassis_plate: "ABC123",
        trailer_plate: "XYZ789",
        quantity: 25000,
        gross_weight: 0,
        tare_weight: 0,
        net_weight: 0,
        moisture: 0,
        impurities: 0,
        test_weight: 0,
        notes: "Operación esperando entrada",
        status: "autorizar_acceso",
        scheduled_date: today,
        estimated_duration: 60,
        company_id: company._id.toString(),
        createdAt: today,
        updatedAt: today,
        created_at: todayISO,
        updated_at: todayISO
      },
      {
        type: "egreso",
        date: todayISO,
        client_id: clientDoc._id.toString(),
        driver_id: driver._id.toString(),
        cereal_type_id: "demo_cereal",
        silo_id: "demo_silo",
        chassis_plate: "DEF456",
        trailer_plate: "UVW012",
        quantity: 30000,
        gross_weight: 0,
        tare_weight: 0,
        net_weight: 0,
        moisture: 0,
        impurities: 0,
        test_weight: 0,
        notes: "Operación esperando salida",
        status: "autorizar_egreso",
        scheduled_date: today,
        estimated_duration: 45,
        company_id: company._id.toString(),
        createdAt: today,
        updatedAt: today,
        created_at: todayISO,
        updated_at: todayISO
      },
      {
        type: "ingreso",
        date: todayISO,
        client_id: clientDoc._id.toString(),
        driver_id: driver._id.toString(),
        cereal_type_id: "demo_cereal",
        silo_id: "demo_silo",
        chassis_plate: "GHI789",
        trailer_plate: "RST345",
        quantity: 28000,
        gross_weight: 0,
        tare_weight: 0,
        net_weight: 0,
        moisture: 0,
        impurities: 0,
        test_weight: 0,
        notes: "Operación programada para hoy",
        status: "pendiente",
        scheduled_date: today,
        estimated_duration: 60,
        company_id: company._id.toString(),
        createdAt: today,
        updatedAt: today,
        created_at: todayISO,
        updated_at: todayISO
      }
    ];
    
    // Limpiar y crear operaciones
    await db.collection('operations').deleteMany({});
    const result = await db.collection('operations').insertMany(operations);
    
    console.log(`✅ ${result.insertedCount} operaciones creadas:`);
    operations.forEach((op, i) => {
      console.log(`   ${i+1}. ${op.chassis_plate} - ${op.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createOperations();
