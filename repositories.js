const { keycards, allRooms } = require("./localdb");
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

function getRoomByKeycardNumber(keycardNumber) {
  return allRooms.find((room) => room.keycardNumber === keycardNumber);
}

function getRoomByRoomNumber(roomNumber) {
  return allRooms.find((room) => room.roomNumber === roomNumber);
}

function listAvailableRooms() {
  const roomsByRoomNumber = listBookedRoom().reduce((initial, room) => initial.set(room.roomNumber, true), new Map())
  
  return allRooms.filter(
  (room) => !roomsByRoomNumber.has(room.roomNumber)
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

function listBookedRoom() {
  return allRooms.filter((room) => !room.isAvailable);
}

function returnKeycard(room) {
  keycards.push(room.keycardNumber)
}

function listRooms() {
  return allRooms;
}

function saveRoom(updatedRoom) {
  const index = allRooms.findIndex(room => room.roomNumber === updatedRoom.roomNumber);
  allRooms[index] = updatedRoom;
}

module.exports = { createKeycards, generateKeycard, getRoomByRoomNumber, listAvailableRooms, createRooms, listBookedRoom, getRoomByKeycardNumber, returnKeycard, listRooms, saveRoom }
