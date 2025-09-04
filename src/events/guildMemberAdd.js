const { EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = async (member) => {
  try {
    const channelId = process.env.WELCOME_CHANNEL_ID || "1202496784644177950";

    // Kanal holen (Cache → API)
    let channel = member.guild.channels.cache.get(channelId);
    if (!channel) {
      channel = await member.guild.channels.fetch(channelId).catch(() => null);
    }
    if (!channel) {
      console.warn(`[welcome] Channel ${channelId} nicht gefunden.`);
      return;
    }
    if (channel.type !== ChannelType.GuildText) {
      console.warn(`[welcome] Channel ${channelId} ist kein Textkanal.`);
      return;
    }

    // Berechtigungen im Ziel-Channel prüfen
    const me = member.guild.members.me;
    const perms = channel.permissionsFor(me);
    if (!perms?.has(PermissionsBitField.Flags.ViewChannel)) {
      console.warn(`[welcome] Keine ViewChannel-Rechte in #${channel.name}`);
      return;
    }
    if (!perms?.has(PermissionsBitField.Flags.SendMessages)) {
      console.warn(`[welcome] Keine SendMessages-Rechte in #${channel.name}`);
      return;
    }
    const canEmbed = perms.has(PermissionsBitField.Flags.EmbedLinks);

    // ---------- AUTO-ROLE: "Member" vergeben ----------
    const roleId = process.env.MEMBER_ROLE_ID || "1412183469219385574"; // <— deine Member-Rollen-ID
    let role = member.guild.roles.cache.get(roleId);
    if (!role) {
      role = await member.guild.roles.fetch(roleId).catch(() => null);
    }

    if (!role) {
      console.warn(`[autorole] Rolle ${roleId} nicht gefunden.`);
    } else {
      // Bot braucht "Manage Roles" und muss höher stehen als die Zielrolle
      const botHasManageRoles = me.permissions.has(PermissionsBitField.Flags.ManageRoles);
      const roleAbove = me.roles.highest.position > role.position;
      const memberManageable = member.manageable; // zusätzlicher Sicherheitscheck

      if (!botHasManageRoles) {
        console.warn('[autorole] Mir fehlt "Manage Roles".');
      } else if (!roleAbove) {
        console.warn(`[autorole] Bot-Rolle steht nicht über "${role.name}" (Hierarchie).`);
      } else if (!memberManageable) {
        console.warn('[autorole] Member ist für mich nicht veränderbar (Hierarchie).');
      } else {
        try {
          await member.roles.add(role, 'Auto-Role bei Join');
          console.log(`[autorole] ${member.user.tag} → Rolle "${role.name}" vergeben.`);
        } catch (e) {
          console.warn(`[autorole] Konnte Rolle nicht zuweisen: ${e.message}`);
        }
      }
    }
    // ---------- /AUTO-ROLE ----------

    // Daten fürs Embed
    const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const guildBanner = member.guild.bannerURL?.({ size: 1024 }) || null;
    const total = member.guild.memberCount;

    const greetings = [
      `👋 Willkommen, ${member}! Schön, dass du da bist.`,
      `🎉 Hey ${member}, mega dass du jetzt auch Teil von **${member.guild.name}** bist!`,
      `🥳 ${member} hat es geschafft! Viel Spaß bei uns.`,
      `🚀 Willkommen an Bord, ${member}!`
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    if (canEmbed) {
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setAuthor({
          name: member.guild.name,
          iconURL: member.guild.iconURL?.({ size: 128 }) ?? undefined
        })
        .setTitle(`Willkommen, ${member.user.username}! 🎉`)
        .setDescription(
          `${greeting}\n\n` +
          `📜 Bitte schau in **#regeln**\n` +
          `👋 Stell dich gern in **#vorstellung** vor\n` +
          `❓ Bei Fragen einfach **@Team** pingen`
        )
        .setThumbnail(avatarUrl)
        .addFields(
          { name: '👤 Nutzer', value: `${member.user.tag}`, inline: true },
          { name: '🆔 ID', value: member.id, inline: true },
          { name: '👥 Mitglieder', value: `${total}`, inline: true }
        )
        .setImage(guildBanner ?? null)
        .setFooter({ text: 'Viel Spaß auf dem Server!' })
        .setTimestamp();

      await channel.send({ content: `${member}`, embeds: [embed] });
    } else {
      await channel.send({
        content:
          `${member}\n` +
          `Willkommen, **${member.user.username}**! Du bist Mitglied #${total}.\n` +
          `Hinweis: Bot hat keine "Embed Links"-Rechte in diesem Channel.`
      });
    }
  } catch (err) {
    console.error('[welcome] Fehler beim Senden der Willkommensnachricht:', err);
  }
};