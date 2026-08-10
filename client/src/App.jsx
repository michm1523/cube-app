import "./css/App.css";
import { useState, useEffect } from "react";
import { socket } from "./socket";
import Lobby from "./components/Lobby";
import Match from "./components/Match";
import MatchOverview from "./components/MatchOverview";

function App() {
  const [gameState, setGameState] = useState({ type: "lobby" });

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  if (gameState.type === "lobby") {
    return (
      <Lobby
        startMatch={(scramble) => {
          setGameState({ type: "match", scramble });
        }}
      ></Lobby>
    );
  } else if (gameState.type === "match") {
    return (
      <Match
        scramble={gameState.scramble}
        onMatchOver={(
          playerTime,
          opponentTime,
          playerMoveCount,
          opponentMoveCount,
        ) => {
          setGameState({
            type: "match overview",
            playerTime,
            opponentTime,
            playerMoveCount,
            opponentMoveCount,
          });
        }}
      ></Match>
    );
  } else if (gameState.type === "match overview") {
    return (
      <MatchOverview
        back={() => setGameState({ type: "lobby" })}
        playerTime={gameState.playerTime}
        opponentTime={gameState.opponentTime}
        playerMoveCount={gameState.playerMoveCount}
        opponentMoveCount={gameState.opponentMoveCount}
      />
    );
  }
}

export default App;
