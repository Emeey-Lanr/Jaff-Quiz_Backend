const mongoose = require("mongoose")
const playerSchema = mongoose.Schema({
    adminId:{type:String},
    quizId: { type: String },
    quizIdNumberPlayed:{type:String},
    players: { type: Array },
    result:{type:Array}
    
})


const playerModel = mongoose.model("players", playerSchema)




module.exports = playerModel