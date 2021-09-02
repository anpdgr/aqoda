const { keycards, allRooms } = require("./localdb");
const { Room, Guest } = require("./model");
const postgresClient = require("./postgres-client");
const firestoreClient = require("./firestore-client");

async function createKeycards(floor, roomPerFloor) {
  const numberOfKeycard = floor * roomPerFloor;
  const batch = firestoreClient.batch()
  for (let count = 1; count <= numberOfKeycard; count++) {
    const ref = firestoreClient.collection('keycards').doc(count.toString());
    const data = {number: count};
    batch.create(ref, data);
  }
  await batch.commit()
}

async function generateKeycard() {
  const querySnapshot = await firestoreClient.collection('keycards').orderBy('number', 'asc').limit(1).get();
  const snapshot = querySnapshot.docs[0];
  const ref = snapshot.ref();
  const data = snapshot.data();
  const number = data.number
  await ref.delete()
  return number;
}

async function getRoomByKeycardNumber(keycardNumber) {
  const querySnapshot = await firestoreClient.collection('rooms').where('keycard', '==', keycardNumber).get();
  return querySnapshot.docs.map((snapshot) => {
    const data = snapshot.data()
    return new Room(
      data.number,
      data.floor,
      data.keycard,
      data.guestName && data.guestAge ? new Guest(data.guestName, data.guestAge) : null
    )
  })[0];
}

async function getRoomByRoomNumber(roomNumber) {
  const ref = firestoreClient.collection('rooms').doc(roomNumber);
  const snapshot = await ref.get();
  const data = snapshot.data();
  
    
  return new Room(
        data.number,
        data.floor,
        data.keycard,
        data.guestName && data.guestAge ? new Guest(data.guestName, data.guestAge) : null
      )
  // return allRooms.find((room) => room.roomNumber === roomNumber);
}

async function listAvailableRooms() {
  // const roomsByRoomNumber = (await listBookedRoom()).reduce(
  //   (initial, room) => initial.set(room.roomNumber, true),
  //   new Map()
  // );

  // return allRooms.filter((room) => !roomsByRoomNumber.has(room.roomNumber));
  sql = 'SELECT * FROM "rooms" WHERE "keycard" IS NULL AND "guestName" IS NULL AND "guestAge" IS NULL;'
  const result = await postgresClient.query(sql);
  // console.log(result.rows);
  return result.rows.map(
    (row) =>
      new Room(
        row.number,
        row.floor,
        row.keycard,
        row.guestName && row.guestAge ? new Guest(row.guestName, row.guestAge) : null
      )
  );
}

async function createRooms(floor, roomPerFloor) {
  //set all room num
  let sql = 'INSERT INTO "public"."rooms" ("number", "floor") VALUES';
  let counter1 = 1;
  const value = [];
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

  allRooms.forEach((room, index) => {
    sql += `($${counter1}, $${counter1 + 1})`;
    if (index === allRooms.length - 1) {
      sql += ";";
    } else {
      sql += ",";
    }
    counter1 = counter1 + 2;
    /*
      INSERT INTO "public"."rooms" ("number", "floor") VALUES ($1, $2), ($3, $4), ($5, $6);
      */
    value.push(room.roomNumber, room.floor);
  });
  await postgresClient.query(sql, value);
}

async function listBookedRoom() {
  let sql =
    'SELECT * FROM "public"."rooms" WHERE "keycard" IS NOT NULL AND "guestName" IS NOT NULL AND "guestAge" IS NOT NULL ORDER BY "keycard" ASC;';
  const result = await postgresClient.query(sql);
  return result.rows.map(
    (row) =>
      new Room(
        row.number,
        row.floor,
        row.keycard,
        new Guest(row.guestName, row.guestAge)
      )
  );
  // console.log(result.rows);
  // return allRooms.filter((room) => !room.isAvailable);
}

async function returnKeycard(room) {
  const sql = 'INSERT INTO "keycards"("number") VALUES ($1)'
  await postgresClient.query(sql, [room.keycardNumber]);
  // keycards.push(room.keycardNumber);
}

async function listRooms() {
  let sql =
    'SELECT * FROM "public"."rooms";';
  const result = await postgresClient.query(sql);
  return result.rows.map(
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
  const ref = firestoreClient.collection('rooms').doc(updatedRoom.roomNumber)
  await ref.update({keycard: updatedRoom.keycardNumber, guestName: updatedRoom.guest.name, guestAge: updatedRoom.guest.age})
}

module.exports = {
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
