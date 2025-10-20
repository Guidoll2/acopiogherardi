(async () => {
  try {
    const fs = await import('fs')
    const path = './.env.local'
    let env = {}
    if (fs.existsSync(path)) {
      const txt = fs.readFileSync(path,'utf8')
      txt.split(/\r?\n/).forEach(l => {
        const m = l.match(/^\s*([A-Z0-9_]+)=(.*)$/)
        if (m) env[m[1]] = m[2]
      })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY || env.RESEND_API_KEY
    const EMAIL_FROM = process.env.EMAIL_FROM || env.EMAIL_FROM || 'no-reply@acopiogh.com'
    const to = 'guido.llaurado@gmail.com'

    if (!RESEND_API_KEY) {
      console.log('No RESEND_API_KEY configured, aborting test')
      process.exit(1)
    }

    const { Resend } = await import('resend')
    const resend = new Resend(RESEND_API_KEY)

    console.log('Using RESEND_API_KEY length', RESEND_API_KEY.length, 'from', EMAIL_FROM)

    const html = `<p>Test de envío desde Resend - ${new Date().toISOString()}</p>`

    try {
      const result = await resend.emails.send({
        from: EMAIL_FROM,
        to: [to],
        subject: 'Prueba de envío Resend',
        html
      })
      console.log('Send result:', result)
    } catch (err) {
      console.error('Error from resend SDK:', err)
      if (err && err.response) {
        try { const body = await err.response.text(); console.error('Response body:', body) } catch(e){}
      }
    }
  } catch (e) {
    console.error('Unexpected error running test-send:', e)
  }
})()
