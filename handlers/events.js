const fs = require('fs')
const ascii = require('ascii-table')
require('colors')

module.exports = () => {
    let eventsTable = new ascii().setHeading('Events', 'Load Status');
    let events = fs.readdirSync('./events')

    for (let file of events) {
        require(`../events/${file}`);
        eventsTable.addRow(file.split('.js')[0], '✅ Ready')
    }

    console.log(eventsTable.toString().brightCyan)
}