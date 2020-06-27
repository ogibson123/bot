const Discord = require("discord.js");
const rp = require('request-promise');

module.exports = {
    name: "nba",
    description: "Retrieve NBA stats from a player or team for this season.",
    usage: "!nba \n!nba (1 word team name, i.e. 'celtics', 'lakers'), \n!nba (player's first name, last name)",
    run: async(bot, message, args) => {
        if(args.length === 0){
            showDirections(message);
        }
        else if(args.length === 1){
            getTeamStats(bot, message, args);
        }
        else if(args.length === 2){
            getPlayerStats(bot, message, args);
        }
        else{
            message.channel.send("Invald command. Type !help nba for more information.");
        }
    }
}

//Fetches the given team's stats, as specified by the user
async function getTeamStats(bot, message, args){
    let options = {
        url: "https://www.balldontlie.io/api/v1/teams",
        json: true
    };
    var basicTeamInfo;
    var teamStats = {};
    await rp(options).then(list => {
        basicTeamInfo = list.data.filter(team => team.name.toLowerCase() === args[0].toLowerCase())[0]; 
    });
    var teamID = basicTeamInfo.id;
    teamStats.name = basicTeamInfo.full_name;
    teamStats.conference = basicTeamInfo.conference;
    teamStats.division = basicTeamInfo.division;
    teamStats.abbreviation = basicTeamInfo.abbreviation;
    teamStats.wins = 0;
    teamStats.losses = 0;

    //Go through the team's games and count the wins and losses 
    //This is because the API doesn't give us wins/losses, but it DOES give us game outcomes.
    options.url = "https://www.balldontlie.io/api/v1/games?per_page=100&seasons[]=2019&team_ids[]=" + teamID;
    await rp(options).then(games => {
        games.data.forEach(game => {
            if(game.home_team.id === teamID){
                if(game.home_team_score > game.visitor_team_score)
                    teamStats.wins++;
                else if(game.visitor_team_score > game.home_team_score)
                    teamStats.losses++;
            }
            else{
                if(game.home_team_score > game.visitor_team_score)
                    teamStats.losses++;
                else if(game.visitor_team_score > game.home_team_score)
                    teamStats.wins++;
            }
        })
    });

    const attachment = new Discord.MessageAttachment('./thumbnails/nba.png', 'nba.png');
    const embed = new Discord.MessageEmbed()
        .setTitle(teamStats.name + " 2019-2020 Season")
        .setColor("#00b524")
        .attachFiles(attachment)
        .setThumbnail("attachment://nba.png")
        .setDescription(teamStatsToString(teamStats))
    message.channel.send({embed: embed});
}

//Fetches a given player's stats, specified by the user
async function getPlayerStats(bot, message, args){
    const url = "https://balldontlie.io/api/v1/players?search=" + args[0] + "_" + args[1];
    let options = {
        url: url,
        json: true
    };
    var player;
    var playerStats = {};
    await rp(options).then(elem => {
        player = elem.data[0];
    });

    if(!player){
        message.channel.send("Could not find that player. Type !help nba for more info.");
        return;
    }

    //Setting their non-game stats (name, etc)
    var id = player.id;
    playerStats.name = player.first_name + " " + player.last_name;
    playerStats.height = player.height_feet + "'" + player.height_inches + '"';
    playerStats.team = player.team.full_name;
    playerStats.position = player.position;

    //Now, pull their game stats (points, etc)
    var seasonAverages;
    options.url = "https://www.balldontlie.io/api/v1/season_averages?season=2019&player_ids[]=" + id;
    await rp(options).then(elem => {
        seasonAverages = elem.data[0];
    });

    if(!seasonAverages){
        message.channel.send("No data for that player this season.");
        return;
    }

    playerStats.points = seasonAverages.pts;
    playerStats.assists = seasonAverages.ast;
    playerStats.rebounds = seasonAverages.reb;
    playerStats.fgPercent = (seasonAverages.fg_pct*100).toFixed(2) + "%";
    playerStats.fgThreePercent = (seasonAverages.fg3_pct*100).toFixed(2) + "%";

    const attachment = new Discord.MessageAttachment('./thumbnails/nba.png', 'nba.png');
    const embed = new Discord.MessageEmbed()
        .setTitle(playerStats.name + " 2019-2020 NBA Stats")
        .setColor("#00b524")
        .attachFiles(attachment)
        .setThumbnail("attachment://nba.png")
        .setDescription(playerStatsToString(playerStats));
    message.channel.send({embed: embed});
}

//Shows some extra info about the command if the user doesn't put in any arguments
function showDirections(message){
    const attachment = new Discord.MessageAttachment('./thumbnails/nba.png', 'nba.png');
    const embed = new Discord.MessageEmbed()
        .setTitle("About The !nba Command")
        .setColor("#00b524")
        .attachFiles(attachment)
        .setThumbnail("attachment://nba.png")
        .setDescription("Note: All stats are pulled from the balldontlie.io API!")
        .addFields(
            {name: "GET STATS BY TEAM", value: "Enter the one-word representation of the team to fetch its stats. \nexample: **!nba lakers** or **!nba celtics**"},
            {name: "GET STATS BY PLAYER", value: "Enter a player's first and last name to get their stats. \nexample: **!nba lebron james**"}
        );
    message.channel.send({embed: embed});
}

//Format a player's stats to fit nicely in the Discord embed
function playerStatsToString(playerStats){
    let result = "";
    result += "**Name: **" + playerStats.name + "\n";
    result += "**Team: **" + playerStats.team + "\n";
    result += "**Height: **" + playerStats.height + "\n";
    result += "**Position: **" + playerStats.position + "\n";
    result += "**Points Per Game: **" + playerStats.points + "\n";
    result += "**Assists Per Game: **" + playerStats.assists + "\n";
    result += "**Rebounds Per Game: **" + playerStats.rebounds + "\n";
    result += "**FG: **" + playerStats.fgPercent + "\n";
    result += "**3pt FG: **" + playerStats.fgThreePercent + "\n";
    return result;
}

//Format a team's stats to fit nicely in the Discord embed
function teamStatsToString(teamStats){
    let result = "";
    result += "**Wins: **" + teamStats.wins + "\n";
    result += "**Losses: **" + teamStats.losses + "\n";
    result += "**Conference: **" + teamStats.conference + "\n";
    result += "**Division: **" + teamStats.division + "\n";
    result += "**Abbreviation: **" + teamStats.abbreviation + "\n";
    return result;
}