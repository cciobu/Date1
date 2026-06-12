const Twilio = require('twilio')

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' })
    const details = req.body && req.body.details ? req.body.details : {}

    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
    const MESSAGING_SERVICE_SID = process.env.MESSAGING_SERVICE_SID
    const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER
    const TO_NUMBER = process.env.TO_NUMBER

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return res.status(500).json({ ok: false, error: 'Twilio credentials not configured' })
    }

    const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    const text = `Invitație: data ${details.date || '—'}${details.time ? ' ora ' + details.time : ''}, activitate: ${details.activity || '—'}, loc: ${details.place || '—'}`

    const payload = { body: text }
    if (TO_NUMBER) payload.to = TO_NUMBER
    if (MESSAGING_SERVICE_SID) payload.messagingServiceSid = MESSAGING_SERVICE_SID
    else if (TWILIO_FROM) payload.from = TWILIO_FROM
    else return res.status(500).json({ ok: false, error: 'Missing sender configuration' })

    const message = await client.messages.create(payload)
    return res.status(200).json({ ok: true, sid: message.sid })
  } catch (err) {
    console.error('Vercel API error', err)
    return res.status(500).json({ ok: false, error: err.message })
  }
}
