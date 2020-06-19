const Discord = require("discord.js");
const commandList = require("./commandList.json");

module.exports = {
    name: "help",
    run: async (bot, message, args) =>{
        if(args.length === 0)
            displayHelpNoArgs(message, args);
        else
            displayHelpWithArgs(message, args);
    }
}

function displayHelpNoArgs(message, args){
    const attachment = new Discord.MessageAttachment('./thumbnails/questionmark.png', 'questionmark.png');
    const embed = new Discord.MessageEmbed()
    .setTitle("Server Help")
    .setColor("#fff70d")
    .setDescription("Here is a list of all the server commands. Use the prefix ' **!** ' to call a command.")
    .attachFiles(attachment)
    .setThumbnail("attachment://questionmark.png")
    .addField("``help`` ``covid`` ``echo`` ``meme``")
    .setFooter("Call !help followed by a command to learn more about a command.");

    message.channel.send({embed: embed});
}

function displayHelpWithArgs(message, args){
    let commandName = "";
    let commandDescription = "";
    let commandUsage = "";
    commandList.commands.forEach(cmd => {
        if(cmd.name.toLowerCase() === args[0]){
            commandName = cmd.name;
            commandDescription = cmd.description;
            commandUsage = cmd.usage;
        }
    });
    const attachment = new Discord.MessageAttachment('./thumbnails/questionmark.png', 'questionmark.png');
    const embed = new Discord.MessageEmbed()
    .setTitle("About the !" + args[0] + " command")
    .setColor("#fff70d")
    .attachFiles(attachment)
    .setThumbnail("attachment://questionmark.png")
    .addFields(
        {name: "**Command:**", value: commandName},
        {name: "**Description:**", value: commandDescription},
        {name: "**Usage:**", value: commandUsage}
    )

    message.channel.send({embed: embed});
}