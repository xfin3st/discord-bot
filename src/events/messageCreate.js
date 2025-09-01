const { PermissionsBitField } = require('discord.js');

const WINDOW_MS = 7000;   // Zeitfenster
const LIMIT = 5;          // max Nachrichten im Fenster
const CLEAN_MAX = 10;     // wie viele löschen
const TIMEOUT_MS = 10 * 60 * 1000; // 10 Minuten

const buckets = new Map(); // userId -> timestamps[]

function isAdminMember(member) {
  return member.permissions.has(PermissionsBitField.Flags.Administrator);
}

module.exports = async (message) => {
  try {
    if (!message.guild) return;                 // nur in Guilds
    if (message.author.bot) return;             // Bots ignorieren
    const member = message.member;
    if (!member) return;
    if (isAdminMember(member)) return;          // Admins ausnehmen

    // Bucket aktualisieren
    const now = Date.now();
    const arr = buckets.get(member.id) ?? [];
    arr.push(now);
    // alte Einträge raus
    while (arr.length && now - arr[0] > WINDOW_MS) arr.shift();
    buckets.set(member.id, arr);

    if (arr.length > LIMIT) {
      // Spam erkannt
      const me = message.guild.members.me;
      const canManage = message.channel.permissionsFor(me)?.has(PermissionsBitField.Flags.ManageMessages);
      const canTimeout = message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers);

      // Nachrichten löschen (bis zu CLEAN_MAX vom User)
      if (canManage) {
        const fetched = await message.channel.messages.fetch({ limit: 50 }).catch(() => null);
        if (fetched) {
          const toDelete = fetched.filter(m => m.author.id === member.id).first(CLEAN_MAX);
          if (toDelete.length) {
            await message.channel.bulkDelete(toDelete, true).catch(() => null);
          }
        }
      }

      // Timeout setzen (falls möglich)
      if (canTimeout) {
        await member.timeout(TIMEOUT_MS, 'Auto-Moderation: Spam').catch(() => null);
      }

      // Kurze Antwort (ephemeral geht hier nicht – normale Message)
      await message.channel.send({
        content: `⚠️ <@${member.id}> bitte langsamer! (Auto-Moderation aktiv)`
      }).catch(() => null);

      console.warn(`[antispam] ${member.user.tag} getriggert: ${arr.length} msgs/${WINDOW_MS}ms`);
      buckets.set(member.id, []); // reset
    }
  } catch (e) {
    console.error('[antispam] Fehler:', e);
  }
};