const AdminValidation = require("../Validators/admin")
const adminModel = require("../models/adminModel")
const playerModel = require("../models/Playersmodel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
var generator = require("generate-password");
const AdminEmail = require("../Services/Email")
const ShortUniqueId = require("short-unique-id");
const quizModel = require("../models/QuizQuestionModel")
const cloudinary = require("cloudinary").v2;


cloudinary.config({
  cloud_name: process.env.Cloudinary_cloud_name,
  api_key: process.env.Cloudinary_api_key,
  api_secret: process.env.Cloudinary_api_secret,
});
class Admin {
    static async signup(payload) {
      
        try {
          
            const validate = await AdminValidation.signup(payload)
            if (validate instanceof Error) {
                return new Error(validate.message)
            }
            
            const password = await bcrypt.hash(payload.adminPassword, 10)
            payload.adminPassword = password

        
            let newAdmin = new adminModel(payload)
            const createNewAdmin = await newAdmin.save()
            const token =  jwt.sign({ userid: createNewAdmin.id }, process.env.Secret, { expiresIn: "1h" })
            // return token
          
            const sendMail = await AdminEmail.signup(token, createNewAdmin.adminEmail)
            if (sendMail instanceof Error) {
                return new Error("unable to send Email")
            }
            return { createNewAdmin, mail:"mail sent succesfully" }
              
        } catch (error) {
         
            return new Error(error.message)
        }
    }
    static async emailVerification (token) {
        try {
           
            const userDetails = await AdminValidation.emailVerification(token)
            if (userDetails instanceof Error) {
                return new Error(userDetails.message)

            }
            userDetails.adminEmailVerificationStatus = true
            const updateUser = await adminModel.findByIdAndUpdate({_id: userDetails.id }, userDetails)
             
            const newToken = jwt.sign({ userId: userDetails.id }, process.env.Secret, { expiresIn: "7d" })
            return newToken
            
        } catch (error) {
          
          return new Error(error.message)   
        }
    }
    static async login(username, password) {
        try {
            const validateLogin = await AdminValidation.loginVerification(username, password)
            if (validateLogin instanceof Error) {
                return new Error(validateLogin.message)
            }
             const mailStatus = validateLogin.adminEmailVerificationStatus;
            if (!mailStatus) {
                const token =  jwt.sign({ userid: validateLogin.id }, process.env.Secret, { expiresIn: "1h" })
                const sendMail = await AdminEmail.login(token)
                if (sendMail instanceof Error) {
                    return new Error(sendMail.message)
                }
            
            } 
            const token =  jwt.sign({ userid: validateLogin.id }, process.env.Secret, { expiresIn: "7d" }) 
            

            return {state: mailStatus, token: token }
        } catch (error) {
            return new Error("an error occured")
           
            
        }
    }
    static async adminDasboard(token ) {
        try {
            const verifyToken = jwt.verify(token, process.env.Secret)
       
            const admin = await adminModel.findById({ _id: verifyToken.userid })
            if (admin === null) {
                return new Error("Unable to acess")
            }
            const player = await playerModel.find({ adminId: admin._id })
            if (player.length > 0) {
                     const order = player[player.length - 1].result.sort((a, b) => a.score - b.score)
                const ranking = player[player.length - 1].ranking
                return { admin, player, ranking, order };
                
            } else {
                return { admin, player:{}, ranking:[], order:[] };
            }
       
         
           
        } catch (error) {
           
            return new Error(error.message)
        }
        
    }
    static async uploadImage(imageUrl, admindId) {
        try {
    
                const uid = new ShortUniqueId();
        const uidWithTimestamp = uid.stamp(10);
        const uploadImage = await cloudinary.uploader.upload(imageUrl, { public_id: uidWithTimestamp });
            const findUser = await adminModel.findOne({ _id: admindId })
            findUser.adminImg = uploadImage.secure_url
            const updateUser = await adminModel.findByIdAndUpdate({ _id: findUser.id }, findUser)
            
        } catch (error) {
            
            return new Error(error.message)
        }
        
    }
    static async createQuiz(payload) {
        const { quizSchema, multiple, numberToBeGenerated } = payload;
        const { adminId, quizId, quizMultiplePassword, quizPin } = quizSchema;
        try {
          const verifyQuiz = await AdminValidation.createQuizValidation(
            adminId,
            quizSchema.class
          );
          if (verifyQuiz instanceof Error) {
            return new Error(verifyQuiz.message);
            
            }
            const password = await AdminEmail.createQuizPasswordId(numberToBeGenerated, multiple)
            quizSchema.quizId = password.id;

            if (multiple) {
                quizSchema.quizMultiplePassword = password.pass
            } else {
                quizSchema.quizPin = password.pass[0]
            }
          
            const jwtClassIdentification = jwt.sign({ class: quizSchema.class, adminId: quizSchema.adminId }, process.env.Secret, { expiresIn: "7d" });
     
            const newQuiz = new quizModel(quizSchema)
            const createNewQuiz = await newQuiz.save()
            return { newQuiz: createNewQuiz, token: jwtClassIdentification }
            
        } catch (error) {
  
            return new Error("an error occured")
            
        }
        
    }
   
    static async loadQuizColection(token) {
        try {
            const verifyToken = jwt.verify(token, process.env.Secret)
            const findQuiz = await quizModel.find({ adminId: verifyToken.adminId })
            const currentClassCollection = findQuiz.filter((content) => content.class === verifyToken.class);
            return { collection: currentClassCollection, class: verifyToken.class }
        } catch (error) {
           
            return new Error(error.message)
        }
        
    }
    static async deleteQuestion(payload) {
          const {collectionId, subjectName, questionId} = payload;
       
        try {
            const findQuestions = await quizModel.findOne({ _id: collectionId })
           const subject = findQuestions.quizSubject.find((subject) => subject.quizName === subjectName)
            subject.questions = subject.questions.filter((_, id) => id !== questionId)
            const updateQuestion  = await quizModel.findOneAndUpdate({ _id: collectionId }, findQuestions)
        }catch(error){  
       
         return new Error(error.message)
        }
        
    }
    static async editQuestion(payload) {
        const { collectionId, subjectId, questionId, editedQuestion } = payload;
        try{
            const findQuestion = await quizModel.findOne({ _id: collectionId })
  
          if (findQuestion === null) {
           return new Error("can find subject")
            }
                      findQuestion.quizSubject[subjectId].questions[questionId] = editedQuestion
            const saveEditQuestion = await quizModel.findByIdAndUpdate({ _id: collectionId }, findQuestion)
            return saveEditQuestion
        }catch(error){
        
        return new Error(error.message)
        }
        
    }
    static async generateMorePassword(payload) {
        const { collectionId, numberToGenarate } = payload;
        try {
            const findQuiz = await quizModel.findOne({_id: collectionId })
            if (findQuiz === null) {
                return new Error("Invalid quiz id")
            }
              let passwordMutiple = generator.generateMultiple(numberToGenarate,{length: 7,upperCase: false, numbers: true});
        passwordMutiple.map((pass) => {
         findQuiz.quizMultiplePassword.push(pass)
        })
        const updateQuiz = await quizModel.findOneAndUpdate({_id:collectionId}, findQuiz)
               

        }catch(error){
          
      return new Error(error.message)
        }
        
    }
    static async quizAcessPassword(payload) {
        const { collectionId, pass } = payload;
        try {
            const quiz = await quizModel.findOne({ _id: collectionId })
            if (quiz === null) {
                return new Error("Invalid quizk acess id, can't find quiz")
            }
            quiz.locked = true
            quiz.quizResultAcessPassword = pass;
            const updateQuiz = await quizModel.findOneAndUpdate({ _id: collectionId }, quiz)
            

        }catch(error){
         
 return new Error(error.message)
        }
    
    }
    static async removeQuizAcessPaasowrd(payload) {
        const {access} = payload
        try {
            const quiz = await quizModel.findOne({ _id: access })
            if (quiz === null) {
                return new Error("Can't find quiz")
            }
            quiz.locked = false,
                quiz.quizResultAcessPasword = ""
            const update = await quizModel.findOneAndUpdate({ _id: access }, quiz)
            

        } catch (error) {
            return new Error(error.message)
        

        }
        
    }
    static async deleteSpecificQuizCollection(payload) {
        const {quizId} = payload
        try{
            const deleteQuiz = await quizModel.findByIdAndDelete({ _id: quizId })
        
        }catch(error){
           
 return new Error(error.message)
        }
        
    }
    static async getSpecificQuiz(token) {
        try{
            const verifyToken = jwt.verify(token, process.env.Secret)
            const getQuiz = await quizModel.findOne({ _id: verifyToken.quizDataBaseId })
            if (getQuiz === null) {
                return new Error("Can't find quiz")
            }
            return getQuiz
        }catch(error){
           
          return new Error(error.message)
        }
        
    }
   
    static async addQuestion(payload) {
        const { quizQuestion,  quizId, subjectId, assignedMark, replaceAdd, subjectName} = payload
        try {
            const validate = await AdminValidation.addQuestionValidation(quizQuestion, quizId, subjectId, assignedMark, replaceAdd, subjectName)
        
            if (validate instanceof Error) {
                return new Error(validate.message)
            }
          
            const update = await quizModel.findByIdAndUpdate({ _id: quizId }, validate)
            

        }catch(error){
         
 return new Error(error.message)
        }
        
    }
    static async checkParticiPants(userToken) {
        try {
            const verifyToken = jwt.verify(userToken, process.env.Secret)
            
            const players = await playerModel.find({ quizId: verifyToken.quizDataBaseId })
            return players

        }catch(error){
        
 return new Error(error.message)
        }
        
    }
    static async deleteQuiz(payload) {
        const {quizId} = payload
        try {
            
            const deletePlayer = await playerModel.findByIdAndDelete({_id: quizId })
            return { message:"deleted succesfuuly"}
        }catch(error){
         
         return  new Error(error.message)
        }
        
    }

}

module.exports = Admin