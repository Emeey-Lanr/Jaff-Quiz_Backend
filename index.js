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

const playerPlayingDetail = []
io.on("connection", (socket) => {
  // admin creating a room and creation of player registarion box
  socket.emit("userId", { id: socket.id })
  
  socket.on("createRegistrationBox", (uniqueId) => {
    let checkIFIdExist = playerPlayingDetail.filter((content, id) => content.id === uniqueId.quizId)
    if (checkIFIdExist.length > 0) {
      console.log("unable to create")
    } else {
      let playerPlayinSchema = {
        id: uniqueId.quizId,
        players:[]
      }
      playerPlayingDetail.push(playerPlayinSchema)
      socket.join(uniqueId.quizId)
      console.log(playerPlayingDetail)
    }
  });
  // player registration
  socket.on("register", (info) => {
    // playerPlayingDetail.map((user))
    console.log(info)
    socket.join(info.userDetails.admin);
    let findTheArrayOfTheGame = playerPlayingDetail.filter((content, id) => content.id === info.userDetails.quizId)
    let checkIFUserExist = findTheArrayOfTheGame[0].players.filter((players, id) => players.playerName === info.userDetails.playerName)
    if (checkIFUserExist.length > 0) {
      console.log("user exist")
    } else {
      playerPlayingDetail.map((content, id) => {
        if (content.id === info.userDetails.quizId) {
          content.players.push(info.userDetails)
        }
      })

      socket.to(info.userDetails.quizId).emit("playersJoinings", { players: playerPlayingDetail.filter((content, id) => content.id === info.userDetails.quizId) })
      socket.to(info.userId).emit("showThatYouJoinedAlso", { players: playerPlayingDetail.filter((content, id) => content.id === info.userDetails.quizId) } )
    }

  });

      // socket.join(data.name);
      // socket.to(data.id).emit("ifExist", { message: "room", status: false });



  socket.on("disconnect", () => {
    console.log("a userhas disconnected");
  });
})
