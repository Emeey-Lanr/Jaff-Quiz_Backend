const mongoose = require("mongoose");
const quizSchema = mongoose.Schema({
  adminId: { type: String },
  class: { type: String },
  quizName: { type: String },
  quizPin: { type: String},
  quizId: { type: String, unique: true },
  quizSubject: { type: Array },
  subjectToBePlayedByPlyers: { type: Array },
  multiple: { type: Boolean },
  quizMultiplePassword: { type: Array},
  quizResultAcessPassword: { type: String },
  locked:{type:Boolean}
});

const quizModel = mongoose.model("quiz-collection", quizSchema);

module.exports = quizModel;
