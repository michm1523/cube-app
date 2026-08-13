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
    if (matchingPlayer && matchingPlayer.id != socket.id) {
      const room = `${matchingPlayer.id}${socket.id}`;
      socket.join(room);
      matchingPlayer.join(room);

      matchingPlayer = null;

      let scramble = await randomScrambleForEvent("333");
      scramble = scramble.toString().toLowerCase().split(" ");

      io.to(room).emit("match found", scramble);
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
    if (room) io.to(room).emit("match over");
  });

  socket.on("leave match", () => {
    const room = Array.from(socket.rooms).find((r) => r !== socket.id);
    socket.leave(room);
  });

  socket.on("update player count", () => {
    io.emit("playerCount", io.engine.clientsCount);
  });

  socket.on("cancel queue", () => {
    matchingPlayer = null;
  });
});

app.use(express.static(path.join(path.dirname(__filename), "../client/dist")));

app.get("/", (req, res) => {
  res.sendFile(
    path.join(path.dirname(__filename), "../client/dist/index.html"),
  );
});

server.listen(3000, "0.0.0.0", () => {
  console.log("listening on 3000");
});
