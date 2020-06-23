const Discord = require('discord.js');
const cheerio = require('cheerio');
const rp = require('request-promise');
const states = require('../states.json');

module.exports = {
    name: "covid",
    description: "Fetches COVID-19 statistics from the web.",
    usage: "!covid, !covid usa, !covid state",
    run: async (bot, message, args) => {
      if(args.length === 0) 
          getGeneralCovidStats(message);
      else if(args.length === 1){
          if(args[0]==='usa'){
              getUSACovidStats(message);
          }
          else if(args[0]==='state'){
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

  //Gets general Covid stats for the USA
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

  //Gets top 12 states, ranked by COVID cases.
  function getStateCovidStats(message, args){
    const options = {
        url: 'https://covidtracking.com/api/v1/states/current.json',
        json: true
    };

    rp(options).then((data) => {
        let sortedData = data.sort((a, b) => b.positive-a.positive).slice(0, 12);
        sortedData = sortedData.map(element => {return {"state": convertState(element.state), "cases": element.positive, "deaths": element.death}});
        console.log(sortedData);

        const attachment = new Discord.MessageAttachment('./thumbnails/covid19.png', 'covid19.png');
        const embed = new Discord.MessageEmbed()
        .setColor("#00b524")
        .setTitle("COVID-19 by State")
        .setDescription("The top 12 states with the most COVID cases.\n")
        .attachFiles(attachment)
        .setThumbnail("attachment://covid19.png")
        .setTimestamp()
        .addFields(
            {name: "1. " + sortedData[0].state, value: "Total Cases: " + sortedData[0].cases + "\nTotal Deaths: " + sortedData[0].deaths, inline: true},
            {name: "2. " + sortedData[1].state, value: "Total Cases: " + sortedData[1].cases + "\nTotal Deaths: " + sortedData[1].deaths, inline: true},
            {name: "3. " + sortedData[2].state, value: "Total Cases: " + sortedData[2].cases + "\nTotal Deaths: " + sortedData[2].deaths, inline: true},
            {name: "4. " + sortedData[3].state, value: "Total Cases: " + sortedData[3].cases + "\nTotal Deaths: " + sortedData[3].deaths, inline: true},
            {name: "5. " + sortedData[4].state, value: "Total Cases: " + sortedData[4].cases + "\nTotal Deaths: " + sortedData[4].deaths, inline: true},
            {name: "6. " + sortedData[5].state, value: "Total Cases: " + sortedData[5].cases + "\nTotal Deaths: " + sortedData[5].deaths, inline: true},
            {name: "7. " + sortedData[6].state, value: "Total Cases: " + sortedData[6].cases + "\nTotal Deaths: " + sortedData[6].deaths, inline: true},
            {name: "8. " + sortedData[7].state, value: "Total Cases: " + sortedData[7].cases + "\nTotal Deaths: " + sortedData[7].deaths, inline: true},
            {name: "9. " + sortedData[8].state, value: "Total Cases: " + sortedData[8].cases + "\nTotal Deaths: " + sortedData[8].deaths, inline: true},
            {name: "10. " + sortedData[9].state, value: "Total Cases: " + sortedData[9].cases + "\nTotal Deaths: " + sortedData[9].deaths, inline: true},
            {name: "11. " + sortedData[10].state, value: "Total Cases: " + sortedData[10].cases + "\nTotal Deaths: " + sortedData[10].deaths, inline: true},
            {name: "12. " + sortedData[11].state, value: "Total Cases: " + sortedData[11].cases + "\nTotal Deaths: " + sortedData[11].deaths, inline: true});
        
            message.channel.send({embed: embed});
        });

  }

  function convertState(stateAbbreviation){
      return states.find(state => state.abbreviation === stateAbbreviation).name;
  }