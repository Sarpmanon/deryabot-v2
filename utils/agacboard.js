const { EmbedBuilder, PermissionsBitField } = require('discord.js');

async function starboardMain(reaction, client) {
  const channel = reaction.message.channel;

  if (!channel.permissionsFor(channel.guild.members.me).has(PermissionsBitField.Flags.EmbedLinks)) {
    return console.log("🚫 Embed göndermek için iznim yok");
  }

  const STAR_EMOJI = 'AGAC';
  const STAR_THRESHOLD = 7;
  const STARBOARD_CHANNEL_ID = '1063182152277180578';
  const GUILD_ID = '407612821988179968';

  if (reaction.emoji.name !== STAR_EMOJI) return;
  if (channel.id == STARBOARD_CHANNEL_ID) return;

  const message = reaction.message;
  const starboardChannel = await client.channels.fetch(STARBOARD_CHANNEL_ID);
  if (!starboardChannel) return;

  const messages = await starboardChannel.messages.fetch({ limit: 100 });
  const existing = messages.find(m =>
    m.embeds.length &&
    m.embeds[0].footer?.text?.includes(message.id)
  );

  const starCount = reaction.count;

  if (starCount < STAR_THRESHOLD) {
    if (existing) {
      existing.delete().catch(console.error);
    }
    return;
  }

  const attachments = message.attachments;
  const imageAttachment = attachments.find(attachment => attachment.contentType?.startsWith('image'));

  const embed = new EmbedBuilder()
    .setColor('Random')
    .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
    .setDescription(message.content || '[Boş mesaj amina]')
    .addFields({ name: 'Mesaj', value: `[Mesaja git!](${message.url})` })
    .setFooter({ text: message.id })
    .setTimestamp();

  if (imageAttachment) {
    embed.setImage(imageAttachment.url);
  }

  if (existing && channel.guildId === GUILD_ID) {
    await existing.edit({ content: `<:AGAC:1067238356376895540> **${starCount}**`, embeds: [embed] });
  } else if (channel.guildId === GUILD_ID) {
    await starboardChannel.send({ content: `<:AGAC:1067238356376895540> **${starCount}**`, embeds: [embed] });
  }
}

module.exports = starboardMain;