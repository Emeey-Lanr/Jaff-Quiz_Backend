const adminModel = require('../models/adminModel')
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const quizModel = require("../models/QuizQuestionModel")
class AdminValidation {
    static async signup(body) {
         const { adminEmail, adminUserName } = body;
        try {
            console.log(adminEmail, adminUserName)
            const checkIfEmailExist = await adminModel.findOne({ adminEmail })
            if (checkIfEmailExist !== null) {
                return new Error("Email already exist")
            }
            const checkUserNameExist = await adminModel.findOne({ adminUserName })
       
            if (checkUserNameExist !== null) {
                return new Error("Useranme already exist")
            }

            
        } catch (error) {
            return new Error(error.message)
        }
        
    }
    static async emailVerification(token) {
        try {
            const verifyToken = jwt.verify(token, process.env.Secret)
             const findUser = await adminModel.findOne({ id: verifyToken.userid }) 
            if (findUser === null) {
                return new Error("Invalid Token") 
            }
            return findUser

            
        } catch (error) {
            return new Error("token malformed")
        }
        

    }
    static async loginVerification(adminUserName, password) {
        try {
              const findUser = await adminModel.findOne({ adminUserName })
        if (findUser === null) {
            return new Error("Invalid Username")
        }
        const validatePassword = await bcrypt.compare(password, findUser.adminPassword)
        if (!validatePassword) {
            return new Error("Invalid Password")
        }

        return findUser
            
        } catch (error) {
            
        }
      
        
    }
    static async createQuizValidation(adminId, cclass) {
        try {
                  const FindAllQuiz = await quizModel.find({ adminId })
        const currentClassQuiz = FindAllQuiz.filter((content) => content.class === cclass)
        
            const checkifSubjectNameExist = currentClassQuiz.find((content) => content.toUpperCase() === quizName.toUpperCase())
            if (checkifSubjectNameExist) {
                return new Error("Subject name already exist")
            }
            
        } catch (error) {
            
        }
  

        
    }
}


module.exports = AdminValidation