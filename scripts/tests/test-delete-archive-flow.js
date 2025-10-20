import { MongoClient } from 'mongodb'
import fs from 'fs'

function readEnv(){const p='./.env.local'; if(!fs.existsSync(p)) return {}; const t=fs.readFileSync(p,'utf8'); const o={}; t.split(/\r?\n/).forEach(l=>{const m=l.match(/^\s*([A-Z0-9_]+)=(.*)$/); if(m) o[m[1]]=m[2]}); return o}

async function main(){
  const env=readEnv()
  const uri=process.env.MONGODB_URI||env.MONGODB_URI||'mongodb://localhost:27017'
  const dbName=process.env.MONGODB_DB||env.MONGODB_DB||'grain_management'
  const client=new MongoClient(uri)
  try{
    await client.connect()
    const db=client.db(dbName)

    // Create company
    const now = new Date().toISOString()
    const compId = `test_comp_${Date.now()}`
    const newCompany = {
      id: compId,
      name: 'TEST COMPANY FOR DELETE FLOW',
      email: `test-delete-${Date.now()}@example.com`,
      phone: '+100000000',
      address: 'Test address',
      cuit: `TESTCUIT${Date.now()}`,
      status: 'active',
      subscription_plan: 'free',
      operations_count_current_month: 0,
      operations_limit: 50,
      billing_cycle_start: now,
      billing_cycle_end: now,
      subscription_status: 'active',
      created_at: now,
      updated_at: now
    }

    const ins = await db.collection('companies').insertOne(newCompany)
    console.log('Inserted company id:', ins.insertedId.toString())

    // Create user associated
    const newUser = {
      id: `test_user_${Date.now()}`,
      email: newCompany.email,
      full_name: 'Test User',
      role: 'company_admin',
      is_active: true,
      company_id: compId,
      password: 'x'
    }
    await db.collection('users').insertOne(newUser)
    console.log('Inserted test user')

    // Now simulate archive+delete (using same logic as endpoint)
    const company = await db.collection('companies').findOne({ id: compId })
    if(!company) throw new Error('company not found')

    await db.collection('deletedcompanies').insertOne({ original_id: company._id.toString(), snapshot: company, deleted_by: 'test-script', reason: 'test-delete', deleted_at: new Date().toISOString() })
    console.log('Archived company in deletedcompanies')

    const delUsers = await db.collection('users').deleteMany({ company_id: compId })
    const delClients = await db.collection('clients').deleteMany({ company_id: compId })
    const delDrivers = await db.collection('drivers').deleteMany({ company_id: compId })
    const delComp = await db.collection('companies').deleteOne({ id: compId })

    console.log('Deleted counts:', { users: delUsers.deletedCount, clients: delClients.deletedCount, drivers: delDrivers.deletedCount, company: delComp.deletedCount })

    // Validate
    const archived = await db.collection('deletedcompanies').findOne({ original_id: company._id.toString() })
    if(!archived) throw new Error('Archive not found')
    console.log('Archive exists. Test passed.')

  }catch(e){
    console.error('Test failed:', e)
    process.exit(1)
  }finally{
    await client.close()
  }
}

main()
