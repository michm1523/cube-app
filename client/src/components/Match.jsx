import "../css/Match.css";
import { useEffect, useRef } from "react";
import { Cube, animate, processMove, updateMoveQueue } from "../cube";
import { socket } from "../socket";
import * as THREE from "three";

function Match({ scramble, onMatchOver }) {
  const playerCanvasRef = useRef(null);
  const opponentCanvasRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const playerCube = new Cube();
    const opponentCube = new Cube();
    playerCube.scrambleCube(scramble);
    opponentCube.scrambleCube(scramble);

    const playerScene = new THREE.Scene();
    const playerCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const opponentScene = new THREE.Scene();
    const opponentCamera = new THREE.PerspectiveCamera(75, 5, 0.1, 1000);

    const playerCameraGroup = new THREE.Group();
    const opponentCameraGroup = new THREE.Group();

    playerCamera.position.z = 32;
    playerCamera.position.y = 30;
    opponentCamera.position.z = -24;
    opponentCamera.position.y = 20;

    playerCamera.lookAt(0, 0, 0);
    opponentCamera.lookAt(0, 3, 0);

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

    playerRenderer.setSize(500, 500);
    opponentRenderer.setSize(500, 100);

    // playerRenderer.render(playerScene, playerCamera);
    // opponentRenderer.render(opponentScene, opponentCamera);

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

      animate(delta, playerAnimations, playerCameraGroup, playerCube, 1);
      animate(delta, opponentAnimations, opponentCameraGroup, opponentCube, -1);

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
      } else if (matchState == "solved") {
        timerRef.current.textContent = `${playerTime} - ${(
          clock.getElapsedTime() -
          startingTime -
          15
        ).toFixed(1)}`;
      }

      if (
        playerAnimations.length == 0 &&
        playerCube.isSolved() &&
        matchState == "solving"
      ) {
        playerMoveQueue = [];
        console.log(matchState);
        playerTime = (clock.getElapsedTime() - startingTime - 15).toFixed(2);
        matchState = "solved";
        socket.emit("solved", playerTime);
        console.log(matchState);
      }

      window.requestAnimationFrame(renderLoop);
    }

    renderLoop();

    function handleKeyPress(e) {
      if (matchState == "solving") {
        processMove(e.key, playerCube, playerMoveQueue);
        socket.emit("move", e.key);
      } else if (
        matchState == "inspecting" &&
        !"ikedjfslhgwo56x.".includes(e.key)
      ) {
        processMove(e.key, playerCube, playerMoveQueue);
        socket.emit("move", e.key);
      }
    }

    document.addEventListener("keydown", handleKeyPress);

    socket.on("opponent move", onOpponentMove);

    socket.on("opponent done", onOpponentDone);

    socket.on("match over", recieveMatchOver);

    function recieveMatchOver() {
      onMatchOver(playerTime, opponentTime);
      socket.emit("leave match");
    }

    function onOpponentMove(key) {
      processMove(key, opponentCube, opponentMoveQueue);
    }

    function onOpponentDone(time) {
      opponentTime = time;
      if (matchState == "solved") {
        socket.emit("match over");
      }
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      socket.off("opponent move", onOpponentMove);
      socket.off("opponent done", onOpponentDone);
      socket.off("match over", recieveMatchOver);
      rendering = false;
    };
  });

  return (
    <>
      <h1>Hi you're in a match</h1>
      <div className="match-container">
        <canvas id="opponent-canvas" ref={opponentCanvasRef}></canvas>
        <canvas id="player-canvas" ref={playerCanvasRef}></canvas>
      </div>
      <div>
        <p class="match-timer" ref={timerRef}>
          11
        </p>
      </div>
    </>
  );
}

export default Match;
