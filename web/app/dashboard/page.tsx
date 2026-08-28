"use client";

import { useEffect, useState } from "react";

type Lead = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  created_at?: string;
};

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    async function loadLeads() {
      try {
        if (!API_URL) return;

        const response = await fetch(`${API_URL}/leads`);

        if (!response.ok) {
          throw new Error("Unable to load leads");
        }

        const data = await response.json();

        setLeads(data.leads || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, [API_URL]);

  return (
    <main style={{ minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "auto" }}>
        <a href="/" style={{ color: "#8993a4" }}>
          ← Back to website
        </a>

        <h1 style={{ fontSize: 48, marginTop: 40 }}>
          JP Digital AI Dashboard
        </h1>

        <p style={{ color: "#8993a4" }}>
          Monitor conversations and potential customers.
        </p>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginTop: 40,
          }}
        >
          <Stat title="Total leads" value={leads.length} />

          <Stat
            title="AI status"
            value={API_URL ? "Connected" : "Not configured"}
          />

          <Stat title="Business" value="JP Digital AI" />
        </section>

        <section style={{ marginTop: 50 }}>
          <h2>Recent leads</h2>

          {loading ? (
            <p>Loading...</p>
          ) : leads.length === 0 ? (
            <div
              style={{
                marginTop: 20,
                padding: 30,
                border: "1px solid #202631",
                borderRadius: 18,
                color: "#8993a4",
              }}
            >
              No leads yet.
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              {leads.map((lead) => (
                <article
                  key={lead.id}
                  style={{
                    padding: 20,
                    marginBottom: 12,
                    background: "#0d1118",
                    border: "1px solid #202631",
                    borderRadius: 18,
                  }}
                >
                  <strong>{lead.name || "Unknown visitor"}</strong>

                  {lead.email && (
                    <p style={{ color: "#8993a4" }}>
                      {lead.email}
                    </p>
                  )}

                  {lead.phone && (
                    <p style={{ color: "#8993a4" }}>
                      {lead.phone}
                    </p>
                  )}

                  {lead.message && (
                    <p style={{ color: "#a5adbb" }}>
                      {lead.message}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        padding: 24,
        background: "#0d1118",
        border: "1px solid #202631",
        borderRadius: 18,
      }}
    >
      <p style={{ color: "#8993a4", margin: 0 }}>{title}</p>

      <strong
        style={{
          display: "block",
          marginTop: 12,
          fontSize: 26,
        }}
      >
        {value}
      </strong>
    </div>
  );
        }
