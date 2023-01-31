const mongoose = require("mongoose")
const quizSchema = mongoose.Schema({
    adminId: { type: String },
    class: { type: String },
    quizName: { type: String },
    quizPin: { type: String },
    quizSubject: { type: Array },
    
})

const quizModel = mongoose.model("quiz-collection", quizSchema)




module.exports = quizModel