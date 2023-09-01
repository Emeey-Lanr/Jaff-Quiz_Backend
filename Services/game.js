const GameValidators = require("../Validators/game")
const playerModel = require("../models/Playersmodel")
const jwt = require('jsonwebtoken');
const quizModel = require("../models/QuizQuestionModel");

class Game {
  static async adminGameLogin(payload) {
    const { username, state, gameid, mode } = payload;
  try {
    const adminGameLoginValidator = await GameValidators.adminGameLogin(username, state, gameid)
    if (adminGameLoginValidator instanceof Error) {
      return new Error(adminGameLoginValidator.message)
    }
 
    const registerQuiz = await new playerModel(adminGameLoginValidator.data)
    const createQuiz = await registerQuiz.save()
    const adminCode = jwt.sign(
      {
        adminStatus: true,
        question: adminGameLoginValidator.quiz.quizSubject,
        quizID: adminGameLoginValidator.quiz.id,
        quizIdNumberPlayed: createQuiz.quizIdNumberPlayed,
        mode: mode,
      },

      process.env.GS,
      { expiresIn: "1d" }
    );
 return { token: adminCode, numberPlayed: createQuiz.quizIdNumberPlayed };
  } catch (error) {
    console.log(error)
    return new Error("An error occured")
  }
  }
  static async userGamePinVerification(payload) {
    const {password} = payload
    try {
      const quiz = await GameValidators.userGamePinVerification(password)
      if (quiz instanceof Error) {
        return new Error(quiz.message)
      }
      if (quiz.currentQuiz.multiple) {
        quiz.currentQuiz.quizMultiplePassword = quiz.currentQuiz.quizMultiplePassword.filter((content) => content !== password)
        const updateQuiz = await quizModel.findOneAndUpdate({_id:quiz.currentQuiz.id}, quiz.currentQuiz)
      }
      const userpin = jwt.sign(
        {
          adminStatus: false,
          quizID: quiz.currentQuiz.id,
          adminId: quiz.currentQuiz.adminId,
          subjectToBeDone:quiz.currentQuiz.subjectToBePlayedByPlyers,
        },
        process.env.GS,
        { expiresIn: "1d" }
      );

      return { userpin, lastGameUniqueId:quiz.gameCreated[quiz.gameCreated.length - 1].quizIdNumberPlayed};

    } catch (error) {
      return new Error("an error occured")
    }
  }
  static async savePlayerDetails(payload) {
    try {
      const verification = await GameValidators.savePlayerDetails(payload)
      if (verification instanceof Error) {
        return new Error(verification.message)
      }
      console.log(verification, )
      const updateQuiz = await playerModel.findByIdAndUpdate({_id: verification._id }, verification)
       console.log(verification.quizIdNumberPlayed, "this is the number played");
      const token = jwt.sign({
        adminStatus: false,
        quizID: payload.quizId,
        quizNumberPlayed: verification.quizIdNumberPlayed,
        playerInfo:payload
      },
        process.env.GS,
        {expiresIn:"7h"}
      )
      
      return token
    } catch (error) {
      return new Error("an error occured")
    }
  }
}

module.exports = Game