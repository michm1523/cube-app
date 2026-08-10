import "../css/Lobby.css";
import { useState, useEffect } from "react";
import { socket } from "../socket";

function Lobby({ startMatch }) {
  const [playerCount, setPlayerCount] = useState(0);
  const [queueState, setQueueState] = useState("idle");

  useEffect(() => {
    // async function getPlayerCount() {
    //   try {
    //     const response = await fetch(
    //       `${window.location.origin}/api/player-count`,
    //     );
    //     const { count } = await response.json();
    //     setPlayerCount(count);
    //     console.log(count);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }

    // getPlayerCount();

    function onPlayerCount(playerCount) {
      setPlayerCount(playerCount);
    }

    function onMatchFound(scramble) {
      console.log("match found");
      startMatch(scramble);
    }

    socket.on("playerCount", onPlayerCount);

    socket.on("match found", onMatchFound);

    socket.emit("update player count");

    return () => {
      socket.off("playerCount", onPlayerCount);

      socket.off("match found", onMatchFound);
    };
  }, []);

  return (
    <>
      <div className="lobby-container">
        <h1 className="lobby-title">Virtual Cube Race</h1>
        {queueState === "idle" ? (
          <button
            onClick={() => {
              setQueueState("queueing");
              socket.emit("queue");
            }}
            className="lobby-btn"
          >
            Play
          </button>
        ) : (
          <button
            onClick={() => {
              setQueueState("idle");
              socket.emit("cancel queue");
            }}
            className="lobby-btn"
          >
            Cancel queue
          </button>
        )}
        <p>{playerCount} online</p>
      </div>
    </>
  );
}

export default Lobby;
