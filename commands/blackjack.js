const Discord = require('discord.js');
const money = require('../money.json');
const suits = ['Spades', 'Clubs', 'Hearts', 'Diamonds'];
var deck = [];
var gameInProgress = false;
var playerHand = [];
var dealerHand = [];
var playerBet = 0;
var currentPlayer = null;

module.exports = {
    name: "blackjack",
    run: async (bot, message, args) => {
        if(args.length===0) {
            if(!gameInProgress)
                message.channel.send("You didn't enter your bet!");
            else
                message.channel.send("Either choose to hit or stay.");
        } else if(args.length===1){
            if(args[0] > money[message.author.id].money)
                    return message.channel.send("You don't have that much money. Check your balance with !balance.")
            if(!gameInProgress)
                initializeGame(message, args);
            else
                processCommand(message, args);
        }
    }
}

function initializeGame(message, args){
    if(isNaN(args[0]) || args[0] <= 0){
        message.channel.send("Please enter an integer > 0.");
        return;
    }
    gameInProgress = true;
    playerBet = args[0];
    currentPlayer = message.author.id;
    deck = new Deck();
    playerHand.push(deck.drawCard());
    dealerHand.push(deck.drawCard());
    playerHand.push(deck.drawCard());
    dealerHand.push(deck.drawCard());
    console.log(dealerHand);

    //Check if anyone got blackjack
    let playerTotal = playerHand.reduce((total, card)=>total+card.getValue(), 0);
    let dealerTotal = dealerHand.reduce((total, card)=>total+card.getValue(), 0);
    if(playerTotal === 21 || dealerTotal === 21){
        gameOver(message, playerTotal, dealerTotal);
    } else {
        printGameState(message, playerTotal, dealerTotal);
    }
}

function printGameState(message, playerTotal, dealerTotal){
    const attachment = new Discord.MessageAttachment('./thumbnails/gamble.png', 'gamble.png');
        const embed = new Discord.MessageEmbed()
        .setColor("#00b524")
        .setTitle("Blackjack")
        .setDescription("Bet: $" + playerBet)
        .attachFiles(attachment)
        .setThumbnail("attachment://gamble.png")
        .addFields(
            {name: "**Your Hand:**", value: convertPlayerHandToString(playerHand, false) + "\nValue: " + playerTotal, inline: true},
            {name: "**Dealer's Hand:**", value: convertDealerHandToString(dealerHand, true), inline: true})
        .setFooter("Tip: Use !blackjack hit or !blackjack stay to either hit or stay.");
        
        message.channel.send({embed: embed});
}

function processCommand(message, args){
    let dealerStayed = false;
    let playerStayed = false;
    if(args[0].toLowerCase() === 'hit')
        playerHand.push(deck.drawCard());
    else if(args[0].toLowerCase() !== 'stay')
        return;
    if(args[0].toLowerCase() === 'stay')
        playerStayed = true;
    let playerTotal = playerHand.reduce((total, card)=>total+card.getValue(), 0);
    let dealerTotal = dealerHand.reduce((total, card)=>total+card.getValue(), 0);

    if(dealerTotal>17)
        dealerHand.push(deck.drawCard());
    else
        dealerStayed = true;
    console.log(dealerHand);
    if(playerTotal >= 21 || dealerTotal >= 21 || dealerStayed && playerStayed)
        gameOver(message, playerTotal, dealerTotal);
    else
        printGameState(message, playerTotal, dealerTotal);
}

function gameOver(message, playerTotal, dealerTotal){
    let playerWins = false;
    let tie = false;
    if(playerTotal === dealerTotal || playerTotal > 21 && dealerTotal > 21){
        tie = true;
    } else if (playerTotal > dealerTotal && playerTotal <= 21){
        playerWins = true;
    }
    if(tie){
        message.channel.send("Game over. It was a tie!\n You keep your money.");
    }
    if(playerWins){
        money[currentPlayer].money += playerBet;
        message.channel.send("Game over.\nYou won $" + playerBet);
    } else {
        money[currentPlayer].money -= playerBet;
        message.channel.send("Game over.\nYou lost $" + playerBet);
    }

    //Reset the game variables in case you wanna play again.
    printGameState(message, playerTotal, dealerTotal);
    playerHand = [];
    dealerHand = [];
    deck = [];
    gameInProgress = false;
    playerBet = 0;
    currentPlayer = null;
}

function convertPlayerHandToString(hand){
    let string = "";
    hand.forEach(card => {
        string+=card.val + " of " + card.suit + "\n";
        }
    )
    return string;
}

function convertDealerHandToString(hand){
    let string = "";
    let isFirstCard = true;
    hand.forEach(card => {
        if(isFirstCard){
            isFirstCard = false; string+=card.val + " of " + card.suit + "\n";
        } else
            string+='???\n'
        }
    )
    return string;
}

class Card{
    constructor(suit, val){
        this.val = val;
        this.suit = suit;
    }

    getValue(){
        if(typeof this.val === "string"){
            if(this.val === "Ace")
                return 11;
            else
                return 10;
        }
        return this.val;
    }
}

class Deck{
    constructor(){
        this.deck = [];
        for(let i = 0; i<4; i++){
            for(let j = 0; j<13; j++){
                let value = null;
                switch(j){
                    case 0:
                        value = 'Ace';
                        break;
                    case 10:
                        value = 'Jack';
                        break;
                    case 11:
                        value = 'Queen';
                        break;
                    case 12:
                        value = 'King';
                        break;
                    default:
                        value = j+1;
                }
                let card = new Card(suits[i], value);
                this.deck.push(card);
            }
        } 
    }

    //Picks a random card, then removes it from the deck.
    drawCard(){
        let card = this.deck[Math.floor(Math.random()*this.deck.length)];
        this.deck = this.deck.filter(elem => elem!=card);
        return card;
    }
}