const { Room, Guest } = require("./model");

function createRepositories(prismaClient) {

  async function createKeycards(floor, roomPerFloor) {
    //set all possible keycard number DESC
    const numberOfKeycard = floor * roomPerFloor;
    for (let count = 1; count <= numberOfKeycard; count++) {
      await prismaClient.keycards.createMany({ data: { number: count } });
    }
  }

  async function generateKeycard() {
    const result = await prismaClient.keycards.findFirst({
      orderBy: { number: "asc" },
    });
    await prismaClient.keycards.delete({ where: { number: result.number } });
    return result.number;
  }

  async function getRoomByKeycardNumber(keycardNumber) {
    const room = await prismaClient.rooms.findFirst({
      where: { keycard: keycardNumber },
    });
    return room
      ? new Room(
          room.number,
          room.floor,
          room.keycard,
          room.guestName && room.guestAge
            ? new Guest(room.guestName, room.guestAge)
            : null
        )
      : null;
  }

  async function getRoomByRoomNumber(roomNumber) {
    const room = await prismaClient.rooms.findFirst({
      where: { number: roomNumber },
    });
    return new Room(
      room.number,
      room.floor,
      room.keycard,
      room.guestName && room.guestAge
        ? new Guest(room.guestName, room.guestAge)
        : null
    );
  }

  async function listAvailableRooms() {
    const result = await prismaClient.rooms.findMany({
      where: { keycard: null, guestName: null, guestAge: null },
    });

    return result.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard,
          new Guest(row.guestName, row.guestAge)
        )
    );
  }

  async function createRooms(floor, roomPerFloor) {
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
        await prismaClient.rooms.create({
          data: { number: roomNumber, floor: floorCount },
        });
      }
    }
  }

  async function listBookedRoom() {
    const result = await prismaClient.rooms.findMany({
      orderBy: { keycard: "asc" },
      where: { NOT: { keycard: null, guestName: null, guestAge: null } },
    });

    return result.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard,
          new Guest(row.guestName, row.guestAge)
        )
    );
  }

  async function returnKeycard(room) {
    await prismaClient.keycards.create({
      data: { number: room.keycardNumber },
    });
  }

  async function listRooms() {
    const result = await prismaClient.rooms.findMany();

    return result.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard,
          new Guest(row.guestName, row.guestAge)
        )
    );
  }

  async function saveRoom(updatedRoom) {
    if (updatedRoom.guest === null) {
      await prismaClient.rooms.update({
        where: { number: updatedRoom.roomNumber },
        data: {
          keycard: updatedRoom.keycardNumber,
          guestName: null,
          guestAge: null,
        },
      });
    } else {
      await prismaClient.rooms.update({
        where: { number: updatedRoom.roomNumber },
        data: {
          keycard: updatedRoom.keycardNumber,
          guestName: updatedRoom.guest.name,
          guestAge: updatedRoom.guest.age,
        },
      });
    }
  }

  return {
    createKeycards,
    generateKeycard,
    getRoomByRoomNumber,
    listAvailableRooms,
    createRooms,
    listBookedRoom,
    getRoomByKeycardNumber,
    returnKeycard,
    listRooms,
    saveRoom,
  };
}

module.exports = createRepositories;
