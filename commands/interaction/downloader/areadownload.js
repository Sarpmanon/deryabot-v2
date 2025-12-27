const { SlashCommandBuilder } = require('discord.js')
const { exec } = require('child_process')
const Logger = require('../../../utils/logger')
const fs = require('fs')
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
    .setName('areadownload')
    .setDescription('Top 15 Players')
    .addStringOption(option =>
      option.setName('startx_starty')
        .setDescription('Startx and starty coordinates')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('endx_endy')
        .setDescription('Endx and endy coordinates')
        .setRequired(true))
    .addStringOption(option => 
        option.setName('canvas')
            .setDescription('Canvas')
            .setRequired(true)
            .addChoices(
                { name: 'World 🌍', value: '5' },
                { name: 'Mini World 🪴', value: '0' },
                { name: 'Graffiti 🎨', value: '1' },
                { name: 'Art 🖌️', value: '6' },
                { name: 'Microcanvas 🗺️', value: '7' }
            )
    ),
    run: async (client, interaction) => {
        const startx_starty = interaction.options.getString('startx_starty')
        const endx_endy = interaction.options.getString('endx_endy')
        const canvas_id = interaction.options.getString('canvas')

        const logger = new Logger(client);

        try {
            await interaction.deferReply();

            exec(`${process.env.PYTHON_PROTOCOL_THINGY} python\\areadownload.py ${canvas_id} ${startx_starty} ${endx_endy} areadownload_${interaction.user.id}.png`, async (error, stdout, stderr) => {
                console.log(stdout)
                if (stdout.includes("Invalid Coordinate Format for")) {
                    await interaction.editReply({
                        content: "Corner coordinates are aligned wrong", 
                        files: [{ attachment: `data\\ogretici.gif` }]
                    })
                    return;
                }
                if (stdout.includes("Done!")) {
                    await interaction.editReply({
                        content: "Your image was downloaded successfully :arrow_double_down:", 
                        files: [{ attachment: `data\\areadownload\\areadownload_${interaction.user.id}.png` }]
                    });
                    fs.unlink(`data\\areadownload\\areadownload_${interaction.user.id}.png`, (err) => {
                        if (err) logger.error(err)
                    })
                }
            })
        } catch (error) {
            logger.error(`${error}`)
        }
    }
}