const client = require('..')
const { ActivityType } = require('discord.js')
const Logger = require('../utils/logger')
const getPlayerCount = require("../utils/getOnline");

client.on('ready', async () => {
    const logger = new Logger(client)

    logger.log(`✅ Successfully logged in as ${client.user.tag}`)

    const counter = await getPlayerCount().catch(err => logger.error(err))

    setInterval(async () => {
        const count = await counter.getCount();

        client.user.setActivity(`PixelYa with ${count} players`, {
            type: ActivityType.Playing
        })
    }, 10000)
})