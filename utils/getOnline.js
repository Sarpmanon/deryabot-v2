const puppeteer = require('puppeteer')

async function getOnlineCount() {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage();
    await page.goto('https://pixelya.fun', { timeout: 0, waitUntil: 'domcontentloaded'})

    const getCount = async () => {
        const count = await page.evaluate(() => {
            const span = document.querySelector('span[title="Total Online Users"]');
            return span?.innerText || null;
        });
        return count;
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    return {
        getCount,
        close: async () => await browser.close()
    };
}

module.exports = getOnlineCount;