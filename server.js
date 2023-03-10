const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");


app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  console.log("new user with id: ",socket.id);
  socket.on("join-room", (roomId, userId) => {
    console.log("join room event caught roomId : ",roomId," userId : ",userId);
    socket.join(roomId);

    socket.on("ready", () => {
      console.log("ready event caught...");
      socket.to(roomId).emit("user-connected", userId);
    });

    // messages
    socket.on("message", (message) => {
      //send message to the same room
      io.to(roomId).emit("createMessage", message);
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});
server.listen(3000, () => {
  console.log("Server is running on... ", 3000);
});