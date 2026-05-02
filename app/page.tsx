"use client";

import { useState } from "react";

export default function Page() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hola 👋 Soy Agustina de Lasertec. Estoy para ayudarte con trabajos de corte láser, plegado y soldadura. ¿Qué necesitás?",
    },
  ]);

  const [input, setInput] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    detalle: "",
  });

  const sendMessage = async () => {
    if (!input) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    const res = await fetch("/api/agustina", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();

    if (data.reply === "__FORM__") {
      setMostrarFormulario(true);
      return;
    }

    setMessages([
      ...newMessages,
      {
        role: "assistant",
        content: data.reply,
      },
    ]);
  };

  const enviarFormulario = async () => {
    await fetch("/api/agustina", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: JSON.stringify(form),
          },
        ],
      }),
    });

    setMostrarFormulario(false);

    setMessages([
      ...messages,
      {
        role: "assistant",
        content:
          "Perfecto 👍 Ya registramos tu solicitud. Un asesor te va a contactar a la brevedad.",
      },
    ]);
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        fontFamily: "Arial",
        border: "1px solid #ccc",
        borderRadius: 10,
        padding: 20,
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      {/* 👇 SACAMOS EL TÍTULO COMO PEDISTE */}

      {!mostrarFormulario && (
        <>
          <div
            style={{
              height: 300,
              overflowY: "auto",
              border: "1px solid #ddd",
              padding: 10,
              borderRadius: 6,
              marginBottom: 10,
            }}
          >
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <b>{m.role === "user" ? "Vos" : "Agustina"}:</b>{" "}
                {m.content}
              </div>
            ))}
          </div>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribí tu consulta..."
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={sendMessage}
            style={{
              marginTop: 10,
              width: "100%",
              padding: 10,
              background: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Enviar
          </button>
        </>
      )}

      {mostrarFormulario && (
        <div>
          <h4>Solicitud de Presupuesto</h4>

          <input
            placeholder="Nombre"
            onChange={(e) =>
              setForm({ ...form, nombre: e.target.value })
            }
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />

          <input
            placeholder="Teléfono"
            onChange={(e) =>
              setForm({ ...form, telefono: e.target.value })
            }
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />

          <textarea
            placeholder="Detalle del trabajo"
            onChange={(e) =>
              setForm({ ...form, detalle: e.target.value })
            }
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />

          <button
            onClick={enviarFormulario}
            style={{
              width: "100%",
              padding: 10,
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Enviar solicitud
          </button>
        </div>
      )}
    </div>
  );
}
