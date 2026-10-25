import "../css/Match.css";
import { useEffect, useRef } from "react";
import {
  playerCube,
  opponentCube,
  animate,
  processMove,
  updateMoveQueue,
} from "../cube";
import { socket } from "../socket";
import * as THREE from "three";

function Match({ scramble, onMatchOver }) {
  const playerCanvasRef = useRef(null);
  const opponentCanvasRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    socket.auth.serverOffset = -1;
    playerCube.resetCube();
    opponentCube.resetCube();
    playerCube.scrambleCube(scramble);
    opponentCube.scrambleCube(scramble);

    const playerScene = new THREE.Scene();
    const playerCamera = new THREE.PerspectiveCamera(65, 1, 0.1, 1000);
    const opponentScene = new THREE.Scene();
    const opponentCamera = new THREE.PerspectiveCamera(75, 4, 0.1, 1000);

    const playerCameraGroup = new THREE.Group();
    const opponentCameraGroup = new THREE.Group();

    playerCamera.position.z = 32;
    playerCamera.position.y = 30;
    opponentCamera.position.z = -25;
    opponentCamera.position.y = 17;

    playerCamera.lookAt(0, 0, 0);
    opponentCamera.lookAt(0, 0, 0);

    playerCameraGroup.add(playerCamera);
    opponentCameraGroup.add(opponentCamera);

    playerScene.add(playerCameraGroup);
    opponentScene.add(opponentCameraGroup);

    playerScene.add(playerCube.cube);
    opponentScene.add(opponentCube.cube);

    const playerRenderer = new THREE.WebGLRenderer({
      canvas: playerCanvasRef.current,
      antialias: true,
    });

    const opponentRenderer = new THREE.WebGLRenderer({
      canvas: opponentCanvasRef.current,
      antialias: true,
    });

    playerRenderer.setSize(
      (window.innerHeight / 780) * 500,
      (window.innerHeight / 780) * 500,
    );
    opponentRenderer.setSize(
      (window.innerHeight / 780) * 500,
      (window.innerHeight / 780) * 125,
    );

    // playerRenderer.render(playerScene, playerCamera);
    // opponentRenderer.render(opponentScene, opponentCamera);

    console.log(window.innerHeight);

    const clock = new THREE.Clock();
    let previousTime = clock.getElapsedTime();
    const startingTime = clock.getElapsedTime();

    let playerAnimations = [];
    let opponentAnimations = [];
    let playerMoveQueue = [];
    let opponentMoveQueue = [];

    let rendering = true;

    let matchState = "inspecting";
    let opponentTime = null;
    let playerTime = null;
    let playerMoveCount = 0;
    let clientOffset = 0;
    let opponentMoveCount = null;

    function renderLoop() {
      if (!rendering) {
        return;
      }
      const currentTime = clock.getElapsedTime();
      const delta = currentTime - previousTime;
      previousTime = currentTime;

      updateMoveQueue(
        playerMoveQueue,
        playerAnimations,
        playerCube,
        playerScene,
      );

      updateMoveQueue(
        opponentMoveQueue,
        opponentAnimations,
        opponentCube,
        opponentScene,
      );

      const playerMoves = animate(
        delta,
        playerAnimations,
        playerCameraGroup,
        playerCube,
      );

      if (!opponentCube.isSolved() && opponentAnimations.length > 0) {
        animate(delta, opponentAnimations, opponentCameraGroup, opponentCube);
      }

      if (matchState == "solving" || matchState == "solved") {
        playerMoveCount += playerMoves;
      }

      playerRenderer.render(playerScene, playerCamera);
      opponentRenderer.render(opponentScene, opponentCamera);

      if (
        clock.getElapsedTime() - startingTime >= 15 &&
        matchState == "inspecting"
      ) {
        matchState = "solving";
      }

      if (matchState == "inspecting") {
        const inspectionTime = clock.getElapsedTime() - startingTime;
        timerRef.current.textContent = Math.ceil(15 - inspectionTime);
      } else if (matchState == "solving") {
        timerRef.current.textContent = (
          clock.getElapsedTime() -
          startingTime -
          15
        ).toFixed(1);
      } else if (matchState == "solved" && !opponentTime) {
        timerRef.current.textContent = `${playerTime} - ${(
          clock.getElapsedTime() -
          startingTime -
          15
        ).toFixed(1)}`;
      } else if (matchState == "solved" && opponentTime) {
        timerRef.current.textContent = `${playerTime} - ${opponentTime}`;
      }

      if (
        playerAnimations.length == 0 &&
        playerCube.isSolved() &&
        matchState == "solving"
      ) {
        playerMoveQueue = [];
        playerTime = (clock.getElapsedTime() - startingTime - 15).toFixed(2);
        matchState = "solved";
        socket.emit("solved", playerTime, playerMoveCount);
      }

      window.requestAnimationFrame(renderLoop);
    }

    renderLoop();

    function handleKeyPress(e) {
      if (matchState == "solving") {
        processMove(e.key, playerCube, playerMoveQueue);
        socket.emit("move", e.key, ++clientOffset);
      } else if (
        matchState == "inspecting" &&
        !"ikedjfslhgwo56x.".includes(e.key)
      ) {
        processMove(e.key, playerCube, playerMoveQueue);
        socket.emit("move", e.key, ++clientOffset);
      }
    }

    function onResize() {
      playerRenderer.setSize(
        (window.innerHeight / 780) * 500,
        (window.innerHeight / 780) * 500,
      );
      opponentRenderer.setSize(
        (window.innerHeight / 780) * 500,
        (window.innerHeight / 780) * 125,
      );
    }

    document.addEventListener("keydown", handleKeyPress);

    window.addEventListener("resize", onResize);

    socket.on("opponent move", onOpponentMove);

    // socket.on("opponent done", onOpponentDone);

    socket.on("match over", recieveMatchOver);

    function recieveMatchOver(match) {
      playerTime = match[socket.auth.playerId].time;
      opponentTime =
        match[match.players.find((id) => id != socket.auth.playerId)].time;
      // playerMoveCount = match[socket.auth.playerId].moves.length;
      opponentMoveCount =
        match[match.players.find((id) => id != socket.auth.playerId)].moveCount;
      setTimeout(() => {
        onMatchOver(
          playerTime,
          opponentTime,
          playerMoveCount,
          opponentMoveCount,
        );
      }, 1000);

      socket.emit("leave match");
    }

    function onOpponentMove(key) {
      socket.auth.serverOffset++;
      processMove(key, opponentCube, opponentMoveQueue);
    }

    // function onOpponentDone(time) {
    //   opponentTime = time;
    // }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("resize", onResize);
      socket.off("opponent move", onOpponentMove);
      // socket.off("opponent done", onOpponentDone);
      socket.off("match over", recieveMatchOver);
      rendering = false;
    };
  }, []);

  return (
    <>
      <div className="match-container">
        <canvas id="opponent-canvas" ref={opponentCanvasRef}></canvas>
        <canvas id="player-canvas" ref={playerCanvasRef}></canvas>
        <div className="match-timer-container">
          <p class="match-timer" ref={timerRef}>
            11
          </p>
        </div>
      </div>
    </>
  );
}

export default Match;
