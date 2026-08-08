import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { Server } from "socket.io";
import { randomScrambleForEvent } from "cubing/scramble";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);

const app = express();
const server = createServer(app);
const io = new Server(server);

let matchingPlayer;

io.on("connection", (socket) => {
  io.emit("playerCount", io.engine.clientsCount);

  socket.on("disconnect", () => {
    io.emit("playerCount", io.engine.clientsCount);
  });

  socket.on("queue", async () => {
    if (matchingPlayer) {
      socket.join(`${matchingPlayer.id}${socket.id}`);
      matchingPlayer.join(`${matchingPlayer.id}${socket.id}`);

      let scramble = await randomScrambleForEvent("333");
      scramble = scramble.toString().toLowerCase().split(" ");

      io.to(`${matchingPlayer.id}${socket.id}`).emit("match found", scramble);
      matchingPlayer = null;
    } else {
      matchingPlayer = socket;
    }
  });

  socket.on("move", (key) => {
    const room = Array.from(socket.rooms).find((r) => r !== socket.id);
    socket.to(room).emit("opponent move", key);
  });

  socket.on("solved", (time) => {
    const room = Array.from(socket.rooms).find((r) => r !== socket.id);
    socket.to(room).emit("opponent done", time);
  });

  socket.on("match over", () => {
    const room = Array.from(socket.rooms).find((r) => r !== socket.id);
    io.to(room).emit("match over");
  });

  socket.on("leave match", () => {
    const room = Array.from(socket.rooms).find((r) => r !== socket.id);
    socket.leave(room);
  });

  socket.on("update player count", () => {
    io.emit("playerCount", io.engine.clientsCount);
  });
});

app.use(express.static(path.join(path.dirname(__filename), "../client/dist")));

app.get("/", (req, res) => {
  res.sendFile(
    path.join(path.dirname(__filename), "../client/dist/index.html"),
  );
});

// app.get("/api/player-count", (req, res) => {
//   console.log(io.engine.clientsCount);
//   res.json({ count: io.engine.clientsCount });
// });

server.listen(3000, () => {
  console.log("listening on 3000");
});
