module.exports = async(kaede) => {

const { QuickDB } = require('quick.db');
const db = new QuickDB();
const express = require("express");
const { join } = require("path");
const app = express();
const { request } = require('undici');
const { URLSearchParams } = require("url");
const ejs = require('ejs');
const { blue, green } = require("colors")
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const DisocrdStrategy = require("passport-discord").Strategy
const passport = require("passport");
const fetch = require("node-fetch");
const bodyParser = require('body-parser')
require('dotenv').config()
const morgan = require('morgan')
const { PermissionsBitField } = require("discord.js");

passport.use(

  new DisocrdStrategy({
    clientID: process.env.id,
    clientSecret: process.env.secret,
    callbackURL: 'https://Kaede-Website.thalleskraft.repl.co/callback',
    scope: ['identify', "guilds", "email"]
  },
                     
                     
          
 function (acessToken, refreshToken, profile, done){
  process.nextTick(function() {
    return done(null, profile);
     });
 } )
  )

app.use(session({
  store: new MemoryStore({checkPeriod:86400000}),
  secret: `kaedebot`,
  resave: false,
  saveUninotialized: false,
}))

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, done){
  done(null, user);
});

passport.deserializeUser(function(obj, done){
  done(null, obj);
});


app.set('view engine','ejs');
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.get('/login', async(req, res, next) => {

  next();
}, passport.authenticate("discord")
       
)

app.get("/deslogar", (req, res) => {
  req.session.destrory(() => {
    
  })
})
  
app.get("/callback", passport.authenticate("discord", {failureRedirect: "/gerenciar"}), function(req, res){

  res.redirect("/gerenciar");
  
})



  
  app.get("/", async function(req, res){
    

    res.render("pg_inicial", {
     kaede
    })

  })



app.get("/comandos", async function(req, res){
    

    res.render("comandos", {
     kaede
    })

  })

app.get("/daily", async function(req, res) {

  if (!req.user) return res.redirect("/login");

let userdb = await kaede.userdb.findOne({
         userID: req.user.id
     }) 

      if(!userdb){
         const newuser = new kaede.userdb({ userID: req.user.id })
        await  newuser.save();
         
         userdb = kaede.userdb.findOne({ userID: req.user.id })
      }

let tempo = false;
if (Date.now() < userdb.economia.daily) tempo = true;

const ms = async(ms) => {
  const seconds = ~~(ms/1000)
  const minutes = ~~(seconds/60)
  const hours = ~~(minutes/60)
  const days = ~~(hours/24)

  return { days, hours: hours%24, minutes: minutes%60, seconds: seconds%60 }
  };

  const atualizar = async() => {

    let moedas = Math.floor(Math.random() * 2500) + 11000;
    
    await kaede.userdb.updateOne({
         userID: req.user.id
     }, { $set: {
  "economia.money": userdb.economia.money + moedas,
  "economia.daily": Date.now() + require("ms")("12h"),
     }
     })
          

    let texto = `<h1>Parabéns!</h1><p><h2> Hoje você resgatou....</h2><p><h3>${moedas} Kaedecoins!`;

    return texto;
  }

  const calc = userdb.economia.daily - Date.now()

  let horario = `${ms(calc).hours}h ${ms(calc).minutes}m ${ms(calc).seconds}s`;

  res.render("users/daily", { kaede, userdb, atualizar, tempo,req, horario})
})

  
app.get("/api/commands/bot", (req, res) => {

  res.send({ commands: require("./comandos/bot.js") });
});

app.get("/api/commands/economia", (req, res) => {

  res.send({ commands: require("./comandos/economia.js") });
});

app.get("/api/commands/adm", (req, res) => {

  res.send({ commands: require("./comandos/administração.js") });
});



app.get("/gerenciar", async function(req, res){

if (!req.user) return res.redirect("/login");

await kaede.userdb.updateOne({
         userID: req.user.id
     }, { $set: {
  "email": req.user.email
     }
        })

  console.log(req.user.email)
       return res.render("main", {
         kaede, req
       })
})

app.get("/gerenciar/servers", async function(req, res){

if (!req.user) return res.redirect("/login");

let guilds = req.user.guilds.filter(g => g.permissions & 8);

let data = guilds;


       return res.render("servers", {
         req, data
       })
})


  app.get("/gerenciar/:id", async function(req, res){

if (!req.user) return res.redirect("/login");

  let servidor = kaede.guilds.cache.get(req.params.id)

  if (!servidor) return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=1038589877865959484&guild_id=${req.params.id}&permissions=8&redirect_uri=https%3A%2F%2FKaede-Website.thalleskraft.repl.co%2Fcallback&response_type=code&scope=email%20identify%20guilds%20bot%20applications.commands`);

  
  let data = req.user.guilds.filter(g => g.permissions & 8);
   
let guild = data.find(server => server.id === servidor.id)


if (!guild) return res.json({
  error: `Você não tem permissão`
})

let roles = await fetch(`https://discord.com/api/v10/guilds/${guild.id}/roles`, {
        method: "GET",
        headers: {
            "Authorization": `Bot ${process.env.token}`
        }
    }).then(res => res.json())
    .then(json => {return json})

let channels = await fetch(`https://discord.com/api/v10/guilds/${guild.id}/channels`, {
        method: "GET",
        headers: {
            "Authorization": `Bot ${process.env.token}`
        }
    }).then(res => res.json())
    .then(json => {return json})


    
res.render("config/main", { req, guild, kaede, roles, channels })
                        
})

app.post("/api/:id/save/autorole", async function(req, res){

if (!req.user) return res.redirect("/login");

  let servidor = kaede.guilds.cache.get(req.params.id)

  if (!servidor) return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=1038589877865959484&guild_id=${req.params.id}&permissions=8&redirect_uri=https%3A%2F%2FKaede-Website.thalleskraft.repl.co%2Fcallback&response_type=code&scope=email%20identify%20guilds%20bot%20applications.commands`);

  
  let data = req.user.guilds.filter(g => g.permissions & 8);
   
let guild = data.find(server => server.id === servidor.id)

if (!guild) return res.json({
  error: `Você não tem permissão`
})


  let cargo_id = req.body.role

  let cargo = servidor.roles.cache.get(cargo_id);

  if (!cargo) return res.redirect("/gerenciar/" + guild.id)

         let svdb = await kaede.svdb.findOne({
         guildId: servidor.id
     }) 

      if(!svdb){
         const newuser = new kaede.svdb({ guildId: servidor.id })
        await  newuser.save();
         
         svdb = kaede.svdb.findOne({ guildId: servidor.id })
      }
  
  await kaede.svdb.updateOne({
         guildId: servidor.id
     }, { $set: {
         "join.cargo": cargo.id
     }
     })

  res.render("sucesso/autorole", {
    req, guild
  })

})
  
  app.get("/api/user", function(req, res){
  if (!req.user) return res.redirect("/login");

 

let json = [{
  name: req.user.username,
  id: req.user.id,
  avatar: req.user.avatar
}]

res.json(json)

  })  

  //api/send_embed/<%= guild.id %>
  app.post("/api/send_embed/:id", async function(req, res){

    if (!req.user) return res.redirect("/login");

let embed = {}


let servidor = kaede.guilds.cache.get(req.params.id)

  if (!servidor) return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=1038589877865959484&guild_id=${req.params.id}&permissions=8&redirect_uri=https%3A%2F%2FKaede-Website.thalleskraft.repl.co%2Fcallback&response_type=code&scope=email%20identify%20guilds%20bot%20applications.commands`);

  
  let data = req.user.guilds.filter(g => g.permissions & 8);
   
let guild = data.find(server => server.id === servidor.id)

if (!guild) return res.json({
  error: `Você não tem permissão`
})
    
        
        if(req.body.title) {
            embed.title = req.body.title
        }

        if(req.body.description) {
            embed.description = req.body.description
        }

        if(req.body.footer) {
            embed.footer = {
                text: req.body.footer
            }
        }

        if(req.body.timestamp === "yes") {
            let date = new Date
            embed.timestamp = date.toISOString()
        }

        if(req.body.image) {
            embed.image = {
                url : req.body.image
            }
        }

        if(req.body.thumbnail) {
            embed.thumbnail  = {
                url : req.body.thumbnail
            }
        }

        if(req.body.color) {
            embed.color  =  parseInt(req.body.color.split("#")[1] , 16);
        }

        let body = {
            embeds: [embed],
        };
    let chat = kaede.channels.cache.get(`${req.body.channlid}`)

        chat.send({
          embeds: [embed]
        })

        res.render('sucesso/embed', { guild })
        
      })

           


  app.listen(process.env.PORT, async() => {
    setTimeout(() => {
        console.clear()
    console.log("Conectado!")
    }, 5000)
  })
}



async function DiscordRequest(endpoint, options) {

  const url = 'https://discord.com/api/v10/' + endpoint;

  if (options.body) options.body = JSON.stringify(options.body);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.token}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options
  });
if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }

  return res;
}