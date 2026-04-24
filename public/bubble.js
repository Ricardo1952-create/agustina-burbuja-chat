(function () {

  const WEBHOOK = "https://script.google.com/macros/s/AKfycbyduzeGP4h0fsGQzHnWQtCmXQs7R9HhAjEQNdDgwjrNWEy2gUIupsv5SD9J0xN3nD5h/exec";

  const bubble = document.createElement("div");
  bubble.innerHTML = "💬";
  bubble.style.position = "fixed";
  bubble.style.bottom = "20px";
  bubble.style.right = "20px";
  bubble.style.width = "60px";
  bubble.style.height = "60px";
  bubble.style.borderRadius = "50%";
  bubble.style.background = "#000";
  bubble.style.color = "#fff";
  bubble.style.display = "flex";
  bubble.style.alignItems = "center";
  bubble.style.justifyContent = "center";
  bubble.style.cursor = "pointer";
  bubble.style.zIndex = "9999";

  const chat = document.createElement("div");
  chat.style.position = "fixed";
  chat.style.bottom = "90px";
  chat.style.right = "20px";
  chat.style.width = "320px";
  chat.style.height = "420px";
  chat.style.background = "#fff";
  chat.style.border = "1px solid #ccc";
  chat.style.borderRadius = "10px";
  chat.style.display = "none";
  chat.style.flexDirection = "column";

  const messages = document.createElement("div");
  messages.style.flex = "1";
  messages.style.padding = "10px";
  messages.style.overflowY = "auto";

  const inputContainer = document.createElement("div");
  inputContainer.style.display = "flex";
  inputContainer.style.borderTop = "1px solid #ccc";

  const input = document.createElement("input");
  input.placeholder = "Escribí acá...";
  input.style.flex = "1";
  input.style.padding = "10px";
  input.style.border = "none";

  const button = document.createElement("button");
  button.innerText = "Enviar";
  button.style.padding = "10px";
  button.style.background = "#000";
  button.style.color = "#fff";
  button.style.border = "none";

  inputContainer.appendChild(input);
  inputContainer.appendChild(button);

  chat.appendChild(messages);
  chat.appendChild(inputContainer);

  document.body.appendChild(bubble);
  document.body.appendChild(chat);

  let initialized = false;

  bubble.onclick = () => {
    chat.style.display = chat.style.display === "none" ? "flex" : "none";

    if (!initialized) {
      addBot(`Hola, soy Agustina 👋<br>
      Puedo ayudarte a cotizar trabajos de corte, plegado o soldadura.<br>
      ¿Querés cotizar o hacer una consulta?`);
      initialized = true;
    }
  };

  function addUser(text) {
    const msg = document.createElement("div");
    msg.innerHTML = "<b>Vos:</b> " + text;
    msg.style.marginBottom = "8px";
    messages.appendChild(msg);
  }

  function addBot(text) {
    const msg = document.createElement("div");
    msg.innerHTML = "<b>Agustina:</b> " + text;
    msg.style.marginBottom = "10px";
    messages.appendChild(msg);
  }

  const enviar = async () => {
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    addUser(text);

    const lower = text.toLowerCase();

    if (lower.includes("cotizar")) {
      addBot("Perfecto, completá estos datos y te contactamos 👇");

      const form = document.createElement("div");
      form.innerHTML = `
        <input id="empresa" placeholder="Empresa" style="width:100%;margin:5px 0;padding:5px;" />
        <input id="nombre" placeholder="Nombre" style="width:100%;margin:5px 0;padding:5px;" />
        <input id="contacto" placeholder="Teléfono o mail" style="width:100%;margin:5px 0;padding:5px;" />
        <input id="necesidad" placeholder="¿Qué necesitás?" style="width:100%;margin:5px 0;padding:5px;" />
        <button id="btnEnviar" style="width:100%;padding:8px;background:#000;color:#fff;border:none;">Enviar</button>
      `;
      messages.appendChild(form);

      form.querySelector("#btnEnviar").onclick = async () => {
        const empresa = form.querySelector("#empresa").value;
        const nombre = form.querySelector("#nombre").value;
        const contacto = form.querySelector("#contacto").value;
        const necesidad = form.querySelector("#necesidad").value;

        const url = WEBHOOK +
          "?empresa=" + encodeURIComponent(empresa) +
          "&nombre=" + encodeURIComponent(nombre) +
          "&contacto=" + encodeURIComponent(contacto) +
          "&necesidad=" + encodeURIComponent(necesidad);

        await fetch(url);

        addBot("Gracias, recibimos tu solicitud ✅<br>Un asesor técnico se va a contactar con vos a la brevedad.");
      };

      return;
    }

    if (lower.includes("consultar")) {
      addBot("Perfecto, contame qué necesitás y te doy una respuesta rápida 👇");
      return;
    }

    const res = await fetch("/api/agustina", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    addBot(data.reply);
  };

  button.onclick = enviar;
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") enviar();
  });

})();