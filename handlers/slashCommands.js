const fs = require('fs');
const ascii = require('ascii-table');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const Logger = require('../utils/logger');

const token = process.env.TOKEN;
const applicationID = process.env.APPLICATION_ID || null;
const clientID = process.env.CLIENT_ID || null;
const guildID = process.env.GUILD_ID || null;

module.exports = async (client) => {
    const logger = new Logger(client)

    const slashCommands = [];

    let table = new ascii().setHeading('Slash Commands', 'Load Status');

    fs.readdirSync('./commands/interaction/').forEach(dir => {
        const folder = fs.readdirSync(`./commands/interaction/${dir}/`).filter(file => file.endsWith('.js'));

        for (let file of folder) {
            let slashCommand = require(`../commands/interaction/${dir}/${file}`);

            if (slashCommand.data.name) {
                slashCommands.push(slashCommand.data);

                client.slashCommands.set(slashCommand.data.name, slashCommand);
                table.addRow(slashCommand.data.name, '✅ Success');
            } else {
                table.addRow(file.split('.js')[0], '⛔ Failed');
                continue;
            }
        }
    });
    console.log(table.toString().brightYellow)

    const rest = new REST({ version: '10' }).setToken(token);
    try {
        await rest.put(
            guildID ?
            Routes.applicationGuildCommands(applicationID || clientID, guildID) :
            Routes.applicationCommands(applicationID || clientID),
            { body: slashCommands }
        );
        logger.log('✅ Registered Slash Commands.');
    } catch (error) {
        logger.error(error);
    }
}