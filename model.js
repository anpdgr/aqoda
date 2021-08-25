class Room {
  constructor(roomNumber, floor, keycardNumber, guest, age) {
    this.roomNumber = roomNumber;
    this.floor = floor;
    this.keycardNumber = keycardNumber;
    this.guest = guest;
    this.age = age;
  }
}

module.exports = { Room };
