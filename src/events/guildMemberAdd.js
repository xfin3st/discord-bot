const { EmbedBuilder } = require('discord.js');

module.exports = async (member) => {
  // Channel-ID festlegen (oder später in .env auslagern)
  const channelId = process.env.WELCOME_CHANNEL_ID || "1202478042732040304";
  const channel = member.guild.channels.cache.get(channelId);
  if (!channel) return;

  // Avatar des neuen Members
  const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
  const guildBanner = member.guild.bannerURL?.({ size: 1024 }) || null;
  const total = member.guild.memberCount;

  // Zufällige Begrüßungstexte
  const greetings = [
    `👋 Willkommen, ${member}! Schön, dass du da bist.`,
    `🎉 Hey ${member}, mega dass du jetzt auch Teil von **${member.guild.name}** bist!`,
    `🥳 ${member} hat es geschafft! Viel Spaß bei uns.`,
    `🚀 Willkommen an Bord, ${member}!`
  ];
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

  // Embed bauen
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setAuthor({
      name: member.guild.name,
      iconURL: member.guild.iconURL?.({ size: 128 }) ?? undefined
    })
    .setTitle(`Willkommen, ${member.user.username}! 🎉`)
    .setDescription(
      `${randomGreeting}\n\n` +
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
    .setTimestamp(new Date());

  // Nachricht senden
  await channel.send({
    content: `${member}`, // pingt den User
    embeds: [embed]
  });
};