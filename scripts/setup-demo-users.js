const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function setupUsers() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('acopiogh');
    
    // Buscar o crear una empresa
    let company = await db.collection('companies').findOne({});
    if (!company) {
      const newCompany = {
        name: "Empresa Demo",
        email: "demo@empresa.com",
        phone: "123456789",
        address: "Dirección Demo",
        cuit: "20-12345678-9",
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
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    // Crear usuario admin
    const adminUser = {
      full_name: "Admin Demo",
      email: "admin@demo.com",
      password: hashedPassword,
      phone: "123456789",
      address: "Oficina Principal",
      role: "admin",
      is_active: true,
      company_id: company._id.toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Crear usuario de garita
    const garitaUser = {
      full_name: "Operador Garita",
      email: "garita@demo.com",
      password: hashedPassword,
      phone: "123456789",
      address: "Garita Principal",
      role: "garita",
      is_active: true,
      company_id: company._id.toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Limpiar usuarios existentes
    await db.collection('users').deleteMany({});
    console.log('🗑️ Usuarios anteriores eliminados');
    
    // Insertar usuarios
    await db.collection('users').insertMany([adminUser, garitaUser]);
    console.log('✅ Usuarios creados:');
    console.log('   - Admin: admin@demo.com (password: 123456)');
    console.log('   - Garita: garita@demo.com (password: 123456)');
    
    // Crear datos base si no existen
    const clientsCount = await db.collection('clients').countDocuments();
    if (clientsCount === 0) {
      const sampleClient = {
        name: "Cliente Demo",
        email: "cliente@demo.com",
        phone: "123456789",
        address: "Dirección Cliente",
        tax_id: "20-87654321-9",
        contact_person: "Juan Pérez",
        status: "active",
        company_id: company._id.toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await db.collection('clients').insertOne(sampleClient);
      console.log('✅ Cliente demo creado');
    }
    
    const driversCount = await db.collection('drivers').countDocuments();
    if (driversCount === 0) {
      const sampleDriver = {
        name: "Conductor Demo",
        license_number: "123456789",
        phone: "123456789",
        email: "conductor@demo.com",
        transportista: "Transporte Demo",
        license_expiry: "2026-12-31",
        is_active: true,
        status: "active",
        company_id: company._id.toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await db.collection('drivers').insertOne(sampleDriver);
      console.log('✅ Conductor demo creado');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

setupUsers();
