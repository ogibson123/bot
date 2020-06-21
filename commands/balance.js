const fs = require("fs");
const money = require("../money.json");

module.exports = {
    name: "balance",
    run: async (bot, message, args) => {
        getBalance(bot, message);
    }
  }

  function getBalance(bot, message){
    let user = message.author;
    if(!money[user.id]){
        money[user.id] = {
            name: user.username,
            money: 1000
        };
    fs.writeFile("./money.json", JSON.stringify(money), err => {
        if(err) console.log(err);
        });
    }

    message.channel.send(user.username + " has $" + money[user.id].money);
  }