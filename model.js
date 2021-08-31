class Room {
  constructor(roomNumber, floor, keycardNumber, guest) {
    this.roomNumber = roomNumber;
    this.floor = floor;
    this.keycardNumber = keycardNumber;
    this.guest = guest;
  }

  book(guest, keycardNumber) {
    return new Room(this.roomNumber, this.floor, keycardNumber, guest)
  }

  get isAvailable() {
    return !this.guest && !this.keycardNumber;
  }

  checkout() {
    return new Room(this.roomNumber, this.floor, null, null)
  }
}

class Guest {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

module.exports = { Room, Guest };