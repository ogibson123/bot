const Discord = require('discord.js');
//Basically my "Hello World" command when I first created this bot.
//Repeats the message that the user sends.

module.exports = {
  name: "echo",
  description: "Echoes the phrase given after the command",
  usage: "!echo (insert any phrase here)",
  run: async (bot, message, args) => {
    if(args.length === 0) 
        message.channel.send("Echo what? You didn't say anything!")
    else
        message.channel.send(args.join(' '));
  }
}