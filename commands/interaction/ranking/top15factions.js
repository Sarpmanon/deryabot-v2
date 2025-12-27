const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('top15factions')
    .setDescription('Top 15 Factions'),
    run: async (client, interaction) => {
        const rawData = await fetch("https://pixelya.fun/ranking")
        const data = await rawData.json()

        let factions = [];

        for (i = 0; i < 15; i++) {
            factions.push({
                name: `${i+1})`,
                value: `[${data.rankingFactions[i].tag}] [${data.rankingFactions[i].name}#${data.rankingFactions[i].id}](https://pixelya.fun/faction?name=${encodeURIComponent(data.rankingFactions[i].name)}) \n Total Pixels: ${data.rankingFactions[i].tp.toLocaleString("tr-TR")} \n Daily Pixels: ${data.rankingFactions[i].dp.toLocaleString("tr-TR")}`,
                inline: true
            })
        }

        await interaction.deferReply();

        const factionEmbed = new EmbedBuilder()
            .setTitle(`Top 15 Factions`)
            .addFields(factions)
            .setTimestamp()
            .setThumbnail(data.rankingFactions[0].avatar)

        await interaction.editReply({ embeds: [factionEmbed] })
    }
}