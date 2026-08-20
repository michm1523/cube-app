import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { Server } from "socket.io";
import { randomScrambleForEvent } from "cubing/scramble";
import { fileURLToPath } from "url";
import Match from "./match.js";
const __filename = fileURLToPath(import.meta.url);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
});

let matchingPlayer;

const matches = new Map();

io.on("connection", (socket) => {
  io.emit("playerCount", io.engine.clientsCount);

  console.log(socket.handshake.auth.playerId);

  // if (!socket.handshake.auth.playerId) {
  //   console.log("emitted");
  //   io.to(socket.id).emit("assign id", crypto.randomUUID());
  // }

  if (socket.recovered) {
    console.log("recovered!");
  } else {
    console.log("not recovered!");
    const playerId = socket.handshake.auth.playerId;
    const match = matches.get(playerId);

    if (match) {
      socket.join(match.room);
      const opponentId = match.players.find((id) => id != playerId);
      for (
        let i = socket.handshake.auth.serverOffset + 1;
        i < match[opponentId].length;
        i++
      ) {
        io.to(socket.id).emit("opponent move", match[opponentId][i]);
      }
    }
  }

  socket.on("disconnect", () => {
    console.log("disconnected");
    io.emit("playerCount", io.engine.clientsCount);
  });

  socket.on("queue", async () => {
    const playerId = socket.handshake.auth.playerId;
    console.log(socket.handshake.auth.playerId);
    if (matchingPlayer) {
      const matchingId = matchingPlayer.handshake.auth.playerId;
      if (matchingId == playerId) {
        console.log(matchingId);
        console.log(playerId);
        console.log("hi");
        return;
      }
      const room = `${matchingId}${playerId}`;
      socket.join(room);
      matchingPlayer.join(room);

      const match = new Match(playerId, matchingId, room);

      matches.set(matchingId, match);
      matches.set(playerId, match);

      matchingPlayer = null;

      let scramble = await randomScrambleForEvent("333");
      scramble = scramble.toString().toLowerCase().split(" ");

      io.to(room).emit("match found", scramble);
    } else {
      matchingPlayer = socket;
    }
  });

  socket.on("move", (key) => {
    const playerId = socket.handshake.auth.playerId;
    const room = matches.get(playerId).room;
    matches.get(playerId)[playerId].push(key);
    socket.to(room).emit("opponent move", key);
  });

  socket.on("solved", (time) => {
    const playerId = socket.handshake.auth.playerId;
    const room = matches.get(playerId).room;
    socket.to(room).emit("opponent done", time);
    console.log(matches.get(playerId).playersFinished);
    if (matches.get(playerId).playersFinished == 1) {
      io.to(room).emit("match over");
    } else {
      matches.get(playerId).playersFinished = 1;
    }
  });

  socket.on("leave match", () => {
    const playerId = socket.handshake.auth.playerId;
    const room = matches.get(playerId).room;
    matches.set(playerId, null);
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
