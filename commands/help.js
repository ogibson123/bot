const Discord = require("discord.js");

module.exports = {
    name: "help",
    description: "Get help with server commands.",
    usage: "!help, !help (insert command name)",
    run: async (bot, message, args) =>{
        if(args.length === 0)
            displayHelpNoArgs(bot, message, args);
        else
            displayHelpWithArgs(bot, message, args);
    }
}

//Displays all commands in the server
function displayHelpNoArgs(bot, message, args){
    let allCommands = "";
    bot.commands.forEach(command => {
        allCommands += "``" + command.name + "`` ";
    });
    console.log(allCommands);
    const attachment = new Discord.MessageAttachment('./thumbnails/questionmark.png', 'questionmark.png');
    const embed = new Discord.MessageEmbed()
    .setTitle("Server Help")
    .setColor("#fff70d")
    .setDescription("Here is a list of all the server commands. Use the prefix ' **!** ' to call a command.")
    .attachFiles(attachment)
    .setThumbnail("attachment://questionmark.png")
    .addField(allCommands)
    .setFooter("Call !help followed by a command to learn more about a command.");

    message.channel.send({embed: embed});
}

//Displays information about a specific command, given.
function displayHelpWithArgs(bot, message, args){
    let targetFile = bot.commands.get(args[0]);
    if(!targetFile){
        message.channel.send("That command does not exist.");
        return;
    }
    let commandName = targetFile.name;
    let commandDescription = targetFile.description;
    let commandUsage = targetFile.usage;

    const attachment = new Discord.MessageAttachment('./thumbnails/questionmark.png', 'questionmark.png');
    const embed = new Discord.MessageEmbed()
    .setTitle("About the !" + args[0] + " command")
    .setColor("#fff70d")
    .attachFiles(attachment)
    .setThumbnail("attachment://questionmark.png")
    .addFields(
        {name: "**Command Name:**", value: commandName.charAt(0).toUpperCase()+commandName.slice(1)},
        {name: "**Description:**", value: commandDescription},
        {name: "**Usage:**", value: commandUsage}
    )

    message.channel.send({embed: embed});
}