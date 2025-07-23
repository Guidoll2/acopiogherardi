const { MongoClient } = require('mongodb');

async function createGaritaUser() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('acopiogh');
    
    // Buscar una empresa existente
    const company = await db.collection('companies').findOne({});
    if (!company) {
      console.log('❌ No hay empresas en la base de datos');
      return;
    }
    
    console.log(`📊 Usando empresa: ${company.name} (${company._id})`);
    
    // Verificar si ya existe un usuario de garita
    const existingGarita = await db.collection('users').findOne({ role: 'garita' });
    if (existingGarita) {
      console.log(`✅ Usuario de garita ya existe: ${existingGarita.email}`);
      return;
    }
    
    // Crear usuario de garita
    const garitaUser = {
      full_name: "Operador Garita",
      email: "garita@test.com",
      password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGzZB8QNC", // password: "123456"
      phone: "123456789",
      address: "Garita Principal",
      role: "garita",
      is_active: true,
      company_id: company._id.toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const result = await db.collection('users').insertOne(garitaUser);
    console.log(`✅ Usuario de garita creado: ${garitaUser.email} (password: 123456)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createGaritaUser();
