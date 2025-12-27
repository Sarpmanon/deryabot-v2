const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const Logger = require('../../../utils/logger')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('factionrankingmembers')
    .setDescription('Get users with most pixels displayed in any faction')
    .addStringOption(option =>
      option.setName('faction')
        .setDescription('Name of the faction')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('listby')
        .setDescription('Daily or total')
        .addChoices(
            { name: `Total`, value: `Total` },
            { name: `Daily`, value: `Daily` },
        )
    ),
    run: async (client, interaction) => {
        await interaction.deferReply();

        let option = interaction.options.getString('listby')
        const logger = new Logger(client)

        if (option == null) option = "Total"

        const json = await fetch("https://pixelya.fun/api/getfactioninfo", {
            method: "POST",
            body: JSON.stringify({
                id: interaction.options.getString('faction')
            }),
            headers: {
                "Content-type": "application/json"
            }
        })

        const data = await json.json()
        if (data.fac == null || !data) {
            interaction.editReply("Couldn't find a faction with that name.").catch(err => logger.error(err))
            return;
        }

        let users = [];

        //gets the data of the owner
        users.push({
            name: `${data.fac.ownerinfo[0][1]}#${data.fac.ownerinfo[0][0]} :flag_${data.fac.ownerinfo[0][2]}:`,
            value: `Total Pixels: ${data.fac.ownerinfo[0][4]} \n Daily Pixels: ${data.fac.ownerinfo[0][5]}`
        })
        
        //gets the data of the admins
        for (i = 0; i < data.fac.modsinfo.length; i++) {
            users.push({
                name: `${data.fac.modsinfo[i][1]}#${data.fac.modsinfo[i][0]} :flag_${data.fac.modsinfo[i][2]}:`,
                value: `Total Pixels: ${data.fac.modsinfo[i][4]} \n Daily Pixels: ${data.fac.modsinfo[i][5]}`
            })
        }

        //gets the data of the members
        for (i = 0; i < data.fac.membersinfo.length; i++) {
            users.push({
                name: `${data.fac.membersinfo[i][1]}#${data.fac.membersinfo[i][0]} :flag_${data.fac.membersinfo[i][2]}:`,
                value: `Total Pixels: ${data.fac.membersinfo[i][4]} \n Daily Pixels: ${data.fac.membersinfo[i][5]}`
            })
        }

        let sorted = "";

        if (option == "Total") {
            sorted = await users
            .map(user => {
                const totalPixels = parseInt(user.value.match(/Total Pixels: (\d+)/)?.[1] || "0", 10);
                return { ...user, totalPixels };
            })
            .sort((a, b) => b.totalPixels - a.totalPixels);
        } else if (option == "Daily") {
            sorted = users
            .map(user => {
                const dailyPixels = parseInt(user.value.match(/Daily Pixels: (\d+)/)?.[1] || "0", 10);
                return { ...user, dailyPixels };
            })
            .sort((a, b) => b.dailyPixels - a.dailyPixels);
        }

        while (sorted.length > 15) {
            sorted.pop();
        }

        const rankingEmbed = new EmbedBuilder()
            .setTitle(`Top 15 Members in ${data.fac.name} ${option.charAt(0).toUpperCase()}${option.slice(1).toLowerCase()}`)
            .addFields(sorted)

        await interaction.editReply({ embeds: [rankingEmbed] })
    }
}