const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("listtemplates")
    .setDescription("Lists added templates"),
    run: async (client, interaction) => {
        let pages = []
        
        const rawTemplates = fs.readFileSync("data/templates/data.json")
        const allTemplates = JSON.parse(rawTemplates)
        const templates = allTemplates.filter(t => t.guildID === interaction.guild.id)

        for (let i = 0; i < templates.length; i += 20) {
            const chunk = templates.slice(i, i + 20);
            pages.push(chunk.map((item, index) => `${i + index + 1}. ${item.name}`).join("\n"));
        }

        let currentPage = 0;

        const getEmbed = (page) => {
            const currentChunk = templates.slice(page * 20, page * 20 + 20);
            const desc = currentChunk.map((item, index) =>
                `${page * 20 + index + 1}. [${item.name}](${item.link}) - 📍 ${item.coordinates} - ✍️ ${item.authorTag}`
            ).join("\n");

            return new EmbedBuilder()
                .setTitle(`🖼️ Templates - Page ${page + 1}/${pages.length}`)
                .setDescription(desc || "There are no templates added in this server 😭")
                .setColor("Random")
                .setFooter({ text: `Server: ${currentChunk[0]?.guildName || "Unknown"}` })
                .setTimestamp();
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("prev").setLabel("⬅️").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("next").setLabel("➡️").setStyle(ButtonStyle.Primary)
        );

        const message = await interaction.reply({
        embeds: [getEmbed(currentPage)],
            components: [row],
            fetchReply: true,
        });

        const collector = message.createMessageComponentCollector({
            componentType: 2,
            time: 60_000,
        });

        collector.on("collect", (i) => {
            if (i.customId === "prev") {
                currentPage = currentPage === 0 ? pages.length - 1 : currentPage - 1;
            } else if (i.customId === "next") {
                currentPage = (currentPage + 1) % pages.length;
            }

            i.update({
                embeds: [getEmbed(currentPage)],
                components: [row],
            });
        });

        collector.on("end", () => {
        message.edit({
            components: [], // butonları pasifleştir
        });
        });
    }
}