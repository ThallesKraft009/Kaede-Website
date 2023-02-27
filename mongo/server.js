const { Schema, model } = require("mongoose");

const sv = new Schema({
    guildId: { type: String },


  ticket: {
    chat: { type: String },
    title: { type: String },
    description: { type: String },
    cargo: { type: String }
  },

  join: {
    cargo: { type: String, default: "sem"}
  },

  logs: {
    msg: { type: String, default: "sem" }
  },

  welcome: {
    embed: { type: Boolean },
    content: { type: String },
    author_name: { type: String },
    author_url: { type: String },
    title: { type: String },
    description: { type: String },
    cor: { type: String, default: "Random" },
    chat: { type: String },
    ativado: { type: Boolean, default: false }
  },

  starboard: {
    chat: { type: String, default: "n" }
  },

  verificacao: {
    cargo: { type: String }
  }
  

})

module.exports = model("Kaede-Servers", sv);