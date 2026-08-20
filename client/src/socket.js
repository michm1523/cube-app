import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";

const socket = io({
  autoConnect: false,
  auth: {
    serverOffset: -1,
    playerId: crypto.randomUUID(),
  },
});

export { socket };
