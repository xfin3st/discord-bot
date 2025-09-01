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