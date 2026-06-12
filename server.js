require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.static('.'))

const PORT = process.env.PORT || 3000

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER
// Destination phone number (can be configured via .env)
const TO_NUMBER = process.env.TO_NUMBER || '+37367475611'
const MESSAGING_SERVICE_SID = process.env.MESSAGING_SERVICE_SID

let twilioClient = null
if(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN){
  const Twilio = require('twilio')
  twilioClient = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
}

app.post('/send-sms', async (req, res) => {
  const details = req.body.details || {}
  const to = req.body.to || TO_NUMBER
  const text = `Invitație: data ${details.date || '—'}${details.time ? ' ora ' + details.time : ''}, activitate: ${details.activity || '—'}, loc: ${details.place || '—'}`
  if(!twilioClient){
    return res.status(500).json({ok:false, error:'Twilio not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.'})
  }
  if (!to || (!TWILIO_FROM && !MESSAGING_SERVICE_SID)) {
    return res.status(400).json({ ok: false, error: 'Missing phone configuration (TO_NUMBER or TWILIO_FROM_NUMBER or MESSAGING_SERVICE_SID).' })
  }
  try{
    const payload = {
      body: text,
      to
    }
    if (MESSAGING_SERVICE_SID) payload.messagingServiceSid = MESSAGING_SERVICE_SID
    else payload.from = TWILIO_FROM

    const message = await twilioClient.messages.create(payload)
    res.json({ok:true, sid: message.sid})
  }catch(err){
    console.error(err)
    res.status(500).json({ok:false, error: err.message})
  }
})

app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}`))
