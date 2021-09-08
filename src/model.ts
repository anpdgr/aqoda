export class Room {
  constructor(public roomNumber: string, public floor: number, public keycardNumber?: number, public guest?: Guest) {}

  book(guest: Guest, keycardNumber: number): Room {
    return new Room(this.roomNumber, this.floor, keycardNumber, guest)
  }

  get isAvailable(): boolean {
    return !this.guest && !this.keycardNumber;
  }

  checkout(): Room {
    return new Room(this.roomNumber, this.floor)
  }
}

export class Guest {
  constructor(public name: string, public age: number) {}
}

