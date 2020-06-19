const Discord = require('discord.js');
const cheerio = require('cheerio');
const rp = require('request-promise');

module.exports = {
    name: "covid",
    run: async (bot, message, args) => {
      if(args.length == 0) 
          getGeneralCovidStats(message);
      else if(args.length == 1){
          if(args[0]=='usa'){
              getUSACovidStats(message);
          }
          else{
              getStateCovidStats(message, args);
          }
      }
  }
  }

  // Fetches general Covid stats if the user provides no arguments.
  function getGeneralCovidStats(message){
    const options = {
        url: 'https://thevirustracker.com/free-api?global=stats',
        json: true
    };

    rp(options).then((data) => {
        result = data.results[0]

        const attachment = new Discord.MessageAttachment('./thumbnails/covid19.png', 'covid19.png');
        const embed = new Discord.MessageEmbed()
        .setColor("#00b524")
        .setTitle("COVID-19 Worldwide Stats")
        .attachFiles(attachment)
        .setThumbnail("attachment://covid19.png")
        .addFields(
            {name: "**Total Cases:**", value: result.total_cases},
            {name: "**Total Deaths:**", value: result.total_deaths},
            {name: "**Total Recoveries:**", value: result.total_recovered})
        .setFooter("Use the !help command if you're confused about anything!");
        
        message.channel.send({embed: embed});
    });

  }

  function getUSACovidStats(message){
    const options = {
        url: 'https://api.thevirustracker.com/free-api?countryTotal=US',
        json: true
    };
    rp(options).then((data) => {
        result = data.countrydata[0]

        const attachment = new Discord.MessageAttachment('./thumbnails/covid19.png', 'covid19.png');
        const embed = new Discord.MessageEmbed()
        .setColor("#00b524")
        .setTitle("COVID-19 USA Stats")
        .attachFiles(attachment)
        .setThumbnail("attachment://covid19.png")
        .addFields(
            {name: "**Total Cases:**", value: result.total_cases},
            {name: "**Total Deaths:**", value: result.total_deaths},
            {name: "**Total Recoveries:**", value: result.total_recovered},
            {name: "**Danger Ranking:**", value: '#' + result.total_danger_rank}
            )
        .setFooter("Use the !help command if you're confused about anything!");
        
        message.channel.send({embed: embed});
    });
  }

  function getStateCovidStats(message, args){

  }