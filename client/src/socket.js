import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";

export const socket = io({
  autoConnect: false,
});
