class player {
  constructor() {
    this.moves = [];
    this.time = null;
    this.solved = false;
  }
}

export default class Match {
  constructor(id1, id2, room) {
    this.room = room;
    this[id1] = new player();
    this[id2] = new player();
    this.players = [id1, id2];
  }
}
