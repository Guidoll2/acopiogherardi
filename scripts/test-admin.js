console.log('Script iniciando...');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectionString = 'mongodb+srv://guidoll:Ellesar33.@emplearg.mongocluster.cosmos.azure.com/acopiogh?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000';

async function test() {
  console.log('Intentando conectar...');
  
  try {
    await mongoose.connect(connectionString);
    console.log('✅ Conectado a MongoDB');
    
    // Verificar si existe la colección de usuarios
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Colecciones disponibles:', collections.map(c => c.name));
    
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);
    
    // Buscar todos los usuarios
    const users = await User.find({});
    console.log(`Usuarios encontrados: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.role}`);
    });
    
    // Buscar el usuario específico
    const targetUser = await User.findOne({ email: 'ignacio.gherardi@gmail.com' });
    
    if (targetUser) {
      console.log('✅ Usuario encontrado:', targetUser.email);
      
      // Actualizar contraseña
      const hashedPassword = await bcrypt.hash('Caprichoso', 12);
      targetUser.password = hashedPassword;
      targetUser.role = 'system_admin';
      targetUser.is_active = true;
      await targetUser.save();
      
      console.log('✅ Usuario actualizado');
    } else {
      console.log('❌ Usuario no encontrado, creando...');
      
      const hashedPassword = await bcrypt.hash('Caprichoso', 12);
      const newUser = new User({
        email: 'ignacio.gherardi@gmail.com',
        password: hashedPassword,
        full_name: 'Ignacio Gherardi',
        phone: '+54 11 1234-5678',
        role: 'system_admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      await newUser.save();
      console.log('✅ Usuario creado');
    }
    
    // Verificación final
    const finalUser = await User.findOne({ email: 'ignacio.gherardi@gmail.com' });
    console.log('\n=== VERIFICACIÓN FINAL ===');
    console.log('Email:', finalUser.email);
    console.log('Rol:', finalUser.role);
    console.log('Activo:', finalUser.is_active);
    
    const passwordCheck = await bcrypt.compare('Caprichoso', finalUser.password);
    console.log('Contraseña correcta:', passwordCheck ? '✅ SÍ' : '❌ NO');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

test();
