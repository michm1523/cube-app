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
  pingTimeout: 1000,
  pingInterval: 2000,
});

let matchingPlayer;

const matches = new Map();

io.on("connection", (socket) => {
  io.emit("playerCount", io.engine.clientsCount);

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
        i < match[opponentId].moves.length;
        i++
      ) {
        io.to(socket.id).emit("opponent move", match[opponentId].moves[i]);
      }
      if (match[playerId].solved && match[opponentId].solved) {
        io.to(match.room).emit("match over", match);
      }
    }
  }

  socket.on("disconnect", () => {
    console.log("disconnected");
    io.emit("playerCount", io.engine.clientsCount);
  });

  socket.on("queue", async (callback) => {
    const playerId = socket.handshake.auth.playerId;
    if (matchingPlayer) {
      const matchingId = matchingPlayer.handshake.auth.playerId;
      if (matchingId != playerId) {
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
      }
    } else {
      matchingPlayer = socket;
    }
    callback();
  });

  socket.on("move", (key, clientOffset, callback) => {
    const playerId = socket.handshake.auth.playerId;
    const match = matches.get(playerId);
    if (match[playerId].moves.length == clientOffset - 1) {
      match[playerId].moves.push(key);
      socket.to(match.room).emit("opponent move", key);
      callback();
    } else if (match[playerId].moves.length >= clientOffset) {
      callback();
    }
  });

  socket.on("solved", (time, moves, callback) => {
    const playerId = socket.handshake.auth.playerId;
    const match = matches.get(playerId);
    const room = match.room;
    match[playerId].time = time;
    match[playerId].moves = moves;
    match[playerId].solved = true;
    if (match[match.players[0]].solved && match[match.players[1]].solved) {
      io.to(room).emit("match over", match);
    }

    callback();
  });

  socket.on("leave match", (callback) => {
    const playerId = socket.handshake.auth.playerId;
    const match = matches.get(playerId);
    if (match) {
      const room = match.room;
      matches.set(playerId, null);
      socket.leave(room);
    }
    callback();
  });

  socket.on("update player count", (callback) => {
    io.emit("playerCount", io.engine.clientsCount);
    callback();
  });

  socket.on("cancel queue", (callback) => {
    if (
      (socket.auth.handshake.playerId = matchingPlayer.auth.handshake.playerId)
    ) {
      matchingPlayer = null;
    }
    callback();
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
