const { SlashCommandBuilder } = require('discord.js')
const { EmbedBuilder } = require('discord.js')
const Logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('factioninfo')
    .setDescription('Displays information about any faction')
    .addStringOption(option =>
      option.setName('faction')
        .setDescription('Name of the faction')
        .setRequired(true)
    ),
    run: async (client, interaction) => {
        const logger = new Logger(client);
        await interaction.deferReply();

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

        let owner;
        let admins = []
        const members = []
        const banned = []
        let discord;
        let createdAt;
        let playercnt;
        let facTotalPixels;
        let facDailyTotalPixels;
        let color;

        try {
            owner = data.fac.ownerinfo[0][1] + "#" + data.fac.ownerid //owner's info
        }
        catch {
            await interaction.reply("Couldn't find a faction with that name.").catch(err => logger.error(err))
            logger.error('Wrong ID for factioninfo')
            return;
        }

        if (data.fac.mods == null) {
            admins.length = 0;
        } else {
            for (let i = 0; i < data.fac.mods.length; i++) {
                admins.push(data.fac.modsinfo[i][1] + "#" + data.fac.modsinfo[i][0]) //getting the mods' info
            }
        }
        
        for (let i = 0; i < data.fac.membros.length; i++)
        {
            members.push(data.fac.membersinfo[i][1] + "#" + data.fac.membersinfo[i][0] + "\n") //member count
        }
        
        if (data.fac.bans == null) {
            banned.length = 0;
        }
        else {
            for (let i = 0; i < data.fac.bans.length; i++) {
                banned.push(data.fac.bans[i]) //banned user count
            }
        }

        let adminsList = "";

        if (admins.length >= 5) {
            while(admins.length > 3) {
                admins.shift();
                continue;
            }
            admins.push("...")
            adminsList = admins.join("\n")
        } else {
            adminsList = admins.join("\n")
        }

        const bannedList = banned.length

        discord = data.fac.discordlink;
        createdAt = data.fac.createdate;
        playercnt = data.fac.players;
        facTotalPixels = data.fac.facTotalPixels;
        facDailyTotalPixels = data.fac.facDailyTotalPixels;
        color = data.fac.color;
        facDesc = data.fac.desc;

        if (color.length > 7 || color.length < 7) color = "#fffff"

        const embed = new EmbedBuilder()
        .setTitle(`${data.fac.name + " [" + data.fac.tag + "]"}`)
        .addFields(
            {name: "```Owner```", value: `\`\`\`${owner}\`\`\``, inline: true},
            {name: "```Admins```", value: `\`\`\`${adminsList}\`\`\``, inline: true},
    
        )
        .addFields(
            { name: "```Discord Link```", value: `\`\`\`${discord}\`\`\`` },
            {name: "```Total Member Count```", value: `\`\`\`${playercnt}\`\`\``, inline: true},
            {name: "```Total Banned Count```", value: `\`\`\`${bannedList.toString()}\`\`\``, inline: true},
        )
        .addFields(
            {name: "```Ranking```", value: `\`\`\`#${data.fac.rank[0]}\`\`\``, inline: true},
            {name: "```Total Pixel Count```", value: `\`\`\`${facTotalPixels.toLocaleString("tr-TR")}\`\`\``, inline: true},
        )
        .addFields( 
            { name: "```Daily Pixel Count```", value: `\`\`\`${facDailyTotalPixels.toLocaleString("tr-TR")}\`\`\``},
            { name: "```Creation Date```", value: `\`\`\`${createdAt}\`\`\``},
            { name: "```Description```", value: `\`\`\`${facDesc}\`\`\``}
        )
        .setColor(color)
        .setImage(data.fac.avatar)
        .setTimestamp()

        await interaction.editReply({ embeds: [embed] });
    }
}