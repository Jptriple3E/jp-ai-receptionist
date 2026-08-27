# JP AI Receptionist V2 — Text + Voice + WhatsApp

Personal AI receptionist for Eboh Emmanuel Emeke / JP Digital AI.

## Stack

- Next.js frontend -> Vercel
- Cloudflare Worker + Workers AI -> API, AI, speech-to-text, text-to-speech
- Supabase -> visitors, conversations, messages, leads, business knowledge
- WhatsApp Cloud API -> optional text + voice channel
- Resend -> optional lead email alerts

## Current AI behavior

The assistant automatically handles:
1. Normal conversation
2. Business questions
3. Lead qualification
4. Human handoff

It uses the same conversation record for text and voice.

## Your configured business identity

Name: Eboh Emmanuel Emeke
Role: Website Designer & Developer
Service: Modern SaaS business websites
Pricing: Custom
WhatsApp: +2349030123407
Email: jpdigitalai@gmail.com
Location: Delta State, Nigeria
Portfolio: https://saas-web-portfolio-1r1h.vercel.app/#contact

## Models

Text AI is configurable with `CHAT_MODEL` in `worker/src/config.ts`.

Website voice:
- STT: @cf/openai/whisper-large-v3-turbo for uploaded/recorded audio
- TTS: @cf/deepgram/aura-2-en

Cloudflare also provides a real-time voice-agent stack using Flux/WebSockets/Durable Objects. This V2 uses normal HTTP recording first because it is easier to deploy and test. A real-time WebSocket voice mode can be added later without replacing the core AI/database.

## Setup

### 1. Supabase

Create a project and run `supabase/schema.sql`.

Do NOT expose a Supabase secret/service key in the frontend.

### 2. Cloudflare Worker

From `worker/`:

```bash
npm install
npx wrangler login
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put WHATSAPP_ACCESS_TOKEN
npx wrangler secret put WHATSAPP_VERIFY_TOKEN
npx wrangler deploy
```

Only the secrets you use are required.

### 3. Vercel

Set:

```text
NEXT_PUBLIC_API_URL=https://YOUR-WORKER.workers.dev
```

Deploy `web/`.

### 4. Test text

Open the website -> Ask JP AI -> send a message.

### 5. Test website voice

Open the website -> Ask JP AI -> tap microphone -> allow microphone permission -> speak -> Stop -> Send voice.

The Worker transcribes the recording, runs the same AI conversation, generates speech and returns an audio file.

### 6. Dashboard

Open:

```text
https://YOUR-VERCEL-DOMAIN/dashboard
```

Enter the `ADMIN_TOKEN`.

## WhatsApp

Configure a Meta WhatsApp Cloud API app.

Webhook:

```text
https://YOUR-WORKER.workers.dev/api/whatsapp/webhook
```

The GET route handles Meta webhook verification.

The POST route handles inbound text messages. The voice-media route is prepared for WhatsApp audio media: it downloads the media through Graph API, transcribes it, runs the AI, generates TTS and sends an audio response.

You must provide:
- WHATSAPP_ACCESS_TOKEN
- WHATSAPP_VERIFY_TOKEN
- WHATSAPP_PHONE_NUMBER_ID
- WHATSAPP_GRAPH_VERSION

For outbound messages outside WhatsApp's permitted customer-service window, use approved WhatsApp templates as required by Meta.

## Security

This is a strong V2 foundation, but before turning it into a multi-tenant SaaS:
- replace the dashboard bearer token with Supabase Auth
- add tenant/business IDs
- add Cloudflare Turnstile
- add durable rate limiting
- verify Meta webhook signatures
- add automated tests
- add structured logging
- add backups

## Important

Never commit `.env`, `.dev.vars`, access tokens or Supabase secret keys.
