import * as THREE from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";

const SIZE = 8;
const GAP = 1.25;
const TPS = 1000;

const whiteMaterial = new THREE.MeshBasicMaterial({
  color: "white",
  side: THREE.DoubleSide,
});

const greenMaterial = new THREE.MeshBasicMaterial({
  color: "green",
  side: THREE.DoubleSide,
});

const redMaterial = new THREE.MeshBasicMaterial({
  color: "red",
  side: THREE.DoubleSide,
});

const blueMaterial = new THREE.MeshBasicMaterial({
  color: "blue",
  side: THREE.DoubleSide,
});

const orangeMaterial = new THREE.MeshBasicMaterial({
  color: "orange",
  side: THREE.DoubleSide,
});

const yellowMaterial = new THREE.MeshBasicMaterial({
  color: "yellow",
  side: THREE.DoubleSide,
});

const blackMaterial = new LineMaterial({
  color: "black",
  linewidth: 1,
});

const tileGeometry = new THREE.PlaneGeometry(SIZE - GAP, SIZE - GAP);
const outlineGeometry = new LineSegmentsGeometry().fromEdgesGeometry(
  new THREE.EdgesGeometry(tileGeometry),
);

const whiteMesh = new THREE.Mesh(tileGeometry, whiteMaterial);
const blackOutline = new LineSegments2(outlineGeometry, blackMaterial);

function createCube() {
  const cube = new THREE.Group();

  const u = whiteMesh.clone();
  const f = whiteMesh.clone();
  const r = whiteMesh.clone();
  const uOutline = blackOutline.clone();
  const fOutline = blackOutline.clone();
  const rOutline = blackOutline.clone();

  u.rotation.x = Math.PI * 0.5;
  uOutline.rotation.x = Math.PI * 0.5;

  r.rotation.y = Math.PI * 0.5;
  rOutline.rotation.y = Math.PI * 0.5;

  let uFace = [];
  let dFace = [];
  let fFace = [];
  let bFace = [];
  let rFace = [];
  let lFace = [];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const tile = u.clone();
      tile.position.y = SIZE * 1.5;
      tile.rotation.x = Math.PI * 0.5;
      tile.position.z = SIZE * (i - 1);
      tile.position.x = SIZE * (j - 1);

      const tileOutline = uOutline.clone();
      tileOutline.position.y = SIZE * 1.5;
      tileOutline.rotation.x = Math.PI * 0.5;
      tileOutline.position.z = SIZE * (i - 1);
      tileOutline.position.x = SIZE * (j - 1);

      cube.add(tile);
      cube.add(tileOutline);
      uFace.push(tile);
    }
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const tile = u.clone();
      tile.position.y = -SIZE * 1.5;
      tile.rotation.x = Math.PI * 0.5;
      tile.position.z = SIZE * (1 - i);
      tile.position.x = SIZE * (j - 1);

      const tileOutline = uOutline.clone();
      tileOutline.position.y = -SIZE * 1.5;
      tileOutline.rotation.x = Math.PI * 0.5;
      tileOutline.position.z = SIZE * (1 - i);
      tileOutline.position.x = SIZE * (j - 1);

      cube.add(tile);
      cube.add(tileOutline);
      dFace.push(tile);
    }
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const tile = f.clone();
      tile.position.z = SIZE * 1.5;
      tile.position.y = SIZE * (1 - i);
      tile.position.x = SIZE * (j - 1);

      const tileOutline = fOutline.clone();
      tileOutline.position.z = SIZE * 1.5;
      tileOutline.position.y = SIZE * (1 - i);
      tileOutline.position.x = SIZE * (j - 1);

      cube.add(tile);
      cube.add(tileOutline);
      fFace.push(tile);
    }
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const tile = f.clone();
      tile.position.z = -SIZE * 1.5;
      tile.position.y = SIZE * (1 - i);
      tile.position.x = SIZE * (1 - j);

      const tileOutline = fOutline.clone();
      tileOutline.position.z = -SIZE * 1.5;
      tileOutline.position.y = SIZE * (1 - i);
      tileOutline.position.x = SIZE * (1 - j);

      cube.add(tile);
      cube.add(tileOutline);
      bFace.push(tile);
    }
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const tile = r.clone();
      tile.position.x = SIZE * 1.5;
      tile.position.z = SIZE * (1 - j);
      tile.position.y = SIZE * (1 - i);

      const tileOutline = rOutline.clone();
      tileOutline.position.x = SIZE * 1.5;
      tileOutline.position.z = SIZE * (1 - j);
      tileOutline.position.y = SIZE * (1 - i);

      cube.add(tile);
      cube.add(tileOutline);
      rFace.push(tile);
    }
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const tile = r.clone();
      tile.position.x = -SIZE * 1.5;
      tile.position.z = SIZE * (j - 1);
      tile.position.y = SIZE * (1 - i);

      const tileOutline = rOutline.clone();
      tileOutline.position.x = -SIZE * 1.5;
      tileOutline.position.z = SIZE * (j - 1);
      tileOutline.position.y = SIZE * (1 - i);

      cube.add(tile);
      cube.add(tileOutline);
      lFace.push(tile);
    }
  }

  return [cube, uFace, fFace, rFace, dFace, bFace, lFace];
}

class Cube {
  constructor() {
    [
      this.cube,
      this.uFace,
      this.fFace,
      this.rFace,
      this.dFace,
      this.bFace,
      this.lFace,
    ] = createCube();

    this.faces = [
      this.uFace,
      this.fFace,
      this.rFace,
      this.dFace,
      this.bFace,
      this.lFace,
    ];

    this.resetCube();
  }

  resetCube() {
    for (const tile of this.uFace) {
      tile.material = whiteMaterial;
    }
    for (const tile of this.fFace) {
      tile.material = greenMaterial;
    }
    for (const tile of this.rFace) {
      tile.material = redMaterial;
    }
    for (const tile of this.dFace) {
      tile.material = yellowMaterial;
    }
    for (const tile of this.bFace) {
      tile.material = blueMaterial;
    }
    for (const tile of this.lFace) {
      tile.material = orangeMaterial;
    }
  }

  faceTurn(face) {
    [
      face[0].material,
      face[1].material,
      face[2].material,
      face[3].material,
      face[5].material,
      face[6].material,
      face[7].material,
      face[8].material,
    ] = [
      face[6].material,
      face[3].material,
      face[0].material,
      face[7].material,
      face[1].material,
      face[8].material,
      face[5].material,
      face[2].material,
    ];
  }

  rMove() {
    [
      this.uFace[2].material,
      this.uFace[5].material,
      this.uFace[8].material,
      this.bFace[6].material,
      this.bFace[3].material,
      this.bFace[0].material,
      this.dFace[2].material,
      this.dFace[5].material,
      this.dFace[8].material,
      this.fFace[2].material,
      this.fFace[5].material,
      this.fFace[8].material,
    ] = [
      this.fFace[2].material,
      this.fFace[5].material,
      this.fFace[8].material,
      this.uFace[2].material,
      this.uFace[5].material,
      this.uFace[8].material,
      this.bFace[6].material,
      this.bFace[3].material,
      this.bFace[0].material,
      this.dFace[2].material,
      this.dFace[5].material,
      this.dFace[8].material,
    ];

    this.faceTurn(this.rFace);
  }

  lMove() {
    [
      this.uFace[0].material,
      this.uFace[3].material,
      this.uFace[6].material,
      this.fFace[0].material,
      this.fFace[3].material,
      this.fFace[6].material,
      this.dFace[0].material,
      this.dFace[3].material,
      this.dFace[6].material,
      this.bFace[8].material,
      this.bFace[5].material,
      this.bFace[2].material,
    ] = [
      this.bFace[8].material,
      this.bFace[5].material,
      this.bFace[2].material,
      this.uFace[0].material,
      this.uFace[3].material,
      this.uFace[6].material,
      this.fFace[0].material,
      this.fFace[3].material,
      this.fFace[6].material,
      this.dFace[0].material,
      this.dFace[3].material,
      this.dFace[6].material,
    ];

    this.faceTurn(this.lFace);
  }

  uMove() {
    [
      this.fFace[0].material,
      this.fFace[1].material,
      this.fFace[2].material,
      this.lFace[0].material,
      this.lFace[1].material,
      this.lFace[2].material,
      this.bFace[0].material,
      this.bFace[1].material,
      this.bFace[2].material,
      this.rFace[0].material,
      this.rFace[1].material,
      this.rFace[2].material,
    ] = [
      this.rFace[0].material,
      this.rFace[1].material,
      this.rFace[2].material,
      this.fFace[0].material,
      this.fFace[1].material,
      this.fFace[2].material,
      this.lFace[0].material,
      this.lFace[1].material,
      this.lFace[2].material,
      this.bFace[0].material,
      this.bFace[1].material,
      this.bFace[2].material,
    ];

    this.faceTurn(this.uFace);
  }

  dMove() {
    [
      this.fFace[6].material,
      this.fFace[7].material,
      this.fFace[8].material,
      this.lFace[6].material,
      this.lFace[7].material,
      this.lFace[8].material,
      this.bFace[6].material,
      this.bFace[7].material,
      this.bFace[8].material,
      this.rFace[6].material,
      this.rFace[7].material,
      this.rFace[8].material,
    ] = [
      this.lFace[6].material,
      this.lFace[7].material,
      this.lFace[8].material,
      this.bFace[6].material,
      this.bFace[7].material,
      this.bFace[8].material,
      this.rFace[6].material,
      this.rFace[7].material,
      this.rFace[8].material,
      this.fFace[6].material,
      this.fFace[7].material,
      this.fFace[8].material,
    ];

    this.faceTurn(this.dFace);
  }

  fMove() {
    [
      this.uFace[6].material,
      this.uFace[7].material,
      this.uFace[8].material,
      this.rFace[0].material,
      this.rFace[3].material,
      this.rFace[6].material,
      this.dFace[2].material,
      this.dFace[1].material,
      this.dFace[0].material,
      this.lFace[8].material,
      this.lFace[5].material,
      this.lFace[2].material,
    ] = [
      this.lFace[8].material,
      this.lFace[5].material,
      this.lFace[2].material,
      this.uFace[6].material,
      this.uFace[7].material,
      this.uFace[8].material,
      this.rFace[0].material,
      this.rFace[3].material,
      this.rFace[6].material,
      this.dFace[2].material,
      this.dFace[1].material,
      this.dFace[0].material,
    ];

    this.faceTurn(this.fFace);
  }

  bMove() {
    [
      this.uFace[0].material,
      this.uFace[1].material,
      this.uFace[2].material,
      this.lFace[6].material,
      this.lFace[3].material,
      this.lFace[0].material,
      this.dFace[8].material,
      this.dFace[7].material,
      this.dFace[6].material,
      this.rFace[2].material,
      this.rFace[5].material,
      this.rFace[8].material,
    ] = [
      this.rFace[2].material,
      this.rFace[5].material,
      this.rFace[8].material,
      this.uFace[0].material,
      this.uFace[1].material,
      this.uFace[2].material,
      this.lFace[6].material,
      this.lFace[3].material,
      this.lFace[0].material,
      this.dFace[8].material,
      this.dFace[7].material,
      this.dFace[6].material,
    ];

    this.faceTurn(this.bFace);
  }

  yMove() {
    [
      this.fFace[0].material,
      this.fFace[1].material,
      this.fFace[2].material,
      this.fFace[3].material,
      this.fFace[4].material,
      this.fFace[5].material,
      this.fFace[6].material,
      this.fFace[7].material,
      this.fFace[8].material,
      this.lFace[0].material,
      this.lFace[1].material,
      this.lFace[2].material,
      this.lFace[3].material,
      this.lFace[4].material,
      this.lFace[5].material,
      this.lFace[6].material,
      this.lFace[7].material,
      this.lFace[8].material,
      this.bFace[0].material,
      this.bFace[1].material,
      this.bFace[2].material,
      this.bFace[3].material,
      this.bFace[4].material,
      this.bFace[5].material,
      this.bFace[6].material,
      this.bFace[7].material,
      this.bFace[8].material,
      this.rFace[0].material,
      this.rFace[1].material,
      this.rFace[2].material,
      this.rFace[3].material,
      this.rFace[4].material,
      this.rFace[5].material,
      this.rFace[6].material,
      this.rFace[7].material,
      this.rFace[8].material,
    ] = [
      this.rFace[0].material,
      this.rFace[1].material,
      this.rFace[2].material,
      this.rFace[3].material,
      this.rFace[4].material,
      this.rFace[5].material,
      this.rFace[6].material,
      this.rFace[7].material,
      this.rFace[8].material,
      this.fFace[0].material,
      this.fFace[1].material,
      this.fFace[2].material,
      this.fFace[3].material,
      this.fFace[4].material,
      this.fFace[5].material,
      this.fFace[6].material,
      this.fFace[7].material,
      this.fFace[8].material,
      this.lFace[0].material,
      this.lFace[1].material,
      this.lFace[2].material,
      this.lFace[3].material,
      this.lFace[4].material,
      this.lFace[5].material,
      this.lFace[6].material,
      this.lFace[7].material,
      this.lFace[8].material,
      this.bFace[0].material,
      this.bFace[1].material,
      this.bFace[2].material,
      this.bFace[3].material,
      this.bFace[4].material,
      this.bFace[5].material,
      this.bFace[6].material,
      this.bFace[7].material,
      this.bFace[8].material,
    ];
    this.faceTurn(this.uFace);
    this.faceTurn(this.dFace);
    this.faceTurn(this.dFace);
    this.faceTurn(this.dFace);
  }

  zMove() {
    [
      this.uFace[0].material,
      this.uFace[1].material,
      this.uFace[2].material,
      this.uFace[3].material,
      this.uFace[4].material,
      this.uFace[5].material,
      this.uFace[6].material,
      this.uFace[7].material,
      this.uFace[8].material,
      this.rFace[2].material,
      this.rFace[5].material,
      this.rFace[8].material,
      this.rFace[1].material,
      this.rFace[4].material,
      this.rFace[7].material,
      this.rFace[0].material,
      this.rFace[3].material,
      this.rFace[6].material,
      this.dFace[8].material,
      this.dFace[7].material,
      this.dFace[6].material,
      this.dFace[5].material,
      this.dFace[4].material,
      this.dFace[3].material,
      this.dFace[2].material,
      this.dFace[1].material,
      this.dFace[0].material,
      this.lFace[6].material,
      this.lFace[3].material,
      this.lFace[0].material,
      this.lFace[7].material,
      this.lFace[4].material,
      this.lFace[1].material,
      this.lFace[8].material,
      this.lFace[5].material,
      this.lFace[2].material,
    ] = [
      this.lFace[6].material,
      this.lFace[3].material,
      this.lFace[0].material,
      this.lFace[7].material,
      this.lFace[4].material,
      this.lFace[1].material,
      this.lFace[8].material,
      this.lFace[5].material,
      this.lFace[2].material,
      this.uFace[0].material,
      this.uFace[1].material,
      this.uFace[2].material,
      this.uFace[3].material,
      this.uFace[4].material,
      this.uFace[5].material,
      this.uFace[6].material,
      this.uFace[7].material,
      this.uFace[8].material,
      this.rFace[2].material,
      this.rFace[5].material,
      this.rFace[8].material,
      this.rFace[1].material,
      this.rFace[4].material,
      this.rFace[7].material,
      this.rFace[0].material,
      this.rFace[3].material,
      this.rFace[6].material,
      this.dFace[8].material,
      this.dFace[7].material,
      this.dFace[6].material,
      this.dFace[5].material,
      this.dFace[4].material,
      this.dFace[3].material,
      this.dFace[2].material,
      this.dFace[1].material,
      this.dFace[0].material,
    ];

    this.faceTurn(this.fFace);
    this.faceTurn(this.bFace);
    this.faceTurn(this.bFace);
    this.faceTurn(this.bFace);
  }

  xMove() {
    [
      this.uFace[0].material,
      this.uFace[1].material,
      this.uFace[2].material,
      this.uFace[3].material,
      this.uFace[4].material,
      this.uFace[5].material,
      this.uFace[6].material,
      this.uFace[7].material,
      this.uFace[8].material,
      this.bFace[8].material,
      this.bFace[7].material,
      this.bFace[6].material,
      this.bFace[5].material,
      this.bFace[4].material,
      this.bFace[3].material,
      this.bFace[2].material,
      this.bFace[1].material,
      this.bFace[0].material,
      this.dFace[0].material,
      this.dFace[1].material,
      this.dFace[2].material,
      this.dFace[3].material,
      this.dFace[4].material,
      this.dFace[5].material,
      this.dFace[6].material,
      this.dFace[7].material,
      this.dFace[8].material,
      this.fFace[0].material,
      this.fFace[1].material,
      this.fFace[2].material,
      this.fFace[3].material,
      this.fFace[4].material,
      this.fFace[5].material,
      this.fFace[6].material,
      this.fFace[7].material,
      this.fFace[8].material,
    ] = [
      this.fFace[0].material,
      this.fFace[1].material,
      this.fFace[2].material,
      this.fFace[3].material,
      this.fFace[4].material,
      this.fFace[5].material,
      this.fFace[6].material,
      this.fFace[7].material,
      this.fFace[8].material,
      this.uFace[0].material,
      this.uFace[1].material,
      this.uFace[2].material,
      this.uFace[3].material,
      this.uFace[4].material,
      this.uFace[5].material,
      this.uFace[6].material,
      this.uFace[7].material,
      this.uFace[8].material,
      this.bFace[8].material,
      this.bFace[7].material,
      this.bFace[6].material,
      this.bFace[5].material,
      this.bFace[4].material,
      this.bFace[3].material,
      this.bFace[2].material,
      this.bFace[1].material,
      this.bFace[0].material,
      this.dFace[0].material,
      this.dFace[1].material,
      this.dFace[2].material,
      this.dFace[3].material,
      this.dFace[4].material,
      this.dFace[5].material,
      this.dFace[6].material,
      this.dFace[7].material,
      this.dFace[8].material,
    ];

    this.faceTurn(this.rFace);
    this.faceTurn(this.lFace);
    this.faceTurn(this.lFace);
    this.faceTurn(this.lFace);
  }

  mMove() {
    [
      this.uFace[1].material,
      this.uFace[4].material,
      this.uFace[7].material,
      this.fFace[1].material,
      this.fFace[4].material,
      this.fFace[7].material,
      this.dFace[1].material,
      this.dFace[4].material,
      this.dFace[7].material,
      this.bFace[7].material,
      this.bFace[4].material,
      this.bFace[1].material,
    ] = [
      this.bFace[7].material,
      this.bFace[4].material,
      this.bFace[1].material,
      this.uFace[1].material,
      this.uFace[4].material,
      this.uFace[7].material,
      this.fFace[1].material,
      this.fFace[4].material,
      this.fFace[7].material,
      this.dFace[1].material,
      this.dFace[4].material,
      this.dFace[7].material,
    ];
  }

  sMove() {
    [
      this.uFace[3].material,
      this.uFace[4].material,
      this.uFace[5].material,
      this.rFace[2].material,
      this.rFace[5].material,
      this.rFace[8].material,
      this.dFace[5].material,
      this.dFace[4].material,
      this.dFace[3].material,
      this.lFace[8].material,
      this.lFace[5].material,
      this.lFace[2].material,
    ] = [
      this.lFace[8].material,
      this.lFace[5].material,
      this.lFace[2].material,
      this.uFace[3].material,
      this.uFace[4].material,
      this.uFace[5].material,
      this.rFace[2].material,
      this.rFace[5].material,
      this.rFace[8].material,
      this.dFace[5].material,
      this.dFace[4].material,
      this.dFace[3].material,
    ];
  }

  eMove() {
    [
      this.fFace[3].material,
      this.fFace[4].material,
      this.fFace[5].material,
      this.rFace[3].material,
      this.rFace[4].material,
      this.rFace[5].material,
      this.bFace[3].material,
      this.bFace[4].material,
      this.bFace[5].material,
      this.lFace[3].material,
      this.lFace[4].material,
      this.lFace[5].material,
    ] = [
      this.lFace[3].material,
      this.lFace[4].material,
      this.lFace[5].material,
      this.fFace[3].material,
      this.fFace[4].material,
      this.fFace[5].material,
      this.rFace[3].material,
      this.rFace[4].material,
      this.rFace[5].material,
      this.bFace[3].material,
      this.bFace[4].material,
      this.bFace[5].material,
    ];
  }

  rPrimeMove() {
    this.rMove();
    this.rMove();
    this.rMove();
  }

  lPrimeMove() {
    this.lMove();
    this.lMove();
    this.lMove();
  }

  uPrimeMove() {
    this.uMove();
    this.uMove();
    this.uMove();
  }

  dPrimeMove() {
    this.dMove();
    this.dMove();
    this.dMove();
  }

  fPrimeMove() {
    this.fMove();
    this.fMove();
    this.fMove();
  }

  bPrimeMove() {
    this.bMove();
    this.bMove();
    this.bMove();
  }

  xPrimeMove() {
    this.xMove();
    this.xMove();
    this.xMove();
  }

  yPrimeMove() {
    this.yMove();
    this.yMove();
    this.yMove();
  }

  zPrimeMove() {
    this.zMove();
    this.zMove();
    this.zMove();
  }

  mPrimeMove() {
    this.mMove();
    this.mMove();
    this.mMove();
  }

  sPrimeMove() {
    this.sMove();
    this.sMove();
    this.sMove();
  }

  ePrimeMove() {
    this.eMove();
    this.eMove();
    this.eMove();
  }

  rWideMove() {
    this.lMove();
    this.xMove();
  }

  lWideMove() {
    this.rMove();
    this.xPrimeMove();
  }

  uWideMove() {
    this.dMove();
    this.yMove();
  }

  dWideMove() {
    this.uMove();
    this.yPrimeMove();
  }

  rWidePrimeMove() {
    this.rWideMove();
    this.rWideMove();
    this.rWideMove();
  }

  lWidePrimeMove() {
    this.lWideMove();
    this.lWideMove();
    this.lWideMove();
  }

  uWidePrimeMove() {
    this.uWideMove();
    this.uWideMove();
    this.uWideMove();
  }

  dWidePrimeMove() {
    this.dWideMove();
    this.dWideMove();
    this.dWideMove();
  }

  isSolved() {
    for (const face of this.faces) {
      for (let i = 0; i < 9; i++) {
        if (face[i].material != face[0].material) {
          return false;
        }
      }
    }

    return true;
  }

  scrambleCube(scramble) {
    this.resetCube();
    for (const move of scramble) {
      switch (move) {
        case "r":
          this.rMove();
          break;
        case "r'":
          this.rPrimeMove();
          break;
        case "r2":
          this.rMove();
          this.rMove();
          break;
        case "l":
          this.lMove();
          break;
        case "l'":
          this.lPrimeMove();
          break;
        case "l2":
          this.lMove();
          this.lMove();
          break;
        case "u":
          this.uMove();
          break;
        case "u'":
          this.uPrimeMove();
          break;
        case "u2":
          this.uMove();
          this.uMove();
          break;
        case "d":
          this.dMove();
          break;
        case "d'":
          this.dPrimeMove();
          break;
        case "d2":
          this.dMove();
          this.dMove();
          break;
        case "f":
          this.fMove();
          break;
        case "f'":
          this.fPrimeMove();
          break;
        case "f2":
          this.fMove();
          this.fMove();
          break;
        case "b":
          this.bMove();
          break;
        case "b'":
          this.bPrimeMove();
          break;
        case "b2":
          this.bMove();
          this.bMove();
          break;
        default:
          console.log(move);
          break;
      }
    }
  }
}

function animate(delta, currentAnimations, cameraGroup, cube, invertRotation) {
  const finishedAnimations = [];
  for (let i = 0; i < currentAnimations.length; i++) {
    const animation = currentAnimations[i];
    const rotation = Math.min(TPS * 90 * delta, animation.remainingRotation);

    if (animation.face == "r") {
      if (animation.direction == "cw") {
        animation.layer.rotation.x -= THREE.MathUtils.degToRad(rotation);
      } else {
        animation.layer.rotation.x += THREE.MathUtils.degToRad(rotation);
      }
    } else if (animation.face == "l") {
      if (animation.direction == "cw") {
        animation.layer.rotation.x += THREE.MathUtils.degToRad(rotation);
      } else {
        animation.layer.rotation.x -= THREE.MathUtils.degToRad(rotation);
      }
    } else if (animation.face == "u") {
      if (animation.direction == "cw") {
        animation.layer.rotation.y -= THREE.MathUtils.degToRad(rotation);
      } else {
        animation.layer.rotation.y += THREE.MathUtils.degToRad(rotation);
      }
    } else if (animation.face == "d") {
      if (animation.direction == "cw") {
        animation.layer.rotation.y += THREE.MathUtils.degToRad(rotation);
      } else {
        animation.layer.rotation.y -= THREE.MathUtils.degToRad(rotation);
      }
    } else if (animation.face == "f") {
      if (animation.direction == "cw") {
        animation.layer.rotation.z -= THREE.MathUtils.degToRad(rotation);
      } else {
        animation.layer.rotation.z += THREE.MathUtils.degToRad(rotation);
      }
    } else if (animation.face == "b") {
      if (animation.direction == "cw") {
        animation.layer.rotation.z += THREE.MathUtils.degToRad(rotation);
      } else {
        animation.layer.rotation.z -= THREE.MathUtils.degToRad(rotation);
      }
    } else if (animation.face == "m") {
      if (animation.direction == "cw") {
        animation.layer.rotation.x += THREE.MathUtils.degToRad(rotation);
      } else {
        animation.layer.rotation.x -= THREE.MathUtils.degToRad(rotation);
      }
    } else if (animation.face == "x") {
      if (animation.direction == "cw") {
        cameraGroup.rotation.x +=
          THREE.MathUtils.degToRad(rotation) * invertRotation;
      } else {
        cameraGroup.rotation.x -=
          THREE.MathUtils.degToRad(rotation) * invertRotation;
      }
    } else if (animation.face == "y") {
      if (animation.direction == "cw") {
        cameraGroup.rotation.y += THREE.MathUtils.degToRad(rotation);
      } else {
        cameraGroup.rotation.y -= THREE.MathUtils.degToRad(rotation);
      }
    } else if (animation.face == "z") {
      if (animation.direction == "cw") {
        cameraGroup.rotation.z +=
          THREE.MathUtils.degToRad(rotation) * invertRotation;
      } else {
        cameraGroup.rotation.z -=
          THREE.MathUtils.degToRad(rotation) * invertRotation;
      }
    }

    animation.remainingRotation -= rotation;

    if (animation.remainingRotation <= 0) {
      finishedAnimations.push(i);
      if (animation.layer.children.length > 0) {
        for (const child of [...animation.layer.children]) {
          cube.cube.add(child);
        }
      } else {
        cameraGroup.rotation.x = 0;
        cameraGroup.rotation.y = 0;
        cameraGroup.rotation.z = 0;
      }
      animation.moveFunc();
    }
  }

  const newAnimations = currentAnimations.filter(
    (animation, index) => !finishedAnimations.includes(index),
  );

  currentAnimations.length = 0;
  currentAnimations.push(...newAnimations);

  return finishedAnimations.length;
}

function processMove(key, cube, moveQueue) {
  if (key == "y" || key == "t") {
    moveQueue.push({
      face: "x",
      direction: "cw",
      remainingRotation: 90,
      moveFunc: cube.xMove.bind(cube),
      axis: "x",
    });
  } else if (key == "b" || key == "n") {
    moveQueue.push({
      face: "x",
      direction: "ccw",
      remainingRotation: 90,
      moveFunc: cube.xPrimeMove.bind(cube),
      axis: "x",
    });
  } else if (key == ";") {
    moveQueue.push({
      face: "y",
      direction: "cw",
      remainingRotation: 90,
      moveFunc: cube.yMove.bind(cube),
      axis: "y",
    });
  } else if (key == "a") {
    moveQueue.push({
      face: "y",
      direction: "ccw",
      remainingRotation: 90,
      moveFunc: cube.yPrimeMove.bind(cube),
      axis: "y",
    });
  } else if (key == "p") {
    moveQueue.push({
      face: "z",
      direction: "cw",
      remainingRotation: 90,
      moveFunc: cube.zMove.bind(cube),
      axis: "z",
    });
  } else if (key == "q") {
    moveQueue.push({
      face: "z",
      direction: "ccw",
      remainingRotation: 90,
      moveFunc: cube.zPrimeMove.bind(cube),
      axis: "z",
    });
  } else if (key == "i") {
    moveQueue.push({
      face: "r",
      direction: "cw",
      remainingRotation: 90,
      moveFunc: cube.rMove.bind(cube),
      axis: "x",
    });
  } else if (key == "k") {
    moveQueue.push({
      face: "r",
      direction: "ccw",
      remainingRotation: 90,
      moveFunc: cube.rPrimeMove.bind(cube),
      axis: "x",
    });
  } else if (key == "e") {
    moveQueue.push({
      face: "l",
      direction: "ccw",
      remainingRotation: 90,
      moveFunc: cube.lPrimeMove.bind(cube),
      axis: "x",
    });
  } else if (key == "d") {
    moveQueue.push({
      face: "l",
      direction: "cw",
      remainingRotation: 90,
      moveFunc: cube.lMove.bind(cube),
      axis: "x",
    });
  } else if (key == "j") {
    moveQueue.push({
      face: "u",
      direction: "cw",
      remainingRotation: 90,
      moveFunc: cube.uMove.bind(cube),
      axis: "y",
    });
  } else if (key == "f") {
    moveQueue.push({
      face: "u",
      direction: "ccw",
      remainingRotation: 90,
      moveFunc: cube.uPrimeMove.bind(cube),
      axis: "y",
    });
  } else if (key == "s") {
    moveQueue.push({
      face: "d",
      direction: "cw",
      remainingRotation: 90,
      moveFunc: cube.dMove.bind(cube),
      axis: "y",
    });
  } else if (key == "l") {
    moveQueue.push({
      face: "d",
      direction: "ccw",
      remainingRotation: 90,
      moveFunc: cube.dPrimeMove.bind(cube),
      axis: "y",
    });
  } else if (key == "h") {
    moveQueue.push({
      face: "f",
      direction: "cw",
      remainingRotation: 90,
      moveFunc: cube.fMove.bind(cube),
      axis: "z",
    });
  } else if (key == "g") {
    moveQueue.push({
      face: "f",
      direction: "ccw",
      remainingRotation: 90,
      moveFunc: cube.fPrimeMove.bind(cube),
      axis: "z",
    });
  } else if (key == "w") {
    moveQueue.push({
      face: "b",
      direction: "cw",
      remainingRotation: 90,
      moveFunc: cube.bMove.bind(cube),
      axis: "z",
    });
  } else if (key == "o") {
    moveQueue.push({
      face: "b",
      direction: "ccw",
      remainingRotation: 90,
      moveFunc: cube.bPrimeMove.bind(cube),
      axis: "z",
    });
  } else if (key == "5" || key == "6") {
    moveQueue.push({
      face: "m",
      direction: "cw",
      remainingRotation: 90,
      moveFunc: cube.mMove.bind(cube),
      axis: "x",
    });
  } else if (key == "x" || key == ".") {
    moveQueue.push({
      face: "m",
      direction: "ccw",
      remainingRotation: 90,
      moveFunc: cube.mPrimeMove.bind(cube),
      axis: "x",
    });
  }
}

function updateMoveQueue(moveQueue, animations, cube, scene) {
  while (moveQueue.length > 0) {
    let canAddMove = true;
    let moveCancel = false;

    for (const animation of animations) {
      if (
        animation.face == moveQueue[0].face &&
        animation.direction != moveQueue[0].direction
      ) {
        const newMove = moveQueue.shift();
        const newAnimation = {
          ...newMove,
          layer: animation.layer,
          remainingRotation: 90 - animation.remainingRotation,
          moveFunc: () => {
            animation.moveFunc();
            newMove.moveFunc();
          },
        };
        animations.splice(animations.indexOf(animation), 1);
        animations.push(newAnimation);
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
      for (const face of cube.faces) {
        for (const tile of face) {
          if (tile.position.x >= SIZE) {
            layer.add(tile);
          }
        }
      }
    } else if (nextMove.face == "l") {
      for (const face of cube.faces) {
        for (const tile of face) {
          if (tile.position.x <= -SIZE) {
            layer.add(tile);
          }
        }
      }
    } else if (nextMove.face == "u") {
      for (const face of cube.faces) {
        for (const tile of face) {
          if (tile.position.y >= SIZE) {
            layer.add(tile);
          }
        }
      }
    } else if (nextMove.face == "d") {
      for (const face of cube.faces) {
        for (const tile of face) {
          if (tile.position.y <= -SIZE) {
            layer.add(tile);
          }
        }
      }
    } else if (nextMove.face == "f") {
      for (const face of cube.faces) {
        for (const tile of face) {
          if (tile.position.z >= SIZE) {
            layer.add(tile);
          }
        }
      }
    } else if (nextMove.face == "b") {
      for (const face of cube.faces) {
        for (const tile of face) {
          if (tile.position.z <= -SIZE) {
            layer.add(tile);
          }
        }
      }
    } else if (nextMove.face == "m") {
      for (const face of cube.faces) {
        for (const tile of face) {
          if (tile.position.x == 0) {
            layer.add(tile);
          }
        }
      }
    }

    scene.add(layer);
    animations.push({ ...nextMove, layer: layer });
  }
}

export { Cube, animate, SIZE, processMove, updateMoveQueue };
