require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'ping',
    description: 'Antwortet mit Pong! 🏓'
  },
  {
    name: 'imagine',
    description: 'Erzeuge ein Bild aus einem Text-Prompt',
    options: [
      {
        name: 'prompt',
        description: 'Beschreibe das gewünschte Bild',
        type: 3, // STRING
        required: true
      }
    ]
  },
  {
    name: 'clear',
    description: 'Löscht die letzten X Nachrichten im aktuellen Channel (Admins only)',
    options: [
      {
        name: 'anzahl',
        description: 'Wie viele (1-100)?',
        type: 4, // INTEGER
        required: true,
        min_value: 1,
        max_value: 100
      }
    ]
  },
  {
    name: 'kick',
    description: 'Kicke einen Nutzer (Admins only)',
    options: [
      {
        name: 'user',
        description: 'Wen kicken?',
        type: 6, // USER
        required: true
      },
      {
        name: 'grund',
        description: 'Warum?',
        type: 3, // STRING
        required: false
      }
    ]
  },
  {
    name: 'ban',
    description: 'Banne einen Nutzer (Admins only)',
    options: [
      {
        name: 'user',
        description: 'Wen bannen?',
        type: 6, // USER
        required: true
      },
      {
        name: 'grund',
        description: 'Warum?',
        type: 3, // STRING
        required: false
      },
      {
        name: 'tage',
        description: 'Tage Nachrichten löschen (0-7)',
        type: 4, // INTEGER
        required: false,
        min_value: 0,
        max_value: 7
      }
    ]
  }
];

module.exports = async function registerCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID || null;

  if (!token || !clientId) {
    throw new Error('CLIENT_ID oder DISCORD_TOKEN fehlt in der .env');
  }

  const rest = new REST({ version: '10' }).setToken(token);

  if (guildId) {
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log(`Guild-Commands für GUILD_ID=${guildId} registriert.`);
  } else {
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    console.log('Globale Commands registriert.');
  }
};