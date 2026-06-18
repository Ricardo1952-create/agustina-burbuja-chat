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
  const [formularioAbierto, setFormularioAbierto] = useState(false);

  const [form, setForm] = useState({
    empresa: "",
    cuit: "",
    nombre: "",
    whatsapp: "",
    detalle: "",
  });

  const limpiarRespuesta = (texto: string) => {
    return texto.replace(/\[FORMULARIO\]/gi, "").trim();
  };

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

    if (data.showForm || data.reply?.toUpperCase().includes("[FORMULARIO]")) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: limpiarRespuesta(data.reply || ""),
        },
      ]);

      setMostrarFormulario(true);
      setFormularioAbierto(false);
      return;
    }

    setMessages([
      ...newMessages,
      {
        role: "assistant",
        content: limpiarRespuesta(data.reply || ""),
      },
    ]);
  };

  const enviarFormulario = async () => {
    const cuitLimpio = form.cuit.replace(/\D/g, "");

    if (!form.empresa.trim()) {
      alert("Por favor ingresá la empresa.");
      return;
    }

    if (!form.cuit.trim()) {
      alert("Para poder avanzar con la cotización necesitamos el CUIT de la empresa.");
      return;
    }

    if (cuitLimpio.length !== 11) {
      alert("Ingresá un CUIT válido de 11 dígitos.");
      return;
    }

    if (!form.nombre.trim()) {
      alert("Por favor ingresá tu nombre.");
      return;
    }

    if (!form.whatsapp.trim()) {
      alert("Por favor ingresá un WhatsApp de contacto.");
      return;
    }

    if (!form.detalle.trim()) {
      alert("Por favor ingresá el detalle del trabajo.");
      return;
    }

    const res = await fetch("/api/agustina", {
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

    const data = await res.json();

    setMostrarFormulario(false);
    setFormularioAbierto(false);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          data.reply ||
          "Perfecto 👍 Ya registramos tu solicitud. Un asesor revisará tu consulta y se comunicará con vos dentro de nuestro horario de atención, de lunes a viernes de 8 a 17 hs.",
      },
    ]);

    setForm({
      empresa: "",
      cuit: "",
      nombre: "",
      whatsapp: "",
      detalle: "",
    });
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
      {/* CHAT SIEMPRE VISIBLE */}
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
            <b>{m.role === "user" ? "Vos" : "Agustina"}:</b> {m.content}
          </div>
        ))}
      </div>

      {/* INPUT SOLO SI NO HAY FORMULARIO */}
      {!mostrarFormulario && (
        <>
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

      {/* BOTÓN PARA ABRIR FORMULARIO */}
      {mostrarFormulario && !formularioAbierto && (
        <button
          onClick={() => setFormularioAbierto(true)}
          style={{
            marginTop: 10,
            width: "100%",
            padding: 12,
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Completar formulario de cotización
        </button>
      )}

      {/* FORMULARIO ABAJO */}
      {mostrarFormulario && formularioAbierto && (
        <div style={{ marginTop: 15 }}>
          <h4>Solicitud de contacto</h4>

          <input
            placeholder="Empresa"
            value={form.empresa}
            onChange={(e) =>
              setForm({ ...form, empresa: e.target.value })
            }
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />

          <input
            placeholder="CUIT de la empresa"
            value={form.cuit}
            onChange={(e) =>
              setForm({ ...form, cuit: e.target.value })
            }
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />

          <input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) =>
              setForm({ ...form, nombre: e.target.value })
            }
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />

          <input
            placeholder="WhatsApp"
            value={form.whatsapp}
            onChange={(e) =>
              setForm({ ...form, whatsapp: e.target.value })
            }
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />

          <textarea
            placeholder="Detalle del trabajo"
            value={form.detalle}
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
            Enviar datos
          </button>
        </div>
      )}
    </div>
  );
}
