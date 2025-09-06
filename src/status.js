// src/status.js
const express = require("express");
const registerCommands = require("./registerCommands"); // bekommt gleich .commands

function attachStatusServer(client, port = process.env.PORT || 8080) {
  const app = express();

  // Optional: simpler Token-Schutz (?token=... oder Header x-status-token)
  app.use((req, res, next) => {
    if (!process.env.STATUS_TOKEN) return next();
    const token = req.query.token || req.headers["x-status-token"];
    return token === process.env.STATUS_TOKEN
      ? next()
      : res.status(401).json({ error: "unauthorized" });
  });

  // Healthcheck für Docker
  app.get("/healthz", (_req, res) => res.status(200).send("ok"));

  // Status-JSON
  app.get("/status", (_req, res) => {
    const wsPing = client.ws?.ping ?? null;
    const ready = client?.isReady?.() ?? false;
    const guilds = client?.guilds?.cache?.size ?? null;

    const cmds = Array.isArray(registerCommands.commands)
      ? registerCommands.commands
      : [];

    res.json({
      bot: ready ? "online" : "starting",
      username: client?.user?.tag ?? null,
      id: client?.user?.id ?? null,
      time: new Date().toISOString(),
      guilds,
      latency_ms: typeof wsPing === "number" ? Math.round(wsPing) : null,
      uptime_s: Math.floor(process.uptime()),
      node: process.version,
      memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),

      // Commands aus registerCommands.js
      commands_count: cmds.length,
      commands: cmds.map(c => ({ name: c.name, description: c.description }))
    });
  });

  const server = app.listen(port, "0.0.0.0", () =>
    console.log(`[status] listening on :${port}`)
  );
  return server;
}

module.exports = { attachStatusServer };