// Minimal WhatsApp bot template placeholder
// NOTE: This is a template. For real WhatsApp Web bots use Baileys or whatsapp-web.js
// and implement QR pairing. This template demonstrates pairing via logs + health endpoint.

const http = require("http");
const pino = require("pino");
const logger = pino();

const PORT = process.env.PORT || 8080;
let paired = false;

// In a real Baileys setup you'd generate and display a QR to pair a session.
// Here we simulate by printing a "QR" URL to logs and toggling paired after env var or timeout.
const fakeQR = process.env.FAKE_QR || "https://example.com/qr-placeholder";

logger.info({ msg: "WhatsApp bot template starting", qr: fakeQR });
logger.info("Scan the QR printed above to pair (simulated).");

if (process.env.AUTO_PAIR === "1") {
  setTimeout(() => {
    paired = true;
    logger.info("Simulated pairing complete.");
  }, 5000);
}

http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, paired }));
    return;
  }
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WhatsApp bot template running\n");
}).listen(PORT, () => logger.info(`Health listening on ${PORT}`));

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("Shutting down.");
  process.exit(0);
});
