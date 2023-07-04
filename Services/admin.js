const AdminValidation = require("../Validators/admin")
const adminModel = require("../models/adminModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
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
              console.log(payload, "Lkjhgfd");
            const validate = await AdminValidation.signup(payload)
            if (validate instanceof Error) {
                return new Error(validate.message)
            }
            
            const password = await bcrypt.hash(payload.adminPassword, 10)
            payload.adminPassword = password

            console.log(password, payload)
        
            let newAdmin = new adminModel(payload)
            const createNewAdmin = await newAdmin.save()
            const token =  jwt.sign({ userid: createNewAdmin.id }, process.env.Secret, { expiresIn: "1h" })
            // return token
            console.log(token, createNewAdmin)
            const sendMail = await AdminEmail.signup(token, createNewAdmin.adminEmail)
            if (sendMail instanceof Error) {
                return new Error("unable to send Email")
            }
            return { createNewAdmin, mail:"mail sent succesfully" }
              
        } catch (error) {
            console.log(error.message, "herer")
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
            const updateUser = await adminModel.findByAndUpdate({ id: userDetails.id }, userDetails)
             
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
            const token =  jwt.sign({ userid: validateLogin.id }, process.env.Secret, { expiresIn: "7h" }) 
            

            return {state: mailStatus, token: token }
        } catch (error) {
            
        }
    }
    static async adminDasboard() {
        
    }
    static async uploadImage(imageUrl, admindId) {
        try {
                const uid = new ShortUniqueId();
        const uidWithTimestamp = uid.stamp(10);
        const uploadImage = await cloudinary.uploader.upload(imageUrl, { public_id: uidWithTimestamp });
            const findUser = await adminModel.findOne({ id: admindId })
            findUser.adminImg = uploadImage.secure_url
            const updateUser = await adminModel.findByIdAndUpdate({ id: findUser.id }, findUser)
            
        } catch (error) {
            return new Error(error.message)
        }
        
    }
    static async createQuiz(payload) {
        const { quizSchema, multiple } = payload;
        const { adminId, quizId, quizMultiplePassword, quizPin } = quizSchema;
        try {
          const verifyQuiz = await AdminValidation.createQuizValidation(
            adminId,
            quizSchema.class
          );
          if (verifyQuiz instanceof Error) {
            return new Error(verifyQuiz.message);
            
            }
             const password = await AdminEmail.createQuizPasswordId(quizId)
            if (multiple) {
                quizSchema.quizMultiplePassword = password.multiple
            } else {
                quizSchema.quizPin = password.single[0]
            }
            const jwtClassIdentification = jwt.sign({ class: quizSchema.class, adminId: quizSchema.adminId }, process.env.Secret, { expiresIn: "7d" });
            const newQuiz = new quizModel(quizSchema)
            const createNewQuiz = await newQuiz.save()
            return { newQuiz: createNewQuiz, token: jwtClassIdentification }
            
        } catch (error) {
            return new Error(error.message)
            
        }
        
    }

}

module.exports = Admin