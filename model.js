class Room {
  constructor(roomNumber, floor, keycardNumber, guest) {
    this.roomNumber = roomNumber;
    this.floor = floor;
    this.keycardNumber = keycardNumber;
    this.guest = guest;
  }

  book(guest, keycardNumber) {
    this.keycardNumber = keycardNumber;
    this.guest = guest;
  }

  get isAvailable() {
    return !this.guest && !this.keycardNumber;
  }

  checkout() {
    this.guest = null;
    this.keycardNumber = null;
  }
}

class Guest {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

module.exports = { Room, Guest };
