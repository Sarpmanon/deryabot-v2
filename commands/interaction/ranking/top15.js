const { SlashCommandBuilder } = require('discord.js')
const { EmbedBuilder } = require('discord.js')
const getPatent = require("../../../utils/getPatent")
const getBadge = require("../../../utils/getBadge");
const Logger = require('../../../utils/logger');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
    .setName('top15')
    .setDescription('Top 15 Players')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Category')
        .setRequired(true)
        .addChoices(
          { name: 'Total', value: 'total' },
          { name: 'Daily', value: 'daily' },
        )
    ),
    run: async (client, interaction) => {
        const option = interaction.options.getString("category")
        const logger = new Logger(client)
        try {

            const rawData = await fetch("https://pixelya.fun/ranking")
            const data = await rawData.json();

            let length = parseInt(process.env.TOP_15_LIMIT) || 15

            let rankingData = [];

            if (option == "total") {
                rankingData = data.ranking;
            } else {
                rankingData = data.dailyRanking;
            }

            if (rankingData.length < process.env.TOP_15_LIMIT) length = rankingData.length;

            let top1Image = "";

            const users = [];

            const statsembed = new EmbedBuilder()

            for (let i = 0; i < length; i++) {
                const patent = await getPatent(rankingData[i])
                const badges = await getBadge(rankingData[i].tags)

                if (i == 0) {
                    if (rankingData[i].avatar != "/unknown.png") {top1Image = rankingData[i].avatar} else {top1Image = "https://pixelya.fun/PixelyaLOGO.png"}
                }

                users.push({
                    name: `#${i+1} - ${rankingData[i].name}#${rankingData[i].id} ${patent} ${badges}`,
                    value: `Total Pixels: ${rankingData[i].t} \n Daily Pixels: ${rankingData[i].dt} \n R. Total: #${rankingData[i].r}`,
                    inline: false,
                });
            }

            statsembed.addFields(users)
            statsembed.setThumbnail(top1Image)

            interaction.reply({ embeds: [statsembed] })

        } catch (error) {
            logger.error(error)
            console.log(error)
        }
    }
}