import { AI_SYSTEM_PROMPT } from "./config";
import type { Env, ChatMessage, ChatRequest } from "./types";

const MODEL = "@cf/meta/llama-3.1-8b-instruct";

const WEBSITE_ORIGIN = "https://jp-ai-receptionist-vi39.vercel.app";

function corsHeaders(origin: string | null): HeadersInit {
  const allowedOrigin =
    origin === WEBSITE_ORIGIN ? origin : WEBSITE_ORIGIN;

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
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

function cleanHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(
      (item): item is ChatMessage =>
        !!item &&
        typeof item === "object" &&
        "role" in item &&
        "content" in item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
    )
    .slice(-10);
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

  const history = cleanHistory(body.history);

  const messages = [
    {
      role: "system",
      content: AI_SYSTEM_PROMPT,
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

    const reply =
      output.response?.trim() ||
      "I'm sorry, I couldn't generate a response right now.";

    return json(
      {
        reply,
      },
      200,
      origin
    );
  } catch (error) {
    console.error("Workers AI error:", error);

    return json(
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
      return json(
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
      return json(
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
      return handleChat(request, env);
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
