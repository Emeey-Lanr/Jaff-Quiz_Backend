const jwtId = require("jsonwebtoken");
const quizModel = require("../models/QuizQuestionModel");
const adminModel = require("../models/adminModel");
const playerModel = require("../models/Playersmodel");

const cloudinary = require("cloudinary").v2;
const ShortUniqueId = require('short-unique-id');
const Game = require("../Services/game");
const { errorResponse } = require("../response/errorSuccess");
cloudinary.config({
  cloud_name: process.env.Cloudinary_cloud_name,
  api_key: process.env.Cloudinary_api_key,
  api_secret: process.env.Cloudinary_api_secret,
});

const adminGameLogin = async (req, res) => {

  try {
    const gameLogin = await Game.adminGameLogin(req.body)
    if (gameLogin instanceof Error) {
     
      return errorResponse(res, 400, gameLogin.message)
      
    }
   return  res.send({
                            message: "valid login",
                            status: true,
                            // this is used to know if the admin is logged in if the admin is logged in 
                            // then players should be able to if not players shouldn't be able to
                           checkifAdminLogin:gameLogin.numberPlayed,
                            adminStatusId: gameLogin.token,
                          });
  } catch (error) {
   
    return errorResponse(res, 500, "an error occured", false)
  }
  
};

const userGamePinVerification = async (req, res) => {
  try {
    const verifyPin = await Game.userGamePinVerification(req.body);
    if (verifyPin instanceof Error) {
      return res.send({ message: verifyPin.message, status: false });
    }
    return res.send({
      message: "success",
      passId: verifyPin.userpin,
       status: true,
      lastGameUniqueId:verifyPin.lastGameUniqueId
    });
  } catch (error) {
    return res.send({ message: "an error occured", status: false });
  }

};

const verifyPlayerPassToken = async (req, res) => {
  try {
    const userToken = req.headers.authorization.split(" ")[1];
    const token =  jwtId.verify(userToken, process.env.GS)
    
     res.send({ message: "success", status: true, userDetail: token });
  } catch (error) {
    res.send({ message: "an error occured", status: false });
  }


};

const uploadPlayerImage = (req, res) => {
  const uid = new ShortUniqueId()
  const uidWithTimestamp = uid.stamp(30)
  const imageUpload = cloudinary.uploader.upload(req.body.imageUrl, {
    public_id:uidWithTimestamp,
  });

  imageUpload
    .then((data) => {
      res.send({ status: true, imgUrl: data.secure_url });
    })
    .catch((err) => {
      if (err) {
        cosole.log(err);
        res.send({ status: false, message: "An error ocurred" });
      }
    });
};

const savePlayerDetails = async (req, res) => {

  try {
    const savePlayerDetails = await Game.savePlayerDetails(req.body)
    if (savePlayerDetails instanceof Error) {
      return res.send({message:savePlayerDetails.message, status:false})
    }
    return res.send({status:true, playerToken:savePlayerDetails})
  } catch (error) {
     res.send({ message: "an error occured", status: false });
  }
 
};

const verifyAdminStatus = async (req, res) => {
  try {
    const id = req.headers.authorization.split(" ")[1];
    const token = jwtId.verify(id, process.env.GS)
   
    if (token.adminStatus) {
     
       res.send({
         status: true,
         adminStatus: token.adminStatus,
         questionToBeAnswered: token.question,
         quizID: token.quizID,
         quizIdNumberPlayedId: token.quizIdNumberPlayed,
         mode: token.mode,
       });
    } else {
     
      const namey = {
        status: true,
        adminStatus: token.adminStatus,
        quizID: token.quizID,
        userDetails: token.playerInfo,
        quizIdNumberPlayedId: token.quizIdNumberPlayed,
      };

      res.send({
        status: true,
        adminStatus: token.adminStatus,
        quizID: token.quizID,
        userDetails: token.playerInfo,
        quizIdNumberPlayedId: token.quizNumberPlayed,
      });
    }
  } catch (error) {
    return res.send({mesage:"an error occured", status:false})
  }

};

module.exports = {
  adminGameLogin,
  userGamePinVerification,
  verifyPlayerPassToken,
  uploadPlayerImage,
  savePlayerDetails,
  verifyAdminStatus,
};
  