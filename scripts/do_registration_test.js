const fs = require('fs')
const path = require('path')
const file = path.join(__dirname, 'test_registration.json')
const body = JSON.parse(fs.readFileSync(file, 'utf8'))

;(async () => {
  try {
    const res = await fetch('http://localhost:3001/api/company-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const text = await res.text()
    console.log('STATUS', res.status)
    console.log('BODY', text)
  } catch (err) {
    console.error('ERROR', err)
    process.exit(1)
  }
})()
