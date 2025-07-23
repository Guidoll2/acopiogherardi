const { MongoClient, ObjectId } = require('mongodb');

async function createTestOperations() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('acopiogh');
    
    // Obtener datos existentes para referenciar
    const companies = await db.collection('companies').find({}).toArray();
    const clients = await db.collection('clients').find({}).toArray();
    const drivers = await db.collection('drivers').find({}).toArray();
    const cereals = await db.collection('cerealtypes').find({}).toArray();
    const silos = await db.collection('silos').find({}).toArray();
    
    console.log(`Found: ${companies.length} companies, ${clients.length} clients, ${drivers.length} drivers, ${cereals.length} cereals, ${silos.length} silos`);
    
    if (companies.length === 0 || clients.length === 0 || drivers.length === 0) {
      console.log('❌ No hay datos base suficientes. Asegúrate de tener al menos una empresa, cliente y conductor.');
      return;
    }
    
    const today = new Date();
    const todayString = today.toISOString();
    
    // Crear operaciones de prueba
    const testOperations = [
      {
        type: "ingreso",
        date: todayString,
        client_id: clients[0]._id.toString(),
        driver_id: drivers[0]._id.toString(),
        cereal_type_id: cereals[0]?._id.toString() || "test_cereal",
        silo_id: silos[0]?._id.toString() || "test_silo",
        chassis_plate: "ABC123",
        trailer_plate: "XYZ789",
        quantity: 25000,
        gross_weight: 0,
        tare_weight: 0,
        net_weight: 0,
        moisture: 0,
        impurities: 0,
        test_weight: 0,
        notes: "Operación de prueba para garita",
        status: "autorizar_acceso", // Estado para que aparezca en garita
        scheduled_date: today,
        estimated_duration: 60,
        company_id: companies[0]._id.toString(),
        createdAt: today,
        updatedAt: today,
        created_at: todayString,
        updated_at: todayString
      },
      {
        type: "egreso",
        date: todayString,
        client_id: clients[0]._id.toString(),
        driver_id: drivers[0]._id.toString(),
        cereal_type_id: cereals[0]?._id.toString() || "test_cereal",
        silo_id: silos[0]?._id.toString() || "test_silo",
        chassis_plate: "DEF456",
        trailer_plate: "UVW012",
        quantity: 30000,
        gross_weight: 0,
        tare_weight: 0,
        net_weight: 0,
        moisture: 0,
        impurities: 0,
        test_weight: 0,
        notes: "Operación de prueba para salida",
        status: "autorizar_egreso", // Estado para que aparezca en garita
        scheduled_date: today,
        estimated_duration: 45,
        company_id: companies[0]._id.toString(),
        createdAt: today,
        updatedAt: today,
        created_at: todayString,
        updated_at: todayString
      },
      {
        type: "ingreso",
        date: todayString,
        client_id: clients[0]._id.toString(),
        driver_id: drivers[0]._id.toString(),
        cereal_type_id: cereals[0]?._id.toString() || "test_cereal",
        silo_id: silos[0]?._id.toString() || "test_silo",
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
        status: "pendiente", // Estado programado
        scheduled_date: today,
        estimated_duration: 60,
        company_id: companies[0]._id.toString(),
        createdAt: today,
        updatedAt: today,
        created_at: todayString,
        updated_at: todayString
      }
    ];
    
    // Limpiar operaciones existentes
    const deleteResult = await db.collection('operations').deleteMany({});
    console.log(`🗑️ Eliminadas ${deleteResult.deletedCount} operaciones anteriores`);
    
    // Insertar nuevas operaciones
    const result = await db.collection('operations').insertMany(testOperations);
    console.log(`✅ Creadas ${result.insertedCount} operaciones de prueba`);
    
    // Verificar operaciones creadas
    const operations = await db.collection('operations').find({}).toArray();
    console.log('\n📋 Operaciones creadas:');
    operations.forEach(op => {
      console.log(`- ${op._id}: ${op.chassis_plate} - Status: ${op.status} - Fecha: ${new Date(op.scheduled_date).toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createTestOperations();
