const express = require("express");
const { createServer } = require("node:http");
const path = require("node:path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

let matchingPlayer;

io.on("connection", (socket) => {
  io.emit("playerCount", io.engine.clientsCount);

  socket.on("disconnect", () => {
    io.emit("playerCount", io.engine.clientsCount);
  });

  socket.on("queue", () => {
    if (matchingPlayer) {
      socket.join(`${matchingPlayer.id}${socket.id}`);
      matchingPlayer.join(`${matchingPlayer.id}${socket.id}`);
      io.to(`${matchingPlayer.id}${socket.id}`).emit("match found");
      matchingPlayer = null;
    } else {
      matchingPlayer = socket;
    }
  });
});

app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.get("/api/player-count", (req, res) => {
  res.send(io.engine.clientsCount);
});

server.listen(3000, () => {
  console.log("listening on 3000");
});
