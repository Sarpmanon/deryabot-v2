const Logger = require("../../../utils/logger")
const utils = require("../../../utils/utils")
const { SlashCommandBuilder } = require("discord.js");

const sendToAllAllowed = [
    "1198735588115873863", //sarpmanon
    "969973090643755048", //vidibidi
    "683769810013782033" //furkan
]

module.exports = {
    data: new SlashCommandBuilder()
    .setName('sendtoall')
    .setDescription('Only available for 3 users, ignore if you\'re not one of them.')
    .addStringOption(option =>
        option.setName('title')
        .setDescription('Title')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('description')
        .setDescription('description')
        .setRequired(true)
        .setMaxLength(99)
    )
    .addStringOption(option =>
        option.setName('eventlink')
        .setDescription('descrieventlinkption')
        .setRequired(true)
        .setMaxLength(99)
    ),

    /**
     * @param {import('discord.js').ChatInputCommandInteraction} interaction
    */

    run: async (client, interaction) => {
        const logger = new Logger(client)

        const title = interaction.options.getString("title")
        const description = interaction.options.getString("description")
        const eventlink = interaction.options.getString("eventlink")

        if (!sendToAllAllowed.includes(interaction.user.id)) return interaction.reply("You're not authorized to use this command.");

        try {
            utils.sendToAll(interaction, client, "407612821988179968"/*guild id */, "470341939737264128"/* role id*/, title, description, eventlink)
        } catch (error) {
            logger.error(error)
        }
    }
}