const { MongoClient } = require('mongodb');

async function checkOperations() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('acopiogh');
    const operations = await db.collection('operations').find({}).toArray();
    
    console.log(`Total operations: ${operations.length}`);
    
    if (operations.length > 0) {
      console.log('\nSample operation:');
      console.log(JSON.stringify(operations[0], null, 2));
      
      console.log('\nAll statuses found:');
      const statuses = [...new Set(operations.map(op => op.status))];
      statuses.forEach(status => console.log(`- ${status}`));
      
      console.log('\nOperations by date:');
      const today = new Date().toDateString();
      operations.forEach(op => {
        const opDate = new Date(op.scheduled_date || op.date || op.createdAt).toDateString();
        console.log(`- ${op._id}: ${opDate} (${opDate === today ? 'TODAY' : 'OTHER'}) - Status: ${op.status}`);
      });
      
    } else {
      console.log('No operations found in database');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkOperations();
