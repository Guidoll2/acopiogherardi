// Script final para configurar el sistema completo con las nuevas funcionalidades de garita

const { MongoClient } = require('mongodb');

async function setupFinalSystem() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB');
    
    const db = client.db('acopiogh');
    
    // 1. Limpiar operaciones existentes para recrear con nuevos campos
    await db.collection('operations').deleteMany({});
    console.log('🗑️ Operaciones anteriores eliminadas');
    
    // 2. Obtener datos existentes
    const company = await db.collection('companies').findOne({});
    const clients = await db.collection('clients').find({}).toArray();
    const drivers = await db.collection('drivers').find({}).toArray();
    const cereals = await db.collection('cerealtypes').find({}).toArray();
    const silos = await db.collection('silos').find({}).toArray();
    
    if (!company || clients.length === 0 || drivers.length === 0) {
      console.log('❌ Faltan datos base. Ejecuta primero setup-complete-system.js');
      return;
    }
    
    console.log('✅ Datos base encontrados:', {
      empresa: company.name,
      clientes: clients.length,
      conductores: drivers.length,
      cereales: cereals.length,
      silos: silos.length
    });
    
    const today = new Date();
    const todayISO = today.toISOString();
    
    // 3. Crear operaciones con diferentes estados y autorizaciones
    const operations = [
      {
        type: "ingreso",
        date: todayISO,
        client_id: clients[0]._id.toString(),
        driver_id: drivers[0]._id.toString(),
        cereal_type_id: cereals[0]?._id.toString() || "",
        silo_id: silos[0]?._id.toString() || "",
        chassis_plate: "AA123BB",
        trailer_plate: "CC456DD",
        quantity: 25000,
        gross_weight: 0,
        tare_weight: 0,
        net_weight: 0,
        moisture: 0,
        impurities: 0,
        test_weight: 0,
        notes: "Descarga de soja - Esperando autorización de entrada",
        status: "autorizar_acceso",
        scheduled_date: today,
        estimated_duration: 60,
        company_id: company._id.toString(),
        created_from_garita: false,
        createdAt: today,
        updatedAt: today,
        created_at: todayISO,
        updated_at: todayISO
      },
      {
        type: "egreso",
        date: todayISO,
        client_id: clients[0]._id.toString(),
        driver_id: drivers[0]._id.toString(),
        cereal_type_id: cereals[0]?._id.toString() || "",
        silo_id: silos[0]?._id.toString() || "",
        chassis_plate: "EE789FF",
        trailer_plate: "GG012HH",
        quantity: 30000,
        gross_weight: 35000,
        tare_weight: 8000,
        net_weight: 27000,
        moisture: 14.5,
        impurities: 2.1,
        test_weight: 76.8,
        notes: "Carga de maíz completada - Esperando autorización de salida",
        status: "autorizar_egreso",
        scheduled_date: today,
        estimated_duration: 45,
        company_id: company._id.toString(),
        created_from_garita: false,
        // Simular que ya tuvo entrada autorizada
        authorized_entry: {
          timestamp: new Date(Date.now() - 3600000).toISOString(), // Hace 1 hora
          authorized_by: "Carlos Garita",
          notes: "Ingreso autorizado desde garita"
        },
        createdAt: today,
        updatedAt: today,
        created_at: todayISO,
        updated_at: todayISO
      },
      {
        type: "ingreso",
        date: todayISO,
        client_id: clients[0]._id.toString(),
        driver_id: drivers[0]._id.toString(),
        cereal_type_id: cereals[0]?._id.toString() || "",
        silo_id: silos[0]?._id.toString() || "",
        chassis_plate: "II345JJ",
        trailer_plate: "KK678LL",
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
        created_from_garita: false,
        createdAt: today,
        updatedAt: today,
        created_at: todayISO,
        updated_at: todayISO
      },
      {
        type: "ingreso",
        date: todayISO,
        client_id: clients[0]._id.toString(),
        driver_id: drivers[0]._id.toString(),
        cereal_type_id: "", // Campo vacío - creado desde garita
        silo_id: "", // Campo vacío - creado desde garita
        chassis_plate: "MM999NN",
        trailer_plate: "PP111QQ",
        quantity: 0, // Pendiente de definir
        gross_weight: 0,
        tare_weight: 0,
        net_weight: 0,
        moisture: 0,
        impurities: 0,
        test_weight: 0,
        notes: "Llegada espontánea - Cereal y silo por definir (Creado desde garita)",
        status: "autorizar_acceso",
        scheduled_date: today,
        estimated_duration: 60,
        company_id: company._id.toString(),
        created_from_garita: true, // Marcado como creado desde garita
        createdAt: today,
        updatedAt: today,
        created_at: todayISO,
        updated_at: todayISO
      }
    ];
    
    const operationResult = await db.collection('operations').insertMany(operations);
    console.log(`✅ ${operationResult.insertedCount} operaciones creadas:`);
    operations.forEach((op, i) => {
      const type = op.created_from_garita ? " (Espontáneo)" : "";
      console.log(`   ${i+1}. ${op.chassis_plate} - ${op.status}${type}`);
    });
    
    console.log('\n🎯 Sistema configurado con nuevas funcionalidades!');
    console.log('📧 Login: garita@demo.com / 123456');
    console.log('✨ Nuevas funcionalidades disponibles:');
    console.log('   🚛 Registro de autorizaciones de entrada/salida');
    console.log('   ➕ Creación de ingresos espontáneos');
    console.log('   📋 Visualización de autorizaciones en la tabla');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

setupFinalSystem();
