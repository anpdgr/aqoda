class Room {
  constructor(roomNumber, floor, keycardNumber, guest) {
    this.roomNumber = roomNumber;
    this.floor = floor;
    this.keycardNumber = keycardNumber;
    this.guest = guest;
  }
}

class Guest {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

module.exports = { Room, Guest };
