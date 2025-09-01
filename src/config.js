module.exports = {
  mentionUserOnJoin: true, // @User im Text erwähnen?
  welcomeTitle: (member) => `Willkommen, ${member.user.username}! 🎉`,
  welcomeMessage: (member) =>
    `Schön, dass du da bist ${member}!\n` +
    `Schau gern in #regeln und sag Hallo in #vorstellung 🙂`,
  embedColor: 0x5865F2 // Discord-Blurple
};