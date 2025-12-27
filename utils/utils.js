const { exec } = require("child_process");
const fs = require('fs');
const Logger = require("./logger");
const Discord = require("discord.js");
const { OpenAI } = require('openai');
require('dotenv').config();

const activeUsers = new Set();

/**
 * Downloads the image of the area if an image is sent with a PixelYa link
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 * @returns 
 */
async function downloadPixelya(message, client) {
  const logger = new Logger(client)
  const userId = message.author.id;

  if (activeUsers.has(userId)) {
      return message.reply('Wait before the first command is complete.');
  }

  activeUsers.add(userId)

  try {
    const splitMessage = message.content.split(',') //https://pixelya.fun/#d,6353,-8252,-24,
    const splitCanvas = splitMessage[0].split('#')
    let canvasID;
    let randomAssVar = 500;

    switch(splitCanvas[1]) {
      case 'd':
        canvasID = 5;
        break;
      case 'w':
        canvasID = 0;
        break;
      case 'g':
        canvasID = 1;
        break;
      case 't':
        canvasID = 6;
        randomAssVar = 50;
        break;
    }
    

    const x_start = splitMessage[1] - randomAssVar;
    const y_start = splitMessage[2] - randomAssVar;
    const x_end = Number(splitMessage[1]) + randomAssVar;
    const y_end = Number(splitMessage[2]) + randomAssVar;
    
    const startx_starty = x_start + "_" + y_start
    const endx_endy = x_end + "_" + y_end
          
    msg = await message.reply('Your image is being downloaded, give me a second...')
    //await message.channel.sendTyping();

    exec(`${process.env.PYTHON_PROTOCOL_THINGY} python\\areadownload.py ${canvasID} ${startx_starty} ${endx_endy} messagedownload_${message.author.id}.png`, async (error, stdout, stderr) => {
      if (error) {
          logger.error(`areadownload hatası: ${error.message}`);
          return;
      }
      if (stderr) {
          logger.error(`areadownload stderr: ${stderr}`);
          return;
      }

      await msg.edit({
        content: "Your image was downloaded successfully.", 
        files: [{ attachment: `data\\areadownload\\messagedownload_${message.author.id}.png` }]
      });
      fs.unlink(`data\\areadownload\\messagedownload_${message.author.id}.png`, (err) => {
        if (err) logger.error(err)
      })
    })
    }
    catch (error) {
      logger.error(`[PYA DOWNLOAD ERROR] ${error}`)
      return;
    }
    finally {
      if (activeUsers.has(userId)) {
        activeUsers.delete(userId)
      }
    }
}

/**
 * Replies with the void time if someone sends smth like "void" into the chat.
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 * @returns 
 */
async function voidFunc(message, client) {
  try {
    const perms = message.channel.permissionsFor(client.user);

    const response = await fetch("https://pixelya.fun/void");
    if (!response.ok) throw new Error(`[VOID HTTP ERROR] ${response.status}`);

    if (!perms || !perms.has("SEND_MESSAGES")) return;

    const data = await response.json();
    const remainingTime = data.nextVoidIn;

    const voidEmbed = new Discord.MessageEmbed()
      .setTitle(`Void Status`)
      .setTimestamp();

    if (data.success == 0 && remainingTime.endsWith("sec.")) {
      const rmHour = Number((remainingTime.split(" ")[0].slice(0, -3))) * 60 * 60;
      const rmMin = Number(remainingTime.split(" ")[1].slice(0, -3)) * 60;
      const rmSec = Number(remainingTime.split(" ")[2].slice(0, -4));

      const currentTime = (Math.floor(new Date().getTime() / 1000.0)) + rmHour + rmMin + rmSec;
      voidEmbed.setDescription(`Next Void: <t:${currentTime}:t>`);
    } else if (data.voidRemaining.time != "N/A") {
      const nonUnixTimeRemains = data.voidRemaining.time;
      const lepercentdefrançaisfireemoji = data.voidRemaining.percen;
      voidEmbed.setDescription(`Remaining time: ${nonUnixTimeRemains} \n Percent: ${lepercentdefrançaisfireemoji}`);
    } else if (remainingTime.endsWith(" ago.")) {
      voidEmbed.setDescription(`${remainingTime}`)
    } else {
      voidEmbed.setDescription(`${data.voidInfo}`);
    }

    await message.reply({ embeds: [voidEmbed] });
  } catch (err) {
    console.error("[VOID ERROR] ", err.message);
  }
}

const openai = new OpenAI({
  apiKey: process.env.API_KEY
});

/**
 * Uses ChatGPT API to communicate with users (like a chatbot) in a defined channel
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 * @returns 
 */
async function gptFunc(message, client) {
  const logger = new Logger(client)

  if (message.author.bot) return;
  if (message.content.startsWith('https://pixelya.fun/#')) return;
  if (message.channel.id !== process.env.GPT_CHANNEL_ID) return;
  if (message.content.startsWith('!')) return;

  message.channel.sendTyping();

  if (message.content.startsWith('?çiz')) {
    const prompt = message.content.replace("?çiz", "").trim();

    try {
      const image = await openai.images.generate({
        model: "gpt-image-1",
        prompt: prompt || 'kafana göre rastgele bir şey çiz',
        size: "1024x1024"
      })

      const imageURI = image.data[0].url;
      return await message.reply({ files: [imageURI] })
    } catch (error) {
      logger.error(error)
      return await message.reply("Bir hata oldu.")
    }
  }

  const conversationLog = [
    {
      role: 'system',
      content: "samimi arkadaşlarız gibi konuş ara sıra alay et saçma bulduğun cümlelerin sonunda amk ve aq ekle ve sosyal medya ağzıyla konuş ve ara sıra küfret. Mesajlarının uzunluğu asla ama asla 300 harfi geçmesin."
    }
  ];

  let imageUrl;

  if (message.attachments.size > 0) {
    const attachment = message.attachments.first();
    if (attachment.contentType && attachment.contentType.startsWith('image/')) {
      imageUrl = attachment.url;
    }
  }


  let prevMessages = await message.channel.messages.fetch({ limit: 5 });
  prevMessages.reverse();

  prevMessages.forEach((msg) => {
    if (msg.content.startsWith('!')) return;
    if (msg.author.id === client.user.id) {
      conversationLog.push({
        role: 'assistant',
        content: msg.content,
        name: msg.author.username
      });
    } else if (msg.author.id === message.author.id) {
      conversationLog.push({
        role: 'user',
        content: msg.content,
        name: msg.author.username
      });
    }
  });

  conversationLog.push({
    role: 'user',
    content: message.content,
    name: message.author.username
  });

  try {
    let result;

    if (imageUrl) {
      result = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          ...conversationLog,
          {
            role: 'user',
            content: [
              { type: 'text', text: message.content || "Bu resmi samimi arkadaşlarız gibi inceleyip yorumla" },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 300
      });
    } else {
      result = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: conversationLog,
        max_tokens: 300
      });
    }

    const reply = result.choices[0].message.content;

    if (reply.length < 2000) {
      await message.reply(reply);
    } else {
      await message.reply('Mesaj çok uzun be fiksicim');
    }
  } catch (err) {
    logger.error(err);
  }
}

/**
 * Sends a message and a link to all of the users in a server that has a specific role
 * @param {Discord.ChatInputCommandInteraction} interaction
 * @param {Discord.Client} client
 * @param {*} guild 
 * @param {*} roleID 
 * @param {*} title 
 * @param {*} description 
 * @param {*} eventID 
 */
async function sendToAll(interaction, client, guildID, roleID, title, description, eventLink) {
    const logger = new Logger(client)

    try {
        const loadingemoji = "<a:loading_circle:1402293830425903257> "
        let cnt = 0;

        await interaction.reply({ content: "Başlatılıyor...", flags: Discord.MessageFlags.Ephemeral })

        const sentMessage = await interaction.channel.send(`${loadingemoji} Kullanıcılar fetch'lenip hepsi birer birer DM'lerden taciz ediliyor... \n${loadingemoji} Guild alındı \n${loadingemoji} Üyeler alındı \n${loadingemoji} Üyeler ayıklandı \n${loadingemoji} ${cnt} Üyeye mesaj gönderildi`)

        const guild = await client.guilds.fetch(guildID)
        await sentMessage.edit(`${loadingemoji} Kullanıcılar fetch'lenip hepsi birer birer DM'lerden taciz ediliyor... \n✅ Guild alındı \n${loadingemoji} Üyeler alındı \n${loadingemoji} Üyeler ayıklandı \n${loadingemoji} ${cnt} Üyeye mesaj gönderildi`)

        const members = await guild.members.fetch();
        await sentMessage.edit(`${loadingemoji} Kullanıcılar fetch'lenip hepsi birer birer DM'lerden taciz ediliyor... \n✅ Guild alındı \n✅ Üyeler alındı \n${loadingemoji} Üyeler ayıklandı \n${loadingemoji} ${cnt} Üyeye mesaj gönderildi`)

        const targets = members.filter(member => member.roles.cache.has(roleID))
        await sentMessage.edit(`${loadingemoji} Kullanıcılar fetch'lenip hepsi birer birer DM'lerden taciz ediliyor... \n✅ Guild alındı \n✅ Üyeler alındı \n✅ Üyeler ayıklandı (${targets.size}) \n${loadingemoji} ${cnt} Üyeye mesaj gönderildi`)

        for (const[id, member] of targets) {
            try {
                await member.send(`**========================================**\n# **${`:flag_tr: ${title}** :flag_tr:` || "*empty*"}\n**========================================**  \n\n**💬 Açıklama:** \n ${description || "*empty*"} \n\n⛓️‍💥 Etkinlik: \n${eventLink || "discord.com"} \n**========================================**`)
                await wait(1200)
                cnt = cnt + 1
                await sentMessage.edit(`${loadingemoji} Kullanıcılar fetch'lenip hepsi birer birer DM'lerden taciz ediliyor... \n✅ Guild alındı \n✅ Üyeler alındı \n✅ Üyeler ayıklandı (${targets.size}) \n${loadingemoji} ${cnt} Üyeye mesaj gönderildi`)
                logger.log(`${member.user.username} Adlı kullanıcıya mesaj gönderildi.`)
            } catch (error) {
                logger.error(`${member.user.username} adl kullanıcıya mesaj gönderilemedi.`, error)
            }
        }

        return await sentMessage.edit(`✅ Kullanıcılar fetch'lenip hepsi birer birer DM'lerden taciz ediliyor... \n✅ Guild alındı \n✅ Üyeler alındı \n✅ Üyeler ayıklandı (${targets.size}) \n✅ ${cnt} Üyeye mesaj gönderildi \n **Tüm üyeler başarıyla bilgilendirildi.**`)
    } catch (error) {
        console.log(error)
    }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {downloadPixelya, voidFunc, gptFunc, sendToAll}