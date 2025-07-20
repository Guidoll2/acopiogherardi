const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const connectionString = 'mongodb+srv://guidoll:Ellesar33.@emplearg.mongocluster.cosmos.azure.com/acopiogh?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000';
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db();
    const users = db.collection('users');
    
    // Verificar si ya existe el usuario
    const existingUser = await users.findOne({ email: 'ignacio.gherardi@gmail.com' });
    
    if (existingUser) {
      console.log('🔄 Usuario existe, actualizando contraseña...');
      const hashedPassword = await bcrypt.hash('Caprichoso', 12);
      
      await users.updateOne(
        { email: 'ignacio.gherardi@gmail.com' },
        { 
          $set: { 
            password: hashedPassword,
            role: 'system_admin',
            is_active: true,
            updated_at: new Date().toISOString()
          }
        }
      );
      console.log('✅ Usuario actualizado');
    } else {
      console.log('🆕 Creando nuevo usuario...');
      const hashedPassword = await bcrypt.hash('Caprichoso', 12);
      
      const newUser = {
        email: 'ignacio.gherardi@gmail.com',
        password: hashedPassword,
        full_name: 'Ignacio Gherardi',
        phone: '+54 11 1234-5678',
        role: 'system_admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await users.insertOne(newUser);
      console.log('✅ Usuario creado');
    }
    
    // Verificar el resultado
    const finalUser = await users.findOne({ email: 'ignacio.gherardi@gmail.com' });
    console.log('\n📋 DATOS FINALES:');
    console.log('Email:', finalUser.email);
    console.log('Nombre:', finalUser.full_name);
    console.log('Rol:', finalUser.role);
    console.log('Activo:', finalUser.is_active);
    
    // Verificar contraseña
    const passwordCheck = await bcrypt.compare('Caprichoso', finalUser.password);
    console.log('Contraseña válida:', passwordCheck ? '✅ SÍ' : '❌ NO');
    
    console.log('\n🎉 ¡LISTO! Puedes usar:');
    console.log('Email: ignacio.gherardi@gmail.com');
    console.log('Contraseña: Caprichoso');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

createAdmin();
