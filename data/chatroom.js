import PocketBase from "https://cdn.jsdelivr.net/npm/pocketbase/dist/pocketbase.es.mjs";

const pb = new PocketBase("https://independent-dead.pockethost.io");

const $ = (id) => document.getElementById(id);

const messagesDiv = $("messages");
const msgInput = $("msg");
const nameInput = $("displayName");
const sendBtn = $("sendBtn");

const NAME_KEY = "chatDisplayName";

// Escape HTML (prevents XSS)
const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const setName = (raw) => {
  const n = String(raw ?? "").trim().replace(/\s+/g, " ").slice(0, 24);
  if (!n) localStorage.removeItem(NAME_KEY);
  else localStorage.setItem(NAME_KEY, n);
  return n;
};

const getName = () => {
  const n = (localStorage.getItem(NAME_KEY) || "").trim();
  return n ? n : "Guest";
};

// Render a single message
const render = (m) => {
  const el = document.createElement("div");
  el.style.marginBottom = "10px";
  el.innerHTML = `
    <div style="font-size:0.8em; color:#fff; opacity:0.9;">
      ${esc(m.name || "Guest")} • ${new Date(m.created).toLocaleString()}
    </div>
    <div style="white-space:pre-wrap;">${esc(m.text || "")}</div>
  `;
  messagesDiv.appendChild(el);
};

// If the user is close to the bottom, keep them pinned there.
// If they scrolled up to read history, don't force-scroll them.
const isNearBottom = () => {
  const threshold = 40; // px from bottom
  return (
    messagesDiv.scrollHeight - messagesDiv.scrollTop - messagesDiv.clientHeight <
    threshold
  );
};

// Load the newest messages
const load = async () => {
  try {
    const stickToBottom = isNearBottom();

    // Get newest 50, then reverse to show oldest->newest
    const list = await pb.collection("messages").getList(1, 50, { sort: "-created" });

    messagesDiv.innerHTML = "";
    list.items.reverse().forEach(render);

    if (stickToBottom) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  } catch (err) {
    console.error(err);
    messagesDiv.innerHTML = `<div style="color:#fff;">Error loading messages (check console)</div>`;
  }
};

// init name from storage
nameInput.value = localStorage.getItem(NAME_KEY) || "";

// autosave name as user types (debounced)
let nameTimer = null;
nameInput.addEventListener("input", () => {
  clearTimeout(nameTimer);
  nameTimer = setTimeout(() => setName(nameInput.value), 200);
});

const setSending = (sending) => {
  sendBtn.disabled = !!sending;
  sendBtn.style.opacity = sending ? "0.6" : "1";
  sendBtn.style.cursor = sending ? "not-allowed" : "pointer";
};

// Send message
const send = async () => {
  const text = msgInput.value.trim();
  if (!text) return;

  // save latest typed name
  setName(nameInput.value);

  try {
    setSending(true);
    await pb.collection("messages").create({ name: getName(), text });

    msgInput.value = "";
    // Load immediately after send so you see it right away
    await load();
  } catch (err) {
    console.error(err);
    alert("Failed to send message (check console).");
  } finally {
    setSending(false);
  }
};

sendBtn.addEventListener("click", send);

// Enter sends (Shift+Enter = newline)
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

// ---- STARTUP ----
await load();

// Refresh every 2 seconds
setInterval(load, 2000);