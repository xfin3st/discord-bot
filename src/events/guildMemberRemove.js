const findWelcomeChannel = require('../utils/findWelcomeChannel');

module.exports = async (member) => {
  const channel = findWelcomeChannel(member.guild);
  if (!channel) return;

  const tag = member.user?.tag ?? member.displayName ?? 'Jemand';
  await channel.send({
    content: `👋 ${tag} hat den Server verlassen. Mach’s gut!`
  });
};
