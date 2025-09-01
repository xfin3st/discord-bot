const findWelcomeChannel = require('../utils/findWelcomeChannel');

module.exports = async (member) => {
  const channel = findWelcomeChannel(member.guild);
  if (!channel) return;

  await channel.send({
    content: `👋 Willkommen auf dem Server, ${member}! Schön, dass du da bist.`
  });
};
