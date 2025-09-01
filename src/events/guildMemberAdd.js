const { EmbedBuilder } = require('discord.js');
const findWelcomeChannel = require('../utils/findWelcomeChannel');

module.exports = async (member) => {
  const channel = findWelcomeChannel(member.guild);
  if (!channel) return;

  // Avatar des neuen Members (PNG, 256px)
  const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });

  // Optional: Server-Banner als großes Bild, falls vorhanden
  const guildBanner = member.guild.bannerURL?.({ size: 1024 }) || null;

  const total = member.guild.memberCount;

  const embed = new EmbedBuilder()
    .setColor(0x5865F2) // Discord Blurple – gern anpassen
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
      { name: '👤 Nutzer', value: `${member.user.tag}`, inline: true },
      { name: '🆔 ID', value: member.id, inline: true },
      { name: '👥 Mitglieder', value: `${total}`, inline: true }
    )
    .setImage(guildBanner ?? null) // nur gesetzt, wenn Banner existiert
    .setFooter({ text: 'Viel Spaß auf dem Server!' })
    .setTimestamp(new Date());

  // Den User noch im Content erwähnen (Ping), plus Embed
  await channel.send({
    content: `${member}`,
    embeds: [embed]
  });
};