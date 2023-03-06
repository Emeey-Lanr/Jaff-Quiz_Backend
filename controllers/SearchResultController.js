const adminModel = require("../models/adminModel");
const quizModel = require("../models/QuizQuestionModel");
const playerModel = require("../models/Playersmodel")


const searchAdmin = (req, res) => {
    adminModel.find({ searchId: process.env.mTQ }, (err, result) => {
      if (err) {
          res({ message: "an error occured", state:false})
      } else {
          if (result.length > 0) {
              let userFound = result.filter((admin, id) => admin.adminUserName.toUpperCase().indexOf(req.body.name) > -1);
              res.send({message:"userFound", status:true, userFound:userFound})
          } else {
              res.send({status:false, message:"no user found"})
          }
          
      }
    });
}




















module.exports = {
    searchAdmin
}