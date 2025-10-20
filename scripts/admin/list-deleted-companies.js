import { MongoClient } from 'mongodb'
import fs from 'fs'

function readEnvLocal(){
  const p='./.env.local'
  if(!fs.existsSync(p)) return {}
  const txt=fs.readFileSync(p,'utf8')
  const out={}
  txt.split(/\r?\n/).forEach(l=>{const m=l.match(/^\s*([A-Z0-9_]+)=(.*)$/); if(m) out[m[1]]=m[2]})
  return out
}

async function main(){
  const env=readEnvLocal()
  const uri=process.env.MONGODB_URI||env.MONGODB_URI||'mongodb://localhost:27017'
  const dbName=process.env.MONGODB_DB||env.MONGODB_DB||'grain_management'
  const client=new MongoClient(uri)
  try{
    await client.connect()
    const db=client.db(dbName)
    const cols=await db.listCollections({name:'deletedcompanies'}).toArray()
    const alt=await db.listCollections({name:'deletedcompanies'}).toArray()
    const names=(await db.listCollections().toArray()).map(c=>c.name)
    console.log('Collections in DB:', names.join(', '))
    const found=await db.collection('deletedcompanies').find({}).limit(20).toArray().catch(()=>[])
    console.log('deletedcompanies count:', found.length)
    if(found.length>0) console.log(JSON.stringify(found[0],null,2))
  }catch(e){console.error(e)}finally{await client.close()}
}

main()
