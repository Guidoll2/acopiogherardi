import { MongoClient } from 'mongodb'
import fs from 'fs'

function env(){const p='./.env.local'; if(!fs.existsSync(p)) return {}; const t=fs.readFileSync(p,'utf8'); const o={}; t.split(/\r?\n/).forEach(l=>{const m=l.match(/^\s*([A-Z0-9_]+)=(.*)$/); if(m) o[m[1]]=m[2]}); return o}

async function main(){
  const e=env(); const uri=process.env.MONGODB_URI||e.MONGODB_URI||'mongodb://localhost:27017'; const dbName=process.env.MONGODB_DB||e.MONGODB_DB||'grain_management'
  const c=new MongoClient(uri); await c.connect(); const db=c.db(dbName);
  const list=await db.collection('companies').find({}).limit(50).toArray()
  console.log('Found', list.length, 'companies')
  list.forEach(c=>console.log(c._id, c.id || c.name, c.email))
  await c.close()
}

main()
