const client = require("..")

const utils = require("../utils/utils")

const conumArray = [
    "konum",
    "hedef",
    "neredeyiz",
    "link atın",
    "conum"
]

client.on('messageCreate',
    /**
     * @param {import('discord.js').Message} message
     */
    async message => {
        if (message.author.bot || !message.guild) return;
        utils.gptFunc(message, message.client);


        if (message.content.startsWith("https://pixelya.fun/#")) {
            utils.downloadPixelya(message, message.client);
            return;
        }

        if (message.content == "when void" || message.content.startsWith("void") || message.content == "!void") {
            utils.voidFunc(message, message.client);
            return
        }

        if (conumArray.includes(message.content)) {
            return message.reply("https://pixmap.fun/#d,5940,-8188,17")
        }

    }
)