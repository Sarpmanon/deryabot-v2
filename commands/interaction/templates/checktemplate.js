const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require('fs');
const Logger = require("../../../utils/logger")

const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
    .setName('checktemplate')
    .setDescription('Displays wrong pixels of a template.')
    .addStringOption(option => 
        option.setName('templatename')
        .setDescription('Name of the template')
        .setRequired(true)
    ),

    /**
     * 
     * @param {Object} param0 
     * @param {ChatInputCommandInteraction} param0.interaction 
     */

    run: async (client, interaction) => {
        const logger = new Logger(client)
        const name = interaction.options.getString('templatename')

        //await interaction.deferReply().catch(err => logger.error(err))

        try {

            const rawJSON = fs.readFileSync("./data/templates/data.json")
            const templates = JSON.parse(rawJSON)
            const data = templates.filter(t => t.guildID === interaction.guild.id)

            let template = {};

            for (i = 0; i < data.length; i++) {
                if (data[i].name == name) {
                    template = data[i]
                }
            }

            if (!template || template.length == 0 || Object.keys(template).length == 0) {
                interaction.reply({ content: "Couldn't find a template with that name." }).catch(err => logger.log(err))
                return;
            }

            if (!template.visibility == "visible" || !template.authorID == interaction.user.id || !template.guildID == interaction.guild.id) { interaction.reply({ content: `This template wasn't created in this server, or not usable.`}).catch(err => logger.error(err)); return}

            await interaction.deferReply().catch(err => logger.error(err))
            
            //python part
            const { stdout, stderr } = await execPromise(`${process.env.PYTHON_PROTOCOL_THINGY} python\\getPercentage.py ${template.canvas} ${template.coordinates} data\\templates\\${interaction.guild.id}\\${name}.png true ${interaction.user.id} ${interaction.guild.id}`)

            console.log(stdout)

            if (stderr) {
                logger.error(stderr)
                console.log("stderr:", stderr.length)

                if (stderr.length >= 4096) {
                    interaction.editReply("There has been an error.");
                    return;
                } else {
                    const errorembed = new EmbedBuilder()
                        .setTitle(`There has been an error.`)
                        .setDescription(`${stderr}`)

                    interaction.editReply({ embeds: [errorembed] })
                }
            }

            if (!stdout || !stdout.includes("-")) {
                interaction.editReply({ content: "There's been an error with Python output." })
                return;
            }

            let [percentageCompletion, totalPixels, wrongPixels, width, height] = stdout.split("-")

            const correctPixels = Number(totalPixels - Number(wrongPixels)).toLocaleString("tr-TR")
        
            //totalPixels = totalPixels.toLocaleString("tr-TR")
            //wrongPixels = wrongPixels.toLocaleString("tr-TR")
            //percentageCompletion = Math.floor(percentageCompletion)

            const [startx, endy] = template.coordinates.split("_")


            const templatebutton = new ButtonBuilder()
                .setCustomId('template')
                .setLabel('Template')
                .setEmoji(`🖼️`)
                .setStyle(ButtonStyle.Success);

            const goto = new ButtonBuilder()
                .setLabel('Go To')
                .setURL(`https://pixelya.fun/#d,${Math.floor(Number(startx) + (Number(width) /2))},${Math.floor(Number(endy) + (Number(height) / 2))},20`)
                .setStyle(ButtonStyle.Link);

            const row = new ActionRowBuilder()
                .addComponents(templatebutton, goto);

            const canvases = {
                "5": "World 🌍",
                "0": "Mini World 🪴",
                "1": "Graffiti 🎨",
                "6": "Top 15 🥇"
            }

            const canvas = canvases[template.canvas]

            let target = data.find(obj => obj.name === name);

            //let imtiredofthesefuckassvariables = "+";

            /*if (Math.sign(correctPixels - Number(target.fromlast)) == 1) {
                imtiredofthesefuckassvariables = "+" + (correctPixels - Number(target.fromlast));
            } else if (Math.sign(correctPixels - Number(target.fromlast)) == -1) {
                imtiredofthesefuckassvariables = "" + (correctPixels - Number(target.fromlast));
            } else {
                imtiredofthesefuckassvariables = "0... This isn't going anywhere."
            }*/

            const imageAttachment = new AttachmentBuilder(`data\\templates\\${interaction.guild.id}\\downloads\\getpercentage_${interaction.user.id}.png`, { name: `image.png`})

            const tempEmbed = new EmbedBuilder()
            .setTitle(`${template.name}`)
            .setTimestamp()
            .setImage(`attachment://image.png`)
            .setFooter({ text: `Thanks to @Junifil for her help in the making of this bot.`, iconURL: 'https://images-ext-1.discordapp.net/external/YGKIglAAAUVQ6YRKh7TJTa-sXingve8n9p3XmRoWh04/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/643194794230808583/c24d2e5f0d238dd2b606baff068b4374.webp?format=webp' })
            .addFields(
                { name: `Correct/All Pixels`, value: `${correctPixels}/${totalPixels}`, inline: true},
                { name: `Wrong Pixel Count`, value: `${wrongPixels}`, inline: true},
                { name: `Completion Rate`, value: `%${percentageCompletion}`, inline: true},
                { name: `Added by:`, value: `${template.authorTag}`, inline: true},
                { name: `Requested by:`, value: interaction.user.tag, inline: true},
                { name: `Canvas`, value: canvas, inline: true},
                { name: `From Last`, value: `:3`, inline: true},
            )

            //target.fromlast = (Number(totalPixels) - Number(wrongPixels)).toString();
            //fs.writeFileSync("./data/templates/data.json", JSON.stringify(data, null, 2), 'utf8');

            const sentEmbed = await interaction.editReply({
                embeds: [tempEmbed],
                files: [ imageAttachment ],
                components: [
                    row
                ]
            }).catch(err => logger.error(err))

            fs.unlink(`data\\templates\\${interaction.guild.id}\\downloads\\getpercentage_${interaction.user.id}.png`, (err) => {
                if (err) logger.error(err)
            })

            const collector = sentEmbed.createMessageComponentCollector({
                componentType: 2,
                time: 60_000,
            });

            collector.on("collect", async (i) => {
                if (i.customId == "template") {
                    await i.deferUpdate();
                    templatebutton.setDisabled(true)

                    const templateEmbed = new EmbedBuilder()
                    const templateAttachment = new AttachmentBuilder(`data\\templates\\${interaction.guild.id}\\${template.name}.png`, { name: `template.png` });

                    templateEmbed.setImage("attachment://template.png").setTimestamp();

                    await interaction.followUp({
                        embeds: [templateEmbed],
                        files: [templateAttachment],
                        components: [row]
                    })

                    await sentEmbed.edit({
                        components: [row]
                    })
                }
            });

            collector.on("end", () => {
                templatebutton.setDisabled(true)

                sentEmbed.edit({
                    components: [row]
                })
            })
        } catch (error) {
            interaction.editReply("There has been an error.").catch(err => logger.error(err))
            logger.error(error)
        }
    }
}