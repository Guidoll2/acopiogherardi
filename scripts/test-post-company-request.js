import fetch from 'node-fetch'

async function main() {
  const url = 'http://localhost:3000/api/company-requests'
  const payload = {
    company_name: 'Test 19 10',
    email: 'guido.llaurado@gmail.com',
    phone: '+542226524466',
    address: 'qwqe',
    cuit: '1231253513123',
    contact_person: 'Guido Llaurado',
    contact_phone: ''
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    console.log('Status:', res.status)
    const text = await res.text()
    try {
      console.log('Response JSON:', JSON.parse(text))
    } catch (e) {
      console.log('Response text:', text)
    }
  } catch (err) {
    console.error('Request error:', err)
  }
}

main()
