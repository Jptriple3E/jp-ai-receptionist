"use client";

import { FormEvent, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi 👋 I'm Emmanuel's AI assistant. You can ask me anything — about him, websites, his services, or even just have a normal chat.",
    },
  ]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();

    const text = input.trim();

    if (!text || loading) return;

    setInput("");

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: text,
      },
    ]);

    setLoading(true);

    try {
      if (!API_URL) {
        throw new Error("AI API is not configured yet.");
      }

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10),
        }),
      });

      if (!response.ok) {
        throw new Error("AI request failed.");
      }

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.reply ||
            "Sorry, I couldn't answer that right now. Please try again.",
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I'm currently being set up. Please contact Emmanuel directly at jpdigitalai@gmail.com or WhatsApp +2349030123407.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        await sendVoice(audioBlob);
      };

      recorder.start();

      setRecording(true);
    } catch (error) {
      console.error(error);
      alert("Please allow microphone access to send a voice message.");
    }
  }

  function stopRecording() {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
  }

  async function sendVoice(audioBlob: Blob) {
    setLoading(true);

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: "🎙️ Voice message",
      },
    ]);

    try {
      if (!API_URL) {
        throw new Error("AI API is not configured yet.");
      }

      const formData = new FormData();

      formData.append("audio", audioBlob, "voice.webm");

      const response = await fetch(`${API_URL}/voice`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Voice request failed.");
      }

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.reply ||
            "I received your voice message, but I couldn't generate a response.",
          audioUrl: data.audioUrl,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Voice chat is still being configured. You can send me a text message or contact Emmanuel directly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        className="launcher"
        onClick={() => setOpen(true)}
        aria-label="Open AI assistant"
      >
        ✦ Ask JP AI
      </button>
    );
  }

  return (
    <section className="chat" aria-label="JP AI Assistant">
      <header>
        <div>
          <strong>✦ JP AI Assistant</strong>
          <small>Usually replies instantly</small>
        </div>

        <button
          onClick={() => setOpen(false)}
          aria-label="Close assistant"
        >
          ×
        </button>
      </header>

      <div className="messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`msg ${message.role === "user" ? "user" : ""}`}
          >
            {message.content}

            {message.audioUrl && (
              <audio controls src={message.audioUrl}>
                Your browser does not support audio playback.
              </audio>
            )}
          </div>
        ))}

        {loading && (
          <div className="msg">
            Thinking...
          </div>
        )}
      </div>

      <button
        type="button"
        className={`mic ${recording ? "recording" : ""}`}
        onClick={recording ? stopRecording : startRecording}
        disabled={loading}
      >
        {recording ? "⏹ Stop recording" : "🎙️ Send voice"}
      </button>

      <form onSubmit={sendMessage}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask me anything..."
          disabled={loading}
        />

        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}
