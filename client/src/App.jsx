import "./css/App.css";
import { useState, useEffect } from "react";
import { socket } from "./socket";
import Lobby from "./components/Lobby";
import Match from "./components/Match";
import MatchOverview from "./components/MatchOverview";

function App() {
  const [gameState, setGameState] = useState({ type: "lobby" });

  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    socket.on("assign id", (id) => {
      socket.auth.playerId = id;
    });

    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.connect();

    return () => {
      socket.disconnect();
      socket.off("assign id", (id) => {
        socket.auth.playerId = id;
      });
    };
  }, []);

  if (gameState.type === "lobby") {
    return (
      <div className="multiplayer">
        <Lobby
          startMatch={(scramble) => {
            setGameState({ type: "match", scramble });
          }}
        ></Lobby>
        {!socketConnected ? (
          <p className="connection-status">Not connected</p>
        ) : null}
      </div>
    );
  } else if (gameState.type === "match") {
    return (
      <div className="multiplayer">
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
        {!socketConnected ? (
          <p className="connection-status">Not connected</p>
        ) : null}
      </div>
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
