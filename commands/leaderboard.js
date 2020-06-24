const Discord = require("discord.js");
const moneyStats = require("../money.json");

//Shows who has the most money on the server
module.exports = {
    name: "leaderboard",
    description: "Shows a ranking of the users with the most money.",
    usage: "!leaderboard",
    run: async (bot, message, args) => {
        let memberList = message.guild.members.cache;
        ranking = [];
        memberList.forEach(member => {
            let userid = member.user.id;
            let username = member.user.username;

            //Check if the user has a balance (some users may not) 
            if(moneyStats[userid]){
                let netWorth = moneyStats[userid].money;
                ranking.push({name: username, balance: netWorth});
            }
        });
        const attachment = new Discord.MessageAttachment('./thumbnails/money.png', 'money.png');
        const embed = new Discord.MessageEmbed()
        .setTitle("$$ Server Leaderboard $$")
        .setColor('#00b524')
        .attachFiles(attachment)
        .setThumbnail("attachment://money.png")
        .setTimestamp();

        ranking = ranking.sort((a, b) => b.balance - a.balance);
        resultString = "";
        for(let i = 0; i<ranking.length; i++){
            resultString += i+1 + ". " + ranking[i].name + " $" + ranking[i].balance + "\n";
        }
        embed.setDescription(resultString);
        message.channel.send({embed: embed});
    }
}