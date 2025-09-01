const { PermissionsBitField } = require('discord.js');
const EPHEMERAL = 1 << 6;

function isAdmin(interaction) {
  return interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator);
}

module.exports = async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // /ping
  if (interaction.commandName === 'ping') {
    const wsPing = Math.round(interaction.client.ws.ping);
    const sent = Date.now();

    await interaction.reply({ content: 'Pong! 🏓', flags: EPHEMERAL });
    const rtt = Date.now() - sent;

    await interaction.followUp({
      content: `WebSocket-Ping: **${wsPing}ms**, Roundtrip: **~${rtt}ms**`,
      flags: EPHEMERAL
    });
    return;
  }

  // /imagine
  if (interaction.commandName === 'imagine') {
    const prompt = interaction.options.getString('prompt', true);
    await interaction.reply({
      content: `🎨 Ich habe deinen Prompt erhalten:\n> ${prompt}\n\n(Die Bild-Generierung ist noch nicht angebunden 😉)`,
      flags: EPHEMERAL
    });
    return;
  }

  // Ab hier: Admin-Only
  if (!isAdmin(interaction)) {
    await interaction.reply({
      content: '❌ Nur Admins dürfen diesen Befehl nutzen.',
      flags: EPHEMERAL
    });
    return;
  }

  // /clear
  if (interaction.commandName === 'clear') {
    const amount = interaction.options.getInteger('anzahl', true);
    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({
        content: `🧹 **${deleted.size}** Nachrichten gelöscht.`,
        flags: EPHEMERAL
      });
    } catch (e) {
      await interaction.reply({
        content: `❌ Konnte nicht löschen: ${String(e.message || e)}`,
        flags: EPHEMERAL
      });
    }
    return;
  }

  // /kick
  if (interaction.commandName === 'kick') {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';
    try {
      const member = await interaction.guild.members.fetch(user.id);
      const me = interaction.guild.members.me;
      if (!member.kickable || member.roles.highest.position >= me.roles.highest.position) {
        await interaction.reply({
          content: '❌ Ich kann diesen Nutzer nicht kicken (Rollen-Hierarchie).',
          flags: EPHEMERAL
        });
        return;
      }
      await member.kick(reason);
      await interaction.reply({
        content: `👢 **${user.tag}** wurde gekickt. Grund: _${reason}_`,
        flags: EPHEMERAL
      });
    } catch (e) {
      await interaction.reply({
        content: `❌ Kick fehlgeschlagen: ${String(e.message || e)}`,
        flags: EPHEMERAL
      });
    }
    return;
  }

  // /ban
  if (interaction.commandName === 'ban') {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';
    const days = interaction.options.getInteger('tage') ?? 0;
    try {
      const member = await interaction.guild.members.fetch(user.id);
      const me = interaction.guild.members.me;
      if (!member.bannable || member.roles.highest.position >= me.roles.highest.position) {
        await interaction.reply({
          content: '❌ Ich kann diesen Nutzer nicht bannen (Rollen-Hierarchie).',
          flags: EPHEMERAL
        });
        return;
      }
      await member.ban({ deleteMessageDays: days, reason });
      await interaction.reply({
        content: `⛔ **${user.tag}** wurde gebannt. Grund: _${reason}_ (Nachrichten gelöscht: ${days} Tage)`,
        flags: EPHEMERAL
      });
    } catch (e) {
      await interaction.reply({
        content: `❌ Ban fehlgeschlagen: ${String(e.message || e)}`,
        flags: EPHEMERAL
      });
    }
    return;
  }
};