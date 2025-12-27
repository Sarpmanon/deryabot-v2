const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const Logger = require("../../../utils/logger");
const getImage = require('../../../utils/axiosdownloader');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("edittemplate")
    .setDescription("Edits a template")
    .addStringOption(option =>
      option
        .setName("template")
        .setDescription("Select a template to delete")
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName("name")
        .setDescription("Name of the new template")
    )
    .addStringOption(option =>
        option.setName("coordinates")
        .setDescription("Coordinates of the new template")
    )
    .addStringOption(option =>
        option.setName("link")
        .setDescription("Link of the new template")
    ),

    run: async (client, interaction) => {
        const logger = new Logger(client)
        console.log("editing template")
        try {
            const selectedTemplate = interaction.options.getString("template")
        
            const rawData = fs.readFileSync("data/templates/data.json")
            const data = JSON.parse(rawData)

            let target = data.find(obj => obj.name === selectedTemplate);
            if (target == undefined || !target) {
                interaction.reply("A template with that name doesn't exist.")
            }

            const newName = interaction.options.getString("name") ?? target.name
            const newCoords = interaction.options.getString("coordinates") ?? target.coordinates
            const newLink = interaction.options.getString("link") ?? target.link

            let name = target.name;
            let link = target.link
            if (newLink) link = newLink

            if (newName) {
                const unallowed_chars = [">", "<", ":", "\"", "/", "\\", "|", "?", "*"]
                for (i = 0; i < newName.length; i++) {
                    if (unallowed_chars.includes(name.charAt(i))) {
                        interaction.editReply("Characters like __**>, <, :, \\ **__ and so on can't be used for template names.").catch(err => logger.error(err))
                        return;
                    }
                }
                
                fs.unlink(`data\\templates\\${interaction.guild.id}\\${target.name}.png`, (err) => {
                    if (err) logger.error(err)
                })
            }

            const imageDownloaded = await getImage(newLink, target.name, interaction.guild.id, interaction.guild.name, client).catch(err => logger.error(err))
            if (imageDownloaded == false) {
                interaction.editReply("There was an error.").catch(err => logger.error(err))
                return;
            }

            target.name = newName
            target.coordinates = newCoords
            target.link = newLink

            fs.writeFileSync("./data/templates/data.json", JSON.stringify(data, null, 2), 'utf8');
            interaction.reply({ content: `Your template __**${selectedTemplate}**__ was edited successfully.`})
        } catch (error) {
            logger.error(error)
            console.log(error)
        }
    }
}