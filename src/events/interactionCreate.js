module.exports = async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // /ping
  if (interaction.commandName === 'ping') {
    const wsPing = Math.round(interaction.client.ws.ping);
    const sent = Date.now();

    await interaction.reply({
      content: 'Pong! 🏓',
      flags: 1 << 6 // Ephemeral
    });

    const rtt = Date.now() - sent;

    await interaction.followUp({
      content: `WebSocket-Ping: **${wsPing}ms**, Roundtrip: **~${rtt}ms**`,
      flags: 1 << 6
    });
  }

  // /imagine
  if (interaction.commandName === 'imagine') {
    const prompt = interaction.options.getString('prompt', true);

    // Aktuell nur Dummy – später kannst du hier Bildgenerierung einbauen
    await interaction.reply({
      content: `🎨 Ich habe deinen Prompt erhalten:\n> ${prompt}\n\n(Die Bild-Generierung ist noch nicht angebunden 😉)`,
      flags: 1 << 6 // Ephemeral
    });
  }
};