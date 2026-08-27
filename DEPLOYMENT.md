# Deployment

## Supabase
1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Confirm the business profile row exists.

## Cloudflare
1. Create a Worker.
2. In `worker/`, run `npm install`.
3. Run `npx wrangler login`.
4. Set:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - ADMIN_TOKEN
   - RESEND_API_KEY (optional)
   - WHATSAPP_ACCESS_TOKEN (optional)
   - WHATSAPP_VERIFY_TOKEN (optional)
5. Deploy with `npx wrangler deploy`.

## Vercel
1. Import the repository.
2. Set `NEXT_PUBLIC_API_URL` to your Worker URL.
3. Deploy.

## Voice test
1. Open the website over HTTPS.
2. Open Ask JP AI.
3. Tap Send voice.
4. Allow microphone permission.
5. Speak.
6. Tap Stop voice.
7. The Worker transcribes, answers, generates audio and the browser plays the response.

## WhatsApp
1. Create/configure a WhatsApp Cloud API app in Meta.
2. Set webhook:
   `https://YOUR-WORKER.workers.dev/api/whatsapp/webhook`
3. Use the same verification token as `WHATSAPP_VERIFY_TOKEN`.
4. Subscribe to messages.
5. Add the phone number ID and access token to Worker secrets.
6. Send a text message to your WhatsApp number.
7. Send a voice note.
8. Confirm the AI responds.

## Production hardening before public scale
- Supabase Auth for dashboard
- Cloudflare Turnstile
- Durable rate limiting
- Meta webhook signature verification
- tenant/business IDs if making this SaaS
- encrypted/controlled audio retention
- monitoring and alerts
- automated tests
