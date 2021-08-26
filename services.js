const {
  HotelIsFullError,
  RoomIsAlreadyBookedError,
  RoomFloorIsAlreadyBookedError,
  GuestNotMatchKeycardNumberError,
  CheckoutAvailableRoomError,
  CheckoutAvailableRoomFloorError,
} = require("./error");
const { keycards, allRooms } = require("./localdb");
const { Room } = require("./model");

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

      allRooms.push(new Room(roomNumber, floorCount));
    }
  }
}

function isHotelFullyBooked() {
  return listBookedRoomNumbers().length === allRooms.length;
}

function listBookedRoom() {
  return allRooms.filter((room) => !room.isAvailable);
}

function listBookedRoomNumbers() {
  bookedRoomNumbers = [];
  listBookedRoom().forEach((room) => {
    bookedRoomNumbers.push(room.roomNumber);
  });
  return bookedRoomNumbers;
}

function generateKeycard() {
  return keycards.pop();
}

function isRoomBookedByFloor(floor) {
  result = false;

  listBookedRoom().forEach((room) =>
    room.floor === floor ? (result = true) : ""
  );

  return result;
}

function listRoomsOnFloor(floor) {
  //create array of all booked roomNum on that floor
  return listBookedRoom().filter((room) => room.floor == floor);
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
  return listAvailableRooms().filter((room) => room.floor == floor);
}

function getRoomByKeycardNumber(keycardNumber) {
  return allRooms.find((room) => {
    return room.keycardNumber === keycardNumber;
  });
}

function isRoomOnFloor(room, floor) {
  return room.floor === floor;
}

function isGuestPushed(guestsArray, room) {
  return guestsArray.find((guestName) => guestName === room.guest.name);
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

function getRoomByRoomNumber(roomNumber) {
  return allRooms.find((room) => {
    return room.roomNumber === roomNumber;
  });
}

function bookByFloor(floor, guest, age) {
  if (isRoomBookedByFloor(floor)) {
    throw new RoomFloorIsAlreadyBookedError(floor, guest);
  }
  const roomsOnFloor = listRoomNumbersByFloor(floor);

  for (let roomCount = 0; roomCount < roomsOnFloor.length; roomCount++) {
    book(roomsOnFloor[roomCount].roomNumber, roomsOnFloor[roomCount].guest);
  }

  return roomsOnFloor;
}

function checkoutGuestByFloor(floor) {
  if (!isRoomBookedByFloor(floor)) {
    throw new CheckoutAvailableRoomFloorError();
  }
  //there is some room on that floor was booked
  //checkout that room
  const roomsOnFloor = listRoomsOnFloor(floor);

  checkoutRoomByFloor(roomsOnFloor);

  return roomsOnFloor;
}

function listAvailableRooms() {
  return allRooms.filter(
    (room) => !listBookedRoomNumbers().includes(room.roomNumber)
  );
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
  keycards.push(room.keycardNumber);
  room.checkout();
  return room;
}

function listGuests() {
  return allRooms
    .filter((room) => {
      return !room.isAvailable;
    })
    .map((room) => room.guest);
}

function listGuestsByFloor(floor) {
  const guestsByFloor = [];

  listBookedRoom().forEach((room) => {
    if (isRoomOnFloor(room, floor))
      if (!isGuestPushed(guestsByFloor, room))
        guestsByFloor.push(room.guest.name);
  });

  return guestsByFloor;
}

function listGuestsByAge(operation, age) {
  const guestsByAge = [];

  listBookedRoom().forEach((room) => {
    if (eval(room.guest.age + operation + age)) {
      if (!isGuestPushed(guestsByAge, room)) guestsByAge.push(room.guest);
    }
  });

  return guestsByAge;
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
  listGuestsByFloor,
  listGuestsByAge,
};
