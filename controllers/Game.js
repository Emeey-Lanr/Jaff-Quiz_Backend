const jwtId = require("jsonwebtoken");
const quizModel = require("../models/QuizQuestionModel");
const adminModel = require("../models/adminModel");
const adminGameLogin = (req, res) => {
  console.log(req.body);

  adminModel.findOne({ adminUserName: req.body.username }, (err, result) => {
    if (err) {
      res.send({message:"an error occured", status:false})
    } else {
      if (result !== null) {
        quizModel.findOne({ quizId: req.body.gameid }, (err, quiz) => {
          if (err) {
            res.send({message:"an error occured", status:false})
          } else {
            // check if quiz is not equal to a empty object
            if (quiz !== null) {
            // if not it create a token that consists  of the admin status, the question to be answered 
              const adminCode = jwtId.sign({ adminStatus: true, question: quiz.quizSubject, quizID:quiz._id}, process.env.GS, {
                expiresIn: "7d",
              });
              res.send({ message: "valid login", status: true, adminStatusId: adminCode });
            } else {
              res.send({message:"Invalid quiz id", status:false})
            }
          }
        });
      } else {
        res.send({message:"Username doesn't exist", status:false})
      }
    }
    
  });

};

const verifyAdminStatus = (req, res) => {
  let id = req.headers.authorization.split(" ")[1];
  jwtId.verify(id, process.env.GS, (err, result) => {
    if (err) {
      res.send({ status: false });
    } else {
      console.log(result);
      res.send({
        status: true,
        adminStatus: result.adminStatus,
        questionToBeAnswered: result.question,
        quizID: result.quizID
        
      });
    }
  });
};


module.exports = {
  adminGameLogin,
  verifyAdminStatus,
};

