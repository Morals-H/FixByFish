import PocketBase from "https://esm.sh/pocketbase@0.25.1";

const PB_BASE = "https://independent-dead.pockethost.io"; // no trailing slash
const pb = new PocketBase(PB_BASE);

const SEND_URL = `${PB_BASE}/api/chat/send`;
const TOPIC = "example";

const elMessages = document.getElementById("messages");
const elStatus = document.getElementById("chatStatus");
const elName = document.getElementById("displayName");
const elMsg = document.getElementById("msg");
const elSend = document.getElementById("sendBtn");

// --- small helpers ---
function setStatus(text, isError = false) {
  elStatus.textContent = text;
  elStatus.style.color = isError ? "#ffb3b3" : "#c8ffc8";
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function appendMessage({ name, text, ts }, isLocal = false) {
  const time = ts ? new Date(ts) : new Date();
  const hhmm = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const wrapper = document.createElement("div");
  wrapper.style.padding = "6px 0";
  wrapper.style.borderBottom = "1px solid rgba(255,255,255,0.08)";

  wrapper.innerHTML = `
    <div style="display:flex; gap:10px; align-items:baseline;">
      <span style="opacity:0.7; font-size:0.85em; flex:0 0 auto;">${escapeHtml(hhmm)}</span>
      <span style="font-weight:700; flex:0 0 auto;">${escapeHtml(name || "anon")}</span>
      <span style="opacity:${isLocal ? "0.95" : "0.9"}; flex:1; word-break:break-word;">${escapeHtml(text || "")}</span>
    </div>
  `;

  elMessages.appendChild(wrapper);
  elMessages.scrollTop = elMessages.scrollHeight;
}

// Persist display name locally
const savedName = localStorage.getItem("chat_display_name");
if (savedName) elName.value = savedName;

elName.addEventListener("input", () => {
  localStorage.setItem("chat_display_name", elName.value.slice(0, 24));
});

// --- subscribe realtime ---
async function connectRealtime() {
  setStatus("Connecting realtime…");

  try {
    await pb.realtime.subscribe(TOPIC, (e) => {
      // PocketBase delivers subscription messages like:
      // { name: "example", data: "...json..." }
      let payload = null;

      try {
        payload = typeof e?.data === "string" ? JSON.parse(e.data) : e?.data;
      } catch (_) {
        // ignore malformed payloads
      }

      if (payload?.type === "chat") {
        appendMessage(payload, false);
      }
    });

    setStatus("Connected ✅  (realtime subscribed)");
  } catch (err) {
    console.error(err);
    setStatus("Realtime connection failed. Check PB URL/CORS + server running.", true);
  }
}

connectRealtime();

// --- send message (via server endpoint) ---
async function sendMessage() {
  const name = (elName.value || "").trim().slice(0, 24);
  const text = (elMsg.value || "").trim().slice(0, 500);

  if (!name) {
    setStatus("Enter a name first.", true);
    elName.focus();
    return;
  }
  if (!text) return;

  // Optimistic local echo
  appendMessage({ type: "chat", name, text, ts: new Date().toISOString() }, true);
  elMsg.value = "";
  elMsg.focus();

  try {
    const res = await fetch(SEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, text }),
    });

    if (!res.ok) {
      const out = await res.json().catch(() => ({}));
      setStatus(out?.error || "Send failed.", true);
    } else {
      setStatus("Sent ✅");
    }
  } catch (err) {
    console.error(err);
    setStatus("Send failed (network/CORS).", true);
  }
}

elSend.addEventListener("click", sendMessage);

elMsg.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") sendMessage();
});