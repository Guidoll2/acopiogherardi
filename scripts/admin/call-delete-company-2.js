import fetch from 'node-fetch'

async function main(){
  const id='68f4cdead381513c7f171bc5'
  const url=`http://localhost:3000/api/companies/${id}?force=true`
  try{
    const res=await fetch(url,{ method:'DELETE'})
    console.log('status', res.status)
    const j=await res.json()
    console.log('body', JSON.stringify(j,null,2))
  }catch(e){console.error('err',e)}
}

main()
