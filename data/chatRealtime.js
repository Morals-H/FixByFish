
// Topic name (matches your examples)
const TOPIC = "example";

// POST /api/chat/send
// Body: { name: string, text: string }
routerAdd("POST", "/api/chat/send", (c) => {
  // Parse + basic validation
  let body = {};
  try {
    body = $apis.requestInfo(c).data || {};
  } catch (_) {}

  const name = String(body.name || "").trim().slice(0, 24);
  const text = String(body.text || "").trim().slice(0, 500);

  if (!name || !text) {
    return c.json(400, { ok: false, error: "Missing name or text." });
  }

  // Build the payload you want clients to receive
  const payload = {
    type: "chat",
    name,
    text,
    ts: new Date().toISOString(),
  };

  const message = new SubscriptionMessage({
    name: TOPIC,
    data: JSON.stringify(payload),
  });

  // Broadcast to everyone subscribed to TOPIC
  const clients = $app.subscriptionsBroker().clients();
  for (let clientId in clients) {
    if (clients[clientId].hasSubscription(TOPIC)) {
      clients[clientId].send(message);
    }
  }

  return c.json(200, { ok: true });
});