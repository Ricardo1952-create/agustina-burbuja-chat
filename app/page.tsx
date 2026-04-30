"use client";

import { useState } from "react";

export default function Page() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hola 👋 Soy Agustina de Lasertec. Puedo ayudarte a cotizar piezas, responder dudas técnicas o derivarte con un asesor. ¿Qué necesitás?",
    },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.reply || data.message || "Hubo un problema al responder",
        },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Error de conexión. Intentá nuevamente.",
        },
      ]);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat Agustina</h2>

      <div style={{ minHeight: 300, border: "1px solid #ccc", padding: 10 }}>
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.role === "user" ? "Vos" : "Agustina"}:</b> {m.content}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribí acá..."
        style={{ width: "100%", marginTop: 10 }}
      />

      <button onClick={sendMessage} style={{ marginTop: 10 }}>
        Enviar
      </button>
    </div>
  );
}
