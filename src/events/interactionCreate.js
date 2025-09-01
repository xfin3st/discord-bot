module.exports = async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    const wsPing = Math.round(interaction.client.ws.ping);
    const sent = Date.now();
    await interaction.reply({ content: 'Pong! 🏓', ephemeral: true });
    const rtt = Date.now() - sent;

    await interaction.followUp({
      content: `WebSocket-Ping: **${wsPing}ms**, Roundtrip: **~${rtt}ms**`,
      ephemeral: true
    });
  }
};
