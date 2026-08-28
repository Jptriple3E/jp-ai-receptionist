interface Env {
  AI: Ai;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message?: string;
  history?: ChatMessage[];
}

const SYSTEM_PROMPT = `
You are the personal AI receptionist for Eboh Emmanuel Emeke.

ABOUT EMMANUEL:
Name: Eboh Emmanuel Emeke
Profession: Website Designer and Developer
Location: Delta State, Nigeria

BUSINESS:
Emmanuel builds modern SaaS-style business websites for businesses,
professionals, and organizations.

SERVICES:
- Modern business websites
- SaaS-style websites
- Website redesign
- Responsive website development
- Landing pages
- Conversion-focused websites
- AI-powered website features
- AI search visibility optimization
- Business automation

PRICING:
Pricing is custom depending on the project.

CONTACT:
WhatsApp: +2349030123407
Email: jpdigitalai@gmail.com

PORTFOLIO:
https://saas-web-portfolio-1r1h.vercel.app/#contact

YOUR PERSONALITY:
You are warm, friendly, intelligent, natural and conversational.

Talk like a helpful human receptionist.

You can have normal conversations with visitors.
You are NOT limited to business questions.

If someone says:
"Hi"
"How are you?"
"What's up?"
"Good morning"
or starts a normal conversation,
respond naturally.

Do not constantly try to sell Emmanuel's services.

However, when the visitor shows interest in websites,
business growth, web design, development, AI websites,
or hiring Emmanuel, naturally guide them toward Emmanuel's services.

IMPORTANT RULES:
- Never invent information about Emmanuel.
- Never invent prices.
- If asked about pricing, say pricing is custom.
- If asked to see Emmanuel's work, provide the portfolio.
- If asked how to contact Emmanuel, provide WhatsApp and email.
- Never claim Emmanuel is available at a specific time unless known.
- Never pretend to be Emmanuel himself.
- You are his AI receptionist/assistant.
- Keep responses reasonably concise.
- Be helpful before being promotional.
`;

const MODEL = "@cf/meta/llama-3.1-8b-instruct";

function corsHeaders(origin: string | null): HeadersInit {
  const allowedOrigin =
    origin === "https://jp-ai-receptionist-vi39.vercel.app"
      ? origin
      : "https://jp-ai-receptionist-vi39.vercel.app";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

function response(
  data: unknown,
  status = 200,
  origin: string | null = null
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin),
  });
}

async function chat(
  request: Request,
  env: Env
) {
  const origin = request.headers.get("Origin");

  let body: ChatRequest;

  try {
    body = await request.json();
  } catch {
    return response(
      {
        error: "Invalid request.",
      },
      400,
      origin
    );
  }

  const message = body.message?.trim();

  if (!message) {
    return response(
      {
        error: "Message is required.",
      },
      400,
      origin
    );
  }

  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (item) =>
            item &&
            (item.role === "user" ||
              item.role === "assistant") &&
            typeof item.content === "string"
        )
        .slice(-10)
    : [];

  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    ...history,
    {
      role: "user",
      content: message,
    },
  ];

  try {
    const result = await env.AI.run(MODEL, {
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const output = result as {
      response?: string;
    };

    return response(
      {
        reply:
          output.response?.trim() ||
          "I'm sorry, I couldn't generate a response right now.",
      },
      200,
      origin
    );
  } catch (error) {
    console.error("Workers AI error:", error);

    return response(
      {
        error: "AI service temporarily unavailable.",
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

    if (url.pathname === "/" && request.method === "GET") {
      return response(
        {
          name: "JP AI Receptionist",
          status: "online",
          ai: "Cloudflare Workers AI",
        },
        200,
        origin
      );
    }

    if (
      url.pathname === "/health" &&
      request.method === "GET"
    ) {
      return response(
        {
          status: "ok",
          ai: "Cloudflare Workers AI",
        },
        200,
        origin
      );
    }

    if (
      url.pathname === "/chat" &&
      request.method === "POST"
    ) {
      return chat(request, env);
    }

    return response(
      {
        error: "Route not found.",
      },
      404,
      origin
    );
  },
};
