const client = require('..')
const Logger = require('../utils/logger');
const { EmbedBuilder } = require('discord.js')

const logger = new Logger(client)

client.on('interactionCreate',
/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
    async interaction => {
        if (!interaction.isChatInputCommand()) return;

        const slashCommand = client.slashCommands.get(interaction.commandName);
        if (!slashCommand) return client.slashCommands.delete(interaction.commandName)

        try {
            await slashCommand.run(client, interaction);
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
            .setTitle('Error! Try again later!')
            .setColor('Red')
            .setDescription(`\`\`\`fix\n${error.message}\`\`\``)
            .setTimestamp();
            //interaction.deferred  ? await interaction.editReply({ embeds: [errorEmbed], ephemeral: true }).catch(err => logger.error(err)) : await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(err => logger.error(err))

            logger.error(error.message)
        }
})