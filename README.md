# Mini Invitation Flow

Simple mobile-friendly invitation flow with an interactive "NU" button that flees the cursor, and a Node.js/Express endpoint to send SMS via Twilio.

Getting started

1. Copy `.env.example` to `.env` and fill your Twilio credentials and your phone number.

2. Install dependencies and run:

```bash
npm install
npm start
```

3. Open `http://localhost:3000` in your browser (mobile friendly).

Configuration

- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` - Twilio API credentials
- `TWILIO_FROM_NUMBER` - Twilio phone number (must be a valid Twilio sender)
- `TO_NUMBER` - Your phone number (destination)

Notes

- The frontend auto-POSTs to `/send-sms` after finalizing; server will send SMS using Twilio.
- For local development without Twilio, the server will return an error; you can mock or provide credentials.
