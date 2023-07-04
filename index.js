const express = require("express");
const app = express();

require("dotenv").config();

const cors = require("cors");
const mongoose = require("mongoose");
const PORT = process.env.PORT;
const URI = process.env.URI;
console.log(URI)
const server = app.listen(PORT, async () => {
   try {
     const connectToDb = await mongoose.connect(`${URI}`);
    console.log(`a user has connected at Port ${PORT}`);
   } catch (error) {
     console.log(error);
   }

});




const Socket = require("socket.io");
const io = Socket(server, { cors: { option: "*" } });
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(cors());
app.use(express.json({ limit: "500mb" }));
const adminRoute = require("./routes/admindashboard");
const game = require("./routes/GameRoute");
const searchRoute = require("./routes/SearchResultRoute")
app.use("/admin", adminRoute);
app.use("/game", game);
app.use("/search", searchRoute )

const playerModel = require("./models/Playersmodel")
const adminLoggedIn =  []
const playerPlayingDetail = []
const views = []
const  mark = []
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
      let date = new Date
      let playerPlayinSchema = {}
      let markSchema = {
        id:uniqueId.quizId,
        players: []
      }
      if (uniqueId.mode === 1) {
         playerPlayinSchema = {
           currentGameIndex: 0,
           adminPage: uniqueId.adminPage,
           uniqueId: uniqueId.quizId,
           mode: uniqueId.mode,
           currentSubjectName: "",
           totalCurrentSubject: [],
           currentAssignedMark: 1,
           allQuizIndex: -1,
           clicked: -1,
           currentTime: 0,
           gameStatus: [],
           players: [],
           submitted: [],
           month: Number(String(uniqueId.date).split("-")[1]),
           year: Number(String(uniqueId.date).split("-")[0]),
           day: Number(String(uniqueId.date).split("-")[2].split("T")[0]),
           totalRanking:[],
         };
      } else if (uniqueId.mode === 2) {
        playerPlayinSchema = {
          currentGameIndex: 0,
          adminPage: uniqueId.adminPage,
          uniqueId: uniqueId.quizId,
          mode: uniqueId.mode,
          currentSubjectName: "",
          totalCurrentSubject: [],
          currentAssignedMark: 1,
          allQuizIndex: -1,
          clicked: -1,
          currenTime: 0,
          gameStatus: [],
          players: [],
          month: Number(String(uniqueId.date).split("-")[1]),
          year: Number(String(uniqueId.date).split("-")[0]),
          day: Number(String(uniqueId.date).split("-")[2].split("T")[0]),
          totalRanking:[],
        };
      } else if (uniqueId.mode === 3) {
        playerPlayinSchema = {
          currentGameIndex: 0,
          adminPage: uniqueId.adminPage,
          uniqueId: uniqueId.quizId,
          mode: uniqueId.mode,
          currentSubjectName: "",
          totalCurrentSubject: [],
          currentAssignedMark: 1,
          allQuizIndex: -1,
          currentTime: 0,
          gameStatus: [],
          players: [],
          currentQuestion: [],
          submitted:[],
          month: Number(String(uniqueId.date).split("-")[1]),
          year: Number(String(uniqueId.date).split("-")[0]),
          day: Number(String(uniqueId.date).split("-")[2].split("T")[0]),
          totalRanking:[]
        };
        console.log()
        
     }
    
      playerPlayingDetail.push(playerPlayinSchema)
      mark.push(markSchema)
      socket.join(uniqueId.quizId)
      // console.log(playerPlayingDetail, mark)
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

  // Stage 1
  socket.on("adminModeStart", (data) => {
    const check = playerPlayingDetail.filter((content) => content.uniqueId === data.identification)
   
    if (check.length > 0) {
       const gameStatus = check[0].gameStatus.filter(
         (status) => status.name === data.currentSubjectName
       );

      const addInfoFunction = () => {
         playerPlayingDetail.map((content) => {
           if (content.uniqueId === data.identification) {
             content.currentGameIndex = 0
               content.adminPage = data.adminPage
               content.currentSubjectName = data.currentSubjectName
               content.totalCurrentSubject = data.currentQuestion
               content.currentAssignedMark = data.assignedMark
             if (content.allQuizIndex === -1) {
                 content.allQuizIndex = data.allQuestionLength - 1
             }
             if (gameStatus.length > 0) {
               console.log("subject alreday exist")
             } else {
               content.gameStatus.push({ name: data.currentSubjectName , status:false});
             }
             content.players.map((players) => {
               players.subjectToBeDone.map((subject) => {
                 if (subject.quizName === data.currentSubjectName) {
                   data.currentQuestion.map(() => {
                    subject.questions.push(0)
                  })
                }
               })
             })
             
           }
       
         });
        console.log(check[0], "this is mode 1")
        const questionToBeAnsweredFunction = () => {
          return {
            currentQuestion:
              check[0].totalCurrentSubject[check[0].currentGameIndex],
            roomId: check[0].uniqueId,
            answersStatus: false,
            currentSubject: check[0].currentSubjectName,
            assignedMark: check[0].currentAssignedMark,
            adminStage:check[0].adminPage,
            mode:check[0].mode,
            currentGameIndex:check[0].currentGameIndex
          };
        }
   
        
         io.sockets.to(check[0].uniqueId).emit("openQuestionAdminMode1", questionToBeAnsweredFunction());
        socket.to(check[0].uniqueId).emit("openQuestionAdminMode1Players", questionToBeAnsweredFunction())
       
      }
      if (gameStatus.length > 0) {
        if (gameStatus[0].status) {
          io.sockets.to(check[0].uniId).emit("alreadyPlayed", {
            roomId:check[0].uniqueId
          })
        } else {
          addInfoFunction()
        }
      } else {
        addInfoFunction()
      }
     
    }

  })
  socket.on("emitTimeAndEnabledButton", (data)=>{
      const check = playerPlayingDetail.filter((content) => content.uniqueId === data.roomId)
   if(check.length >0){
     playerPlayingDetail.map((content) => {
       if (content.uniqueId === data.roomId) {
        content.currentTime = data.currentTime
      }
     })
      io.sockets.to(check[0].uniqueId).emit("quizMode1Time", 
        {
          time:check[0].currentTime,
          roomId:check[0].uniqueId,
          mark:check[0].currentAssignedMark
        
        }
     );

        
   }

  })

  socket.on("mode1SubmitQuestion", (data) => {
    io.sockets.to(data.roomId).emit("collectAnswer", {roomId:data.roomId})
     
  })
// ///////////////////////////////////////////////////////////////////////////
  socket.on("submittedAnswer", async(data)=>{

    if (data.currentSubject !== "" && data.name !== "" && data.roomId !== "" && data.score !== -1) {
      console.log(data, "this your answer")
      // const checkMarkBox = mark.find((content)=> content.id === data.roomId)
      // // const players = []
      // const IfPlayerExist = checkMarkBox.players .filter((playerName) => playerName.name === data.name)
      // if (IfPlayerExist.length === 0) {
      //   // players.push(data)
      //   checkMarkBox.players.push(data)
      // }
      // // console.log(checkMarkBox,"++++++++++++++++++++++++++++++++++++++++")
      //   const  check = playerPlayingDetail.filter((content, id) => content.uniqueId === players[i].roomId)
      // for (let i = 0; i <  checkMarkBox.players.length; i++){
      //   let check = playerPlayingDetail.filter((content, id) => content.uniqueId === checkMarkBox.players[i].roomId)
      //   if (check.length > 0) {
      //     let findGameRoom = playerPlayingDetail.find((content) => content.uniqueId === checkMarkBox.players[i].roomId)
      //     const currentPlayer = findGameRoom.players.find((player) => player.playerName === checkMarkBox.players[i].name)
      //     currentPlayer.subjectToBeDone.map((subject, id) => {
      //       if (subject.quizName === checkMarkBox.players[i].currentSubject) {
      //         subjectToBeDoneIdentification = id
      //         subject.score = 0
      //         currentPlayer.subjectToBeDone[id].questions[check[0].currentGameIndex] = data.score
      //         subject.score = subject.questions.reduce((total, score)=> total + score, 0)
              
      //       }
      //     })
       
      //    checkMarkBox.players.splice(i, 1)
      //     i--;
      //   }
      // }
      // console.log(playerPlayingDetail[0].players[0].subjectToBeDone, playerPlayingDetail[0].players[1].subjectToBeDone);
      // console.log(checkMarkBox, "when it's empty")
      let check = playerPlayingDetail.filter((content, id) => content.uniqueId === data.roomId)
      // let currentScore = 
      let subjectDoneIdentification = 0
      if (check.length > 0) {
        
        const calculate = playerPlayingDetail.map((content) => {
          if (content.uniqueId === data.roomId) {
            console.log(content.currentGameIndex)
            content.players.map((player) => {
              if (player.playerName === data.name) {

                player.subjectToBeDone.map((subject,id) => {
                  if (subject.quizName === data.currentSubject) {
                    subjectDoneIdentification = id
                    // subject.score = 0;
              return   player.subjectToBeDone[id].questions[check[0].currentGameIndex] = data.score
                    // subject.questions.map((score) => {
                    //   subject.score += score
                    // })
                    
                  }
               
                })
                
              }
            })
          }
        })
       console.log(calculate)
         console.log(check[0].players[0].subjectToBeDone, check[0].players[1].subjectToBeDone);
        io.sockets.to(check[0].uniqueId).emit("showAdminMode1CurrentScore", {
          roomId:check[0].uniqueId,
          subjectDoneIdentification: subjectDoneIdentification,
          scoreIndex: check[0].currentGameIndex,
          players:check[0].players,
          currentSubject:data.currentSubject
        })
        
      }
       
     }
  })


  socket.on("changedToNextQuestionOrSubjectOverallAdminMode1", async (data) => {
    console.log(data)
     const check = playerPlayingDetail.filter((content, id) => content.uniqueId === data.roomId)
    if (check.length > 0) {
      let subjectName =check[0].currentSubjectName
      if (check[0].totalCurrentSubject.length - 1 === check[0].currentGameIndex) {
        let ranking = []
        let identi = 0
       
       const updated = playerPlayingDetail.forEach((content) => {
          if (content.uniqueId === data.roomId) {
            content.adminPage = "AdminPage03";
            content.gameStatus.forEach((state) => {
              if (state.name === check[0].currentSubjectName) {
                state.status = true
              }
            })
            content.players.map((player) => {
              const subject = player.subjectToBeDone.find((subject) => subject.quizName === subjectName)
              
              const total = subject.questions.reduce((total, score) => total + score, 0)
              subject.score += Number(total)
             
            })
             return content;
         }
        
       })
         check[0].players.map((player) => {
          player.subjectToBeDone.map((subject, id) => {
            if (subject.quizName === subjectName) {
              identi = id
               ranking = check[0].players.sort((a, b) => a.subjectToBeDone[id].score - b.subjectToBeDone[id].score)
            }
          });
        });
              
       
        console.log(check[0].players[0].subjectToBeDone, check[0].players[1].subjectToBeDone)
        io.sockets.to(check[0].uniqueId).emit("adminMode1SubjectOverall", {
          roomId: check[0].uniqueId,
          ranking: ranking.reverse(),
          index: identi,
          subject: check[0].currentSubjectName,
          adminStage:check[0].adminPage
        })

       
      } else {
        playerPlayingDetail.map((content) => {
          if (content.uniqueId === data.roomId) {
             content.adminPage = "AdminPage02"
            content.currentGameIndex = content.currentGameIndex + 1
          }
        })
         const questionToBeAnsweredFunction = () => {
          return {
            currentQuestion:
              check[0].totalCurrentSubject[check[0].currentGameIndex],
            roomId: check[0].uniqueId,
            answersStatus: false,
            currentSubject: check[0].currentSubjectName,
            assignedMark: check[0].currentAssignedMark,
            adminStage:check[0].adminPage,
            mode:check[0].mode,
            currentGameIndex:check[0].currentGameIndex
          };
        }
        
        socket.to(check[0].uniqueId).emit("changeQuestionAdminMode1Players", questionToBeAnsweredFunction())
        io.sockets.to(check[0].uniqueId).emit("changeQuestionAdminMode1Admin", questionToBeAnsweredFunction())
        
     }
   }
  })
 
  /////////////////////////////////////////////////////////////////////////////////////////////
  // Stage 2
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
            mode:lookForThatArray[0].mode
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
                 if (check[0].mode !== 1) {
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
                 }
                
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
  
// socket.on("alertSubmitOrNext", (data) => {
//     const check = playerPlayingDetail.filter((id) => id.uniqueId === data.gameId)
//     console.log(check[0])
//     if (check.length > 0) {
//       if (check[0].allQuizIndex === check[0].gameStatus.length - 1) {
//         // alertSubmit
//         console.log("no")
//         io.sockets.to(check[0].uniqueId).emit("alertUserToSubmit", {info:check[0].uniqueId})
//       } else {
//         playerPlayingDetail.map((game, id) => {
//           if (game.uniqueId === data.gameId) {
//             game.adminPage = "AdminPage01";
//           }
//         });
//         io.sockets
//           .to(check[0].uniqueId)
//           .emit("changePageToNextSubject", { adminId: check[0].uniqueId });
//       }
//     }
// })

  socket.on("nextSubjectOrOverallResult", (data) => {
    if (data.gameId !== "") {
      console.log(data)
      const check = playerPlayingDetail.filter((id) => id.uniqueId === data.gameId)
      if (check.length > 0) {
        if (check[0].allQuizIndex === check[0].gameStatus.length - 1) {
          
          // const user = playerPlayingDetail.find((content) => content.rommId === data.rommId)
          // user.players.map((content) => {
          //   const total = content.subjectToBeDone.reduce((total, score) => {
          //   return  total.score + score.score
          //   }, 0)
          //   console.log(total)
          // })
          const clalculatedTotalScore = playerPlayingDetail.map((roomId) => {
            if (roomId.uniqueId === data.gameId) {
              roomId.players.map((player) => {
                player.totalScore = 0;
                player.subjectToBeDone.map((subject) => {
                  player.totalScore += Number(subject.score);
                });
                // const totalCalculated = player.subjectToBeDone.reduce((total, score) => total.score + score.score, 0)
                // player.totalScore += Number(totalCalculated)
              })
          
            }
            return roomId
           
            // return player
          })
          console.log(check[0].players)
          const overallResult = check[0].players.sort((a, b) => b.totalScore - a.totalScore)
          let rank  = 1
          for (let i = 0; i < overallResult.length; i++){
            if (i > 0 && overallResult[i].totalScore !== overallResult[i - 1].totalScore) {
              rank = i + 1
             
            }
             check[0].totalRanking.push({
               name: overallResult[i].playerName,
               score: overallResult[i].totalScore,
               rank: rank,
             });
          }
      
          io.sockets.to(check[0].uniqueId).emit("overallResult", { adminId: check[0].uniqueId, overallResult: overallResult, currentSubject: overallResult, position: check[0].totalRanking})
        } else {
          playerPlayingDetail.map((game, id) => {
            if (game.uniqueId === data.gameId) {
              game.adminPage = "AdminPage01";
            }
          });
          io.sockets
            .to(check[0].uniqueId)
            .emit("changePageToNextSubject", { adminId: check[0].uniqueId });
        }
      } 
    }
    
   
  })


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
                  quiz.month = check[0].month
                  quiz.year = check[0].year
                  quiz.day = check[0].day
                  quiz.ranking = check[0].totalRanking
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


  // Stage 3
  // self Place
  socket.on("startSelfMode", (data) => {
    console.log(data)
    const check = playerPlayingDetail.filter((content) => content.uniqueId === data.roomId)
    console.log(check)
    const ifSubjectIsDone = check[0].gameStatus.filter((subjectName)=> subjectName.name === data.currentSubjectName)
    const subjectStatus = { name: data.currentSubjectName, status: false }
    
    console.log(ifSubjectIsDone)

 let currentSubject = data.allSubjects.filter((content) => content.quizName === data.currentSubjectName)
      const checkSubmitted = check[0].submitted.filter((subject)=>subject.subjectName === data.currentSubjectName)
      console.log(currentSubject)
      let scoreBox = []
      let subjectMark = 1
    const updateFunction = () => {
     
       playerPlayingDetail.map((content, id) => {
          if (content.uniqueId === data.roomId) {
            content.currentSubjectName = data.currentSubjectName
            content.allQuizIndex = data.allSubjects.length - 1
            content.adminPage = "AdminPage02";
            content.currenTime = data.time
            content.currentQuestion = data.question
            if(check[0].totalCurrentSubject.length < 1){
             content.totalCurrentSubject = data.allTotalSubject
            }
            content.currentAssignedMark = currentSubject[0].subjectMark
            content.gameStatus.push(subjectStatus);
            if (checkSubmitted.length > 0) {
              console.log("subject exist")
            } else {
              console.log("subject submission done")
              content.submitted.push({
                subjectName: data.currentSubjectName,
                submitted: [],
              });
            }
            content.players.map((player, id) => {
               player.subjectToBeDone.map((subject)=>{
                // console.log(subject)
                 if (subject.quizName === data.currentSubjectName) {
                   data.question.map((question, id) => {
                     subject.questions.push(0)
                   })
                   subjectMark = subject.subjectMark
                   scoreBox = subject.questions
                 }
               })
            })
          }
       });
      console.log(check[0], "this is the data")
        socket.to(check[0].uniqueId).emit("stage3Question", {
          question: check[0].currentQuestion,
          subjectName: check[0].currentSubjectName,
          scoreBox: scoreBox,
          time: check[0].currenTime,
          adminPage:check[0].adminPage,
          subjectMark: check[0].currentAssignedMark,
          mode:check[0].mode
          
        });
      io.sockets.to(check[0].uniqueId).emit("stage3AdminQuestion", {
        time: check[0].currenTime,
        adminId: check[0].uniqueId,
        adminPage:check[0].adminPage
      })
      
        // console.log(check[0].currentQuestion, check[0].currentSubjectName,scoreBox, check[0].currenTime)
    }
  // this checks if the subject has been answered before so it won't be used again after been answerd
    if (ifSubjectIsDone.length > 0) {
      if (ifSubjectIsDone[0].status) {
        console.log("play")
        io.to(data.socketId).emit("youcant", {message:"Done, can't play again"});
      } else {
       updateFunction() 
      }
     
    } else {
      updateFunction()
    }

    
  })

  // submitanswer
  socket.on("selfSubmitQuestion", (data) => {
    // the game status should change here
    playerPlayingDetail.map((content) => {
      if (content.uniqueId === data.roomId) {
        content.gameStatus.map((status) => {
          if (status.name === content.currentSubjectName) {
           status.status = true
          }
        
       })
     } 
    })
    socket.to(data.roomId).emit("collectPlayersAnswers", {roomId:data.roomId})
  })
  socket.on("verifyToSubmitAnswer", async(data) => {
   const check = playerPlayingDetail.filter((content)=> content.uniqueId === data.roomId)
    if(data.username !== '' && data.currentSubject !== '' && (data.totalScore.length === check[0].currentQuestion.length) && data.roomId !== ''){
      const comingData = data
   console.log(data,"this is your data")
      const findSubmitted = check[0].submitted.filter((subject)=> subject.subjectName === check[0].currentSubjectName) 
      const findUser = findSubmitted[0].submitted.filter((user)=> user.name === data.username)
      let ranking = []
      let  identification =  0
      if (findUser.length > 0) {
          console.log("user have submitted already")
           playerPlayingDetail.map((content) => {
          if (content.uniqueId === check[0].uniqueId) {
            content.adminPage = "AdminPage03"
            content.players.map((player) => {
            player.subjectToBeDone.map((subject, id) => {
         
             if (subject.quizName === content.currentSubjectName) {
                 console.log(subject.score)
                     identification = id
                    ranking = check[0].players.sort((a, b) => a.subjectToBeDone[id].score - b.subjectToBeDone[id].score).reverse()
                  }
                })
         
          
            })
          }
        })
      } else {
         
          const updated = playerPlayingDetail.find((content) => content.uniqueId === check[0].uniqueId);
        
         const userSubmitting = updated.players.find((content) => content.playerName === data.username );
       
        if (data.username === userSubmitting.playerName) {
        
         const currentSubject = userSubmitting.subjectToBeDone.find((subject) => subject.quizName === check[0].currentSubjectName);
          
          currentSubject.score = data.totalScore.reduce((total, score) => total + score, 0);
             
          console.log(currentSubject, "that current subject");
        }

 
     
        // currentSubject.score = total;
        playerPlayingDetail.map((content) => {
          if (content.uniqueId === check[0].uniqueId) {
            content.adminPage = "AdminPage03"
            content.players.map((player) => {
              if (player.playerName === data.username) {
                player.subjectToBeDone.map((subject, id) => {

                  if (subject.quizName === content.currentSubjectName) {
                
                    identification = id
          
                    ranking = check[0].players.sort((a, b) => a.subjectToBeDone[id].score - b.subjectToBeDone[id].score).reverse()
                  }
                })
              }

            })
          }
        })
        // playerPlayingDetail.map((content) => {
        //   if (content.uniqueId === check[0].uniqueId) {
        //     content.adminPage = "AdminPage03"
        //     content.players.map((player) => {
        //       if (player.playerName === data.username) {
        //         player.subjectToBeDone.map((subject, id) => {

        //           if (subject.quizName === content.currentSubjectName) {
        //             subject.score = 0;
        //             data.totalScore.map((score) => {
        //               subject.score += score
        //             })
        //             identification = id
        //             console.log(subject.score, player.playerName)
        //             ranking = check[0].players.sort((a, b) => a.subjectToBeDone[id].score - b.subjectToBeDone[id].score).reverse()
        //           }
        //         })
        //       }

        //     })
        //   }
        // })
      }
  console.log(ranking, identification)
  io.sockets.to(check[0].uniqueId).emit("stage3PreSubject", {
    ranking:ranking,
    roomId:check[0].uniqueId,
    subjectId:identification,
    adminStage:check[0].adminPage,
    currentSubject:check[0].currentSubjectName
  })


    
     
     
    }
      

   
  } )

  socket.on("selfSubmit",(data)=>{
    console.log(data)
   const check = playerPlayingDetail.filter((content)=> content.uniqueId === data.roomId)
    const findSubmitted = check[0].submitted.filter((subject)=> subject.subjectName === check[0].currentSubjectName) 
    const findUser = findSubmitted[0].submitted.filter((user)=> user.name === data.username)
    
      playerPlayingDetail.map((content) => {
        if (content.uniqueId === check[0].uniqueId) {
          content.adminPage = "AdminPage03"
          content.submitted.map((submit) => {
            if (submit.subjectName === check[0].currentSubjectName) {
              if (findUser.length > 0) {
                console.log("already submitted")
              } else {
                submit.submitted.push({name:data.username})
                console.log("not submitted")
              }
            }
          })
          content.players.map((player) => {
            if (player.playerName === data.username) {
              player.subjectToBeDone.map((subject, id) => {
               
                if (subject.quizName === content.currentSubjectName) {
                  subject.score = 0;
                  data.totalScore.map((score) => {
                    subject.score += score
                  })
                
                }
              })
            }
          
          })
        }
      })
      // send it to the specif user
    io.to(data.uniqueId).emit("youveSubmitted", {
      roomId: data.roomId,
      message: "youv've succcesfully submited",
    });
    
  })






  // Views 
  socket.on("views", (data) => {
   socket.join(data.name)
    console.log(data)
    const viewBox = []
    const likeBox = []
    data.result.map((content) => {
      const checkView = viewBox.filter((id) => id.quizId === content._id)
      const checkLike = likeBox.filter((id) => id.quizId === content._id);
      if (checkView.length === 0) {
        viewBox.push({ quizId: content._id, views: 0 });
      } 
      if (checkLike.length === 0) {
        likeBox.push({ quizId: content._id, likes: 0 });
      }
      
      
    })
    console.log(viewBox, likeBox)
    const check = views.filter((content) => content.name === data.name)
    if (check.length > 0) {
      console.log("user already exist")
      let newUserView = []
      check[0].views.map((content) => {
        newUserView = viewBox.filter((quizLike) => quizLike.quizId !== content.quizId)

      })
      
      newUserView.map((content) => {
        const seeif = check[0].views.filter((content) => content.quizId === content.quizId)
        if (seeif.length === 0) {
          check[0].views.push(content);
          check[0].like.push(content);
        }
        
     })
      
    } else {
      views.push({ name: data.name, like:likeBox, views:viewBox });
    }
    console.log(views[0])
    io.sockets.to(data.id).emit("views",{views:views[0].views})
  })
   socket.on("countView", (data) => {
     const currentCollection = views.filter((content) => content.name === data.collectionId);
     const check = currentCollection.find((content) => content.name === data.collectionId);
     const currentview = check.views.find((content) => content.quizId === data.quizId );
     currentview.views = currentview.views + 1;
     console.log(views[0].views);
     io.sockets.to(data.sId).emit("countedViews", {
       views: check.views,
     });
   });
  socket.on("disconnect", () => {
    console.log("a userhas disconnected");
  });
}) 
