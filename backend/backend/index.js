const express = require("express");
const Docker = require("dockerode");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
require("dotenv").config();

const app = express();
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || "/var/run/docker.sock" });

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admintoken";
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

// Simple auth: POST /login with { password } -> returns token
app.post("/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ token: ADMIN_TOKEN });
  }
  return res.status(401).json({ error: "invalid password" });
});

// Middleware: check Authorization: Bearer <token>
function auth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.replace(/^Bearer\s+/, "");
  if (token === ADMIN_TOKEN) return next();
  return res.status(401).json({ error: "unauthorized" });
}

// List containers managed by this dashboard (filter by label)
app.get("/instances", auth, async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true, filters: { label: ["wa-dashboard=true"] } });
    return res.json(containers.map(c => ({
      id: c.Id,
      names: c.Names,
      status: c.Status,
      image: c.Image,
      state: c.State,
      labels: c.Labels
    })));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Create a new instance (container). body: { name, env }
app.post("/instances", auth, async (req, res) => {
  const { name, env } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });

  try {
    const envArray = (env || []).map(e => `${e.key}=${e.value}`);
    // Default image is wa-bot:local — user can build/push their own image
    const container = await docker.createContainer({
      Image: process.env.BOT_IMAGE || "wa-bot:local",
      name,
      Env: envArray,
      Labels: { "wa-dashboard": "true", "wa-dashboard-created-by": "admin" },
      HostConfig: {
        AutoRemove: false,
        RestartPolicy: { Name: "unless-stopped" }
      }
    });
    await container.start();
    return res.json({ id: container.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Start container
app.post("/instances/:id/start", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const container = docker.getContainer(id);
    await container.start();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Stop container
app.post("/instances/:id/stop", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const container = docker.getContainer(id);
    await container.stop();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Remove container
app.delete("/instances/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const container = docker.getContainer(id);
    await container.remove({ force: true });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Fetch logs (stream last N lines)
app.get("/instances/:id/logs", auth, async (req, res) => {
  const { id } = req.params;
  const tail = req.query.tail || 200;
  try {
    const container = docker.getContainer(id);
    const logs = await container.logs({ stdout: true, stderr: true, tail, timestamps: true });
    // logs is a Buffer; Docker multiplexes streams — but for simplicity return as string
    return res.send(logs.toString("utf8"));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on ${PORT}`);
});
