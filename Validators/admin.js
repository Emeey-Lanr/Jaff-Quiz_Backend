const adminModel = require('../models/adminModel')
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const quizModel = require("../models/QuizQuestionModel")
class AdminValidation {
    static async signup(body) {
         const { adminEmail, adminUserName } = body;
        try {
           
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
         
             const findUser = await adminModel.findOne({ _id: verifyToken.userid }) 

            if (findUser === null) {
                return new Error("Invalid Token") 
            }
              
            return findUser

          
        } catch (error) {
            consoel.log(error)
            return new Error("token malformed")
        }
        

    }
    static async loginVerification(adminUserName, password) {
        try {
        
              const findUser = await adminModel.findOne({ adminUserName:adminUserName })
        if (findUser === null) {
            return new Error("Invalid Login Credentials")
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

    static async addQuestionValidation(quizQuestion,  quizId, subjectId, assignedMark, replaceAdd, subjectName) {
    try {
        const quiz = await quizModel.findOne({ _id: quizId })
        
        if (quiz === null) {
            return new Error("Can't find quiz")
        }
         if (assignedMark > 1 && assignedMark !== 1) {
          quiz.quizSubject[subjectId].subjectMark = assignedMark;
        }
  
        if (replaceAdd === 0) {
           
            quizQuestion.map((question, id) => {
                quiz.quizSubject[subjectId].questions.push(question);
            });
          
        } else if (replaceAdd === 1) {
            quiz.quizSubject.map((content, id) => {
                if (content.quizName === subjectName) {
                    content.questions = quizQuestion;
                }
            });
        
        }
     
 return quiz
    } catch (error) {
    return new Error(error.message)
    }
    }
}


module.exports = AdminValidation