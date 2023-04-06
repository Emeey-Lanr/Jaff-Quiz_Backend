const mongoose = require("mongoose")
const playerSchema = mongoose.Schema({
  adminId: { type: String },
  quizId: { type: String },
  quizIdNumberPlayed: { type: String },
  players: { type: Array },
  result: { type: Array },
    state: { type: String },
  level: { type: String },
  ranking:{type:Array},
  month: { type: Number },
  year: { type: Number },
  day: { type: Number },
  likes: { type: Number },
  view:{type:Number},
});


const playerModel = mongoose.model("players", playerSchema)




module.exports = playerModel