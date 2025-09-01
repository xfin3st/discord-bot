const { PermissionsBitField } = require('discord.js');
const EPHEMERAL = 1 << 6;

// "10m" / "2h" / "1d" / "1w" -> ms
function parseDurationToMs(input) {
  const m = String(input).trim().match(/^(\d+)\s*(s|m|h|d|w)$/i);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000, w: 604_800_000 }[unit];
  return n * mult;
}

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

  // /imagine (Dummy)
  if (interaction.commandName === 'imagine') {
    const prompt = interaction.options.getString('prompt', true);
    await interaction.reply({
      content: `🎨 Ich habe deinen Prompt erhalten:\n> ${prompt}\n\n(Die Bild-Generierung ist noch nicht angebunden 😉)`,
      flags: EPHEMERAL
    });
    return;
  }

  // Ab hier: Admin-Only
  if (['clear','kick','ban','timeout','purge'].includes(interaction.commandName) && !isAdmin(interaction)) {
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
      const me = interaction.guild.members.me;
      const canManage = interaction.channel.permissionsFor(me)?.has(PermissionsBitField.Flags.ManageMessages);
      if (!canManage) {
        await interaction.reply({ content: '❌ Mir fehlt **Manage Messages** in diesem Channel.', flags: EPHEMERAL });
        return;
      }
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({ content: `🧹 **${deleted.size}** Nachrichten gelöscht.`, flags: EPHEMERAL });
    } catch (e) {
      await interaction.reply({ content: `❌ Konnte nicht löschen: ${String(e.message || e)}`, flags: EPHEMERAL });
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
        await interaction.reply({ content: '❌ Ich kann diesen Nutzer nicht kicken (Rollen-Hierarchie).', flags: EPHEMERAL });
        return;
      }
      await member.kick(reason);
      await interaction.reply({ content: `👢 **${user.tag}** wurde gekickt. Grund: _${reason}_`, flags: EPHEMERAL });
    } catch (e) {
      await interaction.reply({ content: `❌ Kick fehlgeschlagen: ${String(e.message || e)}`, flags: EPHEMERAL });
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
        await interaction.reply({ content: '❌ Ich kann diesen Nutzer nicht bannen (Rollen-Hierarchie).', flags: EPHEMERAL });
        return;
      }
      await member.ban({ deleteMessageDays: days, reason });
      await interaction.reply({ content: `⛔ **${user.tag}** wurde gebannt. Grund: _${reason}_ (Nachrichten gelöscht: ${days} Tage)`, flags: EPHEMERAL });
    } catch (e) {
      await interaction.reply({ content: `❌ Ban fehlgeschlagen: ${String(e.message || e)}`, flags: EPHEMERAL });
    }
    return;
  }

  // /timeout
  if (interaction.commandName === 'timeout') {
    const user   = interaction.options.getUser('user', true);
    const dauer  = interaction.options.getString('dauer', true); // "10m", "2h", ...
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';

    const ms = parseDurationToMs(dauer);
    if (!ms || ms < 1000 || ms > 28 * 24 * 60 * 60 * 1000) {
      await interaction.reply({ content: '❌ Ungültige Dauer. Erlaubt: `Xs`, `Xm`, `Xh`, `Xd`, `Xw` (max ~28 Tage).', flags: EPHEMERAL });
      return;
    }

    try {
      const member = await interaction.guild.members.fetch(user.id);
      const me = interaction.guild.members.me;
      const canTimeout = me.permissions.has(PermissionsBitField.Flags.ModerateMembers);
      if (!canTimeout) {
        await interaction.reply({ content: '❌ Mir fehlt **Moderate Members** (Timeout-Recht).', flags: EPHEMERAL });
        return;
      }
      if (!member.moderatable || member.roles.highest.position >= me.roles.highest.position) {
        await interaction.reply({ content: '❌ Ich kann diesen Nutzer nicht timeouten (Rollen-Hierarchie).', flags: EPHEMERAL });
        return;
      }
      await member.timeout(ms, `Timeout: ${reason}`);
      await interaction.reply({ content: `⏳ **${user.tag}** timeout für **${dauer}**. Grund: _${reason}_`, flags: EPHEMERAL });
    } catch (e) {
      await interaction.reply({ content: `❌ Timeout fehlgeschlagen: ${String(e.message || e)}`, flags: EPHEMERAL });
    }
    return;
  }

  // /purge
  if (interaction.commandName === 'purge') {
    const amount = interaction.options.getInteger('anzahl', true);
    const user   = interaction.options.getUser('user');

    try {
      const me = interaction.guild.members.me;
      const canManage = interaction.channel.permissionsFor(me)?.has(PermissionsBitField.Flags.ManageMessages);
      if (!canManage) {
        await interaction.reply({ content: '❌ Mir fehlt **Manage Messages** in diesem Channel.', flags: EPHEMERAL });
        return;
      }

      if (!user) {
        // Einfach die letzten N Nachrichten
        const deleted = await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({ content: `🧹 **${deleted.size}** Nachrichten gelöscht.`, flags: EPHEMERAL });
      } else {
        // Nur Nachrichten eines Users
        const fetched = await interaction.channel.messages.fetch({ limit: 100 });
        const toDeleteArr = fetched.filter(m => m.author.id === user.id).first(amount);
        if (!toDeleteArr.length) {
          await interaction.reply({ content: `ℹ️ Keine passenden Nachrichten von **${user.tag}** gefunden (max 14 Tage löschbar).`, flags: EPHEMERAL });
          return;
        }
        await interaction.channel.bulkDelete(toDeleteArr, true);
        await interaction.reply({ content: `🧹 **${toDeleteArr.length}** Nachrichten von **${user.tag}** gelöscht.`, flags: EPHEMERAL });
      }
    } catch (e) {
      await interaction.reply({ content: `❌ Purge fehlgeschlagen: ${String(e.message || e)}`, flags: EPHEMERAL });
    }
    return;
  }
};