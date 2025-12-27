require('dotenv').config();
const fs = require('fs')

const { Client, GatewayIntentBits, Partials, ActivityType, Collection } = require('discord.js')
const client = new Client({
    intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessageReactions],
    partials: [ Partials.Message, Partials.User, Partials.Channel, Partials.GuildMember, Partials.Reaction]
})

module.exports = client

client.slashCommands = new Collection();

client.login(process.env.TOKEN).then(() => {
    fs.readdirSync('./handlers').forEach((handler) => {
        require(`./handlers/${handler}`)(client)
    })
})