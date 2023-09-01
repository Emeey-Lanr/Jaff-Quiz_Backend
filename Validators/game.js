const adminModel = require("../models/adminModel");
const quizModel = require("../models/QuizQuestionModel");
const playerModel = require("../models/Playersmodel");
const jwtId = require("jsonwebtoken");
class GameValidators {
    static async adminGameLogin(username, state, gameid) {
     try {
       const findAdmin = await adminModel.findOne({ adminUserName: username })
       if (findAdmin === null) {
         return new Error("Admin not found")
       }
       const allQuiz = await quizModel.find({ adminId: findAdmin.id })
       if (allQuiz.length < 1) {
         return new Error("Invalid Identification");
       } 
      //  the particular quiz

       const specificQuiz = allQuiz.find((content) => content.quizId === gameid)
       if (!specificQuiz) {
         return new Error("Invalid quiz Id")
       }
       const player = await playerModel.find({ quizId: specificQuiz.id })
  let check = [];
        let gameRegistrationSchema = {
          adminId: findAdmin.id,
          quizId: specificQuiz.id,
          // this is used to check the number of times the game is being played
          quizIdNumberPlayed:specificQuiz.id + 1,
          players: [],
          result: [],
          state: state,
          class: specificQuiz.class,
          level: "",
          ranking: [],
          month: 0,
          year: 0,
          day: 0,
       };
        let turnTo = 0;
   

       if (player.length > 0) {
          check = player[player.length - 1].quizIdNumberPlayed.split("");
       }

       if (player.length > 0 && Number(check[check.length - 1]) === 5) {
         return new Error("Game limit reached");
       }

       if (player.length > 0) {
          
           turnTo = player[0].quizId + (Number(check[check.length - 1]) + 1);
           gameRegistrationSchema.quizIdNumberPlayed = turnTo.toString();
         
       }
        
      
       
       return { quiz: specificQuiz, data: gameRegistrationSchema }


       
     } catch (error) {
     
      return new Error("An error occured")
     }
  }
  static async userGamePinVerification(password) {
    try {
      const currentQuiz = await quizModel.findOne({ quizMultiplePassword: password });
      if (currentQuiz === null) {
        return new Error("Invalid Pin") 
      }
      const gameCreated = await playerModel.find({ quizId: currentQuiz.id })
      if (gameCreated.length < 1) {
        return new Error("Quiz can't be accessed")
      }

      return { currentQuiz, gameCreated }
    } catch (error) {
      return new Error("An error occured")
    }
    
  }
  static async savePlayerDetails(payload) {
    try {
      const player = await playerModel.find({ quizId:payload.quizId })  
      if (player.length < 1) {
      return new Error('Game not avaliable')
      }  
      
      const currentGame = player[player.length - 1]
      // currentGame.push(payload)
      const currentQuiz = await playerModel.findOne({ quizIdNumberPlayed: currentGame.quizIdNumberPlayed })
      if (currentQuiz === null) {
        return new Error("")
      }
       let checKIfNameExist = currentQuiz.players.filter((content)=> content.toUpperCase() === payload.playerName.toUpperCase())
      if (checKIfNameExist.length > 0) {
        return new Error("User name already exist")
      }
      currentQuiz.players.push(payload.playerName)

      return currentQuiz 
      
    } catch (error) {
    
      return new Error("An error occured")
    }
  }
}
module.exports = GameValidators