const quizModel = require("../models/QuizQuestionModel");
const adminModel = require("../models/adminModel");
const {collectionFunction} = require("../Validators/searchResult");
class SearchResult {
  static async searchAdmin(SearchIdentification, name) {
    try {
        const admin = await adminModel.find({ searchId: SearchIdentification });
        if (admin.length < 1) {
            return new Error("no user found")
        }
        const userFound = admin.filter(
          (admins, id) =>
            admins.adminUserName
              .toUpperCase()
              .indexOf(name.toUpperCase()) > -1
        );
        if (userFound.length < 1) {
            return new Error("no user found")
        }
        console.log(userFound, ":LKJHGF")
        return userFound
    } catch (error) {
        console.log(error)
       return new Error("an error occured")
    }
    }
    static async searchCollection(payload) {
        const {adminId,  data} = payload
        try {
            const quiz = await quizModel.find({ adminId: adminId })
            if (quiz.length < 1) {
                return new Error("no result found")
            }
            const collection = quiz.filter((quizCollection) => quizCollection.class ===  payload.class)
            if (collection.length < 1) {
                return new Error("no result found")
            }
            const collectionLookedFor = collection.filter((col) => col.quizName.toUpperCase().indexOf(data.toUpperCase()) > -1)
            if (collectionLookedFor.length < 1) {
                 return new Error("no result found")
            }
            return collectionLookedFor
        } catch (error) {
            return new Error("an error occured")
        }
    }
    static async findQuizPlayed(payload) {
        const { quizId,locked, acessPass } = payload;
        try {
            const quiz = await quizModel.findOne({ _id: quizId });
            if (quiz === null) { 
                return new Error("an error occured")
            }
            const collectResult = await collectionFunction(quizId)
            if (collectResult instanceof Error) {
                return new Error(collectResult.message)
            }
            console.log(quiz, acessPass);
            if (locked === "yes") {
                if (quiz.quizResultAcessPassword !== acessPass) {
                  return new Error("Invalid password")   
                }
            }

            return collectResult 
            

        } catch (error) {
            
        }
   
    }
}

module.exports = SearchResult