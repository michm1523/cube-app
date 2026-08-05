import "../css/Lobby.css";
import { useState, useEffect } from "react";
import { socket } from "../socket";

function Lobby({ startMatch }) {
  const [playerCount, setPlayerCount] = useState(0);
  const [queueState, setQueueState] = useState("idle");

  async function getPlayerCount() {
    try {
      const { count } = await fetch(
        `${window.location.origin}/api/player-count`,
      );
      setPlayerCount(count);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getPlayerCount();

    function onPlayerCount(playerCount) {
      setPlayerCount(playerCount);
    }

    function onMatchFound() {
      console.log("match found");
      startMatch();
    }

    socket.on("playerCount", onPlayerCount);

    socket.on("match found", onMatchFound);

    return () => {
      socket.off("playerCount", onPlayerCount);

      socket.off("match found", onMatchFound);
    };
  }, []);

  return (
    <>
      <h1>This is the lobby, players online is {playerCount}</h1>
      {queueState === "idle" ? (
        <button
          onClick={() => {
            setQueueState("queueing");
            socket.emit("queue");
          }}
        >
          Queue
        </button>
      ) : (
        <button
          onClick={() => {
            setQueueState("idle");
          }}
        >
          Cancel queue
        </button>
      )}
    </>
  );
}

export default Lobby;
