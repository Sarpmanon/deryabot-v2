const { SlashCommandBuilder } = require("discord.js");
const fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('deletetemplate')
    .setDescription('Deletes one of your templates')
    .addStringOption(option =>
      option
        .setName("template")
        .setDescription("Select a template to delete")
        .setRequired(true)
    ),
    run: async (client, interaction) => {
        const selectedTemplate = interaction.options.getString("template");

        const rawTemplateFile = fs.readFileSync("data/templates/data.json")
        const templateFile = JSON.parse(rawTemplateFile)

        const selectedExists = templateFile.some(obj => obj.name === selectedTemplate);

        if (!selectedExists) {
          interaction.reply("No template with that name was found.")
          return;
        }

        const updatedArray = templateFile.filter(obj => obj.name !== selectedTemplate);

        fs.writeFileSync("data/templates/data.json", JSON.stringify(updatedArray, null, 2), "utf8");
        interaction.reply({ content: `Your template __**${selectedTemplate}**__ was deleted successfully.` })
    }
}