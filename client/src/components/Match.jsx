import "../css/Match.css";
import { useEffect, useRef } from "react";
import { Cube, animate, SIZE } from "../cube";
import { socket } from "../socket";
import * as THREE from "three";

function Match() {
  const playerCanvasRef = useRef(null);
  const opponentCanvasRef = useRef(null);
  useEffect(() => {
    const playerCube = new Cube();
    const opponentCube = new Cube();

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

    let previousTime = 0;
    const clock = new THREE.Clock();

    let playerAnimations = [];
    let opponentAnimations = [];
    let moveQueue = [];

    function renderLoop() {
      const currentTime = clock.getElapsedTime();
      const delta = currentTime - previousTime;
      previousTime = currentTime;

      while (moveQueue.length > 0) {
        let canAddMove = true;
        let moveCancel = false;

        for (const animation of playerAnimations) {
          if (
            animation.face == moveQueue[0].face &&
            animation.direction != moveQueue[0].direction
          ) {
            const newMove = moveQueue.shift();
            const newAnimation = {
              ...newMove,
              layer: animation.layer,
              remainingRotation: 90 - animation.remainingRotation,
              moveFunc: () => {},
            };
            playerAnimations.splice(playerAnimations.indexOf(animation), 1);
            playerAnimations.push(newAnimation);
            moveCancel = true;
            break;
          } else if (
            animation.axis != moveQueue[0].axis ||
            animation.face == moveQueue[0].face
          ) {
            canAddMove = false;
            break;
          }
        }

        if (moveCancel) {
          continue;
        }

        if (!canAddMove) {
          break;
        }

        const nextMove = moveQueue.shift();
        const layer = new THREE.Group();
        if (nextMove.face == "r") {
          for (const face of playerCube.faces) {
            for (const tile of face) {
              if (tile.position.x >= SIZE) {
                layer.add(tile);
              }
            }
          }
        } else if (nextMove.face == "l") {
          for (const face of playerCube.faces) {
            for (const tile of face) {
              if (tile.position.x <= -SIZE) {
                layer.add(tile);
              }
            }
          }
        } else if (nextMove.face == "u") {
          for (const face of playerCube.faces) {
            for (const tile of face) {
              if (tile.position.y >= SIZE) {
                layer.add(tile);
              }
            }
          }
        } else if (nextMove.face == "d") {
          for (const face of playerCube.faces) {
            for (const tile of face) {
              if (tile.position.y <= -SIZE) {
                layer.add(tile);
              }
            }
          }
        } else if (nextMove.face == "f") {
          for (const face of playerCube.faces) {
            for (const tile of face) {
              if (tile.position.z >= SIZE) {
                layer.add(tile);
              }
            }
          }
        } else if (nextMove.face == "b") {
          for (const face of playerCube.faces) {
            for (const tile of face) {
              if (tile.position.z <= -SIZE) {
                layer.add(tile);
              }
            }
          }
        } else if (nextMove.face == "m") {
          for (const face of playerCube.faces) {
            for (const tile of face) {
              if (tile.position.x == 0) {
                layer.add(tile);
              }
            }
          }
        }

        playerScene.add(layer);
        playerAnimations.push({ ...nextMove, layer: layer });
      }

      // socket.emit("player animations", playerAnimations);
      animate(delta, playerAnimations, playerCameraGroup, playerCube);
      animate(delta, opponentAnimations, opponentCameraGroup, opponentCube);

      playerRenderer.render(playerScene, playerCamera);
      opponentRenderer.render(opponentScene, opponentCamera);

      window.requestAnimationFrame(renderLoop);
    }

    renderLoop();

    let matchState = "solving";

    document.addEventListener("keydown", (e) => {
      // if (state == "idle") {
      //   if (e.key == " ") {
      //     state = "inspecting";
      //     canvasLabel.classList.add("hidden");
      //     inspectionStart = clock.getElapsedTime();
      //     if (timedInspection) timerLabel.classList.remove("hidden");
      //     else if (!timerLabel.classList.contains("hidden"))
      //       timerLabel.classList.add("hidden");
      //     scrambleCube();
      //   }
      // }

      // if (state == "inspecting" && "ikedjfslhgwo56x.".includes(e.key)) {
      //   state = "solving";
      //   if (!timedInspection) {
      //     timerLabel.classList.remove("hidden");
      //   }
      //   solveStart = clock.getElapsedTime();
      //   // begin timer
      // }

      if (matchState == "inspecting" || matchState == "solving") {
        if (e.key == "y" || e.key == "t") {
          moveQueue.push({
            face: "x",
            direction: "cw",
            remainingRotation: 90,
            moveFunc: playerCube.xMove.bind(playerCube),
            axis: "x",
          });
        } else if (e.key == "b" || e.key == "n") {
          moveQueue.push({
            face: "x",
            direction: "ccw",
            remainingRotation: 90,
            moveFunc: playerCube.xPrimeMove.bind(playerCube),
            axis: "x",
          });
        } else if (e.key == ";") {
          moveQueue.push({
            face: "y",
            direction: "cw",
            remainingRotation: 90,
            moveFunc: playerCube.yMove.bind(playerCube),
            axis: "y",
          });
        } else if (e.key == "a") {
          moveQueue.push({
            face: "y",
            direction: "ccw",
            remainingRotation: 90,
            moveFunc: playerCube.yPrimeMove.bind(playerCube),
            axis: "y",
          });
        } else if (e.key == "p") {
          moveQueue.push({
            face: "z",
            direction: "cw",
            remainingRotation: 90,
            moveFunc: playerCube.zMove.bind(playerCube),
            axis: "z",
          });
        } else if (e.key == "q") {
          moveQueue.push({
            face: "z",
            direction: "ccw",
            remainingRotation: 90,
            moveFunc: playerCube.zPrimeMove.bind(playerCube),
            axis: "z",
          });
        }
      }

      if (matchState == "solving") {
        if (e.key == "i") {
          moveQueue.push({
            face: "r",
            direction: "cw",
            remainingRotation: 90,
            moveFunc: playerCube.rMove.bind(playerCube),
            axis: "x",
          });
        } else if (e.key == "k") {
          moveQueue.push({
            face: "r",
            direction: "ccw",
            remainingRotation: 90,
            moveFunc: playerCube.rPrimeMove.bind(playerCube),
            axis: "x",
          });
        } else if (e.key == "e") {
          moveQueue.push({
            face: "l",
            direction: "ccw",
            remainingRotation: 90,
            moveFunc: playerCube.lPrimeMove.bind(playerCube),
            axis: "x",
          });
        } else if (e.key == "d") {
          moveQueue.push({
            face: "l",
            direction: "cw",
            remainingRotation: 90,
            moveFunc: playerCube.lMove.bind(playerCube),
            axis: "x",
          });
        } else if (e.key == "j") {
          moveQueue.push({
            face: "u",
            direction: "cw",
            remainingRotation: 90,
            moveFunc: playerCube.uMove.bind(playerCube),
            axis: "y",
          });
        } else if (e.key == "f") {
          moveQueue.push({
            face: "u",
            direction: "ccw",
            remainingRotation: 90,
            moveFunc: playerCube.uPrimeMove.bind(playerCube),
            axis: "y",
          });
        } else if (e.key == "s") {
          moveQueue.push({
            face: "d",
            direction: "cw",
            remainingRotation: 90,
            moveFunc: playerCube.dMove.bind(playerCube),
            axis: "y",
          });
        } else if (e.key == "l") {
          moveQueue.push({
            face: "d",
            direction: "ccw",
            remainingRotation: 90,
            moveFunc: playerCube.dPrimeMove.bind(playerCube),
            axis: "y",
          });
        } else if (e.key == "h") {
          moveQueue.push({
            face: "f",
            direction: "cw",
            remainingRotation: 90,
            moveFunc: playerCube.fMove.bind(playerCube),
            axis: "z",
          });
        } else if (e.key == "g") {
          moveQueue.push({
            face: "f",
            direction: "ccw",
            remainingRotation: 90,
            moveFunc: playerCube.fPrimeMove.bind(playerCube),
            axis: "z",
          });
        } else if (e.key == "w") {
          moveQueue.push({
            face: "b",
            direction: "cw",
            remainingRotation: 90,
            moveFunc: playerCube.bMove.bind(playerCube),
            axis: "z",
          });
        } else if (e.key == "o") {
          moveQueue.push({
            face: "b",
            direction: "ccw",
            remainingRotation: 90,
            moveFunc: playerCube.bPrimeMove.bind(playerCube),
            axis: "z",
          });
        } else if (e.key == "5" || e.key == "6") {
          moveQueue.push({
            face: "m",
            direction: "cw",
            remainingRotation: 90,
            moveFunc: playerCube.mMove.bind(playerCube),
            axis: "x",
          });
        } else if (e.key == "x" || e.key == ".") {
          moveQueue.push({
            face: "m",
            direction: "ccw",
            remainingRotation: 90,
            moveFunc: playerCube.mPrimeMove.bind(playerCube),
            axis: "x",
          });
        }
      }

      // if (e.key == "Escape") {
      //   if (matchState == "solving") {
      //     penalty = "DNF";
      //     finishSolve();
      //     resetCube();
      //   } else if (matchState == "inspecting") {
      //     resetCube();
      //     timerLabel.classList.add("hidden");
      //     currentAnimations = [];
      //     moveQueue = [];
      //     state = "idle";
      //     penalty = "";
      //     canvasLabel.classList.remove("hidden");
      //   }
      // }
    });
  });

  return (
    <>
      <h1>Hi you're in a match</h1>
      <div className="match-container">
        <canvas id="opponent-canvas" ref={opponentCanvasRef}></canvas>
        <canvas id="player-canvas" ref={playerCanvasRef}></canvas>
      </div>
    </>
  );
}

export default Match;
