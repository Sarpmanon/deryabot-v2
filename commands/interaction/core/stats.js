const { SlashCommandBuilder } = require('discord.js')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Stats of the bot'),
    run: async (client, interaction) => {
        const statsembed = new EmbedBuilder()
         .addFields(
         { name: '**Ping:** ', value: `${new Date().getTime() - interaction.createdTimestamp} ms` },
         { name: '**Total Member Count:** ', value: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}` },
         { name: '**Total Server Count:** ', value: client.guilds.cache.size.toLocaleString() },
         { name: '**Total Channel Count:** ', value: client.channels.cache.size.toLocaleString() },
         { name: '**NodeJS Version: **', value: process.version},
         { name: '**discordJS Version: **', value: `14 or smth`},
         { name: '**Total RAM Usage:** ', value: `${(process.memoryUsage().heapUsed / 1024 / 512).toFixed(2)} MB`},
         { name: '**GuildID**', value: `${interaction.guild.id}`}
        )
         .setThumbnail(client.user.avatarURL())

        interaction.reply({ embeds: [statsembed], ephemeral: true})

    }
}