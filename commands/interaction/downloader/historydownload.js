const { SlashCommandBuilder } = require("discord.js");
const Logger = require("../../../utils/logger");
const { exec } = require("child_process")
const fs = require('fs').promises;
require('dotenv').config()

module.exports = {
    data: new SlashCommandBuilder()
    .setName('historydownload')
    .setDescription('Downloads history from PixelYa')
    .addStringOption(option =>
        option.setName('startx_starty')
          .setDescription('startx and starty coordinates')
          .setRequired(true))
    .addStringOption(option =>
        option.setName('endx_endy')
          .setDescription('endx and endy coordinates')
          .setRequired(true))
    .addStringOption(option => 
        option.setName('canvas')
          .setDescription('Canvas')
          .setRequired(true)
          .addChoices(
            { name: 'World 🌍', value: '5' },
            { name: 'Mini World 🪴', value: '0' },
            { name: 'Graffiti 🎨', value: '1' },
            { name: 'Top 15 🥇', value: '6' }
          ))
    .addStringOption(option =>
        option.setName('start_date')
          .setDescription('Start date (must be in YYYY-MM-DD format)')
          .setRequired(true))
    .addStringOption(option =>
        option.setName('end_date')
          .setDescription('End date (YYYY-MM-DD)')
          .setRequired(true)),
    run: async (client, interaction) => {
        const startx_starty = interaction.options.getString('startx_starty')
        const endx_endy = interaction.options.getString('endx_endy')
        const canvas = interaction.options.getString('canvas')
        const start_date = interaction.options.getString('start_date')
        const end_date = interaction.options.getString('end_date')

        const logger = new Logger(client)

        try {
          await interaction.deferReply();

          await exec(`${process.env.PYTHON_PROTOCOL_THINGY} python\\historydownload.py ${canvas} ${startx_starty} ${endx_endy} ${start_date} ${end_date} ${interaction.user.id}`, async (error, stdout, stderr) => {
            console.log(stdout)
            if (stdout.includes("Invalid Coordinate Format for")) {
                await interaction.editReply({
                    content: "Corner coordinates are aligned wrong", 
                    files: [{ attachment: `data\\ogretici.gif` }]
                })
                return;
            }
            await exec(`ffmpeg -framerate 15 -f image2 -i data/historydownload/${interaction.user.id}/t%d.png -c:v libvpx-vp9 -pix_fmt yuva420p data/historydownload/${interaction.user.id}/output_${interaction.user.id}.mp4`, async (error, stdout, stderr) => {
              console.log("sdsdadasdsa")
              console.log(stdout)
              console.log(stderr, error)

              await interaction.editReply({
                  content: "Your video was rendered successfully ⏬", 
                  files: [{ attachment: `data\\historydownload\\${interaction.user.id}\\output_${interaction.user.id}.mp4` }]
              })
              await fs.rm(`data\\historydownload\\${interaction.user.id}`, { recursive: true, force: true })
            })
          })
        } catch (error) {
          
        }
    }
}