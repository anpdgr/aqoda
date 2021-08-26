const { keycards, allRooms } = require("./localdb");
const {
  GuestNotMatchKeycardNumberError,
  CheckoutAvailableRoomError,
} = require("./error");
const { Room } = require("./model");

function createKeycards(floor, roomPerFloor) {
  //set all possible keycard number DESC
  const numberOfKeycard = floor * roomPerFloor;

  for (let count = numberOfKeycard; count >= 1; count--) {
    keycards.push(count);
  }
}

function generateKeycard() {
  return keycards.pop();
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

function getRoomByKeycardNumber(keycardNumber) {
  return allRooms.find((room) => room.keycardNumber === keycardNumber);
}

function getRoomByRoomNumber(roomNumber) {
  return allRooms.find((room) => room.roomNumber === roomNumber);
}

function listAvailableRooms() {
  return allRooms.filter(
    (room) => !listBookedRoomNumbers().includes(room.roomNumber)
  );
}

function createRooms(floor, roomPerFloor) {
  //set all room num
  for (let floorCount = 1; floorCount <= floor; floorCount++) {
    for (let roomCount = 1; roomCount <= roomPerFloor; roomCount++) {
      if (!roomCount.toString()[1]) {
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
  return listBookedRoom().map((room) => room.roomNumber);
}

module.exports = { createKeycards, generateKeycard, checkout, getRoomByRoomNumber, listAvailableRooms, createRooms, isHotelFullyBooked, listBookedRoom }