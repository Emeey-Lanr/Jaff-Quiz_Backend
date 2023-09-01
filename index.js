const express = require("express");
const app = express();

require("dotenv").config();

const cors = require("cors");
const mongoose = require("mongoose");
const PORT = process.env.PORT;
const URI = process.env.URI;

const server = app.listen(PORT, async () => {
   try {
     const connectToDb = await mongoose.connect(`${URI}`);
    console.log(`a user has connected at Port ${PORT}`);
   } catch (error) {
   
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
        // stage 3
       
        
      } else if (checkIFIdExist[0].adminPage === "AdminPage02" && checkIFIdExist[0].totalCurrentSubject.length > 0) {
        let currentSubject = checkIFIdExist[0]
        // question stage, you have to send the the time of that particular subject
       io.sockets.in(uniqueId.quizId).emit("currentPage",
        {loading: false, 
          adminPage: checkIFIdExist[0].adminPage,
          currentQuestion: checkIFIdExist[0].totalCurrentSubject[checkIFIdExist[0].currentGameIndex],
          stage: 2,
          roomId: checkIFIdExist[0].uniqueId,
          stateLoadingQuestion:true,
         });
        // stage 2
  
      } else if (checkIFIdExist[0].adminPage === "AdminPage03") {
        // a particular subject overall
        io.sockets.in(uniqueId.quizId).emit("currentPage",
          {
            players: checkIFIdExist[0].players,
            adminPage: checkIFIdExist[0].adminPage,
            stage: 3,
            roomId: checkIFIdExist[0].uniqueId
          })
        // stage 3
   
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
  
        
     }
    
      playerPlayingDetail.push(playerPlayinSchema)

      mark.push(markSchema)
      socket.join(uniqueId.quizId)

    }
  });
  // player registration
  socket.on("register", (info) => {
   
   
    socket.join(info.uniqueIdentification);
    let findTheArrayOfTheGame = playerPlayingDetail.filter((content, id) => content.uniqueId === info.uniqueIdentification)

    if(findTheArrayOfTheGame.length > 0){
      let checkIFUserExist = findTheArrayOfTheGame[0].players.filter((players, id) => players.playerName === info.userDetails.playerName)
      if(checkIFUserExist.length < 1){
      playerPlayingDetail.map((content, id) => {
        if (content.uniqueId === info.uniqueIdentification) {
          content.players.push(info.userDetails);
        }
      })

      findTheArrayOfTheGame[0].players.map((user, id) => {
    
      })
     
      
       socket.to(info.uniqueIdentification).emit("playersJoinings", { players: findTheArrayOfTheGame[0].players, adminPage:findTheArrayOfTheGame[0].adminPage })
      io.sockets.in(info.uniqueIdentification).emit("showThatYouJoinedAlso", { players: findTheArrayOfTheGame[0].players, adminPage:findTheArrayOfTheGame[0].adminPage} )
    }
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
             if (gameStatus.length < 1) {
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
 
      let check = playerPlayingDetail.filter((content, id) => content.uniqueId === data.roomId)
  
      let subjectDoneIdentification = 0
      if (check.length > 0) {
        
        const calculate = playerPlayingDetail.map((content) => {
          if (content.uniqueId === data.roomId) {
    
            content.players.map((player) => {
              if (player.playerName === data.name) {

                player.subjectToBeDone.map((subject,id) => {
                  if (subject.quizName === data.currentSubject) {
                    subjectDoneIdentification = id
                   
              return   player.subjectToBeDone[id].questions[check[0].currentGameIndex] = data.score
                   
                    
                  }
               
                })
                
              }
            })
          }
        })
   
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
 
        let lookForThatArray = playerPlayingDetail.filter((content) => content.uniqueId === start.roomId)

        let check = lookForThatArray[0].gameStatus.filter((status) => status.name === start.currentSubject)
        

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

              
              let checkNoToAddAgain = content.gameStatus.filter(
                (subjectName) => subjectName.name === start.currentSubject
              );
              if (checkNoToAddAgain.length < 1) {
                 content.gameStatus.push({
                   name: start.currentSubject,
                   status: false,
                 });
              }
             
            }
          });
          playerPlayingDetail.map((content, id) => {
            if (content.uniqueId === start.roomId) {
           
              content.players.map((players) => {
                players.subjectToBeDone.map((subject) => {
                  if (subject.quizName === start.currentSubject) {
                    
                    content.totalCurrentSubject.map((question) => {
                      subject.questions.push(question.score);
                    });
                  
                  }
                });
              });
            }
          });
         
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
 
    playerPlayingDetail.map((content) => {
      if (content.uniqueId === info.roomId) {
        
        content.players.map((players)=>{
          if (players.playerName === info.playerName) {
         
            players.subjectToBeDone.map((subject, id) => {
              questionsBox = players.subjectToBeDone.filter((content)=> content.quizName === info.currentSubject)
              if (subject.quizName === content.currentSubject) {
                subject.questions[check[0].currentGameIndex] = info.currentStatus ? content.currentAssignedMark : 0
               
  
              }
            })
          }
        })
      }
    })

   
  
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
                
                 if (check[0].mode !== 1) {
                    content.players.map((players) => {
                   players.subjectToBeDone.map((subject) => {
                     if (subject.quizName === check[0].currentSubject) {
                          subject.score = 0
                             subject.questions.map((scores) => {
                               subject.score += Number(scores)
                              
                              
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
                   
                   }
                 });
               });
             }
            })
      
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
  


  socket.on("nextSubjectOrOverallResult", (data) => {
    if (data.gameId !== "") {
    
      const check = playerPlayingDetail.filter((id) => id.uniqueId === data.gameId)
      if (check.length > 0) {
        if (check[0].allQuizIndex === check[0].gameStatus.length - 1) {
          
         
          const clalculatedTotalScore = playerPlayingDetail.map((roomId) => {
            if (roomId.uniqueId === data.gameId) {
              roomId.players.map((player) => {
                player.totalScore = 0;
                player.subjectToBeDone.map((subject) => {
                  player.totalScore += Number(subject.score);
                });
              
              })
          
            }
            return roomId
           
           
          })
         
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
    const saveResult = async () => {
      try {
           if (check.length > 0) {
           
             io.sockets
               .to(check[0].uniqueId)
               .emit("openSpinner", { adminId: check[0].uniqueId });
             const savePlayerInfo = await playerModel.findOne({
               quizIdNumberPlayed: check[0].uniqueId,
             });
             if (savePlayerInfo === null) {
             }
             savePlayerInfo.result = check[0].players;
             savePlayerInfo.month = check[0].month;
             savePlayerInfo.year = check[0].year;
             savePlayerInfo.day = check[0].day;
             savePlayerInfo.ranking = check[0].totalRanking;
             savePlayerInfo.result = check[0].players;
             const updateInfo = await playerModel.findOneAndUpdate(
               { quizIdNumberPlayed: check[0].uniqueId },
               savePlayerInfo
             );
             setTimeout(() => {
               status = true;
             
               playerPlayingDetail.map((content) => {
                 if (content.uniqueId === check[0].uniqueId) {
                   content.adminStage = "AdminPage01";
                 }
               });
               io.sockets.to(check[0].uniqueId).emit("whenSaved", {
                 adminId: check[0].uniqueId,
                 adminPage: "AdminPage01",
               });
             }, 1_000);

             
           }
      } catch (error) {
        
      }
   
      
     
    }
   
  saveResult()
  })


  // Stage 3
  // self Place
  socket.on("startSelfMode", (data) => {

    const check = playerPlayingDetail.filter((content) => content.uniqueId === data.roomId)
   
    const ifSubjectIsDone = check[0].gameStatus.filter((subjectName)=> subjectName.name === data.currentSubjectName)
    const subjectStatus = { name: data.currentSubjectName, status: false }
    


 let currentSubject = data.allSubjects.filter((content) => content.quizName === data.currentSubjectName)
      const checkSubmitted = check[0].submitted.filter((subject)=>subject.subjectName === data.currentSubjectName)
    
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
            if (checkSubmitted.length < 1) {
               content.submitted.push({
                 subjectName: data.currentSubjectName,
                 submitted: [],
               });
            }
           
            content.players.map((player, id) => {
               player.subjectToBeDone.map((subject)=>{
               
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

    }
  // this checks if the subject has been answered before so it won't be used again after been answerd
    if (ifSubjectIsDone.length > 0) {
      if (ifSubjectIsDone[0].status) {
    
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
  
      const findSubmitted = check[0].submitted.filter((subject)=> subject.subjectName === check[0].currentSubjectName) 
      const findUser = findSubmitted[0].submitted.filter((user)=> user.name === data.username)
      let ranking = []
      let  identification =  0
      if (findUser.length > 0) {
        
           playerPlayingDetail.map((content) => {
          if (content.uniqueId === check[0].uniqueId) {
            content.adminPage = "AdminPage03"
            content.players.map((player) => {
            player.subjectToBeDone.map((subject, id) => {
         
             if (subject.quizName === content.currentSubjectName) {
                
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
      
      }

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

   const check = playerPlayingDetail.filter((content)=> content.uniqueId === data.roomId)
    const findSubmitted = check[0].submitted.filter((subject)=> subject.subjectName === check[0].currentSubjectName) 
    const findUser = findSubmitted[0].submitted.filter((user)=> user.name === data.username)
    
      playerPlayingDetail.map((content) => {
        if (content.uniqueId === check[0].uniqueId) {
          content.adminPage = "AdminPage03"
          content.submitted.map((submit) => {
            if (submit.subjectName === check[0].currentSubjectName) {
              if (findUser.length < 1) {
                 submit.submitted.push({ name: data.username });
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
    
    const check = views.filter((content) => content.name === data.name)
    if (check.length > 0) {
 
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
   
    io.sockets.to(data.id).emit("views",{views:views[0].views})
  })
   socket.on("countView", (data) => {
     const currentCollection = views.filter((content) => content.name === data.collectionId);
     const check = currentCollection.find((content) => content.name === data.collectionId);
     const currentview = check.views.find((content) => content.quizId === data.quizId );
     currentview.views = currentview.views + 1;
    
     io.sockets.to(data.sId).emit("countedViews", {
       views: check.views,
     });
   });
  // socket.on("disconnect", () => {
  //   console.log("a userhas disconnected");
  // });
}) 
