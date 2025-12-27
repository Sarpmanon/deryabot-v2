const Logger = require("../../../utils/logger")
const { SlashCommandBuilder } = require('discord.js')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('dailycountryranking')
    .setDescription('Top 15 Countries Daily'),
    run: async (client, interaction) => {
        const logger = new Logger(client)
        interaction.deferReply().catch(err => logger.error(err))
        try {
            const rawData = await fetch("https://pixelya.fun/ranking")
            const data = await rawData.json();

            const countries = []

            const countryRanking = data.totalCountrieRanking;
            const dailyRanking = data.dailyCorRanking;

            for (let i = 0; i < 15; i++) {
                const rawCountry = await fetch(`https://restcountries.com/v3.1/alpha/${dailyRanking[i].cc}`)
                const country = await rawCountry.json();

                countries.push({
                    name: `#${i+1} ${country[0].name.common} :flag_${dailyRanking[i].cc}:`,
                    value: `Daily Pixels: ${dailyRanking[i].px.toLocaleString("tr-TR")}`
                })
            }

            var playersEmbed = new EmbedBuilder()
            playersEmbed.setTitle(`Top 15 Countries Today`)

            playersEmbed.addFields(countries)


            await interaction.editReply({ embeds: [playersEmbed] });
        }
        catch (err) {
            //interaction.deferReply("error: " + err).catch(err => logger.error(err))
            //console.log(err)
            logger.error(err)
        }
    }
}