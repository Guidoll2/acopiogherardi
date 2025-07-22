// Script temporal para inicializar current_stock en silos
const { MongoClient } = require('mongodb');

async function fixSiloStock() {
  // URL de conexión - ajustar según tu configuración
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/acopiogh';
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db();
    const silosCollection = db.collection('silos');
    
    console.log('🔍 Buscando silos sin current_stock inicializado...');
    
    // Buscar silos donde current_stock es null, undefined, o no existe
    const silosToFix = await silosCollection.find({
      $or: [
        { current_stock: { $exists: false } },
        { current_stock: null },
        { current_stock: { $type: "null" } }
      ]
    }).toArray();
    
    console.log(`📦 Encontrados ${silosToFix.length} silos para corregir`);
    
    if (silosToFix.length > 0) {
      // Actualizar todos los silos para que tengan current_stock = 0
      const result = await silosCollection.updateMany(
        {
          $or: [
            { current_stock: { $exists: false } },
            { current_stock: null },
            { current_stock: { $type: "null" } }
          ]
        },
        {
          $set: { 
            current_stock: 0,
            updated_at: new Date().toISOString()
          }
        }
      );
      
      console.log(`✅ Actualizados ${result.modifiedCount} silos con current_stock = 0`);
    }
    
    // Mostrar todos los silos después de la corrección
    const allSilos = await silosCollection.find({}).toArray();
    console.log('📦 Estado final de todos los silos:');
    allSilos.forEach(silo => {
      console.log(`  - ${silo.name}: capacity=${silo.capacity}, current_stock=${silo.current_stock}`);
    });
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixSiloStock();
}

module.exports = { fixSiloStock };
