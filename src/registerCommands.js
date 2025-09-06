require('dotenv').config();
const { REST, Routes } = require('discord.js');

/**
 * Definierte Slash-Commands
 */
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

/**
 * Registriert die Commands bei Discord (guild- oder global-scope).
 * Bleibt dein Default-Export.
 */
async function registerCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID || null;

  if (!token || !clientId) {
    throw new Error('CLIENT_ID oder DISCORD_TOKEN fehlt in der .env');
  }

  // Optionaler Dry Run: wenn REGISTER_DRY_RUN=true, nur ausgeben – nicht pushen
  const dryRun = String(process.env.REGISTER_DRY_RUN || '').toLowerCase() === 'true';

  const rest = new REST({ version: '10' }).setToken(token);

  if (dryRun) {
    console.log('[registerCommands] DRY RUN aktiv – es wird nichts zu Discord hochgeladen.');
    console.table(commands.map(c => ({ name: c.name, desc: c.description, opts: (c.options || []).length })));
    return;
  }

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log(`Guild-Commands für GUILD_ID=${guildId} registriert.`);
  } else {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('Globale Commands registriert.');
  }
}

/** 👇 NEU: Helfer-Funktionen für Status/Monitoring **/

/**
 * Gibt die vollen Command-Objekte zurück (für interne Nutzung oder Debug).
 */
function getDefinedCommands() {
  return commands;
}

/**
 * Gibt eine kompakte Zusammenfassung (Name + Beschreibung) zurück.
 * Perfekt für /status-Endpoint.
 */
function getCommandsSummary() {
  return commands.map(c => ({
    name: c.name,
    description: c.description
  }));
}

/** Exports (backwards-kompatibel) **/
module.exports = registerCommands;                 // alter Default-Export bleibt
module.exports.commands = commands;               // rohe Liste (wie zuvor vorgeschlagen)
module.exports.getDefinedCommands = getDefinedCommands;   // ✨ NEU
module.exports.getCommandsSummary = getCommandsSummary;   // ✨ NEU