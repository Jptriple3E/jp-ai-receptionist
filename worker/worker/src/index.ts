interface Env {
  OPENAI_API_KEY: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message?: string;
  history?: ChatMessage[];
}

const ALLOWED_ORIGINS = [
  "https://jp-ai-receptionist-vi39.vercel.app",
];

const SYSTEM_PROMPT = `
You are the AI receptionist and personal assistant for Eboh Emmanuel Emeke.

PERSON:
Name: Eboh Emmanuel Emeke
Profession: Website designer and developer
Location: Delta State, Nigeria

BUSINESS:
Emmanuel builds modern SaaS-style business websites for businesses and professionals.

SERVICES:
- Modern business website design
- SaaS-style website development
- Responsive website development
- Website redesign
- Business landing pages
- Conversion-focused website design
- AI-ready website functionality
- AI search visibility optimization

STARTING PRICE:
Custom pricing depending on the project.

CONTACT:
WhatsApp: +2349030123407
Email: jpdigitalai@gmail.com

PORTFOLIO:
https://saas-web-portfolio-1r1h.vercel.app/#contact

PERSONALITY:
Be warm, natural, confident, helpful and conversational.
Sound like a real human assistant, not a robotic chatbot.
Use simple language.
Do not repeatedly introduce yourself.
Do not mention that you are an AI unless the visitor specifically asks.
You can have normal conversations outside business topics.
If someone asks something unrelated to the business, respond naturally when appropriate, then guide the conversation back when relevant.

BUSINESS RULES:
- Never invent prices.
- Never claim Emmanuel has completed a project unless that information is provided.
- Never promise a specific delivery date unless provided.
- If a visitor wants to hire Emmanuel, encourage them to contact him on WhatsApp or email.
- If a visitor asks for pricing, explain that pricing is custom and depends on the project requirements.
- If a visitor wants to see previous work, provide the portfolio link.
- If a visitor asks how to contact Emmanuel, provide WhatsApp and email.
`;

function corsHeaders(origin: string | null): HeadersInit {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin)
      ? origin
      : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
  };
}

function json(
  data: unknown,
  status = 200,
  origin: string | null = null
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin),
  });
}

async function handleChat(
  request: Request,
  env: Env
): Promise<Response> {
  const origin = request.headers.get("Origin");

  let body: ChatRequest;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        error: "Invalid JSON request.",
      },
      400,
      origin
    );
  }

  const message = body.message?.trim();

  if (!message) {
    return json(
      {
        error: "Message is required.",
      },
      400,
      origin
    );
  }

  if (!env.OPENAI_API_KEY) {
    return json(
      {
        error: "AI service is not configured.",
      },
      500,
      origin
    );
  }

  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (item) =>
            item &&
            (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string"
        )
        .slice(-10)
    : [];

  const input = [
    ...history.map((item) => ({
      role: item.role,
      content: item.content,
    })),
    {
      role: "user",
      content: message,
    },
  ];

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          instructions: SYSTEM_PROMPT,
          input,
          max_output_tokens: 500,
        }),
      }
    );

    const data = await response.json() as {
      output_text?: string;
      error?: {
        message?: string;
      };
    };

    if (!response.ok) {
      console.error("OpenAI error:", data);

      return json(
        {
          error:
            data.error?.message ||
            "The AI service returned an error.",
        },
        502,
        origin
      );
    }

    const reply =
      data.output_text?.trim() ||
      "Sorry, I couldn't generate a response right now.";

    return json(
      {
        reply,
      },
      200,
      origin
    );
  } catch (error) {
    console.error("Chat error:", error);

    return json(
      {
        error: "Unable to contact the AI service.",
      },
      500,
      origin
    );
  }
}

export default {
  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    const url = new URL(request.url);

    if (url.pathname === "/") {
      return json(
        {
          name: "JP AI Receptionist",
          status: "online",
          version: "1.0.0",
        },
        200,
        origin
      );
    }

    if (
      url.pathname === "/health" &&
      request.method === "GET"
    ) {
      return json(
        {
          status: "ok",
          service: "jp-ai-receptionist",
        },
        200,
        origin
      );
    }

    if (
      url.pathname === "/chat" &&
      request.method === "POST"
    ) {
      return handleChat(request, env);
    }

    if (
      url.pathname === "/leads" &&
      request.method === "GET"
    ) {
      return json(
        {
          leads: [],
          message:
            "Lead storage will be connected when Supabase is configured.",
        },
        200,
        origin
      );
    }

    return json(
      {
        error: "Route not found.",
      },
      404,
      origin
    );
  },
};
