import "./css/App.css";
import { useState, useEffect } from "react";
import { socket } from "./socket";
import Lobby from "./components/Lobby";
import Match from "./components/Match";

function App() {
  const [gameState, setGameState] = useState("lobby");

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  if (gameState === "lobby") {
    return <Lobby startMatch={() => setGameState("match")}></Lobby>;
  } else if (gameState === "match") {
    return <Match></Match>;
  }
}

export default App;
