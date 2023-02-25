const express = require("express");
const app = express();

require("dotenv").config();

const cors = require("cors");
const mongoose = require("mongoose");
const PORT = process.env.PORT;
const URI = process.env.URI;

const server = app.listen(PORT, () => {
  console.log(`a user has connected at Port ${PORT}`);
});

mongoose.connect(URI, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("mongoose has connectd");
  }
});

const Socket = require("socket.io");
const io = Socket(server, { cors: { option: "*" } });
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(cors());
app.use(express.json({ limit: "500mb" }));
const adminRoute = require("./routes/admindashboard");
const game = require("./routes/GameRoute");
app.use("/admin", adminRoute);
app.use("/game", game);

const playerModel = require("./models/Playersmodel")
const adminLoggedIn =  []
const playerPlayingDetail = []
io.on("connection", (socket) => {
  // admin creating a room and creation of player registarion box
  socket.emit("userId", { id: socket.id })
  
  // checks if the admin is logged in cause users shouldn't be able to play game if the admin is not looged in
  socket.on("ifAdminIsLoggedIn", (ifLoggedIn) => {
    adminLoggedIn.push(ifLoggedIn)
    console.log(adminLoggedIn)

  });
  socket.join("yes")

  socket.on("checkIfAdminIsLoggedIn", (uniqueId) => {
    let check = adminLoggedIn.filter((ids) => ids === uniqueId.ifLoggedInPin);
    if (check.length > 0) {
      socket.emit("loggedIn", {status:true})
    } else {
      socket.emit("loggedIn", {status:false})
    }
  });

  socket.on("createRegistrationBox", (uniqueId) => {
    let checkIFIdExist = playerPlayingDetail.filter((content, id) => content.uniqueId === uniqueId.quizId)
   
    if (checkIFIdExist.length > 0) {
      socket.join(uniqueId.quizId);
      
      if (checkIFIdExist[0].adminPage === "AdminPage01") {
        io.sockets.in(uniqueId.quizId).emit("currentPage", {
          players: checkIFIdExist[0].players,
          adminPage: checkIFIdExist[0].adminPage,
          stage: 1,
          roomId: checkIFIdExist[0].uniqueId,
        });
        console.log("yes stage 1")
        
      } else if (checkIFIdExist[0].adminPage === "AdminPage02" && checkIFIdExist[0].totalCurrentSubject.length > 0) {
        let currentSubject = checkIFIdExist[0]
        // question stage, you have to send the the time of that particular subject
        
        console.log(checkIFIdExist[0].currentSubject);
       io.sockets.in(uniqueId.quizId).emit("currentPage",
        {loading: false, 
          adminPage: checkIFIdExist[0].adminPage,
          currentQuestion: checkIFIdExist[0].totalCurrentSubject[checkIFIdExist[0].currentGameIndex],
          stage: 2,
          roomId: checkIFIdExist[0].uniqueId,
          stateLoadingQuestion:true,
         });
        console.log("stage 2")
      } else if (checkIFIdExist[0].adminPage === "AdminPage03") {
        // a particular subject overall
        io.sockets.in(uniqueId.quizId).emit("currentPage",
          {
            players: checkIFIdExist[0].players,
            adminPage: checkIFIdExist[0].adminPage,
            stage: 3,
            roomId: checkIFIdExist[0].uniqueId
          })
        console.log('stage 3')
      } else if (checkIFIdExist[0].adminPage === "AdminPage04") {
        // all subjects total
         io.sockets.in(uniqueId.quizId).emit("currentPage", {
           players: checkIFIdExist[0].players,
           adminPage: checkIFIdExist[0].adminPage,
           stage: 4,
           roomId: checkIFIdExist[0].uniqueId,
         });
      }
      
    } else {
      let playerPlayinSchema = {
        currentGameIndex: 0,
        adminPage: uniqueId.adminPage,
        uniqueId: uniqueId.quizId,
        currentSubjectName: "",
        totalCurrentSubject:[],
        currentAssignedMark: 1,
        allQuizIndex: -1,
        clicked: -1,
        currenTime:0,
        gameStatus:[],
        players:[]
      }
      playerPlayingDetail.push(playerPlayinSchema)
      socket.join(uniqueId.quizId)
      console.log(playerPlayingDetail)
    }
  });
  // player registration
  socket.on("register", (info) => {
   
    console.log(info, "++++==")
    socket.join(info.uniqueIdentification);
    let findTheArrayOfTheGame = playerPlayingDetail.filter((content, id) => content.uniqueId === info.uniqueIdentification)
    console.log(findTheArrayOfTheGame, "findddddd")
    if(findTheArrayOfTheGame.length > 0){
    let checkIFUserExist = findTheArrayOfTheGame[0].players.filter((players, id) => players.playerName === info.userDetails.playerName)
    if (checkIFUserExist.length > 0) {
      console.log("user exist")
    } else {
      playerPlayingDetail.map((content, id) => {
        if (content.uniqueId === info.uniqueIdentification) {
          content.players.push(info.userDetails);
        }
      })

      findTheArrayOfTheGame[0].players.map((user, id) => {
        console.log(user, "+_)(*&^%$JHGFD")
      })
     
      
        console.log(findTheArrayOfTheGame, "**=-=**");
       socket.to(info.uniqueIdentification).emit("playersJoinings", { players: findTheArrayOfTheGame[0].players, adminPage:findTheArrayOfTheGame[0].adminPage })
      io.sockets.in(info.uniqueIdentification).emit("showThatYouJoinedAlso", { players: findTheArrayOfTheGame[0].players, adminPage:findTheArrayOfTheGame[0].adminPage} )
    }
  }else{
    console.log("can't find player box")
  }

  });

  // start of game
  socket.on("switchToLoad", (load)=>{
     
    socket.to(load.roomId).emit("LoadingPage", { adminPage: load.adminPage, loading:true });

  })

  //
  

  socket.on("switchToStart", (start) => {
    console.log(start.currentSubject, "this is start")
        let lookForThatArray = playerPlayingDetail.filter((content) => content.uniqueId === start.roomId)

        let check = lookForThatArray[0].gameStatus.filter((status) => status.name === start.currentSubject)
        console.log(check[0])

    const changeDetails = () => {
          playerPlayingDetail.map((content, id) => {
            if (content.uniqueId === start.roomId) {
              content.adminPage = start.adminPage;
              content.currentGameIndex = start.currentQuestionIndex;
              content.currenTime = start.currentTime;
              content.totalCurrentSubject = start.questionToBeAnswered;
              content.clicked = content.clicked + 1;
              content.currentAssignedMark = start.assignedMark;
              content.currentSubject = start.currentSubject;
              if (content.allQuizIndex === -1) {
                content.allQuizIndex = start.allQuizIndex;
              }

              console.log(content, "LKjhgfdsasdfghjkllkjfds");
              let checkNoToAddAgain = content.gameStatus.filter(
                (subjectName) => subjectName.name === start.currentSubject
              );
              if (checkNoToAddAgain.length > 0) {
                console.log("can't add");
              } else {
                content.gameStatus.push({
                  name: start.currentSubject,
                  status: false,
                });
                console.log(content.gameStatus);
              }
            }
          });
          playerPlayingDetail.map((content, id) => {
            if (content.uniqueId === start.roomId) {
              console.log(content.players, "jdjhgfdfghjoiuyt");
              content.players.map((players) => {
                players.subjectToBeDone.map((subject) => {
                  if (subject.quizName === start.currentSubject) {
                    console.log(subject.questions, ":;;;;;;;;;;;;;;;");
                    // for (let i = 0; i < start.questionToBeAnswered.length; i++) {
                    //   subject.questions.push(markSchema);
                    // }
                    content.totalCurrentSubject.map((question) => {
                      subject.questions.push(question.score);
                    });
                    console.log(subject.questions, "check----");
                  }
                });
              });
            }
          });
          console.log(start.question);
          socket.to(start.roomId).emit("startGame", {
            adminPage: start.adminPage,
            question: start.question,
            loading: false,
            currentSubject: start.currentSubject,
            assignedMark: start.assignedMark,
            time: lookForThatArray[0].currenTime,
          });
        io.sockets.to("yes").emit("startGameOnAdminPageAlso", {
          currentSubject: start.question,
          adminId: lookForThatArray[0].uniqueId,
          time:lookForThatArray[0].currenTime
        })
    }
    
    let stattus = false

    if (check.length > 0) {
      if (check[0].status) {
        io.sockets.to(lookForThatArray[0].uniqueId).emit("ifPlayedBefore", {
          adminId:lookForThatArray[0].uniqueId
        })
      } else {
       changeDetails()
      } 
    } else {
      changeDetails()
    }
    
  })

  socket.on("submitAnwser", (info) => {
    let check = playerPlayingDetail.filter((content) => content.uniqueId === info.roomId)
    let questionsBox = []
 console.log(info)
   console.log(check[0])
    playerPlayingDetail.map((content) => {
      if (content.uniqueId === info.roomId) {
        // content.assignedMark = info.assignedMark
        content.players.map((players)=>{
          if (players.playerName === info.playerName) {
            console.log(players.playerName)
            players.subjectToBeDone.map((subject, id) => {
              questionsBox = players.subjectToBeDone.filter((content)=> content.quizName === info.currentSubject)
              if (subject.quizName === content.currentSubject) {
                subject.questions[check[0].currentGameIndex] = info.currentStatus ? content.currentAssignedMark : 0
                console.log(subject.questions)
  
              }
            })
          }
        })
      }
    })
    // questionsBox[0].questions[2] = 2
    // console.log(questionsBox[0]);
   
  
});

  socket.on("changeQuestion", (data) => {
    let check = playerPlayingDetail.filter((content) => content.uniqueId === data.roomId)
  let totalScore = 0
    if (check.length > 0) {
      // if (check[0].clicked === check[0].allQuizIndex) {
         
      // } else
        if (check[0].currentGameIndex === check[0].totalCurrentSubject.length - 1) {
           playerPlayingDetail.map((content) => {
             if (content.uniqueId === data.roomId) {
               content.adminPage = "AdminPage03";
               content.gameStatus.map((nameState) => {
                 if (nameState.name === check[0].currentSubject) {
                   nameState.status = true;
                 }
                 console.log(content.players)
                 content.players.map((players) => {
                   players.subjectToBeDone.map((subject) => {
                     if (subject.quizName === check[0].currentSubject) {
                             subject.score = 0
                            subject.questions.map((scores) => {
                              subject.score += Number(scores)
                              console.log(subject.score, scores, subject.questions)
                              
                        }) 
                     }
                   })
                 })
               });
             }

             let ranking = []
             let currentGameIndex  = 0
             playerPlayingDetail.map((content) => {
             if (content.uniqueId === data.roomId) {
               content.players.map((players) => {
                 players.subjectToBeDone.map((subject, id) => {
                   if (subject.quizName === check[0].currentSubject) {
                     currentGameIndex = id
                     ranking = content.players.sort((a, b) => a.subjectToBeDone[id].score - b.subjectToBeDone[id].score)
                    //  ranking.map((content, id) => {
                    //    console.log(content.subjectToBeDone)
                    //  })
                    //  console.log(ranking.subjectToBeDone, id)
                   }
                 });
               });
             }
            })
             console.log(check[0])
            //  socket.to(data.roomId)
            console.log(ranking, "this is the ranking")
             io.sockets.to("yes").emit("changeToVictoryPage", { adminStage: check[0].adminPage, playerRanking:ranking.reverse(), currentIndex:currentGameIndex, currentSubject:check[0].currentSubject})
            
           
           });
         } else {
           playerPlayingDetail.map((game) => {
             if (game.uniqueId === data.roomId) {
               game.currentGameIndex = game.currentGameIndex + 1;
             }
           });
           io.sockets.to(data.roomId).emit("adminId", {currentGameId:check[0].currentGameIndex, roomId:data.roomId,  time: check[0].currenTime})
           socket.to(data.roomId).emit("nextQuestion", {
             adminPage: check[0].adminPage,
             question: check[0].totalCurrentSubject[check[0].currentGameIndex],
             loading: false,
             currentSubject: check[0].currentSubjectName,
             assignedMark: check[0].currentAssignedMark,
             time: check[0].currenTime,
             check: -1,
           });
         }
    }
    
  })

  socket.on("switchPageToNextSubjectOrOverallResult", (data) => {
    const check = playerPlayingDetail.filter((id) => id.uniqueId === data.gameId)
    console.log(check[0])
    if (check.length > 0) {
      if (check[0].allQuizIndex === check[0].gameStatus.length - 1) {
         // you do the calculation for overaLL RESULT
           playerPlayingDetail.map((content,id)=>{
             if (content.uniqueId === data.gameId) {
               content.adminPage = "AdminPage04"
               content.players.map((players, id) => {
                // players.totalScore;
                 players.subjectToBeDone.map((scores, id) => {
                   players.totalScore += scores.score; 
                 })
              })
            }
           })   
        
        const overallResult = check[0].players.sort((a, b)=> a.totalScore - b.totalScore).reverse()
      io.sockets.to(check[0].uniqueId).emit("overallResult", {adminId:check[0].uniqueId, overallResult:overallResult, currentSubject:overallResult})
      } else {
        console.log("no")
        playerPlayingDetail.map((game, id) => {
          if (game.uniqueId === data.gameId) {
             game.adminPage = "AdminPage01";
          }
        })
        io.sockets.to(check[0].uniqueId).emit("changePageToNextSubject", {adminId:check[0].uniqueId})
      }
    }

  });


// this socket is responsible for joining the server result with the databse result
  socket.on("completedQuiz", (incomingInfo) => {
    let status = false
    const check = playerPlayingDetail.filter((details) => details.uniqueId === incomingInfo.gameId)
    const saveResult = () => {
      if (check.length > 0) {
        console.log(check[0].uniqueId)
        io.sockets.to(check[0].uniqueId).emit("openSpinner",{adminId:check[0].uniqueId})
          playerModel.findOne(
            { quizIdNumberPlayed: check[0].uniqueId },
            (err, quiz) => {
              console.log(quiz);
              if (err) {
                status = false;
              } else {
                if (quiz !== null) {
                  
                    quiz.result = check[0].players
                  console.log(quiz.result);
                  // quiz.result = check[0].players;
                  playerModel.findOneAndUpdate( { quizIdNumberPlayed: check[0].uniqueId }, quiz,(err) => {
                      if (err) {
                        let = false;
                        console.log("unable to save")
                      } else {
                        setTimeout(() => {
                          status = true;
                          console.log("saved")
                          playerPlayingDetail.map((content) => {
                            if (content.uniqueId === check[0].uniqueId) {
                              content.adminStage = "AdminPage01";
                            }
                          });
                          io.sockets.to(check[0].uniqueId).emit("whenSaved", {
                            adminId: check[0].uniqueId,
                            adminPage: "AdminPage01",
                          });
                        }, 2000);
                      }
                    }
                  );
                }
              }
            }
          );

        
      }
      
     
    }
   
  saveResult()
})
  socket.on("disconnect", () => {
    console.log("a userhas disconnected");
  });
}) 
