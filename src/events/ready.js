module.exports = (client) => {
  console.log(`✅ Eingeloggt als ${client.user.tag}`);

  // Standard-Presence beim Start
  client.user.setPresence({
    activities: [
      {
        name: 'fin3st.de 👑', // dein Text hier
        type: 3               // 0 = Playing, 1 = Streaming, 2 = Listening, 3 = Watching, 5 = Competing
      }
    ],
    status: 'online' // online | idle | dnd | invisible
  });
};