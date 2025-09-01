const { ChannelType, PermissionsBitField } = require('discord.js');

function findWelcomeChannel(guild) {
  try {
    // 1) System-Channel bevorzugen (wenn Bot dort schreiben darf)
    const sc = guild.systemChannel;
    if (sc && guild.members.me?.permissionsIn(sc).has(PermissionsBitField.Flags.SendMessages)) {
      return sc;
    }

    // 2) Erster Textkanal, in dem der Bot schreiben darf
    const candidate = guild.channels.cache
      .filter(ch => ch.type === ChannelType.GuildText)
      .find(ch => guild.members.me?.permissionsIn(ch).has(PermissionsBitField.Flags.SendMessages));

    return candidate || null;
  } catch {
    return null;
  }
}

module.exports = findWelcomeChannel;
