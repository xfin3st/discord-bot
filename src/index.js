// src/index.js
require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  Events
} = require('discord.js');

const registerCommands = require('./registerCommands');
const onReady = require('./events/ready');
const onInteractionCreate = require('./events/interactionCreate');
const onGuildMemberAdd = require('./events/guildMemberAdd');
const onGuildMemberRemove = require('./events/guildMemberRemove');
const onMessageCreate = require('./events/messageCreate'); // << NEU

// << NEU: Status-Server importieren
const { attachStatusServer } = require('./status');
let statusServer; // Referenz für sauberes Herunterfahren

// Client mit nötigen Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,   // Join/Leave
    GatewayIntentBits.GuildMessages   // /clear, /purge, Anti-Spam (messageCreate)
  ],
  partials: [Partials.GuildMember, Partials.User]
});

// Events
client.once(Events.ClientReady, (c) => {
  onReady(c);

  // << NEU: HTTP-Status-Server starten, wenn der Bot ready ist
  //    Vorteil: username/id/guilds sind dann sofort verfügbar.
  if (!statusServer) {
    const port = process.env.PORT || 8080;
    statusServer = attachStatusServer(client, port);
  }
});

client.on(Events.InteractionCreate, (i) => onInteractionCreate(i));
client.on(Events.GuildMemberAdd, (m) => onGuildMemberAdd(m));
client.on(Events.GuildMemberRemove, (m) => onGuildMemberRemove(m));
client.on(Events.MessageCreate, (m) => onMessageCreate(m)); // << NEU

// Slash-Commands bei Start registrieren (idempotent)
registerCommands()
  .then(() => console.log('Slash-Commands registriert.'))
  .catch((err) => console.error('Fehler bei Command-Registration:', err));

// Login
client.login(process.env.DISCORD_TOKEN);

// ---------- Graceful Shutdown ----------
function shutdown(signal) {
  console.log(`${signal} erhalten, Bot fährt runter…`);

  // Discord-Client sauber beenden
  try { client.destroy(); } catch (e) { console.error('Fehler bei client.destroy():', e); }

  // HTTP-Server sauber schließen (falls gestartet)
  if (statusServer) {
    statusServer.close(() => {
      console.log('[status] server geschlossen');
      process.exit(0);
    });

    // Fallback, falls close hängt (z. B. offene Verbindungen)
    setTimeout(() => {
      console.warn('[status] force exit after timeout');
      process.exit(0);
    }, 3000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));