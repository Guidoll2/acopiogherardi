import { MongoClient, ObjectId } from 'mongodb'
import fs from 'fs'

function readEnv(){const p='./.env.local'; if(!fs.existsSync(p)) return {}; const t=fs.readFileSync(p,'utf8'); const o={}; t.split(/\r?\n/).forEach(l=>{const m=l.match(/^\s*([A-Z0-9_]+)=(.*)$/); if(m) o[m[1]]=m[2]}); return o}

async function main(){
  const env=readEnv()
  const uri=process.env.MONGODB_URI||env.MONGODB_URI||'mongodb://localhost:27017'
  const dbName=process.env.MONGODB_DB||env.MONGODB_DB||'grain_management'
  const id='68f4cdead381513c7f171bc5'
  const client=new MongoClient(uri)
  try{
    await client.connect()
    const db=client.db(dbName)
    const company = await db.collection('companies').findOne({_id: new ObjectId(id)})
    if(!company){ console.log('company not found'); return }
    console.log('archiving company', company._id, company.email)
    await db.collection('deletedcompanies').insertOne({ original_id: company._id.toString(), snapshot: company, deleted_by: 'script', reason: 'admin-delete-script', deleted_at: new Date().toISOString() })
    const users = await db.collection('users').find({ company_id: company.id }).toArray()
    if(users.length>0){ const ru = await db.collection('users').deleteMany({ company_id: company.id }); console.log('deleted users', ru.deletedCount) }
    const rc = await db.collection('clients').deleteMany({ company_id: company.id })
    const rd = await db.collection('drivers').deleteMany({ company_id: company.id })
    await db.collection('companies').deleteOne({ _id: company._id })
    console.log('deleted company and refs, clients:', rc.deletedCount, 'drivers:', rd.deletedCount)
  }catch(e){console.error(e)}finally{await client.close()}
}

main()
