export interface Env {
  AI: Ai;

  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;

  WHATSAPP_ACCESS_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  WHATSAPP_VERIFY_TOKEN?: string;

  RESEND_API_KEY?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message?: string;
  history?: ChatMessage[];
  visitorId?: string;
}

export interface Lead {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
  created_at?: string;
}
