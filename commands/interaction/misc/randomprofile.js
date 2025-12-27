const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
require('dotenv').config()
const checkTag = require("../../../utils/getBadge")
const checkRank = require("../../../utils/getPatent")
const Logger = require("../../../utils/logger")

module.exports = {
    data: new SlashCommandBuilder()
    .setName('randomprofile')
    .setDescription('Displays a random user profile from PixelYa'),
    run: async (client, interaction) => {
        const logger = new Logger(client)

        try {
            const randomUser = Math.floor(Math.random() * process.env.MAX_USER_ID) + 1;

            const json = await fetch("https://pixelya.fun/api/userinfo", {
                method: "POST",
                body: JSON.stringify({
                id: randomUser
                }),
                headers: {
                "Content-type": "application/json"
                }
            })

            const data = await json.json();


            const patent = await checkRank(data.userinfo)

            const name = data.userinfo.namee;
            const userID = data.userinfo.id;
            
            const description = data.userinfo.descMsg;

            const createdISO = new Date(data.userinfo.createdAt);
            const createdat = createdISO.toLocaleString('en-EN')

            const lastLoginISO = new Date(data.userinfo.lastLogin);
            const lastLogin = lastLoginISO.toLocaleString('en-EN')

            const totalpixels = data.userinfo.totalPixels;
            const dailypixels = data.userinfo.dailyTotalPixels;

            const globalranking = data.userinfo.ranking;
            const dailyranking = data.userinfo.dailyRanking;
            let banrecord = "";

            if (data.userinfo.banned == true) {
                banrecord = "```ansi\n\u001b[2;31mBanned!\u001b[0m\n```"
            } else if (data.userinfo.muted == true) {
                banrecord = "```ansi\n\u001b[2;31mMuted!\u001b[0m\n```"
            } else {
                banrecord = "```ansi\n\u001b[2;32mClean!\u001b[0m\n```";
            }

            let pfp = "";
            let banner = "";

            if (data.userinfo.avatar == "" || !data.userinfo.avatar || data.userinfo.avatar == "/unknown.png") {
                pfp = "https://pixelya.fun/unknown.png"
            } else {
                pfp = data.userinfo.avatar
            }

            if (data.userinfo.banner == "" || data.userinfo.banner == "./unknown.png" || !data.userinfo.banner || data.userinfo.banner == "/unknownBanner.png") {
                banner = "https://pixelya.fun/unknownBanner.png"
            } else {
                banner = data.userinfo.banner
            }

            let badges = ""

            badges = await checkTag(badges, data.userinfo.tags);
            
            const userEmbed = new EmbedBuilder()
            .setTitle(`User Profile`)
            .setURL(`https://pixelya.fun/userinfo?id=${data.userinfo.id}`)
            .addFields(
                {
                name: `\`\`\`${data.userinfo.faction == null ? name + "#" + userID : data.userinfo.faction[0] + " " + name + "#" + userID}\`\`\` :flag_${data.userinfo.flag}:${patent + badges}`,
                value: `\`\`\`${description == null ? "N/A" : description}\`\`\``,
                inline: false
                },
                {
                name: "```Created At```",
                value: `\`\`\`${createdat}\`\`\``,
                inline: false
                },
                {
                name: "```Last Seen```",
                value: `\`\`\`${lastLogin}\`\`\``,
                inline: false
                },
                {
                name: "```Total Pixels```",
                value: `\`\`\`${totalpixels.toLocaleString("tr-TR")}\`\`\``,
                inline: false
                },
                {
                name: "```Daily Pixels```",
                value: `\`\`\`${dailypixels.toLocaleString("tr-TR")}\`\`\``,
                inline: false
                },
                {
                name:  "```Global Ranking```",
                value: `\`\`\`#${globalranking}\`\`\``,
                inline: false
                },
                {
                name: "```Daily Ranking```",
                value: `\`\`\`#${dailyranking}\`\`\``,
                inline: false
                },
                {
                name: "```Ban Record```",
                value: `${banrecord}`,
                inline: false
                }
            )
            //.setColor('RANDOM')
            .setThumbnail(pfp)
            .setImage(banner)
            .setTimestamp()

            interaction.reply({ embeds: [userEmbed] })
        } catch (error) {
            logger.error(error)
            interaction.reply({ content: "No account was found with this ID. Please try again." }).catch(err => logger.error(err))
        }
    }
}