require('dotenv').config();

class Logger {
  constructor(client) {
    this.client = client;
  }

  async log(message) {
    console.log(`[INFO] ${message}`.blue);
    await this.sendToDiscord(`❕**[LOG]** ${message}`);
  }

  async warn(message) {
    console.warn(`[WARN] ${message}`.yellow);
    await this.sendToDiscord(`⚠️ **[WARN]** ${message}`);
  }

  async error(message) {
    console.log(`[ERROR] ${message}`.red);
    await this.sendToDiscord(`❌ **[LOG]** ${message}`);
  }

  async sendToDiscord(content) {
    try {
      const channel = await this.client.channels.fetch(process.env.LOG_CHANNEL_ID).catch(() => null);
      if (channel && channel.isTextBased?.()) {
        channel.send(content).catch(err => console.error("Logger send error:", err));
      }
    } catch (error) {
       console.log(`[LOGGER ERROR] ${error}`.red)
    }

  }
}

module.exports = Logger;