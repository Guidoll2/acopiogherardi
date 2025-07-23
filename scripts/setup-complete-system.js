// Script completo para configurar el sistema de garita

const { MongoClient } = require('mongodb');

async function setupCompleteSystem() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB');
    
    const db = client.db('acopiogh');
    
    // 1. Crear empresa si no existe
    let company = await db.collection('companies').findOne({});
    if (!company) {
      const newCompany = {
        name: "Acopio Demo",
        email: "admin@acopiodemo.com",
        phone: "341-1234567",
        address: "Ruta 9 Km 15, Rosario",
        cuit: "30-12345678-9",
        status: "active",
        subscription_plan: "premium",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const result = await db.collection('companies').insertOne(newCompany);
      company = { ...newCompany, _id: result.insertedId };
      console.log('✅ Empresa creada:', company.name);
    } else {
      console.log('✅ Empresa encontrada:', company.name);
    }
    
    // 2. Crear usuarios
    await db.collection('users').deleteMany({});
    
    const users = [
      {
        full_name: "Juan Administrador",
        email: "admin@demo.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGzZB8QNC", // 123456
        phone: "341-1111111",
        address: "Oficina Principal",
        role: "admin",
        is_active: true,
        company_id: company._id.toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        full_name: "Carlos Garita",
        email: "garita@demo.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGzZB8QNC", // 123456
        phone: "341-2222222",
        address: "Puesto de Garita",
        role: "garita",
        is_active: true,
        company_id: company._id.toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    await db.collection('users').insertMany(users);
    console.log('✅ Usuarios creados:');
    console.log('   📧 admin@demo.com (password: 123456) - Rol: admin');
    console.log('   📧 garita@demo.com (password: 123456) - Rol: garita');
    
    // 3. Crear clientes
    await db.collection('clients').deleteMany({});
    
    const clients = [
      {
        name: "Agro San Luis SRL",
        email: "ventas@agrosanluis.com",
        phone: "341-3333333",
        address: "Ruta 11 Km 8, San Luis",
        tax_id: "30-87654321-9",
        contact_person: "María González",
        status: "active",
        company_id: company._id.toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: "Cereales del Norte SA",
        email: "contacto@cerealesnorte.com",
        phone: "341-4444444",
        address: "Zona Rural Norte",
        tax_id: "30-11111111-9",
        contact_person: "Roberto Fernández",
        status: "active",
        company_id: company._id.toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const clientResult = await db.collection('clients').insertMany(clients);
    console.log(`✅ ${clientResult.insertedCount} clientes creados`);
    
    // 4. Crear conductores
    await db.collection('drivers').deleteMany({});
    
    const drivers = [
      {
        name: "Pedro Rodríguez",
        license_number: "12345678",
        phone: "341-5555555",
        email: "pedro.rodriguez@transporte.com",
        transportista: "Transportes El Rápido",
        license_expiry: "2026-12-31",
        is_active: true,
        status: "active",
        company_id: company._id.toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: "Luis Martínez",
        license_number: "87654321",
        phone: "341-6666666",
        email: "luis.martinez@logistica.com",
        transportista: "Logística Sur",
        license_expiry: "2025-06-30",
        is_active: true,
        status: "active",
        company_id: company._id.toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const driverResult = await db.collection('drivers').insertMany(drivers);
    console.log(`✅ ${driverResult.insertedCount} conductores creados`);
    
    // 5. Crear tipos de cereal
    await db.collection('cerealtypes').deleteMany({});
    
    const cerealTypes = [
      {
        name: "Soja",
        code: "SOJ",
        variety: "Don Mario 4.2",
        harvest_year: 2025,
        quality_grade: "A",
        price_per_ton: 350.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: "Maíz",
        code: "MAI",
        variety: "Pioneer 30F35",
        harvest_year: 2025,
        quality_grade: "A",
        price_per_ton: 280.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const cerealResult = await db.collection('cerealtypes').insertMany(cerealTypes);
    console.log(`✅ ${cerealResult.insertedCount} tipos de cereal creados`);
    
    // 6. Crear silos
    await db.collection('silos').deleteMany({});
    
    const silos = [
      {
        name: "Silo 1 - Soja",
        capacity: 500000,
        current_stock: 120000,
        cereal_type_id: cerealResult.insertedIds[0].toString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: "Silo 2 - Maíz",
        capacity: 750000,
        current_stock: 200000,
        cereal_type_id: cerealResult.insertedIds[1].toString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const siloResult = await db.collection('silos').insertMany(silos);
    console.log(`✅ ${siloResult.insertedCount} silos creados`);
    
    // 7. Crear operaciones para garita
    await db.collection('operations').deleteMany({});
    
    const today = new Date();
    const todayISO = today.toISOString();
    
    const operations = [
      {
        type: "ingreso",
        date: todayISO,
        client_id: clientResult.insertedIds[0].toString(),
        driver_id: driverResult.insertedIds[0].toString(),
        cereal_type_id: cerealResult.insertedIds[0].toString(),
        silo_id: siloResult.insertedIds[0].toString(),
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
        createdAt: today,
        updatedAt: today,
        created_at: todayISO,
        updated_at: todayISO
      },
      {
        type: "egreso",
        date: todayISO,
        client_id: clientResult.insertedIds[1].toString(),
        driver_id: driverResult.insertedIds[1].toString(),
        cereal_type_id: cerealResult.insertedIds[1].toString(),
        silo_id: siloResult.insertedIds[1].toString(),
        chassis_plate: "EE789FF",
        trailer_plate: "GG012HH",
        quantity: 30000,
        gross_weight: 0,
        tare_weight: 0,
        net_weight: 0,
        moisture: 0,
        impurities: 0,
        test_weight: 0,
        notes: "Carga de maíz - Esperando autorización de salida",
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
        client_id: clientResult.insertedIds[0].toString(),
        driver_id: driverResult.insertedIds[0].toString(),
        cereal_type_id: cerealResult.insertedIds[0].toString(),
        silo_id: siloResult.insertedIds[0].toString(),
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
        createdAt: today,
        updatedAt: today,
        created_at: todayISO,
        updated_at: todayISO
      }
    ];
    
    const operationResult = await db.collection('operations').insertMany(operations);
    console.log(`✅ ${operationResult.insertedCount} operaciones creadas para garita:`);
    operations.forEach((op, i) => {
      console.log(`   ${i+1}. ${op.chassis_plate} - ${op.status} (${op.type})`);
    });
    
    console.log('\n🎯 Sistema configurado correctamente!');
    console.log('📧 Puedes iniciar sesión con:');
    console.log('   - Admin: admin@demo.com / 123456');
    console.log('   - Garita: garita@demo.com / 123456');
    console.log('🚛 Hay operaciones esperando en garita');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

setupCompleteSystem();
