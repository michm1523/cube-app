class Player {
  constructor() {
    this.moves = [];
    this.time = null;
    this.solved = false;
    this.moveCount = 0;
  }
}

export default class Match {
  constructor(id1, id2, room) {
    this.room = room;
    this[id1] = new Player();
    this[id2] = new Player();
    this.players = [id1, id2];
  }
}
