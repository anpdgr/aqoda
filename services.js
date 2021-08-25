const {
  HotelIsFullError,
  RoomIsAlreadyBookedError,
  RoomFloorIsAlreadyBookedError,
  GuestNotMatchKeycardNumberError,
  CheckoutAvailableRoomError,
  CheckoutAvailableRoomFloorError,
} = require("./error");
const { keycards, allRooms, bookedRooms } = require("./localdb");

class Room {
  constructor(roomNumber, floor, keycardNumber, guest, age) {
    this.roomNumber = roomNumber;
    this.floor = floor;
    this.keycardNumber = keycardNumber;
    this.guest = guest;
    this.age = age;
  }
}

function createKeycards(floor, roomPerFloor) {
  //set all possible keycard number DESC
  const numberOfKeycard = floor * roomPerFloor;

  for (let count = numberOfKeycard; count >= 1; count--) {
    keycards.push(count);
  }
}

function createRooms(floor, roomPerFloor) {
  //set all room num
  for (let floorCount = 1; floorCount <= floor; floorCount++) {
    for (let roomCount = 1; roomCount <= roomPerFloor; roomCount++) {
      if (roomCount.toString()[1] === undefined) {
        //f01-f09
        roomNumber = floorCount.toString() + "0" + roomCount.toString();
      } else {
        //f10-f99
        roomNumber = floorCount.toString() + roomCount.toString();
      }

      allRooms.push(Number(roomNumber));
    }
  }
}

function isHotelFullyBooked() {
  return listBookedRoomNumbers().length === allRooms.length;
}

function listBookedRoomNumbers() {
  bookedRoomNumbers = [];
  bookedRooms.forEach((room) => {
    bookedRoomNumbers.push(room.roomNumber);
  });
  return bookedRoomNumbers;
}

function isRoomAvailable(room) {
  return room === 0;
}

function generateKeycard() {
  return keycards.pop();
}

function bookRoom(roomNumber, keycardNumber, guest, age) {
  bookedRooms.push(
    new Room(
      roomNumber,
      Number(roomNumber.toString()[0]),
      keycardNumber,
      guest,
      age
    )
  );
}

function isRoomBookedByFloor(floor) {
  result = false;

  bookedRooms.forEach((room) => (room.floor === floor ? (result = true) : ""));

  return result;
}

function getRoomsOnFloor(floor) {
  //create array of all booked roomNum on that floor
  return listBookedRoomNumbers().filter(
    (roomNumber) => roomNumber.toString()[0] == floor
  );
}

function checkoutRoomByFloor(roomsOnFloor) {
  for (let roomCount = 0; roomCount < roomsOnFloor.length; roomCount++) {
    let room = findRoomByRoomNumber(roomsOnFloor[roomCount]);

    checkoutRoom(room);
  }
}

function checkoutRoom(room) {
  //delete that room by index
  bookedRooms.splice(bookedRooms.indexOf(room), 1);
  //push keycard back
  keycards.push(room.keycardNumber);
}

function findRoomNumbersByFloor(floor) {
  return listAvailableRooms().filter(
    (roomNumber) => roomNumber.toString()[0] == floor
  );
}

function findRoomByKeycardNumber(keycardNumber) {
  filteredRoom = 0;

  bookedRooms.forEach((room) => {
    if (room.keycardNumber === keycardNumber) filteredRoom = room;
  });

  return filteredRoom;
}

function hasRoomBookedWithThisKeycardNumber(room) {
  return room != 0;
}

function isGuestMatchKeycardNumber(room, guest) {
  return room.guest === guest;
}

function isRoomOnFloor(room, floor) {
  return room.floor === floor;
}

function isGuestPushed(guestsArray, room) {
  guestsArray.find((guest) => guest === room.guest);
}

function createHotel(floor, roomPerFloor) {
  const hotel = { floor, roomPerFloor };

  if (roomPerFloor > 99)
    throw new Error("Can not create hotel with 100 or more rooms per floor");

  createKeycards(floor, roomPerFloor);
  createRooms(floor, roomPerFloor);

  return hotel;
}

function book(roomNumber, guest, age) {
  if (isHotelFullyBooked()) {
    throw new HotelIsFullError();
  }

  const room = findRoomByRoomNumber(roomNumber);
  if (!isRoomAvailable(room)) {
    throw new RoomIsAlreadyBookedError(
      room.guest,
      room.age,
      roomNumber,
      room.keycardNumber
    );
  }

  //room is available -> book
  //book
  const keycardNumber = generateKeycard();
  bookRoom(roomNumber, keycardNumber, guest, age);
  return keycardNumber;
}

function findRoomByRoomNumber(roomNumber) {
  filteredRoom = 0;

  bookedRooms.forEach((room) => {
    if (room.roomNumber === roomNumber) filteredRoom = room;
  });

  return filteredRoom;
}

function bookByFloor(floor, guest, age) {
  if (isRoomBookedByFloor(floor)) {
    throw new RoomFloorIsAlreadyBookedError(floor, guest);
  }
  const roomNumbers = findRoomNumbersByFloor(floor);
  return roomNumbers.map((roomNumber) => {
    const keycardNumber = book(roomNumber, guest, age);
    return { keycardNumber, roomNumber };
  });
}

function checkoutGuestByFloor(floor) {
  if (!isRoomBookedByFloor(floor)) {
    throw new CheckoutAvailableRoomFloorError();
  }
  //there is some room on that floor was booked
  //checkout that room
  const roomsOnFloor = getRoomsOnFloor(floor);

  checkoutRoomByFloor(roomsOnFloor);

  return roomsOnFloor;
}

function listAvailableRooms() {
  return allRooms.filter((room) => !listBookedRoomNumbers().includes(room));
}

function checkout(keycardNumber, guest) {
  room = findRoomByKeycardNumber(keycardNumber);

  if (!hasRoomBookedWithThisKeycardNumber()) {
    throw new CheckoutAvailableRoomError();
  }
  //there is the room that booked with this keycard number
  if (!isGuestMatchKeycardNumber(room, guest)) {
    throw new GuestNotMatchKeycardNumberError();
  }
  //name match with keycardNumber
  //checkout
  checkoutRoom(room);
  return room;
}

function listGuests() {
  const allGuests = [];

  bookedRooms.forEach((room) => {
    if (!allGuests.find((guest) => guest === room.guest))
      allGuests.push(room.guest);
  });

  return allGuests;
}

function listGuestsByFloor(floor) {
  const guestsByFloor = [];

  bookedRooms.forEach((room) => {
    if (isRoomOnFloor(room, floor))
      if (!isGuestPushed(guestsByFloor, room)) guestsByFloor.push(room.guest);
  });

  return guestsByFloor;
}

function listGuestsByAge(operation, age) {
  const guestsByAge = [];

  bookedRooms.forEach((room) => {
    if (eval(room.age + operation + age)) {
      if (!isGuestPushed(guestsByAge, room)) guestsByAge.push(room.guest);
    }
  });

  return guestsByAge;
}

module.exports = {
  createHotel,
  book,
  findRoomByRoomNumber,
  bookByFloor,
  checkoutGuestByFloor,
  listAvailableRooms,
  checkout,
  listGuests,
  listGuestsByFloor,
  listGuestsByAge,
};
