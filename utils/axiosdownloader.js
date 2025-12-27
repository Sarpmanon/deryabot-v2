const axios = require('axios');
const fs = require('fs');
const Logger = require('./logger');

async function imageDownloader(imageURL, name, serverID, serverName, client) {
    const logger = new Logger(client)
    try {
        const response = await axios.get(imageURL, { responseType: 'arraybuffer' });

        if (!response) return;

        const contentType = response.headers['content-type'];
        if (contentType && contentType.startsWith('image')) {

            if (!fs.existsSync(`./data/templates/${serverID}`)){
                fs.mkdirSync(`./data/templates/${serverID}`);
                fs.mkdirSync(`./data/templates/${serverID}/downloads`);
            }

            fs.writeFileSync(`./data/templates/${serverID}/${name}.png`, response.data);
            logger.log(`[IMAGEDOWNLOADER SUCCESS] - ${name}.png - ${serverName}`);
            return true;
        } else {
            logger.error('[IMAGEDOWNLADER FAILURE]');
            return false;
        }
    } catch (error) {
        logger.error(`axios - ${error}`)
        return false;
    }
}

module.exports = imageDownloader;