require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
  { name: 'ping', description: 'Antwortet mit Pong! 🏓' },

  {
    name: 'imagine',
    description: 'Erzeuge ein Bild aus einem Text-Prompt',
    options: [
      { name: 'prompt', description: 'Beschreibe das gewünschte Bild', type: 3, required: true } // STRING
    ]
  },

  {
    name: 'clear',
    description: 'Löscht die letzten X Nachrichten im aktuellen Channel (Admins only)',
    options: [
      { name: 'anzahl', description: 'Wie viele (1-100)?', type: 4, required: true, min_value: 1, max_value: 100 } // INTEGER
    ]
  },

  {
    name: 'kick',
    description: 'Kicke einen Nutzer (Admins only)',
    options: [
      { name: 'user',  description: 'Wen kicken?', type: 6, required: true },   // USER
      { name: 'grund', description: 'Warum?',      type: 3, required: false }   // STRING
    ]
  },

  {
    name: 'ban',
    description: 'Banne einen Nutzer (Admins only)',
    options: [
      { name: 'user',  description: 'Wen bannen?', type: 6, required: true },   // USER
      { name: 'grund', description: 'Warum?',      type: 3, required: false },  // STRING
      { name: 'tage',  description: 'Tage Nachrichten löschen (0-7)', type: 4, required: false, min_value: 0, max_value: 7 } // INTEGER
    ]
  },

  {
    name: 'timeout',
    description: 'Zeitweises Timeout für einen Nutzer (Admins only)',
    options: [
      { name: 'user',  description: 'Wen timeouten?', type: 6, required: true },   // USER
      { name: 'dauer', description: 'Dauer (z.B. 10m, 2h, 1d, 1w)', type: 3, required: true }, // STRING
      { name: 'grund', description: 'Warum?', type: 3, required: false }          // STRING
    ]
  },

  {
    name: 'purge',
    description: 'Löscht Nachrichten (optional nur von einem Nutzer) (Admins only)',
    options: [
      { name: 'anzahl', description: 'Wie viele (1-100)?', type: 4, required: true, min_value: 1, max_value: 100 }, // INTEGER
      { name: 'user',   description: 'Nur Nachrichten von diesem Nutzer', type: 6, required: false } // USER
    ]
  },

  {
    name: 'presence',
    description: 'Setzt den Bot-Status (nur Admins)',
    options: [
      {
        name: 'type',
        description: 'Art des Status',
        type: 3,
        required: true,
        choices: [
          { name: 'Playing', value: 'playing' },
          { name: 'Streaming', value: 'streaming' },
          { name: 'Listening', value: 'listening' },
          { name: 'Watching', value: 'watching' },
          { name: 'Competing', value: 'competing' }
        ]
      },
      { name: 'text', description: 'Text des Status', type: 3, required: true },
      { name: 'url',  description: 'Nur für Streaming: Twitch/YouTube URL', type: 3, required: false }
    ]
  }
];

module.exports = async function registerCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID || null;

  if (!token || !clientId) throw new Error('CLIENT_ID oder DISCORD_TOKEN fehlt in der .env');

  const rest = new REST({ version: '10' }).setToken(token);

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log(`Guild-Commands für GUILD_ID=${guildId} registriert.`);
  } else {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('Globale Commands registriert.');
  }
};