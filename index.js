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
const room = ["English", "Maths", "Physics"];

io.on("connection", (socket) => {
  socket.emit("clientId", { clientId: socket.id });
  // socket.on("join", (data) => {

  // })
  socket.on("userId", (data) => {
    let check = room.filter((ui, id) => ui === data.name);
    // console.log(check.length);
    if (check.length > 0) {
      socket.join(data.name);
      socket.to(data.id).emit("ifExist", { message: "room", status: false });
    } else {
      console.log("room doesnt exist");
      socket
        .to(data.id)
        .emit("ifExist", { message: "room doesn't exist", status: true });
    }
  });

  socket.on("messageRoom", (data) => {
    socket.to(data.roomName).emit("message", { message: data.comingMessage });
  });

  // socket.on("playing", (pass) => {
  //   console.log(pass);
  //   // userid.map((ui, ud) => {
  //     socket.broadcast.emit("message", pass);
  //   // });
  // });

  socket.on("disconnect", () => {
    console.log("a userhas disconnected");
  });
});
