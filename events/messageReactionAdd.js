const agacboardmain = require("../utils/agacboard")
const client = require("..")

client.on('messageReactionAdd', async reaction => {
  try {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
    agacboardmain(reaction, client);
  } catch (err) {
    console.error("messageReactionAdd sırasında hata:", err);
  }
});