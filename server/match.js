export default class Match {
  constructor(id1, id2, room) {
    this.room = room;
    this[id1] = [];
    this[id2] = [];
    this.players = [id1, id2];
    this.playersFinished = 0;
  }
}
