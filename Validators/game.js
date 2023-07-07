const adminModel = require("../models/adminModel");
const quizModel = require("../models/QuizQuestionModel");
const playerModel = require("../models/Playersmodel");
const jwtId = require("jsonwebtoken");
class GameValidators {
    static async adminGameLogin(username, state, gameid) {
      const admin = await adminModel.findOne({ adminUserName: username });
      if (admin === null) {
        return new Error("Invalid quiz Id");
      }
      const quiz = await quizModel.find({ adminId: admin.id });
      if (quiz.length < 0) {
        return new Error();
      }
      const theParticularQuiz = quiz.filter(
        (content) => content.quizId === gameid
      );
      const player = await playerModel.find({
        quizId: theParticularQuiz[0]._id,
      });
      let check = [];
      let status;
      let gameRegistrationSchema = {
        adminId: admin.id,
        quizId: theParticularQuiz[0]._id,
        // this is used to check the number of times the game is being played
        quizIdNumberPlayed: theParticularQuiz[0]._id + 1,
        players: [],
        result: [],
        state: state,
        class: theParticularQuiz[0].class,
        level: "",
        ranking: [],
        month: 0,
        year: 0,
        day: 0,
      };
      let turnTo = 0;
      if (player.length < 0) {
        return new Error("Game limit reached");
      }
      check = player[player.length - 1].quizIdNumberPlayed.split("");
      turnTo = player[0].quizId + (Number(check[check.length - 1]) + 1);

        gameRegistrationSchema.quizIdNumberPlayed = turnTo.toString()
        return { game: gameRegistrationSchema, quiz: theParticularQuiz }
    }
  static async userGamePinVerification(password) {
      try {
        const quiz = await quizModel.findOne({ quizMultiplePassword: password })
        if (quiz === null) {
          return new Error("Invalid Pin")
        }
        const player = await playerModel.find({ quizId: quiz.id })
        if (player.length < 1) {
          return new Error("Quiz Game can't be accessed")
        }
        return {quiz, player}
      } catch (error) {
        
      }
  }
  static async savePlayerDetails(payload) {
    try {
      const player = await playerModel.find({ quizId:payload.quizId })  
      if (player.length < 1) {
      return new Error('Game not avaliable')
      }  
      
      const currentGame = player[player.length - 1]
      currentGame.push(payload)
      const currentQuiz = await playerModel.findOne({ quizIdNumberPlayed: currentGame.quizIdNumberPlayed })
      if (currentQuiz === null) {
        return new Error()
      }
       let checKIfNameExist = currentQuiz.players.filter((content)=> content.toUpperCase() === payload.playerName.toUpperCase())
      if (checKIfNameExist.length > 0) {
        return new Error("User name already exist")
      }
      currentQuiz.players.push(payload.playerName)

      return currentQuiz 
      
    } catch (error) {
      
    }
  }
}
module.exports = GameValidators