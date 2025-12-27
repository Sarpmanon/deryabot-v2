async function checkTag(tags) {
const badgeMap = {
    "Admin": "<:admin:1342989433460363274>",
    "Mod": "<:mod:1342989070665646160>",
    "Helper": "<:Helper:1345482721467699260>",
    "Veterann": "<:Veteran:1357006163035685005>",
    "Dev": "<:Dev:1357006160883879992>",
    "Journalist": "<:journalist:1342992391367557120>",
    "birthday_one_year": "<:1year:1342991956900315167>",
    "Christmas2023": "<:christmas2023:1342991470860308620>",
    "Halloween2024": "<:Halloween2024:1386020603324137602>",
    "Christmas2024": ":christmas_tree:",
    "Supporter": "<a:Supporter:1363153820137295913>"
};

let badges = "";

for (const tag of tags) {
    if (badgeMap[tag]) {
        badges += " " + badgeMap[tag];
    }
}

return badges;
}

module.exports = checkTag;