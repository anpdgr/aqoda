const {
  HotelIsFullError,
  RoomIsAlreadyBookedError,
  RoomFloorIsAlreadyBookedError,
  CheckoutAvailableRoomFloorError,
  GuestNotMatchKeycardNumberError,
  CheckoutAvailableRoomError,
} = require("./error");

const {
  createKeycards,
  generateKeycard,
  getRoomByRoomNumber,
  listAvailableRooms,
  createRooms,
  listBookedRoom,
  getRoomByKeycardNumber,
  returnKeycard,
  listRooms,
  saveRoom
} = require("./repositories");

function isHotelFullyBooked() {
  return listBookedRoom().length === listRooms().length;
}

function hasBookedRoomOnFloor(floor) {
  return listBookedRoomsByFloor(floor).length > 0;
}

function listBookedRoomsByFloor(floor) {
  //create array of all booked roomNum on that floor
  return listBookedRoom().filter((room) => room.floor === floor);
}

function checkoutRoomByFloor(roomsOnFloor) {
  for (let roomCount = 0; roomCount < roomsOnFloor.length; roomCount++) {
    checkout(
      roomsOnFloor[roomCount].keycardNumber,
      roomsOnFloor[roomCount].guest.name
    );
  }
}

function listRoomsByFloor(floor) {
  return listAvailableRooms().filter((room) => room.floor === floor);
}

function createHotel(floor, roomPerFloor) {
  const hotel = { floor, roomPerFloor };

  if (roomPerFloor > 99)
    throw new Error("Can not create hotel with 100 or more rooms per floor");

  createKeycards(floor, roomPerFloor);
  createRooms(floor, roomPerFloor);

  return hotel;
}

function book(roomNumber, guest) {
  if (isHotelFullyBooked()) {
    throw new HotelIsFullError();
  }

  const room = getRoomByRoomNumber(roomNumber);
  if (!room.isAvailable) {
    throw new RoomIsAlreadyBookedError(room);
  }

  const keycardNumber = generateKeycard();
  const updatedBook = room.book(guest, keycardNumber);
  saveRoom(updatedBook)
  return keycardNumber;
}

function bookByFloor(floor, guest) {
  if (hasBookedRoomOnFloor(floor)) {
    throw new RoomFloorIsAlreadyBookedError(floor, guest.name);
  }
  const roomsOnFloor = listRoomsByFloor(floor);

  for (let roomCount = 0; roomCount < roomsOnFloor.length; roomCount++) {
    book(roomsOnFloor[roomCount].roomNumber, guest);
  }
  return listBookedRoomsByFloor(floor);
}

function checkout(keycardNumber, name) {
  const room = getRoomByKeycardNumber(keycardNumber);

  if (!room) {
    throw new CheckoutAvailableRoomError();
  }
  //there is the room that booked with this keycard number
  if (room.guest.name != name) {
    throw new GuestNotMatchKeycardNumberError(room);
  }
  //name match with keycardNumber
  //checkout
  returnKeycard(room);
  const updatedBook = room.checkout();
  saveRoom(updatedBook)
  return room;
}

function checkoutGuestByFloor(floor) {
  if (!hasBookedRoomOnFloor(floor)) {
    throw new CheckoutAvailableRoomFloorError();
  }
  //there is some room on that floor was booked
  //checkout that room
  const roomsOnFloor = listBookedRoomsByFloor(floor);

  checkoutRoomByFloor(roomsOnFloor);

  return roomsOnFloor;
}

function listGuests() {
  return listBookedRoom().map((room) => room.guest);
}

function listGuestsNameByFloor(floor) {
  return Array.from(
    new Set(listBookedRoomsByFloor(floor).map((room) => room.guest.name))
  );
}

function listGuestsNameByAge(operation, age) {
  return Array.from(
    new Set(
      listGuests()
        .filter((guest) => eval(guest.age + operation + age))
        .map((guest) => guest.name)
    )
  );
}

module.exports = {
  createHotel,
  book,
  getRoomByRoomNumber,
  bookByFloor,
  checkoutGuestByFloor,
  listAvailableRooms,
  checkout,
  listGuests,
  listGuestsNameByFloor,
  listGuestsNameByAge,
  // getRoomByKeycardNumber
};