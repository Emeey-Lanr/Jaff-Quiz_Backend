const GameValidators = require("../Validators/game")
const playerModel = require("../models/Playersmodel")
const jwt = require('jsonwebtoken');
const quizModel = require("../models/QuizQuestionModel");
class Game {
  static async adminGameLogin(payload) {
    const { username, state, gameId, mode } = payload;
    try {
      const quizGame = await GameValidators.adminGameLogin(
        username,
        state,
        gameId
      );
      if (quizGame instanceof Error) {
        return new Error(quizGame.message);
      }
      const newQuizGame = new playerModel(quizGame.game);
      const createQuizGame = await newQuizGame.save();
      const token = jwt.sign(
        {
          adminStatus: true,
          question: quizGame.quiz[0].quizSubject,
          quizID: quizGame.quiz[0]._id,
          quizIdNumberPlayed: createQuizGame.quizIdNumberPlayed,
          mode: mode,
        },
        process.env.GS,
        {
          expiresIn: "7d",
        }
      );
      return { token, numberPlayed: createQuizGame.quizIdNumberPlayed };
    } catch (error) {
      return new Error("an error occured");
    }
  }
  static async userGamePinVerification(payload) {
    const {password} = payload
    try {
      const verification = await GameValidators.userGamePinVerification(password)
      if (verification instanceof Error) {
        return new Error(verification.message)
      }
      const quiz = verification.quiz
      if (verification.quiz.mutliple) {
        quiz.quizMultiplePassword = quiz.quizMultiplePassword.filter((content) => content !== password)
        const updateQuiz = await quizModel.findOneAndUpdate({_id:quiz._id}, quiz)
      }
      const token = jwt.sign(
        {
          adminStatus: false,
          quizID: quiz._id,
          adminId: quiz.adminId,
          subjectToBeDone: quiz.subjectToBePlayedByPlyers,
        },
        process.env.GS,
        { expiresIn: "7h" }
      );
      return { game: verification.player,token }
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
      const updateQuiz = await playerModel.findByIdAndUpdate({_id: verification._id }, verification)
      
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