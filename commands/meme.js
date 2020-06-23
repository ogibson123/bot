const Discord = require('discord.js');
const randomPuppy = require("random-puppy");

module.exports = {
    name: "meme",
    description: "Pull a random meme from Reddit.",
    usage: "!meme",
    run: async(bot, message, args) => {
        fetchRandomMeme(message);
    }
}

async function fetchRandomMeme(message){
    const subs = ["memes", "me_irl", "deepfriedmemes", "dankmemes"];
    const chosenSub = subs[Math.floor(Math.random()*subs.length)]
    const img = await randomPuppy(chosenSub);
    const embed = new Discord.MessageEmbed()
    .setColor("#00b524")
    .setImage(img)

    message.channel.send({embed: embed});
}