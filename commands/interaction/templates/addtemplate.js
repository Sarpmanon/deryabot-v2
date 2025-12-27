const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const fs = require('fs')
const getImage = require('../../../utils/axiosdownloader');
const Logger = require("../../../utils/logger");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('addtemplate')
    .setDescription('Adds a template')
    .addStringOption(option => 
        option.setName('name')
        .setDescription('Name of the template')
        .setRequired(true)
    )
    .addStringOption(option => 
        option.setName('coordinates')
        .setDescription('Coordinates of your template')
        .setRequired(true)
    )
    .addStringOption(option => 
        option.setName('link')
        .setDescription('Link of your template. CatBox or Discord\'s CDN network may be used.')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('visibility')
        .setDescription('Make it visible if you wanna use it in different servers.')
        .setRequired(true)
        .addChoices(
            { name: "Visible", value: "visible"},
            { name: "Hidden", value: "hidden" },
        )
    )
    .addStringOption(option => 
        option.setName('canvas')
        .setDescription('Canvas')
        .setRequired(true)
        .addChoices(
            { name: 'World 🌍', value: '5' },
            { name: 'Mini World 🪴', value: '0' },
            { name: 'Graffiti 🎨', value: '1' },
            { name: 'Top 15 🥇', value: '6' }
        )
    ),

    /**
     * 
     * @param {Object} param0 
     * @param {ChatInputCommandInteraction} param0.interaction 
     */

    run: async (client, interaction) => {
        const logger = new Logger(client)
        console.log("adding template")

        try {
            const name = interaction.options.getString('name').replaceAll(" ", "_")
            const coordinates = interaction.options.getString('coordinates')
            const link = interaction.options.getString('link')
            const visibility = interaction.options.getString('visibility')
            const canvas = interaction.options.getString('canvas')

            await interaction.deferReply();

            const unallowed_chars = [">", "<", ":", "\"", "/", "\\", "|", "?", "*"]

            for (i = 0; i < name.length; i++) {
                if (unallowed_chars.includes(name.charAt(i))) {
                    interaction.editReply("Characters like __**>, <, :, \\ **__ and so on can't be used for template names.").catch(err => logger.error(err))
                    return;
                }
            }

            if(fs.existsSync(`./data/templates/${interaction.guild.id}/${name}.png`)) {
                await interaction.editReply("A template with that name already exists!")
                return;
            }

            const rawJSON = fs.readFileSync(`./data/templates/data.json`);
            let data = JSON.parse(rawJSON)

            const imageDownloaded = await getImage(link, name, interaction.guild.id, interaction.guild.name, client).catch(err => logger.error(err))
            if (imageDownloaded == false) {
                interaction.editReply("There was an error.").catch(err => logger.error(err))
                return;
            }

            const newData = {
                name: name,
                coordinates: coordinates,
                link: link,
                visibility: visibility,
                canvas: canvas,
                authorTag: interaction.user.tag,
                authorID: interaction.user.id,
                guildID: interaction.guild.id,
                guildName: interaction.guild.name,
                fromlast: 0,
            }

            await data.push(newData)

            fs.writeFileSync('./data/templates/data.json', JSON.stringify(data, null, 2))
            interaction.editReply({
                content: `✅ Your template was successfully added with the name: __**${name}**__`,
                files: [{ attachment: `data\\templates\\${interaction.guild.id}\\${name}.png` }]
            }).catch(err => logger.error(err))
        } catch (error) {
            logger.error(`addtemplate.js - ${error}`)
        }
    }
}