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

// Client mit nötigen Intents (Members für Join/Leave)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.GuildMember, Partials.User]
});

// Events
client.once(Events.ClientReady, (c) => onReady(c));
client.on(Events.InteractionCreate, (i) => onInteractionCreate(i));
client.on(Events.GuildMemberAdd, (m) => onGuildMemberAdd(m));
client.on(Events.GuildMemberRemove, (m) => onGuildMemberRemove(m));

// Slash-Commands bei Start registrieren (idempotent)
registerCommands()
  .then(() => console.log('Slash-Commands registriert.'))
  .catch((err) => console.error('Fehler bei Command-Registration:', err));

// Login
client.login(process.env.DISCORD_TOKEN);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM erhalten, Bot fährt runter…');
  client.destroy();
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('SIGINT erhalten, Bot fährt runter…');
  client.destroy();
  process.exit(0);
});
