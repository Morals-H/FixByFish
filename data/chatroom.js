import PocketBase from "https://esm.sh/pocketbase@0.25.1";

const PB_BASE = "https://independent-dead.pockethost.io";
const pb = new PocketBase(PB_BASE);

const COLLECTION = "Messages"; // <-- your collection name (case-sensitive)

// DOM (change these IDs if your HTML uses different ones)
const elMessages = document.getElementById("messages");
const elName = document.getElementById("displayName");
const elMsg = document.getElementById("msg");
const elSend = document.getElementById("sendBtn");

// ---------- helpers ----------
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function appendMessage({ name, text, ts }) {
  const time = ts ? new Date(ts) : new Date();
  const hhmm = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const wrapper = document.createElement("div");
  wrapper.style.padding = "6px 0";
  wrapper.style.borderBottom = "1px solid rgba(255,255,255,0.08)";

  wrapper.innerHTML = `
    <div style="display:flex; gap:10px; align-items:baseline;">
      <span style="opacity:0.7; font-size:0.85em; flex:0 0 auto;">${escapeHtml(hhmm)}</span>
      <span style="font-weight:700; flex:0 0 auto;">${escapeHtml(name || "anon")}</span>
      <span style="opacity:0.9; flex:1; word-break:break-word;">${escapeHtml(text || "")}</span>
    </div>
  `;

  elMessages.appendChild(wrapper);
  elMessages.scrollTop = elMessages.scrollHeight;
}

// Dedupe set (prevents double-render if PocketBase sends repeats, etc.)
const seen = new Set();
function shouldRender(id) {
  if (!id) return true;
  if (seen.has(id)) return false;
  seen.add(id);
  if (seen.size > 2000) seen.clear();
  return true;
}

// Persist display name locally
const savedName = localStorage.getItem("chat_display_name");
if (savedName && elName) elName.value = savedName;

elName?.addEventListener("input", () => {
  localStorage.setItem("chat_display_name", (elName.value || "").slice(0, 24));
});

// ---------- load history ----------
async function loadHistory() {
  try {
    // newest first, render oldest -> newest
    const page = await pb.collection(COLLECTION).getList(1, 50, { sort: "-created" });
    const items = [...page.items].reverse();

    for (const rec of items) {
      const id = `rec:${rec.id}`;
      if (!shouldRender(id)) continue;

      appendMessage({
        name: rec.name ?? rec.username ?? rec.displayName ?? "anon",
        text: rec.text ?? rec.message ?? "",
        ts: rec.created,
      });
    }
  } catch (err) {
    console.error("history load failed:", err);
  }
}

// ---------- realtime subscribe ----------
async function connectRealtime() {
  try {
    await pb.collection(COLLECTION).subscribe("*", (e) => {
      if (!e) return;

      if (e.action === "create" && e.record) {
        const id = `rec:${e.record.id}`;
        if (!shouldRender(id)) return;

        appendMessage({
          name: e.record.name ?? e.record.username ?? e.record.displayName ?? "anon",
          text: e.record.text ?? e.record.message ?? "",
          ts: e.record.created,
        });
      }
    });
  } catch (err) {
    console.error("subscribe failed:", err);
  }
}

// ---------- send message (create record) ----------
async function sendMessage() {
  const name = (elName?.value || "").trim().slice(0, 24);
  const text = (elMsg?.value || "").trim().slice(0, 500);

  if (!name) {
    elName?.focus();
    return;
  }
  if (!text) return;

  if (elMsg) elMsg.value = "";
  elMsg?.focus();

  try {
    // IMPORTANT: these field names MUST match your collection fields.
    await pb.collection(COLLECTION).create({ name, text });
    // Do NOT append locally here — realtime will render it once.
  } catch (err) {
    console.error("create failed:", err);
  }
}

// UI events
elSend?.addEventListener("click", sendMessage);
elMsg?.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") sendMessage();
});

// Boot
(async function boot() {
  await loadHistory();
  await connectRealtime();
})();