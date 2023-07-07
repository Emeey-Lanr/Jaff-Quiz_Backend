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
  console.log(req.body);

  try {
    
    const gameLogin = await Game.adminGameLogin(req.body)
    if (gameLogin instanceof Error) {
      return errorResponse(res, 400, gameLogin.message)
    }
    res.send({
                            message: "valid login",
                            status: true,
                            // this is used to kno if the admin is logged in if the admin is logged in 
                            // then players should be able to if not players shouldn't be able to
                           checkifAdminLogin:gameLogin.numberPlayed,
                            adminStatusId: gameLogin.token,
                          });
  } catch (error) {
    return errorResponse(res, 500, "an error occured", false)
  }
  // we look if that username exist
  // adminModel.findOne({ adminUserName: req.body.username }, (err, result) => {
  //   if (err) {
  //     res.send({ message: "an error occured", status: false });
  //   } else {
  //     if (result !== null) {
  //       console.log(result)
  //       let adminId = result._id 
  //       // result gotten is used to find all the quiz collection made by the amin logining in
  //       quizModel.find({ adminId: result._id }, (err, quizCollection) => {
  //         // we then now search if the quiz id coming is owned by the admin
  //         console.log(quizCollection);
  //         if (quizCollection.length > 0) {
  //           // we look for the particular quiz
  //           let theParticularQuiz = quizCollection.filter( (content) => content.quizId === req.body.gameid );
  //           //  we check if it exist and if id does we register the game
  //           if (theParticularQuiz.length > 0) {
  //             console.log(theParticularQuiz, "check for it level");

  //             // we try to find the orginal game with that we  get to look at the last game created and split the
  //             // quizIdNumberPlayed pin it can only be played 5 times
  //             playerModel.find({ quizId: theParticularQuiz[0]._id }, (err, allplayed) => {
  //               console.log(allplayed,"++++++++++---------------")
  //                 let check = [];
  //                 let status;
  //                 let gameRegistrationSchema = {
  //                   adminId: adminId,
  //                   quizId: theParticularQuiz[0]._id,
  //                   // this is used to check the number of times the game is being played
  //                   quizIdNumberPlayed: theParticularQuiz[0]._id + 1,
  //                   players: [],
  //                   result: [],
  //                   state: req.body.state,
  //                   class:theParticularQuiz[0].class,
  //                   level: "", 
  //                   ranking:[],
  //                   month:0,
  //                   year: 0,
  //                   day: 0,
  //                 };
  //                 let turnTo = 0
  //                 if (err) {
  //                   res.send({ message: "an error occured", status: false });
  //                 } else {
  //                   // we check if it has been registerd with that quizid before
  //                   // if it has
  //                   if (allplayed.length > 0) {
  //                     check = allplayed[allplayed.length - 1].quizIdNumberPlayed.split("");
  //                       turnTo = allplayed[0].quizId + (Number(check[check.length - 1]) + 1);
  //                       console.log(turnTo, "+++++++++")
  //                        gameRegistrationSchema.quizIdNumberPlayed = String(turnTo)
  //                   } else {

  //                     status = false;
  //                   }

  //                   let quizGameRegistration = new playerModel(gameRegistrationSchema);
  //                   console.log(gameRegistrationSchema)
  //                   if (status) {
  //                     res.send({ message: "Game limit reached", staus: false });
  //                   } else {
  //                     quizGameRegistration.save((err, details) => {
  //                       if (err) {
  //                       } else {
  //                         const adminCode = jwtId.sign(
  //                           {
  //                             adminStatus: true,
  //                             question: theParticularQuiz[0].quizSubject,
  //                             quizID: theParticularQuiz[0]._id,
  //                             quizIdNumberPlayed: details.quizIdNumberPlayed,
  //                             mode:req.body.mode
  //                           },
  //                           process.env.GS,
  //                           {
  //                             expiresIn: "7d",
  //                           }
  //                         );
  //                         res.send({
  //                           message: "valid login",
  //                           status: true,
  //                           // this is used to kno if the admin is logged in if the admin is logged in 
  //                           // then players should be able to if not players shouldn't be able to
  //                          checkifAdminLogin: details.quizIdNumberPlayed,
  //                           adminStatusId: adminCode,
  //                         });
  //                       }
  //                     });
  //                   }
  //                 }
  //               }
  //             );
  //           } else {
  //             res.send({message:"Invalid quiz Id", status:false})
  //           }
  //         } else {
  //           res.send({ message: "Invalid Identification", status: false });
  //         }
  //       });
  //     } else {
  //       res.send({ message: "Username doesn't exist", status: false });
  //     }
  //   }
  // });
};

const userGamePinVerification = async (req, res) => {
  try {
    const verifyPin = await Game.userGamePinVerification(req.body);
    if (verifyPin instanceof Error) {
      return res.send({ message: verifyPin.message, status: false });
    }
    return res.send({
      message: "success",
      passId: verifyPin.token,
      status: true,
      lastGameUniqueId:
        verifyPin.game[verifyPin.game.length - 1].quizIdNumberPlayed,
    });
  } catch (error) {
    return res.send({ message: "an error occured", status: false });
  }
// quizModel.findOne(
//     { quizMultiplePassword: req.body.password },
//     (err, result) => {
//       if (err) {
//         res.send({ message: "an error occured", status: false });
//       } else {
//         if (result !== null) {
//           playerModel.find({ quizId: result._id }, (err, gameCreated) => {
//             if (err) {
//               res.send({message:"an error occured",status:false})
//             } else {
//               if (gameCreated.length > 0) {
//                 if (result.multiple) {
//                   result.quizMultiplePassword =  result.quizMultiplePassword.filter((content)=>content !== req.body.password)
//                   quizModel.findOneAndUpdate({ _id: result._id }, result, (err) => {
//                     if (err) {
//                   res.send({message:"an error occured", status:false})
//                     } else {
//                        const userpin = jwtId.sign(
//                          {
//                            adminStatus: false,
//                            quizID: result._id,
//                            adminId: result.adminId,
//                            subjectToBeDone: result.subjectToBePlayedByPlyers,
//                          },
//                          process.env.GS,
//                          { expiresIn: "1d" }
//                        );
//                        res.send({
//                          message: "success",
//                          passId: userpin,
//                          status: true,
//                          lastGameUniqueId:gameCreated[gameCreated.length - 1].quizIdNumberPlayed
//                        });
//                     }
//               })

//               } else {
//                   const userpin = jwtId.sign(
//                    {
//                      adminStatus: false,
//                      quizID: result._id,
//                      adminId: result.adminId,
//                      subjectToBeDone: result.subjectToBePlayedByPlyers,
//                    },
//                    process.env.GS,
//                    { expiresIn: "1d" }
//                  );
//                  res.send({
//                    message: "success",
//                    passId: userpin,
//                    status: true,
//                    lastGameUniqueId:gameCreated[gameCreated.length - 1].quizIdNumberPlayed
//                  }); 
//               }
              
                
//               } else {
//                 res.send({message:"quiz can't  be accessed", status:false})
//               }
//             }
//           });

         
         
//         } else {
//           res.send({ message: "Invalid Pin", status: false });
//         }
//       }
//     }
//   );
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
  console.log(req.body)
  try {
    const savePlayerDetails = await Game.savePlayerDetails(req.body)
    if (savePlayerDetails instanceof Error) {
      return res.send({message:savePlayerDetails.message, status:false})
    }
    return res.send({status:true, playerToken:savePlayerDetails})
  } catch (error) {
     res.send({ message: "an error occured", status: false });
  }
  // playerModel.find({ quizId: req.body.quizId }, (err, result) => {
  //   if (err) {
  //     res.send({message:"an error occured", status:false})
  //   } else {
  //     if (result.length > 0 ) {
  //       let currentGame = result[result.length - 1]
  //       // currentGame.push(req.body)
  //       playerModel.findOne({ quizIdNumberPlayed: currentGame.quizIdNumberPlayed }, (err, currentQuiz) => {
  //         if (err) {
  //           res.send({message:"an error occured", status:false})
  //         } else {
  //           if (currentQuiz !== null) {
  //             let checKIfNameExist = currentQuiz.players.filter((content)=> content.toUpperCase() === req.body.playerName.toUpperCase())
  //             if (checKIfNameExist.length > 0) {
  //                res.send({message:"user name already exist", status:false})
  //             } else {
  //               currentQuiz.players.push(req.body.playerName)
  //               playerModel.findByIdAndUpdate({ _id: currentGame._id }, currentQuiz, (err) => {
  //                 if (err) {
  //                   res.send({message:"an error occured", status:false})
  //                 } else {
  //                     let playerToken = jwtId.sign(
  //                       {
  //                         adminStatus: false,
  //                         quizID: req.body.quizId,
  //                         quizIdNumberPlayed: currentQuiz.quizIdNumberPlayed,
  //                         playerInfo: req.body,
  //                       },
  //                       process.env.GS,
  //                       { expiresIn: "7d" }
  //                     );
  //                     res.send({ status: true, playerToken: playerToken });
  //                 }
  //               })
  //             }
              
  //           }
  //         }
  //       })
        
  //     }else{
  //       res.send({status:false, message:"Game not available"})
  //     }
  //   }
    
  // })

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
      res.send({
        status: true,
        adminStatus: token.adminStatus,
        quizID: token.quizID,
        userDetails: token.playerInfo,
        quizIdNumberPlayedId: token.quizIdNumberPlayed,
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
  