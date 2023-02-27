const { Client, Events, GatewayIntentBits } = require('discord.js');
const { connect } = require("mongoose");
require("dotenv").config;

const KaedeBot = new Client({
  intents: [GatewayIntentBits.Guilds] 
});

KaedeBot.once("ready", () => {

//connect(process.env.mongo)
  
  require("./web.js")(KaedeBot)
})

//KaedeBot.svdb = require("./mongo/server.js");
KaedeBot.login(process.env.token)