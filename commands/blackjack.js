const Discord = require('discord.js');
const fs = require('fs')
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
    description: "Bet some of your money on a game of Blackjack. You can hit or stay after placing a bet and seeing your cards.",
    usage: "!blackjack {bet amount}, !blackjack hit, !blackjack stay",
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
    
    //Draw the 2 initial cards
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
            {name: "**Your Hand:**", value: convertPlayerHandToString(playerHand) + "\nValue: " + playerTotal, inline: true},
            {name: "**Dealer's Hand:**", value: convertDealerHandToString(dealerHand), inline: true})
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
    
    //Dealer should draw a card if their value is under 17
    if(dealerTotal<17){
        dealerHand.push(deck.drawCard());
    } else {
        dealerStayed = true;
    }
    let newDealerTotal = dealerHand.reduce((total, card)=>total+card.getValue(), 0);
    console.log(dealerHand);
    
    //Check if game should end
    if(playerTotal >= 21 || newDealerTotal >= 21 || dealerStayed && playerStayed)
        gameOver(message, playerTotal, newDealerTotal);
    else
        printGameState(message, playerTotal, dealerTotal);
}

function gameOver(message, playerTotal, dealerTotal){
    let playerWins = false;
    let tie = false;
    if(playerTotal === dealerTotal || playerTotal > 21 && dealerTotal > 21){
        tie = true;
    } else if (dealerTotal > 21 || playerTotal > dealerTotal && playerTotal <= 21){
        playerWins = true;
    }

    scoreString = "\nYou had: " + playerTotal + "\nDealer had: " + dealerTotal;
    if(tie){
        message.channel.send("Game over. It was a tie!\n You keep your money." + scoreString);
    }
    else if(playerWins){
        money[currentPlayer].money += playerBet;
        fs.writeFile("../money.json", JSON.stringify(money), err => {
            if(err) console.log(err);
        });
        message.channel.send("Game over.\nYou won $" + playerBet + scoreString);
    } else {
        money[currentPlayer].money -= playerBet;
        fs.writeFile("../money.json", JSON.stringify(money), err => {
            if(err) console.log(err);
        });
        message.channel.send("Game over.\nYou lost $" + playerBet + scoreString);
    }

    //Print the final game state, but this time with the dealer's first card un-hidden.
    const attachment = new Discord.MessageAttachment('./thumbnails/gamble.png', 'gamble.png');
    const embed = new Discord.MessageEmbed()
        .setColor("#00b524")
        .setTitle("Blackjack")
        .setDescription("Bet: $" + playerBet)
        .attachFiles(attachment)
        .setThumbnail("attachment://gamble.png")
        .addFields(
            {name: "**Your Hand:**", value: convertPlayerHandToString(playerHand) + "\nValue: " + playerTotal, inline: true},
            {name: "**Dealer's Hand:**", value: convertPlayerHandToString(dealerHand), inline: true})
        .setFooter("Your balance may have updated. Check it with !balance.");
        
        message.channel.send({embed: embed});

    //Reset the game variables in case you want to play again.
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
        //Hide the dealer's first card from the player
        if(isFirstCard)
            string+='???\n'
        else
            string+=card.val + " of " + card.suit + "\n";
        isFirstCard = false;
    });
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