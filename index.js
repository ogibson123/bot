const Discord = require('discord.js')
const botconfig = require('./botconfig.json')
const bot = new Discord.Client()
const fs = require('fs')
bot.commands = new Discord.Collection()

fs.readdir("./commands/", (err, files) => {

  if(err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if(jsfile.length == 0){
    console.log("WARNING: No commands found. You may need to reload the bot.");
    return;
  }

jsfile.forEach((f, i) =>{
  let props = require(`./commands/${f}`);
  console.log(`${f} loaded successfully`);
  bot.commands.set(props.name, props);
});

});

bot.on("ready", () => {
  console.log(bot.user.username + " is online")
});

bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === 'dm') return;
  message.content = message.content.toLowerCase();
  let content = message.content.split(" ");
  let command = content[0];
  let args = content.slice(1);
  let prefix = botconfig.prefix;

  //Check if the correct prefix was used
  if(command.charAt(0) != prefix)
      return;

  //Finally run the command
  let commandfile = bot.commands.get(command.slice(prefix.length));
  if(commandfile) commandfile.run(bot, message, args);
})

bot.login(botconfig.token);