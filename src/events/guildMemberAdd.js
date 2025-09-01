const { EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = async (member) => {
  try {
    // 1) Channel-ID: am besten in .env legen (WELCOME_CHANNEL_ID), sonst direkt hier eintragen
    const channelId = process.env.WELCOME_CHANNEL_ID || "1202496784644177950";

    // 2) Channel holen (erst Cache, dann API)
    let channel = member.guild.channels.cache.get(channelId);
    if (!channel) {
      channel = await member.guild.channels.fetch(channelId).catch(() => null);
    }
    if (!channel) {
      console.warn(`[welcome] Channel ${channelId} nicht gefunden.`);
      return;
    }

    // Keine Threads/Foren etc.
    if (channel.type !== ChannelType.GuildText) {
      console.warn(`[welcome] Channel ${channelId} ist kein Textkanal.`);
      return;
    }

    // 3) Schreibrechte prüfen
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

    // 4) Daten für Embed
    const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const guildBanner = member.guild.bannerURL?.({ size: 1024 }) || null;
    const total = member.guild.memberCount;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setAuthor({
        name: member.guild.name,
        iconURL: member.guild.iconURL?.({ size: 128 }) ?? undefined
      })
      .setTitle(`Willkommen, ${member.user.username}! 🎉`)
      .setDescription(
        `Hey ${member}, mega dass du da bist!\n` +
        `📜 Schau bitte kurz in **#regeln**\n` +
        `👋 Sag Hallo in **#vorstellung**\n` +
        `❓ Bei Fragen einfach **@Team** pingen.`
      )
      .setThumbnail(avatarUrl)
      .addFields(
        { name: '👤 Nutzer',  value: `${member.user.tag}`, inline: true },
        { name: '🆔 ID',      value: member.id,           inline: true },
        { name: '👥 Mitglieder', value: `${total}`,       inline: true }
      )
      .setImage(guildBanner ?? null)
      .setFooter({ text: 'Viel Spaß auf dem Server!' })
      .setTimestamp();

    // 5) Senden – wenn Embeds verboten sind, fällt auf Plain-Text zurück
    if (canEmbed) {
      await channel.send({ content: `${member}`, embeds: [embed] });
    } else {
      await channel.send({
        content:
          `${member}\n` +
          `Willkommen, **${member.user.username}**!\n` +
          `Du bist Mitglied #${total}. (Hinweis: Bot hat keine Embed-Rechte in diesem Channel.)`
      });
    }
  } catch (err) {
    console.error('[welcome] Fehler beim Senden der Willkommensnachricht:', err);
  }
};