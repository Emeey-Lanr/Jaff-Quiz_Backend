const jwtId = require("jsonwebtoken");
const quizModel = require("../models/QuizQuestionModel");
const adminModel = require("../models/adminModel");
const playerModel = require("../models/Playersmodel");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.Cloudinary_cloud_name,
  api_key: process.env.Cloudinary_api_key,
  api_secret: process.env.Cloudinary_api_secret,
});

const adminGameLogin = (req, res) => {
  console.log(req.body);

  // we look if that username exist
  adminModel.findOne({ adminUserName: req.body.username }, (err, result) => {
    if (err) {
      res.send({ message: "an error occured", status: false });
    } else {
      if (result !== null) {
        console.log(result)
        let adminId = result._id 
        // result gotten is used to find all the quiz collection made by the amin logining in
        quizModel.find({ adminId: result._id }, (err, quizCollection) => {
          // we then now search if the quiz id coming is owned by the admin
          console.log(quizCollection);
          if (quizCollection.length > 0) {
            // we look for the particular quiz
            let theParticularQuiz = quizCollection.filter( (content) => content.quizId === req.body.gameid );
            //  we check if it exist and if id does we register the game
            if (theParticularQuiz.length > 0) {
              console.log(theParticularQuiz);

              // we try to find the orginal game with that we  get to look at the last game created and split the
              // quizIdNumberPlayed pin it can only be played 5 times
              playerModel.find({ quizId: theParticularQuiz[0]._id }, (err, allplayed) => {
                console.log(allplayed,"++++++++++---------------")
                  let check = [];
                  let status;
                  let gameRegistrationSchema = {
                    adminId: adminId,
                    quizId: theParticularQuiz[0]._id,
                    // this is used to check the number of times the game is being played
                    quizIdNumberPlayed: theParticularQuiz[0]._id + 1,
                    players: [],
                  };
                  let turnTo = 0
                  if (err) {
                    res.send({ message: "an error occured", status: false });
                  } else {
                    // we check if it has been registerd with that quizid before
                    // if it has
                    if (allplayed.length > 0) {
                      check = allplayed[allplayed.length - 1].quizIdNumberPlayed.split("");
                      console.log(check[check.length - 1], "=====");
                      if (Number(check[check.length - 1]) === 5) {
                        status = true;
                      } else {
                        status = false;
                        turnTo = allplayed[0].quizId + (Number(check[check.length - 1]) + 1);
                        console.log(turnTo, "+++++++++")
                         gameRegistrationSchema.quizIdNumberPlayed = String(turnTo)
                      }
                    } else {

                      status = false;
                    }

                    let quizGameRegistration = new playerModel(
                      gameRegistrationSchema
                    );
                    console.log(gameRegistrationSchema)
                    if (status) {
                      res.send({ message: "Game limit reached", staus: false });
                    } else {
                      quizGameRegistration.save((err, details) => {
                        if (err) {
                        } else {
                          const adminCode = jwtId.sign(
                            {
                              adminStatus: true,
                              question: theParticularQuiz[0].quizSubject,
                              quizID: theParticularQuiz[0]._id,
                              quizIdNumberPlayed: details.quizIdNumberPlayed,
                            },
                            process.env.GS,
                            {
                              expiresIn: "7d",
                            }
                          );
                          res.send({
                            message: "valid login",
                            status: true,
                            adminStatusId: adminCode,
                          });
                        }
                      });
                    }
                  }
                }
              );
            } else {
            }
          } else {
            res.send({ message: "Invalid Id", status: false });
          }
        });
      } else {
        res.send({ message: "Username doesn't exist", status: false });
      }
    }
  });
};

const userGamePinVerification = (req, res) => {
  quizModel.findOne(
    { quizMultiplePassword: req.body.password },
    (err, result) => {
      if (err) {
        res.send({ message: "an error occured", status: false });
      } else {
        if (result !== null) {
          // if (result.multiple) {
          //   let usedPin = result.quizMultiplePassword.filter((pass, id) => pass === req.body.password)
          //   let notusedPin = result.quizMultiplePassword.filter((pass, id) => pass !== req.body.password)
          //   result.quizMultiplePassword = notusedPin
          //   result.usedPassword.push(usedPin[0])
          //   quizModel.findOneAndUpdate({ _id: result._id }, result, (err) => {
          //     if (err) {
          //       res.send({})
          //     }
          //   })
          // }
          const userpin = jwtId.sign(
            {
              adminStatus: false,
              quizID: result._id,
              adminId: result.adminId,
              subjectToBeDone: result.subjectToBePlayedByPlyers,
            },
            process.env.GS,
            { expiresIn: "1d" }
          );
          res.send({ message: "success", passId: userpin, status: true });
        } else {
          res.send({ message: "Invalid Pin", status: false });
        }
      }
    }
  );
};

const verifyPlayerPassToken = (req, res) => {
  const userToken = req.headers.authorization.split(" ")[1];
  jwtId.verify(userToken, process.env.GS, (err, result) => {
    if (err) {
      res.send({ message: "an error occured", status: false });
    } else {
      res.send({ message: "success", status: true, userDetail: result });
    }
  });
};

const uploadPlayerImage = (req, res) => {
  const imageUpload = cloudinary.uploader.upload(req.body.imageUrl, {
    public_id: "player_img",
  });

  imageUpload
    .then((data) => {
      console.log(data);
      console.log();
      res.send({ status: true, imgUrl: data.secure_url });
    })
    .catch((err) => {
      if (err) {
        cosole.log(err);
        res.send({ status: false, message: "An error ocurred" });
      }
    });
};

const savePlayerDetails = (req, res) => {
  playerModel.find({ quizId: req.body.quizId }, (err, result) => {
    if (err) {
      res.send({message:"an error occured", status:false})
    } else {
      if (result.length > 0 && result.length < 6) {
        let currentGame = result[result.length - 1]
        // currentGame.push(req.body)
        playerModel.findOne({ quizIdNumberPlayed: currentGame.quizIdNumberPlayed }, (err, currentQuiz) => {
          if (err) {
            res.send({message:"an error occured", status:false})
          } else {
            if (currentQuiz !== null) {
              let checKIfNameExist = currentQuiz.players.filter((content)=> content.toUpperCase() === req.body.playerName.toUpperCase())
              if (checKIfNameExist.length > 0) {
                 res.send({message:"user name already exist", status:false})
              } else {
                currentQuiz.players.push(req.body.playerName)

                playerModel.findByIdAndUpdate({ _id: currentGame._id }, currentQuiz, (err) => {
                  if (err) {
                    res.send({message:"an error occured", status:false})
                  } else {
                      let playerToken = jwtId.sign(
                        {
                          adminStatus: false,
                          quizID: req.body.quizId,
                          quizIdNumberPlayed: currentQuiz.quizIdNumberPlayed,
                          playerInfo: req.body,
                        },
                        process.env.GS,
                        { expiresIn: "1d" }
                      );
                      res.send({ status: true, playerToken: playerToken });
                  }
                })
              }
              
            }
          }
        })
        
      }
    }
    
  })

};

const verifyAdminStatus = (req, res) => {
  let id = req.headers.authorization.split(" ")[1];
  jwtId.verify(id, process.env.GS, (err, result) => {
    if (err) {
      res.send({ status: false });
    } else {
      console.log(result);
      if (result.adminStatus) {
        res.send({
          status: true,
          adminStatus: result.adminStatus,
          questionToBeAnswered: result.question,
          quizID: result.quizID,
          quizIdNumberPlayedId:result.quizIdNumberPlayed,
        });
      } else {
        res.send({
          status: true,
          adminStatus: result.adminStatus,
          quizID: result.quizID,
          userDetails: result.playerInfo,
          quizIdNumberPlayedId: result.quizIdNumberPlayed,
        });
      }
    }
  });
};

module.exports = {
  adminGameLogin,
  userGamePinVerification,
  verifyPlayerPassToken,
  uploadPlayerImage,
  savePlayerDetails,
  verifyAdminStatus,
};
