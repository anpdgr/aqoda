const {
  HotelIsFullError,
  RoomIsAlreadyBookedError,
  RoomFloorIsAlreadyBookedError,
  CheckoutAvailableRoomFloorError,
} = require("./error");

const {
  createKeycards,
  generateKeycard,
  checkout,
  getRoomByRoomNumber,
  listAvailableRooms,
  createRooms,
  isHotelFullyBooked,
  listBookedRoom,
} = require("./repositories");


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

function listRoomNumbersByFloor(floor) {
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
  room.book(guest, keycardNumber);
  return keycardNumber;
}

function bookByFloor(floor, guest, age) {
  if (hasBookedRoomOnFloor(floor)) {
    throw new RoomFloorIsAlreadyBookedError(floor, guest);
  }
  const roomsOnFloor = listRoomNumbersByFloor(floor);

  for (let roomCount = 0; roomCount < roomsOnFloor.length; roomCount++) {
    book(roomsOnFloor[roomCount].roomNumber, roomsOnFloor[roomCount].guest);
  }

  return roomsOnFloor;
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
  // checkout,
  listGuests,
  listGuestsNameByFloor,
  listGuestsNameByAge,
  // getRoomByKeycardNumber
};
