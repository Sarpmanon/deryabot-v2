const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder } = require("discord.js");
const Logger = require("../../../utils/logger");


module.exports = {
    data: new SlashCommandBuilder()
    .setName('feedback')
    .setDescription('To send feedback about the bot, or to report bugs.')
    .addStringOption(option =>
        option.setName('title')
        .setDescription('Overall view of the bug')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('description')
        .setDescription('Detailed description of the bug, and how did it happen or what caused it. (99 characters max.)')
        .setRequired(true)
        .setMaxLength(99)
    ),

    /**
     * @param {import('discord.js').ChatInputCommandInteraction} interaction
    */

    run: async (client, interaction) => {
        const logger = new Logger(client)

        try {
            const title = interaction.options.getString('title')
            const description = interaction.options.getString('description')

            if (title.length == 0 || description.length == 0) {
                interaction.reply({ content: `Neither of the fields can be empty.` }).catch(err => logger.error(err))
                return;
            }

            const feedBackEmbed = new EmbedBuilder()
            .setTitle(title)
            .setThumbnail(interaction.user.avatarURL())
            .setTimestamp()
            .addFields(
                { name: `Description`, value: `${description}` },
                { name: `User ID`, value: `${interaction.user.id}` }
            )

            const channel = await client.channels.fetch(process.env.FEEDBACK_CHANNEL_ID).catch(() => null);
            await channel.send({ embeds: [feedBackEmbed] })
            await interaction.reply({ content: `Your feedback was sent successfully ✅` })
        } catch (error) {
            logger.error(error)
            console.log(error)
        }
    }
}